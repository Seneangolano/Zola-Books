import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { 
  X, 
  Star, 
  ShoppingBag, 
  BookOpen, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Share2, 
  ShieldCheck, 
  Check, 
  Award,
  ThumbsUp,
  Send,
  Bell,
  UserCheck,
  UserPlus,
  Flame,
  Clock,
  Zap,
  ArrowRight,
  Key,
  Gift,
  Download
} from 'lucide-react';
import { Book, Review } from '../types';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { getOptimizedBookCover } from '../lib/imageOptimizer';
import { BookPriceComparisonSection } from './BookPriceComparisonSection';

interface BookDetailModalProps {
  book: Book;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const {
    books,
    setSelectedBookModal,
    cart,
    formatPrice,
    favoriteBookIds,
    toggleFavorite,
    addToCart,
    setActiveEReaderBook,
    purchasedBooks,
    claimFreeBook,
    setIsCartOpen,
    currentUser,
    addNotification,
    followedAuthors,
    toggleFollowAuthor,
    setSelectedTag,
    setActiveView,
    openTestLinkModal
  } = useApp();

  const [activeBook, setActiveBook] = useState<Book>(book);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  // New review state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    setActiveBook(book);
  }, [book]);

  const isFavorite = favoriteBookIds.includes(activeBook.id);
  const isPurchased = purchasedBooks.some(b => b.id === activeBook.id);

  // Automatically filter books array for other titles by the same author
  const otherBooksByAuthor = useMemo(() => {
    return books.filter(
      (b) =>
        b.author.toLowerCase().trim() === activeBook.author.toLowerCase().trim() &&
        b.id !== activeBook.id
    );
  }, [books, activeBook.author, activeBook.id]);

  // Fallback category books if the author has only 1 title currently registered
  const categoryFallbackBooks = useMemo(() => {
    return books.filter(
      (b) => b.category === activeBook.category && b.id !== activeBook.id
    ).slice(0, 3);
  }, [books, activeBook.category, activeBook.id]);

  const displayedCrossSellBooks = otherBooksByAuthor.length > 0 ? otherBooksByAuthor : categoryFallbackBooks;

  useEffect(() => {
    loadBookReviews(activeBook.id);
    setAiSummary('');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBook.id]);

  const loadBookReviews = async (bookIdToLoad: string) => {
    try {
      const revs = await api.getReviews(bookIdToLoad);
      setReviews(revs);
    } catch (err) {
      console.log('Erro ao carregar avaliações.');
    }
  };

  const handleSelectOtherBook = (selected: Book) => {
    setActiveBook(selected);
    if (setSelectedBookModal) {
      setSelectedBookModal(selected);
    }
    if (modalContentRef.current) {
      modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    addNotification('A Visualizar Obra', `Exibindo detalhes de "${selected.title}"`);
  };

  const handleGenerateAISummary = async () => {
    setIsLoadingSummary(true);
    try {
      const summary = await api.getBookSummaryAI(activeBook.title, activeBook.author);
      setAiSummary(summary);
    } catch (err: any) {
      addNotification('Erro Zola IA', err.message || 'Falha ao gerar resumo');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleAddReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const created = await api.addReview({
        bookId: activeBook.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatarUrl,
        rating: newRating,
        comment: newComment,
        verifiedBuyer: isPurchased
      });

      setReviews(prev => [created, ...prev]);
      setNewComment('');
      addNotification('Avaliação Publicada', 'A tua opinião é muito importante para a comunidade Zola Books!');
    } catch (err: any) {
      addNotification('Erro', 'Não foi possível guardar a tua avaliação.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleWhatsAppBuy = () => {
    const text = encodeURIComponent(
      `Olá Zola Books! Gostaria de comprar o e-book "${activeBook.title}" (ID: ${activeBook.id}) no valor de ${formatPrice(activeBook.priceAOA, activeBook.priceUSD)}.`
    );
    window.open(`https://wa.me/244922255648?text=${text}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-modal-title"
    >
      <Helmet>
        <title>{`${activeBook.title} — ${activeBook.author} | Zola Books`}</title>
        <meta name="description" content={`Compre e leia "${activeBook.title}" por ${activeBook.author} na Zola Books. ${activeBook.description.slice(0, 160)}... Pagamento em Kwanzas por Multicaixa Express e BAI.`} />
        <meta name="keywords" content={`E-book, Livro, ${activeBook.title}, ${activeBook.author}, ${activeBook.category}, Literatura Angolana, Zola Books`} />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:type" content="book" />
        <meta property="og:title" content={`${activeBook.title} — ${activeBook.author}`} />
        <meta property="og:description" content={activeBook.description.slice(0, 200)} />
        <meta property="og:image" content={activeBook.coverImage} />
        <meta property="book:author" content={activeBook.author} />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${activeBook.title} — ${activeBook.author}`} />
        <meta name="twitter:description" content={activeBook.description.slice(0, 200)} />
        <meta name="twitter:image" content={activeBook.coverImage} />

        {/* JSON-LD Structured Data Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            "name": activeBook.title,
            "author": {
              "@type": "Person",
              "name": activeBook.author
            },
            "isbn": activeBook.isbn || `ZB-ISBN-${activeBook.id}`,
            "publisher": {
              "@type": "Organization",
              "name": activeBook.publisher || "Zola Books Editora"
            },
            "datePublished": activeBook.publishedYear ? String(activeBook.publishedYear) : "2024",
            "inLanguage": activeBook.language === 'Português' ? 'pt-AO' : activeBook.language === 'Inglês' ? 'en' : 'fr',
            "description": activeBook.description,
            "image": activeBook.coverImage,
            "genre": activeBook.category,
            "offers": {
              "@type": "Offer",
              "price": activeBook.priceAOA,
              "priceCurrency": "AOA",
              "availability": "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": "Zola Books"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": activeBook.rating || 4.8,
              "ratingCount": activeBook.reviewCount || reviews.length || 1,
              "reviewCount": activeBook.reviewCount || reviews.length || 1,
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": reviews.length > 0 ? reviews.map(r => ({
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": r.userName || "Leitor Zola Books"
              },
              "datePublished": r.date || "2024-01-01",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": r.rating || 5,
                "bestRating": "5",
                "worstRating": "1"
              },
              "reviewBody": r.comment || `Excelente leitura de ${activeBook.title}`
            })) : [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Leitor Verificado Zola Books"
                },
                "datePublished": `${activeBook.publishedYear || 2024}-01-15`,
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": Math.min(5, Math.max(1, Math.round(activeBook.rating || 5))),
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "reviewBody": `Excelente obra "${activeBook.title}" por ${activeBook.author}. Disponível na livraria Zola Books.`
              }
            ]
          })}
        </script>
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 max-h-[90vh] flex flex-col"
      >
        
        {/* Header Close Bar */}
        <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
            <span>{activeBook.category}</span>
            <span>•</span>
            <span>ID: {activeBook.id}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal de detalhes do livro"
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div ref={modalContentRef} className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Book Cover Side */}
            <div className="md:col-span-5 space-y-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl relative">
                <img
                  src={getOptimizedBookCover(activeBook.coverImage, 'hd')}
                  alt={activeBook.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {activeBook.isAngolanAuthor && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg">
                    🇦🇴 AUTOR ANGOLANO
                  </span>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                {activeBook.isFree && !isPurchased ? (
                  <button
                    onClick={async () => {
                      await claimFreeBook(activeBook);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Adicionar à Biblioteca (Grátis)</span>
                  </button>
                ) : null}

                <button
                  onClick={() => {
                    setActiveEReaderBook(activeBook);
                    onClose();
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs py-3 rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{isPurchased ? 'Ler E-book Completo' : activeBook.isFree ? 'Começar a Ler Agora' : 'Ler Amostra Grátis'}</span>
                </button>

                {!activeBook.isFree && (
                  <button
                    onClick={handleWhatsAppBuy}
                    className="w-full bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs py-3 rounded-xl border border-emerald-500/40 flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Encomendar via WhatsApp</span>
                  </button>
                )}

                <button
                  onClick={() => openTestLinkModal(activeBook)}
                  className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs py-2.5 rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-colors"
                  title="Criar um link temporário com senha de teste para esta obra"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gerar Link de Teste</span>
                </button>
              </div>
            </div>

            {/* Book Details Side */}
            <div className="md:col-span-7 space-y-5">
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {activeBook.title}
                </h1>
                {activeBook.subtitle && (
                  <p className="text-sm text-slate-300 font-medium mt-1">{activeBook.subtitle}</p>
                )}

                {/* Author Info & Follow Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-sm">
                      {activeBook.author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                          Autor / Criador
                        </span>
                        {followedAuthors.includes(activeBook.author) && (
                          <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-amber-500/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Autor Seguido</span>
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-white">{activeBook.author}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollowAuthor(activeBook.author)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                      followedAuthors.includes(activeBook.author)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
                    }`}
                  >
                    {followedAuthors.includes(activeBook.author) ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>A Seguir Autor</span>
                        <Bell className="w-3.5 h-3.5 text-emerald-400 animate-pulse ml-0.5" />
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Seguir Autor</span>
                        <Bell className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Ratings & Format */}
              <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span>{activeBook.rating}</span>
                  <span className="text-slate-400 font-normal ml-1">({activeBook.reviewCount} avaliações)</span>
                </div>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300 font-medium">Idioma: {activeBook.language}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300 font-medium">{activeBook.pageCount} páginas</span>
                {activeBook.fileSizeMb && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-300 font-medium">Tamanho: {activeBook.fileSizeMb} MB</span>
                  </>
                )}
              </div>

              {/* Tags Section */}
              {activeBook.tags && activeBook.tags.length > 0 && (
                <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                    Tags e Temas deste E-book:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeBook.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(tag);
                          setActiveView('catalog');
                          onClose();
                        }}
                        className="text-xs font-semibold bg-slate-900 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 px-2.5 py-1 rounded-xl transition-all shadow-sm"
                        title={`Filtrar catálogo pela tag #${tag}`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flash Sale Banner if active */}
              {activeBook.isFlashSale && (
                <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/10 border-2 border-amber-500/50 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-amber-300">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider text-white">
                      <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                      <span>Oferta Relâmpago Ativa ⚡</span>
                    </span>
                    <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-extrabold text-[11px]">
                      -{activeBook.discountPercentage || 30}% DE DESCONTO
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Aproveite a tarifa promocional antes que o tempo ou o lote limitado se esgote!
                  </p>
                </div>
              )}

              {/* Price Banner, Wishlist & Action Buttons */}
              <div className={`p-4 rounded-2xl space-y-3 border ${
                activeBook.isFree
                  ? 'bg-gradient-to-r from-emerald-500/10 via-slate-900 to-teal-500/10 border-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-500/10 to-purple-500/10 border-amber-500/30'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block">
                      {activeBook.isFree 
                        ? '🎁 Modalidade de Acesso:' 
                        : activeBook.isFlashSale 
                        ? '⚡ Preço com Desconto:' 
                        : 'Preço Digital:'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      {activeBook.isFree ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-emerald-400">
                            GRÁTIS
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                            0 Kz / $0.00
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="text-2xl font-black text-amber-400">
                            {formatPrice(activeBook.priceAOA, activeBook.priceUSD)}
                          </span>
                          {activeBook.originalPriceAOA && (
                            <span className="text-sm font-semibold text-slate-500 line-through">
                              {formatPrice(activeBook.originalPriceAOA, activeBook.originalPriceUSD)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Explicit Add to Wishlist Button */}
                    <button
                      onClick={() => toggleFavorite(activeBook.id)}
                      className={`px-4 py-3 rounded-xl border text-xs font-extrabold flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
                        isFavorite 
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                      title={isFavorite ? 'Remover da Lista de Desejos' : 'Adicionar à Lista de Desejos com alertas de preço'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400 text-rose-400' : 'text-rose-400'}`} />
                      <span>{isFavorite ? 'Na Lista de Desejos' : 'Adicionar à Lista de Desejos'}</span>
                      {isFavorite && <Bell className="w-3.5 h-3.5 text-rose-300 animate-pulse ml-0.5" />}
                    </button>

                    {activeBook.isFree ? (
                      isPurchased ? (
                        <button
                          onClick={() => {
                            setActiveEReaderBook(activeBook);
                            onClose();
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Na tua Biblioteca (Ler Agora)</span>
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            await claimFreeBook(activeBook);
                          }}
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                        >
                          <Gift className="w-4 h-4" />
                          <span>Adicionar à Biblioteca com 1 Clique</span>
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          addToCart(activeBook);
                          setIsCartOpen(true);
                          onClose();
                        }}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{isPurchased ? 'Adicionar Novamente' : 'Adicionar ao Carrinho'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Free book informative badge */}
                {activeBook.isFree && !isPurchased && (
                  <div className="bg-emerald-950/50 border border-emerald-500/30 p-2.5 rounded-xl flex items-center gap-2 text-[11px] text-emerald-200 font-medium animate-in fade-in">
                    <Gift className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Este e-book é 100% gratuito oferecido pelo autor. Não é necessário cartão ou comprovativo de pagamento!</span>
                  </div>
                )}

                {/* Wishlist Notification Alert Helper */}
                {isFavorite && !activeBook.isFree && (
                  <div className="bg-slate-950/60 border border-rose-500/30 p-2.5 rounded-xl flex items-center gap-2 text-[11px] text-rose-200 font-medium animate-in fade-in">
                    <Bell className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Alertas ativos: Notificaremos quando o preço de "{activeBook.title}" baixar ou houver promoções relâmpago!</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sinopse da Obra</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {activeBook.description}
                </p>
              </div>

              {/* AI Gemini Summary Button */}
              <div className="bg-slate-800/80 border border-purple-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Análise Crítica Zola IA (Gemini)
                  </span>
                  <button
                    onClick={handleGenerateAISummary}
                    disabled={isLoadingSummary}
                    className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoadingSummary ? 'A Gerar...' : 'Gerar Análise IA'}
                  </button>
                </div>

                {aiSummary && (
                  <div className="text-xs text-slate-200 bg-slate-900/90 p-3 rounded-xl border border-purple-500/20 whitespace-pre-line leading-relaxed">
                    {aiSummary}
                  </div>
                )}
              </div>

              {/* Publishing Details Table */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Editora:</span>
                  <span className="font-semibold">{activeBook.publisher}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Ano:</span>
                  <span className="font-semibold">{activeBook.publishedYear}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ISBN:</span>
                  <span className="font-mono text-amber-400">{activeBook.isbn}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Section: COMPARATIVO DE PREÇOS E PLANOS */}
          <BookPriceComparisonSection 
            activeBook={activeBook} 
            onCloseModal={onClose} 
          />

          {/* Section: MAIS DESTE AUTOR (Cross-Selling Section) */}
          <div className="pt-8 border-t border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 p-4 rounded-2xl border border-amber-500/20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{otherBooksByAuthor.length > 0 ? 'Vendas Cruzadas & Catálogo' : 'Recomendações'}</span>
                  </span>
                  {otherBooksByAuthor.length > 0 && (
                    <span className="text-xs text-slate-400 font-semibold">
                      {otherBooksByAuthor.length} {otherBooksByAuthor.length === 1 ? 'outro título' : 'outros títulos'}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>
                    {otherBooksByAuthor.length > 0
                      ? `Mais deste Autor: ${activeBook.author}`
                      : `Obras Recomendadas em ${activeBook.category}`}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {otherBooksByAuthor.length > 0
                    ? `Busca automática no catálogo por outras obras de ${activeBook.author} para alavancar a tua leitura.`
                    : `Explore outros títulos populares da categoria ${activeBook.category} para enriquecer a tua biblioteca.`}
                </p>
              </div>

              {otherBooksByAuthor.length > 0 && (
                <button
                  onClick={() => toggleFollowAuthor(activeBook.author)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border shadow-sm ${
                    followedAuthors.includes(activeBook.author)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {followedAuthors.includes(activeBook.author) ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Seguindo Autor</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Seguir Autor</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Cross-sell Books Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCrossSellBooks.map((otherBook) => {
                const isOtherInCart = cart.some((c) => c.book.id === otherBook.id);
                const isOtherPurchased = purchasedBooks.some((p) => p.id === otherBook.id);
                return (
                  <div
                    key={otherBook.id}
                    className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-2xl transition-all duration-300 flex flex-col justify-between group shadow-lg"
                  >
                    <div className="flex gap-3">
                      <div
                        onClick={() => handleSelectOtherBook(otherBook)}
                        className="w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative cursor-pointer group-hover:scale-105 transition-transform shadow-md"
                      >
                        <img
                          src={getOptimizedBookCover(otherBook.coverImage, 'thumb')}
                          alt={otherBook.title}
                          className="w-full h-full object-cover"
                        />
                        {otherBook.isAngolanAuthor && (
                          <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1 py-0.2 rounded">
                            🇦🇴
                          </span>
                        )}
                        {otherBook.isFree && (
                          <span className="absolute top-1 left-1 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                            GRÁTIS
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block truncate">
                            {otherBook.category}
                          </span>
                          <h3
                            onClick={() => handleSelectOtherBook(otherBook)}
                            className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer leading-tight mt-0.5"
                            title={otherBook.title}
                          >
                            {otherBook.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                            <Star className="w-3 h-3 text-amber-400 fill-current shrink-0" />
                            <span>{otherBook.rating.toFixed(1)}</span>
                            <span className="text-slate-600">•</span>
                            <span>{otherBook.publishedYear}</span>
                          </p>
                        </div>

                        <div className="mt-2">
                          <span className={`text-xs font-black block ${otherBook.isFree ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {otherBook.isFree ? '🎁 Gratuito (0 Kz)' : formatPrice(otherBook.priceAOA, otherBook.priceUSD)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
                      <button
                        onClick={() => handleSelectOtherBook(otherBook)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-bold py-1.5 px-2 rounded-xl transition-colors flex items-center justify-center gap-1 border border-slate-700/80"
                      >
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span>Ver Obra</span>
                      </button>

                      {otherBook.isFree ? (
                        isOtherPurchased ? (
                          <button
                            onClick={() => handleSelectOtherBook(otherBook)}
                            className="w-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold py-1.5 px-2 rounded-xl border border-emerald-500/40 flex items-center justify-center gap-1"
                          >
                            <BookOpen className="w-3 h-3 shrink-0" />
                            <span>Na Biblioteca</span>
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              await claimFreeBook(otherBook);
                            }}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 text-slate-950 text-[11px] font-black py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                            title="Adicionar à biblioteca sem pagar"
                          >
                            <Gift className="w-3 h-3 shrink-0" />
                            <span>Obter Grátis</span>
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            addToCart(otherBook);
                          }}
                          className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-[11px] font-extrabold py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          <ShoppingBag className="w-3 h-3 shrink-0" />
                          <span>{isOtherInCart ? 'No Carrinho' : 'Comprar'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Reviews Section */}
          <div className="pt-8 border-t border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <span>Avaliações dos Leitores ({reviews.length})</span>
            </h2>

            {/* Submit Review Form */}
            <form onSubmit={handleAddReviewSubmit} className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Deixar a tua opinião:</span>
              
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className={`p-1 rounded transition-colors ${
                      star <= newRating ? 'text-amber-400' : 'text-slate-600'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
                <span className="text-xs text-amber-400 font-bold ml-2">{newRating} Estrelas</span>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva a tua opinião sobre a leitura deste e-book..."
                rows={3}
                className="w-full bg-slate-900 text-xs text-slate-100 placeholder-slate-500 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview || !newComment.trim()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Avaliação</span>
                </button>
              </div>
            </form>

            {/* Review Cards List */}
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={rev.userName}
                        className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                      />
                      <span className="font-bold text-slate-200">{rev.userName}</span>
                      {rev.verifiedBuyer && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                          Comprador Verificado
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[11px]">{rev.date}</span>
                  </div>

                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-700'}`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </motion.div>
    </motion.div>
  );
};
