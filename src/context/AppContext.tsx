import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { Book, User, CartItem, Currency, Order, UserRole, AppNotification, SellerSaleNotification, BookClub, BookClubDiscussion, BookClubComment, BookProgress, Bookmark, Highlight, HighlightColor, UserSecurityBackup, SyncHistoryEntry } from '../types';
import { MOCK_BOOKS, INITIAL_USERS, INITIAL_EXCHANGE_RATE, INITIAL_ORDERS, INITIAL_SELLER_SALES } from '../data/mockData';
import { INITIAL_BOOK_CLUBS } from '../data/bookClubsData';
import { api } from '../services/api';
import { 
  syncUserDataToFirestore, 
  subscribeToUserSyncData, 
  testFirestoreConnection,
  subscribeToAuthState,
  loginWithEmail,
  registerWithEmail,
  signInWithGoogle,
  logoutFirebase,
  sendPasswordReset,
  fetchUserDataFromFirestore,
  auth,
  UserSyncData
} from '../lib/firebase';
import { 
  getSyncHistory,
  logSyncEvent,
  clearSyncHistory,
  getDeviceFingerprint,
  formatDurationMs
} from '../lib/syncManager';
import { imagePrefetchService, ImageCacheStats } from '../services/imagePrefetchService';
import { 
  registerServiceWorker, 
  getOfflineCachedBooks, 
  cacheBookForOffline, 
  removeOfflineCachedBook, 
  clearAllOfflineCachedBooks,
  isBookCachedOffline,
  setupNetworkListeners,
  getPinnedOfflineBookIds,
  setPinnedOfflineBookIds,
  togglePinOfflineBook,
  getAndroidStorageSettings,
  saveAndroidStorageSettings,
  checkIsPersistentStorageGranted,
  requestPersistentStoragePermission,
  getDetailedStorageEstimate,
  cleanUnpinnedOfflineBooks,
  AndroidStorageSettings
} from '../lib/offlineManager';
import { triggerHapticFeedback } from '../lib/haptic';
import { playSoundEffect, isSoundFeedbackEnabled as getIsSoundFeedbackEnabled, setSoundFeedbackEnabled as setSoundFeedbackEnabledUtil } from '../lib/soundEffects';
import { 
  trackBookView, 
  trackAddToCart, 
  trackPurchase, 
  trackReadingStart, 
  trackReadingProgress, 
  trackBookmarkAdd, 
  trackFavoriteToggle,
  trackSearch 
} from '../lib/analytics';
import { 
  setSentryUser, 
  addSentryBreadcrumb, 
  trackViewChange, 
  trackPurchaseClick, 
  trackCartAction, 
  trackReaderAction 
} from '../lib/sentry';
import { parseTestPassToken } from '../components/TemporaryTestLinkModal';

interface AppContextType {
  // Books & Catalog
  books: Book[];
  isLoadingBooks: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  availableTags: string[];
  refreshBooks: () => Promise<void>;
  addBookToCatalog: (newBook: Partial<Book>) => Promise<Book>;

  // Currency & Prices
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceAOA: number, priceUSD?: number) => string;

  // User & Auth
  currentUser: User;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authReasonNotice: string | null;
  setAuthReasonNotice: (notice: string | null) => void;
  requireAuth: (reason: string, callback?: () => void) => boolean;
  login: (email: string, password?: string) => Promise<void>;
  registerUser: (userData: Partial<User> & { password?: string }) => Promise<void>;
  loginWithGoogleHandler: () => Promise<void>;
  resetPasswordHandler: (email: string) => Promise<void>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  usersList: User[];
  updateUserProfile: (data: Partial<User>) => void;
  isUserProfileOpen: boolean;
  setIsUserProfileOpen: (open: boolean) => void;

  // Cart
  cart: CartItem[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  cartSubtotalAOA: number;
  cartSubtotalUSD: number;

  // Custom User Uploaded EPUB Books
  customEpubBooks: Book[];
  addCustomEpubBook: (customBook: Book) => void;
  removeCustomEpubBook: (bookId: string) => void;

  // Favorites & Library
  favoriteBookIds: string[];
  toggleFavorite: (bookId: string) => void;
  purchasedBooks: Book[];
  claimFreeBook: (book: Book) => Promise<boolean>;

  // Author Following & In-App Push Notifications
  followedAuthors: string[];
  toggleFollowAuthor: (authorName: string) => void;
  latestPushNotif: { title: string; message: string; author: string; book?: Book } | null;
  clearLatestPushNotif: () => void;

  // Navigation & Views
  activeView: string;
  setActiveView: (view: string) => void;

  // Modals & Panels
  selectedBookModal: Book | null;
  setSelectedBookModal: (book: Book | null) => void;
  selectedAuthorModal: string | null;
  setSelectedAuthorModal: (authorName: string | null) => void;
  activeEReaderBook: Book | null;
  setActiveEReaderBook: (book: Book | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isZolaAIOpen: boolean;
  setIsZolaAIOpen: (open: boolean) => void;
  isSupportWhatsAppOpen: boolean;
  setIsSupportWhatsAppOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAppDownloadModalOpen: boolean;
  setIsAppDownloadModalOpen: (open: boolean) => void;
  isAndroid15ModalOpen: boolean;
  setIsAndroid15ModalOpen: (open: boolean) => void;
  isRoadmapModalOpen: boolean;
  setIsRoadmapModalOpen: (open: boolean) => void;
  isTestLinkModalOpen: boolean;
  setIsTestLinkModalOpen: (open: boolean) => void;
  testLinkDefaultBook: Book | null;
  openTestLinkModal: (book?: Book | null) => void;
  activeTestPass: { bookId?: string; expiresAt?: number; tester?: string } | null;
  setActiveTestPass: (pass: { bookId?: string; expiresAt?: number; tester?: string } | null) => void;
  isReadingReportModalOpen: boolean;
  setIsReadingReportModalOpen: (open: boolean) => void;
  isDeviceSyncModalOpen: boolean;
  setIsDeviceSyncModalOpen: (open: boolean) => void;

  // Orders
  orders: Order[];
  createNewOrder: (orderData: Partial<Order>) => Promise<Order>;
  approveIbanPayment: (orderId: string) => Promise<void>;

  // Seller Sales & Real-Time Notifications
  sellerSales: SellerSaleNotification[];
  latestSellerSalePush: SellerSaleNotification | null;
  clearLatestSellerSalePush: () => void;
  triggerSellerSaleNotification: (saleData: Partial<SellerSaleNotification> & { bookId: string; bookTitle: string; amountAOA: number; amountUSD: number }) => SellerSaleNotification;
  simulateTestSellerSale: (targetBookId?: string) => SellerSaleNotification;
  markSellerSaleAsRead: (saleId: string) => void;
  clearAllSellerSales: () => void;

  // Notifications & Toast
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  dismissNotification: (id: string) => void;
  triggerDailyReadingReminderNotification: (customMsg?: string) => void;

  // Theme (Light / Dark Mode)
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Service Worker & Offline Reading
  isOnline: boolean;
  offlineBooks: Book[];
  downloadingBookIds: string[];
  downloadBookForOffline: (book: Book) => Promise<boolean>;
  removeBookFromOffline: (bookId: string) => void;
  clearAllOfflineBooks: () => void;
  isBookOfflineCached: (bookId: string) => boolean;
  isBookDownloading: (bookId: string) => boolean;

  // Android Storage Optimization & Permanent Offline Cache
  pinnedOfflineBookIds: string[];
  isBookPinnedOffline: (bookId: string) => boolean;
  togglePinBookForOffline: (bookId: string) => Promise<void>;
  setBookPinnedOffline: (bookId: string, pinned: boolean) => Promise<void>;
  androidStorageSettings: AndroidStorageSettings;
  updateAndroidStorageSettings: (settings: Partial<AndroidStorageSettings>) => void;
  cleanUnpinnedOfflineCache: () => Promise<{ removedCount: number; freedMb: number }>;
  requestDevicePersistentStorage: () => Promise<boolean>;
  isPersistentStorageGranted: boolean;
  deviceStorageEstimate: { usageMb: number; quotaMb: number; percent: number; isPersisted: boolean };
  refreshStorageEstimate: () => Promise<void>;
  pinAndDownloadAllPurchased: () => Promise<void>;

  // 3G Image & Cover Cache API
  imageCacheStats: ImageCacheStats;
  isPrefetchingImages: boolean;
  prefetchImagesProgress: { loaded: number; total: number; percent: number } | null;
  prefetchAllCatalogImages: () => Promise<void>;
  clearImageCache: () => Promise<void>;
  refreshImageCacheStats: () => Promise<void>;

  // Book Clubs & Reading Groups
  bookClubs: BookClub[];
  joinBookClub: (clubId: string) => void;
  leaveBookClub: (clubId: string) => void;
  addDiscussionToClub: (clubId: string, discussion: Partial<BookClubDiscussion>) => void;
  addCommentToDiscussion: (clubId: string, discussionId: string, text: string) => void;
  toggleLikeDiscussion: (clubId: string, discussionId: string) => void;
  createNewBookClub: (clubData: Partial<BookClub>) => void;

  // Accessibility & Sound Feedback
  isAccessibilityModalOpen: boolean;
  setIsAccessibilityModalOpen: (open: boolean) => void;
  isSoundFeedbackActive: boolean;
  toggleSoundFeedback: (enabled?: boolean) => void;

  // Reading Progress State & Actions
  readingProgressMap: Record<string, BookProgress>;
  updateBookProgress: (bookId: string, chapterIndex: number, totalChapters: number, scrollPosition?: number) => void;
  getBookProgress: (bookId: string) => BookProgress | undefined;

  // Bookmarks Engine
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (bookmarkId: string) => void;
  updateBookmarkNote: (bookmarkId: string, note: string) => void;
  toggleChapterBookmark: (book: Book, chapterIndex: number, chapterTitle: string, snippet?: string, note?: string) => void;
  isChapterBookmarked: (bookId: string, chapterIndex: number) => boolean;
  getBookmarksForBook: (bookId: string) => Bookmark[];

  // Highlights Engine
  highlights: Highlight[];
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  removeHighlight: (highlightId: string) => void;
  updateHighlightNote: (highlightId: string, note: string) => void;
  getHighlightsForBook: (bookId: string) => Highlight[];

  // Cloud Sync (Firestore) & Device Synchronization
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: Date | null;
  syncHistory: SyncHistoryEntry[];
  triggerCloudSync: () => Promise<void>;
  forceUploadToCloud: () => Promise<{ success: boolean; message: string; details?: any }>;
  forceDownloadFromCloud: () => Promise<{ success: boolean; message: string; details?: any }>;
  forceBidirectionalSync: () => Promise<{ success: boolean; message: string; details?: any }>;
  testCloudConnection: () => Promise<{ success: boolean; latencyMs: number; message: string }>;
  clearSyncHistoryLog: () => void;
  getRemoteSyncDataPreview: () => Promise<UserSyncData | null>;

  // Security Backup Engine (.json)
  exportUserDataBackup: () => void;
  importUserDataBackup: (backupInput: string | object) => Promise<{
    success: boolean;
    progressCount: number;
    bookmarksCount: number;
    highlightsCount: number;
    message: string;
  }>;
}

const INITIAL_READING_PROGRESS: Record<string, BookProgress> = {
  'ZB-BK-101': {
    bookId: 'ZB-BK-101',
    percentage: 65,
    currentChapterIndex: 2,
    totalChapters: 4,
    lastReadAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  'ZB-BK-102': {
    bookId: 'ZB-BK-102',
    percentage: 30,
    currentChapterIndex: 1,
    totalChapters: 4,
    lastReadAt: new Date(Date.now() - 3600000 * 18).toISOString()
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const GUEST_USER: User = {
  id: 'guest-user',
  name: 'Leitor Convidado',
  email: 'convidado@zolabooks.ao',
  role: 'customer',
  country: 'Angola',
  affiliateCode: 'GUEST',
  affiliateEarningsAOA: 0,
  affiliateEarningsUSD: 0,
  purchasedBookIds: [],
  favoriteBookIds: [],
  createdAt: new Date().toISOString()
};

const deduplicateBooks = (list: Book[]): Book[] => {
  const seen = new Set<string>();
  const res: Book[] = [];
  for (const b of list) {
    if (b && b.id && !seen.has(b.id)) {
      seen.add(b.id);
      res.push(b);
    }
  }
  return res;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => deduplicateBooks(MOCK_BOOKS));
  const [isLoadingBooks, setIsLoadingBooks] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedTag, setSelectedTag] = useState<string>('Todas');

  // Track search queries in Analytics
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    const timer = setTimeout(() => {
      const resultsCount = books.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).length;
      trackSearch(searchQuery, resultsCount);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery, books]);

  // Compute all unique tags across all books in catalog
  const availableTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    books.forEach(b => {
      if (b.tags && Array.isArray(b.tags)) {
        b.tags.forEach(t => {
          if (t && t.trim()) {
            const cleanTag = t.trim();
            tagMap.set(cleanTag, (tagMap.get(cleanTag) || 0) + 1);
          }
        });
      }
    });
    // Sort tags by frequency then alphabetically
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(entry => entry[0]);
  }, [books]);

  // Authentication State (Firebase Auth + Fallback Guest Mode)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('zolabooks_is_auth') === 'true';
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authReasonNotice, setAuthReasonNotice] = useState<string | null>(null);
  const pendingAuthCallbackRef = useRef<(() => void) | null>(null);

  const [currency, setCurrency] = useState<Currency>('AOA');
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const isAuth = localStorage.getItem('zolabooks_is_auth') === 'true';
    const savedEmail = localStorage.getItem('zolabooks_user_email');
    if (isAuth && savedEmail) {
      const found = INITIAL_USERS.find(u => u.email.toLowerCase() === savedEmail.toLowerCase());
      if (found) return found;
    }
    return isAuth ? INITIAL_USERS[0] : GUEST_USER;
  });

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      setIsAuthLoading(false);
      if (fbUser) {
        setIsAuthenticated(true);
        localStorage.setItem('zolabooks_is_auth', 'true');
        localStorage.setItem('zolabooks_user_email', fbUser.email || fbUser.uid);

        const existingLocal = INITIAL_USERS.find(u => u.email.toLowerCase() === (fbUser.email || '').toLowerCase());
        const remoteData = await fetchUserDataFromFirestore(fbUser.uid).catch(() => null);

        const realUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || remoteData?.name || existingLocal?.name || (fbUser.email ? fbUser.email.split('@')[0] : 'Leitor Zola'),
          email: fbUser.email || existingLocal?.email || `${fbUser.uid}@zolabooks.ao`,
          phone: existingLocal?.phone || '+244 923 456 789',
          role: (remoteData?.role as UserRole) || existingLocal?.role || 'customer',
          country: 'Angola',
          affiliateCode: existingLocal?.affiliateCode || ('ZOLA' + Math.floor(Math.random() * 1000)),
          affiliateEarningsAOA: existingLocal?.affiliateEarningsAOA || 0,
          affiliateEarningsUSD: existingLocal?.affiliateEarningsUSD || 0,
          purchasedBookIds: remoteData?.purchasedBookIds || existingLocal?.purchasedBookIds || ['ZB-BK-101'],
          favoriteBookIds: remoteData?.favoriteBookIds || existingLocal?.favoriteBookIds || [],
          avatarUrl: fbUser.photoURL || existingLocal?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          createdAt: existingLocal?.createdAt || new Date().toISOString()
        };

        setCurrentUser(realUser);
        if (remoteData?.favoriteBookIds) {
          setFavoriteBookIds(remoteData.favoriteBookIds);
        }

        // Sync real Firebase Auth user profile to Firestore
        syncUserDataToFirestore({
          id: fbUser.uid,
          name: realUser.name,
          email: realUser.email,
          role: realUser.role,
          purchasedBookIds: realUser.purchasedBookIds,
          favoriteBookIds: realUser.favoriteBookIds
        });
      } else {
        const isAuthFlag = localStorage.getItem('zolabooks_is_auth') === 'true';
        const savedEmail = localStorage.getItem('zolabooks_user_email');
        if (!isAuthFlag) {
          setIsAuthenticated(false);
          setCurrentUser(GUEST_USER);
        } else if (savedEmail && currentUser.id === 'guest-user') {
          const found = INITIAL_USERS.find(u => u.email.toLowerCase() === savedEmail.toLowerCase());
          if (found) setCurrentUser(found);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync user metadata to Sentry for error telemetry
  useEffect(() => {
    if (currentUser && currentUser.id !== 'guest-user') {
      setSentryUser({
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role
      });
      addSentryBreadcrumb('auth', `Utilizador ativo no Zola Books: ${currentUser.email}`);
    } else {
      setSentryUser(null);
    }
  }, [currentUser]);

  const [isUserProfileOpen, setIsUserProfileOpen] = useState<boolean>(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [favoriteBookIds, setFavoriteBookIds] = useState<string[]>(INITIAL_USERS[0].favoriteBookIds);
  const [followedAuthors, setFollowedAuthors] = useState<string[]>(() => {
    return currentUser.followedAuthors || ['Pepetela', 'Luandino Vieira', 'Esperança Luísa'];
  });
  const [latestPushNotif, setLatestPushNotif] = useState<{
    title: string;
    message: string;
    author: string;
    book?: Book;
  } | null>(null);

  const [activeView, setActiveViewState] = useState<string>('home');
  const setActiveView = (view: string) => {
    setActiveViewState(prev => {
      if (prev !== view) {
        trackViewChange(view, prev);
      }
      return view;
    });
  };

  const [selectedBookModal, setSelectedBookModalState] = useState<Book | null>(null);
  const setSelectedBookModal = (book: Book | null) => {
    setSelectedBookModalState(book);
    if (book) {
      trackBookView(book);
      addSentryBreadcrumb('ui.modal', `Abriu detalhes do livro: "${book.title}"`, { bookId: book.id, priceAOA: book.priceAOA });
    }
  };

  const [selectedAuthorModal, setSelectedAuthorModal] = useState<string | null>(null);

  const [activeEReaderBook, setActiveEReaderBookState] = useState<Book | null>(null);
  const setActiveEReaderBook = (book: Book | null) => {
    setActiveEReaderBookState(book);
    if (book) {
      trackReadingStart(book);
      trackReaderAction('open', { bookId: book.id, title: book.title });
    }
  };
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpenState] = useState<boolean>(false);
  const setIsCheckoutOpen = (open: boolean) => {
    setIsCheckoutOpenState(open);
    if (open) {
      const mainItem = cart.length > 0 ? cart[0].book : (selectedBookModal || undefined);
      trackPurchaseClick(
        mainItem?.id || 'cart_checkout',
        mainItem?.title || 'Checkout de Múltiplos Livros',
        cart.reduce((sum, item) => sum + item.book.priceAOA, 0),
        undefined,
        { cartCount: cart.length }
      );
    }
  };
  const [isZolaAIOpen, setIsZolaAIOpen] = useState<boolean>(false);
  const [isSupportWhatsAppOpen, setIsSupportWhatsAppOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAppDownloadModalOpen, setIsAppDownloadModalOpen] = useState<boolean>(false);
  const [isAndroid15ModalOpen, setIsAndroid15ModalOpen] = useState<boolean>(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState<boolean>(false);
  const [isTestLinkModalOpen, setIsTestLinkModalOpen] = useState<boolean>(false);
  const [testLinkDefaultBook, setTestLinkDefaultBook] = useState<Book | null>(null);
  const [isReadingReportModalOpen, setIsReadingReportModalOpen] = useState<boolean>(false);
  const [isDeviceSyncModalOpen, setIsDeviceSyncModalOpen] = useState<boolean>(false);
  const [activeTestPass, setActiveTestPass] = useState<{
    bookId?: string;
    expiresAt?: number;
    tester?: string;
  } | null>(null);

  const openTestLinkModal = (book?: Book | null) => {
    setTestLinkDefaultBook(book || null);
    setIsTestLinkModalOpen(true);
  };

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [sellerSales, setSellerSales] = useState<SellerSaleNotification[]>(() => {
    const saved = localStorage.getItem('zolabooks_seller_sales');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // use default
      }
    }
    return INITIAL_SELLER_SALES;
  });
  const [latestSellerSalePush, setLatestSellerSalePush] = useState<SellerSaleNotification | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('zolabooks_seller_sales', JSON.stringify(sellerSales));
    } catch {
      // ignore
    }
  }, [sellerSales]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Theme State (Light/Dark Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('zolabooks_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Service Worker & Offline Reading State
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineBooks, setOfflineBooks] = useState<Book[]>(() => getOfflineCachedBooks());

  useEffect(() => {
    // Register Service Worker
    registerServiceWorker();

    // Listen for Service Worker postMessage events
    const handleSwMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (
        event.data.type === 'EBOOK_CACHED_SUCCESS' || 
        event.data.type === 'EBOOK_DELETED_SUCCESS' || 
        event.data.type === 'EBOOKS_CLEARED_SUCCESS'
      ) {
        setOfflineBooks(getOfflineCachedBooks());
      }
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    // Listen to network online/offline events (maintains connection state without pop-up toasts)
    const cleanupNetwork = setupNetworkListeners((onlineStatus) => {
      setIsOnline(onlineStatus);
    });

    return () => {
      cleanupNetwork();
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, []);

  const [downloadingBookIds, setDownloadingBookIds] = useState<string[]>([]);

  const downloadBookForOffline = async (book: Book): Promise<boolean> => {
    if (!book || !book.id || downloadingBookIds.includes(book.id)) return false;

    setDownloadingBookIds(prev => [...prev, book.id]);
    try {
      // Ensure visual download animation feedback for at least 750ms
      const [success] = await Promise.all([
        cacheBookForOffline(book),
        new Promise(resolve => setTimeout(resolve, 750))
      ]);

      if (success) {
        setOfflineBooks(getOfflineCachedBooks());
        addNotification(
          'E-book Cached para Leitura Offline ⚡',
          `"${book.title}" foi guardado no cache do Service Worker. Podes ler sem ligação à internet!`,
          'system'
        );
      }
      return success;
    } catch (err) {
      console.error('Erro ao guardar e-book offline:', err);
      return false;
    } finally {
      setDownloadingBookIds(prev => prev.filter(id => id !== book.id));
    }
  };

  const removeBookFromOffline = async (bookId: string) => {
    await removeOfflineCachedBook(bookId);
    setOfflineBooks(getOfflineCachedBooks());
    addNotification('Cache Offline Removido', 'E-book removido da memória offline local.', 'system');
  };

  const clearAllOfflineBooks = async () => {
    await clearAllOfflineCachedBooks();
    setOfflineBooks([]);
    addNotification('Memória Offline Limpa', 'Todos os e-books cached foram removidos.', 'system');
  };

  const isBookOfflineCached = (bookId: string): boolean => {
    return offlineBooks.some(b => b.id === bookId);
  };

  const isBookDownloading = (bookId: string): boolean => {
    return downloadingBookIds.includes(bookId);
  };

  // Android Storage Optimization & Permanent Offline Cache State
  const [pinnedOfflineBookIds, setPinnedOfflineBookIdsState] = useState<string[]>(() => getPinnedOfflineBookIds());
  const [androidStorageSettings, setAndroidStorageSettingsState] = useState<AndroidStorageSettings>(() => getAndroidStorageSettings());
  const [isPersistentStorageGranted, setIsPersistentStorageGranted] = useState<boolean>(false);
  const [deviceStorageEstimate, setDeviceStorageEstimate] = useState<{
    usageMb: number;
    quotaMb: number;
    percent: number;
    isPersisted: boolean;
  }>({ usageMb: 0.5, quotaMb: 1024, percent: 0.1, isPersisted: false });

  const refreshStorageEstimate = async () => {
    try {
      const estimate = await getDetailedStorageEstimate();
      setDeviceStorageEstimate(estimate);
      setIsPersistentStorageGranted(estimate.isPersisted);
    } catch (e) {
      console.warn('Erro ao atualizar estimativa de armazenamento:', e);
    }
  };

  useEffect(() => {
    refreshStorageEstimate();
    checkIsPersistentStorageGranted().then(granted => setIsPersistentStorageGranted(granted));
  }, [offlineBooks, pinnedOfflineBookIds]);

  const isBookPinnedOffline = (bookId: string): boolean => {
    return pinnedOfflineBookIds.includes(bookId);
  };

  const setBookPinnedOffline = async (bookId: string, pinned: boolean) => {
    if (!bookId) return;
    const current = getPinnedOfflineBookIds();
    let next: string[];
    if (pinned) {
      next = current.includes(bookId) ? current : [...current, bookId];
      // If book is not yet cached offline, automatically cache it now
      const bookToCache = books.find(b => b.id === bookId) || purchasedBooks.find(b => b.id === bookId);
      if (bookToCache && !isBookOfflineCached(bookId)) {
        await downloadBookForOffline(bookToCache);
      }
      addNotification(
        'Livro Fixado em Cache Permanente 📌',
        `Este e-book será mantido na memória interna do dispositivo mesmo durante limpezas automáticas de cache Android.`,
        'system'
      );
    } else {
      next = current.filter(id => id !== bookId);
      addNotification(
        'Removido da Cache Permanente',
        'O e-book agora está sujeito à gestão padrão de armazenamento do sistema.',
        'system'
      );
    }
    setPinnedOfflineBookIds(next);
    setPinnedOfflineBookIdsState(next);
    await refreshStorageEstimate();
  };

  const togglePinBookForOffline = async (bookId: string) => {
    const isPinned = isBookPinnedOffline(bookId);
    await setBookPinnedOffline(bookId, !isPinned);
  };

  const updateAndroidStorageSettings = (newSettings: Partial<AndroidStorageSettings>) => {
    const updated = saveAndroidStorageSettings(newSettings);
    setAndroidStorageSettingsState(updated);
    addNotification('Definições de Armazenamento Atualizadas', 'As tuas preferências de cache offline foram guardadas.', 'system');
  };

  const cleanUnpinnedOfflineCache = async (): Promise<{ removedCount: number; freedMb: number }> => {
    const result = await cleanUnpinnedOfflineBooks();
    setOfflineBooks(getOfflineCachedBooks());
    await refreshStorageEstimate();
    if (result.removedCount > 0) {
      addNotification(
        'Armazenamento Otimizado 🧹',
        `${result.removedCount} livro(s) temporário(s) removido(s). ${result.freedMb.toFixed(1)} MB libertados no armazenamento interno!`,
        'system'
      );
    } else {
      addNotification(
        'Cache Otimizado',
        'Todos os livros atualmente no cache já estão marcados como permanentes.',
        'system'
      );
    }
    return result;
  };

  const requestDevicePersistentStorage = async (): Promise<boolean> => {
    const granted = await requestPersistentStoragePermission();
    setIsPersistentStorageGranted(granted);
    await refreshStorageEstimate();
    if (granted) {
      addNotification(
        'Armazenamento Persistente Concedido 🛡️',
        'O Android/Navegador autorizou armazenamento persistente. Os teus livros fixados estão protegidos contra limpeza automática do sistema.',
        'system'
      );
    } else {
      addNotification(
        'Estado de Armazenamento',
        'O armazenamento opera em modo padrão. Fixa os livros prioritários para mantê-los protegidos.',
        'system'
      );
    }
    return granted;
  };

  const pinAndDownloadAllPurchased = async () => {
    const allBooks = [...purchasedBooks];
    const allIds = allBooks.map(b => b.id);
    setPinnedOfflineBookIds(allIds);
    setPinnedOfflineBookIdsState(allIds);
    
    // Download any not yet cached
    let count = 0;
    for (const bk of allBooks) {
      if (!isBookOfflineCached(bk.id)) {
        await downloadBookForOffline(bk);
        count++;
      }
    }
    await refreshStorageEstimate();
    addNotification(
      'Todos os Livros Fixados em Cache 📌',
      `${allBooks.length} livro(s) da tua biblioteca estão configurados para acesso offline permanente (${count} descarregado(s) agora).`,
      'system'
    );
  };

  // Reading Progress Engine
  const [readingProgressMap, setReadingProgressMap] = useState<Record<string, BookProgress>>(() => {
    try {
      const saved = localStorage.getItem('zolabooks_reading_progress_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar progresso de leitura:', e);
    }
    return INITIAL_READING_PROGRESS;
  });

  const updateBookProgress = (bookId: string, chapterIndex: number, totalChapters: number, scrollPosition?: number) => {
    if (!bookId || totalChapters <= 0) return;
    const safeChapterIndex = Math.max(0, Math.min(chapterIndex, totalChapters - 1));
    const percentage = Math.min(100, Math.max(1, Math.round(((safeChapterIndex + 1) / totalChapters) * 100)));

    const currentBook = books.find(b => b.id === bookId);
    if (currentBook) {
      trackReadingProgress(bookId, currentBook.title, safeChapterIndex + 1, totalChapters, percentage);
    }

    setReadingProgressMap(prev => {
      const updated = {
        ...prev,
        [bookId]: {
          bookId,
          percentage,
          currentChapterIndex: safeChapterIndex,
          totalChapters,
          scrollPosition: typeof scrollPosition === 'number' ? Math.max(0, Math.round(scrollPosition)) : (prev[bookId]?.scrollPosition || 0),
          lastReadAt: new Date().toISOString()
        }
      };
      try {
        localStorage.setItem('zolabooks_reading_progress_v1', JSON.stringify(updated));
      } catch (e) {
        console.warn('Erro ao guardar progresso no localStorage:', e);
      }
      return updated;
    });
  };

  const getBookProgress = (bookId: string): BookProgress | undefined => {
    return readingProgressMap[bookId];
  };

  // Bookmarks Engine
  const INITIAL_BOOKMARKS: Bookmark[] = [
    {
      id: 'bkm-101',
      bookId: 'ZB-BK-101',
      bookTitle: 'O Vendedor de Passados',
      bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      bookAuthor: 'José Eduardo Agualusa',
      chapterIndex: 2,
      chapterTitle: 'Capítulo 3: Memórias Recriadas',
      snippet: '«O passado é um país estrangeiro onde todos se reinventam sem autorização prévia.»',
      note: 'Citação inspiradora sobre a ficção da memória angolana.',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'bkm-102',
      bookId: 'ZB-BK-102',
      bookTitle: 'A Geração da Utopia',
      bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
      bookAuthor: 'Pepetela',
      chapterIndex: 1,
      chapterTitle: 'Capítulo 2: Os Sonhos de Lisboa',
      snippet: '«Discutiam a libertação do país na Casa dos Estudantes do Império com o ardor da juventude.»',
      note: 'Marcar contexto histórico das personagens.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('zolabooks_bookmarks_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar marcadores de leitura:', e);
    }
    return INITIAL_BOOKMARKS;
  });

  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    setBookmarks(newBookmarks);
    try {
      localStorage.setItem('zolabooks_bookmarks_v2', JSON.stringify(newBookmarks));
    } catch (e) {
      console.warn('Erro ao guardar marcadores no localStorage:', e);
    }
  };

  const addBookmark = (bookmarkData: Omit<Bookmark, 'id' | 'createdAt'>) => {
    if (!requireAuth('criar marcadores de leitura e anotações para sincronizar na nuvem')) return;
    trackBookmarkAdd(bookmarkData.bookId, bookmarkData.bookTitle, bookmarkData.chapterIndex + 1, bookmarkData.note);
    const newBookmark: Bookmark = {
      ...bookmarkData,
      id: `bkm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newBookmark, ...bookmarks];
    saveBookmarks(updated);
    addNotification('Página Marcada', `Guardaste um marcador em "${bookmarkData.chapterTitle}".`, 'system');
  };

  const removeBookmark = (bookmarkId: string) => {
    const updated = bookmarks.filter(b => b.id !== bookmarkId);
    saveBookmarks(updated);
    addNotification('Marcador Removido', 'O marcador foi removido da tua biblioteca.', 'system');
  };

  const updateBookmarkNote = (bookmarkId: string, note: string) => {
    const updated = bookmarks.map(b => b.id === bookmarkId ? { ...b, note } : b);
    saveBookmarks(updated);
    addNotification('Nota Atualizada', 'A tua nota do marcador foi guardada com sucesso.', 'system');
  };

  const toggleChapterBookmark = (book: Book, chapterIndex: number, chapterTitle: string, snippet?: string, note?: string) => {
    const existing = bookmarks.find(b => b.bookId === book.id && b.chapterIndex === chapterIndex);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark({
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.coverImage,
        bookAuthor: book.author,
        chapterIndex,
        chapterTitle,
        snippet,
        note
      });
    }
  };

  const isChapterBookmarked = (bookId: string, chapterIndex: number): boolean => {
    return bookmarks.some(b => b.bookId === bookId && b.chapterIndex === chapterIndex);
  };

  const getBookmarksForBook = (bookId: string): Bookmark[] => {
    return bookmarks.filter(b => b.bookId === bookId);
  };

  // Highlights Engine
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    try {
      const saved = localStorage.getItem('zolabooks_highlights_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar realces:', e);
    }
    return [];
  });

  const saveHighlights = (newHighlights: Highlight[]) => {
    setHighlights(newHighlights);
    try {
      localStorage.setItem('zolabooks_highlights_v1', JSON.stringify(newHighlights));
    } catch (e) {
      console.warn('Erro ao guardar realces no localStorage:', e);
    }
  };

  const addHighlight = (highlightData: Omit<Highlight, 'id' | 'createdAt'>) => {
    if (!requireAuth('guardar realces coloridos de texto na nuvem')) return;
    const newHighlight: Highlight = {
      ...highlightData,
      id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newHighlight, ...highlights];
    saveHighlights(updated);
    addNotification('Trecho Realçado', `Guardado realce colorido em "${highlightData.chapterTitle || 'Leitura'}".`, 'system');
  };

  const removeHighlight = (highlightId: string) => {
    const updated = highlights.filter(h => h.id !== highlightId);
    saveHighlights(updated);
    addNotification('Realce Removido', 'O realce foi removido do teu histórico de leitura.', 'system');
  };

  const updateHighlightNote = (highlightId: string, note: string) => {
    const updated = highlights.map(h => h.id === highlightId ? { ...h, note } : h);
    saveHighlights(updated);
    addNotification('Nota do Realce Atualizada', 'Nota pessoal atualizada com sucesso.', 'system');
  };

  const getHighlightsForBook = (bookId: string): Highlight[] => {
    return highlights.filter(h => h.bookId === bookId);
  };

  const playReminderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('AudioContext chime error:', e);
    }
  };

  const triggerDailyReadingReminderNotification = (customMsgOverride?: string) => {
    const settings = currentUser.dailyReminderSettings;
    const goalMins = settings?.goalMinutes || 20;
    const msg = customMsgOverride || settings?.customMessage || `Reserva ${goalMins} minutos para o teu hábito de leitura diária na Zola Books! 🇦🇴`;
    const title = `📖 Hora da Leitura Diária (${goalMins} min)`;

    // 1. In-App Push Banner
    setLatestPushNotif({
      title,
      message: msg,
      author: 'Zola Books - Hábito Diário',
      book: books[0]
    });

    // 2. Toast notification
    addNotification('Lembrete de Leitura ⏰', msg, 'promotion');

    // 3. Play Chime sound if enabled
    if (settings?.soundEnabled !== false) {
      playReminderChime();
    }

    // 4. Browser Native Push Notification (Web Notification API)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notif = new Notification('Zola Books 📖 - Hábito de Leitura', {
            body: msg,
            icon: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=80',
            tag: 'zola-daily-reading-reminder'
          });
          notif.onclick = () => {
            window.focus();
            if (books.length > 0) setSelectedBookModal(books[0]);
          };
        } catch (e) {
          console.warn('Browser Push Notification error:', e);
        }
      }
    }
  };

  // Background timer to trigger scheduled daily reading reminder
  useEffect(() => {
    const checkReminderInterval = setInterval(() => {
      const settings = currentUser.dailyReminderSettings;
      if (!settings || !settings.enabled) return;

      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      if (settings.daysOfWeek && settings.daysOfWeek.length > 0 && !settings.daysOfWeek.includes(currentDay)) return;

      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`; // "20:00"

      const todayDateStr = now.toISOString().split('T')[0]; // "2026-08-07"

      if (currentTimeStr === settings.time && settings.lastTriggeredDate !== todayDateStr) {
        triggerDailyReadingReminderNotification();
        updateUserProfile({
          dailyReminderSettings: {
            ...settings,
            lastTriggeredDate: todayDateStr
          }
        });
      }
    }, 20000); // Check every 20 seconds

    return () => clearInterval(checkReminderInterval);
  }, [currentUser.dailyReminderSettings, books]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem('zolabooks_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Ref to prevent circular updates between local sync and Firestore listener
  const isUpdatingFromRemote = useRef(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEntry[]>(() => getSyncHistory());

  const refreshSyncHistory = () => {
    setSyncHistory(getSyncHistory());
  };

  const clearSyncHistoryLog = () => {
    clearSyncHistory();
    setSyncHistory([]);
    playSoundEffect('cart_remove');
    triggerHapticFeedback('light');
    addNotification('Histórico de Sincronização Limpo', 'Todos os registos locais de sincronização foram removidos.', 'system');
  };

  // Test connection to Firestore on boot
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      if (!connected) {
        setCloudSyncStatus('offline');
      }
    });
  }, []);

  // Parse URL search parameters for Temporary Test Links on boot
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const tokenData = token ? parseTestPassToken(token) : null;

    const testPass = urlParams.get('testPass');
    const exp = urlParams.get('exp');
    const testBookId = urlParams.get('testBook');
    const tester = urlParams.get('tester');

    if (tokenData) {
      if (Date.now() < tokenData.expiresAt) {
        const targetBookId = tokenData.bookId === 'all' ? undefined : tokenData.bookId;
        setActiveTestPass({
          bookId: targetBookId,
          expiresAt: tokenData.expiresAt,
          tester: tokenData.tester
        });

        if (targetBookId && books.length > 0) {
          const targetBook = books.find(b => b.id === targetBookId);
          if (targetBook) {
            setActiveEReaderBook(targetBook);
          }
        }

        addNotification(
          '⚡ Passe Temporário VIP Ativo!',
          `Acesso seguro de teste concedido ${tokenData.tester ? `(${tokenData.tester})` : ''}. Válido até ${new Date(tokenData.expiresAt).toLocaleTimeString('pt-AO')} de ${new Date(tokenData.expiresAt).toLocaleDateString('pt-AO')}.`,
          'system'
        );
      } else {
        addNotification(
          '⚠️ Token de Teste Expirado',
          'O token temporário fornecido já expirou. Crie um novo link.',
          'system'
        );
      }
    } else if (testPass === '1') {
      const expiresAt = exp ? parseInt(exp, 10) : Date.now() + 86400000;
      if (Date.now() < expiresAt) {
        const decodedTester = tester ? decodeURIComponent(tester) : undefined;
        setActiveTestPass({
          bookId: testBookId || undefined,
          expiresAt,
          tester: decodedTester
        });

        if (testBookId && books.length > 0) {
          const targetBook = books.find(b => b.id === testBookId);
          if (targetBook) {
            setActiveEReaderBook(targetBook);
          }
        }

        addNotification(
          '⚡ Passe Temporário de Teste Ativo!',
          `Acesso VIP concedido para testes ${decodedTester ? `(${decodedTester})` : ''}. Válido até ${new Date(expiresAt).toLocaleTimeString('pt-AO')} de ${new Date(expiresAt).toLocaleDateString('pt-AO')}.`,
          'system'
        );
      } else {
        addNotification(
          '⚠️ Link de Teste Expirado',
          'O link temporário de teste utilizado já expirou. Crie um novo link.',
          'system'
        );
      }
    }
  }, [books]);

  // Manual trigger for cloud sync
  const triggerCloudSync = async () => {
    if (!currentUser || !currentUser.email) {
      addNotification('Sincronização na Nuvem', 'Inicia sessão para sincronizar a tua leitura entre múltiplos dispositivos.', 'system');
      return;
    }
    setCloudSyncStatus('syncing');
    try {
      await syncUserDataToFirestore({
        id: currentUser.email,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        purchasedBookIds: currentUser.purchasedBookIds || [],
        favoriteBookIds: favoriteBookIds || [],
        readingProgressMap: readingProgressMap || {},
        bookmarks: bookmarks || [],
        highlights: highlights || []
      });
      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date());
      addNotification('Nuvem Sincronizada', 'Posição de leitura, marcadores e realces salvos no Firestore!', 'system');
    } catch (e) {
      console.error('Erro na sincronização na nuvem:', e);
      setCloudSyncStatus('error');
      addNotification('Erro de Sincronização', 'Não foi possível ligar ao Firestore.', 'system');
    }
  };

  // Force Manual Upload to Cloud (Local -> Firestore)
  const forceUploadToCloud = async (): Promise<{ success: boolean; message: string; details?: any }> => {
    if (!currentUser || !currentUser.email) {
      addNotification('Sincronização na Nuvem', 'Inicia sessão para enviar dados para o Firestore.', 'system');
      return { success: false, message: 'Nenhum utilizador com sessão iniciada.' };
    }
    const startTime = performance.now();
    setCloudSyncStatus('syncing');
    try {
      const purchasedIds = currentUser.purchasedBookIds || [];
      const favIds = favoriteBookIds || [];
      const progMap = readingProgressMap || {};
      const bkmks = bookmarks || [];
      const hlights = highlights || [];
      const totalEntities = purchasedIds.length + favIds.length + Object.keys(progMap).length + bkmks.length + hlights.length;

      await syncUserDataToFirestore({
        id: currentUser.email,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        purchasedBookIds: purchasedIds,
        favoriteBookIds: favIds,
        readingProgressMap: progMap,
        bookmarks: bkmks,
        highlights: hlights
      });

      const durationMs = Math.round(performance.now() - startTime);
      const newEntry = logSyncEvent({
        action: 'upload',
        status: 'success',
        direction: 'local_to_cloud',
        summary: `Upload manual de ${totalEntities} itens para a nuvem Firestore`,
        userEmail: currentUser.email,
        details: {
          purchasedCount: purchasedIds.length,
          favoritesCount: favIds.length,
          progressCount: Object.keys(progMap).length,
          bookmarksCount: bkmks.length,
          highlightsCount: hlights.length,
          offlinePinnedCount: pinnedOfflineBookIds.length,
          durationMs,
          totalEntities
        }
      });

      setSyncHistory(getSyncHistory());
      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date());

      playSoundEffect('success');
      triggerHapticFeedback('medium');
      addNotification(
        'Upload Manual Concluído ☁️⬆️',
        `${totalEntities} entidades sincronizadas com sucesso para o Firestore em ${formatDurationMs(durationMs)}.`,
        'system'
      );

      return {
        success: true,
        message: 'Upload manual para o Firestore concluído com sucesso!',
        details: newEntry.details
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      logSyncEvent({
        action: 'upload',
        status: 'failed',
        direction: 'local_to_cloud',
        summary: 'Falha no upload manual para o Firestore',
        userEmail: currentUser.email,
        details: {
          durationMs,
          error: err?.message || 'Erro desconhecido ao comunicar com o Firestore'
        }
      });
      setSyncHistory(getSyncHistory());
      setCloudSyncStatus('error');
      addNotification('Erro no Upload', err?.message || 'Não foi possível enviar dados para o Firestore.', 'system');
      return {
        success: false,
        message: err?.message || 'Falha ao sincronizar com o Firestore.'
      };
    }
  };

  // Force Manual Download from Cloud (Firestore -> Local)
  const forceDownloadFromCloud = async (): Promise<{ success: boolean; message: string; details?: any }> => {
    if (!currentUser || !currentUser.email) {
      addNotification('Sincronização na Nuvem', 'Inicia sessão para descarregar dados da nuvem.', 'system');
      return { success: false, message: 'Nenhum utilizador com sessão iniciada.' };
    }
    const startTime = performance.now();
    setCloudSyncStatus('syncing');
    try {
      const remoteData = await fetchUserDataFromFirestore(currentUser.email);
      const durationMs = Math.round(performance.now() - startTime);

      if (!remoteData) {
        logSyncEvent({
          action: 'download',
          status: 'warning',
          direction: 'cloud_to_local',
          summary: 'Download executado, mas nenhum documento encontrado no Firestore',
          userEmail: currentUser.email,
          details: { durationMs }
        });
        setSyncHistory(getSyncHistory());
        setCloudSyncStatus('synced');
        addNotification('Aviso da Nuvem', 'Nenhum dado remoto registado no Firestore para esta conta.', 'system');
        return {
          success: false,
          message: 'Nenhum dado remoto registado para esta conta no Firestore.'
        };
      }

      isUpdatingFromRemote.current = true;

      if (remoteData.favoriteBookIds && Array.isArray(remoteData.favoriteBookIds)) {
        setFavoriteBookIds(remoteData.favoriteBookIds);
        try {
          localStorage.setItem('zolabooks_favorites', JSON.stringify(remoteData.favoriteBookIds));
        } catch (e) {}
      }

      if (remoteData.purchasedBookIds && Array.isArray(remoteData.purchasedBookIds)) {
        setCurrentUser(prev => ({
          ...prev,
          purchasedBookIds: Array.from(new Set([...prev.purchasedBookIds, ...remoteData.purchasedBookIds]))
        }));
      }

      if (remoteData.readingProgressMap && typeof remoteData.readingProgressMap === 'object') {
        setReadingProgressMap(remoteData.readingProgressMap);
        try {
          localStorage.setItem('zolabooks_reading_progress_v1', JSON.stringify(remoteData.readingProgressMap));
        } catch (e) {}
      }

      if (remoteData.bookmarks && Array.isArray(remoteData.bookmarks)) {
        setBookmarks(remoteData.bookmarks);
        try {
          localStorage.setItem('zolabooks_bookmarks_v2', JSON.stringify(remoteData.bookmarks));
        } catch (e) {}
      }

      if (remoteData.highlights && Array.isArray(remoteData.highlights)) {
        setHighlights(remoteData.highlights);
        try {
          localStorage.setItem('zolabooks_highlights_v1', JSON.stringify(remoteData.highlights));
        } catch (e) {}
      }

      const purchasedCount = (remoteData.purchasedBookIds || []).length;
      const favoritesCount = (remoteData.favoriteBookIds || []).length;
      const progressCount = Object.keys(remoteData.readingProgressMap || {}).length;
      const bookmarksCount = (remoteData.bookmarks || []).length;
      const highlightsCount = (remoteData.highlights || []).length;
      const totalEntities = purchasedCount + favoritesCount + progressCount + bookmarksCount + highlightsCount;

      const newEntry = logSyncEvent({
        action: 'download',
        status: 'success',
        direction: 'cloud_to_local',
        summary: `Download manual de ${totalEntities} itens da nuvem Firestore`,
        userEmail: currentUser.email,
        details: {
          purchasedCount,
          favoritesCount,
          progressCount,
          bookmarksCount,
          highlightsCount,
          durationMs,
          totalEntities,
          remoteLastModified: remoteData.lastSyncedAt || new Date().toISOString()
        }
      });

      setSyncHistory(getSyncHistory());
      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date());

      setTimeout(() => {
        isUpdatingFromRemote.current = false;
      }, 300);

      playSoundEffect('success');
      triggerHapticFeedback('medium');
      addNotification(
        'Download da Nuvem Concluído ☁️⬇️',
        `${totalEntities} entidades descarregadas e aplicadas do Firestore em ${formatDurationMs(durationMs)}.`,
        'system'
      );

      return {
        success: true,
        message: 'Download da nuvem aplicado com sucesso!',
        details: newEntry.details
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      logSyncEvent({
        action: 'download',
        status: 'failed',
        direction: 'cloud_to_local',
        summary: 'Falha no download manual do Firestore',
        userEmail: currentUser.email,
        details: {
          durationMs,
          error: err?.message || 'Erro desconhecido ao descarregar do Firestore'
        }
      });
      setSyncHistory(getSyncHistory());
      setCloudSyncStatus('error');
      addNotification('Erro no Download', err?.message || 'Não foi possível descarregar do Firestore.', 'system');
      return {
        success: false,
        message: err?.message || 'Falha ao descarregar do Firestore.'
      };
    }
  };

  // Force Bidirectional Sync (Fetch Remote -> Merge -> Push Snapshot)
  const forceBidirectionalSync = async (): Promise<{ success: boolean; message: string; details?: any }> => {
    if (!currentUser || !currentUser.email) {
      addNotification('Sincronização na Nuvem', 'Inicia sessão para sincronizar dispositivos.', 'system');
      return { success: false, message: 'Nenhum utilizador com sessão iniciada.' };
    }
    const startTime = performance.now();
    setCloudSyncStatus('syncing');
    try {
      const remoteData = await fetchUserDataFromFirestore(currentUser.email);

      // Merge purchased books
      const mergedPurchased = Array.from(new Set([
        ...(currentUser.purchasedBookIds || []),
        ...(remoteData?.purchasedBookIds || [])
      ]));

      // Merge favorites
      const mergedFavorites = Array.from(new Set([
        ...(favoriteBookIds || []),
        ...(remoteData?.favoriteBookIds || [])
      ]));

      // Merge reading progress taking the latest timestamp
      const mergedProgress: Record<string, BookProgress> = { ...(readingProgressMap || {}) };
      if (remoteData?.readingProgressMap) {
        Object.entries(remoteData.readingProgressMap).forEach(([bId, rProg]) => {
          const lProg = mergedProgress[bId];
          if (!lProg || !lProg.lastReadAt || (rProg.lastReadAt && new Date(rProg.lastReadAt) >= new Date(lProg.lastReadAt))) {
            mergedProgress[bId] = rProg;
          }
        });
      }

      // Merge bookmarks
      const bkmkMap = new Map<string, Bookmark>();
      (bookmarks || []).forEach(b => bkmkMap.set(b.id, b));
      (remoteData?.bookmarks || []).forEach(b => bkmkMap.set(b.id, b));
      const mergedBookmarks = Array.from(bkmkMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Merge highlights
      const hlMap = new Map<string, Highlight>();
      (highlights || []).forEach(h => hlMap.set(h.id, h));
      (remoteData?.highlights || []).forEach(h => hlMap.set(h.id, h));
      const mergedHighlights = Array.from(hlMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Apply locally
      isUpdatingFromRemote.current = true;
      setCurrentUser(prev => ({ ...prev, purchasedBookIds: mergedPurchased }));
      setFavoriteBookIds(mergedFavorites);
      setReadingProgressMap(mergedProgress);
      setBookmarks(mergedBookmarks);
      setHighlights(mergedHighlights);

      try {
        localStorage.setItem('zolabooks_favorites', JSON.stringify(mergedFavorites));
        localStorage.setItem('zolabooks_reading_progress_v1', JSON.stringify(mergedProgress));
        localStorage.setItem('zolabooks_bookmarks_v2', JSON.stringify(mergedBookmarks));
        localStorage.setItem('zolabooks_highlights_v1', JSON.stringify(mergedHighlights));
      } catch (e) {}

      // Push reconciled snapshot back to Firestore
      await syncUserDataToFirestore({
        id: currentUser.email,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        purchasedBookIds: mergedPurchased,
        favoriteBookIds: mergedFavorites,
        readingProgressMap: mergedProgress,
        bookmarks: mergedBookmarks,
        highlights: mergedHighlights
      });

      const durationMs = Math.round(performance.now() - startTime);
      const totalEntities = mergedPurchased.length + mergedFavorites.length + Object.keys(mergedProgress).length + mergedBookmarks.length + mergedHighlights.length;

      const newEntry = logSyncEvent({
        action: 'bidirectional',
        status: 'success',
        direction: 'bidirectional',
        summary: `Sincronização bidirecional de ${totalEntities} itens concluída com reconciliação`,
        userEmail: currentUser.email,
        details: {
          purchasedCount: mergedPurchased.length,
          favoritesCount: mergedFavorites.length,
          progressCount: Object.keys(mergedProgress).length,
          bookmarksCount: mergedBookmarks.length,
          highlightsCount: mergedHighlights.length,
          offlinePinnedCount: pinnedOfflineBookIds.length,
          durationMs,
          totalEntities
        }
      });

      setSyncHistory(getSyncHistory());
      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date());

      setTimeout(() => {
        isUpdatingFromRemote.current = false;
      }, 300);

      playSoundEffect('success');
      triggerHapticFeedback('medium');
      addNotification(
        'Sincronização Bidirecional Concluída 🔄',
        `${totalEntities} entidades harmonizadas entre o dispositivo e a nuvem em ${formatDurationMs(durationMs)}.`,
        'system'
      );

      return {
        success: true,
        message: 'Sincronização bidirecional concluída com sucesso!',
        details: newEntry.details
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      logSyncEvent({
        action: 'bidirectional',
        status: 'failed',
        direction: 'bidirectional',
        summary: 'Falha na sincronização bidirecional do Firestore',
        userEmail: currentUser.email,
        details: {
          durationMs,
          error: err?.message || 'Erro desconhecido na sincronização bidirecional'
        }
      });
      setSyncHistory(getSyncHistory());
      setCloudSyncStatus('error');
      addNotification('Erro de Sincronização', err?.message || 'Falha ao sincronizar bidirecionalmente.', 'system');
      return {
        success: false,
        message: err?.message || 'Falha ao sincronizar.'
      };
    }
  };

  // Test Cloud Connection with latency benchmark
  const testCloudConnection = async (): Promise<{ success: boolean; latencyMs: number; message: string }> => {
    const startTime = performance.now();
    try {
      const connected = await testFirestoreConnection();
      const latencyMs = Math.round(performance.now() - startTime);

      if (connected) {
        logSyncEvent({
          action: 'test_connection',
          status: 'success',
          direction: 'diagnostic',
          summary: `Ligação ao Firestore validada com sucesso (${latencyMs} ms)`,
          userEmail: currentUser?.email,
          details: { durationMs: latencyMs }
        });
        setSyncHistory(getSyncHistory());
        setCloudSyncStatus('synced');
        return {
          success: true,
          latencyMs,
          message: `Ligação ao Firestore ativa e estável (${latencyMs} ms de latência).`
        };
      } else {
        logSyncEvent({
          action: 'test_connection',
          status: 'failed',
          direction: 'diagnostic',
          summary: `Sem resposta do Firestore (${latencyMs} ms)`,
          userEmail: currentUser?.email,
          details: { durationMs: latencyMs }
        });
        setSyncHistory(getSyncHistory());
        setCloudSyncStatus('offline');
        return {
          success: false,
          latencyMs,
          message: 'Não foi possível alcançar o Firestore. Verifica a tua ligação à Internet.'
        };
      }
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      logSyncEvent({
        action: 'test_connection',
        status: 'failed',
        direction: 'diagnostic',
        summary: `Erro no teste de ligação: ${err?.message || 'Falha de rede'}`,
        userEmail: currentUser?.email,
        details: { durationMs: latencyMs, error: err?.message }
      });
      setSyncHistory(getSyncHistory());
      setCloudSyncStatus('error');
      return {
        success: false,
        latencyMs,
        message: err?.message || 'Erro ao testar ligação ao Firestore.'
      };
    }
  };

  // Preview Remote Data without applying it directly
  const getRemoteSyncDataPreview = async (): Promise<UserSyncData | null> => {
    if (!currentUser?.email) return null;
    try {
      return await fetchUserDataFromFirestore(currentUser.email);
    } catch (e) {
      console.warn('Erro ao obter pré-visualização dos dados remotos:', e);
      return null;
    }
  };

  // Export User Security Backup to .json file
  const exportUserDataBackup = () => {
    try {
      const backupData: UserSecurityBackup = {
        appName: 'Zola Books',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email
        },
        data: {
          readingProgressMap: readingProgressMap || {},
          bookmarks: bookmarks || [],
          highlights: highlights || [],
          favoriteBookIds: favoriteBookIds || [],
          purchasedBookIds: currentUser.purchasedBookIds || []
        },
        stats: {
          booksWithProgressCount: Object.keys(readingProgressMap || {}).length,
          bookmarksCount: (bookmarks || []).length,
          highlightsCount: (highlights || []).length,
          favoritesCount: (favoriteBookIds || []).length,
          purchasedCount: (currentUser.purchasedBookIds || []).length
        }
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = (currentUser.name || 'leitor').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `zolabooks_backup_${safeName}_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      playSoundEffect('notification');
      triggerHapticFeedback('light');

      addNotification(
        'Backup de Segurança Exportado 💾',
        `Ficheiro .json descarregado com sucesso! Contém ${Object.keys(readingProgressMap || {}).length} progressos de leitura, ${(bookmarks || []).length} marcadores e ${(highlights || []).length} destaques.`
      );
    } catch (err) {
      console.error('Erro ao exportar backup:', err);
      addNotification('Erro no Backup', 'Não foi possível gerar o ficheiro de backup .json.', 'system');
    }
  };

  // Import User Security Backup from .json
  const importUserDataBackup = async (backupInput: string | object): Promise<{
    success: boolean;
    progressCount: number;
    bookmarksCount: number;
    highlightsCount: number;
    message: string;
  }> => {
    try {
      let parsed: any;
      if (typeof backupInput === 'string') {
        parsed = JSON.parse(backupInput);
      } else {
        parsed = backupInput;
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Ficheiro de backup inválido ou vazio.');
      }

      // Support both structured backup { data: { ... } } and flat backup { readingProgressMap, ... }
      const payload = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
      const importedProgress: Record<string, BookProgress> = payload.readingProgressMap && typeof payload.readingProgressMap === 'object' ? payload.readingProgressMap : {};
      const importedBookmarks: Bookmark[] = Array.isArray(payload.bookmarks) ? payload.bookmarks : [];
      const importedHighlights: Highlight[] = Array.isArray(payload.highlights) ? payload.highlights : [];
      const importedFavorites: string[] = Array.isArray(payload.favoriteBookIds) ? payload.favoriteBookIds : [];
      const importedPurchased: string[] = Array.isArray(payload.purchasedBookIds) ? payload.purchasedBookIds : [];

      let mergedProgress: Record<string, BookProgress> = { ...readingProgressMap };
      let mergedBookmarks: Bookmark[] = [...bookmarks];
      let mergedHighlights: Highlight[] = [...highlights];

      // Merge reading progress
      if (Object.keys(importedProgress).length > 0) {
        mergedProgress = { ...readingProgressMap, ...importedProgress };
        setReadingProgressMap(mergedProgress);
        try {
          localStorage.setItem('zolabooks_reading_progress_v1', JSON.stringify(mergedProgress));
        } catch (e) {
          console.warn('Erro ao guardar progresso no localStorage:', e);
        }
      }

      // Merge bookmarks by ID
      if (importedBookmarks.length > 0) {
        const map = new Map<string, Bookmark>();
        bookmarks.forEach(b => map.set(b.id, b));
        importedBookmarks.forEach(b => {
          if (b && b.id) map.set(b.id, b);
        });
        mergedBookmarks = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setBookmarks(mergedBookmarks);
        try {
          localStorage.setItem('zolabooks_bookmarks_v2', JSON.stringify(mergedBookmarks));
        } catch (e) {
          console.warn('Erro ao guardar marcadores no localStorage:', e);
        }
      }

      // Merge highlights by ID
      if (importedHighlights.length > 0) {
        const map = new Map<string, Highlight>();
        highlights.forEach(h => map.set(h.id, h));
        importedHighlights.forEach(h => {
          if (h && h.id) map.set(h.id, h);
        });
        mergedHighlights = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setHighlights(mergedHighlights);
        try {
          localStorage.setItem('zolabooks_highlights_v1', JSON.stringify(mergedHighlights));
        } catch (e) {
          console.warn('Erro ao guardar realces no localStorage:', e);
        }
      }

      // Merge Favorites
      if (importedFavorites.length > 0) {
        const updatedFavs = Array.from(new Set([...favoriteBookIds, ...importedFavorites]));
        setFavoriteBookIds(updatedFavs);
        try {
          localStorage.setItem('zolabooks_favorites', JSON.stringify(updatedFavs));
        } catch (e) {}
      }

      // Merge Purchased books
      if (importedPurchased.length > 0) {
        setCurrentUser(prev => ({
          ...prev,
          purchasedBookIds: Array.from(new Set([...prev.purchasedBookIds, ...importedPurchased]))
        }));
      }

      // Trigger instant push to Firestore if user is logged in
      if (currentUser?.email) {
        try {
          setCloudSyncStatus('syncing');
          await syncUserDataToFirestore({
            id: currentUser.email,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
            purchasedBookIds: Array.from(new Set([...(currentUser.purchasedBookIds || []), ...importedPurchased])),
            favoriteBookIds: Array.from(new Set([...(favoriteBookIds || []), ...importedFavorites])),
            readingProgressMap: mergedProgress,
            bookmarks: mergedBookmarks,
            highlights: mergedHighlights
          });
          setCloudSyncStatus('synced');
          setLastSyncedAt(new Date());
        } catch (syncErr) {
          console.warn('Sincronização Firestore pós-backup em modo offline:', syncErr);
        }
      }

      playSoundEffect('success');
      triggerHapticFeedback('medium');

      const progressCount = Object.keys(importedProgress).length;
      const bookmarksCount = importedBookmarks.length;
      const highlightsCount = importedHighlights.length;

      addNotification(
        'Backup Restaurado com Sucesso! 📥',
        `Importados ${progressCount} progressos de leitura, ${bookmarksCount} marcadores e ${highlightsCount} destaques com sincronização ativa.`
      );

      return {
        success: true,
        progressCount,
        bookmarksCount,
        highlightsCount,
        message: 'Backup restaurado com sucesso!'
      };
    } catch (err: any) {
      console.error('Erro ao importar backup:', err);
      addNotification('Falha ao Importar Backup', err?.message || 'Ficheiro de backup corrompido ou formato não suportado.', 'system');
      return {
        success: false,
        progressCount: 0,
        bookmarksCount: 0,
        highlightsCount: 0,
        message: err?.message || 'Erro ao processar ficheiro de backup.'
      };
    }
  };

  // Firestore Real-time synchronization
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;

    const unsubscribe = subscribeToUserSyncData(currentUser.email, (remoteData) => {
      if (remoteData) {
        isUpdatingFromRemote.current = true;

        if (remoteData.favoriteBookIds && Array.isArray(remoteData.favoriteBookIds)) {
          setFavoriteBookIds(remoteData.favoriteBookIds);
        }

        if (remoteData.purchasedBookIds && Array.isArray(remoteData.purchasedBookIds)) {
          setCurrentUser(prev => ({
            ...prev,
            purchasedBookIds: Array.from(new Set([...prev.purchasedBookIds, ...remoteData.purchasedBookIds]))
          }));
        }

        if (remoteData.readingProgressMap && typeof remoteData.readingProgressMap === 'object') {
          setReadingProgressMap(prev => {
            const merged = { ...prev };
            Object.entries(remoteData.readingProgressMap!).forEach(([bookId, remoteProg]) => {
              const localProg = prev[bookId];
              if (!localProg || !localProg.lastReadAt || (remoteProg.lastReadAt && new Date(remoteProg.lastReadAt) >= new Date(localProg.lastReadAt))) {
                merged[bookId] = remoteProg;
              }
            });
            try {
              localStorage.setItem('zolabooks_reading_progress_v1', JSON.stringify(merged));
            } catch (e) {
              console.warn('Erro ao guardar progresso remoto no localStorage:', e);
            }
            return merged;
          });
        }

        if (remoteData.bookmarks && Array.isArray(remoteData.bookmarks)) {
          setBookmarks(prev => {
            const map = new Map<string, Bookmark>();
            prev.forEach(b => map.set(b.id, b));
            remoteData.bookmarks!.forEach(b => map.set(b.id, b));
            const mergedList = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            try {
              localStorage.setItem('zolabooks_bookmarks_v2', JSON.stringify(mergedList));
            } catch (e) {
              console.warn('Erro ao guardar marcadores remotos no localStorage:', e);
            }
            return mergedList;
          });
        }

        if (remoteData.highlights && Array.isArray(remoteData.highlights)) {
          setHighlights(prev => {
            const map = new Map<string, Highlight>();
            prev.forEach(h => map.set(h.id, h));
            remoteData.highlights!.forEach(h => map.set(h.id, h));
            const mergedList = Array.from(map.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            try {
              localStorage.setItem('zolabooks_highlights_v1', JSON.stringify(mergedList));
            } catch (e) {
              console.warn('Erro ao guardar realces remotos no localStorage:', e);
            }
            return mergedList;
          });
        }

        setCloudSyncStatus('synced');
        setLastSyncedAt(new Date());

        setTimeout(() => {
          isUpdatingFromRemote.current = false;
        }, 300);
      }
    });

    return () => unsubscribe();
  }, [currentUser.email]);

  // Sync to Firestore whenever favorites, purchased books, reading progress, bookmarks, or highlights change locally
  useEffect(() => {
    if (isUpdatingFromRemote.current || !currentUser || !currentUser.email) return;

    setCloudSyncStatus('syncing');
    syncUserDataToFirestore({
      id: currentUser.email,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      purchasedBookIds: currentUser.purchasedBookIds || [],
      favoriteBookIds: favoriteBookIds || [],
      readingProgressMap: readingProgressMap || {},
      bookmarks: bookmarks || [],
      highlights: highlights || []
    }).then(() => {
      setCloudSyncStatus('synced');
      setLastSyncedAt(new Date());
    }).catch(() => {
      setCloudSyncStatus('error');
    });
  }, [favoriteBookIds, currentUser.purchasedBookIds, readingProgressMap, bookmarks, highlights, currentUser.email]);

  // Load books from backend API
  const refreshBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const apiBooks = await api.getBooks();
      if (apiBooks && apiBooks.length > 0) {
        setBooks(deduplicateBooks(apiBooks));
      }
    } catch (e) {
      console.log('Mantendo catálogo local.');
    } finally {
      setIsLoadingBooks(false);
    }
  };

  useEffect(() => {
    refreshBooks();
  }, []);

  // Format currency helper
  const formatPrice = (priceAOA: number, priceUSD?: number): string => {
    if (priceAOA === 0) return 'GRÁTIS';

    if (currency === 'AOA') {
      return `${priceAOA.toLocaleString('pt-AO')} Kz`;
    } else if (currency === 'USD') {
      const usd = priceUSD || priceAOA * INITIAL_EXCHANGE_RATE.AOA_TO_USD;
      return `$${usd.toFixed(2)}`;
    } else {
      // EUR
      const eur = (priceAOA / INITIAL_EXCHANGE_RATE.EUR_TO_AOA);
      return `€${eur.toFixed(2)}`;
    }
  };

  // Authentication Guard Helper & Actions
  const requireAuth = (reason: string, callback?: () => void): boolean => {
    if (isAuthenticated) {
      if (callback) callback();
      return true;
    }
    setAuthReasonNotice(reason);
    if (callback) {
      pendingAuthCallbackRef.current = callback;
    } else {
      pendingAuthCallbackRef.current = null;
    }
    setIsAuthModalOpen(true);
    return false;
  };

  const loginWithGoogleHandler = async () => {
    setIsAuthLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      setIsAuthModalOpen(false);
      setAuthReasonNotice(null);
      addNotification('Autenticado com Google! 🌐', `Bem-vindo, ${fbUser.displayName || fbUser.email}! Perfil sincronizado com sucesso.`);
      if (pendingAuthCallbackRef.current) {
        const cb = pendingAuthCallbackRef.current;
        pendingAuthCallbackRef.current = null;
        cb();
      }
    } catch (err: any) {
      addNotification('Erro no Login Google', err.message || 'Não foi possível autenticar com a conta Google.', 'system');
      throw err;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const resetPasswordHandler = async (email: string) => {
    try {
      await sendPasswordReset(email);
      addNotification('E-mail de Recuperação Enviado 📧', `Enviámos as instruções para redefinir a senha de ${email}.`);
    } catch (err: any) {
      addNotification('Erro de Recuperação', err.message || 'Não foi possível enviar o e-mail de recuperação.', 'system');
      throw err;
    }
  };

  const login = async (email: string, password?: string) => {
    if (password) {
      setIsAuthLoading(true);
      try {
        const fbUser = await loginWithEmail(email, password);
        setIsAuthModalOpen(false);
        setAuthReasonNotice(null);
        addNotification('Sessão Iniciada! 🔓', `Bem-vindo de volta! A tua biblioteca em nuvem foi sincronizada.`);
        if (pendingAuthCallbackRef.current) {
          const cb = pendingAuthCallbackRef.current;
          pendingAuthCallbackRef.current = null;
          cb();
        }
      } catch (err: any) {
        addNotification('Erro ao Iniciar Sessão', err.message || 'Verifique as credenciais e tente novamente.', 'system');
        throw err;
      } finally {
        setIsAuthLoading(false);
      }
    } else {
      // Demo / Guest Login fallback
      const found = usersList.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
        id: `usr-${Date.now()}`,
        name: email.includes('@') ? email.split('@')[0] : 'Leitor Zola',
        email: email.includes('@') ? email : `${email}@zolabooks.ao`,
        role: 'customer' as UserRole,
        country: 'Angola',
        affiliateCode: 'ZOLA' + Math.floor(Math.random() * 1000),
        affiliateEarningsAOA: 0,
        affiliateEarningsUSD: 0,
        purchasedBookIds: ['ZB-BK-101'],
        favoriteBookIds: ['ZB-BK-102'],
        createdAt: new Date().toISOString()
      };

      setCurrentUser(found);
      setFavoriteBookIds(found.favoriteBookIds || []);
      setIsAuthenticated(true);
      localStorage.setItem('zolabooks_is_auth', 'true');
      localStorage.setItem('zolabooks_user_email', found.email);

      setIsAuthModalOpen(false);
      setAuthReasonNotice(null);

      addNotification('Sessão Demonstrativa Iniciada! 🔓', `Bem-vindo, ${found.name}!`);

      if (pendingAuthCallbackRef.current) {
        const cb = pendingAuthCallbackRef.current;
        pendingAuthCallbackRef.current = null;
        cb();
      }
    }
  };

  const registerUser = async (userData: Partial<User> & { password?: string }) => {
    if (userData.password && userData.email) {
      setIsAuthLoading(true);
      try {
        const fbUser = await registerWithEmail(userData.email, userData.password, userData.name);
        
        const newProfile: UserSyncData = {
          id: fbUser.uid,
          name: userData.name || fbUser.displayName || 'Novo Leitor',
          email: fbUser.email || userData.email,
          role: userData.role || 'customer',
          purchasedBookIds: [],
          favoriteBookIds: [],
          readingProgressMap: {},
          bookmarks: [],
          highlights: []
        };
        await syncUserDataToFirestore(newProfile);

        setIsAuthModalOpen(false);
        setAuthReasonNotice(null);
        addNotification('Conta Criada no Firebase! 🎉', `Bem-vindo à Zola Books, ${newProfile.name}. A tua biblioteca em nuvem está ativa!`);

        if (pendingAuthCallbackRef.current) {
          const cb = pendingAuthCallbackRef.current;
          pendingAuthCallbackRef.current = null;
          cb();
        }
      } catch (err: any) {
        addNotification('Erro ao Criar Conta', err.message || 'Não foi possível registar a conta.', 'system');
        throw err;
      } finally {
        setIsAuthLoading(false);
      }
    } else {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: userData.name || 'Novo Leitor',
        email: userData.email || 'leitor@zolabooks.ao',
        phone: userData.phone || '+244 923 456 789',
        role: userData.role || 'customer',
        country: 'Angola',
        affiliateCode: 'ZOLA' + Math.floor(Math.random() * 1000),
        affiliateEarningsAOA: 0,
        affiliateEarningsUSD: 0,
        purchasedBookIds: [],
        favoriteBookIds: [],
        avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        createdAt: new Date().toISOString()
      };

      setUsersList(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setFavoriteBookIds([]);
      setIsAuthenticated(true);
      localStorage.setItem('zolabooks_is_auth', 'true');
      localStorage.setItem('zolabooks_user_email', newUser.email);

      setIsAuthModalOpen(false);
      setAuthReasonNotice(null);

      addNotification('Conta Criada com Sucesso! 🎉', `Bem-vindo à Zola Books, ${newUser.name}. A tua biblioteca em nuvem está pronta!`);

      if (pendingAuthCallbackRef.current) {
        const cb = pendingAuthCallbackRef.current;
        pendingAuthCallbackRef.current = null;
        cb();
      }
    }
  };

  const logout = () => {
    logoutFirebase();
    setIsAuthenticated(false);
    localStorage.removeItem('zolabooks_is_auth');
    localStorage.removeItem('zolabooks_user_email');
    setCurrentUser(GUEST_USER);
    setFavoriteBookIds([]);
    setIsUserProfileOpen(false);
    addNotification('Sessão Encerrada 🔐', 'Agora estás a navegar como convidado. Podes explorar o catálogo e ler amostras grátis.', 'system');
  };

  // Switch role helper
  const switchUserRole = (role: UserRole) => {
    const foundUser = usersList.find(u => u.role === role) || {
      ...currentUser,
      role
    };
    setCurrentUser(foundUser);
    setFavoriteBookIds(foundUser.favoriteBookIds || []);
    addNotification('Perfil Alterado', `Agora está a navegar no modo: ${role.toUpperCase()}`, 'system');
  };

  const updateUserProfile = (data: Partial<User>) => {
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsersList(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    addNotification('Perfil Atualizado', 'As tuas informações foram salvas com sucesso.');
  };

  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState<boolean>(false);
  const [isSoundFeedbackActive, setIsSoundFeedbackActive] = useState<boolean>(() => getIsSoundFeedbackEnabled());

  const toggleSoundFeedback = (enabled?: boolean) => {
    const nextState = enabled !== undefined ? enabled : !isSoundFeedbackActive;
    setIsSoundFeedbackActive(nextState);
    setSoundFeedbackEnabledUtil(nextState);
  };

  // Cart logic
  const addToCart = (book: Book) => {
    if (!requireAuth(`comprar "${book.title}" e adicionar ao carrinho`)) return;
    trackAddToCart(book);
    trackCartAction('add', { id: book.id, title: book.title, priceAOA: book.priceAOA });
    setCart(prev => {
      const existing = prev.find(item => item.book.id === book.id);
      if (existing) return prev;
      return [...prev, { book, quantity: 1 }];
    });
    triggerHapticFeedback('success');
    playSoundEffect('cart_add');
    addNotification('Adicionado ao Carrinho', `"${book.title}" foi adicionado ao teu carrinho.`);
  };

  const removeFromCart = (bookId: string) => {
    triggerHapticFeedback('medium');
    playSoundEffect('cart_remove');
    trackCartAction('remove', { id: bookId, title: 'Item do Carrinho' });
    setCart(prev => prev.filter(item => item.book.id !== bookId));
  };

  const clearCart = () => {
    triggerHapticFeedback('medium');
    playSoundEffect('cart_remove');
    trackCartAction('clear');
    setCart([]);
  };

  const cartSubtotalAOA = cart.reduce((sum, item) => sum + item.book.priceAOA * item.quantity, 0);
  const cartSubtotalUSD = cart.reduce((sum, item) => sum + item.book.priceUSD * item.quantity, 0);

  // Favorites & Wishlist logic
  const toggleFavorite = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    const bookTitle = book ? book.title : 'este e-book';
    if (!requireAuth(`guardar "${bookTitle}" na tua lista de desejos e biblioteca`)) return;

    triggerHapticFeedback('light');
    playSoundEffect('click');
    setFavoriteBookIds(prev => {
      const exists = prev.includes(bookId);
      const updated = exists ? prev.filter(id => id !== bookId) : [...prev, bookId];

      const book = books.find(b => b.id === bookId);
      if (book) {
        trackFavoriteToggle(book, !exists);
        if (!exists) {
          addNotification(
            'Lista de Desejos 📌',
            `"${book.title}" adicionado à tua Lista de Desejos! Alertas de redução de preço e promoções ativados.`,
            'promotion'
          );
        } else {
          addNotification(
            'Removido da Lista de Desejos',
            `"${book.title}" removido da tua lista de desejos.`
          );
        }
      }
      return updated;
    });
  };

  // Follow Author logic
  const toggleFollowAuthor = (authorName: string) => {
    setFollowedAuthors(prev => {
      const isFollowing = prev.includes(authorName);
      const updated = isFollowing ? prev.filter(a => a !== authorName) : [...prev, authorName];

      setCurrentUser(user => ({
        ...user,
        followedAuthors: updated
      }));

      addNotification(
        isFollowing ? 'Deixou de Seguir' : '🔔 A Seguir Autor!',
        isFollowing 
          ? `Deixou de seguir o autor ${authorName}.` 
          : `Agora está a seguir ${authorName}. Receberá notificações push in-app sempre que publicar um novo e-book!`,
        'system'
      );

      return updated;
    });
  };

  const clearLatestPushNotif = () => setLatestPushNotif(null);

  // Custom User Uploaded EPUB Books
  const [customEpubBooks, setCustomEpubBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('zolabooks_custom_epubs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const addCustomEpubBook = (customBook: Book) => {
    if (!requireAuth('guardar ficheiros .EPUB pessoais na tua biblioteca em nuvem')) return;
    setCustomEpubBooks(prev => {
      const updated = [customBook, ...prev.filter(b => b.id !== customBook.id)];
      try {
        localStorage.setItem('zolabooks_custom_epubs', JSON.stringify(updated));
      } catch (e) {
        console.warn('Erro ao guardar EPUB localmente:', e);
      }
      return updated;
    });
    cacheBookForOffline(customBook);
    addNotification(
      'Ficheiro .EPUB Carregado! 📚',
      `"${customBook.title}" foi processado e adicionado à tua biblioteca com ${customBook.fullContent?.chapters.length || 0} capítulos!`,
      'system'
    );
    setActiveEReaderBook(customBook);
  };

  const removeCustomEpubBook = (bookId: string) => {
    setCustomEpubBooks(prev => {
      const updated = prev.filter(b => b.id !== bookId);
      try {
        localStorage.setItem('zolabooks_custom_epubs', JSON.stringify(updated));
      } catch (e) {
        console.warn('Erro ao remover EPUB localmente:', e);
      }
      return updated;
    });
    removeOfflineCachedBook(bookId);
    addNotification('EPUB Removido', 'E-book pessoal removido da tua biblioteca.', 'system');
  };

  // User purchased books list (including uploaded EPUBs and active temporary test pass)
  const purchasedBooks = useMemo(() => {
    return deduplicateBooks([
      ...customEpubBooks,
      ...books.filter(b => {
        if (currentUser.purchasedBookIds.includes(b.id) || b.isFree) return true;
        if (activeTestPass) {
          if (!activeTestPass.bookId || activeTestPass.bookId === 'all' || activeTestPass.bookId === b.id) {
            return true;
          }
        }
        return false;
      })
    ]);
  }, [customEpubBooks, books, currentUser.purchasedBookIds, activeTestPass]);

  // Direct 1-Click Free Book Claim to User's Library
  const claimFreeBook = async (book: Book): Promise<boolean> => {
    if (!book || !book.id) return false;

    // Prompt authentication if not logged in
    if (!requireAuth(`adicionar o e-book gratuito "${book.title}" à tua biblioteca permanente`, () => claimFreeBook(book))) {
      return false;
    }

    // Check if already claimed / present in user list
    if (currentUser.purchasedBookIds.includes(book.id)) {
      addNotification(
        'E-book já na Biblioteca 📚',
        `"${book.title}" já faz parte da tua biblioteca permanente. Podes abri-lo para leitura a qualquer momento.`
      );
      return true;
    }

    const updatedPurchasedIds = [book.id, ...currentUser.purchasedBookIds];
    const updatedUser: User = {
      ...currentUser,
      purchasedBookIds: updatedPurchasedIds
    };

    setCurrentUser(updatedUser);
    setUsersList(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));

    // Sync directly to Firestore
    try {
      await syncUserDataToFirestore({
        id: currentUser.email,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        purchasedBookIds: updatedPurchasedIds,
        favoriteBookIds: favoriteBookIds,
        readingProgressMap: readingProgressMap,
        bookmarks: bookmarks,
        highlights: highlights
      });
    } catch (e) {
      console.warn('Erro ao sincronizar aquisição de livro gratuito no Firestore:', e);
    }

    // Sensory Feedback: Sound & Haptic
    playSoundEffect('success');
    triggerHapticFeedback('medium');

    // In-App Notification
    addNotification(
      'Livro Gratuito Adicionado! 🎉',
      `"${book.title}" foi adicionado com sucesso à tua biblioteca pessoal. Podes ler agora sem restrições ou custos!`,
      'promotion'
    );

    return true;
  };

  // Add new book to catalog
  const addBookToCatalog = async (newBookData: Partial<Book>): Promise<Book> => {
    const created = await api.createBook(newBookData);
    setBooks(prev => deduplicateBooks([created, ...prev]));

    const authorName = created.author || 'Autor Zola';

    // System Notification
    addNotification('E-book Publicado!', `"${created.title}" foi publicado com sucesso no catálogo Zola Books.`);

    // Check if the current user (or any reader) follows this author to trigger Instant Push Notification
    if (followedAuthors.includes(authorName) || true) { // Always trigger push for followers
      const pushTitle = `🔔 NOVO E-BOOK: ${authorName} publicou "${created.title}"!`;
      const pushMsg = `O autor ${authorName} que você segue acabou de lançar o e-book "${created.title}". Clique para explorar a obra em exclusivo!`;

      // Add promotion notification
      addNotification(pushTitle, pushMsg, 'promotion');

      // Trigger Floating Push Notification Toast Banner across the UI
      setLatestPushNotif({
        title: pushTitle,
        message: pushMsg,
        author: authorName,
        book: created
      });
    }

    return created;
  };

  // Seller Sales & Real-time Notification Management
  const clearLatestSellerSalePush = () => {
    setLatestSellerSalePush(null);
  };

  const markSellerSaleAsRead = (saleId: string) => {
    setSellerSales(prev => prev.map(s => (s.id === saleId ? { ...s, read: true } : s)));
  };

  const clearAllSellerSales = () => {
    setSellerSales([]);
    try {
      localStorage.removeItem('zolabooks_seller_sales');
    } catch {
      // ignore
    }
  };

  const triggerSellerSaleNotification = (
    saleData: Partial<SellerSaleNotification> & { bookId: string; bookTitle: string; amountAOA: number; amountUSD: number }
  ): SellerSaleNotification => {
    const nowObj = new Date();
    const formattedDate = `${String(nowObj.getDate()).padStart(2, '0')}/${String(nowObj.getMonth() + 1).padStart(2, '0')}/${nowObj.getFullYear()}`;
    const formattedTime = nowObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const matchingBook = books.find(b => b.id === saleData.bookId);

    const newSale: SellerSaleNotification = {
      id: saleData.id || `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: saleData.orderId || `ZB-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      bookId: saleData.bookId,
      bookTitle: saleData.bookTitle,
      bookCover: saleData.bookCover || matchingBook?.coverImage,
      author: saleData.author || matchingBook?.author || 'Autor Zola',
      sellerId: saleData.sellerId || matchingBook?.sellerId || currentUser.id,
      sellerName: saleData.sellerName || matchingBook?.publisher || currentUser.name,
      amountAOA: saleData.amountAOA,
      amountUSD: saleData.amountUSD,
      currencyPaid: saleData.currencyPaid || 'AOA',
      amountPaid: saleData.amountPaid ?? saleData.amountAOA,
      buyerName: saleData.buyerName || 'Leitor Zola Books',
      buyerEmail: saleData.buyerEmail || 'leitor@zolabooks.ao',
      date: saleData.date || formattedDate,
      time: saleData.time || formattedTime,
      timestamp: nowObj.toISOString(),
      paymentMethod: saleData.paymentMethod || 'multicaixa_express',
      paymentStatus: saleData.paymentStatus || 'completed',
      paymentReference: saleData.paymentReference || `MCX-${Math.floor(1000000 + Math.random() * 9000000)}-AO`,
      read: false,
      notifiedAt: nowObj.toISOString()
    };

    setSellerSales(prev => [newSale, ...prev]);
    setLatestSellerSalePush(newSale);
    playSoundEffect('sale');
    triggerHapticFeedback('success');

    // Add to unified notifications for the top bell
    addNotification(
      `🎉 Nova Venda: "${newSale.bookTitle}"`,
      `Venda de ${formatPrice(newSale.amountAOA, newSale.amountUSD)} recebida de ${newSale.buyerName}. Estado: ${newSale.paymentStatus === 'completed' ? 'Confirmado' : 'Pendente'}.`,
      'royalties'
    );

    return newSale;
  };

  const simulateTestSellerSale = (targetBookId?: string): SellerSaleNotification => {
    const chosenBook = (targetBookId ? books.find(b => b.id === targetBookId) : null) || 
      books.find(b => b.author.toLowerCase().includes(currentUser.name.toLowerCase()) || b.sellerId === currentUser.id) ||
      books[0] || 
      MOCK_BOOKS[0];

    const testBuyers = [
      { name: 'Kalandula Manuel Neto', email: 'kalandula.neto@angola.ao' },
      { name: 'Esperança Luísa Benguela', email: 'esperanca.leitora@gmail.com' },
      { name: 'Sérgio António da Silva', email: 'sergio.silva@luandabooks.ao' },
      { name: 'Maria Inês Ferreira', email: 'maria.ines.leitora@globalbooks.com' },
      { name: 'John Miller (EUA)', email: 'john.reader@international.com' }
    ];
    const randomBuyer = testBuyers[Math.floor(Math.random() * testBuyers.length)];
    const orderId = `ZB-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowObj = new Date();
    const formattedDate = `${String(nowObj.getDate()).padStart(2, '0')}/${String(nowObj.getMonth() + 1).padStart(2, '0')}/${nowObj.getFullYear()}`;
    const formattedTime = nowObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newSaleNotif: SellerSaleNotification = {
      id: `SALE-SIM-${Date.now()}`,
      orderId,
      bookId: chosenBook.id,
      bookTitle: chosenBook.title,
      bookCover: chosenBook.coverImage,
      author: chosenBook.author,
      sellerId: chosenBook.sellerId || currentUser.id,
      sellerName: chosenBook.publisher || currentUser.name,
      amountAOA: chosenBook.priceAOA,
      amountUSD: chosenBook.priceUSD,
      currencyPaid: 'AOA',
      amountPaid: chosenBook.priceAOA,
      buyerName: randomBuyer.name,
      buyerEmail: randomBuyer.email,
      date: formattedDate,
      time: formattedTime,
      timestamp: nowObj.toISOString(),
      paymentMethod: 'multicaixa_express',
      paymentStatus: 'completed',
      paymentReference: `MCX-${Math.floor(1000000 + Math.random() * 9000000)}-AO`,
      read: false,
      notifiedAt: nowObj.toISOString()
    };

    // Also add simulated order to orders state so it is 100% synchronized
    const simOrder: Order = {
      id: orderId,
      userId: `ZB-USR-TEST-${Math.floor(100 + Math.random() * 900)}`,
      userName: randomBuyer.name,
      userEmail: randomBuyer.email,
      items: [{
        bookId: chosenBook.id,
        bookTitle: chosenBook.title,
        price: chosenBook.priceAOA,
        currency: 'AOA'
      }],
      totalAOA: chosenBook.priceAOA,
      totalUSD: chosenBook.priceUSD,
      currencyPaid: 'AOA',
      amountPaid: chosenBook.priceAOA,
      paymentMethod: 'multicaixa_express',
      paymentStatus: 'completed',
      paymentReference: newSaleNotif.paymentReference,
      discountAmount: 0,
      createdAt: `${formattedDate} ${formattedTime}`,
      downloadToken: `TOK-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setOrders(prev => [simOrder, ...prev]);
    setSellerSales(prev => [newSaleNotif, ...prev]);
    setLatestSellerSalePush(newSaleNotif);
    playSoundEffect('sale');
    triggerHapticFeedback('success');

    addNotification(
      `🎉 Nova Venda Confirmada: "${chosenBook.title}"`,
      `Venda de ${formatPrice(chosenBook.priceAOA, chosenBook.priceUSD)} efetuada para ${randomBuyer.name} via Multicaixa Express. Registada no Painel do Vendedor.`,
      'royalties'
    );

    return newSaleNotif;
  };

  // Create Order & process
  const createNewOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const createdOrder = await api.createOrder(orderData);
    setOrders(prev => [createdOrder, ...prev]);

    trackPurchase({
      id: createdOrder.id,
      amountAOA: createdOrder.totalAOA,
      paymentMethod: createdOrder.paymentMethod,
      items: createdOrder.items.map(i => ({
        bookId: i.bookId,
        bookTitle: i.bookTitle,
        price: i.price
      }))
    });

    // Generate real-time seller sale notifications for every book in the order
    const nowObj = new Date();
    const formattedDate = `${String(nowObj.getDate()).padStart(2, '0')}/${String(nowObj.getMonth() + 1).padStart(2, '0')}/${nowObj.getFullYear()}`;
    const formattedTime = nowObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newSalesForSellers: SellerSaleNotification[] = createdOrder.items.map((item, idx) => {
      const matchingBook = books.find(b => b.id === item.bookId);
      const calculatedAOA = createdOrder.currencyPaid === 'AOA' ? item.price : Math.round(item.price * 930);
      const calculatedUSD = createdOrder.currencyPaid === 'USD' ? item.price : Number((item.price / 930).toFixed(2));

      return {
        id: `SALE-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        orderId: createdOrder.id,
        bookId: item.bookId,
        bookTitle: item.bookTitle,
        bookCover: matchingBook?.coverImage,
        author: matchingBook?.author || 'Autor Zola Books',
        sellerId: matchingBook?.sellerId,
        sellerName: matchingBook?.publisher || matchingBook?.author || 'Editora Parceira Zola',
        amountAOA: calculatedAOA,
        amountUSD: calculatedUSD,
        currencyPaid: createdOrder.currencyPaid,
        amountPaid: item.price,
        buyerName: createdOrder.userName,
        buyerEmail: createdOrder.userEmail,
        date: formattedDate,
        time: formattedTime,
        timestamp: nowObj.toISOString(),
        paymentMethod: createdOrder.paymentMethod,
        paymentStatus: createdOrder.paymentStatus,
        paymentReference: createdOrder.paymentReference,
        read: false,
        notifiedAt: nowObj.toISOString()
      };
    });

    if (newSalesForSellers.length > 0) {
      setSellerSales(prev => [...newSalesForSellers, ...prev]);
      // Pop up the top sale
      setLatestSellerSalePush(newSalesForSellers[0]);
      playSoundEffect('sale');

      newSalesForSellers.forEach(sale => {
        addNotification(
          `🎉 Nova Venda: "${sale.bookTitle}"`,
          `Venda de ${formatPrice(sale.amountAOA, sale.amountUSD)} recebida de ${sale.buyerName} (${sale.paymentMethod.replace('_', ' ').toUpperCase()}).`,
          'royalties'
        );
      });
    }

    if (createdOrder.paymentStatus === 'completed') {
      // Add books to current user's purchased list
      const newBookIds = createdOrder.items.map(i => i.bookId);
      setCurrentUser(prev => ({
        ...prev,
        purchasedBookIds: Array.from(new Set([...prev.purchasedBookIds, ...newBookIds]))
      }));
      clearCart();
    }

    playSoundEffect('success');
    addNotification(
      'Pedido Efetuado!',
      `Pedido ${createdOrder.id} efetuado com sucesso via ${createdOrder.paymentMethod.replace('_', ' ').toUpperCase()}.`
    );

    return createdOrder;
  };

  // Approve IBAN payment by Admin
  const approveIbanPayment = async (orderId: string) => {
    const updated = await api.approveIbanPayment(orderId);
    setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));

    // Update seller sales status to completed
    setSellerSales(prev => prev.map(s => {
      if (s.orderId === orderId) {
        return { ...s, paymentStatus: 'completed' };
      }
      return s;
    }));

    // Update user if online
    if (updated.userId === currentUser.id) {
      const newBookIds = updated.items.map(i => i.bookId);
      setCurrentUser(prev => ({
        ...prev,
        purchasedBookIds: Array.from(new Set([...prev.purchasedBookIds, ...newBookIds]))
      }));
    }

    addNotification('Aprovação IBAN', `O pagamento do pedido ${orderId} foi confirmado e os e-books foram libertados.`);
  };

  // Toast notification
  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'system') => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      read: false,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Book Clubs State & Handlers
  const [bookClubs, setBookClubs] = useState<BookClub[]>(INITIAL_BOOK_CLUBS);

  const joinBookClub = (clubId: string) => {
    setBookClubs(prev => prev.map(club => {
      if (club.id === clubId) {
        return {
          ...club,
          isJoined: true,
          membersCount: club.isJoined ? club.membersCount : club.membersCount + 1
        };
      }
      return club;
    }));
    addNotification('Clube de Leitura 📚', 'Agora fazes parte deste clube! Receberás atualizações das discussões.');
  };

  const leaveBookClub = (clubId: string) => {
    setBookClubs(prev => prev.map(club => {
      if (club.id === clubId) {
        return {
          ...club,
          isJoined: false,
          membersCount: Math.max(0, club.membersCount - 1)
        };
      }
      return club;
    }));
  };

  const addDiscussionToClub = (clubId: string, discussionData: Partial<BookClubDiscussion>) => {
    const newDisc: BookClubDiscussion = {
      id: `disc-${Date.now()}`,
      clubId,
      authorName: currentUser.name || 'Leitor Zola',
      authorAvatar: currentUser.avatarUrl,
      authorRole: currentUser.role === 'admin' ? 'Moderador' : currentUser.role === 'author' ? 'Autor' : 'Leitor',
      title: discussionData.title || 'Novo Debate',
      content: discussionData.content || '',
      bookId: discussionData.bookId,
      chapterRef: discussionData.chapterRef,
      date: 'Agora mesmo',
      likes: 1,
      likedByCurrentUser: true,
      comments: []
    };

    setBookClubs(prev => prev.map(club => {
      if (club.id === clubId) {
        return {
          ...club,
          discussions: [newDisc, ...club.discussions]
        };
      }
      return club;
    }));
  };

  const addCommentToDiscussion = (clubId: string, discussionId: string, text: string) => {
    const newComm: BookClubComment = {
      id: `comm-${Date.now()}`,
      authorName: currentUser.name || 'Leitor Zola',
      authorAvatar: currentUser.avatarUrl,
      authorRole: currentUser.role === 'admin' ? 'Moderador' : currentUser.role === 'author' ? 'Autor' : 'Leitor',
      text,
      date: 'Agora mesmo',
      likes: 0
    };

    setBookClubs(prev => prev.map(club => {
      if (club.id === clubId) {
        return {
          ...club,
          discussions: club.discussions.map(disc => {
            if (disc.id === discussionId) {
              return {
                ...disc,
                comments: [...disc.comments, newComm]
              };
            }
            return disc;
          })
        };
      }
      return club;
    }));
  };

  const toggleLikeDiscussion = (clubId: string, discussionId: string) => {
    setBookClubs(prev => prev.map(club => {
      if (club.id === clubId) {
        return {
          ...club,
          discussions: club.discussions.map(disc => {
            if (disc.id === discussionId) {
              const currentlyLiked = disc.likedByCurrentUser;
              return {
                ...disc,
                likedByCurrentUser: !currentlyLiked,
                likes: currentlyLiked ? Math.max(0, disc.likes - 1) : disc.likes + 1
              };
            }
            return disc;
          })
        };
      }
      return club;
    }));
  };

  const createNewBookClub = (clubData: Partial<BookClub>) => {
    const newClubId = `club-custom-${Date.now()}`;
    const newClub: BookClub = {
      id: newClubId,
      name: clubData.name || 'Novo Clube',
      tagline: clubData.tagline || 'Comunidade de leitores ativos na Zola Books',
      description: clubData.description || 'Discussão e leitura partilhada.',
      type: clubData.type || 'genre',
      targetCategoryOrAuthor: clubData.targetCategoryOrAuthor || 'Literatura Angolana',
      coverImage: clubData.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
      avatarIcon: clubData.avatarIcon || '📚',
      membersCount: 1,
      isJoined: true,
      currentBookId: clubData.currentBookId || books[0]?.id || 'ZB-BK-101',
      meetingSchedule: clubData.meetingSchedule || 'Aos Sábados às 18:00',
      tags: clubData.tags || ['ZolaBooks', 'Comunidade'],
      moderatorName: currentUser.name || 'Você',
      moderatorAvatar: currentUser.avatarUrl,
      discussions: [
        {
          id: `disc-init-${Date.now()}`,
          clubId: newClubId,
          authorName: currentUser.name || 'Você',
          authorAvatar: currentUser.avatarUrl,
          authorRole: 'Moderador',
          title: `📌 Boas-vindas ao ${clubData.name || 'Novo Clube'}!`,
          content: 'Sejam bem-vindos ao nosso clube de leitura! Deixem as vossas apresentações e ideias de tópicos para discutirmos.',
          date: 'Agora mesmo',
          likes: 1,
          likedByCurrentUser: true,
          isPinned: true,
          comments: []
        }
      ]
    };

    setBookClubs(prev => [newClub, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        books,
        isLoadingBooks,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedTag,
        setSelectedTag,
        availableTags,
        refreshBooks,
        addBookToCatalog,

        currency,
        setCurrency,
        formatPrice,

        currentUser,
        isAuthenticated,
        isAuthLoading,
        authReasonNotice,
        setAuthReasonNotice,
        requireAuth,
        login,
        registerUser,
        loginWithGoogleHandler,
        resetPasswordHandler,
        logout,
        switchUserRole,
        usersList,
        updateUserProfile,
        isUserProfileOpen,
        setIsUserProfileOpen,

        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartSubtotalAOA,
        cartSubtotalUSD,

        favoriteBookIds,
        toggleFavorite,
        purchasedBooks,
        claimFreeBook,
        customEpubBooks,
        addCustomEpubBook,
        removeCustomEpubBook,

        followedAuthors,
        toggleFollowAuthor,
        latestPushNotif,
        clearLatestPushNotif,

        activeView,
        setActiveView,

        selectedBookModal,
        setSelectedBookModal,
        selectedAuthorModal,
        setSelectedAuthorModal,
        activeEReaderBook,
        setActiveEReaderBook,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isZolaAIOpen,
        setIsZolaAIOpen,
        isSupportWhatsAppOpen,
        setIsSupportWhatsAppOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAppDownloadModalOpen,
        setIsAppDownloadModalOpen,
        isAndroid15ModalOpen,
        setIsAndroid15ModalOpen,
        isRoadmapModalOpen,
        setIsRoadmapModalOpen,
        isTestLinkModalOpen,
        setIsTestLinkModalOpen,
        testLinkDefaultBook,
        openTestLinkModal,
        activeTestPass,
        setActiveTestPass,
        isReadingReportModalOpen,
        setIsReadingReportModalOpen,
        isDeviceSyncModalOpen,
        setIsDeviceSyncModalOpen,

        orders,
        createNewOrder,
        approveIbanPayment,

        sellerSales,
        latestSellerSalePush,
        clearLatestSellerSalePush,
        triggerSellerSaleNotification,
        simulateTestSellerSale,
        markSellerSaleAsRead,
        clearAllSellerSales,

        notifications,
        addNotification,
        dismissNotification,
        triggerDailyReadingReminderNotification,

        theme,
        toggleTheme,

        isOnline,
        offlineBooks,
        downloadingBookIds,
        downloadBookForOffline,
        removeBookFromOffline,
        clearAllOfflineBooks,
        isBookOfflineCached,
        isBookDownloading,

        pinnedOfflineBookIds,
        isBookPinnedOffline,
        togglePinBookForOffline,
        setBookPinnedOffline,
        androidStorageSettings,
        updateAndroidStorageSettings,
        cleanUnpinnedOfflineCache,
        requestDevicePersistentStorage,
        isPersistentStorageGranted,
        deviceStorageEstimate,
        refreshStorageEstimate,
        pinAndDownloadAllPurchased,

        bookClubs,
        joinBookClub,
        leaveBookClub,
        addDiscussionToClub,
        addCommentToDiscussion,
        toggleLikeDiscussion,
        createNewBookClub,

        isAccessibilityModalOpen,
        setIsAccessibilityModalOpen,
        isSoundFeedbackActive,
        toggleSoundFeedback,

        readingProgressMap,
        updateBookProgress,
        getBookProgress,

        bookmarks,
        addBookmark,
        removeBookmark,
        updateBookmarkNote,
        toggleChapterBookmark,
        isChapterBookmarked,
        getBookmarksForBook,

        highlights,
        addHighlight,
        removeHighlight,
        updateHighlightNote,
        getHighlightsForBook,

        cloudSyncStatus,
        lastSyncedAt,
        syncHistory,
        triggerCloudSync,
        forceUploadToCloud,
        forceDownloadFromCloud,
        forceBidirectionalSync,
        testCloudConnection,
        clearSyncHistoryLog,
        getRemoteSyncDataPreview,

        exportUserDataBackup,
        importUserDataBackup
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
};
