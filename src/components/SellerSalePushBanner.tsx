import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  DollarSign, 
  CheckCircle2, 
  BookOpen, 
  User, 
  Clock, 
  CreditCard, 
  X, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

export const SellerSalePushBanner: React.FC = () => {
  const { 
    latestSellerSalePush, 
    clearLatestSellerSalePush, 
    formatPrice, 
    setActiveView,
    currentUser
  } = useApp();

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (latestSellerSalePush) {
      const timer = setTimeout(() => {
        clearLatestSellerSalePush();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [latestSellerSalePush, clearLatestSellerSalePush]);

  if (!latestSellerSalePush) return null;

  const handleOpenDashboard = () => {
    clearLatestSellerSalePush();
    if (currentUser.role === 'author') {
      setActiveView('author_dashboard');
    } else {
      setActiveView('seller_dashboard');
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'multicaixa_express': return 'Multicaixa Express';
      case 'multicaixa_reference': return 'Referência MCX';
      case 'stripe_card': return 'Cartão Visa/Mastercard';
      case 'iban_transfer': return 'Transferência Bancária (IBAN)';
      default: return method.toUpperCase();
    }
  };

  return (
    <div id="seller-sale-push-container" className="fixed top-20 right-4 sm:right-6 z-[9999] max-w-md w-full pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="pointer-events-auto bg-slate-900/95 dark:bg-slate-900/98 backdrop-blur-xl border-2 border-emerald-500/80 rounded-2xl shadow-2xl shadow-emerald-500/20 p-4 text-white overflow-hidden relative group"
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 animate-pulse" />

          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Venda em Tempo Real!
              </span>
            </div>

            <button
              onClick={clearLatestSellerSalePush}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Book & Value Main Content */}
          <div className="flex items-center gap-3.5 bg-slate-800/80 border border-slate-700/70 rounded-xl p-2.5 mb-3">
            {latestSellerSalePush.bookCover ? (
              <img
                src={latestSellerSalePush.bookCover}
                alt={latestSellerSalePush.bookTitle}
                className="w-12 h-16 object-cover rounded-lg shadow-md border border-slate-600 flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-16 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                {latestSellerSalePush.bookTitle}
              </h4>
              <p className="text-xs text-slate-400 truncate mb-1">
                de {latestSellerSalePush.author}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-emerald-400 flex items-center gap-0.5">
                  + {formatPrice(latestSellerSalePush.amountAOA, latestSellerSalePush.amountUSD)}
                </span>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-medium">
                  {latestSellerSalePush.paymentStatus === 'completed' ? '✓ Pago' : '⏳ Aguardando'}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/50 rounded-lg p-2 mb-3 border border-slate-800/80">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">{latestSellerSalePush.buyerName}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{latestSellerSalePush.time} ({latestSellerSalePush.date})</span>
            </div>
            <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5 text-slate-400 truncate">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{getPaymentMethodLabel(latestSellerSalePush.paymentMethod)}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {latestSellerSalePush.orderId}
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenDashboard}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Ver no Painel do Vendedor
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
            <button
              onClick={clearLatestSellerSalePush}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Dispensar
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
