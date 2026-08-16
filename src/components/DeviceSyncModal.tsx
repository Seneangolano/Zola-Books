import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cloud, 
  CloudRain, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Smartphone, 
  Clock, 
  Database, 
  Activity, 
  Trash2, 
  Search, 
  Filter, 
  BookOpen, 
  Bookmark, 
  Highlighter, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Info, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Laptop, 
  Wifi, 
  WifiOff,
  Sparkles
} from 'lucide-react';
import { SyncHistoryEntry, SyncActionType } from '../types';
import { formatDurationMs } from '../lib/syncManager';
import { UserSyncData } from '../lib/firebase';

export const DeviceSyncModal: React.FC = () => {
  const {
    isDeviceSyncModalOpen,
    setIsDeviceSyncModalOpen,
    currentUser,
    cloudSyncStatus,
    lastSyncedAt,
    syncHistory,
    forceUploadToCloud,
    forceDownloadFromCloud,
    forceBidirectionalSync,
    testCloudConnection,
    clearSyncHistoryLog,
    getRemoteSyncDataPreview,
    favoriteBookIds,
    readingProgressMap,
    bookmarks,
    highlights,
    pinnedOfflineBookIds,
    isOnline,
    requireAuth
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'history' | 'compare'>('overview');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'upload' | 'download' | 'bidirectional' | 'diagnostic'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Operation loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isBidirectionalSyncing, setIsBidirectionalSyncing] = useState(false);
  const [isTestingLatency, setIsTestingLatency] = useState(false);
  const [isRefreshingPreview, setIsRefreshingPreview] = useState(false);

  // Connection & Remote Preview State
  const [latencyResult, setLatencyResult] = useState<{ latencyMs: number; message: string; timestamp: Date } | null>(null);
  const [remoteDataPreview, setRemoteDataPreview] = useState<UserSyncData | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch initial remote preview when modal opens
  useEffect(() => {
    if (isDeviceSyncModalOpen && currentUser?.email) {
      loadRemotePreview();
    }
  }, [isDeviceSyncModalOpen, currentUser?.email]);

  const loadRemotePreview = async () => {
    setIsRefreshingPreview(true);
    try {
      const data = await getRemoteSyncDataPreview();
      setRemoteDataPreview(data);
    } catch (e) {
      console.warn('Erro ao carregar prévia remota:', e);
    } finally {
      setIsRefreshingPreview(false);
    }
  };

  const showFeedback = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 5000);
  };

  if (!isDeviceSyncModalOpen) return null;

  const handleUpload = async () => {
    if (!currentUser?.email) {
      requireAuth('Inicia sessão para sincronizar os teus dados na nuvem Firestore.');
      return;
    }
    setIsUploading(true);
    setFeedbackMessage(null);
    try {
      const res = await forceUploadToCloud();
      if (res.success) {
        showFeedback(res.message, 'success');
        loadRemotePreview();
      } else {
        showFeedback(res.message, 'error');
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Erro ao realizar upload.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!currentUser?.email) {
      requireAuth('Inicia sessão para descarregar os teus dados da nuvem Firestore.');
      return;
    }
    setIsDownloading(true);
    setFeedbackMessage(null);
    try {
      const res = await forceDownloadFromCloud();
      if (res.success) {
        showFeedback(res.message, 'success');
        loadRemotePreview();
      } else {
        showFeedback(res.message, 'error');
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Erro ao realizar download.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBidirectional = async () => {
    if (!currentUser?.email) {
      requireAuth('Inicia sessão para sincronizar os teus dados.');
      return;
    }
    setIsBidirectionalSyncing(true);
    setFeedbackMessage(null);
    try {
      const res = await forceBidirectionalSync();
      if (res.success) {
        showFeedback(res.message, 'success');
        loadRemotePreview();
      } else {
        showFeedback(res.message, 'error');
      }
    } catch (err: any) {
      showFeedback(err?.message || 'Erro ao sincronizar.', 'error');
    } finally {
      setIsBidirectionalSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingLatency(true);
    try {
      const res = await testCloudConnection();
      setLatencyResult({
        latencyMs: res.latencyMs,
        message: res.message,
        timestamp: new Date()
      });
      showFeedback(res.message, res.success ? 'success' : 'error');
    } catch (err: any) {
      showFeedback(err?.message || 'Falha no teste de conexão.', 'error');
    } finally {
      setIsTestingLatency(false);
    }
  };

  // Filter history logs
  const filteredHistory = syncHistory.filter(item => {
    const matchesFilter = 
      historyFilter === 'all' ? true :
      historyFilter === 'upload' ? item.action === 'upload' :
      historyFilter === 'download' ? item.action === 'download' :
      historyFilter === 'bidirectional' ? item.action === 'bidirectional' :
      historyFilter === 'diagnostic' ? (item.action === 'test_connection' || item.direction === 'diagnostic') : true;

    const matchesSearch = 
      !historySearch || 
      item.summary.toLowerCase().includes(historySearch.toLowerCase()) ||
      (item.details?.deviceInfo && item.details.deviceInfo.toLowerCase().includes(historySearch.toLowerCase())) ||
      (item.userEmail && item.userEmail.toLowerCase().includes(historySearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Firestore Sincronizado
          </span>
        );
      case 'syncing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
            A Sincronizar...
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <WifiOff className="w-3 h-3 text-amber-500" />
            Modo Offline (Cache Local)
          </span>
        );
      case 'error':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3 text-rose-500" />
            Erro na Nuvem
          </span>
        );
    }
  };

  const getActionBadge = (action: SyncActionType, direction: string) => {
    switch (action) {
      case 'upload':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ArrowUpRight className="w-3 h-3" /> Upload Local ➔ Nuvem
          </span>
        );
      case 'download':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <ArrowDownLeft className="w-3 h-3" /> Download Nuvem ➔ Local
          </span>
        );
      case 'bidirectional':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <RefreshCw className="w-3 h-3" /> Bidirecional (Merge)
          </span>
        );
      case 'test_connection':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Activity className="w-3 h-3" /> Diagnóstico de Rede
          </span>
        );
      case 'auto_sync':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <Cloud className="w-3 h-3" /> Auto Real-time
          </span>
        );
    }
  };

  const localPurchasedCount = currentUser?.purchasedBookIds?.length || 0;
  const localFavoritesCount = favoriteBookIds?.length || 0;
  const localProgressCount = Object.keys(readingProgressMap || {}).length;
  const localBookmarksCount = bookmarks?.length || 0;
  const localHighlightsCount = highlights?.length || 0;
  const localPinnedCount = pinnedOfflineBookIds?.length || 0;

  const remotePurchasedCount = remoteDataPreview?.purchasedBookIds?.length ?? '-';
  const remoteFavoritesCount = remoteDataPreview?.favoriteBookIds?.length ?? '-';
  const remoteProgressCount = remoteDataPreview?.readingProgressMap ? Object.keys(remoteDataPreview.readingProgressMap).length : '-';
  const remoteBookmarksCount = remoteDataPreview?.bookmarks?.length ?? '-';
  const remoteHighlightsCount = remoteDataPreview?.highlights?.length ?? '-';

  return (
    <div 
      id="device-sync-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsDeviceSyncModalOpen(false);
      }}
    >
      <div 
        id="device-sync-modal-container"
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Sincronização de Dispositivos
                </h2>
                {getStatusBadge(cloudSyncStatus)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Harmonização de leitura, compras e anotações via Google Cloud Firestore
              </p>
            </div>
          </div>

          <button
            id="close-device-sync-modal-btn"
            onClick={() => setIsDeviceSyncModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if available */}
        {feedbackMessage && (
          <div 
            className={`px-5 py-3 text-xs font-medium flex items-center justify-between transition-all ${
              feedbackMessage.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-b border-emerald-500/20' 
                : feedbackMessage.type === 'error'
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-b border-rose-500/20'
                : 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-b border-blue-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {feedbackMessage.type === 'error' && <XCircle className="w-4 h-4 text-rose-500" />}
              {feedbackMessage.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
              <span>{feedbackMessage.text}</span>
            </div>
            <button 
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          <button
            id="tab-sync-overview-btn"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Database className="w-4 h-4" />
            Painel Geral
          </button>

          <button
            id="tab-sync-actions-btn"
            onClick={() => setActiveTab('actions')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'actions'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Controlos Manuais (Upload / Download)
          </button>

          <button
            id="tab-sync-compare-btn"
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'compare'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            Comparativo Local vs Nuvem
          </button>

          <button
            id="tab-sync-history-btn"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            Histórico Firestore ({syncHistory.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Top Quick Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-medium">Estado da Conexão</span>
                    <Cloud className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {isOnline ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Firestore Online
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        Modo Offline
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {lastSyncedAt ? (
                      <>Última sincronização: <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(lastSyncedAt).toLocaleTimeString('pt-AO')}</span></>
                    ) : (
                      'Pendente de primeira sincronização'
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-medium">Conta Ativa</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.email || 'Visitante Anónimo'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <span>Role:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400 capitalize">{currentUser?.role || 'leitor'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-medium">Latência da Nuvem</span>
                    <Activity className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {latencyResult ? `${latencyResult.latencyMs} ms` : 'Não medido'}
                  </div>
                  <button
                    id="quick-test-latency-btn"
                    onClick={handleTestConnection}
                    disabled={isTestingLatency}
                    className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline mt-1 flex items-center gap-1 disabled:opacity-50"
                  >
                    {isTestingLatency ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                    {isTestingLatency ? 'A testar...' : 'Testar Latência Agora'}
                  </button>
                </div>
              </div>

              {/* Quick Actions Hero Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Sincronização em Tempo Real Zola Cloud
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                      A Zola Books utiliza o Firestore para sincronizar automaticamente cada página lida, marcador e anotação feita em qualquer dispositivo (Android, iPhone, iPad, PC ou Mac).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="hero-force-bidirectional-btn"
                      onClick={handleBidirectional}
                      disabled={isBidirectionalSyncing}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isBidirectionalSyncing ? 'animate-spin' : ''}`} />
                      {isBidirectionalSyncing ? 'A Sincronizar...' : 'Sincronizar Tudo Agora'}
                    </button>
                  </div>
                </div>

                {/* Multi-Device Support Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="text-[11px] truncate">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Android &amp; PWA</span>
                      <span className="text-slate-500">Cache offline ativo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <Laptop className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="text-[11px] truncate">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Desktop / Web</span>
                      <span className="text-slate-500">Sincronia instantânea</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="text-[11px] truncate">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Segurança Zola</span>
                      <span className="text-slate-500">Firestore Rules</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40">
                    <Bookmark className="w-4 h-4 text-purple-500 shrink-0" />
                    <div className="text-[11px] truncate">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">Posição de Leitura</span>
                      <span className="text-slate-500">Reconciliação</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Local Counts Summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Entidades Locais prontas para Sincronização
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                    <ShoppingBag className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{localPurchasedCount}</div>
                    <div className="text-[11px] text-slate-500">Comprados</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                    <BookOpen className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{localProgressCount}</div>
                    <div className="text-[11px] text-slate-500">Com Progresso</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                    <Bookmark className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{localBookmarksCount}</div>
                    <div className="text-[11px] text-slate-500">Marcadores</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                    <Highlighter className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{localHighlightsCount}</div>
                    <div className="text-[11px] text-slate-500">Destaques/Notas</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                    <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{localFavoritesCount}</div>
                    <div className="text-[11px] text-slate-500">Favoritos</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                    <Smartphone className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{localPinnedCount}</div>
                    <div className="text-[11px] text-slate-500">Fixados Offline</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Mini List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Últimas Operações Registadas
                  </h4>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                  >
                    Ver Histórico Completo ({syncHistory.length}) ➔
                  </button>
                </div>

                {syncHistory.slice(0, 3).map(entry => (
                  <div 
                    key={entry.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {entry.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {entry.summary}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(entry.timestamp).toLocaleString('pt-AO')} • {formatDurationMs(entry.details?.durationMs)}
                        </span>
                      </div>
                    </div>

                    <div>
                      {getActionBadge(entry.action, entry.direction)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL ACTIONS */}
          {activeTab === 'actions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm mb-0.5">Sincronização Sob Demanda</span>
                  Podes forçar o envio manual de dados locais para a nuvem ou puxar os dados do Firestore para recuperar a tua biblioteca num novo dispositivo.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manual Upload Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Upload Manual (Local ➔ Nuvem)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Envia o estado atual deste dispositivo (livros adquiridos, capítulos em leitura, marcadores, destaques e favoritos) para o Firestore, sobrescrevendo a nuvem com os dados deste dispositivo.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <button
                      id="force-upload-cloud-btn"
                      onClick={handleUpload}
                      disabled={isUploading || isDownloading || isBidirectionalSyncing}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <UploadCloud className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                      {isUploading ? 'A Realizar Upload...' : 'Forçar Upload para Nuvem'}
                    </button>
                  </div>
                </div>

                {/* Manual Download Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <DownloadCloud className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Download Manual (Nuvem ➔ Local)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Descarrega o documento guardado no Firestore para este dispositivo. Ideal ao mudar de telemóvel ou ao aceder no computador para carregar os livros e marcadores salvos anteriormente.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <button
                      id="force-download-cloud-btn"
                      onClick={handleDownload}
                      disabled={isUploading || isDownloading || isBidirectionalSyncing}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <DownloadCloud className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                      {isDownloading ? 'A Descarregar...' : 'Puxar Dados da Nuvem'}
                    </button>
                  </div>
                </div>

                {/* Bidirectional Merge Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Sincronização Bidirecional (Merge)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Reconcilia inteligentemente os dados locais com os remotos, unindo compras, favoritos e selecionando o progresso mais recente para cada livro.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <button
                      id="force-bidirectional-btn"
                      onClick={handleBidirectional}
                      disabled={isUploading || isDownloading || isBidirectionalSyncing}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isBidirectionalSyncing ? 'animate-spin' : ''}`} />
                      {isBidirectionalSyncing ? 'A Reconciliar...' : 'Executar Merge Bidirecional'}
                    </button>
                  </div>
                </div>

                {/* Diagnostic Latency Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Diagnóstico de Conectividade
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Executa um ping de validação direta contra os servidores do Firestore para medir a estabilidade da ligação e o tempo de resposta em milissegundos.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <button
                      id="force-test-connection-btn"
                      onClick={handleTestConnection}
                      disabled={isTestingLatency}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Activity className={`w-4 h-4 ${isTestingLatency ? 'animate-pulse' : ''}`} />
                      {isTestingLatency ? 'A Testar Ligação...' : 'Testar Conexão ao Firestore'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPARE LOCAL VS CLOUD */}
          {activeTab === 'compare' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Matriz Comparativa de Dados
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verifica as discrepâncias entre os dados guardados neste dispositivo e o snapshot no Firestore
                  </p>
                </div>

                <button
                  id="refresh-compare-data-btn"
                  onClick={loadRemotePreview}
                  disabled={isRefreshingPreview}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPreview ? 'animate-spin' : ''}`} />
                  {isRefreshingPreview ? 'A Ler Firestore...' : 'Atualizar Matriz'}
                </button>
              </div>

              {/* Matrix Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">Categoria de Dados</th>
                      <th className="p-3.5 text-center">Neste Dispositivo (Local)</th>
                      <th className="p-3.5 text-center">No Firestore (Nuvem)</th>
                      <th className="p-3.5 text-center">Estado de Sincronia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                    <tr>
                      <td className="p-3.5 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-500" />
                        Livros Adquiridos / Comprados
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        {localPurchasedCount}
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-600 dark:text-amber-400">
                        {remotePurchasedCount}
                      </td>
                      <td className="p-3.5 text-center">
                        {localPurchasedCount === remotePurchasedCount ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Alinhado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" /> Discrepância
                          </span>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3.5 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        Progresso de Leitura dos Livros
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        {localProgressCount}
                      </td>
                      <td className="p-3.5 text-center font-bold text-blue-600 dark:text-blue-400">
                        {remoteProgressCount}
                      </td>
                      <td className="p-3.5 text-center">
                        {localProgressCount === remoteProgressCount ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Alinhado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" /> Discrepância
                          </span>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3.5 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-purple-500" />
                        Marcadores de Página
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        {localBookmarksCount}
                      </td>
                      <td className="p-3.5 text-center font-bold text-purple-600 dark:text-purple-400">
                        {remoteBookmarksCount}
                      </td>
                      <td className="p-3.5 text-center">
                        {localBookmarksCount === remoteBookmarksCount ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Alinhado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" /> Discrepância
                          </span>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3.5 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <Highlighter className="w-4 h-4 text-emerald-500" />
                        Destaques e Notas Coloridas
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        {localHighlightsCount}
                      </td>
                      <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {remoteHighlightsCount}
                      </td>
                      <td className="p-3.5 text-center">
                        {localHighlightsCount === remoteHighlightsCount ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Alinhado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" /> Discrepância
                          </span>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3.5 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        Livros Marcados como Favoritos
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        {localFavoritesCount}
                      </td>
                      <td className="p-3.5 text-center font-bold text-rose-600 dark:text-rose-400">
                        {remoteFavoritesCount}
                      </td>
                      <td className="p-3.5 text-center">
                        {localFavoritesCount === remoteFavoritesCount ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Alinhado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" /> Discrepância
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {remoteDataPreview?.lastSyncedAt 
                    ? `Último snapshot remoto gerado em: ${new Date(remoteDataPreview.lastSyncedAt).toLocaleString('pt-AO')}` 
                    : 'Nenhum snapshot remoto no Firestore'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Enviar Local ➔ Nuvem
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    Receber Nuvem ➔ Local
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYNC HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-fade-in">
              {/* History Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setHistoryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      historyFilter === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Todos ({syncHistory.length})
                  </button>
                  <button
                    onClick={() => setHistoryFilter('upload')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      historyFilter === 'upload'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Uploads (⬆️)
                  </button>
                  <button
                    onClick={() => setHistoryFilter('download')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      historyFilter === 'download'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Downloads (⬇️)
                  </button>
                  <button
                    onClick={() => setHistoryFilter('bidirectional')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      historyFilter === 'bidirectional'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Merge (🔄)
                  </button>
                  <button
                    onClick={() => setHistoryFilter('diagnostic')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      historyFilter === 'diagnostic'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Diagnósticos (🩺)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Pesquisar histórico..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    id="clear-sync-history-btn"
                    onClick={clearSyncHistoryLog}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Limpar Histórico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3">
                {filteredHistory.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                    <Cloud className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                    <span className="font-semibold block text-sm text-slate-700 dark:text-slate-300">
                      Nenhum registo de sincronização encontrado
                    </span>
                    Tenta ajustar o filtro ou efetua uma sincronização manual.
                  </div>
                ) : (
                  filteredHistory.map(entry => {
                    const isExpanded = expandedLogId === entry.id;
                    return (
                      <div 
                        key={entry.id}
                        className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all text-xs"
                      >
                        <div 
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors"
                          onClick={() => setExpandedLogId(isExpanded ? null : entry.id)}
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="mt-0.5 sm:mt-0">
                              {entry.status === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : entry.status === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-500" />
                              )}
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {entry.summary}
                                </span>
                                {getActionBadge(entry.action, entry.direction)}
                              </div>

                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                                <span>{new Date(entry.timestamp).toLocaleString('pt-AO')}</span>
                                <span>•</span>
                                <span>{entry.details?.deviceInfo || 'Dispositivo Web'}</span>
                                {entry.details?.durationMs !== undefined && (
                                  <>
                                    <span>•</span>
                                    <span className="font-medium text-slate-600 dark:text-slate-300">
                                      {formatDurationMs(entry.details.durationMs)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {entry.details?.totalEntities !== undefined && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                                {entry.details.totalEntities} itens
                              </span>
                            )}
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Technical Details */}
                        {isExpanded && (
                          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 text-[11px] space-y-2">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-300 font-medium">
                              <div>Livros Comprados: <span className="font-bold text-slate-900 dark:text-white">{entry.details?.purchasedCount ?? '-'}</span></div>
                              <div>Progresso Leitura: <span className="font-bold text-slate-900 dark:text-white">{entry.details?.progressCount ?? '-'}</span></div>
                              <div>Marcadores: <span className="font-bold text-slate-900 dark:text-white">{entry.details?.bookmarksCount ?? '-'}</span></div>
                              <div>Destaques / Notas: <span className="font-bold text-slate-900 dark:text-white">{entry.details?.highlightsCount ?? '-'}</span></div>
                            </div>

                            {entry.details?.error && (
                              <div className="p-2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono text-[10px]">
                                Erro técnico: {entry.details.error}
                              </div>
                            )}

                            <div className="text-[10px] text-slate-400 font-mono pt-1">
                              ID do Registo: {entry.id} • Utilizador: {entry.userEmail || 'Anónimo'}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>Firestore Applet ID: <code className="font-mono text-slate-700 dark:text-slate-300">ai-studio-remixzolabooks-6a06b276</code></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="device-sync-footer-close-btn"
              onClick={() => setIsDeviceSyncModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
