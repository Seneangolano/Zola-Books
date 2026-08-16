import { Book } from '../types';

const OFFLINE_BOOKS_STORAGE_KEY = 'zola_offline_cached_books_v2';
const BOOKS_CACHE_NAME = 'zola-ebooks-cache-v2';
const PINNED_OFFLINE_BOOKS_KEY = 'zola_pinned_offline_books_v1';
const ANDROID_STORAGE_SETTINGS_KEY = 'zola_android_storage_settings_v1';

export interface AndroidStorageSettings {
  autoCleanUnpinned: boolean;
  keepHighResCovers: boolean;
  wifiOnlyDownload: boolean;
  lowStorageAlertThresholdMb: number;
}

export interface OfflineBookMeta {
  bookId: string;
  title: string;
  author: string;
  coverImage: string;
  cachedAt: string;
  sizeKb: number;
  isPinned: boolean;
}

export interface OfflineStorageStats {
  bookCount: number;
  pinnedCount: number;
  totalSizeMb: number;
  deviceUsageMb?: number;
  deviceQuotaMb?: number;
  isPersistentGranted?: boolean;
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
 * Get IDs of books pinned permanently in offline storage
 */
export function getPinnedOfflineBookIds(): string[] {
  try {
    const raw = localStorage.getItem(PINNED_OFFLINE_BOOKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('[SW Manager] Erro ao obter livros fixados:', e);
    return [];
  }
}

/**
 * Check if a book is pinned permanently
 */
export function isBookPinnedOffline(bookId: string): boolean {
  if (!bookId) return false;
  const pinned = getPinnedOfflineBookIds();
  return pinned.includes(bookId);
}

/**
 * Save pinned offline book IDs
 */
export function setPinnedOfflineBookIds(bookIds: string[]): void {
  try {
    localStorage.setItem(PINNED_OFFLINE_BOOKS_KEY, JSON.stringify(bookIds));
  } catch (e) {
    console.error('[SW Manager] Erro ao guardar livros fixados:', e);
  }
}

/**
 * Toggle pinned status for a book
 */
export function togglePinOfflineBook(bookId: string): string[] {
  const current = getPinnedOfflineBookIds();
  const next = current.includes(bookId)
    ? current.filter(id => id !== bookId)
    : [...current, bookId];
  setPinnedOfflineBookIds(next);
  return next;
}

/**
 * Default Android Storage Optimization Settings
 */
const DEFAULT_ANDROID_STORAGE_SETTINGS: AndroidStorageSettings = {
  autoCleanUnpinned: false,
  keepHighResCovers: true,
  wifiOnlyDownload: false,
  lowStorageAlertThresholdMb: 50
};

/**
 * Get Android storage settings
 */
export function getAndroidStorageSettings(): AndroidStorageSettings {
  try {
    const raw = localStorage.getItem(ANDROID_STORAGE_SETTINGS_KEY);
    if (!raw) return DEFAULT_ANDROID_STORAGE_SETTINGS;
    return { ...DEFAULT_ANDROID_STORAGE_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_ANDROID_STORAGE_SETTINGS;
  }
}

/**
 * Save Android storage settings
 */
export function saveAndroidStorageSettings(settings: Partial<AndroidStorageSettings>): AndroidStorageSettings {
  try {
    const current = getAndroidStorageSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(ANDROID_STORAGE_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return DEFAULT_ANDROID_STORAGE_SETTINGS;
  }
}

/**
 * Check if Android / Browser Persistent Storage is granted (prevents OS auto-eviction)
 */
export async function checkIsPersistentStorageGranted(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      return await navigator.storage.persisted();
    } catch (e) {
      console.warn('[SW Manager] Erro ao verificar persisted storage:', e);
    }
  }
  return false;
}

/**
 * Request Persistent Storage on Android (protects pinned books from OS cache cleanup)
 */
export async function requestPersistentStoragePermission(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log('[SW Manager] Persistência de armazenamento solicitada. Resultado:', isPersisted);
      return isPersisted;
    } catch (e) {
      console.warn('[SW Manager] Erro ao pedir persistent storage:', e);
    }
  }
  return false;
}

/**
 * Get detailed device storage estimate
 */
export async function getDetailedStorageEstimate(): Promise<{
  usageMb: number;
  quotaMb: number;
  percent: number;
  isPersisted: boolean;
}> {
  let usageMb = 0;
  let quotaMb = 0;
  let percent = 0;
  let isPersisted = false;

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage !== undefined) {
        usageMb = Number((estimate.usage / (1024 * 1024)).toFixed(1));
      }
      if (estimate.quota !== undefined) {
        quotaMb = Number((estimate.quota / (1024 * 1024)).toFixed(1));
      }
      if (estimate.usage && estimate.quota) {
        percent = Math.min(100, Number(((estimate.usage / estimate.quota) * 100).toFixed(1)));
      }
      isPersisted = await checkIsPersistentStorageGranted();
    } catch (e) {
      console.warn('[SW Manager] Erro ao obter estimate:', e);
    }
  }

  // Fallback if estimate API not available
  if (usageMb === 0) {
    const stats = getOfflineStorageEstimate();
    usageMb = stats.totalSizeMb;
    quotaMb = 1024; // 1GB default
    percent = Number(((usageMb / quotaMb) * 100).toFixed(1));
  }

  return { usageMb, quotaMb, percent, isPersisted };
}

/**
 * Clean unpinned offline cached books to free up internal storage on Android
 */
export async function cleanUnpinnedOfflineBooks(): Promise<{ removedCount: number; freedMb: number }> {
  try {
    const offlineBooks = getOfflineCachedBooks();
    const pinnedIds = getPinnedOfflineBookIds();

    const beforeRaw = localStorage.getItem(OFFLINE_BOOKS_STORAGE_KEY) || '';
    const beforeSize = new Blob([beforeRaw]).size;

    const toKeep = offlineBooks.filter(b => pinnedIds.includes(b.id));
    const toRemove = offlineBooks.filter(b => !pinnedIds.includes(b.id));

    localStorage.setItem(OFFLINE_BOOKS_STORAGE_KEY, JSON.stringify(toKeep));

    // Remove from Cache API
    if ('caches' in window) {
      try {
        const cache = await caches.open(BOOKS_CACHE_NAME);
        for (const bk of toRemove) {
          await cache.delete(`/api/offline-book/${bk.id}`);
          if (bk.coverImage) {
            await cache.delete(bk.coverImage);
          }
        }
      } catch (e) {
        console.warn('[SW Manager] Erro ao limpar Cache API:', e);
      }
    }

    const afterRaw = localStorage.getItem(OFFLINE_BOOKS_STORAGE_KEY) || '';
    const afterSize = new Blob([afterRaw]).size;
    const freedMb = Number((Math.max(0, beforeSize - afterSize) / (1024 * 1024)).toFixed(2));

    return {
      removedCount: toRemove.length,
      freedMb: Math.max(0.1 * toRemove.length, freedMb)
    };
  } catch (e) {
    console.error('[SW Manager] Erro ao limpar livros não-fixados:', e);
    return { removedCount: 0, freedMb: 0 };
  }
}

/**
 * Estimate offline storage space used in MBs
 */
export function getOfflineStorageEstimate(): OfflineStorageStats {
  const books = getOfflineCachedBooks();
  const pinnedIds = getPinnedOfflineBookIds();
  const raw = typeof window !== 'undefined' ? (localStorage.getItem(OFFLINE_BOOKS_STORAGE_KEY) || '') : '';
  const sizeBytes = new Blob([raw]).size;
  const totalSizeMb = Number((sizeBytes / (1024 * 1024)).toFixed(2));

  return {
    bookCount: books.length,
    pinnedCount: books.filter(b => pinnedIds.includes(b.id)).length,
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


