import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  User as UserIcon, 
  Globe, 
  Menu, 
  X, 
  ShieldCheck, 
  Feather, 
  Store, 
  Smartphone,
  MessageCircle,
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Key,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, Currency } from '../types';
import { VoiceSearchButton } from './VoiceSearchButton';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';

export const Header: React.FC = () => {
  const {
    currency,
    setCurrency,
    currentUser,
    isAuthenticated,
    setIsUserProfileOpen,
    switchUserRole,
    cart,
    favoriteBookIds,
    purchasedBooks,
    searchQuery,
    setSearchQuery,
    activeView,
    setActiveView,
    setIsCartOpen,
    setIsZolaAIOpen,
    setIsSupportWhatsAppOpen,
    setIsAuthModalOpen,
    setIsAppDownloadModalOpen,
    setIsAndroid15ModalOpen,
    setIsRoadmapModalOpen,
    openTestLinkModal,
    isDeviceSyncModalOpen,
    setIsDeviceSyncModalOpen,
    cloudSyncStatus,
    notifications,
    theme,
    toggleTheme,
    setIsAccessibilityModalOpen,
    isSoundFeedbackActive,
    selectedTag,
    setSelectedTag
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const cartCount = cart.length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('catalog');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
      case 'author': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300';
      case 'seller': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Zola Admin';
      case 'author': return 'Painel do Autor';
      case 'seller': return 'Painel do Vendedor';
      default: return 'Área do Leitor';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-all shadow-md">
      {/* Top Bar for Angola & Currency Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-xs px-4 py-1.5 flex justify-between items-center text-amber-300/90 font-medium">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>🇦🇴 Livraria Digital de Angola &amp; Internacional — Pagamentos em Kwanzas (MCX, BAI, IBAN) e Cartões/PayPal.</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs">
          <button 
            onClick={() => openTestLinkModal()}
            className="hover:text-amber-200 transition-colors flex items-center gap-1 font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30"
            title="Gerar Link Temporário para Testes e Degustação VIP"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" /> Link de Teste
          </button>
          <span className="text-slate-600">|</span>
          <button 
            onClick={() => setIsRoadmapModalOpen(true)}
            className="hover:text-amber-200 transition-colors flex items-center gap-1 font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30"
            title="Ver o Plano de Construção da Zola Books em 7 Etapas"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Roteiro (7 Etapas)
          </button>
          <span className="text-slate-600">|</span>
          <button 
            onClick={() => setIsAndroid15ModalOpen(true)}
            className="hover:text-amber-200 transition-colors flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30"
            title="Analisar e Resolver Erro do APK no Android 15 (API 35)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Erro Android 15?
          </button>
          <span className="text-slate-600">|</span>
          <button 
            id="header-top-sync-btn"
            onClick={() => setIsDeviceSyncModalOpen(true)}
            className="hover:text-amber-200 transition-colors flex items-center gap-1.5 font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30"
            title="Sincronização de Dispositivos via Firestore"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span>Sincronizar Dispositivos</span>
            <span className={`w-1.5 h-1.5 rounded-full ${
              cloudSyncStatus === 'synced' ? 'bg-emerald-400' :
              cloudSyncStatus === 'syncing' ? 'bg-blue-400 animate-ping' :
              cloudSyncStatus === 'offline' ? 'bg-amber-400' : 'bg-rose-400'
            }`}></span>
          </button>
          <span className="text-slate-600">|</span>
          <button 
            onClick={() => setIsAppDownloadModalOpen(true)}
            className="hover:text-amber-200 transition-colors flex items-center gap-1 font-semibold text-amber-400"
          >
            <Smartphone className="w-3.5 h-3.5" /> Baixar App (v1.1)
          </button>
          <span className="text-slate-600">|</span>
          <button 
            onClick={() => setIsSupportWhatsAppOpen(true)}
            className="hover:text-emerald-300 transition-colors flex items-center gap-1 text-emerald-400"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Suporte WhatsApp (+244 922 255 648)
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                  ZOLA <span className="text-amber-400 font-light">BOOKS</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase text-slate-400 font-semibold block -mt-1">
                  Livraria Digital
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative items-center">
            <input
              type="text"
              placeholder="Pesquisar por livro, autor (ex: Agualusa, Pepetela), ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 text-sm text-slate-100 placeholder-slate-400 rounded-full pl-10 pr-28 py-2 border border-slate-700/80 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <VoiceSearchButton size="sm" />
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-full transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Currency Selector */}
            <div className="relative flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1">
              <Globe className="w-3.5 h-3.5 text-amber-400 ml-1.5 hidden sm:block" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-xs text-amber-300 font-bold pr-2 pl-1 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="AOA" className="bg-slate-900 text-white">🇦🇴 AOA (Kz)</option>
                <option value="USD" className="bg-slate-900 text-white">🇺🇸 USD ($)</option>
                <option value="EUR" className="bg-slate-900 text-white">🇪🇺 EUR (€)</option>
              </select>
            </div>

            {/* Theme Selector (Global Dark / Light Mode Switch) */}
            <ThemeToggleSwitch variant="compact" showLabel />

            {/* Accessibility & Sound Feedback Button */}
            <button
              onClick={() => setIsAccessibilityModalOpen(true)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                isSoundFeedbackActive
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Acessibilidade e Feedback Sonoro da Interface"
              aria-label="Abrir configurações de acessibilidade e feedback sonoro"
            >
              {isSoundFeedbackActive ? (
                <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden lg:inline">Acessibilidade</span>
            </button>

            {/* Zola AI Sparkles Button */}
            <button
              onClick={() => setIsZolaAIOpen(true)}
              className="relative p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-300 hover:border-amber-400 transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Pergunte à Zola IA sobre recomendações de livros"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline">Zola IA</span>
            </button>

            {/* Favorites Icon */}
            <button
              onClick={() => setActiveView('favorites')}
              className={`p-2 rounded-lg hover:bg-slate-800 relative transition-colors ${
                activeView === 'favorites' ? 'text-amber-400 bg-slate-800' : 'text-slate-300'
              }`}
              title="Meus Favoritos"
            >
              <Heart className="w-5 h-5" />
              {favoriteBookIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {favoriteBookIds.length}
                </span>
              )}
            </button>

            {/* My Digital Library Button */}
            <button
              onClick={() => setActiveView('library')}
              className={`p-2 rounded-lg hover:bg-slate-800 relative transition-colors ${
                activeView === 'library' ? 'text-amber-400 bg-slate-800' : 'text-slate-300'
              }`}
              title="Minha Biblioteca Digital (E-Reader)"
            >
              <BookOpen className="w-5 h-5" />
              {purchasedBooks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {purchasedBooks.length}
                </span>
              )}
            </button>

            {/* Device Sync Button */}
            <button
              id="header-cloud-sync-icon-btn"
              onClick={() => setIsDeviceSyncModalOpen(true)}
              className={`p-2 rounded-lg hover:bg-slate-800 relative transition-colors ${
                isDeviceSyncModalOpen ? 'text-amber-400 bg-slate-800' : 'text-slate-300'
              }`}
              title="Sincronização de Dispositivos (Firestore Nuvem)"
              aria-label="Abrir modal de sincronização de dispositivos"
            >
              <Cloud className="w-5 h-5" />
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                cloudSyncStatus === 'synced' ? 'bg-emerald-500' :
                cloudSyncStatus === 'syncing' ? 'bg-blue-500 animate-ping' :
                cloudSyncStatus === 'offline' ? 'bg-amber-500' : 'bg-rose-500'
              }`}></span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-800 relative text-slate-300 transition-colors"
              title="Carrinho de Compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Notification Bell Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2 rounded-lg hover:bg-slate-800 relative transition-colors ${
                  isNotifOpen ? 'text-amber-400 bg-slate-800' : 'text-slate-300'
                }`}
                title="Notificações e Avisos de Venda"
                aria-label="Abrir notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
                  <div className="p-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white">Notificações &amp; Vendas</span>
                    </div>
                    <span className="text-[11px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                      {notifications.length} {notifications.length === 1 ? 'aviso' : 'avisos'}
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800 p-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 px-4 text-slate-400 space-y-1">
                        <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p className="font-semibold text-slate-300">Sem notificações no momento</p>
                        <p className="text-[11px] text-slate-500">As tuas vendas e alertas do sistema surgirão aqui.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.type === 'royalties' || n.type === 'order') {
                              if (currentUser.role === 'author') {
                                setActiveView('author_panel');
                              } else {
                                setActiveView('seller_panel');
                              }
                            }
                            setIsNotifOpen(false);
                          }}
                          className={`p-3 hover:bg-slate-800/70 transition-colors cursor-pointer rounded-xl ${
                            !n.read ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-bold text-slate-100 flex items-center gap-1.5 truncate">
                              {n.type === 'royalties' && <span className="text-emerald-400">💰</span>}
                              {n.type === 'order' && <span className="text-blue-400">📦</span>}
                              <span className="truncate">{n.title}</span>
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => {
                        setActiveView(currentUser.role === 'author' ? 'author_panel' : 'seller_panel');
                        setIsNotifOpen(false);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-bold"
                    >
                      Abrir Painel de Vendas →
                    </button>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher Dropdown (Allows testing Customer, Author, Seller, Admin) */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${getRoleBadgeColor(
                  currentUser.role
                )}`}
              >
                {currentUser.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                {currentUser.role === 'author' && <Feather className="w-3.5 h-3.5" />}
                {currentUser.role === 'seller' && <Store className="w-3.5 h-3.5" />}
                {currentUser.role === 'customer' && <UserIcon className="w-3.5 h-3.5" />}
                <span className="hidden lg:inline">{getRoleLabel(currentUser.role)}</span>
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-slate-400 font-medium">
                    Trocar Modo de Demonstração:
                  </div>
                  <button
                    onClick={() => { switchUserRole('customer'); setActiveView('home'); setIsRoleDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currentUser.role === 'customer' ? 'text-amber-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2"><UserIcon className="w-3.5 h-3.5" /> Área do Leitor</span>
                  </button>
                  <button
                    onClick={() => { switchUserRole('author'); setActiveView('author_panel'); setIsRoleDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currentUser.role === 'author' ? 'text-purple-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2"><Feather className="w-3.5 h-3.5" /> Painel do Autor</span>
                  </button>
                  <button
                    onClick={() => { switchUserRole('seller'); setActiveView('seller_panel'); setIsRoleDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currentUser.role === 'seller' ? 'text-blue-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2"><Store className="w-3.5 h-3.5" /> Painel do Vendedor</span>
                  </button>
                  <button
                    onClick={() => { switchUserRole('admin'); setActiveView('admin_panel'); setIsRoleDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currentUser.role === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Painel Zola Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile / Auth Button */}
            {isAuthenticated ? (
              <button
                onClick={() => setIsUserProfileOpen(true)}
                className="hidden sm:flex items-center gap-2 pl-2 hover:opacity-90 transition-opacity"
                title="Meu Perfil e Definições de Conta"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border-2 border-amber-500 object-cover shadow-sm"
                />
                <span className="text-xs font-bold text-slate-200 hidden xl:inline max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Navigation Categories Row (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 mt-3 pt-2 border-t border-slate-800/80 text-xs font-semibold text-slate-300">
          <button
            onClick={() => { setActiveView('home'); }}
            className={`hover:text-amber-400 transition-colors ${activeView === 'home' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''}`}
          >
            Página Inicial
          </button>
          <button
            onClick={() => { setActiveView('catalog'); }}
            className={`hover:text-amber-400 transition-colors ${activeView === 'catalog' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''}`}
          >
            Catálogo Completo
          </button>
          <button
            onClick={() => { setActiveView('library'); }}
            className={`hover:text-amber-400 transition-colors ${activeView === 'library' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''}`}
          >
            Minha Biblioteca Digital
          </button>
          <button
            onClick={() => { setActiveView('book_clubs'); }}
            className={`hover:text-amber-400 transition-colors flex items-center gap-1 ${activeView === 'book_clubs' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''}`}
          >
            <span>Clubes de Leitura</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-bold border border-amber-500/30">Novo</span>
          </button>
          <button
            onClick={() => { setActiveView('affiliates'); }}
            className={`hover:text-amber-400 transition-colors ${activeView === 'affiliates' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : ''}`}
          >
            Programa de Afiliados
          </button>
          {currentUser.role === 'author' && (
            <button
              onClick={() => setActiveView('author_panel')}
              className="text-purple-400 hover:text-purple-300 font-bold"
            >
              ★ Publicar / Painel do Autor
            </button>
          )}
          {currentUser.role === 'seller' && (
            <button
              onClick={() => setActiveView('seller_panel')}
              className="text-blue-400 hover:text-blue-300 font-bold"
            >
              ★ Gestão de Vendas
            </button>
          )}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveView('admin_panel')}
              className="text-amber-400 hover:text-amber-300 font-bold"
            >
              ⚙ Painel Admin
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Pesquisar livros por texto ou voz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 text-sm text-slate-100 placeholder-slate-400 rounded-lg pl-9 pr-10 py-2 border border-slate-700 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceSearchButton size="sm" />
              </div>
            </div>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
            >
              Buscar
            </button>
          </form>

          <div className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            <button
              onClick={() => { setActiveView('home'); setIsMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800"
            >
              Página Inicial
            </button>
            <button
              onClick={() => { setActiveView('catalog'); setIsMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800"
            >
              Catálogo de Livros
            </button>
            <button
              onClick={() => { setActiveView('library'); setIsMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800"
            >
              Minha Biblioteca Digital
            </button>
            <button
              onClick={() => { setActiveView('book_clubs'); setIsMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800 flex items-center justify-between"
            >
              <span>Clubes de Leitura</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">Novo</span>
            </button>
            <button
              onClick={() => { setActiveView('affiliates'); setIsMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800"
            >
              Programa de Afiliados
            </button>
            <div className="py-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Tema da Aplicação</span>
              </div>
              <ThemeToggleSwitch variant="switch" showLabel={false} />
            </div>
            <button
              onClick={() => { setIsAccessibilityModalOpen(true); setIsMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800 flex items-center justify-between text-amber-300 font-bold"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Acessibilidade &amp; Sons</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                isSoundFeedbackActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isSoundFeedbackActive ? 'Ativo 🔊' : 'Inativo 🔇'}
              </span>
            </button>
            <button
              id="mobile-menu-sync-btn"
              onClick={() => { setIsDeviceSyncModalOpen(true); setIsMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800 flex items-center justify-between text-amber-300 font-bold"
            >
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-amber-400" />
                <span>Sincronização de Dispositivos</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                cloudSyncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                cloudSyncStatus === 'syncing' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {cloudSyncStatus === 'synced' ? 'Sincronizado ☁️' :
                 cloudSyncStatus === 'syncing' ? 'A Sincronizar...' : 'Firestore'}
              </span>
            </button>
            <button
              onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-amber-400 border-b border-slate-800 flex items-center justify-between"
            >
              <span>Minha Conta</span>
              <span className="text-xs text-slate-400">{currentUser.email}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
