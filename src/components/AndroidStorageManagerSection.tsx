import React, { useState, useMemo } from 'react';
import { 
  HardDrive, 
  Pin, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  Sparkles, 
  RefreshCw, 
  Search, 
  Wifi, 
  Image as ImageIcon, 
  Layers, 
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FolderLock,
  Zap,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Book } from '../types';

interface AndroidStorageManagerSectionProps {
  compact?: boolean;
}

export const AndroidStorageManagerSection: React.FC<AndroidStorageManagerSectionProps> = ({ compact = false }) => {
  const {
    purchasedBooks,
    books,
    offlineBooks,
    downloadingBookIds,
    pinnedOfflineBookIds,
    isBookOfflineCached,
    isBookDownloading,
    isBookPinnedOffline,
    togglePinBookForOffline,
    setBookPinnedOffline,
    downloadBookForOffline,
    removeBookFromOffline,
    androidStorageSettings,
    updateAndroidStorageSettings,
    cleanUnpinnedOfflineCache,
    requestDevicePersistentStorage,
    isPersistentStorageGranted,
    deviceStorageEstimate,
    refreshStorageEstimate,
    pinAndDownloadAllPurchased
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pinned' | 'cached' | 'cloud'>('all');
  const [isCleaning, setIsCleaning] = useState(false);
  const [isPinningAll, setIsPinningAll] = useState(false);
  const [isRequestingPersist, setIsRequestingPersist] = useState(false);
  const [showAndroidTips, setShowAndroidTips] = useState(false);

  // Combine user's purchased books with any other books that happen to be in offline storage
  const userManageableBooks = useMemo(() => {
    const map = new Map<string, Book>();
    purchasedBooks.forEach(b => map.set(b.id, b));
    offlineBooks.forEach(b => {
      if (!map.has(b.id)) map.set(b.id, b);
    });
    // Fallback: If library is empty for new guest, show sample books from catalog
    if (map.size === 0) {
      books.slice(0, 4).forEach(b => map.set(b.id, b));
    }
    return Array.from(map.values());
  }, [purchasedBooks, offlineBooks, books]);

  const filteredBooks = useMemo(() => {
    return userManageableBooks.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const isPinned = isBookPinnedOffline(book.id);
      const isCached = isBookOfflineCached(book.id);

      if (filterMode === 'pinned') return isPinned;
      if (filterMode === 'cached') return isCached && !isPinned;
      if (filterMode === 'cloud') return !isCached;
      return true;
    });
  }, [userManageableBooks, searchQuery, filterMode, pinnedOfflineBookIds, offlineBooks]);

  const pinnedCount = useMemo(() => {
    return userManageableBooks.filter(b => isBookPinnedOffline(b.id)).length;
  }, [userManageableBooks, pinnedOfflineBookIds]);

  const cachedCount = useMemo(() => {
    return userManageableBooks.filter(b => isBookOfflineCached(b.id)).length;
  }, [userManageableBooks, offlineBooks]);

  const handleCleanUnpinned = async () => {
    setIsCleaning(true);
    try {
      await cleanUnpinnedOfflineCache();
    } finally {
      setIsCleaning(false);
    }
  };

  const handlePinAll = async () => {
    setIsPinningAll(true);
    try {
      await pinAndDownloadAllPurchased();
    } finally {
      setIsPinningAll(false);
    }
  };

  const handleRequestPersist = async () => {
    setIsRequestingPersist(true);
    try {
      await requestDevicePersistentStorage();
    } finally {
      setIsRequestingPersist(false);
    }
  };

  return (
    <div className="space-y-5 text-xs text-slate-200">
      {/* Android Header & Storage Meter */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">Armazenamento Android &amp; Cache Permanente</h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  PWA Offline
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Define quais e-books devem ser mantidos permanentemente na memória interna do teu telemóvel ou tablet.
              </p>
            </div>
          </div>

          {/* Persistent storage badge */}
          <button
            onClick={handleRequestPersist}
            disabled={isRequestingPersist || isPersistentStorageGranted}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all border shrink-0 ${
              isPersistentStorageGranted
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 cursor-default'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
            }`}
            title="Solicita permissão ao SO Android para que a memória de e-books não seja eliminada pelo sistema quando o armazenamento estiver cheio"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isPersistentStorageGranted ? 'Proteção SO Ativa 🛡️' : 'Ativar Proteção do SO'}</span>
          </button>
        </div>

        {/* Storage Bar & Quick Stats */}
        <div className="space-y-2 bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span>Espaço Ocupado pelo Zola Books:</span>
            </span>
            <span className="font-black text-amber-400">
              {deviceStorageEstimate.usageMb.toFixed(1)} MB <span className="text-slate-500 font-normal">/ {deviceStorageEstimate.quotaMb.toFixed(0)} MB disponíveis</span>
            </span>
          </div>

          {/* Progress gauge */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(3, deviceStorageEstimate.percent))}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px]">
            <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block">Total de Obras</span>
              <span className="font-extrabold text-white text-xs">{userManageableBooks.length}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900/80 border border-purple-500/30">
              <span className="text-purple-300 block font-semibold">Fixados Permanentemente</span>
              <span className="font-extrabold text-purple-400 text-xs">{pinnedCount} 📌</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900/80 border border-cyan-500/30">
              <span className="text-cyan-300 block font-semibold">Em Cache Local</span>
              <span className="font-extrabold text-cyan-400 text-xs">{cachedCount} ⚡</span>
            </div>
          </div>
        </div>

        {/* Quick Batch Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handlePinAll}
            disabled={isPinningAll || userManageableBooks.length === 0}
            className="flex-1 sm:flex-initial bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Pin className="w-3.5 h-3.5" />
            <span>{isPinningAll ? 'A Fixar Obras...' : 'Fixar Toda a Biblioteca 📌'}</span>
          </button>

          <button
            onClick={handleCleanUnpinned}
            disabled={isCleaning}
            className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            title="Remove os livros temporários do cache, mantendo intactos os que marcaste como permanentes"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{isCleaning ? 'A Libertar...' : '🧹 Limpar Não-Fixados'}</span>
          </button>

          <button
            onClick={() => refreshStorageEstimate()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Atualizar medição de espaço"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowAndroidTips(!showAndroidTips)}
            className="text-[11px] text-amber-400 hover:underline font-semibold ml-auto flex items-center gap-1 py-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showAndroidTips ? 'Ocultar Dicas Android' : 'Dicas de Otimização Android'}</span>
          </button>
        </div>

        {/* Android Tips Callout */}
        {showAndroidTips && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl space-y-2 text-[11px] text-amber-200/90 leading-relaxed">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>Como funciona a gestão de cache no Android:</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              <li><strong className="text-white">Livros Fixados Permanentemente (📌):</strong> São gravados no Cache API protegido e no LocalStorage. Mesmo que o Android faça limpeza de ficheiros temporários para libertar espaço, as tuas obras fixadas continuam disponíveis offline.</li>
              <li><strong className="text-white">Economia de Armazenamento:</strong> Ao usar a opção <em>"Limpar Não-Fixados"</em>, libertas memória interna mantendo apenas os livros que mais lês no momento.</li>
              <li><strong className="text-white">Sem Consumo de Dados:</strong> Leituras de obras em cache não consomem megabytes da tua recarga de internet.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Android Storage Optimization Switches */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h4 className="font-extrabold text-white text-xs flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Preferências de Armazenamento Inteligente</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Switch 1: Auto clean unpinned */}
          <div 
            onClick={() => updateAndroidStorageSettings({ autoCleanUnpinned: !androidStorageSettings.autoCleanUnpinned })}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              androidStorageSettings.autoCleanUnpinned
                ? 'bg-purple-950/30 border-purple-500/40 text-slate-200'
                : 'bg-slate-800/40 border-slate-800 text-slate-400'
            }`}
          >
            <div className="space-y-0.5">
              <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <FolderLock className="w-3.5 h-3.5 text-purple-400" />
                <span>Limpeza Automática de Não-Fixados</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Remove e-books lidos que não foram marcados como permanentes
              </p>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${
              androidStorageSettings.autoCleanUnpinned ? 'bg-purple-500' : 'bg-slate-700'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                androidStorageSettings.autoCleanUnpinned ? 'left-4.5' : 'left-0.5'
              }`} />
            </div>
          </div>

          {/* Switch 2: High res covers */}
          <div 
            onClick={() => updateAndroidStorageSettings({ keepHighResCovers: !androidStorageSettings.keepHighResCovers })}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              androidStorageSettings.keepHighResCovers
                ? 'bg-cyan-950/30 border-cyan-500/40 text-slate-200'
                : 'bg-slate-800/40 border-slate-800 text-slate-400'
            }`}
          >
            <div className="space-y-0.5">
              <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cache de Capas em Alta Resolução</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Guarda imagens HD no cache (desative para poupar espaço)
              </p>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${
              androidStorageSettings.keepHighResCovers ? 'bg-cyan-500' : 'bg-slate-700'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                androidStorageSettings.keepHighResCovers ? 'left-4.5' : 'left-0.5'
              }`} />
            </div>
          </div>

          {/* Switch 3: Wi-Fi Only Downloads */}
          <div 
            onClick={() => updateAndroidStorageSettings({ wifiOnlyDownload: !androidStorageSettings.wifiOnlyDownload })}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 sm:col-span-2 ${
              androidStorageSettings.wifiOnlyDownload
                ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                : 'bg-slate-800/40 border-slate-800 text-slate-400'
            }`}
          >
            <div className="space-y-0.5">
              <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Descarregar Apenas em Rede Wi-Fi (Poupança de Dados Móveis)</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Evita downloads de e-books em redes de dados móveis (Unitel / Africell)
              </p>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${
              androidStorageSettings.wifiOnlyDownload ? 'bg-emerald-500' : 'bg-slate-700'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                androidStorageSettings.wifiOnlyDownload ? 'left-4.5' : 'left-0.5'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Book Selection List for Permanent Offline Caching */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-black text-white text-sm flex items-center gap-2">
              <Pin className="w-4 h-4 text-purple-400" />
              <span>Gestão de Livros em Cache Permanente</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Marca os livros que pretendes manter permanentemente na memória do teu dispositivo.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar obra ou autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
              filterMode === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({userManageableBooks.length})
          </button>
          <button
            onClick={() => setFilterMode('pinned')}
            className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterMode === 'pinned' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Pin className="w-3 h-3" />
            <span>Fixados ({pinnedCount})</span>
          </button>
          <button
            onClick={() => setFilterMode('cached')}
            className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterMode === 'cached' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Temporários ({Math.max(0, cachedCount - pinnedCount)})</span>
          </button>
          <button
            onClick={() => setFilterMode('cloud')}
            className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterMode === 'cloud' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>Apenas Nuvem</span>
          </button>
        </div>

        {/* Books List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-950/40 rounded-xl border border-slate-800/80 text-slate-400 space-y-1">
              <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="font-bold text-slate-300">Nenhum e-book encontrado</p>
              <p className="text-[11px] text-slate-500">Tenta ajustar o termo de pesquisa ou os filtros acima.</p>
            </div>
          ) : (
            filteredBooks.map((book) => {
              const isPinned = isBookPinnedOffline(book.id);
              const isCached = isBookOfflineCached(book.id);
              const isDownloading = isBookDownloading(book.id);
              const estSizeMb = book.fileSizeMb || Number(((book.pageCount * 0.02) + 1.2).toFixed(1));

              return (
                <div 
                  key={book.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPinned 
                      ? 'bg-purple-950/25 border-purple-500/40 shadow-sm' 
                      : isCached 
                        ? 'bg-cyan-950/20 border-cyan-500/30' 
                        : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-12 h-16 object-cover rounded-xl border border-slate-700 bg-slate-950 shrink-0 shadow"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-white text-xs truncate">{book.title}</h5>
                        {isPinned && (
                          <span className="bg-purple-500/20 text-purple-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-purple-500/40 shrink-0 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Fixado
                          </span>
                        )}
                        {!isPinned && isCached && (
                          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 shrink-0">
                            ⚡ Em Cache
                          </span>
                        )}
                        {!isCached && (
                          <span className="bg-slate-700 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0">
                            ☁️ Nuvem
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{book.author}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>~{estSizeMb} MB</span>
                        <span>•</span>
                        <span>{book.pageCount} páginas</span>
                        <span>•</span>
                        <span>{book.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Permanent Switch */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {/* Toggle Pin Switch Button */}
                    <button
                      onClick={() => togglePinBookForOffline(book.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all border ${
                        isPinned
                          ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title={isPinned ? "Desafixar do cache permanente" : "Manter permanentemente em cache local para acesso offline"}
                    >
                      <Pin className={`w-3.5 h-3.5 ${isPinned ? 'rotate-45 fill-white' : ''}`} />
                      <span>{isPinned ? 'Fixado Permanente 📌' : 'Fixar Permanente'}</span>
                    </button>

                    {/* Download / Remove quick button */}
                    {!isCached ? (
                      <button
                        onClick={() => downloadBookForOffline(book)}
                        disabled={isDownloading}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shrink-0"
                        title="Descarregar para o cache offline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isDownloading ? 'A baixar...' : 'Baixar'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => removeBookFromOffline(book.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Remover do cache local"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
