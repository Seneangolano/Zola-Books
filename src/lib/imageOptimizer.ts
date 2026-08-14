/**
 * Utility to dynamically convert book cover image URLs to WebP format with
 * automatic width resizing and compression, drastically speeding up initial page load times.
 */

export interface ImageOptimizationOptions {
  width?: number; // Target width in pixels (e.g. 160 for thumbs, 400 for cards, 800 for modals)
  quality?: number; // Compression quality percentage (default: 80)
  format?: 'webp' | 'avif' | 'jpeg' | 'png'; // Preferred format (default: 'webp')
}

export const DEFAULT_BOOK_COVER_URL = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c';

/**
 * Converts any image URL (Unsplash, Cloudinary, Imgix, etc.) into a WebP optimized URL with specified width and quality.
 * Specifically appends width (w), format (fm=webp), quality (q=80), and fit parameters to Unsplash URLs.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: ImageOptimizationOptions | number = {}
): string {
  const targetUrl = url?.trim() || DEFAULT_BOOK_COVER_URL;

  // Support passing width number directly (e.g. getOptimizedImageUrl(url, 400))
  const config: ImageOptimizationOptions = typeof options === 'number' 
    ? { width: options } 
    : options;

  const width = config.width || 400;
  const quality = config.quality || 80;
  const format = config.format || 'webp';

  // Return base64 data URLs or local blob URLs as-is
  if (targetUrl.startsWith('data:') || targetUrl.startsWith('blob:')) {
    return targetUrl;
  }

  try {
    const urlObj = new URL(targetUrl);

    // Unsplash Optimization: Convert direct Unsplash URLs into lightweight WebP format
    if (urlObj.hostname.includes('unsplash.com')) {
      urlObj.searchParams.set('fm', format); // 'webp'
      urlObj.searchParams.set('w', width.toString()); // e.g. 160 or 400
      urlObj.searchParams.set('q', quality.toString()); // e.g. 80
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.delete('auto'); // Replaced by explicit fm=webp
      return urlObj.toString();
    }

    // Cloudinary Optimization
    if (urlObj.hostname.includes('cloudinary.com')) {
      urlObj.searchParams.set('f', format);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      return urlObj.toString();
    }

    // Generic URLs: append query parameters
    urlObj.searchParams.set('fm', format);
    urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('q', quality.toString());

    return urlObj.toString();
  } catch {
    // If relative path or invalid URL string, return unchanged
    return targetUrl;
  }
}

/**
 * Convenience helper preset for book covers by size context:
 * - 'thumb': 160px width for small lists, carts & search
 * - 'card': 400px width for homepage grid cards
 * - 'hd': 800px width for detail modals and hero banners
 */
export function getOptimizedBookCover(
  coverUrl: string | undefined | null,
  size: 'thumb' | 'card' | 'hd' = 'card'
): string {
  const widths = {
    thumb: 160,
    card: 400,
    hd: 800
  };

  return getOptimizedImageUrl(coverUrl, {
    width: widths[size],
    format: 'webp',
    quality: 80
  });
}
