import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  Sparkles, 
  Award, 
  BookOpen, 
  Star, 
  UserPlus, 
  CheckCircle2, 
  Filter, 
  Plus, 
  Flame, 
  ThumbsUp,
  MessageCircle,
  Clock,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface FeedComment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  time: string;
}

export interface FeedPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorLocation: string;
  type: 'reading_finished' | 'achievement' | 'review' | 'quote' | 'user_post';
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: string;
  rating?: number;
  content: string;
  achievementTitle?: string;
  achievementIcon?: string;
  time: string;
  likesCount: number;
  likedByMe: boolean;
  comments: FeedComment[];
}

export const SocialFeed: React.FC = () => {
  const { currentUser, books, addNotification, setActiveEReaderBook } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'readings' | 'achievements' | 'reviews'>('all');
  
  // Post Creation Modal/State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [selectedBookTitle, setSelectedBookTitle] = useState('');

  // Followed Users state
  const [followedUsers, setFollowedUsers] = useState<string[]>(['Mateus Kiala', 'Esperança Manuel']);

  // Comments Visibility State
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Initial Mock Feed Data
  const [posts, setPosts] = useState<FeedPost[]>([
    {
      id: 'post_1',
      authorName: 'Mateus Kiala',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      authorLocation: 'Luanda, Angola 🇦🇴',
      type: 'achievement',
      achievementTitle: 'Embaixador da Cultura',
      achievementIcon: '👑',
      bookTitle: 'Mayombe',
      bookAuthor: 'Pepetela',
      bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80',
      content: 'Acabou de concluir a leitura de "Mayombe" e desbloqueou a medalha de ouro Embaixador da Cultura! 🇦🇴📚',
      time: 'Há 15 min',
      likesCount: 14,
      likedByMe: false,
      comments: [
        {
          id: 'c1',
          userName: 'Esperança Manuel',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          text: 'Parabéns Mateus! Essa obra de Pepetela é inesquecível!',
          time: 'Há 10 min'
        }
      ]
    },
    {
      id: 'post_2',
      authorName: 'Esperança Manuel',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      authorLocation: 'Benguela, Angola 🇦🇴',
      type: 'review',
      bookTitle: 'O Vendedor de Passados',
      bookAuthor: 'José Eduardo Agualusa',
      bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80',
      rating: 5,
      content: 'Agualusa cria uma atmosfera fascinante entre a ficção e a memória angolana. A leitura flui maravilhosamente bem no E-Reader da Zola Books. Recomendo 100%!',
      time: 'Há 1 hora',
      likesCount: 9,
      likedByMe: true,
      comments: []
    },
    {
      id: 'post_3',
      authorName: 'Dr. António Neto',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      authorLocation: 'Huambo, Angola 🇦🇴',
      type: 'achievement',
      achievementTitle: 'Leitor Voraz (Nível 4)',
      achievementIcon: '🔥',
      content: 'Completou 10 e-books lidos este mês! O clube de leitura do Huambo está a crescer a passos largos.',
      time: 'Há 3 horas',
      likesCount: 22,
      likedByMe: false,
      comments: [
        {
          id: 'c2',
          userName: 'Carlos Cassoma',
          userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
          text: 'Grande inspiração Dr. António!',
          time: 'Há 2 horas'
        }
      ]
    },
    {
      id: 'post_4',
      authorName: 'Nuria Bento',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      authorLocation: 'Lisboa, Portugal 🇵🇹',
      type: 'quote',
      bookTitle: 'Lueji - O Nascimento de um Império',
      bookAuthor: 'Pepetela',
      content: '«Quem não preserva a memória do seu povo, perde as chaves para construir o seu próprio futuro.»',
      time: 'Há 5 horas',
      likesCount: 17,
      likedByMe: false,
      comments: []
    },
    {
      id: 'post_5',
      authorName: 'Carlos Cassoma',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
      authorLocation: 'Cabinda, Angola 🇦🇴',
      type: 'reading_finished',
      bookTitle: 'Sagrada Esperança',
      bookAuthor: 'Agostinho Neto',
      content: 'Revisitar a poesia maior da nossa independência é sempre uma experiência emocionante.',
      time: 'Há 8 horas',
      likesCount: 11,
      likedByMe: false,
      comments: []
    }
  ]);

  const suggestedUsers = [
    { name: 'Ana Clara Domingos', location: 'Lubango, Angola 🇦🇴', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', booksRead: 14 },
    { name: 'Prof. João Francisco', location: 'Luanda, Angola 🇦🇴', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', booksRead: 28 },
    { name: 'Clube do Livro Ndongo', location: 'Comunidade Zola 📚', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80', booksRead: 85 },
  ];

  const handleToggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const liked = !p.likedByMe;
        return {
          ...p,
          likedByMe: liked,
          likesCount: liked ? p.likesCount + 1 : p.likesCount - 1
        };
      }
      return p;
    }));
  };

  const handleToggleFollow = (userName: string) => {
    if (followedUsers.includes(userName)) {
      setFollowedUsers(prev => prev.filter(u => u !== userName));
      addNotification('Comunidade', `Deixou de seguir ${userName}.`);
    } else {
      setFollowedUsers(prev => [...prev, userName]);
      addNotification('Novo Amigo', `Agora está a seguir ${userName} na Zola Books!`);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;

    const newComment: FeedComment = {
      id: `c_${Date.now()}`,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: commentInput.trim(),
      time: 'Agora'
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, newComment]
        };
      }
      return p;
    }));

    setCommentInput('');
    addNotification('Comentário Publicado', 'O teu comentário foi adicionado à atividade.');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const matchedBook = books.find(b => b.title.toLowerCase() === selectedBookTitle.toLowerCase());

    const userCreatedPost: FeedPost = {
      id: `post_user_${Date.now()}`,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      authorLocation: 'Luanda, Angola 🇦🇴',
      type: matchedBook ? 'review' : 'user_post',
      bookTitle: matchedBook?.title,
      bookAuthor: matchedBook?.author,
      bookCover: matchedBook?.coverImage,
      content: newPostText.trim(),
      time: 'Agora mesmo',
      likesCount: 1,
      likedByMe: true,
      comments: []
    };

    setPosts(prev => [userCreatedPost, ...prev]);
    setNewPostText('');
    setSelectedBookTitle('');
    setShowCreateModal(false);
    addNotification('Atividade Publicada', 'A tua atualização de leitura foi partilhada no feed da comunidade!');
  };

  const filteredPosts = posts.filter(p => {
    if (activeFilter === 'readings') return p.type === 'reading_finished' || p.type === 'quote';
    if (activeFilter === 'achievements') return p.type === 'achievement';
    if (activeFilter === 'reviews') return p.type === 'review';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Community Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Compass className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Feed Social de Leitores</h2>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Comunidade Luanda &amp; Global
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Acompanha em tempo real as leituras, conquistas e resenhas dos teus amigos e leitores da Zola Books.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Publicar Minha Atividade
        </button>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Center Feed Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters Bar */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl text-xs font-bold">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeFilter === 'all' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas ({posts.length})
              </button>
              <button
                onClick={() => setActiveFilter('readings')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeFilter === 'readings' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                📖 Leituras
              </button>
              <button
                onClick={() => setActiveFilter('achievements')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeFilter === 'achievements' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                🏆 Conquistas
              </button>
              <button
                onClick={() => setActiveFilter('reviews')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeFilter === 'reviews' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⭐ Avaliações
              </button>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 p-5 rounded-3xl space-y-4 shadow-lg transition-all"
              >
                
                {/* Author Info & Activity Type */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.authorAvatar} 
                      alt={post.authorName} 
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-white">{post.authorName}</h4>
                        <span className="text-[10px] text-slate-400">{post.authorLocation}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" /> {post.time}
                      </span>
                    </div>
                  </div>

                  {/* Activity Badge */}
                  {post.type === 'achievement' && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span>{post.achievementIcon || '👑'}</span>
                      <span>Conquista</span>
                    </span>
                  )}
                  {post.type === 'review' && (
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-purple-400" />
                      <span>Resenha</span>
                    </span>
                  )}
                  {post.type === 'reading_finished' && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Leitura Concluída</span>
                    </span>
                  )}
                  {post.type === 'quote' && (
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                      ✍️ Citação
                    </span>
                  )}
                </div>

                {/* Achievement Highlight Card if present */}
                {post.achievementTitle && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-3.5 rounded-2xl flex items-center gap-3">
                    <span className="text-2xl">{post.achievementIcon}</span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Medalha Desbloqueada</span>
                      <h5 className="font-extrabold text-xs text-white">{post.achievementTitle}</h5>
                    </div>
                  </div>
                )}

                {/* Book Attachment if present */}
                {post.bookTitle && (
                  <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
                    {post.bookCover && (
                      <img 
                        src={post.bookCover} 
                        alt={post.bookTitle} 
                        className="w-10 h-14 object-cover rounded-lg bg-slate-900 border border-slate-800 shrink-0" 
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-amber-400 truncate">{post.bookTitle}</h5>
                      <p className="text-[11px] text-slate-400 truncate">por {post.bookAuthor}</p>
                      {post.rating && (
                        <div className="flex items-center gap-1 mt-0.5 text-amber-400">
                          {Array.from({ length: post.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Post Content Text */}
                <p className="text-xs text-slate-200 leading-relaxed">
                  {post.content}
                </p>

                {/* Actions Bar (Likes, Comments, Share) */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors font-bold ${
                        post.likedByMe ? 'text-rose-400' : 'hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-current' : ''}`} />
                      <span>{post.likesCount}</span>
                    </button>

                    <button
                      onClick={() => setOpenCommentPostId(openCommentPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors font-semibold"
                    >
                      <MessageCircle className="w-4 h-4 text-amber-500" />
                      <span>{post.comments.length} Comentários</span>
                    </button>
                  </div>

                  <button
                    onClick={() => addNotification('Partilhado', 'Atividade copiada para partilha!')}
                    className="hover:text-white p-1 rounded-lg"
                    title="Partilhar Atividade"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Comments Section Drawer */}
                {openCommentPostId === post.id && (
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3 pt-3 animate-in fade-in">
                    
                    {/* Existing Comments List */}
                    {post.comments.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs">
                            <img 
                              src={comment.userAvatar} 
                              alt={comment.userName} 
                              className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200 text-[11px]">{comment.userName}</span>
                                <span className="text-[9px] text-slate-500">{comment.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-300 mt-0.5">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic text-center py-1">Sê o primeiro a comentar esta leitura!</p>
                    )}

                    {/* New Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Escreve um comentário encorajador..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                        className="flex-1 bg-slate-900 text-xs text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2 rounded-xl font-bold text-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>

        {/* Right Sidebar Column (Suggestions & Club Info) */}
        <div className="space-y-6">
          
          {/* Reader Suggestions Box */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" /> Sugestões de Amigos
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Angola &amp; PALOP</span>
            </h3>

            <div className="space-y-3">
              {suggestedUsers.map((user) => {
                const isFollowing = followedUsers.includes(user.name);
                return (
                  <div key={user.name} className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-xl object-cover shrink-0" 
                      />
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-white truncate">{user.name}</h5>
                        <p className="text-[10px] text-slate-400 truncate">{user.location} • {user.booksRead} e-books</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(user.name)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 ${
                        isFollowing
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                      }`}
                    >
                      {isFollowing ? <CheckCircle2 className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                      <span>{isFollowing ? 'A Seguir' : 'Seguir'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zola Reading Clubs Promo Box */}
          <div className="bg-gradient-to-br from-purple-950/50 via-slate-900 to-amber-950/30 border border-purple-500/30 p-5 rounded-3xl space-y-3 shadow-xl">
            <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30 inline-block">
              Comunidade Zola Ndongo
            </span>
            <h4 className="font-extrabold text-sm text-white">Clube de Leitura Angolano</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Junta-te a mais de 1.200 leitores que discutem quinzenalmente grandes obras da literatura angolana e africana.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => addNotification('Clube de Leitura', 'Ficaste inscrito nas reuniões virtuais do Clube Ndongo!')}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Aderir ao Clube Ndongo
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Publish New Activity */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Publicar Atividade no Feed Social</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  Vincular Livro do Catálogo (Opcional):
                </label>
                <select
                  value={selectedBookTitle}
                  onChange={(e) => setSelectedBookTitle(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Nenhum livro vinculado</option>
                  {books.map(b => (
                    <option key={b.id} value={b.title}>
                      {b.title} por {b.author}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">
                  O que queres partilhar com os leitores?
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escreve uma resenha, citação favorita ou pensamentos sobre a tua leitura recente..."
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
