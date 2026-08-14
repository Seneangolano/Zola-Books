import { Book } from '../types';

const OFFLINE_BOOKS_STORAGE_KEY = 'zola_offline_cached_books_v2';
const BOOKS_CACHE_NAME = 'zola-ebooks-cache-v2';

export interface OfflineBookMeta {
  bookId: string;
  title: string;
  author: string;
  coverImage: string;
  cachedAt: string;
  sizeKb: number;
}

export interface OfflineStorageStats {
  bookCount: number;
  totalSizeMb: number;
}

/**
 * Register Service Worker for offline app caching and e-book reading
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[SW Manager] Service Workers não suportados neste navegador.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[SW Manager] Service Worker registado com sucesso:', registration.scope);

    // Force update check if controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW Manager] Novo Service Worker ativado e a controlar a página.');
    });

    // Check for updates
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('[SW Manager] Novo conteúdo/SW disponível para Leitura Offline.');
            } else {
              console.log('[SW Manager] Aplicação pronta para Leitura Offline!');
            }
          }
        };
      }
    };

    return registration;
  } catch (error) {
    console.warn('[SW Manager] Falha no registo do Service Worker:', error);
    return null;
  }
}

/**
 * Get list of offline cached books from localStorage
 */
export function getOfflineCachedBooks(): Book[] {
  try {
    const raw = localStorage.getItem(OFFLINE_BOOKS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('[SW Manager] Erro ao carregar livros offline:', e);
    return [];
  }
}

/**
 * Check if a specific book is cached for offline reading
 */
export function isBookOfflineCached(bookId: string): boolean {
  if (!bookId) return false;
  const books = getOfflineCachedBooks();
  return books.some(b => b.id === bookId);
}

/**
 * Alias helper
 */
export function isBookCachedOffline(bookId: string): boolean {
  return isBookOfflineCached(bookId);
}

/**
 * Cache an entire e-book (chapters, full content, cover) in SW Cache API + LocalStorage
 */
export async function cacheBookForOffline(book: Book): Promise<boolean> {
  if (!book || !book.id) return false;

  try {
    const offlineBooks = getOfflineCachedBooks();
    
    // Add or update book in array
    const existingIdx = offlineBooks.findIndex(b => b.id === book.id);
    if (existingIdx >= 0) {
      offlineBooks[existingIdx] = book;
    } else {
      offlineBooks.push(book);
    }

    localStorage.setItem(OFFLINE_BOOKS_STORAGE_KEY, JSON.stringify(offlineBooks));

    // Send message to active Service Worker controller to cache assets in Cache API
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_EBOOK',
        bookId: book.id,
        bookData: book,
        coverUrl: book.coverImage
      });
    }

    // Direct Cache API write for reliability across browser environments
    if ('caches' in window) {
      try {
        const cache = await caches.open(BOOKS_CACHE_NAME);
        const jsonResp = new Response(JSON.stringify(book), {
          headers: { 'Content-Type': 'application/json' }
        });
        await cache.put(`/api/offline-book/${book.id}`, jsonResp);

        if (book.coverImage) {
          try {
            const coverReq = new Request(book.coverImage, { mode: 'cors' });
            const coverResp = await fetch(coverReq);
            if (coverResp.ok) {
              await cache.put(coverReq, coverResp);
            }
          } catch (imgErr) {
            console.warn('[SW Manager] Não foi possível fazer pre-fetch da capa:', imgErr);
          }
        }
      } catch (e) {
        console.warn('[SW Manager] Erro secundário no Cache API:', e);
      }
    }

    console.log(`[SW Manager] Livro "${book.title}" guardado com sucesso para leitura sem internet.`);
    return true;
  } catch (error) {
    console.error('[SW Manager] Erro ao guardar livro para offline:', error);
    return false;
  }
}

/**
 * Remove a cached book from offline storage
 */
export async function removeOfflineCachedBook(bookId: string): Promise<void> {
  if (!bookId) return;

  try {
    const offlineBooks = getOfflineCachedBooks();
    const targetBook = offlineBooks.find(b => b.id === bookId);
    const filtered = offlineBooks.filter(b => b.id !== bookId);
    localStorage.setItem(OFFLINE_BOOKS_STORAGE_KEY, JSON.stringify(filtered));

    // Notify Service Worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'DELETE_CACHED_EBOOK',
        bookId,
        coverUrl: targetBook?.coverImage
      });
    }

    // Direct Cache API deletion
    if ('caches' in window) {
      try {
        const cache = await caches.open(BOOKS_CACHE_NAME);
        await cache.delete(`/api/offline-book/${bookId}`);
        if (targetBook?.coverImage) {
          await cache.delete(targetBook.coverImage);
        }
      } catch (e) {
        console.warn('[SW Manager] Erro ao remover do Cache API:', e);
      }
    }
  } catch (e) {
    console.error('[SW Manager] Erro ao remover livro cached:', e);
  }
}

/**
 * Clear all cached books from offline storage
 */
export async function clearAllOfflineCachedBooks(): Promise<void> {
  try {
    localStorage.removeItem(OFFLINE_BOOKS_STORAGE_KEY);

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_ALL_EBOOKS'
      });
    }

    if ('caches' in window) {
      await caches.delete(BOOKS_CACHE_NAME);
    }
  } catch (e) {
    console.error('[SW Manager] Erro ao limpar livros offline:', e);
  }
}

/**
 * Estimate offline storage space used in MBs
 */
export function getOfflineStorageEstimate(): OfflineStorageStats {
  const books = getOfflineCachedBooks();
  const raw = typeof window !== 'undefined' ? (localStorage.getItem(OFFLINE_BOOKS_STORAGE_KEY) || '') : '';
  const sizeBytes = new Blob([raw]).size;
  const totalSizeMb = Number((sizeBytes / (1024 * 1024)).toFixed(2));

  return {
    bookCount: books.length,
    totalSizeMb: Math.max(0.1, totalSizeMb)
  };
}

/**
 * Setup connectivity status listener (online / offline)
 */
export function setupNetworkListeners(onChange: (isOnline: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => onChange(true);
  const handleOffline = () => onChange(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

