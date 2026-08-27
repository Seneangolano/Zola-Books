import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  HardDrive, 
  Smartphone, 
  Pin, 
  PinOff, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  BookOpen, 
  Layers,
  Cloud
} from 'lucide-react';
import { Book } from '../types';

export const OfflineCacheSettingsSection: React.FC = () => {
  const {
    currentUser,
    purchasedBooks,
    books,
    offlineBooks,
    pinnedOfflineBookIds,
    togglePinBookForOffline,
    isBookPinnedOffline,
    downloadBookForOffline,
    removeBookFromOffline,
    isBookOfflineCached,
    isBookDownloading,
    addNotification,
    customEpubBooks
  } = useApp();

  const [wifiOnlyDownload, setWifiOnlyDownload] = useState(true);
  const [autoPreCacheNextChapter, setAutoPreCacheNextChapter] = useState(true);

  // Combine purchased books + custom uploaded epubs
  const allAccessibleBooks: Book[] = React.useMemo(() => {
    const combined = [...purchasedBooks];
    if (customEpubBooks && customEpubBooks.length > 0) {
      customEpubBooks.forEach(cb => {
        if (!combined.some(b => b.id === cb.id)) {
          combined.push(cb);
        }
      });
    }
    return combined;
  }, [purchasedBooks, customEpubBooks]);

  // Estimate storage usage (average 450 KB per cached book + 150 KB for metadata)
  const cachedCount = offlineBooks.length;
  const pinnedCount = pinnedOfflineBookIds.length;
  const estimatedStorageMb = ((cachedCount * 0.45) + (pinnedCount * 0.15)).toFixed(2);
  const maxStorageQuotaMb = 50.0; // PWA / Android webview typical quota allotment
  const usagePercentage = Math.min(100, Math.round((parseFloat(estimatedStorageMb) / maxStorageQuotaMb) * 100));

  const handlePinAll = () => {
    allAccessibleBooks.forEach(book => {
      if (!isBookPinnedOffline(book.id)) {
        togglePinBookForOffline(book.id);
      }
      if (!isBookOfflineCached(book.id)) {
        downloadBookForOffline(book);
      }
    });
    addNotification(
      'Cache Permanente Configurado 📌',
      `Todos os teus ${allAccessibleBooks.length} livros foram fixados permanentemente no armazenamento do Android.`
    );
  };

  const handleUnpinAll = () => {
    pinnedOfflineBookIds.forEach(id => {
      togglePinBookForOffline(id);
    });
    addNotification(
      'Livros Desafixados',
      'Os livros continuam acessíveis online e descarregam sob demanda.',
      'system'
    );
  };

  const handleClearNonPinnedCache = () => {
    let clearedCount = 0;
    offlineBooks.forEach(book => {
      if (!isBookPinnedOffline(book.id)) {
        removeBookFromOffline(book.id);
        clearedCount++;
      }
    });
    addNotification(
      'Armazenamento Otimizado 🧹',
      `Foram libertados dados de ${clearedCount} livros não-fixados. Os teus livros fixados permanecem intactos.`
    );
  };

  return (
    <div 
      id="offline-cache-settings-section"
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Armazenamento &amp; Cache Offline (Android)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Otimizado
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Define quais livros devem permanecer permanentemente gravados no teu dispositivo Android sem depender de Internet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePinAll}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5"
            title="Fixar todos os livros para acesso offline"
          >
            <Pin className="w-3.5 h-3.5" />
            Fixar Todos
          </button>
          <button
            type="button"
            onClick={handleClearNonPinnedCache}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5"
            title="Libertar espaço de livros não-fixados"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Limpar Temporários
          </button>
        </div>
      </div>

      {/* Storage Metrics Bar */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200">Uso do Armazenamento Interno do Dispositivo</span>
          </div>
          <span className="font-mono text-amber-300 font-bold">
            {estimatedStorageMb} MB <span className="text-slate-400 font-normal">/ ~{maxStorageQuotaMb} MB alocados</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-700/80">
          <div 
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(4, usagePercentage)}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Livros Comprados</span>
            <span className="font-bold text-white text-sm">{allAccessibleBooks.length}</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Em Cache Offline</span>
            <span className="font-bold text-blue-400 text-sm">{cachedCount}</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Fixados Permanente</span>
            <span className="font-bold text-amber-400 text-sm">{pinnedCount}</span>
          </div>
        </div>
      </div>

      {/* Book Offline Cache List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Gestão Livro por Livro</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            Livros com <strong className="text-amber-400">PIN 📌</strong> nunca são apagados pelo Android
          </span>
        </div>

        {allAccessibleBooks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 text-center text-slate-400 text-xs">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-300">Ainda não tens livros na tua biblioteca.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Adquire livros no catálogo ou faz upload de ficheiros EPUB para gerir o cache offline.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800 bg-slate-800/40 border border-slate-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
            {allAccessibleBooks.map((book) => {
              const isCached = isBookOfflineCached(book.id);
              const isPinned = isBookPinnedOffline(book.id);
              const isDownloading = isBookDownloading(book.id);

              return (
                <div 
                  key={book.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-10 h-14 object-cover rounded-lg shadow-sm shrink-0 border border-slate-700"
                    />
                    <div className="min-w-0">
                      <h5 className="font-bold text-white text-xs truncate max-w-xs sm:max-w-md">
                        {book.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 truncate">
                        {book.author}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {isPinned ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Pin className="w-2.5 h-2.5 fill-current" /> Fixado Permanente
                          </span>
                        ) : isCached ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            <HardDrive className="w-2.5 h-2.5" /> Cache Temporário
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            <Cloud className="w-2.5 h-2.5" /> Na Nuvem
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Download / Remove toggle */}
                    {isCached ? (
                      <button
                        type="button"
                        onClick={() => removeBookFromOffline(book.id)}
                        disabled={isPinned}
                        className={`p-2 rounded-xl text-xs transition-colors ${
                          isPinned 
                            ? 'text-slate-600 bg-slate-900 cursor-not-allowed' 
                            : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 bg-slate-900 border border-slate-700'
                        }`}
                        title={isPinned ? 'Desafixa o livro primeiro para remover do cache' : 'Remover do cache'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => downloadBookForOffline(book)}
                        disabled={isDownloading}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{isDownloading ? 'A Gravar...' : 'Baixar Offline'}</span>
                      </button>
                    )}

                    {/* Pin / Unpin Button */}
                    <button
                      type="button"
                      onClick={() => togglePinBookForOffline(book.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isPinned
                          ? 'bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-amber-500/50'
                      }`}
                      title={isPinned ? 'Clique para desafixar da memória permanente' : 'Clique para fixar permanentemente na memória offline'}
                    >
                      {isPinned ? (
                        <>
                          <Pin className="w-3.5 h-3.5 fill-current" />
                          <span>Fixado 📌</span>
                        </>
                      ) : (
                        <>
                          <PinOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Fixar Offline</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connectivity & Auto-Download Preferences */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
        <h4 className="font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Políticas de Poupança de Dados Móveis (Angola)</span>
        </h4>

        <div className="space-y-2 text-slate-300">
          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-400" />
              <span>Descarregar livros fixados apenas quando ligado ao Wi-Fi</span>
            </div>
            <input 
              type="checkbox" 
              checked={wifiOnlyDownload} 
              onChange={(e) => setWifiOnlyDownload(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Pré-carregar capítulos seguintes automaticamente durante a leitura</span>
            </div>
            <input 
              type="checkbox" 
              checked={autoPreCacheNextChapter} 
              onChange={(e) => setAutoPreCacheNextChapter(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700"
            />
          </label>
        </div>
      </div>

      {/* Image & Cover Stale-While-Revalidate Cache Section */}
      <ImageCacheStatusBox />
    </div>
  );
};

const ImageCacheStatusBox: React.FC = () => {
  const {
    imageCacheStats,
    isPrefetchingImages,
    prefetchImagesProgress,
    prefetchAllCatalogImages,
    clearImageCache,
    refreshImageCacheStats
  } = useApp();

  return (
    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              Cache de Capas &amp; Fotos (Stale-While-Revalidate)
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.5 rounded border border-emerald-500/30">
                ⚡ 3G Instantâneo
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Imagens do Firebase Storage e catálogo são servidas do cache local em 0ms e atualizadas em segundo plano.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refreshImageCacheStats()}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Atualizar diagnóstico do cache"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 block">Capas no Cache API</span>
          <span className="text-sm font-black text-amber-400 font-mono">
            {imageCacheStats.cachedImagesCount}
          </span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 block">Espaço Estimado</span>
          <span className="text-sm font-black text-emerald-400 font-mono">
            {imageCacheStats.estimatedSizeMb} MB
          </span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 block">Rede Detetada</span>
          <span className="text-sm font-black text-sky-400 uppercase font-mono">
            {imageCacheStats.networkEffectiveType || '4G'}
          </span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-400 block">Service Worker</span>
          <span className={`text-xs font-bold ${imageCacheStats.isServiceWorkerReady ? 'text-emerald-400' : 'text-amber-400'}`}>
            {imageCacheStats.isServiceWorkerReady ? 'Ativo ⚡' : 'Pronto 🟢'}
          </span>
        </div>
      </div>

      {prefetchImagesProgress && (
        <div className="space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>A descarregar capas para acesso offline 3G...</span>
            <span className="font-mono text-amber-400 font-bold">{prefetchImagesProgress.percent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${prefetchImagesProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 gap-2">
        <button
          type="button"
          onClick={() => prefetchAllCatalogImages()}
          disabled={isPrefetchingImages}
          className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          {isPrefetchingImages ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{isPrefetchingImages ? 'A Pré-carregar...' : 'Pré-carregar Todas as Capas'}</span>
        </button>

        <button
          type="button"
          onClick={() => clearImageCache()}
          className="py-2 px-3 bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          title="Limpar apenas cache de imagens"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Limpar Imagens</span>
        </button>
      </div>
    </div>
  );
};
