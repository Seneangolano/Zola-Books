export type UserRole = 'customer' | 'author' | 'seller' | 'admin';

export type Currency = 'AOA' | 'USD' | 'EUR';

export type BookFormat = 'PDF' | 'EPUB' | 'AUDIOBOOK';

export interface Book {
  id: string; // e.g. ZB-BK-101
  title: string;
  subtitle?: string;
  author: string;
  authorId?: string;
  sellerId?: string;
  coverImage: string;
  priceAOA: number; // e.g. 4500 Kz
  priceUSD: number; // e.g. 5.00 $
  rating: number;
  reviewCount: number;
  category: string;
  language: 'Português' | 'Inglês' | 'Francês';
  pageCount: number;
  publisher: string;
  publishedYear: number;
  isbn: string;
  description: string;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isAngolanAuthor?: boolean;
  isFree?: boolean;
  isFlashSale?: boolean;
  isNewRelease?: boolean;
  originalPriceAOA?: number;
  originalPriceUSD?: number;
  discountPercentage?: number;
  flashSaleEndsAt?: string;
  sampleContent?: {
    chapters: { title: string; content: string }[];
  };
  fullContent?: {
    chapters: { title: string; content: string }[];
  };
  fileSizeMb: number;
  downloadUrl?: string;
  tags: string[];
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Review {
  id: string;
  bookId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
  likes: number;
}

export interface DailyReminderSettings {
  enabled: boolean;
  time: string; // e.g. "20:00"
  goalMinutes: number; // e.g. 20
  customMessage?: string;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  pushNotificationsEnabled: boolean;
  soundEnabled: boolean;
  lastTriggeredDate?: string;
}

export interface BookProgress {
  bookId: string;
  percentage: number; // 0 to 100
  currentChapterIndex: number;
  totalChapters: number;
  lastReadAt: string;
  scrollPosition?: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover?: string;
  bookAuthor?: string;
  chapterIndex: number;
  chapterTitle: string;
  snippet?: string;
  note?: string;
  createdAt: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

export interface Highlight {
  id: string;
  bookId: string;
  bookTitle?: string;
  chapterIndex: number;
  chapterTitle?: string;
  text: string;
  color: HighlightColor;
  note?: string;
  createdAt: string;
}

export interface User {
  id: string; // e.g. ZB-USR-201
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  country: string;
  affiliateCode: string;
  affiliateEarningsAOA: number;
  affiliateEarningsUSD: number;
  purchasedBookIds: string[];
  favoriteBookIds: string[];
  followedAuthors?: string[];
  readingProgressMap?: Record<string, BookProgress>;
  dailyReminderSettings?: DailyReminderSettings;
  createdAt: string;
}

export type PaymentMethod = 
  | 'multicaixa_express' 
  | 'mcx_reference'
  | 'bai_directo' 
  | 'unitel_money' 
  | 'iban_transfer' 
  | 'stripe_card' 
  | 'paypal';

export interface Order {
  id: string; // e.g. ZB-ORD-8921
  userId: string;
  userName: string;
  userEmail: string;
  items: {
    bookId: string;
    bookTitle: string;
    price: number;
    currency: Currency;
  }[];
  totalAOA: number;
  totalUSD: number;
  currencyPaid: Currency;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'awaiting_iban_proof';
  paymentReference?: string;
  ibanProofUrl?: string;
  couponApplied?: string;
  discountAmount: number;
  createdAt: string;
  downloadToken: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  minAmountAOA?: number;
  validUntil: string;
  usageCount: number;
  active: boolean;
}

export interface AffiliateRecord {
  id: string;
  affiliateCode: string;
  referredUserName: string;
  bookTitle: string;
  orderTotalAOA: number;
  commissionAOA: number;
  date: string;
  status: 'pending' | 'paid';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'royalties' | 'promotion';
  read: boolean;
  date: string;
}

export interface SalesReport {
  totalSalesAOA: number;
  totalSalesUSD: number;
  totalOrders: number;
  totalBooksSold: number;
  topSellingBooks: { bookTitle: string; count: number; totalAOA: number }[];
  monthlyRevenue: { month: string; AOA: number; USD: number }[];
}

export interface BookClubComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  text: string;
  date: string;
  likes: number;
}

export interface BookClubDiscussion {
  id: string;
  clubId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: 'Leitor' | 'Autor' | 'Moderador' | 'Zola IA';
  title: string;
  content: string;
  bookId?: string;
  chapterRef?: string;
  date: string;
  likes: number;
  likedByCurrentUser?: boolean;
  comments: BookClubComment[];
  isPinned?: boolean;
}

export interface BookClub {
  id: string;
  name: string;
  tagline: string;
  description: string;
  type: 'genre' | 'author';
  targetCategoryOrAuthor: string;
  coverImage: string;
  avatarIcon?: string;
  membersCount: number;
  isJoined?: boolean;
  currentBookId: string;
  meetingSchedule: string;
  tags: string[];
  moderatorName: string;
  moderatorAvatar?: string;
  discussions: BookClubDiscussion[];
}
