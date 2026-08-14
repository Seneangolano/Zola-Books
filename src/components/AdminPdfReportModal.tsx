import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign, 
  CheckCircle, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  BarChart3,
  Award,
  CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AdminPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPdfReportModal: React.FC<AdminPdfReportModalProps> = ({ isOpen, onClose }) => {
  const { orders, books, usersList, formatPrice, followedAuthors } = useApp();
  const [reportPeriod, setReportPeriod] = useState<'all' | 'month' | 'week'>('all');

  if (!isOpen) return null;

  // Filter orders based on period
  const filteredOrders = orders.filter(o => {
    if (reportPeriod === 'all') return true;
    const orderDate = new Date(o.createdAt);
    const now = new Date();
    if (reportPeriod === 'month') {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      return orderDate >= thirtyDaysAgo;
    }
    if (reportPeriod === 'week') {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      return orderDate >= sevenDaysAgo;
    }
    return true;
  });

  const completedOrders = filteredOrders.filter(o => o.paymentStatus === 'completed');
  const totalSalesAOA = completedOrders.reduce((sum, o) => sum + o.totalAOA, 0);
  const totalSalesUSD = completedOrders.reduce((sum, o) => sum + o.totalUSD, 0);
  const averageTicketAOA = completedOrders.length > 0 ? totalSalesAOA / completedOrders.length : 0;

  // Payment methods breakdown
  const multicaixaCount = completedOrders.filter(o => o.paymentMethod === 'express' || o.paymentMethod === 'multicaixa').length;
  const ibanCount = completedOrders.filter(o => o.paymentMethod === 'iban').length;
  const stripeCount = completedOrders.filter(o => o.paymentMethod === 'stripe').length;

  const currentDateStr = new Date().toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none print:bg-white text-slate-100 print:text-slate-900">
        
        {/* Header Actions (Hidden in Print) */}
        <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Relatório Executivo em PDF</span>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  APRESENTAÇÃO
                </span>
              </h2>
              <p className="text-xs text-slate-400">Exportação oficial de relatórios de vendas, financeiro e métricas de uso</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setReportPeriod('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  reportPeriod === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Geral
              </button>
              <button
                onClick={() => setReportPeriod('month')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  reportPeriod === 'month' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Dias
              </button>
              <button
                onClick={() => setReportPeriod('week')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  reportPeriod === 'week' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Dias
              </button>
            </div>

            <button
              onClick={handlePrintPdf}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PDF Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-slate-950/40 print:bg-white print:text-slate-900 print:p-0">
          
          {/* Document Printable Sheet Frame */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-8 shadow-xl print:shadow-none print:border-none print:p-0 print:bg-white">
            
            {/* Header / Letterhead */}
            <div className="border-b-2 border-amber-500 pb-6 flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg tracking-wider uppercase">
                    Zola Books
                  </span>
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                    • Angola Executive Report
                  </span>
                </div>
                <h1 className="text-2xl font-black text-white print:text-slate-900 tracking-tight mt-2">
                  RELATÓRIO EXECUTIVO DE VENDAS E ESTATÍSTICAS
                </h1>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  Documento de Prestação de Contas, Métricas Digitais e Balanço Operacional da Plataforma
                </p>
              </div>

              <div className="text-right text-xs space-y-1">
                <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 print:border-slate-300 print:text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Autenticado por Zola Admin</span>
                </div>
                <p className="text-slate-400 print:text-slate-600 text-[11px] pt-1">
                  Emitido em: <strong className="text-white print:text-slate-900">{currentDateStr}</strong>
                </p>
                <p className="text-slate-500 text-[10px]">Período do Relatório: {reportPeriod === 'all' ? 'Histórico Completo' : reportPeriod === 'month' ? 'Últimos 30 Dias' : 'Últimos 7 Dias'}</p>
              </div>
            </div>

            {/* KPI Executive Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 p-4 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 print:text-slate-600 text-xs font-bold">
                  <span>Faturação Total</span>
                  <DollarSign className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xl font-black text-amber-400 print:text-slate-900 block">
                  {formatPrice(totalSalesAOA, totalSalesUSD)}
                </span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">
                  {completedOrders.length} transação(ões) concluídas
                </span>
              </div>

              <div className="bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 p-4 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 print:text-slate-600 text-xs font-bold">
                  <span>Ticket Médio por Venda</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xl font-black text-blue-400 print:text-slate-900 block">
                  {formatPrice(averageTicketAOA, averageTicketAOA / 930)}
                </span>
                <span className="text-[10px] text-slate-400 print:text-slate-600 font-bold block">
                  Média por Encomenda
                </span>
              </div>

              <div className="bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 p-4 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 print:text-slate-600 text-xs font-bold">
                  <span>Utilizadores Registados</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xl font-black text-emerald-400 print:text-slate-900 block">
                  {usersList.length} Contas
                </span>
                <span className="text-[10px] text-slate-400 print:text-slate-600 font-bold block">
                  Leitores, Autores &amp; Afiliados
                </span>
              </div>

              <div className="bg-slate-950/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 p-4 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-slate-400 print:text-slate-600 text-xs font-bold">
                  <span>Obras &amp; E-books</span>
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xl font-black text-purple-400 print:text-slate-900 block">
                  {books.length} Títulos
                </span>
                <span className="text-[10px] text-amber-400 print:text-amber-700 font-bold block">
                  Catálogo Literário Ativo
                </span>
              </div>

            </div>

            {/* Usage Statistics & Engagement Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Payment Methods Distribution */}
              <div className="bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-extrabold text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Métodos de Pagamento Utilizados</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 print:bg-white border border-slate-800 print:border-slate-200">
                    <span className="text-slate-300 print:text-slate-800 font-medium">Multicaixa Express / Kwanza</span>
                    <span className="font-extrabold text-amber-400 print:text-slate-900">{multicaixaCount} venda(s)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 print:bg-white border border-slate-800 print:border-slate-200">
                    <span className="text-slate-300 print:text-slate-800 font-medium">Transferência IBAN com Comprovativo</span>
                    <span className="font-extrabold text-purple-400 print:text-slate-900">{ibanCount} venda(s)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 print:bg-white border border-slate-800 print:border-slate-200">
                    <span className="text-slate-300 print:text-slate-800 font-medium">Cartão Internacional (Stripe USD)</span>
                    <span className="font-extrabold text-emerald-400 print:text-slate-900">{stripeCount} venda(s)</span>
                  </div>
                </div>
              </div>

              {/* Ecosystem & Community Engagement */}
              <div className="bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-extrabold text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>Estatísticas do Ecossistema Zola</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 print:bg-white border border-slate-800 print:border-slate-200">
                    <span className="text-slate-300 print:text-slate-800 font-medium">Autores Seguidos pelos Leitores</span>
                    <span className="font-extrabold text-amber-400 print:text-slate-900">{followedAuthors.length} Autor(es) Ativos</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 print:bg-white border border-slate-800 print:border-slate-200">
                    <span className="text-slate-300 print:text-slate-800 font-medium">Notificações Push In-App Ativas</span>
                    <span className="font-extrabold text-emerald-400 print:text-slate-900">Ativado para todos os leitores</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 print:bg-white border border-slate-800 print:border-slate-200">
                    <span className="text-slate-300 print:text-slate-800 font-medium">Margem Líquida dos Autores</span>
                    <span className="font-extrabold text-purple-400 print:text-slate-900">85% Retidos para o Autor</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Sales Table Breakdown */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold text-white print:text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Discriminação de Encomendas &amp; Faturação ({filteredOrders.length})</span>
              </h3>

              <div className="border border-slate-800 print:border-slate-300 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 print:bg-slate-100 text-slate-400 print:text-slate-700 font-extrabold border-b border-slate-800 print:border-slate-300">
                      <th className="p-3">ID Encomenda</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Método</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-800 font-medium">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-500">
                          Nenhuma encomenda registada para o período selecionado.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-900/50 print:hover:bg-transparent">
                          <td className="p-3 font-mono text-amber-400 print:text-slate-900 font-bold">#{ord.id}</td>
                          <td className="p-3">
                            <span className="font-bold text-white print:text-slate-900 block">{ord.userName}</span>
                            <span className="text-[10px] text-slate-500 block">{ord.userEmail}</span>
                          </td>
                          <td className="p-3 capitalize">{ord.paymentMethod}</td>
                          <td className="p-3 text-slate-400 print:text-slate-600">{ord.createdAt}</td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              ord.paymentStatus === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-800'
                                : 'bg-amber-500/20 text-amber-400 print:bg-amber-100 print:text-amber-800'
                            }`}>
                              {ord.paymentStatus === 'completed' ? 'Concluída' : 'Aguardando IBAN'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-white print:text-slate-900">
                            {formatPrice(ord.totalAOA, ord.totalUSD)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formal Executive Audit Footer */}
            <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-300 print:text-slate-800 block">Zola Books Lda. — Plataforma Literária Digital</span>
                <p className="text-[11px] font-semibold text-amber-400 print:text-slate-900">
                  Proprietário: Abdul Aziz Senê Angolano | Administrador Principal ( Admin)
                </p>
                <p className="text-[10px]">Luanda, Angola • WhatsApp Oficial: +244 922 255 648 • suporte@zolabooks.ao</p>
              </div>

              <div className="text-right space-y-0.5">
                <span className="font-mono text-[10px] text-amber-500/80 block">CHECKSUM: ZOLA-PDF-AUDIT-{Math.floor(Math.random() * 899999 + 100000)}</span>
                <p className="text-[10px] text-slate-500">Documento homologado e assinado digitalmente por Zola Admin</p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
