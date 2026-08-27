import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl, getOptimizedBookCover, DEFAULT_BOOK_COVER_URL } from '../lib/imageOptimizer';
import { imagePrefetchService } from '../services/imagePrefetchService';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined;
  alt: string;
  fallbackSrc?: string;
  sizePreset?: 'thumb' | 'card' | 'hd' | 'raw';
  widthPx?: number;
  priority?: boolean; // When true, loading="eager" and high fetch priority
  showOfflineBadge?: boolean;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt,
  fallbackSrc = DEFAULT_BOOK_COVER_URL,
  sizePreset = 'card',
  widthPx,
  priority = false,
  className = '',
  showOfflineBadge = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // Compute optimized URL (WebP with dimensions)
  const targetUrl = React.useMemo(() => {
    if (!src) return fallbackSrc;
    if (sizePreset === 'raw') return src;
    if (widthPx) return getOptimizedImageUrl(src, widthPx);
    const validPreset: 'card' | 'thumb' | 'hd' = (sizePreset === 'thumb' || sizePreset === 'hd') ? sizePreset : 'card';
    return getOptimizedBookCover(src, validPreset);
  }, [src, sizePreset, widthPx, fallbackSrc]);

  // Check if image is available in Cache API for instant indication
  useEffect(() => {
    let isMounted = true;
    if (targetUrl) {
      imagePrefetchService.isImageCached(targetUrl).then((cached) => {
        if (isMounted) setIsCached(cached);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [targetUrl]);

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
      {/* Subtle skeleton shimmer placeholder while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
      )}

      {/* Main Image */}
      <img
        src={hasError ? fallbackSrc : targetUrl}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setIsLoaded(true);
          }
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />

      {/* Optional fast 3G / Cached Local Badge */}
      {showOfflineBadge && isCached && isLoaded && (
        <span 
          className="absolute bottom-1.5 right-1.5 bg-slate-950/80 backdrop-blur-sm text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-0.5 pointer-events-none shadow"
          title="Imagem carregada instantaneamente a partir do Cache API local"
        >
          ⚡ 3G
        </span>
      )}
    </div>
  );
};
