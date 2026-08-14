import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { Book, User, CartItem, Currency, Order, UserRole, AppNotification, BookClub, BookClubDiscussion, BookClubComment, BookProgress, Bookmark, Highlight, HighlightColor } from '../types';
import { MOCK_BOOKS, INITIAL_USERS, INITIAL_EXCHANGE_RATE, INITIAL_ORDERS } from '../data/mockData';
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
  registerServiceWorker, 
  getOfflineCachedBooks, 
  cacheBookForOffline, 
  removeOfflineCachedBook, 
  clearAllOfflineCachedBooks,
  isBookCachedOffline,
  setupNetworkListeners 
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

  // Orders
  orders: Order[];
  createNewOrder: (orderData: Partial<Order>) => Promise<Order>;
  approveIbanPayment: (orderId: string) => Promise<void>;

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

  // Cloud Sync (Firestore)
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: Date | null;
  triggerCloudSync: () => Promise<void>;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
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

    // Listen to network online/offline events
    const cleanupNetwork = setupNetworkListeners((onlineStatus) => {
      setIsOnline(onlineStatus);
      if (!onlineStatus) {
        addNotification(
          'Modo Offline Ativado 📶',
          'Estás sem ligação à internet. A tua biblioteca e livros descarregados continuam 100% disponíveis para leitura!',
          'system'
        );
      } else {
        addNotification(
          'Ligação Restabelecida 🌐',
          'Ligado à internet! Sincronização em nuvem reativada.',
          'system'
        );
      }
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
        setBooks(apiBooks);
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
  const purchasedBooks = [
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
  ];

  // Add new book to catalog
  const addBookToCatalog = async (newBookData: Partial<Book>): Promise<Book> => {
    const created = await api.createBook(newBookData);
    setBooks(prev => [created, ...prev]);

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

        orders,
        createNewOrder,
        approveIbanPayment,

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
        triggerCloudSync
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
