import React from 'react';
import { Star, Heart, BookOpen, Download, ShoppingBag, Eye, MessageCircle, User, UserCheck, Gift } from 'lucide-react';
import { Book } from '../types';
import { useApp } from '../context/AppContext';
import { getOptimizedBookCover, DEFAULT_BOOK_COVER_URL } from '../lib/imageOptimizer';
import { playSoundEffect } from '../lib/soundEffects';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, compact = false }) => {
  const {
    formatPrice,
    favoriteBookIds,
    toggleFavorite,
    addToCart,
    setSelectedBookModal,
    setSelectedAuthorModal,
    followedAuthors,
    setActiveEReaderBook,
    purchasedBooks,
    claimFreeBook,
    setIsSupportWhatsAppOpen,
    setSelectedTag,
    setSearchQuery,
    setActiveView
  } = useApp();

  const isFavorite = favoriteBookIds.includes(book.id);
  const isPurchased = purchasedBooks.some(b => b.id === book.id);
  const isFollowedAuthor = followedAuthors.some(fa => fa.toLowerCase() === book.author.toLowerCase());

  const handleWhatsAppBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Olá Zola Books! Gostaria de encomendar o e-book "${book.title}" (ID: ${book.id}) por ${formatPrice(book.priceAOA, book.priceUSD)}.`
    );
    window.open(`https://wa.me/244922255648?text=${text}`, '_blank');
  };

  return (
    <div 
      onClick={() => {
        playSoundEffect('book_click');
        setSelectedBookModal(book);
      }}
      className="group bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Cover Image Area with WebP / Width Optimized Unsplash URL */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
        <img
          src={getOptimizedBookCover(book.coverImage || DEFAULT_BOOK_COVER_URL, compact ? 'thumb' : 'card')}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallbackSrc = getOptimizedBookCover(DEFAULT_BOOK_COVER_URL, compact ? 'thumb' : 'card');
            if (target.src !== fallbackSrc) {
              target.src = fallbackSrc;
            }
          }}
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start z-10">
          {book.isFlashSale && (
            <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
              ⚡ -{book.discountPercentage || 30}% OFF
            </span>
          )}
          {book.isFree && (
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md">
              GRÁTIS
            </span>
          )}
          {book.isAngolanAuthor && (
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md">
              🇦🇴 ANGOLA
            </span>
          )}
          {book.isBestseller && !book.isFree && !book.isFlashSale && (
            <span className="bg-purple-600 text-white font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md">
              MAIS VENDIDO
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(book.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isFavorite 
              ? 'bg-rose-500 text-white shadow-lg' 
              : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
          title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View / Sample Read Hover Action */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveEReaderBook(book);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>{isPurchased ? 'Ler E-book' : 'Ler Amostra'}</span>
          </button>
        </div>
      </div>

      {/* Book Details Info */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2 text-slate-100">
        <div>
          <div className="flex items-center justify-between gap-1 text-[11px] text-amber-400/90 font-semibold uppercase tracking-wider mb-1">
            <span>{book.category}</span>
            <span>{book.language}</span>
          </div>

          <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
            {book.title}
          </h3>

          {/* Clickable Author Profile Link */}
          <p className="text-xs text-slate-400 line-clamp-1 mb-2 flex items-center gap-1">
            <span>por</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playSoundEffect('click');
                if (setSelectedAuthorModal) {
                  setSelectedAuthorModal(book.author);
                } else {
                  setSearchQuery(book.author);
                  setActiveView('catalog');
                }
              }}
              className="inline-flex items-center gap-1 font-semibold text-slate-200 hover:text-amber-300 hover:underline bg-slate-900/60 hover:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700/60 hover:border-amber-500/40 transition-all text-[11px] group/author cursor-pointer"
              title={`Ver perfil e obras de ${book.author}`}
            >
              <User className="w-3 h-3 text-amber-400 group-hover/author:scale-110 transition-transform shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[160px]">{book.author}</span>
              {isFollowedAuthor && (
                <UserCheck className="w-3 h-3 text-emerald-400 ml-0.5 shrink-0" title="Autor Seguido" />
              )}
            </button>
          </p>

          {/* Star Rating & Tags */}
          <div className="flex items-center justify-between gap-1 text-xs mb-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold ml-1 text-white">{book.rating}</span>
              <span className="text-slate-500 text-[11px] ml-1">({book.reviewCount})</span>
            </div>
          </div>

          {/* Book Tags */}
          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {book.tags.slice(0, 2).map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation();
                    playSoundEffect('click');
                    setSelectedTag(tag);
                    setActiveView('catalog');
                  }}
                  className="text-[10px] bg-slate-900/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 px-1.5 py-0.5 rounded transition-all"
                  title={`Filtrar por tag: ${tag}`}
                >
                  #{tag}
                </button>
              ))}
              {book.tags.length > 2 && (
                <span className="text-[9px] text-slate-500 self-center">
                  +{book.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block font-normal">
              {book.isFree ? '🎁 Acesso:' : book.isFlashSale ? '⚡ Preço Relâmpago:' : 'Preço Digital:'}
            </span>
            <div className="flex items-baseline gap-1.5">
              {book.isFree ? (
                <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                  <span>GRÁTIS</span>
                </span>
              ) : (
                <>
                  <span className="text-sm font-extrabold text-amber-400">
                    {formatPrice(book.priceAOA, book.priceUSD)}
                  </span>
                  {book.originalPriceAOA && (
                    <span className="text-[11px] font-medium text-slate-500 line-through">
                      {formatPrice(book.originalPriceAOA, book.originalPriceUSD)}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {isPurchased ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveEReaderBook(book);
              }}
              className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Abrir</span>
            </button>
          ) : book.isFree ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                claimFreeBook(book);
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 hover:shadow-emerald-500/20"
              title="Adicionar à tua biblioteca grátis com 1 clique"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Obter Grátis</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleWhatsAppBuy}
                className="p-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                title="Comprar via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(book);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-md active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Comprar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
