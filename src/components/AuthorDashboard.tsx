import React, { useState } from 'react';
import { 
  Feather, 
  Plus, 
  Sparkles, 
  BookOpen, 
  DollarSign, 
  Award, 
  FileText, 
  CheckCircle,
  TrendingUp,
  Bell,
  Users,
  Radio,
  Upload,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { uploadBookCover } from '../lib/firebase';

export const AuthorDashboard: React.FC = () => {
  const { currentUser, books, addBookToCatalog, formatPrice, addNotification } = useApp();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Literatura Angolana');
  const [priceAOA, setPriceAOA] = useState<number>(4500);
  const [priceUSD, setPriceUSD] = useState<number>(4.80);
  const [pageCount, setPageCount] = useState<number>(180);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [description, setDescription] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [fullChapterText, setFullChapterText] = useState('');

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const downloadUrl = await uploadBookCover(file, `author_${Date.now()}`);
      setCoverImage(downloadUrl);
      addNotification('Capa Carregada', 'Imagem de capa carregada no Firebase Storage com sucesso.');
    } catch (err: any) {
      addNotification('Erro ao Carregar Capa', err.message || 'Falha no upload.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  // AI Assistant state
  const [authorNotes, setAuthorNotes] = useState('');
  const [isGeneratingBlurb, setIsGeneratingBlurb] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const authorBooks = books.filter(b => b.author.toLowerCase() === currentUser.name.toLowerCase() || b.authorId === currentUser.id);

  const handleGenerateBlurbWithAI = async () => {
    if (!title.trim()) {
      addNotification('Zola IA Autor', 'Por favor insira primeiro o título do livro.');
      return;
    }

    setIsGeneratingBlurb(true);
    try {
      const resultText = await api.getAuthorBlurbAI(title, category, authorNotes || 'História cativante ambientada em Luanda.');
      setDescription(resultText);
      addNotification('Sinopse Gerada!', 'A Zola IA gerou uma sinopse cativante para a tua obra.');
    } catch (err: any) {
      addNotification('Erro IA', 'Falha ao gerar sinopse com IA.');
    } finally {
      setIsGeneratingBlurb(false);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsPublishing(true);
    try {
      await addBookToCatalog({
        title,
        subtitle,
        author: currentUser.name,
        authorId: currentUser.id,
        category,
        priceAOA,
        priceUSD,
        pageCount,
        coverImage,
        description,
        isAngolanAuthor: true,
        language: 'Português',
        publisher: 'Zola Autor Independente',
        fileSizeMb: 4.5,
        sampleContent: {
          chapters: [{ title: 'Capítulo 1: Amostra', content: sampleText || 'Amostra inicial do e-book.' }]
        },
        fullContent: {
          chapters: [
            { title: 'Capítulo 1: Introdução', content: sampleText || 'Capítulo inicial...' },
            { title: 'Capítulo 2: Desenvolvimento', content: fullChapterText || 'Conteúdo completo do livro publicado.' }
          ]
        },
        tags: ['Autor Angolano', category, 'E-book Digital']
      });

      // Reset Form
      setTitle('');
      setSubtitle('');
      setDescription('');
      setSampleText('');
      setFullChapterText('');
    } catch (err: any) {
      addNotification('Erro ao Publicar', err.message || 'Falha ao guardar obra.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/90 via-slate-900 to-amber-950/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Feather className="w-3.5 h-3.5 text-purple-400" />
            <span>Painel do Autor &amp; Criador Digital</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Bem-vindo, {currentUser.name}!
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Publique as tuas obras literárias para milhares de leitores em Angola e no mundo. Receba royalties diretos em Kwanzas e Dólares.
          </p>
        </div>

        {/* Royalties & Followers Card */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900/90 border border-purple-500/30 p-4 rounded-2xl text-xs space-y-1 min-w-[180px]">
            <span className="text-slate-400 block font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-400" /> Seguidores Ativos:
            </span>
            <span className="text-xl font-black text-white block">
              1.240 Leitores
            </span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <Bell className="w-3 h-3 animate-pulse text-amber-400" /> Recebem Notificações Push
            </span>
          </div>

          <div className="bg-slate-900/90 border border-purple-500/30 p-4 rounded-2xl text-xs space-y-1 min-w-[180px]">
            <span className="text-slate-400 block font-semibold">Royalties Acumulados:</span>
            <span className="text-xl font-black text-emerald-400 block">
              {formatPrice(78500, 84.50)}
            </span>
            <span className="text-[10px] text-amber-400 font-medium">85% de Margem para o Autor</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Publish Form */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Publicar Novo E-book no Catálogo Zola</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Preencha os dados e use a Zola IA para criar uma sinopse profissional.
            </p>
          </div>

          <form onSubmit={handlePublishSubmit} className="space-y-4 text-xs">
            
            <div>
              <label className="text-slate-300 font-bold block mb-1">Título do Livro *</label>
              <input
                type="text"
                required
                placeholder="Ex: O Canto do Kwanza no Musseque"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                >
                  <option value="Literatura Angolana">Literatura Angolana</option>
                  <option value="Ficção">Ficção</option>
                  <option value="Não-Ficção">Não-Ficção</option>
                  <option value="Negócios &amp; Finanças">Negócios &amp; Finanças</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Poesia">Poesia</option>
                  <option value="Infanto-Juvenil">Infanto-Juvenil</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Nº de Páginas</label>
                <input
                  type="number"
                  value={pageCount}
                  onChange={(e) => setPageCount(parseInt(e.target.value) || 100)}
                  className="w-full bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Preço em Kwanzas (AOA)</label>
                <input
                  type="number"
                  value={priceAOA}
                  onChange={(e) => setPriceAOA(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Preço em Dólares ($ USD)</label>
                <input
                  type="number"
                  step="0.10"
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Cover Image Upload (Firebase Storage) */}
            <div className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Capa do E-book (Firebase Storage)
                </span>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer transition-colors text-xs">
                  {isUploadingCover ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploadingCover ? 'A carregar...' : 'Carregar Imagem'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCoverFileChange} 
                    className="hidden" 
                    disabled={isUploadingCover}
                  />
                </label>
              </div>

              <div className="flex items-center gap-3">
                <img 
                  src={coverImage} 
                  alt="Pré-visualização da Capa" 
                  className="w-14 h-20 object-cover rounded-xl border border-slate-700 shrink-0 shadow-md"
                />
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Ou cole a URL da imagem de capa..."
                  className="flex-1 bg-slate-900 text-slate-200 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>

            {/* AI Blurb Generator Box */}
            <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Assistente Zola IA de Sinopse Literária
                </span>
                <button
                  type="button"
                  onClick={handleGenerateBlurbWithAI}
                  disabled={isGeneratingBlurb || !title.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isGeneratingBlurb ? 'A Criar...' : 'Gerar Sinopse com IA'}
                </button>
              </div>

              <input
                type="text"
                placeholder="Anotações curtas para a IA (ex: História de superação na cidade de Benguela...)"
                value={authorNotes}
                onChange={(e) => setAuthorNotes(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 p-2.5 rounded-xl border border-purple-500/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Sinopse da Obra *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição que os leitores verão no catálogo..."
                className="w-full bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Texto da Amostra (Capítulo 1)</label>
              <textarea
                rows={3}
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Insira o texto que estará disponível para leitura gratuita..."
                className="w-full bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Push Notification Notice for Followers */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-amber-300">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <span className="font-extrabold text-white block">
                  Notificação Push In-App Ativada!
                </span>
                <p className="text-[11px] text-amber-200/90 leading-tight">
                  Ao publicar, todos os 1.240 leitores que te seguem no Zola Books receberão um aviso instantâneo e notificação push in-app com o teu novo e-book.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              {isPublishing ? 'A Publicar & Notificar Seguidores...' : 'Publicar E-book & Notificar Seguidores'}
            </button>

          </form>
        </div>

        {/* Author Published Books List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Minhas Obras Publicadas ({authorBooks.length})</span>
          </h2>

          <div className="space-y-3">
            {authorBooks.map((bk) => (
              <div key={bk.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                <img
                  src={bk.coverImage}
                  alt={bk.title}
                  className="w-14 h-18 object-cover rounded-xl bg-slate-950"
                />
                <div className="flex-1 min-w-0 text-xs space-y-1">
                  <h4 className="font-bold text-white truncate">{bk.title}</h4>
                  <p className="text-slate-400">{bk.category} • {bk.rating} ★</p>
                  <span className="font-bold text-amber-400 block">
                    {formatPrice(bk.priceAOA, bk.priceUSD)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
