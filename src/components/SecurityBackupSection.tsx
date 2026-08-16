import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  FileJson, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  RefreshCw, 
  FileText, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Bookmark, 
  Highlighter, 
  Cloud,
  X,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserSecurityBackup } from '../types';

interface SecurityBackupSectionProps {
  compact?: boolean;
}

export const SecurityBackupSection: React.FC<SecurityBackupSectionProps> = ({ compact = false }) => {
  const { 
    exportUserDataBackup, 
    importUserDataBackup, 
    readingProgressMap, 
    bookmarks, 
    highlights, 
    currentUser, 
    favoriteBookIds,
    cloudSyncStatus,
    lastSyncedAt,
    triggerCloudSync
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<{
    rawContent: string;
    fileName: string;
    fileSizeKb: number;
    backupInfo: UserSecurityBackup;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restoreSuccessStats, setRestoreSuccessStats] = useState<{
    progressCount: number;
    bookmarksCount: number;
    highlightsCount: number;
  } | null>(null);

  const totalProgressCount = Object.keys(readingProgressMap || {}).length;
  const totalBookmarksCount = (bookmarks || []).length;
  const totalHighlightsCount = (highlights || []).length;
  const totalFavoritesCount = (favoriteBookIds || []).length;

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setErrorMessage(null);
    setRestoreSuccessStats(null);

    if (!file.name.toLowerCase().endsWith('.json')) {
      setErrorMessage('Por favor selecione um ficheiro com extensão .json válido.');
      return;
    }

    setIsProcessingFile(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Normalize payload
        const payload = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
        const progressCount = payload.readingProgressMap ? Object.keys(payload.readingProgressMap).length : 0;
        const bookmarksCount = Array.isArray(payload.bookmarks) ? payload.bookmarks.length : 0;
        const highlightsCount = Array.isArray(payload.highlights) ? payload.highlights.length : 0;
        const favoritesCount = Array.isArray(payload.favoriteBookIds) ? payload.favoriteBookIds.length : 0;
        const purchasedCount = Array.isArray(payload.purchasedBookIds) ? payload.purchasedBookIds.length : 0;

        if (progressCount === 0 && bookmarksCount === 0 && highlightsCount === 0 && favoritesCount === 0 && purchasedCount === 0) {
          throw new Error('O ficheiro JSON não contém dados de progresso de leitura, marcadores ou destaques reconhecíveis.');
        }

        const normalizedBackup: UserSecurityBackup = {
          appName: parsed.appName || 'Zola Books',
          version: parsed.version || '1.0',
          exportedAt: parsed.exportedAt || new Date().toISOString(),
          user: parsed.user || {
            name: currentUser?.name,
            email: currentUser?.email
          },
          data: {
            readingProgressMap: payload.readingProgressMap || {},
            bookmarks: payload.bookmarks || [],
            highlights: payload.highlights || [],
            favoriteBookIds: payload.favoriteBookIds || [],
            purchasedBookIds: payload.purchasedBookIds || []
          },
          stats: {
            booksWithProgressCount: progressCount,
            bookmarksCount: bookmarksCount,
            highlightsCount: highlightsCount,
            favoritesCount: favoritesCount,
            purchasedCount: purchasedCount
          }
        };

        setParsedPreview({
          rawContent: content,
          fileName: file.name,
          fileSizeKb: Math.round((file.size / 1024) * 10) / 10,
          backupInfo: normalizedBackup
        });
      } catch (err: any) {
        console.error('Erro ao ler JSON de backup:', err);
        setErrorMessage(err?.message || 'Ficheiro JSON corrompido ou formato não suportado.');
      } finally {
        setIsProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      setErrorMessage('Erro ao ler o ficheiro do dispositivo.');
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!parsedPreview) return;
    setIsRestoring(true);
    setErrorMessage(null);

    try {
      const res = await importUserDataBackup(parsedPreview.rawContent);
      if (res.success) {
        setRestoreSuccessStats({
          progressCount: res.progressCount,
          bookmarksCount: res.bookmarksCount,
          highlightsCount: res.highlightsCount
        });
        setParsedPreview(null);
      } else {
        setErrorMessage(res.message || 'Falha ao restaurar dados do backup.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro durante a importação.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className={`space-y-4 ${compact ? 'text-xs' : ''}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {/* Main Container Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Subtle glow decorative accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black shadow-inner shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Backup de Segurança &amp; Restauração
                </h3>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                  .JSON
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Exporta e importa todo o progresso de leitura, marcadores e destaques caso ocorra perda de sincronização com o Firestore.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => triggerCloudSync()}
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
              title="Forçar sincronização com a nuvem Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncStatus === 'syncing' ? 'animate-spin text-amber-400' : ''}`} />
              <span>{cloudSyncStatus === 'synced' ? 'Nuvem OK' : 'Sincronizar'}</span>
            </button>
          </div>
        </div>

        {/* Current State Summary Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
              <span>Progresso</span>
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="mt-2">
              <span className="text-lg font-black text-white">{totalProgressCount}</span>
              <span className="text-[10px] text-slate-400 ml-1">livro(s)</span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
              <span>Marcadores</span>
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-lg font-black text-white">{totalBookmarksCount}</span>
              <span className="text-[10px] text-slate-400 ml-1">página(s)</span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
              <span>Destaques</span>
              <Highlighter className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="mt-2">
              <span className="text-lg font-black text-white">{totalHighlightsCount}</span>
              <span className="text-[10px] text-slate-400 ml-1">citação(ões)</span>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold">
              <span>Favoritos</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="mt-2">
              <span className="text-lg font-black text-white">{totalFavoritesCount}</span>
              <span className="text-[10px] text-slate-400 ml-1">guardado(s)</span>
            </div>
          </div>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold">Aviso:</strong> {errorMessage}
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success message banner */}
        {restoreSuccessStats && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-emerald-300 text-xs mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1">
              <strong className="font-bold">Restauração Concluída!</strong> Foram restabelecidos com sucesso{' '}
              {restoreSuccessStats.progressCount} progressos de leitura, {restoreSuccessStats.bookmarksCount} marcadores e{' '}
              {restoreSuccessStats.highlightsCount} destaques, agora sincronizados localmente e com a nuvem.
            </div>
            <button onClick={() => setRestoreSuccessStats(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Buttons & Drag and Drop Zone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export Button Card */}
          <button
            type="button"
            onClick={exportUserDataBackup}
            className="p-4 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-2xl text-left transition-all group flex items-center justify-between gap-3 shadow-md hover:border-amber-400 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black group-hover:scale-105 transition-transform shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
                  <span>Exportar Ficheiro .JSON</span>
                </div>
                <div className="text-[11px] text-amber-200/80 mt-0.5">
                  Descarrega cópia com marcadores e notas
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shrink-0">
              Descarregar
            </span>
          </button>

          {/* Import Button / Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileSelect(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-between gap-3 ${
              isDragging
                ? 'bg-emerald-500/20 border-emerald-400 shadow-lg scale-[1.01]'
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700 text-amber-400 flex items-center justify-center font-bold shrink-0">
                {isProcessingFile ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="font-extrabold text-white text-xs sm:text-sm">
                  Importar Backup .JSON
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Clique ou arraste um ficheiro de backup aqui
                </div>
              </div>
            </div>
            <span className="text-[10px] font-extrabold bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded-lg shrink-0 border border-slate-600">
              Selecionar
            </span>
          </div>
        </div>

        {/* Firestore Sync Disclaimer Footnote */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              A nuvem Firestore sincroniza automaticamente quando há ligação à internet.
            </span>
          </div>
          {lastSyncedAt && (
            <span className="text-[10px] text-slate-500">
              Última sincronização: {new Date(lastSyncedAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* IMPORT CONFIRMATION PREVIEW MODAL */}
      {parsedPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm sm:text-base">
                    Confirmar Restauração de Backup
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Ficheiro: <strong className="text-amber-300">{parsedPreview.fileName}</strong> ({parsedPreview.fileSizeKb} KB)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setParsedPreview(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Backup Metadata Card */}
            <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Origem / Aplicação:</span>
                <span className="font-bold text-white">{parsedPreview.backupInfo.appName} v{parsedPreview.backupInfo.version}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Data de Exportação:</span>
                <span className="font-bold text-amber-300">
                  {new Date(parsedPreview.backupInfo.exportedAt).toLocaleString('pt-PT')}
                </span>
              </div>
              {parsedPreview.backupInfo.user?.email && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Conta Associada:</span>
                  <span className="font-bold text-slate-200">{parsedPreview.backupInfo.user.email}</span>
                </div>
              )}
            </div>

            {/* Content to be restored */}
            <div>
              <h5 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider mb-2">
                Dados a Restaurar &amp; Mesclar
              </h5>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-xl">
                  <div className="text-amber-400 font-black text-base">
                    {parsedPreview.backupInfo.stats?.booksWithProgressCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">Livros com Progresso</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-xl">
                  <div className="text-emerald-400 font-black text-base">
                    {parsedPreview.backupInfo.stats?.bookmarksCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">Marcadores</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-xl">
                  <div className="text-cyan-400 font-black text-base">
                    {parsedPreview.backupInfo.stats?.highlightsCount || 0}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold">Destaques / Notas</div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              💡 <strong>Nota segura:</strong> A restauração mescla os marcadores e destaques existentes com os do ficheiro de backup, sem eliminar anotações recentes, e sincroniza imediatamente com o Firestore.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setParsedPreview(null)}
                disabled={isRestoring}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A Restaurar...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Restaurar &amp; Sincronizar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
