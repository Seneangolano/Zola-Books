import React, { useState } from 'react';
import { 
  Star, 
  Quote, 
  CheckCircle2, 
  BookOpen, 
  ThumbsUp, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  MessageSquarePlus,
  Send,
  User,
  MapPin,
  Flame,
  Award
} from 'lucide-react';
import { triggerHapticFeedback } from '../lib/haptic';
import { useApp } from '../context/AppContext';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  date: string;
  quote: string;
  bookRead: string;
  bookAuthor: string;
  verifiedPurchase: boolean;
  category: 'angolan_literature' | 'reading_experience' | 'payment_speed' | 'vip_pass';
  likesCount: number;
}

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Esperança de Almeida',
    role: 'Professora do Ensino Secundário',
    location: 'Luanda, Maianga',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'Há 3 dias',
    quote: 'Poder ler obras como "Mayombe" de Pepetela e "Sagrada Esperança" de Agostinho Neto no telemóvel sem precisar de internet no trânsito de Luanda mudou a minha rotina. O leitor offline funciona de forma impecável!',
    bookRead: 'Mayombe',
    bookAuthor: 'Pepetela',
    verifiedPurchase: true,
    category: 'angolan_literature',
    likesCount: 34
  },
  {
    id: 'test-2',
    name: 'Matias Sebastião Silva',
    role: 'Engenheiro de Software & Leitor',
    location: 'Benguela, Centro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'Há 1 semana',
    quote: 'Comprar por Multicaixa Express e receber o livro imediatamente na biblioteca digital em menos de 10 segundos foi uma surpresa excelente. O melhor ecossistema de leitura digital criado em Angola.',
    bookRead: 'Os Transparentes',
    bookAuthor: 'Ondjaki',
    verifiedPurchase: true,
    category: 'payment_speed',
    likesCount: 28
  },
  {
    id: 'test-3',
    name: 'Cândida Van-Dúnem',
    role: 'Estudante de Direito',
    location: 'Huambo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'Há 2 semanas',
    quote: 'As anotações e destaques sincronizados com a minha conta tornaram os meus estudos literários muito mais produtivos. E o assistente Zola IA ajuda-me imenso a interpretar contextos históricos dos livros.',
    bookRead: 'Luuanda',
    bookAuthor: 'José Luandino Vieira',
    verifiedPurchase: true,
    category: 'reading_experience',
    likesCount: 19
  },
  {
    id: 'test-4',
    name: 'Dr. Valdemar Nsingi',
    role: 'Médico & Entusiasta Literário',
    location: 'Lubango, Huíla',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'Há 3 semanas',
    quote: 'Com a subscrição Zola Pass VIP, tenho acesso a lançamentos semanais e à coleção completa de autores africanos sem burocracia. O preço mensal em Kwanzas é super justo.',
    bookRead: 'A Geração da Utopia',
    bookAuthor: 'Pepetela',
    verifiedPurchase: true,
    category: 'vip_pass',
    likesCount: 42
  },
  {
    id: 'test-5',
    name: 'Ana Bela Costa',
    role: 'Designer Gráfica & Poeta',
    location: 'Cabinda',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'Há 1 mês',
    quote: 'A tipografia do leitor e o modo noturno com proteção ocular são excecionais para leituras prolongadas à noite. A Zola Books valoriza a nossa cultura como nenhuma outra plataforma.',
    bookRead: 'Chuva Pasmada',
    bookAuthor: 'Manuel Rui',
    verifiedPurchase: true,
    category: 'reading_experience',
    likesCount: 25
  },
  {
    id: 'test-6',
    name: 'Kelson de Oliveira',
    role: 'Empreendedor',
    location: 'Luanda, Talatona',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: 'Há 1 mês',
    quote: 'A possibilidade de comprar pacotes de livros com 35% de desconto permitiu-me montar uma biblioteca completa no meu tablet. Recomendo a todos os amantes da literatura!',
    bookRead: 'Quem Me Dera Ser Onda',
    bookAuthor: 'Manuel Rui',
    verifiedPurchase: true,
    category: 'payment_speed',
    likesCount: 31
  }
];

export const ReaderTestimonials: React.FC = () => {
  const { addNotification, currentUser } = useApp();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Modal / Form to submit new review
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userLocation, setUserLocation] = useState('Luanda');
  const [userRole, setUserRole] = useState('Leitor Zola Books');
  const [userQuote, setUserQuote] = useState('');
  const [userBook, setUserBook] = useState('Literatura Angolana');
  const [userRating, setUserRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filterOptions = [
    { id: 'all', label: 'Todos os Depoimentos' },
    { id: 'angolan_literature', label: '🇦🇴 Literatura Angolana' },
    { id: 'reading_experience', label: '📖 Experiência E-Reader' },
    { id: 'payment_speed', label: '⚡ Pagamentos Multicaixa' },
    { id: 'vip_pass', label: '👑 Zola Pass VIP' },
  ];

  const filteredTestimonials = testimonials.filter(t => {
    if (selectedFilter === 'all') return true;
    return t.category === selectedFilter;
  });

  const handleLike = (id: string) => {
    triggerHapticFeedback('light');
    setLikedMap(prev => {
      const isCurrentlyLiked = !!prev[id];
      const nextLiked = !isCurrentlyLiked;
      
      setTestimonials(items =>
        items.map(t => {
          if (t.id === id) {
            return {
              ...t,
              likesCount: isCurrentlyLiked ? t.likesCount - 1 : t.likesCount + 1
            };
          }
          return t;
        })
      );
      
      return { ...prev, [id]: nextLiked };
    });
  };

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuote.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newEntry: Testimonial = {
        id: `custom-${Date.now()}`,
        name: userName.trim() || 'Leitor Zola',
        role: userRole.trim() || 'Leitor Verificado',
        location: userLocation.trim() || 'Angola',
        avatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: userRating,
        date: 'Agora mesmo',
        quote: userQuote.trim(),
        bookRead: userBook.trim() || 'E-book Digital',
        bookAuthor: 'Autor Verificado',
        verifiedPurchase: true,
        category: 'reading_experience',
        likesCount: 1
      };

      setTestimonials([newEntry, ...testimonials]);
      setIsSubmitting(false);
      setIsSubmitModalOpen(false);
      setUserQuote('');
      addNotification(
        'Depoimento Publicado! ✨',
        'Obrigado por partilhar a tua experiência de leitura na comunidade Zola Books!',
        'system'
      );
    }, 400);
  };

  return (
    <section 
      id="reader-testimonials-section" 
      aria-label="Testemunhos de Leitores"
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Comunidade &amp; Opiniões
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Avaliação Média 4.9/5.0</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2.5">
            <span>O Que Dizem os Nossos Leitores</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Descubra as experiências de estudantes, professores, autores e apaixonados pela literatura angolana que leem diariamente na Zola Books.
          </p>
        </div>

        {/* Action Button: Share own story */}
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            setIsSubmitModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-amber-500/30 transition-all hover:border-amber-500/60 shadow-lg shadow-black/40 shrink-0 active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4 text-amber-400" />
          <span>Partilhar a Minha Experiência</span>
        </button>
      </div>

      {/* Trust & Community Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-white">4.9 / 5.0</div>
            <div className="text-[10px] text-slate-400 font-semibold">+2.400 Avaliações</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-white">+18.000</div>
            <div className="text-[10px] text-slate-400 font-semibold">E-books Lidos</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-white">99.8%</div>
            <div className="text-[10px] text-slate-400 font-semibold">Leitores Satisfeitos</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-white">18 Províncias</div>
            <div className="text-[10px] text-slate-400 font-semibold">Leitores em Toda Angola</div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
        {filterOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => {
              triggerHapticFeedback('light');
              setSelectedFilter(opt.id);
            }}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs ${
              selectedFilter === opt.id
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredTestimonials.map((testimonial) => {
          const isLiked = !!likedMap[testimonial.id];
          return (
            <article 
              key={testimonial.id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-md relative group"
            >
              {/* Top Quote Icon Decoration */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  {/* Author Profile */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-500/40 shrink-0 shadow-md"
                      onError={(e) => {
                        // Fallback avatar
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-white text-xs truncate">
                          {testimonial.name}
                        </h4>
                        {testimonial.verifiedPurchase && (
                          <span title="Leitor Verificado Zola Books" className="shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{testimonial.role}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        <span>{testimonial.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-0.5 shrink-0 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${
                          i < testimonial.rating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-slate-700'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Quote Text */}
                <div className="relative pt-1">
                  <Quote className="w-5 h-5 text-amber-500/20 absolute -top-1 -left-1 pointer-events-none" />
                  <p className="text-xs text-slate-300 leading-relaxed italic pl-3 relative z-10">
                    "{testimonial.quote}"
                  </p>
                </div>
              </div>

              {/* Card Footer: Book Read & Likes */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">
                    Leu: <strong className="text-slate-200 font-semibold">{testimonial.bookRead}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-500">{testimonial.date}</span>
                  <button
                    onClick={() => handleLike(testimonial.id)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] transition-colors ${
                      isLiked
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                    title="Útil"
                  >
                    <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    <span>{testimonial.likesCount}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Submit Testimonial Modal */}
      {isSubmitModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Partilhe o Seu Depoimento</h3>
                  <p className="text-xs text-slate-400">Conte à comunidade Zola Books como tem sido a sua leitura.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTestimonial} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">O Seu Nome</label>
                <input 
                  type="text" 
                  required
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex: Teresa António" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Profissão / Ocupação</label>
                  <input 
                    type="text" 
                    value={userRole} 
                    onChange={(e) => setUserRole(e.target.value)}
                    placeholder="Ex: Estudante Universitária" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Província / Cidade</label>
                  <input 
                    type="text" 
                    value={userLocation} 
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="Ex: Luanda, Talatona" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Livro que Leu / Favorito</label>
                  <input 
                    type="text" 
                    value={userBook} 
                    onChange={(e) => setUserBook(e.target.value)}
                    placeholder="Ex: Mayombe (Pepetela)" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Avaliação</label>
                  <div className="flex items-center gap-1 py-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            star <= userRating 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-slate-700'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">O Seu Comentário / Citação</label>
                <textarea 
                  required
                  rows={3}
                  value={userQuote}
                  onChange={(e) => setUserQuote(e.target.value)}
                  placeholder="Conte o que achou da experiência de leitura digital, catálogo ou do leitor offline..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'A Enviar...' : 'Publicar Depoimento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
