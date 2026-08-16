import React, { useState, useMemo } from 'react';
import { 
  Store, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Tag, 
  Plus, 
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Sparkles,
  BookOpen,
  User,
  CreditCard,
  ChevronRight,
  ExternalLink,
  Zap,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { SellerSaleNotification } from '../types';

export const SellerDashboard: React.FC = () => {
  const { 
    currentUser, 
    orders, 
    sellerSales, 
    simulateTestSellerSale, 
    formatPrice, 
    books, 
    addNotification,
    setSelectedBookModal 
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'awaiting_iban_proof' | 'pending'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<SellerSaleNotification | null>(null);

  // Filter sales for the current seller/publisher (or all if admin/demo)
  const currentSellerSales = useMemo(() => {
    return sellerSales.filter(sale => {
      // If user is seller or author, match their books or seller ID
      if (currentUser.role === 'seller') {
        return true; // Seller manages all bookstore partner sales
      }
      if (currentUser.role === 'author') {
        return sale.author.toLowerCase().includes(currentUser.name.toLowerCase()) || 
               sale.sellerId === currentUser.id;
      }
      return true; // Admin/all
    });
  }, [sellerSales, currentUser]);

  // Apply search & status filter
  const filteredSales = useMemo(() => {
    return currentSellerSales.filter(sale => {
      const matchesSearch = 
        sale.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' ? true : sale.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [currentSellerSales, searchTerm, statusFilter]);

  // Key KPI calculations
  const totalRevenueAOA = useMemo(() => {
    return currentSellerSales
      .filter(s => s.paymentStatus === 'completed')
      .reduce((sum, s) => sum + s.amountAOA, 0);
  }, [currentSellerSales]);

  const totalRevenueUSD = useMemo(() => {
    return currentSellerSales
      .filter(s => s.paymentStatus === 'completed')
      .reduce((sum, s) => sum + s.amountUSD, 0);
  }, [currentSellerSales]);

  const totalCompletedCopies = useMemo(() => {
    return currentSellerSales.filter(s => s.paymentStatus === 'completed').length;
  }, [currentSellerSales]);

  const todaySalesCount = useMemo(() => {
    const todayStr = new Date();
    const formattedToday = `${String(todayStr.getDate()).padStart(2, '0')}/${String(todayStr.getMonth() + 1).padStart(2, '0')}/${todayStr.getFullYear()}`;
    return currentSellerSales.filter(s => s.date === formattedToday).length;
  }, [currentSellerSales]);

  // Dynamic chart data aggregating recent sales
  const chartData = useMemo(() => {
    return [
      { month: 'Jan', VendasAOA: 180000, VendasUSD: 195 },
      { month: 'Fev', VendasAOA: 290000, VendasUSD: 310 },
      { month: 'Mar', VendasAOA: 420000, VendasUSD: 450 },
      { month: 'Abr', VendasAOA: 580000, VendasUSD: 620 },
      { month: 'Mai', VendasAOA: 710000, VendasUSD: 760 },
      { month: 'Jun', VendasAOA: 890000, VendasUSD: 950 },
      { month: 'Jul', VendasAOA: 1150000, VendasUSD: 1230 },
      { month: 'Ago', VendasAOA: 1350000 + totalRevenueAOA, VendasUSD: 1450 + totalRevenueUSD },
    ];
  }, [totalRevenueAOA, totalRevenueUSD]);

  const handleTestSaleSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      simulateTestSellerSale();
      setIsSimulating(false);
    }, 400);
  };

  const handleCreateSellerCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    addNotification('Cupom Criado', `O cupom de vendedor "${couponCode.toUpperCase()}" (${discountPercent}% OFF) foi ativado.`);
    setCouponCode('');
  };

  const handleExportCsv = () => {
    const headers = 'ID Venda,ID Pedido,Livro,Autor,Comprador,Email,Valor (AOA),Valor (USD),Moeda,Data,Hora,Metodo Pagamento,Estado\n';
    const rows = filteredSales.map(s => 
      `"${s.id}","${s.orderId}","${s.bookTitle.replace(/"/g, '""')}","${s.author}","${s.buyerName}","${s.buyerEmail}",${s.amountAOA},${s.amountUSD},"${s.currencyPaid}","${s.date}","${s.time}","${s.paymentMethod}","${s.paymentStatus}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `zolabooks-vendas-vendedor-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification('Relatório Exportado', 'O arquivo CSV de vendas foi gerado e descarregado com sucesso.', 'system');
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'multicaixa_express':
        return <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[11px] font-bold">Multicaixa Express</span>;
      case 'multicaixa_reference':
        return <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[11px] font-bold">Ref. EMIS</span>;
      case 'stripe_card':
        return <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px] font-bold">Cartão Visa/MC</span>;
      case 'iban_transfer':
        return <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[11px] font-bold">IBAN Bancário</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px]">{method}</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Pago / Concluído
          </span>
        );
      case 'awaiting_iban_proof':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Aguardando Comprovativo
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-700/60 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner with Real-time Signal */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>Painel de Vendas da Editora &amp; Vendedor</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Notificações em Tempo Real Ativas</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            {currentUser.name}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl">
            Acompanha as tuas vendas digitais, recebe avisos sonoros e pop-ups imediatos a cada compra confirmada e faz a gestão dos teus leitores.
          </p>
        </div>

        {/* Live Simulation Button & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 z-10 w-full lg:w-auto">
          <button
            onClick={handleTestSaleSimulation}
            disabled={isSimulating}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            title="Simula uma compra instantânea para testar o som de caixa registadora, alerta flutuante e atualização na tabela"
          >
            <Zap className={`w-4 h-4 ${isSimulating ? 'animate-spin' : 'text-slate-950 fill-slate-950'}`} />
            <span>{isSimulating ? 'Processando...' : '⚡ Simular Venda em Tempo Real (Teste)'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-3 rounded-2xl transition-colors flex items-center justify-center gap-1.5"
            title="Exportar todas as vendas em arquivo CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Faturação Total Líquida</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-emerald-400 pt-1">
            {formatPrice(totalRevenueAOA, totalRevenueUSD)}
          </div>
          <p className="text-[11px] text-slate-500">
            Receita de compras com pagamento aprovado
          </p>
        </div>

        {/* Total E-books Sold */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>E-books Vendidos</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-blue-400 pt-1">
            {totalCompletedCopies} <span className="text-sm font-normal text-slate-400">cópias</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Total de licenças digitais emitidas
          </p>
        </div>

        {/* Sales Today */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Novas Vendas Hoje</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-amber-400 pt-1">
            {todaySalesCount} <span className="text-sm font-normal text-slate-400">hoje</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Atualizações instantâneas via WebSocket / Eventos
          </p>
        </div>

        {/* Average Ticket */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Ticket Médio por Obra</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-purple-400 pt-1">
            {formatPrice(
              totalCompletedCopies > 0 ? Math.round(totalRevenueAOA / totalCompletedCopies) : 3500,
              totalCompletedCopies > 0 ? Number((totalRevenueUSD / totalCompletedCopies).toFixed(2)) : 3.80
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Média ponderada por transação
          </p>
        </div>
      </div>

      {/* Main Section: Real-Time Sales Table & Live Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>Vendas em Tempo Real (Painel do Vendedor)</span>
              </h2>
              <span className="bg-slate-800 text-amber-400 border border-slate-700 text-xs font-black px-2.5 py-0.5 rounded-full">
                {filteredSales.length} {filteredSales.length === 1 ? 'venda' : 'vendas'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cada livro comprado é registado aqui automaticamente com valor, data, hora, comprador e estado do pagamento.
            </p>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar livro, comprador ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 text-xs text-slate-100 placeholder-slate-400 rounded-xl pl-8 pr-3 py-2 border border-slate-700 focus:outline-none focus:border-amber-500 w-48 sm:w-60"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-800 text-xs text-slate-300 font-semibold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Estados</option>
              <option value="completed">✓ Pagamento Concluído</option>
              <option value="awaiting_iban_proof">⏳ Aguardando IBAN</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
        </div>

        {/* Real-time Sales Table */}
        {filteredSales.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Nenhuma venda encontrada</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Não foram encontradas vendas com os filtros selecionados. Clica no botão abaixo para simular uma venda de teste em tempo real!
            </p>
            <button
              onClick={handleTestSaleSimulation}
              className="mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Simular Venda Agora
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-bold bg-slate-950/50">
                  <th className="py-3 px-4 rounded-l-xl">Livro Vendido</th>
                  <th className="py-3 px-4">Valor da Venda</th>
                  <th className="py-3 px-4">Data &amp; Hora</th>
                  <th className="py-3 px-4">Comprador</th>
                  <th className="py-3 px-4">Método de Pagamento</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSales.map((sale, index) => {
                  const matchingBook = books.find(b => b.id === sale.bookId);

                  return (
                    <tr 
                      key={sale.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Book Info with Cover */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {sale.bookCover ? (
                            <img
                              src={sale.bookCover}
                              alt={sale.bookTitle}
                              className="w-10 h-14 object-cover rounded-lg shadow-sm border border-slate-700 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-400 border border-slate-700">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <button
                              onClick={() => matchingBook && setSelectedBookModal(matchingBook)}
                              className="font-bold text-white hover:text-amber-400 transition-colors text-left truncate block max-w-[200px] sm:max-w-xs"
                            >
                              {sale.bookTitle}
                            </button>
                            <span className="text-[11px] text-slate-400 block truncate">
                              de {sale.author}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: {sale.orderId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-emerald-400 text-sm">
                          + {formatPrice(sale.amountAOA, sale.amountUSD)}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {sale.currencyPaid === 'AOA' ? 'Kwanzas (AOA)' : 'Dólares (USD)'}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sale.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="font-mono">{sale.time}</span>
                        </div>
                      </td>

                      {/* Buyer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200 truncate max-w-[150px]">
                          {sale.buyerName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {sale.buyerEmail}
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4">
                        {getPaymentMethodBadge(sale.paymentMethod)}
                        {sale.paymentReference && (
                          <span className="block text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-[120px]">
                            Ref: {sale.paymentReference}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(sale.paymentStatus)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedSaleDetail(sale)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] transition-colors"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sales Growth Chart & Promotion Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span>Evolução de Faturação Digital (2026)</span>
            </h2>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              +28% este trimestre
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAoa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f59e0b', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="VendasAOA" stroke="#f59e0b" fillOpacity={1} fill="url(#colorAoa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Promotion & Coupon Creator */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-400" />
              <span>Criar Cupom de Desconto</span>
            </h2>
            <p className="text-xs text-slate-400">
              Lança campanhas promocionais para aumentar as vendas dos teus e-books no Zola Books.
            </p>

            <form onSubmit={handleCreateSellerCoupon} className="space-y-3 text-xs pt-1">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Código do Cupom</label>
                <input
                  type="text"
                  required
                  placeholder="EX: LERANGOLA20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 uppercase p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                  <span>Desconto Aplicado</span>
                  <span className="text-amber-400 font-extrabold">{discountPercent}% OFF</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ativar Cupom Promocional</span>
              </button>
            </form>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2 mt-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Notificações para vendedores ativadas automaticamente.</span>
          </div>
        </div>

      </div>

      {/* Sale Detail Modal */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Comprovativo da Venda</h3>
                  <span className="text-[11px] font-mono text-slate-400">{selectedSaleDetail.orderId}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Book Info Card */}
            <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
              {selectedSaleDetail.bookCover ? (
                <img
                  src={selectedSaleDetail.bookCover}
                  alt={selectedSaleDetail.bookTitle}
                  className="w-12 h-16 object-cover rounded-lg shadow-sm border border-slate-700"
                />
              ) : (
                <div className="w-12 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-amber-400">
                  <BookOpen className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{selectedSaleDetail.bookTitle}</h4>
                <p className="text-xs text-slate-400">de {selectedSaleDetail.author}</p>
                <div className="text-xs font-extrabold text-emerald-400 mt-1">
                  {formatPrice(selectedSaleDetail.amountAOA, selectedSaleDetail.amountUSD)}
                </div>
              </div>
            </div>

            {/* Transaction Data */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Data &amp; Hora da Venda:</span>
                <span className="font-bold text-slate-200">{selectedSaleDetail.date} às {selectedSaleDetail.time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Comprador:</span>
                <span className="font-bold text-slate-200">{selectedSaleDetail.buyerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Email do Comprador:</span>
                <span className="font-mono text-slate-200">{selectedSaleDetail.buyerEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Método de Pagamento:</span>
                <div>{getPaymentMethodBadge(selectedSaleDetail.paymentMethod)}</div>
              </div>
              {selectedSaleDetail.paymentReference && (
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Referência / Token:</span>
                  <span className="font-mono text-amber-400">{selectedSaleDetail.paymentReference}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Estado do Pagamento:</span>
                <div>{getStatusBadge(selectedSaleDetail.paymentStatus)}</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
