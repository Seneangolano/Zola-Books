import React, { useState, useMemo } from 'react';
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
  Image as ImageIcon,
  Zap,
  Clock,
  Calendar,
  CreditCard,
  Download,
  ShoppingBag,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { uploadBookCover } from '../lib/firebase';

export const AuthorDashboard: React.FC = () => {
  const { 
    currentUser, 
    books, 
    addBookToCatalog, 
    formatPrice, 
    addNotification,
    sellerSales,
    simulateTestSellerSale,
    setSelectedBookModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'publish' | 'sales' | 'catalog'>('sales');

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Literatura Angolana');
  const [isFree, setIsFree] = useState(false);
  const [priceAOA, setPriceAOA] = useState<number>(4500);
  const [priceUSD, setPriceUSD] = useState<number>(4.80);
  const [pageCount, setPageCount] = useState<number>(180);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [description, setDescription] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [fullChapterText, setFullChapterText] = useState('');

  // AI Assistant state
  const [authorNotes, setAuthorNotes] = useState('');
  const [isGeneratingBlurb, setIsGeneratingBlurb] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const authorBooks = useMemo(() => {
    return books.filter(b => 
      b.author.toLowerCase().includes(currentUser.name.toLowerCase()) || 
      b.authorId === currentUser.id
    );
  }, [books, currentUser]);

  // Sales for this author's books
  const authorSales = useMemo(() => {
    return sellerSales.filter(sale => 
      sale.author.toLowerCase().includes(currentUser.name.toLowerCase()) || 
      sale.sellerId === currentUser.id ||
      authorBooks.some(b => b.id === sale.bookId || b.title.toLowerCase() === sale.bookTitle.toLowerCase())
    );
  }, [sellerSales, currentUser, authorBooks]);

  const authorTotalRoyaltiesAOA = useMemo(() => {
    return authorSales
      .filter(s => s.paymentStatus === 'completed')
      .reduce((sum, s) => sum + Math.round(s.amountAOA * 0.85), 0);
  }, [authorSales]);

  const authorTotalRoyaltiesUSD = useMemo(() => {
    return authorSales
      .filter(s => s.paymentStatus === 'completed')
      .reduce((sum, s) => sum + Number((s.amountUSD * 0.85).toFixed(2)), 0);
  }, [authorSales]);

  const handleTestSaleSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const targetBook = authorBooks[0]?.id;
      simulateTestSellerSale(targetBook);
      setIsSimulating(false);
    }, 400);
  };

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
      const finalPriceAOA = isFree ? 0 : priceAOA;
      const finalPriceUSD = isFree ? 0 : priceUSD;
      const finalCategory = isFree && category === 'Literatura Angolana' ? 'E-books Gratuitos' : category;

      await addBookToCatalog({
        title,
        subtitle,
        author: currentUser.name,
        authorId: currentUser.id,
        category: finalCategory,
        priceAOA: finalPriceAOA,
        priceUSD: finalPriceUSD,
        isFree: isFree || finalPriceAOA === 0,
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
        tags: [
          'Autor Angolano', 
          finalCategory, 
          'E-book Digital',
          ...(isFree ? ['Grátis', 'E-book Gratuito', 'Acesso Livre'] : [])
        ]
      });

      // Reset Form
      setTitle('');
      setSubtitle('');
      setDescription('');
      setSampleText('');
      setFullChapterText('');
      setIsFree(false);
      setActiveTab('catalog');
    } catch (err: any) {
      addNotification('Erro ao Publicar', err.message || 'Falha ao guardar obra.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-amber-950/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              <Feather className="w-3.5 h-3.5 text-purple-400" />
              <span>Painel do Autor &amp; Criador Digital</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Avisos em Tempo Real</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Bem-vindo, {currentUser.name}!
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Acompanha as vendas das tuas obras, recebe notificações sonoras a cada venda e gere o teu catálogo no Zola Books.
          </p>
        </div>

        {/* Royalties & Followers Card */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="bg-slate-900/90 border border-purple-500/30 p-4 rounded-2xl text-xs space-y-1 min-w-[160px]">
            <span className="text-slate-400 block font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-400" /> Leitores Seguintes:
            </span>
            <span className="text-xl font-black text-white block">
              1.240 Leitores
            </span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <Bell className="w-3 h-3 text-amber-400" /> Avisos Push In-App
            </span>
          </div>

          <div className="bg-slate-900/90 border border-purple-500/30 p-4 rounded-2xl text-xs space-y-1 min-w-[160px]">
            <span className="text-slate-400 block font-semibold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Royalties Líquidos (85%):
            </span>
            <span className="text-xl font-black text-emerald-400 block">
              {formatPrice(authorTotalRoyaltiesAOA + 78500, authorTotalRoyaltiesUSD + 84.50)}
            </span>
            <span className="text-[10px] text-amber-400 font-medium">Margem Direta do Autor</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'sales'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Vendas &amp; Notificações em Tempo Real ({authorSales.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('publish')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'publish'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Publicar Novo E-book &amp; Zola IA</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'catalog'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Minhas Obras ({authorBooks.length})</span>
        </button>
      </div>

      {/* TAB 1: Real-time Author Sales Feed */}
      {activeTab === 'sales' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>Histórico de Vendas das Tuas Obras</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Recebe um aviso em tempo real com som a cada livro adquirido por um leitor.
              </p>
            </div>

            <button
              onClick={handleTestSaleSimulation}
              disabled={isSimulating}
              className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              title="Simular uma compra de teste para verificar som e alerta"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isSimulating ? 'A Testar...' : '⚡ Testar Notificação de Venda'}</span>
            </button>
          </div>

          {authorSales.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhuma venda registada ainda</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Clica no botão de teste acima para simular uma compra em tempo real e ouvir o som de notificação!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-bold bg-slate-950/50">
                    <th className="py-3 px-4 rounded-l-xl">Livro</th>
                    <th className="py-3 px-4">Valor Total</th>
                    <th className="py-3 px-4">Teus Royalties (85%)</th>
                    <th className="py-3 px-4">Data &amp; Hora</th>
                    <th className="py-3 px-4">Comprador</th>
                    <th className="py-3 px-4">Método</th>
                    <th className="py-3 px-4 rounded-r-xl">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {authorSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                        {sale.bookCover && (
                          <img src={sale.bookCover} alt={sale.bookTitle} className="w-8 h-12 object-cover rounded shadow-sm" />
                        )}
                        <div>
                          <span>{sale.bookTitle}</span>
                          <span className="block text-[10px] text-slate-500 font-mono">{sale.orderId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        {formatPrice(sale.amountAOA, sale.amountUSD)}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                        + {formatPrice(Math.round(sale.amountAOA * 0.85), Number((sale.amountUSD * 0.85).toFixed(2)))}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{sale.date}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{sale.time}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {sale.buyerName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 uppercase text-[10px]">
                        {sale.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {sale.paymentStatus === 'completed' ? 'Concluído' : 'Aguardando'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Publish Form */}
      {activeTab === 'publish' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Publicar Novo E-book no Catálogo Zola</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Preenche os dados e usa a Zola IA para criar uma sinopse profissional.
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

              {/* Free Book Publishing Option */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 transition-all">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsFree(checked);
                      if (checked) {
                        setPriceAOA(0);
                        setPriceUSD(0);
                      } else {
                        setPriceAOA(4500);
                        setPriceUSD(4.80);
                      }
                    }}
                    className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-slate-900 accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-extrabold text-sm">Disponibilizar este E-book Gratuitamente</span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Gift className="w-3 h-3 text-emerald-400" />
                        <span>100% Grátis</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      O livro será sinalizado com o selo <strong className="text-emerald-400">"GRÁTIS"</strong> no catálogo e qualquer leitor poderá adicioná-lo à sua biblioteca permanente com 1 clique, sem pagamento. Excelente para conquistar leitores e promover a tua marca como autor!
                    </p>
                  </div>
                </label>
              </div>

              {!isFree ? (
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
              ) : (
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    0 Kz
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-emerald-300 block">Preço fixado em 0 Kz / $0.00 (Acesso Livre)</span>
                    <span className="text-slate-400">Este e-book não gerará cobranças aos utilizadores.</span>
                  </div>
                </div>
              )}

              {/* Cover Upload */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Imagem de Capa</label>
                <div className="flex items-center gap-3">
                  <img
                    src={coverImage}
                    alt="Preview da capa"
                    className="w-14 h-20 object-cover rounded-xl border border-slate-700 bg-slate-950"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      className="block w-full text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block">Carregue JPEG ou PNG (recomendado: 800x1200px)</span>
                  </div>
                </div>
              </div>

              {/* AI Blurb Generator */}
              <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Gerador de Sinopse com Zola IA
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateBlurbWithAI}
                    disabled={isGeneratingBlurb}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {isGeneratingBlurb && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Gerar Sinopse</span>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Anotações curtas para a IA (ex: Romance histórico em Luanda no século XIX...)"
                  value={authorNotes}
                  onChange={(e) => setAuthorNotes(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 p-2.5 rounded-xl border border-purple-500/30 focus:outline-none text-xs"
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
                  className="w-full bg-slate-800 text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 text-xs"
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
                    Ao publicar, todos os 1.240 leitores que te seguem no Zola Books receberão um aviso instantâneo com a nova obra.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPublishing}
                className="w-full bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
              >
                {isPublishing ? 'A Publicar & Notificar Leitores...' : 'Publicar E-book & Notificar Seguidores'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Benefícios do Autor Zola</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                <li>85% de royalties em cada venda realizada.</li>
                <li>Notificação instantânea em tempo real com som a cada compra.</li>
                <li>Pagamento em Kwanzas (via Multicaixa Express / IBAN) ou Dólares (Stripe).</li>
                <li>Proteção DRM e leitura offline para os teus leitores.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: My Published Books */}
      {activeTab === 'catalog' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Minhas Obras Publicadas ({authorBooks.length})</span>
            </h2>
            <button
              onClick={() => setActiveTab('publish')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Nova</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {authorBooks.map((bk) => (
              <div key={bk.id} className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3.5">
                <img
                  src={bk.coverImage}
                  alt={bk.title}
                  className="w-16 h-22 object-cover rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white truncate">{bk.title}</h4>
                    {bk.isFree && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase px-1.5 py-0.2 rounded border border-emerald-500/40 shrink-0">
                        Grátis
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 truncate">{bk.category}</p>
                  <span className="font-black text-emerald-400 block">
                    {bk.isFree ? '🎁 Gratuito (0 Kz)' : formatPrice(bk.priceAOA, bk.priceUSD)}
                  </span>
                  <button
                    onClick={() => setSelectedBookModal(bk)}
                    className="text-[11px] text-amber-400 hover:underline font-semibold block pt-1"
                  >
                    Ver no Catálogo →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
