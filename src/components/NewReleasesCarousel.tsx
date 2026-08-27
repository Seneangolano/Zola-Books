import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Star, 
  Calendar, 
  Eye, 
  ArrowRight, 
  Flame,
  Award,
  Zap,
  Tag
} from 'lucide-react';
import { Book } from '../types';
import { useApp } from '../context/AppContext';
import { getOptimizedBookCover } from '../lib/imageOptimizer';

export const NewReleasesCarousel: React.FC = () => {
  const { 
    books, 
    formatPrice, 
    setSelectedBookModal, 
    addToCart, 
    setActiveEReaderBook 
  } = useApp();

  // Filter new releases: books marked isNewRelease or published in 2025/2026 or top 5 newest
  const newReleaseBooks = React.useMemo(() => {
    const rawList = books.filter(b => b.isNewRelease || b.publishedYear >= 2025 || b.isFeatured);
    const source = rawList.length >= 3 ? rawList : [...books].sort((a, b) => b.publishedYear - a.publishedYear);
    
    // Deduplicate books by ID
    const seen = new Set<string>();
    const unique: Book[] = [];
    for (const b of source) {
      if (b && b.id && !seen.has(b.id)) {
        seen.add(b.id);
        unique.push(b);
      }
    }
    return unique;
  }, [books]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progressKey, setProgressKey] = useState(0); // reset key for CSS progress animation

  const SLIDE_DURATION_MS = 5000;

  // Next slide handler
  const handleNext = React.useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % newReleaseBooks.length);
    setProgressKey(prev => prev + 1);
  }, [newReleaseBooks.length]);

  // Prev slide handler
  const handlePrev = React.useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + newReleaseBooks.length) % newReleaseBooks.length);
    setProgressKey(prev => prev + 1);
  }, [newReleaseBooks.length]);

  // Jump to specific slide
  const handleGoToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setProgressKey(prev => prev + 1);
  };

  // Auto-slide effect timer
  useEffect(() => {
    if (!isAutoPlaying || isHovered || newReleaseBooks.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, SLIDE_DURATION_MS);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, handleNext, newReleaseBooks.length]);

  if (!newReleaseBooks || newReleaseBooks.length === 0) return null;

  const currentBook = newReleaseBooks[currentIndex] || newReleaseBooks[0];

  // Motion Variants for Slide Transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 28 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 28 },
        opacity: { duration: 0.25 }
      }
    })
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Lançamentos & Novidades 2026 🚀</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Novos Títulos na Zola Books
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explore as obras recém-chegadas à maior livraria digital de Angola com slide automático
          </p>
        </div>

        {/* Header Controls (Auto-play Toggle & Chevron Navigation) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isAutoPlaying 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isAutoPlaying ? 'Pausar reprodução automática' : 'Ativar reprodução automática'}
            aria-label={isAutoPlaying ? 'Pausar slide automático' : 'Ativar slide automático'}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Auto ON</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Auto OFF</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl shadow-md">
            <button
              onClick={handlePrev}
              aria-label="Ver lançamento anterior"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Ver próximo lançamento"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 transition-all active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Carousel Card Stage */}
      <div 
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/20 shadow-2xl p-6 sm:p-8"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Auto-play Timer Progress Bar */}
        {isAutoPlaying && !isHovered && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800/80 overflow-hidden">
            <motion.div
              key={progressKey}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: SLIDE_DURATION_MS / 1000, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
            />
          </div>
        )}

        {/* Slide Stage Container */}
        <div className="relative min-h-[380px] sm:min-h-[320px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentBook.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -10000 || offset.x < -100) {
                  handleNext();
                } else if (swipe > 10000 || offset.x > 100) {
                  handlePrev();
                }
              }}
              className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center cursor-grab active:cursor-grabbing"
            >
              {/* Left Column: Cover Image Display */}
              <div className="md:col-span-4 flex justify-center">
                <div 
                  onClick={() => setSelectedBookModal(currentBook)}
                  className="group relative w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10 border-2 border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer transform hover:scale-105 duration-300"
                >
                  <img
                    src={getOptimizedBookCover(currentBook.coverImage, 'hd')}
                    alt={currentBook.title}
                    className="w-full h-full object-cover group-hover:brightness-105 transition-all"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Badge overlays */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    <span className="bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Flame className="w-3 h-3 text-slate-950 fill-current" />
                      <span>NOVO 2026</span>
                    </span>
                    {currentBook.isFlashSale && (
                      <span className="bg-rose-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-md">
                        -{currentBook.discountPercentage || 30}% OFF
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/80 text-amber-400 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    <span>{currentBook.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Book Details & Fast Actions */}
              <div className="md:col-span-8 space-y-4 text-left">
                {/* Meta tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-extrabold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-400" />
                    <span>{currentBook.category}</span>
                  </span>

                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ano {currentBook.publishedYear}</span>
                  </span>

                  {currentBook.isAngolanAuthor && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      🇦🇴 Autor Angolano
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 
                    onClick={() => setSelectedBookModal(currentBook)}
                    className="text-2xl sm:text-3xl font-black text-white hover:text-amber-400 transition-colors cursor-pointer line-clamp-2 leading-tight"
                  >
                    {currentBook.title}
                  </h3>
                  {currentBook.subtitle && (
                    <p className="text-sm font-medium text-amber-300/90 mt-1 line-clamp-1">
                      {currentBook.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1 font-semibold">
                    Por <strong className="text-slate-200">{currentBook.author}</strong> • {currentBook.publisher}
                  </p>
                </div>

                {/* Description Snippet */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
                  {currentBook.description}
                </p>

                {/* Price & Action Row */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-400 uppercase font-bold block tracking-wider">
                      Preço de Lançamento
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-amber-400">
                        {formatPrice(currentBook.priceAOA, currentBook.priceUSD)}
                      </span>
                      {currentBook.originalPriceAOA && (
                        <span className="text-xs font-semibold text-slate-500 line-through">
                          {formatPrice(currentBook.originalPriceAOA, currentBook.originalPriceUSD)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveEReaderBook(currentBook)}
                      className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95"
                      title="Ler amostra grátis no E-Reader"
                    >
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Ler Amostra</span>
                    </button>

                    <button
                      onClick={() => setSelectedBookModal(currentBook)}
                      className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95"
                      title="Ver todos os detalhes do livro"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Detalhes</span>
                    </button>

                    <button
                      onClick={() => addToCart(currentBook)}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Comprar Lançamento</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Pagination Indicator Dots */}
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-800/80 mt-6">
          {newReleaseBooks.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => handleGoToSlide(idx)}
              aria-label={`Ir para lançamento ${idx + 1}: ${b.title}`}
              className={`relative h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-amber-400 shadow-md shadow-amber-500/40'
                  : 'w-2.5 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
