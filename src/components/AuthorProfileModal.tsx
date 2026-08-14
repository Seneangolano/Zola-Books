import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  UserCheck, 
  UserPlus, 
  BookOpen, 
  Sparkles, 
  Star, 
  Share2, 
  Check, 
  Award, 
  ExternalLink,
  Search,
  BookMarked
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookCard } from './BookCard';
import { playSoundEffect } from '../lib/soundEffects';

// Curated bios for key authors in the Angolan & Lusophone catalog
const AUTHOR_BIOS: Record<string, { bio: string; birthplace?: string; awards?: string[]; era?: string }> = {
  'Pepetela': {
    bio: 'Artur Carlos Maurício Pestana dos Santos, conhecido pelo pseudónimo Pepetela, é um dos mais prestigiados escritores angolanos. Prémio Camões 1997, as suas obras refletem a história contemporânea, a identidade cultural e as transformações sociais de Angola.',
    birthplace: 'Benguela, Angola',
    awards: ['Prémio Camões (1997)', 'Prémio Nacional de Literatura'],
    era: 'Literatura Angolana Contemporânea'
  },
  'José Eduardo Agualusa': {
    bio: 'José Eduardo Agualusa Alves da Cunha é um aclamado romancista e jornalista angolano. As suas obras foram traduzidas para mais de 30 línguas e conquistaram prémios internacionais, abordando a memória, os sonhos e o lirismo africano.',
    birthplace: 'Huambo, Angola',
    awards: ['Independent Foreign Fiction Prize (2007)', 'International Dublin Literary Award (2017)'],
    era: 'Realismo Mágico e Ficcional'
  },
  'Agostinho Neto': {
    bio: 'António Agostinho Neto foi médico, poeta e o primeiro Presidente de Angola. A sua poesia humanista e combatente inspira gerações e é considerada um pilar fundamental da literatura angolana moderna.',
    birthplace: 'Icolo e Bengo, Angola',
    awards: ['Herói Nacional de Angola', 'Prémio Lênin da Paz'],
    era: 'Poesia Combatente & Anticolonial'
  },
  'Luandino Vieira': {
    bio: 'José Luandino Vieira é uma figura marcante da ficção angolana, célebre pela inovação linguística que fundiu a língua portuguesa com o kimbundu da musseque de Luanda.',
    birthplace: 'Lagoa do Furadouro, Portugal / Luanda, Angola',
    awards: ['Prémio Camões (2006)', 'Prémio Jabuti'],
    era: 'Ficção e Inovação Linguística'
  },
  'Ondjaki': {
    bio: 'Ndalu de Almeida (Ondjaki) é um influente escritor, poeta e realizador angolano. Com uma prosa poeticamente envolvente, retrata a infância, a nostalgia e o pulsar urbano de Luanda.',
    birthplace: 'Luanda, Angola',
    awards: ['Prémio José Saramago (2013)', 'Prémio Littérature Monde'],
    era: 'Prosa Poética e Infantojuvenil'
  },
  'Esperança Luísa': {
    bio: 'Escritora e mentora angolana com foco em liderança feminina, empreendedorismo, finanças pessoais e desenvolvimento pessoal para jovens e profissionais angolanos.',
    birthplace: 'Luanda, Angola',
    awards: ['Destaque Literatura de Finanças Pessoais'],
    era: 'Desenvolvimento Pessoal & Finanças'
  }
};

export const AuthorProfileModal: React.FC = () => {
  const { 
    selectedAuthorModal, 
    setSelectedAuthorModal,
    books,
    followedAuthors,
    toggleFollowAuthor,
    setSearchQuery,
    setActiveView,
    addNotification
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);

  const authorName = selectedAuthorModal;

  const authorBooks = useMemo(() => {
    if (!authorName) return [];
    return books.filter(b => b.author.toLowerCase() === authorName.toLowerCase());
  }, [books, authorName]);

  const isFollowed = useMemo(() => {
    if (!authorName) return false;
    return followedAuthors.some(fa => fa.toLowerCase() === authorName.toLowerCase());
  }, [followedAuthors, authorName]);

  const authorInfo = useMemo(() => {
    if (!authorName) return null;
    const known = AUTHOR_BIOS[authorName];
    const isAngolan = authorBooks.some(b => b.isAngolanAuthor);
    
    // Calculate rating stats
    const totalReviews = authorBooks.reduce((sum, b) => sum + (b.reviewCount || 0), 0);
    const avgRating = authorBooks.length > 0 
      ? (authorBooks.reduce((sum, b) => sum + b.rating, 0) / authorBooks.length).toFixed(1)
      : '4.8';

    return {
      bio: known?.bio || `${authorName} é um(a) renomado(a) autor(a) com obras publicadas no catálogo digital da Zola Books Angola, enriquecendo o panorama literário lusófono e promovendo o gosto pela leitura.`,
      birthplace: known?.birthplace || (isAngolan ? 'Angola' : 'Comunidade Lusófona'),
      awards: known?.awards || ['Autor(a) Destacado(a) Zola Books'],
      era: known?.era || (isAngolan ? 'Literatura Angolana' : 'Literatura Geral'),
      isAngolan,
      totalReviews,
      avgRating
    };
  }, [authorName, authorBooks]);

  if (!selectedAuthorModal || !authorName) return null;

  const handleShare = async () => {
    playSoundEffect('click');
    const shareUrl = window.location.origin;
    const shareText = `Conhece as obras e o perfil de ${authorName} na Zola Books Angola!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de Autor — ${authorName}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to copy
      }
    }

    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopiedLink(true);
    addNotification('Link Copiado', `O link do perfil de ${authorName} foi copiado para a área de transferência.`);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleNavigateToCatalog = () => {
    playSoundEffect('click');
    setSearchQuery(authorName);
    setActiveView('catalog');
    setSelectedAuthorModal(null);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={() => setSelectedAuthorModal(null)}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header Cover Banner */}
          <div className="relative bg-gradient-to-r from-amber-600/30 via-slate-900 to-amber-900/40 p-6 sm:p-8 border-b border-slate-800 shrink-0">
            {/* Close Button */}
            <button
              onClick={() => setSelectedAuthorModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950/60 rounded-full hover:bg-slate-800 transition-colors z-10"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Author Avatar Circle */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-3xl shadow-xl border-4 border-slate-900">
                  {authorName.charAt(0)}
                </div>
                {authorInfo?.isAngolan && (
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-md">
                    🇦🇴
                  </span>
                )}
              </div>

              {/* Author Name & Actions */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    Perfil do Autor
                  </span>
                  {authorInfo?.era && (
                    <span className="text-xs text-slate-400 font-medium">
                      • {authorInfo.era}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {authorName}
                </h2>

                <p className="text-xs text-slate-300 font-medium flex items-center justify-center sm:justify-start gap-2">
                  <span>📍 {authorInfo?.birthplace}</span>
                  <span>•</span>
                  <span>📚 {authorBooks.length} obra(s) disponível(eis)</span>
                </p>

                {/* Follow & Share Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <button
                    onClick={() => {
                      playSoundEffect('click');
                      toggleFollowAuthor(authorName);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                      isFollowed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>A Seguir Autor</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Seguir Autor</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="Partilhar perfil de autor"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copiedLink ? 'Copiado!' : 'Partilhar'}</span>
                  </button>

                  <button
                    onClick={handleNavigateToCatalog}
                    className="p-2 bg-slate-800/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 rounded-xl border border-slate-700 hover:border-amber-500/40 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="Ver no catálogo completo"
                  >
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>Ver no Catálogo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Biography Card */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Biografia &amp; Trajetória</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {authorInfo?.bio}
              </p>

              {/* Awards badges */}
              {authorInfo?.awards && authorInfo.awards.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-900">
                  {authorInfo.awards.map((award, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold"
                    >
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>{award}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Author Catalog Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Obras do Autor na Zola Books ({authorBooks.length})</span>
                </h3>
                {authorBooks.length > 0 && (
                  <button
                    onClick={handleNavigateToCatalog}
                    className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Filtrar tudo</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {authorBooks.length === 0 ? (
                <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
                  <BookMarked className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Nenhuma obra direta catalogada no momento para {authorName}.
                  </p>
                  <button
                    onClick={handleNavigateToCatalog}
                    className="text-xs text-amber-400 font-bold hover:underline"
                  >
                    Procurar no catálogo geral
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {authorBooks.map((book) => (
                    <BookCard key={book.id} book={book} compact />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>Zola Books Angola • Perfil Oficial de Autor</span>
            <button
              onClick={() => setSelectedAuthorModal(null)}
              className="text-amber-400 font-bold hover:underline"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
