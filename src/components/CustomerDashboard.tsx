import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  ShoppingBag, 
  Heart, 
  Share2, 
  User as UserIcon, 
  Copy, 
  Check, 
  Download, 
  Clock, 
  ShieldCheck, 
  Award,
  DollarSign,
  Sparkles,
  Compass,
  Users,
  BarChart3,
  Bell,
  UserCheck,
  UserPlus,
  Radio,
  Wifi,
  WifiOff,
  CheckCircle2,
  HardDrive,
  Zap,
  Trash2,
  Upload,
  FileText,
  Loader2,
  FileUp,
  BellRing,
  Volume2,
  VolumeX,
  Calendar,
  Flame,
  Play,
  CheckCircle,
  Bookmark,
  ArrowRight,
  Cloud
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookCard } from './BookCard';
import { SocialFeed } from './SocialFeed';
import { ReadingAnalyticsChart } from './ReadingAnalyticsChart';
import { parseEpubFile } from '../lib/epubParser';

export const CustomerDashboard: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    purchasedBooks,
    favoriteBookIds,
    books,
    orders,
    formatPrice,
    setActiveEReaderBook,
    addNotification,
    triggerDailyReadingReminderNotification,
    setIsZolaAIOpen,
    followedAuthors,
    toggleFollowAuthor,
    setSelectedBookModal,
    isOnline,
    offlineBooks,
    downloadBookForOffline,
    removeBookFromOffline,
    isBookOfflineCached,
    isBookDownloading,
    customEpubBooks,
    addCustomEpubBook,
    removeCustomEpubBook,
    setIsAccessibilityModalOpen,
    setIsReadingReportModalOpen,
    readingProgressMap,
    getBookProgress,
    bookmarks,
    removeBookmark,
    books: catalogBooks
  } = useApp();

  const inProgressBooks = React.useMemo(() => {
    return purchasedBooks
      .map(book => {
        const prog = getBookProgress(book.id);
        return {
          book,
          progress: prog || { bookId: book.id, percentage: 0, currentChapterIndex: 0, totalChapters: 1, lastReadAt: '' }
        };
      })
      .filter(item => item.progress.percentage > 0)
      .sort((a, b) => new Date(b.progress.lastReadAt || 0).getTime() - new Date(a.progress.lastReadAt || 0).getTime());
  }, [purchasedBooks, readingProgressMap, getBookProgress]);

  const lastActiveBookItem = inProgressBooks[0];

  const epubInputRef = useRef<HTMLInputElement>(null);
  const [isParsingEpub, setIsParsingEpub] = useState(false);
  const [isDraggingEpub, setIsDraggingEpub] = useState(false);

  const handleProcessEpubFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.epub')) {
      addNotification('Ficheiro Inválido', 'Por favor escolha um ficheiro com formato .epub', 'system');
      return;
    }

    setIsParsingEpub(true);
    try {
      const parsed = await parseEpubFile(file);
      addCustomEpubBook(parsed);
    } catch (err) {
      console.error('Erro ao processar .epub:', err);
      addNotification('Erro na Leitura do EPUB', 'Ocorreu uma falha ao extrair o conteúdo do ficheiro .epub.', 'system');
    } finally {
      setIsParsingEpub(false);
      if (epubInputRef.current) epubInputRef.current.value = '';
    }
  };

  const handleEpubFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessEpubFile(file);
  };

  const handleDropEpub = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingEpub(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessEpubFile(file);
  };

  const [activeTab, setActiveTab] = useState<'library' | 'stats' | 'social' | 'level' | 'authors' | 'orders' | 'affiliate' | 'reminders' | 'profile'>('library');
  const [copiedAffiliate, setCopiedAffiliate] = useState(false);

  // Daily Reading Reminder State & Handlers
  const reminderInit = currentUser.dailyReminderSettings || {
    enabled: true,
    time: '20:00',
    goalMinutes: 20,
    customMessage: 'A tua mente agradece! Reserve 20 minutos para a tua leitura de hoje na Zola Books 🇦🇴',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    pushNotificationsEnabled: true,
    soundEnabled: true
  };

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(reminderInit.enabled);
  const [reminderTime, setReminderTime] = useState<string>(reminderInit.time);
  const [reminderGoalMinutes, setReminderGoalMinutes] = useState<number>(reminderInit.goalMinutes);
  const [reminderCustomMsg, setReminderCustomMsg] = useState<string>(reminderInit.customMessage || '');
  const [reminderDays, setReminderDays] = useState<number[]>(reminderInit.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
  const [reminderSoundEnabled, setReminderSoundEnabled] = useState<boolean>(reminderInit.soundEnabled !== false);
  const [browserPushPermission, setBrowserPushPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const handleSaveReminderSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateUserProfile({
      dailyReminderSettings: {
        enabled: reminderEnabled,
        time: reminderTime,
        goalMinutes: reminderGoalMinutes,
        customMessage: reminderCustomMsg,
        daysOfWeek: reminderDays,
        pushNotificationsEnabled: true,
        soundEnabled: reminderSoundEnabled,
        lastTriggeredDate: currentUser.dailyReminderSettings?.lastTriggeredDate
      }
    });
    addNotification(
      'Lembrete Diário Atualizado ⏰',
      `Lembrete configurado para as ${reminderTime} (${reminderGoalMinutes} min/dia). Mantém o teu hábito de leitura vivo!`
    );
  };

  const handleRequestBrowserNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addNotification('Não Suportado', 'O teu navegador não suporta Notificações Push.', 'system');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserPushPermission(permission);
      if (permission === 'granted') {
        addNotification(
          'Notificações Concedidas! 🔔',
          'A Zola Books enviará alertas diretamente no teu navegador no horário agendado.'
        );
      } else {
        addNotification(
          'Permissão Negada',
          'As notificações do navegador estão bloqueadas ou foram recusadas.',
          'system'
        );
      }
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
    }
  };

  const toggleReminderDay = (dayIdx: number) => {
    if (reminderDays.includes(dayIdx)) {
      if (reminderDays.length === 1) return;
      setReminderDays(reminderDays.filter(d => d !== dayIdx));
    } else {
      setReminderDays([...reminderDays, dayIdx].sort());
    }
  };

  // Profile Form
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');

  const favoriteBooks = books.filter(b => favoriteBookIds.includes(b.id));
  const userOrders = orders.filter(o => o.userId === currentUser.id);

  // Dynamic New Books from Followed Authors Count
  const totalNewBooksFromFollowedAuthors = books.filter(b => 
    followedAuthors.some(fa => fa.toLowerCase() === b.author.toLowerCase()) && 
    (b.publishedYear >= 2024 || b.isFeatured)
  ).length;

  // Dynamic Reader Level Logic
  const purchasedCount = purchasedBooks.length;
  const favoritesCount = favoriteBookIds.length;
  const angolanAuthorsCount = purchasedBooks.filter(b => b.isAngolanAuthor).length;

  const readerLevel = purchasedCount >= 20 
    ? { number: 5, title: 'Embaixador da Cultura', icon: '👑', target: 20, color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' }
    : purchasedCount >= 10 
    ? { number: 4, title: 'Leitor Voraz', icon: '🔥', target: 20, color: 'text-orange-400 bg-orange-500/20 border-orange-500/40' }
    : purchasedCount >= 5 
    ? { number: 3, title: 'Bibliófilo do Ndongo', icon: '📚', target: 10, color: 'text-purple-400 bg-purple-500/20 border-purple-500/40' }
    : purchasedCount >= 2 
    ? { number: 2, title: 'Leitor Entusiasta', icon: '📖', target: 5, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' }
    : { number: 1, title: 'Iniciante Literário', icon: '🌱', target: 2, color: 'text-blue-400 bg-blue-500/20 border-blue-500/40' };

  const badgesList = [
    {
      id: 'first_book',
      icon: '🏅',
      title: 'Primeira Página',
      description: 'Adquiriu ou ativou o 1º e-book na Zola Books.',
      unlocked: purchasedCount >= 1,
      progressText: purchasedCount >= 1 ? 'Concluído' : `${purchasedCount}/1 e-book`,
      category: 'Leitura'
    },
    {
      id: 'voracious_reader',
      icon: '📚',
      title: 'Leitor Voraz',
      description: 'Possui 5 ou mais e-books na sua biblioteca digital.',
      unlocked: purchasedCount >= 5,
      progressText: purchasedCount >= 5 ? 'Concluído' : `${purchasedCount}/5 e-books`,
      category: 'Leitura'
    },
    {
      id: 'culture_ambassador',
      icon: '🇦🇴',
      title: 'Embaixador da Cultura',
      description: 'Adquiriu 2 ou mais obras de grandes autores angolanos.',
      unlocked: angolanAuthorsCount >= 2,
      progressText: angolanAuthorsCount >= 2 ? 'Concluído' : `${angolanAuthorsCount}/2 autores angolanos`,
      category: 'Cultura'
    },
    {
      id: 'elite_critic',
      icon: '✍️',
      title: 'Crítico de Elite',
      description: 'Contribui ativamente com avaliações e resenhas de obras.',
      unlocked: purchasedCount >= 2,
      progressText: purchasedCount >= 2 ? 'Desbloqueado' : 'Disponível após ler 2 obras',
      category: 'Comunidade'
    },
    {
      id: 'star_collector',
      icon: '⭐',
      title: 'Guardião de Favoritos',
      description: 'Adicionou 3 ou mais obras à sua lista de desejos e favoritos.',
      unlocked: favoritesCount >= 3,
      progressText: favoritesCount >= 3 ? 'Concluído' : `${favoritesCount}/3 favoritos`,
      category: 'Leitura'
    },
    {
      id: 'cloud_pioneer',
      icon: '⚡',
      title: 'Pioneiro da Nuvem',
      description: 'Sincronização Firestore ativa em tempo real entre dispositivos.',
      unlocked: true,
      progressText: 'Ativo',
      category: 'Especial'
    }
  ];

  const unlockedBadgesCount = badgesList.filter(b => b.unlocked).length;

  const handleCopyAffiliate = () => {
    const link = `https://zolabooks.ao/?ref=${currentUser.affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopiedAffiliate(true);
    setTimeout(() => setCopiedAffiliate(false), 2000);
    addNotification('Link Copiado', 'O teu link de afiliado foi copiado para a área de transferência.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, phone });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{currentUser.name}</h1>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-amber-500/30">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentUser.email} • {currentUser.phone}</p>
            <p className="text-[11px] text-amber-400 font-medium mt-1">
              🇦🇴 Membro Zola desde {currentUser.createdAt}
            </p>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-3 text-xs">
          <div 
            onClick={() => setActiveTab('level')}
            className="bg-slate-800/80 hover:bg-slate-800 p-3 rounded-2xl border border-amber-500/30 text-center min-w-[110px] cursor-pointer group transition-all"
          >
            <span className="text-slate-400 block text-[10px] group-hover:text-amber-400">Nível de Leitor</span>
            <span className="text-sm font-extrabold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
              <span>{readerLevel.icon}</span> Nível {readerLevel.number}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-center min-w-[100px]">
            <span className="text-slate-400 block text-[10px]">E-books Adquiridos</span>
            <span className="text-base font-extrabold text-amber-400">{purchasedBooks.length}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-center min-w-[100px]">
            <span className="text-slate-400 block text-[10px]">Favoritos</span>
            <span className="text-base font-extrabold text-rose-400">{favoriteBookIds.length}</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-center min-w-[100px] hidden sm:block">
            <span className="text-slate-400 block text-[10px]">Ganhos de Afiliado</span>
            <span className="text-base font-extrabold text-emerald-400">{formatPrice(currentUser.affiliateEarningsAOA, currentUser.affiliateEarningsUSD)}</span>
          </div>

          <button
            onClick={() => setIsReadingReportModalOpen(true)}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 p-3 rounded-2xl text-center min-w-[110px] cursor-pointer transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-md"
            title="Gerar e descarregar relatório personalizado em PDF com progresso e citações"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-extrabold">Relatório PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold text-slate-400 overflow-x-auto">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'library' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Minha Biblioteca ({purchasedBooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stats' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' : 'hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Progresso de Leitura</span>
          <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">Gráficos</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'social' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' : 'hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-current" />
          <span>Feed Social da Comunidade</span>
          <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">NOVO</span>
        </button>

        <button
          onClick={() => setActiveTab('authors')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap relative ${
            activeTab === 'authors' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' : 'hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4 text-current" />
          <span>Autores Seguidos ({followedAuthors.length})</span>
          {totalNewBooksFromFollowedAuthors > 0 ? (
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse">
              <Sparkles className="w-3 h-3 text-slate-950" />
              +{totalNewBooksFromFollowedAuthors} Novos
            </span>
          ) : (
            <span className="bg-purple-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">PUSH</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('level')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'level' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Nível &amp; Medalhas ({unlockedBadgesCount}/{badgesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Histórico de Pedidos ({userOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('affiliate')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'affiliate' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'hover:text-white'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Programa de Afiliados</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap relative ${
            activeTab === 'reminders' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' : 'hover:text-white'
          }`}
        >
          <BellRing className="w-4 h-4 text-current" />
          <span>Lembretes Diários</span>
          <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-amber-300">
            {reminderEnabled ? `${reminderTime}` : 'OFF'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'hover:text-white'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Definições</span>
        </button>
      </div>

      {/* Tab Content: Stats / Reading Analytics */}
      {activeTab === 'stats' && <ReadingAnalyticsChart />}

      {/* Tab Content: Social Feed */}
      {activeTab === 'social' && <SocialFeed />}

      {/* Tab Content: Library */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Recharts Monthly Progress Visualization */}
          <ReadingAnalyticsChart />

          {/* Service Worker Cache & Network Status Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  isOnline 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                }`}>
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-white">
                      {isOnline ? 'Conexão Online Ativa' : 'Modo Offline Ativado (Sem Internet)'}
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      isOnline ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {isOnline 
                      ? 'Sincronização Cloud Firestore ativa. O Service Worker pré-carrega os teus e-books para acesso offline instantâneo.'
                      : 'Estás sem internet! Podes continuar a ler todos os teus livros descarregados no E-Reader via Service Worker Cache.'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs text-amber-400 shrink-0">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold">{offlineBooks.length} e-book(s) cached offline</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                <span>Cache SW v2: E-books guardados no armazenamento local e Cache API do navegador.</span>
              </span>
              <span className="text-emerald-400 font-semibold hidden md:inline">
                ✓ Funciona sem sinal de rede ou dados móveis
              </span>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-purple-950/40 border border-amber-500/30 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0">
                <Sparkles className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  Algoritmo de Recomendação Zola IA
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                    Autores Africanos
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Analisa os teus <strong className="text-rose-400">{favoriteBookIds.length} favoritos</strong> e <strong className="text-amber-400">{purchasedBooks.length} e-books em histórico</strong> para descobrir novos autores angolanos e africanos ideais para o teu gosto.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsZolaAIOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 whitespace-nowrap transition-all"
            >
              <Compass className="w-4 h-4" />
              Obter Recomendações
            </button>
          </div>

          {/* Import EPUB Custom Books Upload Dropzone Banner */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDraggingEpub(true); }}
            onDragLeave={() => setIsDraggingEpub(false)}
            onDrop={handleDropEpub}
            className={`relative overflow-hidden bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-2 ${
              isDraggingEpub ? 'border-purple-400 bg-purple-900/40 scale-[1.01]' : 'border-purple-500/30 hover:border-purple-400/60'
            } rounded-3xl p-5 sm:p-6 transition-all shadow-xl space-y-4`}
          >
            <input 
              type="file" 
              ref={epubInputRef} 
              accept=".epub" 
              className="hidden" 
              onChange={handleEpubFileSelect} 
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold shrink-0">
                  {isParsingEpub ? (
                    <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  ) : (
                    <FileUp className="w-6 h-6 text-purple-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">Carregar Livro Digital em Formato .EPUB</h3>
                    <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-500/40 uppercase">
                      Leitor Nativo
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Arrasta um ficheiro <strong className="text-purple-300">.epub</strong> para aqui ou clica para importar qualquer e-book pessoal para a tua biblioteca com suporte a leitura offline e tradução.
                  </p>
                </div>
              </div>

              <button
                onClick={() => epubInputRef.current?.click()}
                disabled={isParsingEpub}
                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-600/30 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isParsingEpub ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A Processar EPUB...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Selecionar Ficheiro .EPUB</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Continue Reading Featured Hero Card */}
          {lastActiveBookItem && (
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Continuar a Ler • Retomar Sessão</span>
                </span>
                <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {lastActiveBookItem.progress.lastReadAt 
                      ? `Leitura recente (${new Date(lastActiveBookItem.progress.lastReadAt).toLocaleDateString('pt-AO')} às ${new Date(lastActiveBookItem.progress.lastReadAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })})` 
                      : 'Sessão Ativa'}
                  </span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <img
                  src={lastActiveBookItem.book.coverImage}
                  alt={lastActiveBookItem.book.title}
                  className="w-24 sm:w-28 aspect-[3/4] object-cover rounded-2xl shadow-xl border border-amber-500/30 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveEReaderBook(lastActiveBookItem.book)}
                />

                <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {lastActiveBookItem.book.category}
                    </span>
                    <h3 className="text-lg font-black text-white mt-1 line-clamp-1">{lastActiveBookItem.book.title}</h3>
                    <p className="text-xs text-slate-300">por <strong className="text-amber-300">{lastActiveBookItem.book.author}</strong></p>
                  </div>

                  {/* Meter progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-300 text-[11px]">
                        Capítulo {lastActiveBookItem.progress.currentChapterIndex + 1} de {lastActiveBookItem.progress.totalChapters}
                      </span>
                      <span className="text-amber-400 text-xs font-black bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        {lastActiveBookItem.progress.percentage}% Concluído
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-500 shadow-lg shadow-amber-500/20"
                        style={{ width: `${lastActiveBookItem.progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                    <button
                      onClick={() => setActiveEReaderBook(lastActiveBookItem.book)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Retomar no Cap. {lastActiveBookItem.progress.currentChapterIndex + 1} ({lastActiveBookItem.progress.percentage}%)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saved Reading Bookmarks Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                    <span>Meus Marcadores de Leitura</span>
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black px-2.5 py-0.5 rounded-full ml-1">
                      {bookmarks.length}
                    </span>
                  </h2>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span>Sincronizado Firestore</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Passagens e capítulos guardados durante a leitura no E-Reader. Clica para abrir e continuar diretamente na página marcada.
                </p>
              </div>

              {bookmarks.length > 0 && (
                <div className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {bookmarks.length} {bookmarks.length === 1 ? 'marcador guardado' : 'marcadores guardados'}
                </div>
              )}
            </div>

            {bookmarks.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-2">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Nenhum marcador de leitura guardado ainda.</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Enquanto lê qualquer e-book no E-Reader, clique no ícone de marcador para guardar páginas e citações favoritas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bkm) => {
                  const targetBook = catalogBooks.find(b => b.id === bkm.bookId) 
                    || purchasedBooks.find(b => b.id === bkm.bookId) 
                    || customEpubBooks.find(b => b.id === bkm.bookId)
                    || {
                      id: bkm.bookId,
                      title: bkm.bookTitle || 'E-Book Digital',
                      author: bkm.bookAuthor || 'Autor',
                      coverImage: bkm.bookCover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
                      category: 'Geral',
                      sampleContent: { chapters: [{ title: bkm.chapterTitle, content: bkm.snippet || '' }] }
                    };

                  return (
                    <div
                      key={bkm.id}
                      className="bg-slate-950 border border-slate-800/90 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 group transition-all relative overflow-hidden shadow-lg"
                    >
                      <div className="space-y-3">
                        {/* Book Title & Cover header */}
                        <div className="flex items-start gap-3">
                          <img
                            src={targetBook.coverImage || bkm.bookCover}
                            alt={bkm.bookTitle}
                            className="w-12 h-16 object-cover rounded-xl shadow-md border border-slate-800 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setActiveEReaderBook(targetBook as any)}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-xs text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                              {bkm.bookTitle}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{bkm.bookAuthor}</p>
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              <Bookmark className="w-2.5 h-2.5 fill-current shrink-0" />
                              <span className="truncate">{bkm.chapterTitle}</span>
                            </span>
                          </div>
                          <button
                            onClick={() => removeBookmark(bkm.id)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                            title="Remover Marcador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Snippet box */}
                        {bkm.snippet && (
                          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 italic line-clamp-3">
                            "{bkm.snippet}"
                          </div>
                        )}

                        {/* Note */}
                        {bkm.note && (
                          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-[11px] text-amber-200 font-medium">
                            <span className="font-bold">Nota:</span> {bkm.note}
                          </div>
                        )}
                      </div>

                      {/* Footer actions */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 text-[10px]">
                          {new Date(bkm.createdAt).toLocaleDateString('pt-AO')}
                        </span>

                        <button
                          onClick={() => {
                            setActiveEReaderBook(targetBook as any);
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                        >
                          <span>Abrir na Página</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Teus E-books Disponíveis no Leitor ({purchasedBooks.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifica o estado de sincronização nas capas dos livros e clica para ler offline a qualquer momento.
              </p>
            </div>

            {/* Sync State Quick Legend Bar */}
            {purchasedBooks.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 p-1.5 px-3 rounded-2xl text-[11px] font-bold text-slate-300 shrink-0">
                <span className="text-slate-400 text-[10px] uppercase font-mono mr-1">Estado:</span>
                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{purchasedBooks.filter(b => isBookOfflineCached(b.id) || customEpubBooks.some(cb => cb.id === b.id)).length} Offline</span>
                </span>
                <span className="flex items-center gap-1 text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20">
                  <Cloud className="w-3 h-3 text-sky-400" />
                  <span>{purchasedBooks.filter(b => !isBookOfflineCached(b.id) && !customEpubBooks.some(cb => cb.id === b.id)).length} Na Nuvem</span>
                </span>
              </div>
            )}
          </div>

          {purchasedBooks.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300">Ainda não tens e-books na tua biblioteca.</p>
              <p className="text-xs text-slate-500">Adquire livros ou descarrega e-books gratuitos no catálogo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {purchasedBooks.map((book) => {
                const isCached = isBookOfflineCached(book.id);
                const isDownloading = isBookDownloading(book.id);
                const isCustomEpub = customEpubBooks.some(cb => cb.id === book.id);
                const bookProgress = getBookProgress(book.id) || { percentage: 0, currentChapterIndex: 0, totalChapters: 1 };
                const pct = bookProgress.percentage;

                return (
                  <div
                    key={book.id}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-4 flex flex-col justify-between space-y-3 group transition-all relative overflow-hidden"
                  >
                    {/* Custom EPUB / Offline / Downloading Badges */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1">
                      {isDownloading && (
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-lg border border-amber-300/40 animate-pulse">
                          <Loader2 className="w-3 h-3 text-slate-950 animate-spin" />
                          <span>A descarregar...</span>
                        </span>
                      )}
                      {!isDownloading && isCustomEpub && (
                        <span className="bg-purple-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-purple-400/40">
                          <FileText className="w-3 h-3 text-purple-200" />
                          <span>EPUB Pessoal</span>
                        </span>
                      )}
                      {!isDownloading && isCached && (
                        <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                          <Zap className="w-3 h-3 text-slate-950 fill-current" />
                          <span>Cached Offline</span>
                        </span>
                      )}
                    </div>

                    <div 
                      onClick={() => setActiveEReaderBook(book)}
                      className="cursor-pointer space-y-2"
                    >
                      <div className="relative rounded-2xl overflow-hidden bg-slate-950">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className={`aspect-[3/4] object-cover rounded-2xl w-full bg-slate-950 shadow-md group-hover:scale-[1.02] transition-transform ${isDownloading ? 'brightness-50 blur-[1px]' : ''}`}
                        />
                        
                        {/* Indicador Visual do Estado de Sincronização na Capa do Livro */}
                        {!isDownloading && (
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20">
                            {isCached || isCustomEpub ? (
                              <div className="bg-slate-950/90 backdrop-blur-md border border-emerald-500/60 text-emerald-300 font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl shadow-2xl flex items-center justify-between w-full">
                                <span className="flex items-center gap-1.5 truncate">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span className="truncate">Disponível Offline</span>
                                </span>
                                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded-md border border-emerald-500/30 font-black shrink-0">
                                  PRONTO
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadBookForOffline(book);
                                }}
                                className="bg-slate-950/90 hover:bg-amber-500 hover:text-slate-950 backdrop-blur-md border border-sky-500/50 text-sky-300 font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl shadow-2xl flex items-center justify-between w-full transition-all group/btn"
                                title="Conteúdo na nuvem. Clique para descarregar e disponibilizar offline."
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <Cloud className="w-3.5 h-3.5 text-sky-400 group-hover/btn:text-slate-950 shrink-0" />
                                  <span className="truncate">Na Nuvem • Requer Redes</span>
                                </span>
                                <span className="bg-sky-500/20 group-hover/btn:bg-slate-950/30 text-sky-300 group-hover/btn:text-slate-950 text-[9px] px-1.5 py-0.2 rounded-md border border-sky-500/30 font-black shrink-0 flex items-center gap-0.5">
                                  <Download className="w-2.5 h-2.5" />
                                  SYNC
                                </span>
                              </button>
                            )}
                          </div>
                        )}

                        {isDownloading && (
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-3 text-center rounded-2xl border border-amber-500/30">
                            <div className="relative flex items-center justify-center">
                              <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                              <Download className="w-4 h-4 text-amber-300 absolute" />
                            </div>
                            <span className="text-amber-400 font-extrabold text-xs tracking-wide animate-pulse">
                              A sincronizar offline...
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Cache do Service Worker
                            </span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition-colors pt-1">{book.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">por {book.author}</p>

                      {/* Progress Percentage Meter Bar on Card */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-400 text-[10px]">Progresso</span>
                          {pct >= 100 ? (
                            <span className="text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-400" /> 100% Lido
                            </span>
                          ) : pct > 0 ? (
                            <span className="text-amber-400 bg-amber-500/20 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                              {pct}% Lido
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">0% (Por iniciar)</span>
                          )}
                        </div>

                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              pct >= 100 
                                ? 'bg-emerald-500' 
                                : pct > 0 
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                                  : 'bg-slate-800'
                            }`}
                            style={{ width: `${Math.max(pct, pct === 0 ? 0 : 5)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <button 
                        onClick={() => setActiveEReaderBook(book)}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <BookOpen className="w-4 h-4" />
                        {pct > 0 && pct < 100 
                          ? `Continuar no Cap. ${bookProgress.currentChapterIndex + 1}` 
                          : pct >= 100 
                            ? 'Reler no E-Reader' 
                            : 'Ler no E-Reader'}
                      </button>

                      {isDownloading ? (
                        <button
                          disabled
                          className="w-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[11px] py-1.5 rounded-xl flex items-center justify-center gap-2 cursor-wait shadow-inner"
                        >
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span>A descarregar p/ Offline...</span>
                        </button>
                      ) : isCached ? (
                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl text-xs">
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pronto p/ Offline
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBookFromOffline(book.id);
                            }}
                            className="text-slate-400 hover:text-rose-400 text-[10px] p-1 rounded transition-colors"
                            title="Remover do Cache SW"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadBookForOffline(book);
                          }}
                          className="w-full bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 font-bold text-[11px] py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Descarregar p/ Offline (SW)
                        </button>
                      )}

                      {isCustomEpub && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Tem a certeza que pretende remover "${book.title}" da sua biblioteca?`)) {
                              removeCustomEpubBook(book.id);
                            }
                          }}
                          className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px] py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                          title="Remover e-book pessoal da biblioteca"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remover EPUB Pessoal
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reader Level & Virtual Badges Tab */}
      {activeTab === 'level' && (
        <div className="space-y-6">
          {/* Main Level Progress Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20 shrink-0">
                  {readerLevel.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                      Nível {readerLevel.number} de 5
                    </span>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      Zola Reader Club
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white">{readerLevel.title}</h2>
                  <p className="text-xs text-slate-300">
                    O teu empenho e paixão pela leitura e literatura angolana desbloqueiam reconhecimento e vantagens exclusivas.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center min-w-[180px] shrink-0">
                <span className="text-[11px] text-slate-400 block font-semibold">Medalhas Desbloqueadas</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">
                  {unlockedBadgesCount} <span className="text-sm font-normal text-slate-500">/ {badgesList.length}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  {Math.round((unlockedBadgesCount / badgesList.length) * 100)}% da Galeria
                </span>
              </div>
            </div>

            {/* Progress Bar to Next Level */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Progresso para o próximo nível
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  {purchasedCount} / {readerLevel.target} e-books lidos
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500 shadow-md"
                  style={{ width: `${Math.min(100, Math.max(10, (purchasedCount / readerLevel.target) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Badges Gallery Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Galeria de Medalhas Virtuais</span>
              </h3>
              <span className="text-xs text-slate-400">
                Lê, avalia e guarda livros para colecionar todas as insígnias.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badgesList.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                    badge.unlocked
                      ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5 hover:border-amber-400'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-60 grayscale-[0.5]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                    badge.unlocked 
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-md' 
                      : 'bg-slate-800 border border-slate-700 text-slate-500'
                  }`}>
                    {badge.icon}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-xs text-white truncate">{badge.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        badge.unlocked
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {badge.unlocked ? 'Desbloqueado' : 'Bloqueado'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                      {badge.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 mt-2">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded text-slate-400 font-medium">
                        {badge.category}
                      </span>
                      <span className="font-mono text-amber-400 font-bold">
                        {badge.progressText}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Level Perks Section */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Benefícios do Teu Nível Literário</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 block">🏷️ Cupões Especiais de Leitor</span>
                <p className="text-slate-400 text-[11px]">
                  Descontos exclusivos acumuláveis no carrinho de compras à medida que progrides de nível.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 block">⭐ Selo de Leitor Verificado</span>
                <p className="text-slate-400 text-[11px]">
                  O teu nível e medalhas são exibidos com destaque ao deixar avaliações nas obras.
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 block">📖 Acesso Antecipado a Lançamentos</span>
                <p className="text-slate-400 text-[11px]">
                  Leitores de nível superior recebem convites para pré-vendas e amostras exclusivas de e-books angolanos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'authors' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Header Card */}
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-amber-950/50 border border-purple-500/30 p-6 rounded-3xl space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>Autores Seguidos &amp; Notificações Push In-App</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                    Zola Push
                  </span>
                </h2>
                <p className="text-xs text-slate-300">
                  Recebe avisos e notificações push no teu e-reader e e-mail sempre que os teus autores favoritos publicarem uma nova obra no catálogo.
                </p>
              </div>
            </div>
          </div>

          {/* Followed Authors Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Autores Que Estás a Seguir ({followedAuthors.length})</span>
            </h3>

            {followedAuthors.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-3">
                <p className="text-xs text-slate-400">Ainda não estás a seguir nenhum autor.</p>
                <p className="text-xs text-slate-500">Explora os autores sugeridos abaixo para começar a receber notificações push!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followedAuthors.map((authorName) => {
                  const authorBooks = books.filter(b => b.author.toLowerCase() === authorName.toLowerCase());
                  const newBooks = authorBooks.filter(b => b.publishedYear >= 2024 || b.isFeatured);
                  return (
                    <div key={authorName} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-md hover:border-amber-500/40 transition-all relative overflow-hidden">
                      {newBooks.length > 0 && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/20 border border-amber-300 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                            <span>+{newBooks.length} Novo(s)</span>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
                            {authorName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-white pr-16">{authorName}</h4>
                            <span className="text-[11px] text-slate-400 block">{authorBooks.length} obra(s) no catálogo</span>
                          </div>
                        </div>
                      </div>

                      {newBooks.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-2xl space-y-1">
                          <span className="text-[10px] uppercase font-extrabold text-amber-400 block tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Lançamento Recente do Autor:
                          </span>
                          <button
                            onClick={() => setSelectedBookModal(newBooks[0])}
                            className="text-xs text-white font-bold hover:text-amber-300 text-left line-clamp-1 underline underline-offset-2 transition-colors"
                          >
                            "{newBooks[0].title}" ({newBooks[0].publishedYear})
                          </button>
                        </div>
                      )}

                      <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-amber-300">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                          <Radio className="w-3.5 h-3.5 animate-pulse" /> Push Ativado
                        </span>
                        <span className="text-[10px] text-slate-400">Notificação In-App</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => toggleFollowAuthor(authorName)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs py-2 rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>A Seguir (Cancelar)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Suggested Authors to Follow */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Descobrir &amp; Seguir Outros Autores em Angola</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.from(new Set(books.map(b => b.author))) as string[])
                .filter(a => !followedAuthors.includes(a))
                .slice(0, 6)
                .map((authorName: string) => {
                  const authorBooks = books.filter(b => b.author.toLowerCase() === authorName.toLowerCase());
                  return (
                    <div key={authorName} className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 text-amber-400 font-black flex items-center justify-center text-sm border border-slate-700">
                          {authorName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">{authorName}</h4>
                          <span className="text-[10px] text-slate-400 block">{authorBooks.length} e-book(s)</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleFollowAuthor(authorName)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Seguir</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-white">Histórico de Pedidos e Faturas</h2>
          {userOrders.length === 0 ? (
            <p className="text-xs text-slate-500">Nenhum pedido efetuado ainda.</p>
          ) : (
            userOrders.map((ord) => (
              <div key={ord.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-mono text-amber-400 font-bold">Pedido #{ord.id}</span>
                  <span className="text-slate-400">{ord.createdAt}</span>
                </div>
                <div className="space-y-1">
                  {ord.items.map((it, idx) => (
                    <p key={idx} className="text-slate-200 font-semibold">• {it.bookTitle}</p>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-slate-400">
                  <span>Método: {ord.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {formatPrice(ord.totalAOA, ord.totalUSD)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'affiliate' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Programa de Afiliados Zola Books</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Partilhe o teu link exclusivo de indicação com amigos, leitores e redes sociais. Ganhe 10% de comissão em Kwanzas ou Dólares por cada e-book vendido através da tua recomendação!
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
            <span className="text-xs font-bold text-amber-400 block">O teu link exclusivo de afiliado:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`https://zolabooks.ao/?ref=${currentUser.affiliateCode}`}
                className="flex-1 bg-slate-900 text-xs font-mono text-slate-100 p-3 rounded-xl border border-slate-700"
              />
              <button
                onClick={handleCopyAffiliate}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
              >
                {copiedAffiliate ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAffiliate ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="space-y-6 max-w-4xl">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 p-6 rounded-3xl space-y-3 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <BellRing className="w-48 h-48 text-amber-400" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                <BellRing className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <span>Lembretes Diários de Leitura</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                    PUSH &amp; ACESSIBILIDADE
                  </span>
                </h2>
                <p className="text-xs text-slate-300">
                  Agende alertas automáticos para cultivar um hábito de leitura consistente todos os dias.
                </p>
              </div>
            </div>

            {/* Quick Test Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Sequência Atual: <strong className="text-amber-400 font-extrabold">5 Dias Consecutivos 🔥</strong></span>
              </div>

              <button
                type="button"
                onClick={() => triggerDailyReadingReminderNotification(reminderCustomMsg)}
                className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>🚀 Testar Notificação Push Agora</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveReminderSettings} className="space-y-6">
            {/* Toggle Main Switch */}
            <div className={`p-5 rounded-3xl border transition-all flex items-center justify-between gap-4 ${
              reminderEnabled 
                ? 'bg-amber-500/10 border-amber-500/40 shadow-lg' 
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
                  reminderEnabled ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Ativar Sistema de Lembrete Diário</h3>
                  <p className="text-xs text-slate-400">
                    {reminderEnabled ? 'Os lembretes estão ATIVOS e agendados para a tua rotina.' : 'Ative para receber alertas no horário configurado.'}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Main Grid Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Horário e Meta */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Horário &amp; Meta Diária</span>
                </h3>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1.5">Horário do Lembrete:</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="bg-slate-800 text-white font-mono text-base font-extrabold px-4 py-2.5 rounded-2xl border border-slate-700 outline-none focus:border-amber-500"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {['08:00', '12:30', '19:30', '20:00', '21:30'].map((preset) => (
                        <button
                          type="button"
                          key={preset}
                          onClick={() => setReminderTime(preset)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                            reminderTime === preset
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1.5">Meta de Leitura Diária (Minutos):</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[15, 20, 30, 45, 60].map((mins) => (
                      <button
                        type="button"
                        key={mins}
                        onClick={() => setReminderGoalMinutes(mins)}
                        className={`py-2.5 rounded-2xl text-xs font-black transition-all ${
                          reminderGoalMinutes === mins
                            ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1.5">Dias da Semana Agendados:</label>
                  <div className="flex justify-between gap-1">
                    {[
                      { idx: 0, label: 'D' },
                      { idx: 1, label: 'S' },
                      { idx: 2, label: 'T' },
                      { idx: 3, label: 'Q' },
                      { idx: 4, label: 'Q' },
                      { idx: 5, label: 'S' },
                      { idx: 6, label: 'S' }
                    ].map((d) => {
                      const isSelected = reminderDays.includes(d.idx);
                      return (
                        <button
                          type="button"
                          key={d.idx}
                          onClick={() => toggleReminderDay(d.idx)}
                          className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Notificações do Navegador & Som */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Notificações Push &amp; Som</span>
                </h3>

                {/* Browser Native Push Status */}
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">Push do Navegador:</span>
                    <span className={`font-black text-[10px] px-2 py-0.5 rounded-full uppercase ${
                      browserPushPermission === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {browserPushPermission === 'granted' ? 'Permissão Ativa ✅' : 'Não Ativado ⚠️'}
                    </span>
                  </div>

                  {browserPushPermission !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleRequestBrowserNotificationPermission}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-amber-300 font-bold text-xs py-2 rounded-xl border border-slate-600 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Ativar Notificações do Sistema</span>
                    </button>
                  )}
                </div>

                {/* Sound Chime Switch */}
                <div className="flex items-center justify-between bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2.5">
                    {reminderSoundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-white block">Efeito Sonoro (Chime)</span>
                      <span className="text-[10px] text-slate-400 block">Tocar tom suave no lembrete</span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={reminderSoundEnabled}
                    onChange={(e) => setReminderSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Custom Message */}
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1.5">Mensagem Motivacional:</label>
                  <textarea
                    rows={2}
                    value={reminderCustomMsg}
                    onChange={(e) => setReminderCustomMsg(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 text-xs p-3 rounded-2xl border border-slate-700 focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="Escreva a tua mensagem de incentivo personalizada..."
                  />

                  {/* Preset Message Chips */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[
                      'A tua mente agradece! 20 min de leitura hoje.',
                      'Não quebre a tua sequência de leitura! 📖🔥',
                      '15 minutos de sabedoria na Zola Books! 🇦🇴'
                    ].map((msg, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setReminderCustomMsg(msg)}
                        className="text-[10px] text-slate-400 hover:text-amber-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg transition-colors truncate max-w-full"
                      >
                        "{msg.substring(0, 32)}..."
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Guardar Configurações de Lembrete</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-xl">
          <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-extrabold text-white">Editar Perfil do Leitor</h2>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Nome Completo:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 text-xs text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">E-mail:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 text-xs text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Telefone (Angola / Internacional):</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 text-xs text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl shadow-lg"
            >
              Guardar Alterações
            </button>
          </form>

          {/* Quick Reminder Card in Profile */}
          <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-3xl space-y-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">Lembrete Diário de Leitura</h4>
                <p className="text-[11px] text-slate-400">
                  {reminderEnabled ? `Agendado diariamente às ${reminderTime} (${reminderGoalMinutes} min/dia)` : 'Desativado'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('reminders')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shrink-0"
            >
              Configurar ⏰
            </button>
          </div>

          {/* Accessibility Sound Feedback Card in Profile */}
          <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-3xl space-y-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white">Acessibilidade &amp; Feedback Sonoro</h4>
                <p className="text-[11px] text-slate-400">
                  Tons de interface para cliques em livros, adicionar ao carrinho e concluir transações.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAccessibilityModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shrink-0"
            >
              Ajustar Sons 🔊
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
