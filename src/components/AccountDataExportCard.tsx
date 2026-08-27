import React, { useState } from 'react';
import { 
  FileJson, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  BookOpen, 
  Bookmark, 
  Highlighter, 
  Heart, 
  Eye, 
  EyeOff, 
  Sparkles,
  Clock,
  HardDrive
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserSecurityBackup } from '../types';

interface AccountDataExportCardProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export const AccountDataExportCard: React.FC<AccountDataExportCardProps> = ({ 
  variant = 'full',
  className = ''
}) => {
  const { 
    currentUser, 
    readingProgressMap, 
    bookmarks, 
    highlights, 
    favoriteBookIds,
    exportUserDataBackup,
    addNotification
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const progressCount = Object.keys(readingProgressMap || {}).length;
  const bookmarksCount = (bookmarks || []).length;
  const highlightsCount = (highlights || []).length;
  const favoritesCount = (favoriteBookIds || []).length;
  const purchasedCount = (currentUser.purchasedBookIds || []).length;

  const currentBackupPayload: UserSecurityBackup = {
    appName: 'Zola Books',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    user: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email
    },
    data: {
      readingProgressMap: readingProgressMap || {},
      bookmarks: bookmarks || [],
      highlights: highlights || [],
      favoriteBookIds: favoriteBookIds || [],
      purchasedBookIds: currentUser.purchasedBookIds || []
    },
    stats: {
      booksWithProgressCount: progressCount,
      bookmarksCount: bookmarksCount,
      highlightsCount: highlightsCount,
      favoritesCount: favoritesCount,
      purchasedCount: purchasedCount
    }
  };

  const jsonContentString = JSON.stringify(currentBackupPayload, null, 2);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonContentString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      addNotification('JSON Copiado! 📋', 'Dados copiados para a área de transferência com sucesso.');
    } catch (err) {
      console.error('Erro ao copiar JSON:', err);
    }
  };

  return (
    <div 
      id="account-data-export-card"
      className={`bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl shadow-amber-500/5 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0">
            <FileJson className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Exportação de Dados de Leitura (.JSON)
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Segurança Extra
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gera um ficheiro portátil com o estado atual do teu progresso de leitura, marcadores e destaques.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={exportUserDataBackup}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar .JSON 💾</span>
        </button>
      </div>

      {/* Real-time State Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-white text-sm truncate">{progressCount}</div>
            <div className="text-[10px] text-slate-400 truncate">Livros em Leitura</div>
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Bookmark className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-white text-sm truncate">{bookmarksCount}</div>
            <div className="text-[10px] text-slate-400 truncate">Marcadores Guardados</div>
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
            <Highlighter className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-white text-sm truncate">{highlightsCount}</div>
            <div className="text-[10px] text-slate-400 truncate">Destaques e Citações</div>
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-2.5 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-black text-white text-sm truncate">{purchasedCount}</div>
            <div className="text-[10px] text-slate-400 truncate">Obras Adquiridas</div>
          </div>
        </div>
      </div>

      {/* Security Benefit Notice */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-[11px] text-slate-400 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200 font-bold">Porquê exportar este ficheiro?</strong> Além da sincronização automática na nuvem Firestore, ter uma cópia local em formato aberto <code className="text-amber-300 font-mono">.json</code> garante que nunca perdes as tuas anotações, destaques e páginas mesmo em casos de troca de dispositivo offline ou limpeza de cache.
        </div>
      </div>

      {/* Quick Inspection & Copy Controls */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => setShowJsonPreview(!showJsonPreview)}
          className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {showJsonPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showJsonPreview ? 'Ocultar Pré-visualização' : 'Pré-visualizar Conteúdo JSON'}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyJson}
          className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
        </button>
      </div>

      {/* JSON Preview Box */}
      {showJsonPreview && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 relative">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-2 pb-1 border-b border-slate-800">
            <span>zolabooks_backup_{(currentUser.name || 'leitor').toLowerCase().replace(/[^a-z0-9]/g, '_')}.json</span>
            <span>{Math.round((jsonContentString.length / 1024) * 10) / 10} KB</span>
          </div>
          <pre className="text-[11px] font-mono text-amber-300/90 overflow-x-auto max-h-48 scrollbar-thin p-1 leading-relaxed">
            {jsonContentString}
          </pre>
        </div>
      )}
    </div>
  );
};
