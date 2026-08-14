import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Plus, 
  Sparkles, 
  Search, 
  Filter, 
  Calendar, 
  Check, 
  UserCheck, 
  ThumbsUp, 
  Send, 
  Pin, 
  ArrowLeft, 
  X,
  Share2,
  Award,
  Book,
  Heart,
  ChevronRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { BookClub, BookClubDiscussion, BookClubComment } from '../types';
import { useApp } from '../context/AppContext';
import { getOptimizedBookCover, getOptimizedImageUrl } from '../lib/imageOptimizer';
import { triggerHapticFeedback } from '../lib/haptic';

interface BookClubsSectionProps {
  bookClubs: BookClub[];
  onJoinClub: (clubId: string) => void;
  onLeaveClub: (clubId: string) => void;
  onAddDiscussion: (clubId: string, discussion: Partial<BookClubDiscussion>) => void;
  onAddComment: (clubId: string, discussionId: string, text: string) => void;
  onToggleLikeDiscussion: (clubId: string, discussionId: string) => void;
  onCreateClub: (clubData: Partial<BookClub>) => void;
}

export const BookClubsSection: React.FC<BookClubsSectionProps> = ({
  bookClubs,
  onJoinClub,
  onLeaveClub,
  onAddDiscussion,
  onAddComment,
  onToggleLikeDiscussion,
  onCreateClub
}) => {
  const { 
    books, 
    currentUser, 
    setActiveEReaderBook, 
    setSelectedBookModal, 
    addNotification 
  } = useApp();

  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'genre' | 'author'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New discussion form state
  const [isNewDiscussionFormOpen, setIsNewDiscussionFormOpen] = useState(false);
  const [newDiscTitle, setNewDiscTitle] = useState('');
  const [newDiscContent, setNewDiscContent] = useState('');
  const [newDiscChapterRef, setNewDiscChapterRef] = useState('');
  const [isGeneratingAIDiscussion, setIsGeneratingAIDiscussion] = useState(false);

  // Comment input per discussion state
  const [commentInputs, setCommentInputs] = useState<{ [discussionId: string]: string }>({});

  // New Club Form State
  const [newClubName, setNewClubName] = useState('');
  const [newClubTagline, setNewClubTagline] = useState('');
  const [newClubDescription, setNewClubDescription] = useState('');
  const [newClubType, setNewClubType] = useState<'genre' | 'author'>('genre');
  const [newClubTarget, setNewClubTarget] = useState('Literatura Angolana');
  const [newClubSchedule, setNewClubSchedule] = useState('Sábados às 18:00');
  const [newClubCover, setNewClubCover] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80');

  const selectedClub = bookClubs.find(c => c.id === selectedClubId);
  const activeBookForSelectedClub = selectedClub 
    ? books.find(b => b.id === selectedClub.currentBookId) || books[0]
    : null;

  // Filtered Clubs
  const filteredClubs = bookClubs.filter(club => {
    const matchesSearch = 
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.targetCategoryOrAuthor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'my') return club.isJoined;
    if (activeTab === 'genre') return club.type === 'genre';
    if (activeTab === 'author') return club.type === 'author';
    return true;
  });

  const handleCreateClubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim() || !newClubDescription.trim()) return;

    onCreateClub({
      name: newClubName,
      tagline: newClubTagline || 'Clube de leitura ativo na Zola Books',
      description: newClubDescription,
      type: newClubType,
      targetCategoryOrAuthor: newClubTarget,
      coverImage: newClubCover,
      meetingSchedule: newClubSchedule,
      avatarIcon: newClubType === 'genre' ? '📚' : '✍️',
      currentBookId: books[0]?.id || 'ZB-BK-101',
      tags: [newClubTarget, newClubType === 'genre' ? 'Gênero' : 'Autor'],
      moderatorName: currentUser.name,
      moderatorAvatar: currentUser.avatarUrl
    });

    triggerHapticFeedback('success');
    addNotification('Clube Criado', `O clube "${newClubName}" foi criado com sucesso!`);

    // Reset form
    setNewClubName('');
    setNewClubTagline('');
    setNewClubDescription('');
    setIsCreateModalOpen(false);
  };

  const handlePostDiscussionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubId || !newDiscTitle.trim() || !newDiscContent.trim()) return;

    onAddDiscussion(selectedClubId, {
      title: newDiscTitle,
      content: newDiscContent,
      chapterRef: newDiscChapterRef || undefined,
      bookId: selectedClub?.currentBookId
    });

    triggerHapticFeedback('success');
    addNotification('Tópico Publicado', 'O teu tópico de discussão foi publicado no clube!');

    setNewDiscTitle('');
    setNewDiscContent('');
    setNewDiscChapterRef('');
    setIsNewDiscussionFormOpen(false);
  };

  const handleGenerateAIDiscussionPrompt = async () => {
    if (!selectedClub) return;
    setIsGeneratingAIDiscussion(true);
    triggerHapticFeedback('light');

    try {
      // Simulate/Generate AI literary prompt based on the club's active book
      const bookTitle = activeBookForSelectedClub?.title || selectedClub.name;
      const prompts = [
        {
          title: `O simbolismo ético e social em "${bookTitle}"`,
          content: `À medida que nos aprofundamos na leitura de "${bookTitle}", como vocês interpretam a evolução dos conflitos morais dos personagens? Qual trecho ou diálogo mais chamou a vossa atenção nesta semana?`,
          chapterRef: 'Capítulo 2 & 3'
        },
        {
          title: `Qual a grande lição de identidade trazida por "${bookTitle}"?`,
          content: `No contexto da literatura e cultura onde a obra se insere, que paralelos podemos traçar entre as questões levantadas pelo autor em "${bookTitle}" e a realidade contemporânea de Angola e África?`,
          chapterRef: 'Reflexão Geral'
        },
        {
          title: `Debate de Citações: Frase marcante em "${bookTitle}"`,
          content: `Gostaria de propor um exercício: partilhem a frase ou citação que mais vos marcou na leitura de "${bookTitle}" e expliquem por que razões ela ressoou no vosso espírito.`,
          chapterRef: 'Citações Literárias'
        }
      ];

      const chosenPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      // Wait brief duration for natural feel
      await new Promise(resolve => setTimeout(resolve, 800));

      setNewDiscTitle(chosenPrompt.title);
      setNewDiscContent(chosenPrompt.content);
      setNewDiscChapterRef(chosenPrompt.chapterRef);
      setIsNewDiscussionFormOpen(true);
      triggerHapticFeedback('success');
    } catch {
      // Fallback
    } finally {
      setIsGeneratingAIDiscussion(false);
    }
  };

  const handleCommentSubmit = (discussionId: string) => {
    const text = commentInputs[discussionId];
    if (!selectedClubId || !text || !text.trim()) return;

    onAddComment(selectedClubId, discussionId, text.trim());
    triggerHapticFeedback('medium');

    setCommentInputs(prev => ({ ...prev, [discussionId]: '' }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* SECTION HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-purple-950/80 border border-amber-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Comunidade Literária Angola &amp; África</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Clubes de Leitura <span className="text-amber-400">&amp; Grupos de Debate</span>
          </h1>
          
          <p className="text-slate-300 text-sm leading-relaxed">
            Participe em grupos de discussão organizados por gêneros literários ou autores angolanos e internacionais. Compartilhe reflexões, analise capítulos e troque ideias com leitores apaixonados.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setIsCreateModalOpen(true);
                triggerHapticFeedback('light');
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Criar Novo Clube</span>
            </button>

            {selectedClubId && (
              <button
                onClick={() => {
                  setSelectedClubId(null);
                  triggerHapticFeedback('light');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-3 rounded-2xl border border-slate-700 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>Voltar aos Todos os Clubes</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONDITIONAL MAIN DISPLAY: CLUB LIST OR CLUB ROOM */}
      {!selectedClubId ? (
        /* MAIN LIST OF CLUBS */
        <div className="space-y-6">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Pesquisar por nome do clube, gênero, autor ou tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 text-xs text-white placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:border-amber-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs font-bold">
              <button
                onClick={() => { setActiveTab('all'); triggerHapticFeedback('light'); }}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'all'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Todos ({bookClubs.length})
              </button>

              <button
                onClick={() => { setActiveTab('my'); triggerHapticFeedback('light'); }}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'my'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Meus Clubes ({bookClubs.filter(c => c.isJoined).length})</span>
              </button>

              <button
                onClick={() => { setActiveTab('genre'); triggerHapticFeedback('light'); }}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'genre'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Por Gênero Literário
              </button>

              <button
                onClick={() => { setActiveTab('author'); triggerHapticFeedback('light'); }}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === 'author'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Por Autores
              </button>
            </div>

          </div>

          {/* CLUBS GRID */}
          {filteredClubs.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-bold text-slate-200">Nenhum clube de leitura encontrado.</h3>
              <p className="text-xs text-slate-400">Tente ajustar a sua pesquisa ou crie o seu próprio grupo de discussão!</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                Criar Primeiro Clube
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => {
                const currentBook = books.find(b => b.id === club.currentBookId);
                return (
                  <motion.div
                    key={club.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all duration-300"
                  >
                    <div>
                      {/* Cover Banner */}
                      <div className="relative h-36 bg-slate-950 overflow-hidden">
                        <img
                          src={getOptimizedImageUrl(club.coverImage, { width: 600 })}
                          alt={club.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-[11px] font-extrabold">
                          <span className={`px-2.5 py-1 rounded-full shadow-md backdrop-blur-md border ${
                            club.type === 'genre'
                              ? 'bg-amber-500/90 text-slate-950 border-amber-400'
                              : 'bg-purple-600/90 text-white border-purple-400'
                          }`}>
                            {club.type === 'genre' ? `Gênero: ${club.targetCategoryOrAuthor}` : `Autor: ${club.targetCategoryOrAuthor}`}
                          </span>

                          <span className="bg-slate-900/90 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                            <Users className="w-3 h-3 text-amber-400" />
                            <span>{club.membersCount} Membros</span>
                          </span>
                        </div>

                        {/* Icon Avatar */}
                        <div className="absolute -bottom-4 left-5 w-12 h-12 rounded-2xl bg-slate-900 border-2 border-amber-500 text-xl flex items-center justify-center shadow-lg">
                          {club.avatarIcon || '📚'}
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-5 pt-7 space-y-3">
                        <div className="space-y-1">
                          <h3 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors">
                            {club.name}
                          </h3>
                          <p className="text-xs font-medium text-amber-300/90 italic">
                            "{club.tagline}"
                          </p>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {club.description}
                        </p>

                        {/* Current Reading Book Indicator */}
                        {currentBook && (
                          <div className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-2xl flex items-center gap-3">
                            <img
                              src={getOptimizedBookCover(currentBook.coverImage, 'thumb')}
                              alt={currentBook.title}
                              className="w-9 h-12 object-cover rounded-lg shrink-0 shadow"
                            />
                            <div className="flex-1 min-w-0 text-[11px]">
                              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                                Livro em Leitura
                              </span>
                              <h5 className="font-bold text-white truncate">{currentBook.title}</h5>
                              <p className="text-slate-400 text-[10px] truncate">{currentBook.author}</p>
                            </div>
                          </div>
                        )}

                        {/* Meeting Schedule */}
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{club.meetingSchedule}</span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {club.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-5 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (club.isJoined) {
                            onLeaveClub(club.id);
                          } else {
                            onJoinClub(club.id);
                          }
                          triggerHapticFeedback('medium');
                        }}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                          club.isJoined
                            ? 'bg-slate-800 text-slate-300 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-500/50 border border-slate-700'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                        }`}
                      >
                        {club.isJoined ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Inscrito</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Participar</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedClubId(club.id);
                          triggerHapticFeedback('light');
                        }}
                        className="py-2.5 px-4 rounded-xl text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1 transition-all"
                      >
                        <span>Entrar na Sala</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        /* DETAILED CLUB ROOM VIEW */
        selectedClub && (
          <div className="space-y-8">
            
            {/* CLUB HERO BANNER */}
            <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="h-48 sm:h-64 relative bg-slate-950">
                <img
                  src={getOptimizedImageUrl(selectedClub.coverImage, { width: 1200 })}
                  alt={selectedClub.name}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

                <button
                  onClick={() => {
                    setSelectedClubId(null);
                    triggerHapticFeedback('light');
                  }}
                  className="absolute top-4 left-4 bg-slate-900/90 text-white border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-slate-800 backdrop-blur-md shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-400" />
                  <span>Voltar</span>
                </button>
              </div>

              <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex items-end gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-900 border-4 border-amber-500 text-4xl flex items-center justify-center shadow-2xl shrink-0">
                      {selectedClub.avatarIcon || '📚'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                          {selectedClub.type === 'genre' ? 'Gênero Literário' : 'Comunidade de Autor'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          {selectedClub.membersCount} Membros
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">{selectedClub.name}</h2>
                      <p className="text-xs font-semibold text-amber-300 italic">"{selectedClub.tagline}"</p>
                    </div>
                  </div>

                  {/* Join / Leave button */}
                  <button
                    onClick={() => {
                      if (selectedClub.isJoined) {
                        onLeaveClub(selectedClub.id);
                      } else {
                        onJoinClub(selectedClub.id);
                      }
                      triggerHapticFeedback('medium');
                    }}
                    className={`px-6 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-xl transition-all ${
                      selectedClub.isJoined
                        ? 'bg-slate-800 text-slate-200 hover:bg-rose-950/60 hover:text-rose-200 border border-slate-700'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {selectedClub.isJoined ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Membro do Clube</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Participar do Clube</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                  {selectedClub.description}
                </p>

                {/* Moderator & Schedule Info */}
                <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedClub.moderatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={selectedClub.moderatorName}
                      className="w-7 h-7 rounded-full border border-amber-500 object-cover"
                    />
                    <span>Moderado por <strong className="text-white">{selectedClub.moderatorName}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Encontros: {selectedClub.meetingSchedule}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* CURRENT BOOK IN READING BANNER */}
            {activeBookForSelectedClub && (
              <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={getOptimizedBookCover(activeBookForSelectedClub.coverImage, 'card')}
                    alt={activeBookForSelectedClub.title}
                    className="w-20 h-28 object-cover rounded-2xl shadow-xl border border-amber-500/30 shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase border border-amber-500/30">
                      <BookOpen className="w-3 h-3 text-amber-400" />
                      <span>Livro em Leitura do Mês</span>
                    </div>
                    <h3 className="text-xl font-black text-white">{activeBookForSelectedClub.title}</h3>
                    <p className="text-xs text-slate-300 font-medium">por {activeBookForSelectedClub.author}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{activeBookForSelectedClub.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => {
                      setActiveEReaderBook(activeBookForSelectedClub);
                      triggerHapticFeedback('medium');
                    }}
                    className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Ler no E-Reader</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedBookModal(activeBookForSelectedClub);
                      triggerHapticFeedback('light');
                    }}
                    className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Book className="w-4 h-4 text-amber-400" />
                    <span>Ver Ficha</span>
                  </button>
                </div>
              </div>
            )}

            {/* DISCUSSIONS BOARD SECTION */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-amber-400" />
                    <span>Mural de Debates &amp; Discussões ({selectedClub.discussions.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Partilhe as suas opiniões, faça perguntas sobre capítulos específicos e interaja com os leitores do clube.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateAIDiscussionPrompt}
                    disabled={isGeneratingAIDiscussion}
                    className="bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isGeneratingAIDiscussion ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAIDiscussion ? 'Sugerindo com Zola IA...' : 'Pedir Ideia à Zola IA'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewDiscussionFormOpen(!isNewDiscussionFormOpen);
                      triggerHapticFeedback('light');
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Nova Discussão</span>
                  </button>
                </div>
              </div>

              {/* NEW DISCUSSION FORM */}
              {isNewDiscussionFormOpen && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handlePostDiscussionSubmit}
                  className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl"
                >
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>Iniciar um Novo Tópico de Debate</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsNewDiscussionFormOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Título do Tópico *</label>
                      <input
                        type="text"
                        placeholder="Ex: O dilema ético no capítulo 2 do livro..."
                        value={newDiscTitle}
                        onChange={(e) => setNewDiscTitle(e.target.value)}
                        required
                        className="w-full bg-slate-800 text-xs text-white placeholder-slate-500 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Referência do Capítulo (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Capítulo 3 ou Estória 1"
                        value={newDiscChapterRef}
                        onChange={(e) => setNewDiscChapterRef(e.target.value)}
                        className="w-full bg-slate-800 text-xs text-white placeholder-slate-500 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Sua Reflexão / Pergunta para o Clube *</label>
                    <textarea
                      rows={4}
                      placeholder="Escreva a sua análise literária, dúvida ou provocação para o grupo..."
                      value={newDiscContent}
                      onChange={(e) => setNewDiscContent(e.target.value)}
                      required
                      className="w-full bg-slate-800 text-xs text-white placeholder-slate-500 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsNewDiscussionFormOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publicar Tópico</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {/* LIST OF DISCUSSIONS */}
              {selectedClub.discussions.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-300 text-xs">Ainda não há tópicos criados neste clube.</p>
                  <p className="text-[11px] text-slate-500">Seja o primeiro a publicar uma pergunta ou reflexão!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedClub.discussions.map((disc) => (
                    <motion.div
                      key={disc.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-slate-900 border rounded-3xl p-6 space-y-4 transition-all shadow-lg ${
                        disc.isPinned 
                          ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-slate-900' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Post Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={disc.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={disc.authorName}
                            className="w-10 h-10 rounded-full border border-amber-500/60 object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-xs text-white">{disc.authorName}</h5>
                              {disc.authorRole && (
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                                  disc.authorRole === 'Moderador'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : disc.authorRole === 'Zola IA'
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}>
                                  {disc.authorRole}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{disc.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {disc.isPinned && (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Pin className="w-3 h-3" /> Fixado
                            </span>
                          )}

                          {disc.chapterRef && (
                            <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700">
                              📖 {disc.chapterRef}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Post Title & Content */}
                      <div className="space-y-2">
                        <h4 className="text-base font-extrabold text-white leading-snug">
                          {disc.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {disc.content}
                        </p>
                      </div>

                      {/* Actions Row */}
                      <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80 text-xs">
                        <button
                          onClick={() => {
                            onToggleLikeDiscussion(selectedClub.id, disc.id);
                            triggerHapticFeedback('light');
                          }}
                          className={`flex items-center gap-1.5 font-bold transition-colors ${
                            disc.likedByCurrentUser ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${disc.likedByCurrentUser ? 'fill-current text-amber-400' : ''}`} />
                          <span>{disc.likes} Gostos</span>
                        </button>

                        <div className="flex items-center gap-1 text-slate-400 font-bold">
                          <MessageSquare className="w-4 h-4 text-slate-500" />
                          <span>{disc.comments.length} Respostas</span>
                        </div>
                      </div>

                      {/* COMMENTS LIST & INPUT */}
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                        {disc.comments.length > 0 && (
                          <div className="space-y-2.5">
                            {disc.comments.map((comm) => (
                              <div key={comm.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-white">{comm.authorName}</span>
                                    {comm.authorRole && (
                                      <span className="text-[9px] bg-slate-800 text-amber-400 font-bold px-1.5 py-0.5 rounded">
                                        {comm.authorRole}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-500">{comm.date}</span>
                                </div>
                                <p className="text-slate-300 text-[11px] leading-relaxed">{comm.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Escreva a sua resposta a esta discussão..."
                            value={commentInputs[disc.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [disc.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCommentSubmit(disc.id);
                              }
                            }}
                            className="flex-1 bg-slate-900 text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2 border border-slate-700 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            onClick={() => handleCommentSubmit(disc.id)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl shrink-0 flex items-center gap-1 shadow"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Responder</span>
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  ))}
                </div>
              )}

            </div>

          </div>
        )
      )}

      {/* MODAL: CREATE NEW BOOK CLUB */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Criar Novo Clube de Leitura</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Lidere um grupo de discussão sobre os seus autores ou gêneros preferidos.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClubSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-bold text-slate-200">Nome do Clube *</label>
                <input
                  type="text"
                  placeholder="Ex: Clube de Ficção Científica Africana"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  required
                  className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-200">Lema / Slogan Curto</label>
                <input
                  type="text"
                  placeholder="Ex: Explorando o futuro através da literatura do continente"
                  value={newClubTagline}
                  onChange={(e) => setNewClubTagline(e.target.value)}
                  className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-200">Tipo de Clube *</label>
                  <select
                    value={newClubType}
                    onChange={(e) => setNewClubType(e.target.value as 'genre' | 'author')}
                    className="w-full bg-slate-800 text-white rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="genre">Baseado em Gênero Literário</option>
                    <option value="author">Baseado em Autor Específico</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-200">Gênero ou Autor Principal *</label>
                  <input
                    type="text"
                    placeholder="Ex: Literatura Angolana, Pepetela, Poesia..."
                    value={newClubTarget}
                    onChange={(e) => setNewClubTarget(e.target.value)}
                    required
                    className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-200">Horário dos Encontros / Debates</label>
                <input
                  type="text"
                  placeholder="Ex: Todas as Sextas-feiras às 19:00"
                  value={newClubSchedule}
                  onChange={(e) => setNewClubSchedule(e.target.value)}
                  className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-200">Descrição do Clube *</label>
                <textarea
                  rows={3}
                  placeholder="Explique o propósito do clube, temas abordados e como os membros irão interagir..."
                  value={newClubDescription}
                  onChange={(e) => setNewClubDescription(e.target.value)}
                  required
                  className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500 resize-none"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-200">URL da Imagem de Capa</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newClubCover}
                  onChange={(e) => setNewClubCover(e.target.value)}
                  className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg"
                >
                  Criar e Lançar Clube
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
