import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Phone, HelpCircle, FileText, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SupportWhatsAppDrawer: React.FC = () => {
  const { isSupportWhatsAppOpen, setIsSupportWhatsAppOpen } = useApp();

  useEffect(() => {
    if (!isSupportWhatsAppOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSupportWhatsAppOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSupportWhatsAppOpen, setIsSupportWhatsAppOpen]);

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent('Olá equipa Zola Books! Preciso de ajuda sobre os e-books e pagamentos na plataforma.');
    window.open(`https://wa.me/244922255648?text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isSupportWhatsAppOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-drawer-title"
        >
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 h-full flex flex-col justify-between shadow-2xl p-6 space-y-6 overflow-y-auto"
          >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="support-drawer-title" className="font-extrabold text-base text-white">Suporte Zola Books</h2>
              <p className="text-[11px] text-emerald-400 font-semibold">Atendimento em Luanda (+244)</p>
            </div>
          </div>
          <button
            onClick={() => setIsSupportWhatsAppOpen(false)}
            aria-label="Fechar painel de suporte"
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Direct CTA */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-5 rounded-2xl space-y-3 text-center">
          <MessageCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="font-bold text-sm text-white">Precisa de Ajuda Imediata?</h3>
          <p className="text-xs text-slate-300">
            A nossa equipa em Luanda está disponível para tirar dúvidas sobre compras por Multicaixa Express, IBAN ou envio de e-books.
          </p>
          <button
            onClick={handleOpenWhatsApp}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Falar no WhatsApp (+244 922 255 648)</span>
          </button>
        </div>

        {/* FAQ List */}
        <div className="space-y-3 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Perguntas Frequentes (FAQ)
          </h4>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
            <span className="font-bold text-amber-300 block">Como descarrego os meus e-books após pagar?</span>
            <p className="text-slate-300">Após a confirmação do pagamento (MCX, Cartão ou aprovação IBAN), vá ao menu "Minha Biblioteca Digital" e clique em "Abrir E-book".</p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
            <span className="font-bold text-amber-300 block">Posso pagar em Kwanzas a partir de Angola?</span>
            <p className="text-slate-300">Sim! Aceitamos Multicaixa Express, BAI Directo, Unitel Money e Transferência Bancária por IBAN com upload de comprovativo.</p>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
            <span className="font-bold text-amber-300 block">Posso ler offline no telemóvel?</span>
            <p className="text-slate-300">Sim! O leitor digital Zola guarda os e-books na memória do navegador ou pode fazer o download do ficheiro no formato de texto e PDF.</p>
          </div>
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
