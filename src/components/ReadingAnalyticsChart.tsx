import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  BarChart,
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Target, 
  Sparkles, 
  BarChart3, 
  CheckCircle2,
  Flame,
  PieChart as PieIcon,
  Activity,
  Award,
  Layers
} from 'lucide-react';

interface DailyReadingData {
  date: string;       // e.g. "09/Jul"
  fullDate: string;   // e.g. "9 de Julho"
  minutes: number;
  pages: number;
  sessions: number;
  bookTitle?: string;
}

interface GenreData {
  name: string;
  percentage: number;
  minutes: number;
  pages: number;
  color: string;
  icon: string;
}

interface MonthlyData {
  month: string;
  pagesRead: number;
  timeHours: number;
  booksCompleted: number;
}

export const ReadingAnalyticsChart: React.FC = () => {
  const [dailyMetric, setDailyMetric] = useState<'minutes' | 'pages' | 'sessions'>('minutes');
  const [monthlyView, setMonthlyView] = useState<'both' | 'pages' | 'time'>('both');

  // 1. Generate 30 days of daily reading frequency data (Jul 9 to Aug 7, 2026)
  const dailyReadingData: DailyReadingData[] = [
    { date: '09/Jul', fullDate: '9 de Julho', minutes: 25, pages: 18, sessions: 2, bookTitle: 'O Vendedor de Passados' },
    { date: '10/Jul', fullDate: '10 de Julho', minutes: 40, pages: 30, sessions: 3, bookTitle: 'O Vendedor de Passados' },
    { date: '11/Jul', fullDate: '11 de Julho', minutes: 15, pages: 10, sessions: 1, bookTitle: 'História Geral de Angola' },
    { date: '12/Jul', fullDate: '12 de Julho', minutes: 0, pages: 0, sessions: 0 },
    { date: '13/Jul', fullDate: '13 de Julho', minutes: 50, pages: 38, sessions: 2, bookTitle: 'História Geral de Angola' },
    { date: '14/Jul', fullDate: '14 de Julho', minutes: 35, pages: 26, sessions: 2, bookTitle: 'As Crónicas de Luanda 2088' },
    { date: '15/Jul', fullDate: '15 de Julho', minutes: 60, pages: 45, sessions: 3, bookTitle: 'As Crónicas de Luanda 2088' },
    { date: '16/Jul', fullDate: '16 de Julho', minutes: 20, pages: 15, sessions: 1, bookTitle: 'A Arte da Focagem' },
    { date: '17/Jul', fullDate: '17 de Julho', minutes: 45, pages: 32, sessions: 2, bookTitle: 'A Arte da Focagem' },
    { date: '18/Jul', fullDate: '18 de Julho', minutes: 30, pages: 22, sessions: 2, bookTitle: 'Mayombe' },
    { date: '19/Jul', fullDate: '19 de Julho', minutes: 10, pages: 8, sessions: 1, bookTitle: 'Mayombe' },
    { date: '20/Jul', fullDate: '20 de Julho', minutes: 55, pages: 40, sessions: 3, bookTitle: 'Kaluanda: Poemas e Canções' },
    { date: '21/Jul', fullDate: '21 de Julho', minutes: 40, pages: 28, sessions: 2, bookTitle: 'Kaluanda: Poemas e Canções' },
    { date: '22/Jul', fullDate: '22 de Julho', minutes: 25, pages: 18, sessions: 1, bookTitle: 'Sagradas Esperanças' },
    { date: '23/Jul', fullDate: '23 de Julho', minutes: 30, pages: 22, sessions: 2, bookTitle: 'Sagradas Esperanças' },
    { date: '24/Jul', fullDate: '24 de Julho', minutes: 65, pages: 52, sessions: 4, bookTitle: 'As Crónicas de Luanda 2088' },
    { date: '25/Jul', fullDate: '25 de Julho', minutes: 20, pages: 14, sessions: 1, bookTitle: 'O Vendedor de Passados' },
    { date: '26/Jul', fullDate: '26 de Julho', minutes: 0, pages: 0, sessions: 0 },
    { date: '27/Jul', fullDate: '27 de Julho', minutes: 45, pages: 35, sessions: 2, bookTitle: 'História Geral de Angola' },
    { date: '28/Jul', fullDate: '28 de Julho', minutes: 50, pages: 38, sessions: 3, bookTitle: 'A Arte da Focagem' },
    { date: '29/Jul', fullDate: '29 de Julho', minutes: 35, pages: 25, sessions: 2, bookTitle: 'A Arte da Focagem' },
    { date: '30/Jul', fullDate: '30 de Julho', minutes: 25, pages: 19, sessions: 1, bookTitle: 'Economia e Finanças em Luanda' },
    { date: '31/Jul', fullDate: '31 de Julho', minutes: 40, pages: 30, sessions: 2, bookTitle: 'Economia e Finanças em Luanda' },
    { date: '01/Ago', fullDate: '1 de Agosto', minutes: 55, pages: 42, sessions: 3, bookTitle: 'O Vendedor de Passados' },
    { date: '02/Ago', fullDate: '2 de Agosto', minutes: 30, pages: 22, sessions: 2, bookTitle: 'Mayombe' },
    { date: '03/Ago', fullDate: '3 de Agosto', minutes: 45, pages: 34, sessions: 2, bookTitle: 'Mayombe' },
    { date: '04/Ago', fullDate: '4 de Agosto', minutes: 60, pages: 48, sessions: 3, bookTitle: 'As Crónicas de Luanda 2088' },
    { date: '05/Ago', fullDate: '5 de Agosto', minutes: 35, pages: 26, sessions: 2, bookTitle: 'As Crónicas de Luanda 2088' },
    { date: '06/Ago', fullDate: '6 de Agosto', minutes: 50, pages: 39, sessions: 3, bookTitle: 'A Arte da Focagem' },
    { date: '07/Ago', fullDate: '7 de Agosto', minutes: 40, pages: 30, sessions: 2, bookTitle: 'A Arte da Focagem' }
  ];

  // 2. Genres Most Read in the Last 30 Days
  const genreReadingData: GenreData[] = [
    { name: 'Ficção & Literatura', percentage: 35, minutes: 364, pages: 275, color: '#f59e0b', icon: '📖' },
    { name: 'História de Angola', percentage: 25, minutes: 260, pages: 196, color: '#10b981', icon: '🇦🇴' },
    { name: 'Autoajuda & Mente', percentage: 18, minutes: 187, pages: 141, color: '#8b5cf6', icon: '💡' },
    { name: 'Afrofuturismo & Sci-Fi', percentage: 12, minutes: 125, pages: 94, color: '#ec4899', icon: '🚀' },
    { name: 'Tecnologia & Negócios', percentage: 10, minutes: 104, pages: 78, color: '#3b82f6', icon: '💻' }
  ];

  // 3. Monthly Historical Reading Data
  const monthlyReadingData: MonthlyData[] = [
    { month: 'Fev', pagesRead: 180, timeHours: 5.5, booksCompleted: 1 },
    { month: 'Mar', pagesRead: 290, timeHours: 8.2, booksCompleted: 2 },
    { month: 'Abr', pagesRead: 210, timeHours: 6.0, booksCompleted: 1 },
    { month: 'Mai', pagesRead: 380, timeHours: 11.4, booksCompleted: 3 },
    { month: 'Jun', pagesRead: 450, timeHours: 14.1, booksCompleted: 3 },
    { month: 'Jul', pagesRead: 320, timeHours: 9.8, booksCompleted: 2 },
    { month: 'Ago', pagesRead: 520, timeHours: 16.5, booksCompleted: 4 }
  ];

  // Calculations for 30 days totals
  const totalMinutes30Days = dailyReadingData.reduce((acc, curr) => acc + curr.minutes, 0);
  const totalPages30Days = dailyReadingData.reduce((acc, curr) => acc + curr.pages, 0);
  const activeDays30Days = dailyReadingData.filter(d => d.minutes > 0).length;
  const avgDailyMinutes = Math.round(totalMinutes30Days / 30);
  const totalHours30Days = (totalMinutes30Days / 60).toFixed(1);

  // Custom Tooltip for Daily Reading Chart
  const DailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DailyReadingData = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700/90 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
          <p className="font-extrabold text-amber-400 text-sm border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{data.fullDate}</span>
            <span className="text-[10px] text-slate-400 font-normal">Últimos 30 dias</span>
          </p>
          <div className="space-y-1 text-slate-200">
            <div className="flex justify-between font-bold">
              <span className="text-amber-300">Tempo de Leitura:</span>
              <span className="text-white font-mono">{data.minutes} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Páginas Lidas:</span>
              <span className="text-white font-mono">{data.pages} págs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sessões do Dia:</span>
              <span className="text-emerald-400 font-mono">{data.sessions} sessões</span>
            </div>
            {data.bookTitle && (
              <p className="text-[10px] text-amber-400/90 italic pt-1 border-t border-slate-800/80 line-clamp-1">
                📖 "{data.bookTitle}"
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Genre Pie Chart
  const GenreTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: GenreData = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-2xl shadow-2xl backdrop-blur-md text-xs space-y-1 min-w-[170px]">
          <p className="font-extrabold text-white text-xs flex items-center gap-1.5 border-b border-slate-800 pb-1">
            <span>{data.icon}</span>
            <span>{data.name}</span>
          </p>
          <div className="space-y-0.5 text-[11px]">
            <p className="text-amber-400 font-black text-sm">{data.percentage}% do total</p>
            <p className="text-slate-300">{data.minutes} minutos lidos ({data.pages} págs)</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* 30-Day Top Stats Summary Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 p-4 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Tempo Ú. 30 Dias
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{totalHours30Days}h</span>
            <span className="text-[10px] text-emerald-400 font-bold">{totalMinutes30Days} min</span>
          </div>
          <p className="text-[10px] text-slate-400">Total acumulado em leitura ativa</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 p-4 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Média Diária
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{avgDailyMinutes} min</span>
            <span className="text-[10px] text-emerald-300 font-bold">Meta: 20m</span>
          </div>
          <p className="text-[10px] text-slate-400">Ritmo de leitura por dia</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 border border-purple-500/30 p-4 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-400" /> Dias Ativos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-400">{activeDays30Days}/30</span>
            <span className="text-[10px] text-emerald-400 font-bold">{Math.round((activeDays30Days/30)*100)}%</span>
          </div>
          <p className="text-[10px] text-slate-400">Consistência diária de leitura</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border border-rose-500/30 p-4 rounded-3xl space-y-1 shadow-xl">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Gênero Favorito
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-rose-400 truncate">Ficção</span>
            <span className="text-[10px] text-amber-400 font-bold">35%</span>
          </div>
          <p className="text-[10px] text-slate-400">364 min em obras literárias</p>
        </div>
      </div>

      {/* SECTION 1: Daily Reading Frequency Chart (Last 30 Days) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Frequência de Leitura Diária (Últimos 30 Dias)</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  30 Dias
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhe os minutos dedicados, páginas lidas e hábitos diários ao longo do último mês
              </p>
            </div>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setDailyMetric('minutes')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dailyMetric === 'minutes' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Minutos
            </button>
            <button
              onClick={() => setDailyMetric('pages')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dailyMetric === 'pages' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Páginas
            </button>
            <button
              onClick={() => setDailyMetric('sessions')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dailyMetric === 'sessions' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sessões
            </button>
          </div>
        </div>

        {/* Recharts Area Chart for Daily Frequency */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyReadingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorPagesArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorSessionsArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6d28d9" stopOpacity={0.05}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false}
                interval={2} 
              />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              
              <Tooltip content={<DailyTooltip />} />

              {dailyMetric === 'minutes' && (
                <Area 
                  type="monotone" 
                  dataKey="minutes" 
                  name="Minutos Lidos" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMinutes)" 
                  activeDot={{ r: 7, fill: '#fbbf24', stroke: '#020617', strokeWidth: 2 }}
                />
              )}

              {dailyMetric === 'pages' && (
                <Area 
                  type="monotone" 
                  dataKey="pages" 
                  name="Páginas Lidas" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPagesArea)" 
                  activeDot={{ r: 7, fill: '#34d399', stroke: '#020617', strokeWidth: 2 }}
                />
              )}

              {dailyMetric === 'sessions' && (
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  name="Sessões de Leitura" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSessionsArea)" 
                  activeDot={{ r: 7, fill: '#a78bfa', stroke: '#020617', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Motivational Tip Footer */}
        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Análise Zola:</strong> Lêsteste em <strong>26 dos últimos 30 dias</strong>! Uma sequência excelente de hábito diário.</span>
          </div>
          <span className="font-mono text-[10px] text-amber-400 font-bold hidden sm:inline">86% Consistência 🔥</span>
        </div>
      </div>

      {/* SECTION 2: Most Read Genres in the Last 30 Days (PieChart + Bar Breakdown) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <span>Gêneros e Temas Mais Lidos (Últimos 30 Dias)</span>
              <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                Distribuição %
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Proporção do tempo e volume de leitura por categorias literárias e áreas temáticas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Recharts Pie Chart Donut (Left 5 cols) */}
          <div className="lg:col-span-5 h-64 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreReadingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="percentage"
                  nameKey="name"
                >
                  {genreReadingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<GenreTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-2xl font-black text-white">100%</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">30 Dias</span>
            </div>
          </div>

          {/* Detailed Genre Breakdown List (Right 7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
              Detalhamento de Minutos por Gênero Literário:
            </span>

            {genreReadingData.map((genre) => (
              <div 
                key={genre.name}
                className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="text-base">{genre.icon}</span>
                    <span>{genre.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px] font-mono">{genre.minutes} min ({genre.pages} págs)</span>
                    <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${genre.color}20`, color: genre.color }}>
                      {genre.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar matching genre color */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${genre.percentage}%`, backgroundColor: genre.color }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* SECTION 3: Monthly Historical Reading Progress (Composed Bar + Line Chart) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Evolução de Leitura Mensal Histórica</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Histórico 2026
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Páginas lidas e horas acumuladas mês a mês no E-Reader Zola Books
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setMonthlyView('both')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                monthlyView === 'both' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Combinado
            </button>
            <button
              onClick={() => setMonthlyView('pages')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                monthlyView === 'pages' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Páginas
            </button>
            <button
              onClick={() => setMonthlyView('time')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                monthlyView === 'time' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tempo (Horas)
            </button>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyReadingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPagesBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.4}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} tickLine={false} axisLine={false} />
              
              <Tooltip 
                content={({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-950/95 border border-slate-700/80 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[170px]">
                        <p className="font-extrabold text-amber-400 text-sm border-b border-slate-800 pb-1 flex items-center justify-between">
                          <span>Mês de {label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">2026</span>
                        </p>
                        {payload.map((entry: any, index: number) => (
                          <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px] font-semibold">
                            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              {entry.name}:
                            </span>
                            <span className="font-extrabold text-white">
                              {entry.name.includes('Tempo') ? `${entry.value} Horas` : `${entry.value} Págs`}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 600 }} 
                iconType="circle"
              />

              {(monthlyView === 'both' || monthlyView === 'pages') && (
                <Bar 
                  yAxisId="left" 
                  dataKey="pagesRead" 
                  name="Páginas Lidas" 
                  fill="url(#colorPagesBar)" 
                  radius={[8, 8, 0, 0]} 
                  barSize={28}
                />
              )}

              {(monthlyView === 'both' || monthlyView === 'time') && (
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="timeHours" 
                  name="Tempo Dedicado (Horas)" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#022c22' }}
                  activeDot={{ r: 8, fill: '#34d399' }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

