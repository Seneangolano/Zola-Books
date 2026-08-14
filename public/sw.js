importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const BOOKS_CACHE = 'zola-ebooks-cache-v2';
const IMAGES_CACHE = 'zola-images-cache-v2';
const STATIC_CACHE = 'zola-static-v2';

if (self.workbox) {
  console.log('✅ [Workbox SW] Workbox carregado com sucesso no Zola Books!');

  // Force skip waiting and claim clients immediately
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // Set custom cache name prefix
  workbox.core.setCacheNameDetails({
    prefix: 'zola-books',
    suffix: 'v2',
    precache: 'appshell',
    runtime: 'runtime'
  });

  // Precache App Shell critical files
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '2.1.0' },
    { url: '/index.html', revision: '2.1.0' },
    { url: '/manifest.json', revision: '2.1.0' }
  ]);

  // 1. Offline E-Book API route caching (CacheFirst strategy for downloaded e-books)
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/offline-book/'),
    new workbox.strategies.CacheFirst({
      cacheName: BOOKS_CACHE,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 150,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year persistence for offline library
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    })
  );

  // 2. Book Covers, User Avatars, and Unsplash/Cloudinary Images (CacheFirst with 30-day expiry)
  workbox.routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'image' ||
      url.pathname.includes('/covers/') ||
      url.pathname.includes('/ebooks/') ||
      url.hostname.includes('unsplash.com') ||
      url.hostname.includes('cloudinary.com') ||
      /\.(png|jpg|jpeg|webp|svg|gif|ico)(\?.*)?$/i.test(url.pathname),
    new workbox.strategies.CacheFirst({
      cacheName: IMAGES_CACHE,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 250,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200]
        })
      ]
    })
  );

  // 3. Navigation / SPA HTML Route (NetworkFirst, fallback to precached /index.html)
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'zola-navigation-v2',
      networkTimeoutSeconds: 3,
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [200]
        })
      ]
    })
  );

  // 4. Static Resources: JavaScript, CSS, Web Fonts (StaleWhileRevalidate)
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'font',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: STATIC_CACHE
    })
  );

  // Offline Fallback Handler for navigation when network is unavailable
  workbox.routing.setCatchHandler(async ({ request }) => {
    if (request.mode === 'navigate') {
      const cachedIndex = await caches.match('/index.html');
      if (cachedIndex) {
        return cachedIndex;
      }
      return new Response(
        `<!DOCTYPE html>
        <html lang="pt">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Zola Books — Leitura Offline</title>
          <style>
            body { background: #020617; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; text-align: center; }
            .card { background: #0f172a; border: 1px solid #1e293b; padding: 2rem; border-radius: 1.5rem; max-width: 400px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
            h1 { color: #fbbf24; font-size: 1.25rem; margin-bottom: 0.5rem; }
            p { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; }
            button { background: #f59e0b; color: #020617; border: none; font-weight: 800; padding: 0.75rem 1.5rem; border-radius: 0.75rem; cursor: pointer; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>📖 Zola Books — Modo Offline</h1>
            <p>Estás sem ligação à internet. Podes continuar a ler os teus e-books descarregados na tua biblioteca digital.</p>
            <button onclick="window.location.reload()">Tentar Novamente</button>
          </div>
        </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    return Response.error();
  });

} else {
  console.warn('⚠️ [Workbox SW] Workbox não pôde ser carregado via CDN. Modo Service Worker básico ativo.');
}

// Client message handler for custom offline e-book download & management events
self.addEventListener('message', async (event) => {
  if (!event.data || typeof event.data !== 'object') return;

  const { type, bookId, bookData, coverUrl } = event.data;

  if (type === 'CACHE_EBOOK') {
    console.log(`[Workbox SW] A guardar e-book #${bookId} ("${bookData?.title}") no armazenamento offline Workbox`);
    try {
      const cache = await caches.open(BOOKS_CACHE);

      // Store e-book JSON representation for offline reading
      const jsonResponse = new Response(JSON.stringify(bookData), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(`/api/offline-book/${bookId}`, jsonResponse);

      // Cache cover image if URL provided
      if (coverUrl) {
        try {
          const imgCache = await caches.open(IMAGES_CACHE);
          const coverReq = new Request(coverUrl, { mode: 'cors' });
          const coverResp = await fetch(coverReq);
          if (coverResp.ok) {
            await imgCache.put(coverReq, coverResp);
          }
        } catch (coverErr) {
          console.warn('[Workbox SW] Aviso no cache da capa:', coverErr);
        }
      }

      // Broadcast success back to window clients
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => {
        client.postMessage({
          type: 'EBOOK_CACHED_SUCCESS',
          bookId,
          title: bookData?.title
        });
      });
    } catch (err) {
      console.error('[Workbox SW] Erro ao guardar e-book offline:', err);
    }
  }

  if (type === 'DELETE_CACHED_EBOOK') {
    console.log(`[Workbox SW] A remover e-book #${bookId} da biblioteca offline Workbox`);
    try {
      const cache = await caches.open(BOOKS_CACHE);
      await cache.delete(`/api/offline-book/${bookId}`);

      if (coverUrl) {
        const imgCache = await caches.open(IMAGES_CACHE);
        await imgCache.delete(coverUrl);
      }

      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => {
        client.postMessage({
          type: 'EBOOK_DELETED_SUCCESS',
          bookId
        });
      });
    } catch (err) {
      console.error('[Workbox SW] Erro ao remover e-book do cache:', err);
    }
  }

  if (type === 'CLEAR_ALL_EBOOKS') {
    console.log('[Workbox SW] A limpar todos os e-books offline armazenados');
    try {
      await caches.delete(BOOKS_CACHE);
      await caches.delete(IMAGES_CACHE);
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => {
        client.postMessage({ type: 'EBOOKS_CLEARED_SUCCESS' });
      });
    } catch (err) {
      console.error('[Workbox SW] Erro ao limpar biblioteca offline:', err);
    }
  }
});

// 5. Push Notification Event Listener (Alerts for new literary releases even when app is closed)
self.addEventListener('push', (event) => {
  console.log('🔔 [SW Push] Mensagem push recebida no Service Worker Zola Books!');
  
  let data = {
    title: '📚 Zola Books 🇦🇴 — Novo Lançamento Literário!',
    body: 'Um novo e-book de autor angolano acabou de ser publicado na plataforma. Abre para ler a amostra grátis!',
    icon: '/manifest-icon-192.png',
    badge: '/manifest-icon-192.png',
    url: '/'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      if (typeof event.data.text === 'function') {
        data.body = event.data.text() || data.body;
      }
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/manifest-icon-192.png',
    badge: data.badge || '/manifest-icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      bookId: data.bookId
    },
    actions: [
      { action: 'open', title: '📖 Ler Agora' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 6. Notification Click Event Listener (Opens Zola Books app when notification is tapped)
self.addEventListener('notificationclick', (event) => {
  console.log('👉 [SW Push] Notificação clicada pelo utilizador:', event.notification.title);
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url && client.url.includes(self.location.host)) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
