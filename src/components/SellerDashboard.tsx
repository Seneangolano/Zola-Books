import React, { useState } from 'react';
import { 
  Store, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Tag, 
  Plus, 
  BarChart3,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';

export const SellerDashboard: React.FC = () => {
  const { currentUser, orders, formatPrice, books, addNotification } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);

  const chartData = [
    { month: 'Jan', VendasAOA: 120000, VendasUSD: 130 },
    { month: 'Fev', VendasAOA: 180000, VendasUSD: 195 },
    { month: 'Mar', VendasAOA: 240000, VendasUSD: 258 },
    { month: 'Abr', VendasAOA: 310000, VendasUSD: 330 },
    { month: 'Mai', VendasAOA: 420000, VendasUSD: 450 },
    { month: 'Jun', VendasAOA: 580000, VendasUSD: 620 },
  ];

  const handleCreateSellerCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    addNotification('Cupom Criado', `O cupom de vendedor "${couponCode.toUpperCase()}" (${discountPercent}% OFF) foi ativado.`);
    setCouponCode('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Store className="w-3.5 h-3.5 text-blue-400" />
            <span>Painel da Editora / Vendedor Parceiro</span>
          </div>
          <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
          <p className="text-xs text-slate-400">Gestão de Vendas Digitais, Promoções e Relatórios em Tempo Real</p>
        </div>

        {/* Metrics Grid */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 min-w-[120px]">
            <span className="text-slate-400 block text-[10px]">Vendas Totais</span>
            <span className="text-lg font-black text-emerald-400">{formatPrice(1850000, 1980)}</span>
          </div>
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 min-w-[120px]">
            <span className="text-slate-400 block text-[10px]">E-books Vendidos</span>
            <span className="text-lg font-black text-blue-400">412 Cópias</span>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <span>Crescimento de Receita (Kwanzas &amp; Dólares)</span>
        </h2>

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

      {/* Coupon Creator */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 max-w-xl">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-amber-400" />
          <span>Criar Novo Cupom de Desconto para Teus Leitores</span>
        </h2>

        <form onSubmit={handleCreateSellerCoupon} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Código do Cupom (ex: EDITORA15)</label>
            <input
              type="text"
              required
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 uppercase p-3 rounded-xl border border-slate-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Porcentagem de Desconto (%): {discountPercent}%</label>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Ativar Cupom Promocional</span>
          </button>
        </form>
      </div>

    </div>
  );
};
