import React from 'react';
import { Moon, Sun, CloudCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ThemeToggleSwitchProps {
  variant?: 'compact' | 'switch' | 'card';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({
  variant = 'compact',
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const { theme, toggleTheme, setThemeMode, cloudSyncStatus } = useApp();
  const isDark = theme === 'dark';

  if (variant === 'card') {
    return (
      <div 
        id="theme-toggle-card"
        className={`bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 transition-all duration-300 shadow-sm ${className}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border transition-all ${
              isDark 
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-inner' 
                : 'bg-amber-500/20 text-amber-500 border-amber-500/30 shadow-inner'
            }`}>
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 animate-[spin_12s_linear_infinite]" />}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>Tema da Aplicação</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  isDark 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                    : 'bg-amber-500/20 text-amber-600 border-amber-500/30'
                }`}>
                  {isDark ? 'Modo Escuro (Dark) 🌙' : 'Modo Claro (Light) ☀️'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Sincronização persistente na nuvem</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium">
                  <CloudCheck className="w-3 h-3" />
                  Firestore
                </span>
              </div>
            </div>
          </div>

          <button
            id="theme-toggle-card-btn"
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={`Alternar para ${isDark ? 'Modo Claro' : 'Modo Escuro'}`}
            onClick={toggleTheme}
            className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full p-1 border transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isDark 
                ? 'bg-slate-900 border-slate-700' 
                : 'bg-amber-400/30 border-amber-500/50'
            }`}
          >
            <span
              className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full bg-gradient-to-br transition duration-300 ease-in-out shadow-md ${
                isDark 
                  ? 'translate-x-8 bg-purple-600 text-purple-100' 
                  : 'translate-x-0 bg-amber-500 text-slate-950'
              }`}
            >
              {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </span>
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Variáveis CSS e paleta de cores atualizadas em tempo real</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setThemeMode('light')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                !isDark ? 'bg-amber-500 text-slate-950' : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Claro
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                isDark ? 'bg-purple-600 text-white' : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Escuro
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {showLabel && (
          <span className="text-xs font-semibold text-slate-300">
            {isDark ? 'Modo Escuro' : 'Modo Claro'}
          </span>
        )}
        <button
          id="theme-toggle-switch-btn"
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={`Alternar tema atual: ${isDark ? 'Modo Escuro' : 'Modo Claro'}`}
          title={`Tema atual: ${isDark ? 'Modo Escuro' : 'Modo Claro'} (Persistido no Firestore)`}
          onClick={toggleTheme}
          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer items-center rounded-full p-0.5 border transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            isDark 
              ? 'bg-slate-900/90 border-slate-700' 
              : 'bg-amber-100 border-amber-300'
          }`}
        >
          <span
            className={`pointer-events-none flex items-center justify-center h-5.5 w-5.5 transform rounded-full transition duration-300 ease-in-out shadow-sm ${
              isDark 
                ? 'translate-x-6 bg-purple-600 text-purple-100' 
                : 'translate-x-0 bg-amber-500 text-slate-950'
            }`}
          >
            {isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
          </span>
        </button>
      </div>
    );
  }

  // Compact variant (Default for Header & Toolbars)
  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'px-3.5 py-2 text-sm'
  }[size];

  return (
    <button
      id="global-theme-toggle-button"
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Alternar para ${isDark ? 'Modo Claro' : 'Modo Escuro'}`}
      title={`Tema atual: ${isDark ? 'Modo Escuro 🌙' : 'Modo Claro ☀️'} (Persistido no Firestore)`}
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 rounded-xl font-bold transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${sizeClasses} ${
        isDark 
          ? 'bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border-slate-700/80 hover:border-amber-500/40 shadow-sm' 
          : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 border-amber-500/30 hover:border-amber-500/60 shadow-sm'
      } ${className}`}
    >
      <span className="relative flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 group-hover:text-amber-600 animate-[spin_12s_linear_infinite]" />
        )}
      </span>
      {showLabel && (
        <span className="hidden sm:inline text-xs font-semibold">
          {isDark ? 'Modo Escuro' : 'Modo Claro'}
        </span>
      )}
    </button>
  );
};
