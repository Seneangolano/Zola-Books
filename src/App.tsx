import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { NewReleasesCarousel } from './components/NewReleasesCarousel';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { EReaderModal } from './components/EReaderModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AuthorDashboard } from './components/AuthorDashboard';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { BookClubsSection } from './components/BookClubsSection';
import { ZolaAIAssistantModal } from './components/ZolaAIAssistantModal';
import { SupportWhatsAppDrawer } from './components/SupportWhatsAppDrawer';
import { AppDownloadModal } from './components/AppDownloadModal';
import { Android15DiagnosticModal } from './components/Android15DiagnosticModal';
import { AccessibilityModal } from './components/AccessibilityModal';
import { RoadmapModal } from './components/RoadmapModal';
import { TemporaryTestLinkModal } from './components/TemporaryTestLinkModal';
import { ReadingReportPdfModal } from './components/ReadingReportPdfModal';
import { AuthorProfileModal } from './components/AuthorProfileModal';
import { TagFilterBar } from './components/TagFilterBar';
import { VoiceSearchButton } from './components/VoiceSearchButton';
import { InAppPushNotificationBanner } from './components/InAppPushNotificationBanner';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Book } from './types';
import { syncUserDataToFirestore } from './lib/firebase';
import { 
  Sparkles, 
  BookOpen, 
  Heart, 
  Search, 
  Filter, 
  MessageCircle, 
  Smartphone, 
  ShieldCheck, 
  Award,
  X,
  Bell,
  Key
} from 'lucide-react';

export function App() {
  const {
    activeView,
    setActiveView,
    books,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeEReaderBook,
    setActiveEReaderBook,
    isAuthModalOpen,
    setIsZolaAIOpen,
    setIsSupportWhatsAppOpen,
    favoriteBookIds,
    notifications,
    dismissNotification,
    theme,
    bookClubs,
    joinBookClub,
    leaveBookClub,
    addDiscussionToClub,
    addCommentToDiscussion,
    toggleLikeDiscussion,
    createNewBookClub,
    isAccessibilityModalOpen,
    setIsAccessibilityModalOpen,
    isRoadmapModalOpen,
    setIsRoadmapModalOpen,
    isTestLinkModalOpen,
    setIsTestLinkModalOpen,
    testLinkDefaultBook,
    activeTestPass,
    setActiveTestPass,
    isReadingReportModalOpen,
    setIsReadingReportModalOpen,
    selectedTag,
    setSelectedTag,
    readingProgressMap,
    currentUser,
    bookmarks,
    highlights
  } = useApp();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [inspectedBook, setInspectedBook] = useState<Book | null>(null);

  // Android 15 Edge-to-Edge & Visual Viewport Keyboard Adjustment Hook
  useEffect(() => {
    const handleVisualViewportChange = () => {
      if (typeof window !== 'undefined') {
        const vv = window.visualViewport;
        const height = vv ? vv.height : window.innerHeight;
        const width = vv ? vv.width : window.innerWidth;
        
        // CSS Custom Properties for Android 15 edge-to-edge
        document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
        document.documentElement.style.setProperty('--vv-height', `${height}px`);
        document.documentElement.style.setProperty('--vv-width', `${width}px`);
        
        // Calculate soft-keyboard height displacement if visualViewport shrinks
        const keyboardHeight = Math.max(0, window.innerHeight - height);
        document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      }
    };

    handleVisualViewportChange();

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange);
    }
    window.addEventListener('resize', handleVisualViewportChange);

    return () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportChange);
      }
      window.removeEventListener('resize', handleVisualViewportChange);
    };
  }, []);

  // Monitor activeEReaderBook readingProgress and automatically sync to Firestore on page changes or unexpected tab closes
  useEffect(() => {
    if (!activeEReaderBook || !activeEReaderBook.id) return;

    const bookId = activeEReaderBook.id;
    const progress = readingProgressMap ? readingProgressMap[bookId] : undefined;
    if (!progress) return;

    const userIdOrEmail = currentUser?.email || currentUser?.id || 'guest-user';

    const performSync = async () => {
      try {
        await syncUserDataToFirestore({
          id: userIdOrEmail,
          name: currentUser?.name || 'Leitor Zola',
          email: currentUser?.email || '',
          role: currentUser?.role || 'customer',
          purchasedBookIds: currentUser?.purchasedBookIds || [],
          favoriteBookIds: favoriteBookIds || [],
          readingProgressMap: readingProgressMap || {},
          bookmarks: bookmarks || [],
          highlights: highlights || []
        });
      } catch (err) {
        console.warn('Erro ao auto-sincronizar progresso de leitura no Firestore:', err);
      }
    };

    // Debounce sync on page transitions / scrolling
    const timeout = setTimeout(() => {
      performSync();
    }, 600);

    // Save immediately on tab close or window hide to guarantee zero progress loss
    const handleBeforeUnload = () => {
      performSync();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        performSync();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    activeEReaderBook,
    readingProgressMap ? readingProgressMap[activeEReaderBook?.id || ''] : null,
    currentUser,
    favoriteBookIds,
    bookmarks,
    highlights
  ]);

  // Filtered books for home/catalog with multi-tag support
  const filteredBooks = books.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)));

    const matchesCat =
      selectedCategory === 'Todos' || b.category === selectedCategory;

    const matchesTag =
      !selectedTag || selectedTag === 'Todas' || (b.tags && b.tags.includes(selectedTag));

    return matchesSearch && matchesCat && matchesTag;
  });

  const categoriesList = [
    'Todos',
    'Literatura Angolana',
    'Ficção',
    'Não-Ficção',
    'Negócios & Finanças',
    'Tecnologia',
    'Poesia'
  ];

  const angolanAuthorsBooks = books.filter((b) => b.isAngolanAuthor);
  const favoriteBooksList = books.filter((b) => favoriteBookIds.includes(b.id));

  // Dynamic SEO title & description for Search Engine Optimization (react-helmet-async)
  let pageTitle = "Zola Books — Livraria Digital de Angola & E-Reader Offline";
  let pageDescription = "Descubra clássicos angolanos e e-books internacionais na Zola Books. Pagamento fácil em Kwanzas por Multicaixa Express, BAI e Cartão Internacional com suporte a leitura offline.";

  if (searchQuery) {
    pageTitle = `Pesquisando por "${searchQuery}" | Zola Books Angola`;
    pageDescription = `Resultados da pesquisa por e-books "${searchQuery}" no catálogo digital da Zola Books.`;
  } else if (selectedCategory !== 'Todos') {
    pageTitle = `E-books de ${selectedCategory} | Zola Books Angola`;
    pageDescription = `Explore os melhores e-books e livros digitais na categoria ${selectedCategory}. Compra imediata em Kwanzas.`;
  } else if (activeView === 'my-library') {
    pageTitle = "Minha Biblioteca Digital | Zola Books";
    pageDescription = "Aceda e leia os seus e-books descarregados no E-Reader digital Zola Books com suporte a Service Worker offline.";
  } else if (activeView === 'author') {
    pageTitle = "Painel do Autor & Publicação | Zola Books";
    pageDescription = "Publique as suas obras literárias, acompanhe vendas e receba 85% de margem no ecossistema Zola Books.";
  } else if (activeView === 'book_clubs') {
    pageTitle = "Clubes de Leitura & Grupos de Debate | Zola Books Angola";
    pageDescription = "Participe em grupos de discussão literária organizados por gêneros e autores angolanos e internacionais na Zola Books.";
  } else if (activeView === 'admin') {
    pageTitle = "Painel Administrativo | Zola Books Angola";
  }

  return (
    <div className={`min-h-screen min-h-screen-vv keyboard-aware-pb flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 ${
      theme === 'light' ? 'light bg-slate-50 text-slate-900' : 'dark bg-slate-950 text-slate-100'
    }`}>
      
      {/* Dynamic SEO Head Tags via react-helmet-async */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="Zola Books, E-books Angola, Literatura Angolana, Livraria Digital Luanda, Ler Livros Online, Multicaixa Express, Pepetela, Agostinho Neto, Jose Eduardo Agualusa, E-reader Offline" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Zola Books" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=1200" />

        {/* JSON-LD Structured Data Schema for Bookstore Organization & Books with AggregateRating and Review */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BookStore",
                "@id": "https://zolabooks.ao/#bookstore",
                "name": "Zola Books",
                "description": "A maior livraria digital de Angola com suporte a e-books angolanos e internacionais com e-reader offline.",
                "url": "https://zolabooks.ao",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Luanda",
                  "addressCountry": "AO"
                },
                "paymentAccepted": "Multicaixa Express, Transferência IBAN, BAI, Cartão de Crédito",
                "priceRange": "1500 Kz - 15000 Kz"
              },
              ...books.map((book) => ({
                "@type": "Book",
                "@id": `https://zolabooks.ao/book/${book.id}`,
                "name": book.title,
                "alternateName": book.subtitle,
                "author": {
                  "@type": "Person",
                  "name": book.author
                },
                "isbn": book.isbn || `ZB-ISBN-${book.id}`,
                "publisher": {
                  "@type": "Organization",
                  "name": book.publisher || "Zola Books Editora"
                },
                "datePublished": book.publishedYear ? String(book.publishedYear) : "2024",
                "inLanguage": book.language === 'Português' ? 'pt-AO' : book.language === 'Inglês' ? 'en' : 'fr',
                "image": book.coverImage,
                "description": book.description,
                "numberOfPages": book.pageCount,
                "genre": book.category,
                "offers": {
                  "@type": "Offer",
                  "price": book.priceAOA,
                  "priceCurrency": "AOA",
                  "availability": "https://schema.org/InStock",
                  "seller": {
                    "@type": "Organization",
                    "name": "Zola Books"
                  }
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": book.rating || 4.8,
                  "ratingCount": book.reviewCount || 12,
                  "reviewCount": book.reviewCount || 12,
                  "bestRating": "5",
                  "worstRating": "1"
                },
                "review": [
                  {
                    "@type": "Review",
                    "author": {
                      "@type": "Person",
                      "name": "Leitor Verificado Zola Books"
                    },
                    "datePublished": `${book.publishedYear || 2024}-01-15`,
                    "reviewRating": {
                      "@type": "Rating",
                      "ratingValue": Math.min(5, Math.max(1, Math.round(book.rating || 5))),
                      "bestRating": "5",
                      "worstRating": "1"
                    },
                    "reviewBody": `Excelente obra "${book.title}" por ${book.author}. Leitura indispensável disponível no catálogo digital da Zola Books.`
                  }
                ]
              }))
            ]
          })}
        </script>
      </Helmet>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 z-[100] origin-left shadow-sm shadow-amber-500/50 pointer-events-none"
        style={{ scaleX }}
      />
      
      {/* Toast Notifications Overlay */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto bg-slate-900/95 border border-amber-500/40 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl flex items-start gap-3 text-xs"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-white truncate">{notif.title}</h5>
                <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">{notif.message}</p>
              </div>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-slate-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Active Temporary Test Pass Banner */}
      {activeTestPass && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/10 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 font-bold flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              ⚡ <strong>Modo Passe de Teste Ativo</strong> — Acesso VIP total {activeTestPass.tester ? `para ${activeTestPass.tester}` : ''} válido até {new Date(activeTestPass.expiresAt || 0).toLocaleTimeString('pt-AO')} ({new Date(activeTestPass.expiresAt || 0).toLocaleDateString('pt-AO')}).
            </span>
          </div>
          <button
            onClick={() => {
              setActiveTestPass(null);
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
            className="text-[11px] bg-amber-500/30 hover:bg-amber-500/50 text-amber-100 font-extrabold px-3 py-1 rounded-lg border border-amber-500/40 transition-colors"
          >
            Encerrar Modo de Teste
          </button>
        </div>
      )}

      {/* Main Top Header Navigation */}
      <Header />

      {/* Floating In-App Push Notification Toast Banner for Followed Authors */}
      <InAppPushNotificationBanner />

      {/* Main Content Router with Smooth View Transitions */}
      <main className="flex-1 pb-16 md:pb-0 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* VIEW: HOME */}
            {activeView === 'home' && (
          <div className="space-y-12 pb-12">
            
            {/* Hero Section */}
            <HeroBanner />

            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              
              {/* New Releases Carousel (Carrossel de Lançamentos) */}
              <NewReleasesCarousel />

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold scrollbar-none">
                <span className="text-slate-500 flex items-center gap-1 shrink-0 font-bold mr-1">
                  <Filter className="w-3.5 h-3.5 text-amber-400" /> Categoria:
                </span>
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Tag-based Search & Theme Filter Bar */}
              <TagFilterBar />

              {/* Angolan Literature Showcase */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      🇦🇴 Orgulho Nacional
                    </span>
                    <h2 className="text-2xl font-black text-white">Destaques da Literatura Angolana</h2>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory('Literatura Angolana');
                      setActiveView('catalog');
                    }}
                    className="text-xs font-bold text-amber-400 hover:underline"
                  >
                    Ver Todos →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {angolanAuthorsBooks.slice(0, 4).map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={(b) => setInspectedBook(b)}
                    />
                  ))}
                </div>
              </section>

              {/* Zola AI Assistant Banner */}
              <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-amber-950/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Inteligência Artificial Literária Zola IA</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Não sabe qual e-book escolher? Converse com a Zola IA!
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    A nossa assistente baseada no modelo Gemini analisa o teu perfil e recomenda obras angolanas e internacionais personalizadas.
                  </p>
                </div>

                <button
                  onClick={() => setIsZolaAIOpen(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-purple-600/30 shrink-0 flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Abrir Assistente Zola IA</span>
                </button>
              </div>

              {/* General New Releases Book Grid */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      Catálogo Completo
                    </span>
                    <h2 className="text-2xl font-black text-white">Todos os E-books Disponíveis</h2>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">
                    {filteredBooks.length} Obras encontradas
                  </span>
                </div>

                {filteredBooks.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
                    <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="font-bold text-slate-300">Nenhum livro encontrado para este filtro.</p>
                    <button
                      onClick={() => setSelectedCategory('Todos')}
                      className="text-xs font-bold text-amber-400 hover:underline"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onSelect={(b) => setInspectedBook(b)}
                      />
                    ))}
                  </div>
                )}
              </section>

            </div>

          </div>
        )}

        {/* VIEW: CATALOG */}
        {activeView === 'catalog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-white">Catálogo Digital Zola Books</h1>
                <p className="text-xs text-slate-400">
                  Explore e-books em formato digital prontos para leitura imediata em Kwanzas ou Dólares.
                </p>
              </div>

              {searchQuery && (
                <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
                  <span>Pesquisa ativa: <strong className="text-white">"{searchQuery}"</strong></span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 hover:bg-amber-500/30 rounded-md text-amber-300 hover:text-white transition-colors"
                    title="Limpar pesquisa"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Dedicated Catalog Search Bar with Web Speech API Voice Search */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-2xl space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Pesquisar por título, autor (Pepetela, Agualusa), ISBN ou tema..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950/80 text-sm text-slate-100 placeholder-slate-400 rounded-2xl pl-12 pr-24 py-3.5 border border-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-medium transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Limpar texto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {/* Web Speech API Voice Search Trigger */}
                    <VoiceSearchButton size="md" />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 font-bold px-3 py-2 bg-slate-950/50 rounded-xl border border-slate-800">
                    {filteredBooks.length} {filteredBooks.length === 1 ? 'Livro' : 'Livros'}
                  </span>
                </div>
              </div>

              {/* Quick Voice Command Hints */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-slate-400">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  🎙️ Comandos por voz:
                </span>
                {['Pepetela', 'Agualusa', 'O Vendedor de Passados', 'Finanças', 'Livros Grátis'].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setSearchQuery(hint)}
                    className="bg-slate-950/60 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-800 hover:border-amber-500/40 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold scrollbar-none">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tag Filter Bar */}
            <TagFilterBar />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={(b) => setInspectedBook(b)}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW: FAVORITES */}
        {activeView === 'favorites' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="space-y-2 border-b border-slate-800 pb-6">
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <Heart className="w-7 h-7 text-rose-500 fill-current" />
                <span>Teus Livros Favoritos ({favoriteBooksList.length})</span>
              </h1>
            </div>

            {favoriteBooksList.length === 0 ? (
              <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
                <Heart className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="font-bold text-slate-300">Ainda não tens nenhum livro nos favoritos.</p>
                <button
                  onClick={() => setActiveView('catalog')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {favoriteBooksList.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onSelect={(b) => setInspectedBook(b)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: BOOK CLUBS */}
        {activeView === 'book_clubs' && (
          <BookClubsSection
            bookClubs={bookClubs}
            onJoinClub={joinBookClub}
            onLeaveClub={leaveBookClub}
            onAddDiscussion={addDiscussionToClub}
            onAddComment={addCommentToDiscussion}
            onToggleLikeDiscussion={toggleLikeDiscussion}
            onCreateClub={createNewBookClub}
          />
        )}

        {/* DASHBOARDS BY ROLE */}
        {activeView === 'customer_dashboard' && <CustomerDashboard />}
        {activeView === 'library' && <CustomerDashboard />}
        {activeView === 'affiliates' && <CustomerDashboard />}
        {activeView === 'author_dashboard' && <AuthorDashboard />}
        {activeView === 'seller_dashboard' && <SellerDashboard />}
        {activeView === 'admin_dashboard' && <AdminDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Mobile Touch Bar */}
      <MobileBottomNav />

      {/* MODALS & DRAWERS */}
      <AnimatePresence>
        {inspectedBook && (
          <BookDetailModal
            key="book-detail-modal"
            book={inspectedBook}
            onClose={() => setInspectedBook(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeEReaderBook && (
          <EReaderModal
            key="ereader-modal"
            book={activeEReaderBook}
            onClose={() => setActiveEReaderBook(null)}
          />
        )}
      </AnimatePresence>

      <AuthModal />
      <UserProfileModal />
      <CartDrawer />
      <CheckoutModal />
      <ZolaAIAssistantModal />
      <SupportWhatsAppDrawer />
      <AppDownloadModal />
      <Android15DiagnosticModal />
      <AccessibilityModal 
        isOpen={isAccessibilityModalOpen} 
        onClose={() => setIsAccessibilityModalOpen(false)} 
      />
      <AuthorProfileModal />
      <AnimatePresence>
        {isRoadmapModalOpen && (
          <RoadmapModal key="roadmap-modal" onClose={() => setIsRoadmapModalOpen(false)} />
        )}
      </AnimatePresence>

      <TemporaryTestLinkModal 
        isOpen={isTestLinkModalOpen}
        onClose={() => setIsTestLinkModalOpen(false)}
        defaultBook={testLinkDefaultBook}
      />

      <ReadingReportPdfModal
        isOpen={isReadingReportModalOpen}
        onClose={() => setIsReadingReportModalOpen(false)}
      />

    </div>
  );
}

export default App;
