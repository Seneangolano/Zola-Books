import { Book, Order, Review, Coupon } from '../types';

export const api = {
  // Books
  async getBooks(params?: { category?: string; search?: string; isAngolan?: boolean; isFree?: boolean }): Promise<Book[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.isAngolan) query.append('isAngolan', 'true');
      if (params?.isFree) query.append('isFree', 'true');

      const res = await fetch(`/api/books?${query.toString()}`);
      if (!res.ok) throw new Error('Falha ao carregar livros');
      const data = await res.json();
      return data.books;
    } catch (err) {
      console.warn('Usando fallback local para livros:', err);
      return [];
    }
  },

  async createBook(bookData: Partial<Book>): Promise<Book> {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao publicar livro');
    return data.book;
  },

  // Orders
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao processar pedido');
    return data.order;
  },

  async approveIbanPayment(orderId: string): Promise<Order> {
    const res = await fetch(`/api/orders/${orderId}/approve-iban`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao aprovar IBAN');
    return data.order;
  },

  // Coupons
  async validateCoupon(code: string): Promise<Coupon> {
    const res = await fetch(`/api/coupons/validate/${code}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Cupom inválido');
    return data.coupon;
  },

  // Reviews
  async getReviews(bookId: string): Promise<Review[]> {
    const res = await fetch(`/api/reviews/${bookId}`);
    const data = await res.json();
    return data.reviews || [];
  },

  async addReview(review: Partial<Review>): Promise<Review> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Erro ao guardar avaliação');
    return data.review;
  },

  // Payments: Stripe & Multicaixa
  async processStripePayment(payload: {
    items: any[];
    userEmail: string;
    userName: string;
    totalUSD: number;
  }): Promise<any> {
    const res = await fetch('/api/checkout/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao processar cartão com Stripe');
    return data;
  },

  async processMulticaixaPayment(payload: {
    phoneNumber: string;
    amountAOA: number;
    userEmail: string;
    userName: string;
    items: any[];
  }): Promise<any> {
    const res = await fetch('/api/checkout/multicaixa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao emitir notificação Multicaixa Express');
    return data;
  },

  async generateMulticaixaReference(payload: {
    amountAOA: number;
    userEmail: string;
    userName: string;
    items: any[];
  }): Promise<{
    success: boolean;
    entityId: string;
    reference: string;
    amountAOA: number;
    expiresAt: string;
    status: string;
    message: string;
  }> {
    const res = await fetch('/api/checkout/multicaixa-reference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao gerar Código de Referência Multicaixa');
    return data;
  },

  // AI Gemini
  async askZolaAI(userPrompt: string, favoriteBookIds: string[] = [], purchasedBookIds: string[] = []): Promise<string> {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPrompt, favoriteBookIds, purchasedBookIds })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao consultar a Zola IA');
    return data.answer;
  },

  async getRecommendationsAI(
    favoriteBookIds: string[] = [],
    purchasedBookIds: string[] = [],
    customPrompt: string = ''
  ): Promise<{ recommendation: string; profileAnalyzed: { favoritesCount: number; historyCount: number } }> {
    const res = await fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favoriteBookIds, purchasedBookIds, customPrompt })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Falha ao gerar recomendações com a Zola IA');
    return {
      recommendation: data.recommendation,
      profileAnalyzed: data.profileAnalyzed || { favoritesCount: favoriteBookIds.length, historyCount: purchasedBookIds.length }
    };
  },

  async getAuthorBlurbAI(title: string, genre: string, rawNotes: string): Promise<string> {
    const res = await fetch('/api/ai/author-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, genre, rawNotes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao gerar texto com IA');
    return data.result;
  },

  async getBookSummaryAI(bookTitle: string, author: string): Promise<string> {
    const res = await fetch('/api/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookTitle, author })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao obter resumo');
    return data.summary;
  },

  // Backup & Restore
  async exportBackup(): Promise<any> {
    const res = await fetch('/api/backup/export');
    return await res.json();
  },

  async restoreBackup(backupData: any): Promise<boolean> {
    const res = await fetch('/api/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: backupData })
    });
    const data = await res.json();
    return data.success;
  }
};
