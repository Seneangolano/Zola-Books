import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Check, 
  Eye, 
  Sliders, 
  Headphones, 
  Bell, 
  Info, 
  Play, 
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  isSoundFeedbackEnabled, 
  setSoundFeedbackEnabled, 
  playSoundEffect, 
  SoundEffectType 
} from '../lib/soundEffects';
import { triggerHapticFeedback } from '../lib/haptic';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const { addNotification } = useApp();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(isSoundFeedbackEnabled());
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('zola_high_contrast') === 'true';
  });

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    setSoundFeedbackEnabled(nextState);
    triggerHapticFeedback('medium');

    addNotification(
      nextState ? 'Feedback Sonoro Ativado 🔊' : 'Feedback Sonoro Desativado 🔇',
      nextState 
        ? 'A plataforma emitirá tons curtos e elegantes ao clicar, adicionar ao carrinho e finalizar pedidos.'
        : 'Os efeitos sonoros de interface foram desativados.',
      'system'
    );
  };

  const handleToggleContrast = () => {
    const nextState = !highContrast;
    setHighContrast(nextState);
    localStorage.setItem('zola_high_contrast', nextState ? 'true' : 'false');
    triggerHapticFeedback('light');

    if (nextState) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    addNotification(
      'Acessibilidade Visual',
      nextState ? 'Modo de Alto Contraste ativado.' : 'Modo de contraste padrão restaurado.'
    );
  };

  const handleTestSound = (type: SoundEffectType, label: string) => {
    playSoundEffect(type);
    triggerHapticFeedback('light');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 text-slate-100 relative my-auto"
          >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase border border-amber-500/30">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Acessibilidade &amp; Inclusão Digital</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-amber-400" />
              <span>Configurações de Feedback Sonoro</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ajuste as preferências de áudio e visual para uma navegação inclusiva, acessível e intuitiva para leitores com deficiência visual ou preferências auditivas.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN SOUND TOGGLE CARD */}
        <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
          soundEnabled 
            ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10' 
            : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                soundEnabled 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Ativar Feedback Sonoro da Interface</h3>
                <p className="text-xs text-slate-300">
                  Emite sons curtos e elegantes ao interagir com livros, adicionar ao carrinho e concluir transações.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleToggleSound}
              className={`w-14 h-8 rounded-full p-1 transition-colors relative shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                soundEnabled ? 'bg-amber-500' : 'bg-slate-800 border border-slate-700'
              }`}
              aria-label="Ativar ou desativar feedback sonoro"
            >
              <div
                className={`w-6 h-6 rounded-full bg-slate-950 shadow-md transform transition-transform flex items-center justify-center ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {soundEnabled && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold pt-1">
            <span className={`w-2 h-2 rounded-full ${soundEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
            <span className={soundEnabled ? 'text-amber-300 font-bold' : 'text-slate-400'}>
              {soundEnabled ? 'Feedback Sonoro ATIVADO' : 'Feedback Sonoro DESATIVADO'}
            </span>
          </div>
        </div>

        {/* TEST SOUND EFFECTS GRID */}
        {soundEnabled && (
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-amber-400" />
              <span>Demonstração de Tons e Sinais de Áudio</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Clique nos botões abaixo para testar cada efeito sonoro sintetizado em tempo real:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => handleTestSound('book_click', 'Abertura de Livro')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-bold p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Play className="w-3 h-3 text-amber-400 fill-current" />
                <span>Clique em Livro</span>
              </button>

              <button
                onClick={() => handleTestSound('cart_add', 'Adicionar ao Carrinho')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-bold p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Play className="w-3 h-3 text-amber-400 fill-current" />
                <span>Add Carrinho</span>
              </button>

              <button
                onClick={() => handleTestSound('success', 'Transação Concluída')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-bold p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Play className="w-3 h-3 text-amber-400 fill-current" />
                <span>Transação OK</span>
              </button>

              <button
                onClick={() => handleTestSound('notification', 'Notificação Toast')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-200 text-xs font-bold p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Play className="w-3 h-3 text-amber-400 fill-current" />
                <span>Notificação</span>
              </button>
            </div>
          </div>
        )}

        {/* ADDITIONAL ACCESSIBILITY SETTINGS */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Outros Recursos de Acessibilidade
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* High Contrast */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-white block">Alto Contraste Visual</span>
                <span className="text-[10px] text-slate-400 block">Realça bordas e legibilidade.</span>
              </div>
              <button
                onClick={handleToggleContrast}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors relative shrink-0 ${
                  highContrast ? 'bg-amber-500' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-slate-950 shadow transform transition-transform ${
                    highContrast ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Screen Reader Optimized */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-white block">Otimizado p/ Leitor de Tela</span>
                <span className="text-[10px] text-emerald-400 block font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Padrão ARIA Nativo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* INFO FOOTER */}
        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-amber-200">
          <Info className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="leading-snug">
            O feedback sonoro da Zola Books utiliza síntese em tempo real com Web Audio API, funcionando sem necessidade de download e garantindo rápida resposta auditiva em smartphones e computadores.
          </p>
        </div>

        {/* CLOSE BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            Concluído
          </button>
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
