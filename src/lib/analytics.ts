import { getAnalytics, logEvent, isSupported, Analytics } from 'firebase/analytics';
import { app } from './firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { Book } from '../types';

let analyticsInstance: Analytics | null = null;

// Safely initialize analytics in browser environment ONLY if measurementId is provided
if (typeof window !== 'undefined' && Boolean(firebaseConfig?.measurementId && firebaseConfig.measurementId.trim() !== '')) {
  isSupported()
    .then((supported) => {
      if (supported) {
        try {
          analyticsInstance = getAnalytics(app);
          console.log('✅ Firebase Analytics inicializado com sucesso no Zola Books.');
        } catch (e) {
          console.warn('⚠️ Firebase Analytics não pôde ser inicializado neste contexto:', e);
        }
      } else {
        console.info('ℹ️ Firebase Analytics não suportado neste navegador/ambiente.');
      }
    })
    .catch((err) => {
      console.warn('⚠️ Erro ao verificar suporte do Firebase Analytics:', err);
    });
} else {
  console.info('ℹ️ Firebase Analytics inativo: measurementId não definido.');
}

/**
 * Generic helper to log events safely to Firebase Analytics
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (analyticsInstance) {
    try {
      logEvent(analyticsInstance, eventName, eventParams);
      console.log(`📊 [Firebase Analytics] '${eventName}':`, eventParams);
    } catch (err) {
      console.warn(`⚠️ [Firebase Analytics] Erro ao registar '${eventName}':`, err);
    }
  } else {
    console.log(`📊 [Analytics Event Tracked] '${eventName}':`, eventParams);
  }
}

/**
 * Track Book View / Modal Open
 */
export function trackBookView(book: Book) {
  if (!book) return;
  trackEvent('view_item', {
    item_id: book.id,
    item_name: book.title,
    author: book.author,
    category: book.category,
    price_aoa: book.priceAOA,
    price_usd: book.priceUSD,
    is_angolan: book.isAngolanAuthor || false,
    rating: book.rating,
    format: (book as any).format || 'ePub / PDF'
  });

  // Custom secondary event for reader metrics
  trackEvent('view_book_detail', {
    book_id: book.id,
    title: book.title,
    author: book.author
  });
}

/**
 * Track Book Added to Cart
 */
export function trackAddToCart(book: Book, selectedFormat: string = 'Digital') {
  if (!book) return;
  trackEvent('add_to_cart', {
    currency: 'AOA',
    value: book.priceAOA,
    items: [
      {
        item_id: book.id,
        item_name: book.title,
        item_category: book.category,
        author: book.author,
        price: book.priceAOA,
        quantity: 1,
        item_variant: selectedFormat
      }
    ]
  });
}

/**
 * Track Completed Purchase
 */
export function trackPurchase(order: {
  id: string;
  amountAOA: number;
  paymentMethod: string;
  items: Array<{ bookId: string; bookTitle: string; price: number; author?: string }>;
}) {
  if (!order) return;
  trackEvent('purchase', {
    transaction_id: order.id,
    value: order.amountAOA,
    currency: 'AOA',
    payment_type: order.paymentMethod,
    items_count: order.items.length,
    items: order.items.map((it) => ({
      item_id: it.bookId,
      item_name: it.bookTitle,
      price: it.price,
      quantity: 1
    }))
  });

  // Custom high-value conversion event
  trackEvent('zola_book_purchase_completed', {
    order_id: order.id,
    amount_aoa: order.amountAOA,
    method: order.paymentMethod
  });
}

/**
 * Track Reader Opening
 */
export function trackReadingStart(book: Book, startPage: number = 1, totalPages: number = 100) {
  if (!book) return;
  trackEvent('reading_start', {
    book_id: book.id,
    book_title: book.title,
    author: book.author,
    start_page: startPage,
    total_pages: totalPages
  });
}

/**
 * Track Page Turning / Reading Progress Update
 */
export function trackReadingProgress(
  bookId: string,
  bookTitle: string,
  currentPage: number,
  totalPages: number,
  percent: number
) {
  trackEvent('reading_progress', {
    book_id: bookId,
    book_title: bookTitle,
    current_page: currentPage,
    total_pages: totalPages,
    progress_percentage: Math.round(percent)
  });

  // Check milestone events (e.g. 50% completed, 100% completed)
  if (percent >= 100) {
    trackEvent('reading_completed', {
      book_id: bookId,
      book_title: bookTitle
    });
  } else if (percent === 50) {
    trackEvent('reading_halfway', {
      book_id: bookId,
      book_title: bookTitle
    });
  }
}

/**
 * Track Bookmark Added in E-Reader
 */
export function trackBookmarkAdd(bookId: string, bookTitle: string, page: number, noteSnippet?: string) {
  trackEvent('add_bookmark', {
    book_id: bookId,
    book_title: bookTitle,
    page_number: page,
    has_note: Boolean(noteSnippet)
  });
}

/**
 * Track Search Behavior
 */
export function trackSearch(searchTerm: string, resultsFound: number) {
  if (!searchTerm.trim()) return;
  trackEvent('search', {
    search_term: searchTerm.trim(),
    results_found: resultsFound
  });
}

/**
 * Track Favorite Toggle
 */
export function trackFavoriteToggle(book: Book, isFavoriteNow: boolean) {
  if (!book) return;
  trackEvent(isFavoriteNow ? 'add_to_wishlist' : 'remove_from_wishlist', {
    item_id: book.id,
    item_name: book.title,
    author: book.author
  });
}
