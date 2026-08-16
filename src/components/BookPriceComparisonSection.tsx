import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Crown, 
  Layers, 
  Sparkles, 
  Check, 
  Zap, 
  Calculator, 
  CheckCircle2, 
  BookOpen, 
  BadgePercent,
  Flame,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Book } from '../types';
import { useApp } from '../context/AppContext';
import { getOptimizedBookCover } from '../lib/imageOptimizer';
import { triggerHapticFeedback } from '../lib/haptic';

interface BookPriceComparisonSectionProps {
  activeBook: Book;
  onCloseModal?: () => void;
}

export const BookPriceComparisonSection: React.FC<BookPriceComparisonSectionProps> = ({
  activeBook,
  onCloseModal
}) => {
  const {
    books,
    cart,
    addToCart,
    setIsCartOpen,
    setIsCheckoutOpen,
    formatPrice,
    currency,
    addNotification
  } = useApp();

  // Books for the 3-book bundle: activeBook + 2 relevant titles (same author or category)
  const bundleBooks = useMemo(() => {
    const othersByAuthor = books.filter(
      b => b.id !== activeBook.id && b.author.toLowerCase().trim() === activeBook.author.toLowerCase().trim()
    );
    const othersByCategory = books.filter(
      b => b.id !== activeBook.id && b.category === activeBook.category
    );
    const remainingCatalog = books.filter(b => b.id !== activeBook.id);

    const pool = [...othersByAuthor, ...othersByCategory, ...remainingCatalog];
    // Remove duplicates while keeping order
    const uniquePool: Book[] = [];
    const seen = new Set<string>();
    for (const b of pool) {
      if (!seen.has(b.id)) {
        seen.add(b.id);
        uniquePool.push(b);
      }
    }

    return [activeBook, ...uniquePool.slice(0, 2)];
  }, [books, activeBook]);

  // Bundle Pricing Calculations (35% OFF)
  const bundleOriginalPriceAOA = useMemo(() => {
    return bundleBooks.reduce((sum, b) => sum + (b.priceAOA || 4500), 0);
  }, [bundleBooks]);

  const bundleOriginalPriceUSD = useMemo(() => {
    return bundleBooks.reduce((sum, b) => sum + (b.priceUSD || 5.0), 0);
  }, [bundleBooks]);

  const BUNDLE_DISCOUNT_PERCENT = 35;
  const bundleDiscountedPriceAOA = Math.round(bundleOriginalPriceAOA * (1 - BUNDLE_DISCOUNT_PERCENT / 100));
  const bundleDiscountedPriceUSD = parseFloat((bundleOriginalPriceUSD * (1 - BUNDLE_DISCOUNT_PERCENT / 100)).toFixed(2));
  const bundleSavingsAOA = bundleOriginalPriceAOA - bundleDiscountedPriceAOA;
  const bundleSavingsUSD = parseFloat((bundleOriginalPriceUSD - bundleDiscountedPriceUSD).toFixed(2));
  const bundlePerBookAOA = Math.round(bundleDiscountedPriceAOA / bundleBooks.length);
  const bundlePerBookUSD = parseFloat((bundleDiscountedPriceUSD / bundleBooks.length).toFixed(2));

  // Monthly VIP Subscription Calculations
  const SUBSCRIPTION_MONTHLY_AOA = 9500;
  const SUBSCRIPTION_MONTHLY_USD = 9.90;

  // Interactive Calculator State: Books read per month
  const [booksPerMonth, setBooksPerMonth] = useState<number>(3);

  // Dynamic Savings for selected reading pace
  const avgBookPriceAOA = activeBook.priceAOA || 4500;
  const avgBookPriceUSD = activeBook.priceUSD || 5.0;

  const monthlyIndividualCostAOA = booksPerMonth * avgBookPriceAOA;
  const monthlyIndividualCostUSD = booksPerMonth * avgBookPriceUSD;

  const monthlyBundleCostAOA = Math.round(booksPerMonth * (avgBookPriceAOA * 0.65));
  const monthlyBundleCostUSD = parseFloat((booksPerMonth * (avgBookPriceUSD * 0.65)).toFixed(2));

  const monthlySubscriptionCostAOA = SUBSCRIPTION_MONTHLY_AOA;
  const monthlySubscriptionCostUSD = SUBSCRIPTION_MONTHLY_USD;

  const monthlySubSavingsAOA = Math.max(0, monthlyIndividualCostAOA - monthlySubscriptionCostAOA);
  const monthlySubSavingsUSD = parseFloat(Math.max(0, monthlyIndividualCostUSD - monthlySubscriptionCostUSD).toFixed(2));

  const annualSubSavingsAOA = monthlySubSavingsAOA * 12;
  const annualSubSavingsUSD = parseFloat((monthlySubSavingsUSD * 12).toFixed(2));

  // Cart Status Helpers
  const isSingleInCart = cart.some(item => item.book.id === activeBook.id);
  const allBundleInCart = bundleBooks.every(b => cart.some(item => item.book.id === b.id));

  // Handlers
  const handleBuySingle = () => {
    triggerHapticFeedback('light');
    if (!isSingleInCart) {
      addToCart(activeBook);
    }
    setIsCartOpen(true);
    if (onCloseModal) onCloseModal();
  };

  const handleAddBundleToCart = () => {
    triggerHapticFeedback('success');
    let addedCount = 0;
    bundleBooks.forEach(book => {
      const alreadyInCart = cart.some(c => c.book.id === book.id);
      if (!alreadyInCart) {
        addToCart(book);
        addedCount++;
      }
    });

    addNotification(
      'Pacote Coleção Adicionado! 📚✨',
      `Foram adicionados os 3 e-books do pacote ao teu carrinho com economia de ${BUNDLE_DISCOUNT_PERCENT}% (${formatPrice(bundleSavingsAOA, bundleSavingsUSD)} de poupança)!`,
      'promotion'
    );
    setIsCartOpen(true);
    if (onCloseModal) onCloseModal();
  };

  const handleSubscribeVIP = () => {
    triggerHapticFeedback('success');
    // Also ensure active book is in cart/ready
    if (!isSingleInCart) {
      addToCart(activeBook);
    }
    addNotification(
      'Zola Pass VIP Selecionado! 👑',
      `Excelente escolha! Desbloqueie acesso ilimitado a todo o catálogo por apenas ${formatPrice(SUBSCRIPTION_MONTHLY_AOA, SUBSCRIPTION_MONTHLY_USD)}/mês.`,
      'system'
    );
    setIsCheckoutOpen(true);
    if (onCloseModal) onCloseModal();
  };

  return (
    <section 
      id="book-price-comparison-section"
      className="bg-slate-950/80 border border-amber-500/30 rounded-3xl p-5 sm:p-7 space-y-7 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
              <BadgePercent className="w-3.5 h-3.5 text-amber-400" />
              <span>Comparativo de Preços & Planos</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-emerald-500/30">
              Economia Garantida
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>Como Preferes Adquirir esta Obra?</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Compare a compra individual deste e-book com o <strong className="text-amber-400">Pacote da Coleção (35% de Desconto)</strong> ou o plano mensal <strong className="text-purple-300">Zola Pass VIP</strong> para economizar ao máximo na tua jornada literária.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-2xl text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-[11px]">
            <span className="text-slate-400 block font-semibold">Garantia Zola Books</span>
            <span className="text-slate-200 font-bold">Acesso Permanente & Seguro</span>
          </div>
        </div>
      </div>

      {/* 3-Column Comparative Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
        
        {/* CARD 1: Compra Individual */}
        <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Compra Individual
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-md border border-slate-700">
                1 E-book
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">Apenas Este Livro</h3>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">"{activeBook.title}"</p>
            </div>

            {/* Price block */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Investimento Único</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {formatPrice(activeBook.priceAOA, activeBook.priceUSD)}
                </span>
                {activeBook.originalPriceAOA && (
                  <span className="text-xs text-slate-500 line-through">
                    {formatPrice(activeBook.originalPriceAOA, activeBook.originalPriceUSD)}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 block">
                Custo: <strong className="text-slate-300">{formatPrice(activeBook.priceAOA, activeBook.priceUSD)}</strong> / livro
              </span>
            </div>

            {/* Features */}
            <ul className="space-y-2 text-xs text-slate-300 pt-1">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Posse vitalícia de <strong>1 título digital</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Leitura offline no leitor E-Reader Zola</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Anotações e marcadores sincronizados</span>
              </li>
              <li className="flex items-start gap-2 text-slate-500">
                <span className="w-3.5 text-center shrink-0">—</span>
                <span>Sem acesso a outros títulos da coleção</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleBuySingle}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-extrabold text-xs py-3 px-4 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSingleInCart ? 'No Carrinho • Ver' : 'Comprar Só Este Livro'}</span>
            </button>
          </div>
        </div>

        {/* CARD 2: Pacote Coleção (3 Livros com 35% OFF) - DESTACADO */}
        <div className="bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 relative shadow-xl shadow-amber-500/5 transition-all transform lg:-translate-y-1">
          {/* Top Banner Ribbon */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            <Flame className="w-3 h-3 text-slate-950 animate-bounce" />
            <span>Mais Escolhido • Poupe {BUNDLE_DISCOUNT_PERCENT}%</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-black text-amber-400 tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Pacote Coleção (3 Livros)
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-md border border-amber-500/30">
                -35% OFF
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">Coleção Literária Zola</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {activeBook.title} + 2 obras selecionadas
              </p>
            </div>

            {/* Book Previews Thumbnails Overlap */}
            <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/30">
              <div className="flex -space-x-4 shrink-0">
                {bundleBooks.map((b, i) => (
                  <img
                    key={b.id}
                    src={getOptimizedBookCover(b.coverImage, 'thumb')}
                    alt={b.title}
                    className="w-10 h-14 object-cover rounded-lg border-2 border-slate-900 shadow-md transform hover:translate-y-[-2px] transition-transform"
                    style={{ zIndex: 3 - i }}
                    title={`${b.title} (${b.author})`}
                  />
                ))}
              </div>
              <div className="text-[11px] text-slate-300 leading-tight pl-2">
                <span className="font-bold text-white block">3 Obras Completas:</span>
                <span className="text-slate-400 text-[10px] line-clamp-1">{bundleBooks.map(b => b.title).join(', ')}</span>
              </div>
            </div>

            {/* Price block */}
            <div className="bg-slate-950/90 p-3.5 rounded-xl border border-amber-500/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 uppercase font-bold">Preço do Pacote:</span>
                <span className="text-[11px] text-slate-400 line-through">
                  {formatPrice(bundleOriginalPriceAOA, bundleOriginalPriceUSD)}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400">
                  {formatPrice(bundleDiscountedPriceAOA, bundleDiscountedPriceUSD)}
                </span>
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  Poupe {formatPrice(bundleSavingsAOA, bundleSavingsUSD)}
                </span>
              </div>
              <span className="text-[11px] text-slate-300 block font-medium">
                Apenas <strong className="text-amber-300">{formatPrice(bundlePerBookAOA, bundlePerBookUSD)}</strong> por obra individual
              </span>
            </div>

            {/* Features */}
            <ul className="space-y-2 text-xs text-slate-200 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>3 E-books completos</strong> para sempre na tua conta</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Economia imediata de <strong>35% em Kwanzas</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Análises críticas Zola IA para as 3 obras</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Download offline garantido para todos os 3 livros</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleAddBundleToCart}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Layers className="w-4 h-4" />
              <span>{allBundleInCart ? 'Pacote no Carrinho • Ver' : `Adicionar Pacote (Poupar ${BUNDLE_DISCOUNT_PERCENT}%)`}</span>
            </button>
          </div>
        </div>

        {/* CARD 3: Subscrição Mensal Zola Pass VIP */}
        <div className="bg-gradient-to-b from-purple-950/30 via-slate-900 to-slate-900 border border-purple-500/40 hover:border-purple-500/70 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-black text-purple-300 tracking-wider flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-purple-400" />
                Zola Pass VIP
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-extrabold px-2 py-0.5 rounded-md border border-purple-500/30">
                Leitura Ilimitada
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">Subscrição Mensal VIP</h3>
              <p className="text-xs text-slate-300 mt-0.5">Acesso total a mais de 500+ títulos</p>
            </div>

            {/* Price block */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-purple-500/30 space-y-1">
              <span className="text-[10px] text-purple-300 uppercase font-bold block">Mensalidade sem fidelização</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-purple-300">
                  {formatPrice(SUBSCRIPTION_MONTHLY_AOA, SUBSCRIPTION_MONTHLY_USD)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ mês</span>
              </div>
              <span className="text-[11px] text-emerald-400 block font-medium">
                Paga-se a si mesmo a partir de apenas 2 livros/mês!
              </span>
            </div>

            {/* Features */}
            <ul className="space-y-2 text-xs text-slate-200 pt-1">
              <li className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Leitura ilimitada de <strong>{activeBook.title}</strong> e de todo o catálogo</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Acesso a todos os lançamentos semanais</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Clube do Livro VIP com debates exclusivos</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Cancele facilmente a qualquer momento</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleSubscribeVIP}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs py-3 px-4 rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Subscrever Zola Pass VIP</span>
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Savings Simulator (Calculadora de Poupança Dinâmica) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Simulador Interativo de Poupança
              </h3>
              <p className="text-xs text-slate-400">
                Selecione quantos livros costuma ler por mês para ver o seu custo real comparado:
              </p>
            </div>
          </div>

          {/* Reading Pace Select Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {[1, 2, 3, 5, 8].map(qty => (
              <button
                key={qty}
                onClick={() => {
                  triggerHapticFeedback('light');
                  setBooksPerMonth(qty);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  booksPerMonth === qty
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {qty} {qty === 1 ? 'Livro' : 'Livros'}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Comparison Meter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* Individual Purchase Total */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Comprando Individualmente ({booksPerMonth}x)
            </span>
            <div className="text-lg font-black text-slate-200">
              {formatPrice(monthlyIndividualCostAOA, monthlyIndividualCostUSD)}
              <span className="text-[11px] text-slate-400 font-normal ml-1">/ mês</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Preço de tabela sem desconto</span>
          </div>

          {/* Bundle Total */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-amber-500/30 space-y-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase block">
              Comprando em Pacotes (-35%)
            </span>
            <div className="text-lg font-black text-amber-400">
              {formatPrice(monthlyBundleCostAOA, monthlyBundleCostUSD)}
              <span className="text-[11px] text-slate-400 font-normal ml-1">/ mês</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold block">
              Poupa {formatPrice(monthlyIndividualCostAOA - monthlyBundleCostAOA, monthlyIndividualCostUSD - monthlyBundleCostUSD)} / mês
            </span>
          </div>

          {/* VIP Subscription Total */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-purple-500/40 space-y-1">
            <span className="text-[10px] text-purple-300 font-bold uppercase block">
              Com Zola Pass VIP (Ilimitado)
            </span>
            <div className="text-lg font-black text-purple-300">
              {formatPrice(monthlySubscriptionCostAOA, monthlySubscriptionCostUSD)}
              <span className="text-[11px] text-slate-400 font-normal ml-1">/ mês</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-400 block">
              {monthlySubSavingsAOA > 0 
                ? `Poupa ${formatPrice(monthlySubSavingsAOA, monthlySubSavingsUSD)} / mês (${formatPrice(annualSubSavingsAOA, annualSubSavingsUSD)}/ano)!` 
                : 'Acesso total ilimitado a mais de 500 títulos'}
            </span>
          </div>

        </div>

        {/* Dynamic Insight Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-purple-500/10 border border-emerald-500/30 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-200">
              {booksPerMonth >= 2 ? (
                <>
                  Lendo <strong className="text-white">{booksPerMonth} livros/mês</strong>, a subscrição Zola Pass garante-te uma poupança anual estimada de <strong className="text-emerald-400">{formatPrice(annualSubSavingsAOA, annualSubSavingsUSD)}</strong>!
                </>
              ) : (
                <>
                  Para quem lê 1 livro por mês, o <strong className="text-amber-300">Pacote da Coleção</strong> oferece o equilíbrio perfeito de 3 obras com <strong className="text-emerald-400">35% de poupança</strong> imediata!
                </>
              )}
            </span>
          </div>

          <button
            onClick={booksPerMonth >= 2 ? handleSubscribeVIP : handleAddBundleToCart}
            className="shrink-0 bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs px-3 py-1.5 rounded-lg border border-amber-500/40 flex items-center gap-1.5 transition-colors"
          >
            <span>{booksPerMonth >= 2 ? 'Ativar Zola Pass VIP' : 'Aproveitar Pacote (-35%)'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Feature Comparison Matrix Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 relative z-10 overflow-x-auto">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Matriz Comparativa Resumida</span>
        </h4>

        <table className="w-full text-left text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-bold text-[11px]">
              <th className="pb-2.5">Benefício / Recurso</th>
              <th className="pb-2.5">Compra Individual</th>
              <th className="pb-2.5 text-amber-400">Pacote Coleção</th>
              <th className="pb-2.5 text-purple-300">Zola Pass VIP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="py-2.5 font-medium text-white">Quantidade de Obras</td>
              <td className="py-2.5">1 E-book</td>
              <td className="py-2.5 font-bold text-amber-300">3 E-books</td>
              <td className="py-2.5 font-bold text-purple-300">Ilimitado (500+)</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-white">Desconto / Poupança</td>
              <td className="py-2.5 text-slate-500">0%</td>
              <td className="py-2.5 font-bold text-emerald-400">35% de Economia</td>
              <td className="py-2.5 font-bold text-emerald-400">Até 75% de Economia</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-white">Posse Permanente</td>
              <td className="py-2.5 text-emerald-400">Sim (Vitalício)</td>
              <td className="py-2.5 text-emerald-400 font-bold">Sim (Vitalício)</td>
              <td className="py-2.5">Enquanto ativo</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-white">Leitura Offline no E-Reader</td>
              <td className="py-2.5 text-emerald-400">Sim</td>
              <td className="py-2.5 text-emerald-400 font-bold">Sim (Todos os 3)</td>
              <td className="py-2.5 text-emerald-400 font-bold">Sim (Ilimitado)</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-white">Análise IA Gemini Resumos</td>
              <td className="py-2.5">Apenas nesta obra</td>
              <td className="py-2.5 text-amber-300">Nas 3 obras</td>
              <td className="py-2.5 text-purple-300 font-bold">Ilimitado</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-white">Clube do Livro & Eventos</td>
              <td className="py-2.5 text-slate-500">—</td>
              <td className="py-2.5 text-slate-500">—</td>
              <td className="py-2.5 text-purple-300 font-bold">Acesso VIP Incluído</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium text-white">Tipo de Cobrança</td>
              <td className="py-2.5">Pagamento Único</td>
              <td className="py-2.5 font-bold text-amber-300">Pagamento Único</td>
              <td className="py-2.5 text-purple-300">Mensal (Sem fidelização)</td>
            </tr>
          </tbody>
        </table>
      </div>

    </section>
  );
};
