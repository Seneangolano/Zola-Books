import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Award, 
  Zap, 
  Clock, 
  Flame, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getOptimizedBookCover } from '../lib/imageOptimizer';

export const HeroBanner: React.FC = () => {
  const { setActiveView, setIsZolaAIOpen, setSelectedBookModal, addToCart, formatPrice, books } = useApp();

  const flashSaleBooks = books.filter(b => b.isFlashSale);
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14,
    minutes: 28,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 }; // Reset loop for demo
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeFlashBook = flashSaleBooks[currentFlashIndex] || flashSaleBooks[0] || books[0];

  const handleNextFlash = () => {
    if (flashSaleBooks.length > 0) {
      setCurrentFlashIndex((prev) => (prev + 1) % flashSaleBooks.length);
    }
  };

  const handlePrevFlash = () => {
    if (flashSaleBooks.length > 0) {
      setCurrentFlashIndex((prev) => (prev - 1 + flashSaleBooks.length) % flashSaleBooks.length);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 shadow-2xl p-6 sm:p-10 mb-10">
      {/* Background Decorative Motifs */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Hero Copy & CTA */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Livraria Digital de Angola para o Mundo 🇦🇴🌍</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Descubra os Melhores <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">E-books Angolanos</span> e Internacionais
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
            Aceda instantaneamente a clássicos da literatura africana, finanças, tecnologia e romances contemporâneos. Pagamentos fáceis em Kwanzas por Multicaixa Express, BAI e Cartão Internacional.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveView('catalog')}
              aria-label="Explorar o catálogo completo de e-books"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsZolaAIOpen(true)}
              aria-label="Consultar assistente inteligente Zola IA"
              className="bg-slate-800/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-400 font-bold text-sm px-5 py-3.5 rounded-2xl flex items-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Consultar Zola IA</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Download Na Hora</p>
                <p className="text-[11px] text-slate-400">Entrega imediata</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">100% Seguros</p>
                <p className="text-[11px] text-slate-400">MCX, BAI, Visa</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">E-Reader Integrado</p>
                <p className="text-[11px] text-slate-400">Leia em qualquer ecrã</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Flash Sales (Promoções Relâmpago) Highlight Box */}
        {activeFlashBook && (
          <div className="lg:col-span-5 flex justify-center w-full">
            <div 
              className="relative w-full max-w-sm bg-gradient-to-b from-slate-800/95 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl shadow-amber-500/10 hover:border-amber-400 transition-all space-y-4"
              role="region"
              aria-label="Destaque de Promoção Relâmpago"
            >
              {/* Flash Sale Header Banner */}
              <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3.5 py-2 rounded-2xl font-black text-xs shadow-md">
                <div className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Flame className="w-4 h-4 text-slate-950 animate-bounce" />
                  <span>Promoção Relâmpago ⚡</span>
                </div>
                <div className="bg-slate-950/20 px-2 py-0.5 rounded-lg text-[10px] font-extrabold text-slate-950">
                  -{activeFlashBook.discountPercentage || 30}% OFF
                </div>
              </div>

              {/* Countdown Timer Display */}
              <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between text-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Clock className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Termina em:</span>
                </div>
                
                <div className="flex items-center gap-1 font-mono font-black text-xs">
                  <span className="bg-amber-500 text-slate-950 px-2 py-1 rounded-lg text-sm shadow-sm">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span className="text-amber-400 font-bold">:</span>
                  <span className="bg-amber-500 text-slate-950 px-2 py-1 rounded-lg text-sm shadow-sm">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span className="text-amber-400 font-bold">:</span>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-1 rounded-lg text-sm shadow-sm">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>

              {/* Book Cover & Details */}
              <div 
                onClick={() => setSelectedBookModal(activeFlashBook)}
                className="group cursor-pointer flex gap-4 items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedBookModal(activeFlashBook)}
                aria-label={`Ver detalhes da promoção relâmpago: ${activeFlashBook.title}`}
              >
                <div className="w-20 h-28 shrink-0 overflow-hidden rounded-xl bg-slate-950 relative shadow-md">
                  <img
                    src={getOptimizedBookCover(activeFlashBook.coverImage, 'card')}
                    alt={activeFlashBook.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute bottom-1 right-1 bg-rose-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow">
                    OFERTA
                  </span>
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    {activeFlashBook.category}
                  </span>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {activeFlashBook.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">por {activeFlashBook.author}</p>

                  {/* Pricing Comparison */}
                  <div className="pt-1 flex items-baseline gap-2">
                    <span className="text-base font-black text-amber-400">
                      {formatPrice(activeFlashBook.priceAOA, activeFlashBook.priceUSD)}
                    </span>
                    {activeFlashBook.originalPriceAOA && (
                      <span className="text-xs font-semibold text-slate-500 line-through">
                        {formatPrice(activeFlashBook.originalPriceAOA, activeFlashBook.originalPriceUSD)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Limited Stock Urgency Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1 text-amber-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>84% do lote esgotado</span>
                  </span>
                  <span className="text-slate-400">Apenas 5 unidades</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full w-[84%] transition-all duration-500 animate-pulse" />
                </div>
              </div>

              {/* Bottom Actions & Carousel Controls */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => addToCart(activeFlashBook)}
                  aria-label={`Comprar em promoção relâmpago: ${activeFlashBook.title}`}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Comprar na Promoção ⚡</span>
                </button>

                {flashSaleBooks.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevFlash}
                      aria-label="Ver promoção relâmpago anterior"
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextFlash}
                      aria-label="Ver próxima promoção relâmpago"
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

