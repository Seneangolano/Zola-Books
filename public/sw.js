// Service Worker for Zola Books 🇦🇴
// High-performance Cache API & Workbox engine for 3G network optimization and offline resilience

const BOOKS_CACHE = 'zola-ebooks-cache-v2';
const IMAGES_CACHE = 'zola-images-cache-v2';
const STATIC_CACHE = 'zola-static-v2';
const APP_SHELL_CACHE = 'zola-appshell-v2';

// 1. Install Event: Precache Critical Assets
self.addEventListener('install', (event) => {
  console.log('⚡ [Zola Books SW] Instalando Service Worker v2...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]).catch((err) => {
        console.warn('⚠️ [Zola Books SW] Aviso no precache inicial do appshell:', err);
      });
    })
  );
});

// 2. Activate Event: Clean obsolete caches & take immediate control
self.addEventListener('activate', (event) => {
  console.log('🚀 [Zola Books SW] Service Worker ativado e controlando clientes.');
  const allowedCaches = [BOOKS_CACHE, IMAGES_CACHE, STATIC_CACHE, APP_SHELL_CACHE, 'zola-navigation-v2'];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!allowedCaches.includes(key)) {
            console.log(`🧹 [Zola Books SW] A remover cache obsoleto: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Generates a clean lightweight SVG placeholder when an image fails to load over unstable 3G / offline
function createFallbackImageResponse() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" fill="none">
    <rect width="400" height="600" fill="#0f172a"/>
    <rect x="20" y="20" width="360" height="560" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <circle cx="200" cy="240" r="50" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="2"/>
    <path d="M185 225H215M200 210V270M175 250H225" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <text x="200" y="330" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Zola Books 🇦🇴</text>
    <text x="200" y="360" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">Capa guardada localmente</text>
  </svg>`;
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store'
    }
  });
}

// 3. Fetch Interceptor: Custom High-Performance Cache-First strategy for images & e-books
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests and browser extensions
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // A. E-Book Offline API endpoint (/api/offline-book/*)
  if (url.pathname.startsWith('/api/offline-book/')) {
    event.respondWith(
      caches.open(BOOKS_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const networkResp = await fetch(request);
          if (networkResp.ok) {
            cache.put(request, networkResp.clone());
          }
          return networkResp;
        } catch (err) {
          return new Response(JSON.stringify({ error: 'Livro não disponível offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
    );
    return;
  }

  // B. Image Requests (Book Covers, Author Avatars, Unsplash, Cloudinary, Local WebP/PNG)
  const isImageRequest = 
    request.destination === 'image' ||
    url.pathname.includes('/covers/') ||
    url.pathname.includes('/avatars/') ||
    url.pathname.includes('/ebooks/') ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('images.unsplash.com') ||
    /\.(png|jpg|jpeg|webp|svg|gif|ico|avif)(\?.*)?$/i.test(url.pathname);

  if (isImageRequest) {
    event.respondWith(
      caches.open(IMAGES_CACHE).then(async (cache) => {
        // 1. Check if image exists in Cache API (instant load for 3G!)
        const cachedResponse = await cache.match(request, { ignoreSearch: false });
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. If not cached, fetch over network with 3G timeout protection
        try {
          const fetchPromise = fetch(request.url, {
            mode: request.mode === 'navigate' ? 'navigate' : 'cors',
            credentials: 'omit'
          });

          // Abort/fallback if network hangs on ultra-slow connection
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Image fetch timeout on slow 3G')), 12000)
          );

          const response = await Promise.race([fetchPromise, timeoutPromise]);

          if (response && (response.status === 200 || response.type === 'opaque')) {
            // Asynchronously store in cache for all subsequent loads
            cache.put(request, response.clone()).catch((cacheErr) => {
              console.warn('[Zola SW] Não foi possível guardar imagem no cache:', cacheErr);
            });
            return response;
          }
          return response;
        } catch (fetchErr) {
          // If offline or network dropped on 3G, try matching ignoring query params or fallback
          const fallbackMatch = await cache.match(url.pathname, { ignoreSearch: true });
          if (fallbackMatch) return fallbackMatch;

          // Return elegant SVG placeholder instead of broken image
          return createFallbackImageResponse();
        }
      })
    );
    return;
  }

  // C. HTML Navigation Requests (Network First, fallback to cached App Shell / Offline page)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedIndex = await caches.match('/index.html');
        if (cachedIndex) return cachedIndex;

        return new Response(
          `<!DOCTYPE html>
          <html lang="pt">
          <head>
            <meta charset="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Zola Books — Modo Offline</title>
            <style>
              body { background: #020617; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; text-align: center; }
              .card { background: #0f172a; border: 1px solid #1e293b; padding: 2rem; border-radius: 1.5rem; max-width: 420px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
              h1 { color: #fbbf24; font-size: 1.25rem; margin-bottom: 0.5rem; }
              p { color: #94a3b8; font-size: 0.875rem; line-height: 1.5; }
              button { background: #f59e0b; color: #020617; border: none; font-weight: 800; padding: 0.75rem 1.5rem; border-radius: 0.75rem; cursor: pointer; margin-top: 1.25rem; font-size: 0.9rem; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>📖 Zola Books Angola — Modo Offline</h1>
              <p>Estás sem ligação à internet ou numa rede 3G instável. Os teus e-books descarregados e capas em cache continuam prontos para leitura.</p>
              <button onclick="window.location.reload()">Recarregar Biblioteca</button>
            </div>
          </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }

  // D. Static Assets (Scripts, Styles, Fonts) - Stale-While-Revalidate
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((networkResp) => {
          if (networkResp.status === 200) {
            cache.put(request, networkResp.clone());
          }
          return networkResp;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }
});

// 4. Client Message Handlers (Batch Image Prefetching, Cache Stats, Offline Book Management)
self.addEventListener('message', async (event) => {
  if (!event.data || typeof event.data !== 'object') return;

  const { type, urls, bookId, bookData, coverUrl } = event.data;

  // A. Batch Prefetch Book Covers and Author Images for 3G acceleration
  if (type === 'PREFETCH_IMAGES_LIST') {
    if (!Array.isArray(urls) || urls.length === 0) return;
    console.log(`🖼️ [Zola Books SW] A pré-carregar ${urls.length} capas e fotos de autor no Cache API...`);
    
    try {
      const cache = await caches.open(IMAGES_CACHE);
      let successCount = 0;

      // Process in batches of 4 concurrent requests to not clog 3G connection
      const batchSize = 4;
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (imgUrl) => {
            if (!imgUrl || typeof imgUrl !== 'string') return;
            try {
              const req = new Request(imgUrl, { mode: 'cors', credentials: 'omit' });
              const existing = await cache.match(req);
              if (!existing) {
                const response = await fetch(req);
                if (response.ok || response.type === 'opaque') {
                  await cache.put(req, response);
                  successCount++;
                }
              } else {
                successCount++;
              }
            } catch (imgErr) {
              // Silently ignore individual image prefetch failures
            }
          })
        );
      }

      console.log(`✅ [Zola Books SW] Pré-carregamento concluído: ${successCount}/${urls.length} imagens no cache local.`);
      
      // Notify client windows of completion
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => {
        client.postMessage({
          type: 'PREFETCH_IMAGES_SUCCESS',
          total: urls.length,
          cached: successCount
        });
      });
    } catch (err) {
      console.error('❌ [Zola Books SW] Erro ao pré-carregar imagens no Cache API:', err);
    }
  }

  // B. Cache Single E-Book with Metadata and Cover
  if (type === 'CACHE_EBOOK') {
    console.log(`📚 [Zola Books SW] A guardar e-book #${bookId} ("${bookData?.title}") no armazenamento offline`);
    try {
      const bookCache = await caches.open(BOOKS_CACHE);
      const jsonResponse = new Response(JSON.stringify(bookData), {
        headers: { 'Content-Type': 'application/json' }
      });
      await bookCache.put(`/api/offline-book/${bookId}`, jsonResponse);

      // Also ensure cover is cached in IMAGES_CACHE
      if (coverUrl) {
        try {
          const imgCache = await caches.open(IMAGES_CACHE);
          const coverReq = new Request(coverUrl, { mode: 'cors', credentials: 'omit' });
          const coverResp = await fetch(coverReq);
          if (coverResp.ok || coverResp.type === 'opaque') {
            await imgCache.put(coverReq, coverResp);
          }
        } catch (coverErr) {
          console.warn('[Zola Books SW] Aviso no cache da capa:', coverErr);
        }
      }

      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => {
        client.postMessage({
          type: 'EBOOK_CACHED_SUCCESS',
          bookId,
          title: bookData?.title
        });
      });
    } catch (err) {
      console.error('[Zola Books SW] Erro ao guardar e-book offline:', err);
    }
  }

  // C. Delete Single E-Book from Cache
  if (type === 'DELETE_CACHED_EBOOK') {
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
      console.error('[Zola Books SW] Erro ao remover e-book do cache:', err);
    }
  }

  // D. Purge / Clear Images Cache
  if (type === 'PURGE_IMAGE_CACHE') {
    try {
      await caches.delete(IMAGES_CACHE);
      console.log('🧹 [Zola Books SW] Cache de imagens limpo com sucesso.');
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => {
        client.postMessage({ type: 'IMAGE_CACHE_PURGED_SUCCESS' });
      });
    } catch (err) {
      console.error('[Zola Books SW] Erro ao limpar cache de imagens:', err);
    }
  }

  // E. Clear All E-books & Cache
  if (type === 'CLEAR_ALL_EBOOKS') {
    try {
      await caches.delete(BOOKS_CACHE);
      await caches.delete(IMAGES_CACHE);
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => {
        client.postMessage({ type: 'EBOOKS_CLEARED_SUCCESS' });
      });
    } catch (err) {
      console.error('[Zola Books SW] Erro ao limpar biblioteca offline:', err);
    }
  }
});

// 5. Push Notification Event Listener (Alerts for new literary releases even when app is closed)
self.addEventListener('push', (event) => {
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

// 6. Notification Click Event Listener
self.addEventListener('notificationclick', (event) => {
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

