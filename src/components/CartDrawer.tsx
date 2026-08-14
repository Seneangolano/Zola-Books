import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Coupon } from '../types';
import { getOptimizedBookCover } from '../lib/imageOptimizer';
import { triggerHapticFeedback } from '../lib/haptic';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    formatPrice,
    cartSubtotalAOA,
    cartSubtotalUSD,
    addNotification
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const coupon = await api.validateCoupon(couponCode);
      setAppliedCoupon(coupon);
      addNotification('Cupom Aplicado!', `Desconto de ${coupon.discountPercentage}% ativado com sucesso!`);
    } catch (err: any) {
      addNotification('Erro de Cupom', err.message || 'Cupom inválido');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const discountPercentage = appliedCoupon ? appliedCoupon.discountPercentage : 0;
  const finalSubtotalAOA = Math.round(cartSubtotalAOA * (1 - discountPercentage / 100));
  const finalSubtotalUSD = parseFloat((cartSubtotalUSD * (1 - discountPercentage / 100)).toFixed(2));

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
        >
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col justify-between shadow-2xl"
          >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h2 id="cart-drawer-title" className="font-extrabold text-base text-white">Seu Carrinho ({cart.length})</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Fechar carrinho de compras"
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300">O seu carrinho está vazio</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore o nosso catálogo para adicionar livros angolanos e internacionais à tua coleção.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.book.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3"
              >
                <img
                  src={getOptimizedBookCover(item.book.coverImage, 'thumb')}
                  alt={item.book.title}
                  className="w-14 h-18 object-cover rounded-xl bg-slate-950"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-xs text-white truncate">{item.book.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">por {item.book.author}</p>
                  <span className="text-xs font-black text-amber-400 block">
                    {formatPrice(item.book.priceAOA, item.book.priceUSD)}
                  </span>
                </div>
                <button
                  onClick={() => removeFromCart(item.book.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Coupon & Summary Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/60 space-y-4">
            
            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Código de Cupom (ex: BENVINDO10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-slate-900 text-xs text-slate-100 placeholder-slate-500 uppercase rounded-xl pl-8 pr-3 py-2.5 border border-slate-700 focus:outline-none focus:border-amber-500"
                />
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                disabled={isValidatingCoupon || !couponCode.trim()}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs px-4 py-2.5 rounded-xl border border-amber-500/30 transition-colors disabled:opacity-50"
              >
                Aplicar
              </button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
                <span className="flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5" /> Cupom {appliedCoupon.code} ({appliedCoupon.discountPercentage}% OFF)
                </span>
                <button
                  onClick={() => setAppliedCoupon(null)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  Remover
                </button>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal Digital:</span>
                <span>{formatPrice(cartSubtotalAOA, cartSubtotalUSD)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Desconto ({appliedCoupon.discountPercentage}%):</span>
                  <span>- {formatPrice(cartSubtotalAOA - finalSubtotalAOA, cartSubtotalUSD - finalSubtotalUSD)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                <span>Total a Pagar:</span>
                <span className="text-amber-400">{formatPrice(finalSubtotalAOA, finalSubtotalUSD)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => {
                triggerHapticFeedback('medium');
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Finalizar Compra</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
