import React from 'react';
import { BookOpen, ShieldCheck, Heart, MessageCircle, Globe, Smartphone, Lock, Sun, Moon, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveView, setIsSupportWhatsAppOpen, setIsAppDownloadModalOpen, setIsRoadmapModalOpen, theme, toggleTheme, setIsAccessibilityModalOpen, isSoundFeedbackActive } = useApp();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs pt-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black">
                <BookOpen className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                ZOLA <span className="text-amber-400 font-light">BOOKS</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Plataforma profissional de livraria e biblioteca digital inspirada na realidade de Angola e preparada para o mercado global.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Transações 100% Protegidas</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-extrabold uppercase text-slate-200 tracking-wider text-[11px]">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveView('home')} className="hover:text-amber-400 transition-colors">
                  Página Inicial
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('catalog')} className="hover:text-amber-400 transition-colors">
                  Catálogo de Livros
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('library')} className="hover:text-amber-400 transition-colors">
                  Minha Biblioteca Digital
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('affiliates')} className="hover:text-amber-400 transition-colors">
                  Programa de Afiliados
                </button>
              </li>
              <li>
                <button onClick={() => setIsRoadmapModalOpen(true)} className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1">
                  <span>Plano em 7 Etapas 🚀</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <h4 className="font-extrabold uppercase text-slate-200 tracking-wider text-[11px]">Pagamentos Aceites</h4>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-300">
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇦🇴 Multicaixa Express</span>
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇦🇴 BAI Directo</span>
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇦🇴 Unitel Money</span>
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🇦🇴 IBAN Bancário</span>
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">💳 Visa / Mastercard</span>
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">🌐 PayPal</span>
            </div>
          </div>

          {/* Support & App */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-slate-200 tracking-wider text-[11px]">Aplicações &amp; Suporte</h4>
            <button
              onClick={() => setIsAppDownloadModalOpen(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Baixar App Android / iOS</span>
            </button>
            <button
              onClick={() => setIsSupportWhatsAppOpen(true)}
              className="w-full bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-bold p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Suporte WhatsApp (+244 922 255 648)</span>
            </button>
          </div>

        </div>

        {/* Bottom Bar with Theme Selector */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Zola Books. Todos os direitos reservados. Feito com orgulho em Luanda, Angola 🇦🇴.</p>

          {/* Theme Selector Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-inner">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 px-2 tracking-wider">Tema Visual:</span>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                theme === 'dark'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" /> Escuro
            </button>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                theme === 'light'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" /> Claro
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAccessibilityModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>Acessibilidade &amp; Sons {isSoundFeedbackActive ? '🔊' : '🔇'}</span>
            </button>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Termos de Serviço</span>
            <span>•</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Política de Privacidade</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
