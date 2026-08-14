import React from 'react';
import { Home, BookOpen, Heart, ShoppingBag, Search, Users, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    cart,
    favoriteBookIds,
    purchasedBooks,
    setIsCartOpen,
    isAuthenticated,
    setIsUserProfileOpen,
    setIsAuthModalOpen
  } = useApp();

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setIsUserProfileOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <nav 
      aria-label="Navegação inferior móvel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 py-2 px-1 flex items-center justify-around text-[10px] font-bold text-slate-400 shadow-2xl"
    >
      <button
        onClick={() => setActiveView('home')}
        aria-label="Ir para página inicial"
        aria-current={activeView === 'home' ? 'page' : undefined}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeView === 'home' ? 'text-amber-400' : 'hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Início</span>
      </button>

      <button
        onClick={() => setActiveView('catalog')}
        aria-label="Ir para catálogo de e-books"
        aria-current={activeView === 'catalog' ? 'page' : undefined}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeView === 'catalog' ? 'text-amber-400' : 'hover:text-slate-200'
        }`}
      >
        <Search className="w-5 h-5" />
        <span>Catálogo</span>
      </button>

      <button
        onClick={() => setActiveView('book_clubs')}
        aria-label="Ir para clubes de leitura"
        aria-current={activeView === 'book_clubs' ? 'page' : undefined}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeView === 'book_clubs' ? 'text-amber-400' : 'hover:text-slate-200'
        }`}
      >
        <Users className="w-5 h-5" />
        <span>Clubes</span>
      </button>

      <button
        onClick={() => setActiveView('library')}
        aria-label={`Ver minha biblioteca digital (${purchasedBooks.length} livros)`}
        aria-current={activeView === 'library' ? 'page' : undefined}
        className={`flex flex-col items-center gap-1 relative transition-colors ${
          activeView === 'library' ? 'text-amber-400' : 'hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span>Biblioteca</span>
        {purchasedBooks.length > 0 && (
          <span className="absolute -top-1 right-2 bg-amber-500 text-slate-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {purchasedBooks.length}
          </span>
        )}
      </button>

      <button
        onClick={handleProfileClick}
        aria-label="Meu Perfil de Utilizador"
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
      >
        <User className="w-5 h-5" />
        <span>{isAuthenticated ? 'Perfil' : 'Entrar'}</span>
      </button>
    </nav>
  );
};

