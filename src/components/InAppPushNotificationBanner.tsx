import React, { useEffect } from 'react';
import { Bell, Sparkles, BookOpen, X, ArrowRight, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InAppPushNotificationBanner: React.FC = () => {
  const { latestPushNotif, clearLatestPushNotif, setSelectedBookModal } = useApp();

  useEffect(() => {
    if (latestPushNotif) {
      // Auto dismiss after 10 seconds if not clicked
      const timer = setTimeout(() => {
        clearLatestPushNotif();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [latestPushNotif]);

  if (!latestPushNotif) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md w-full bg-slate-900/95 border-2 border-amber-500/80 text-white rounded-3xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        
        {/* Pulsating Bell Badge */}
        <div className="relative shrink-0 mt-0.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/30">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
        </div>

        {/* Content Details */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Notificação de Autor Seguido</span>
            <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded-full border border-amber-500/30">
              PUSH IN-APP
            </span>
          </div>

          <h4 className="font-black text-sm text-white leading-tight">
            {latestPushNotif.title}
          </h4>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {latestPushNotif.message}
          </p>

          {latestPushNotif.book && (
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  if (latestPushNotif.book) {
                    setSelectedBookModal(latestPushNotif.book);
                  }
                  clearLatestPushNotif();
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explorar E-book</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={clearLatestPushNotif}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Ignorar
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={clearLatestPushNotif}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Fechar Notificação"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
