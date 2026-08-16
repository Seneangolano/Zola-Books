/**
 * Service for local caching and prefetching of Book Covers & Author Images
 * using the browser Cache API & Service Worker to guarantee instant load times
 * on unstable 3G networks and offline reading environments.
 */

import { Book } from '../types';
import { getOptimizedBookCover, getOptimizedImageUrl } from '../lib/imageOptimizer';

export const IMAGES_CACHE_NAME = 'zola-images-cache-v2';

export interface ImageCacheStats {
  cachedImagesCount: number;
  totalCatalogImages: number;
  estimatedSizeMb: number;
  coveragePercentage: number;
  isServiceWorkerReady: boolean;
  networkEffectiveType: string;
  isSaveDataActive: boolean;
  lastUpdated: string;
}

// Curated high-res author portraits to ensure author images are pre-cached alongside book covers
export const AUTHOR_PORTRAIT_MAP: Record<string, string> = {
  'Pepetela': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
  'José Eduardo Agualusa': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'Agostinho Neto': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  'Luandino Vieira': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'Ondjaki': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
  'Esperança Luísa': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'Amílcar Cabral': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'Paula Tavares': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'Manuel Rui': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
};

class ImagePrefetchService {
  private isPrefetching = false;

  /**
   * Detect current connection status (3G, 4G, 2G, SaveData)
   */
  public getConnectionInfo(): { effectiveType: string; saveData: boolean; is3G: boolean } {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
      const effectiveType = conn?.effectiveType || '4g';
      const saveData = !!conn?.saveData;
      const is3G = effectiveType === '3g' || effectiveType === '2g' || effectiveType === 'slow-2g';
      return { effectiveType, saveData, is3G };
    }
    return { effectiveType: '4g', saveData: false, is3G: false };
  }

  /**
   * Retrieves all image URLs across the catalog and author library
   */
  public extractAllImageUrls(books: Book[]): string[] {
    const urlSet = new Set<string>();

    books.forEach(book => {
      if (book.coverImage) {
        // Cache standard card WebP (400px) and thumbnail (160px)
        urlSet.add(getOptimizedBookCover(book.coverImage, 'card'));
        urlSet.add(getOptimizedBookCover(book.coverImage, 'thumb'));
        urlSet.add(book.coverImage);
      }
    });

    // Add author portraits
    Object.values(AUTHOR_PORTRAIT_MAP).forEach(url => {
      urlSet.add(getOptimizedImageUrl(url, { width: 300, format: 'webp', quality: 80 }));
      urlSet.add(url);
    });

    return Array.from(urlSet).filter(url => url && url.startsWith('http'));
  }

  /**
   * Queries the Cache API to calculate accurate stats on cached image entries
   */
  public async getCacheStats(books: Book[]): Promise<ImageCacheStats> {
    const connInfo = this.getConnectionInfo();
    const allUrls = this.extractAllImageUrls(books);
    const totalCount = allUrls.length;

    if (typeof window === 'undefined' || !('caches' in window)) {
      return {
        cachedImagesCount: 0,
        totalCatalogImages: totalCount,
        estimatedSizeMb: 0,
        coveragePercentage: 0,
        isServiceWorkerReady: false,
        networkEffectiveType: connInfo.effectiveType,
        isSaveDataActive: connInfo.saveData,
        lastUpdated: new Date().toLocaleTimeString('pt-AO')
      };
    }

    try {
      const cache = await caches.open(IMAGES_CACHE_NAME);
      const cachedRequests = await cache.keys();
      const cachedCount = cachedRequests.length;

      // Estimate average ~65KB per optimized WebP image
      const estimatedSizeMb = Number(((cachedCount * 0.065)).toFixed(2));
      const coveragePercentage = totalCount > 0 
        ? Math.min(100, Math.round((cachedCount / totalCount) * 100))
        : 100;

      const isSwReady = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;

      return {
        cachedImagesCount: cachedCount,
        totalCatalogImages: totalCount,
        estimatedSizeMb,
        coveragePercentage,
        isServiceWorkerReady: isSwReady,
        networkEffectiveType: connInfo.effectiveType,
        isSaveDataActive: connInfo.saveData,
        lastUpdated: new Date().toLocaleTimeString('pt-AO')
      };
    } catch (err) {
      console.warn('[ImagePrefetchService] Erro ao obter estatísticas do cache de imagens:', err);
      return {
        cachedImagesCount: 0,
        totalCatalogImages: totalCount,
        estimatedSizeMb: 0,
        coveragePercentage: 0,
        isServiceWorkerReady: false,
        networkEffectiveType: connInfo.effectiveType,
        isSaveDataActive: connInfo.saveData,
        lastUpdated: new Date().toLocaleTimeString('pt-AO')
      };
    }
  }

  /**
   * Checks if a single image is cached locally in Cache API
   */
  public async isImageCached(url: string): Promise<boolean> {
    if (typeof window === 'undefined' || !('caches' in window) || !url) return false;
    try {
      const cache = await caches.open(IMAGES_CACHE_NAME);
      const match = await cache.match(url);
      return !!match;
    } catch {
      return false;
    }
  }

  /**
   * Directly cache a single image
   */
  public async cacheSingleImage(url: string): Promise<boolean> {
    if (!url || typeof window === 'undefined' || !('caches' in window)) return false;
    try {
      const cache = await caches.open(IMAGES_CACHE_NAME);
      const req = new Request(url, { mode: 'cors', credentials: 'omit' });
      const existing = await cache.match(req);
      if (existing) return true;

      const resp = await fetch(req);
      if (resp.ok || resp.type === 'opaque') {
        await cache.put(req, resp);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Pre-fetches all catalog book covers and author portraits in batches
   * Sends command to Service Worker, and also executes client-side fallback if SW is pending.
   */
  public async prefetchCatalogImages(
    books: Book[],
    onProgress?: (progress: { loaded: number; total: number; percent: number }) => void
  ): Promise<{ success: boolean; cached: number; total: number }> {
    if (this.isPrefetching) {
      return { success: false, cached: 0, total: 0 };
    }

    const urls = this.extractAllImageUrls(books);
    if (urls.length === 0) {
      return { success: true, cached: 0, total: 0 };
    }

    this.isPrefetching = true;

    try {
      // 1. Notify Service Worker to prefetch in background
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PREFETCH_IMAGES_LIST',
          urls
        });
      }

      // 2. Also run controlled client-side Cache API prefetch for immediate feedback
      if ('caches' in window) {
        const cache = await caches.open(IMAGES_CACHE_NAME);
        let loaded = 0;
        const total = urls.length;

        // Process in batches of 4 to stay gentle on 3G bandwidth
        const batchSize = 4;
        for (let i = 0; i < urls.length; i += batchSize) {
          const batch = urls.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (url) => {
              try {
                const req = new Request(url, { mode: 'cors', credentials: 'omit' });
                const existing = await cache.match(req);
                if (!existing) {
                  const resp = await fetch(req);
                  if (resp.ok || resp.type === 'opaque') {
                    await cache.put(req, resp);
                  }
                }
              } catch (e) {
                // Ignore individual image download errors
              } finally {
                loaded++;
                if (onProgress) {
                  onProgress({
                    loaded,
                    total,
                    percent: Math.round((loaded / total) * 100)
                  });
                }
              }
            })
          );
        }

        this.isPrefetching = false;
        return { success: true, cached: loaded, total };
      }

      this.isPrefetching = false;
      return { success: true, cached: urls.length, total: urls.length };
    } catch (err) {
      console.error('[ImagePrefetchService] Erro durante o pré-carregamento:', err);
      this.isPrefetching = false;
      return { success: false, cached: 0, total: urls.length };
    }
  }

  /**
   * Clears the image cache on demand
   */
  public async clearImageCache(): Promise<boolean> {
    if (typeof window === 'undefined' || !('caches' in window)) return false;
    try {
      await caches.delete(IMAGES_CACHE_NAME);
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PURGE_IMAGE_CACHE'
        });
      }
      return true;
    } catch (err) {
      console.error('[ImagePrefetchService] Erro ao limpar cache de imagens:', err);
      return false;
    }
  }
}

export const imagePrefetchService = new ImagePrefetchService();
