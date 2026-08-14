import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Smartphone, 
  CreditCard, 
  BookOpen, 
  Sparkles, 
  LayoutDashboard, 
  Database, 
  Lock, 
  Globe2, 
  Headphones, 
  Share2, 
  ChevronRight, 
  Building2, 
  Rocket,
  Check,
  Award,
  Users,
  Search,
  BarChart3,
  Bot,
  MessageSquare,
  Upload,
  Calendar
} from 'lucide-react';

interface RoadmapStage {
  id: number;
  phaseName: string;
  title: string;
  estimatedDuration: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  badgeText: string;
  status: 'concluido' | 'em_progresso' | 'planeado';
  progressPercentage: number;
  description: string;
  deliverables: { title: string; done: boolean; detail: string }[];
  technicalDetails: string[];
}

interface RoadmapModalProps {
  onClose: () => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ onClose }) => {
  const [selectedStageId, setSelectedStageId] = useState<number>(1);

  const stages: RoadmapStage[] = [
    {
      id: 1,
      phaseName: 'Primeira Fase',
      title: 'Fundação da Plataforma',
      estimatedDuration: '2 Semanas',
      subtitle: 'Página Inicial, Cadastro, Login, Perfis de Utilizadores & Painel Básico Admin',
      icon: Database,
      color: 'from-amber-500 to-amber-700',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      badgeText: 'Concluído 100%',
      status: 'concluido',
      progressPercentage: 100,
      description: 'Estruturação inicial da plataforma Zola Books: Landing page responsiva, autenticação segura por email e Google via Firebase Auth, perfis de leitores e infraestrutura full-stack Express + React.',
      deliverables: [
        { title: 'Página Inicial & Identidade Visual', done: true, detail: 'Layout moderno com foco na literatura angolana e lusófona.' },
        { title: 'Sistema de Cadastro & Autenticação', done: true, detail: 'Login por email/palavra-passe e Google com recuperação de conta.' },
        { title: 'Gestão de Perfis de Utilizador', done: true, detail: 'Edição de avatar, biografia, preferências de leitura e moeda (AOA/USD).' },
        { title: 'Painel Básico de Administração', done: true, detail: 'Visão inicial de contas criadas e métricas do sistema.' }
      ],
      technicalDetails: [
        'Arquitetura Node.js + Express + Vite em porta 3000.',
        'Firebase Firestore & Authentication com persistência em tempo real.',
        'Sincronização com estado global local (React Context API).'
      ]
    },
    {
      id: 2,
      phaseName: 'Segunda Fase',
      title: 'Catálogo de Livros & Pesquisa',
      estimatedDuration: '3 Semanas',
      subtitle: 'Catálogo Literário, Busca Avançada, Filtros por Categoria & Detalhes da Obra',
      icon: Search,
      color: 'from-blue-500 to-indigo-700',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      badgeText: 'Concluído 100%',
      status: 'concluido',
      progressPercentage: 100,
      description: 'Construção do catálogo digital abrangente: sistema de pesquisa em tempo real, navegação por gêneros (Ficção, História de Angola, Poesia, Negócios), ordenação e páginas detalhadas de livros.',
      deliverables: [
        { title: 'Catálogo com Filtros & Categorias', done: true, detail: 'Navegação por temas, preços, obras populares e mais recentes.' },
        { title: 'Motor de Pesquisa Instantâneo', done: true, detail: 'Busca por título, autor angolano, editora ou palavras-chave.' },
        { title: 'Página de Detalhes Completa do Livro', done: true, detail: 'Sinopse, amostra de leitura grátis, ISBN, formato e dados do autor.' },
        { title: 'Tags e Coleções Especiais', done: true, detail: 'Destaques para Literatura Angolana, Clássicos da Lusofonia e Lançamentos.' }
      ],
      technicalDetails: [
        'Pesquisa otimizada no lado do cliente com debounce.',
        'URLs amigáveis e SEO dinâmico via react-helmet-async.',
        'Design totalmente adaptável para ecrãs móveis e desktop.'
      ]
    },
    {
      id: 3,
      phaseName: 'Terceira Fase',
      title: 'Carrinho, Pagamentos & Biblioteca',
      estimatedDuration: '3 Semanas',
      subtitle: 'Carrinho Multi-Item, Multicaixa Express, Referência MCX, IBAN & Biblioteca Pessoal',
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-700',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      badgeText: 'Concluído 100%',
      status: 'concluido',
      progressPercentage: 100,
      description: 'Implementação do ecossistema de e-commerce e biblioteca do leitor. Pagamentos em Kwanzas via Multicaixa Express, Referência EMIS (ATM/App), Transferência IBAN BAI e cartões de crédito via Stripe.',
      deliverables: [
        { title: 'Carrinho de Compras & Cupões', done: true, detail: 'Gestão de múltiplos itens, desconto promocional e cálculo de total.' },
        { title: 'Gateway Multicaixa Express & Referência EMIS', done: true, detail: 'Pagamento por número de telefone ou geração de Entidade/Referência assíncrona.' },
        { title: 'Checkout Internacional Stripe & IBAN', done: true, detail: 'Pagamentos em USD (Visa/Mastercard) e upload de comprovativo bancário.' },
        { title: 'Biblioteca Pessoal Digital', done: true, detail: 'Acesso vitalício às obras adquiridas com progresso de leitura sincronizado.' }
      ],
      technicalDetails: [
        'Endpoints de API no backend Express (/api/payments/multicaixa, /api/checkout/multicaixa-reference).',
        'Conversão dinâmica de moeda Kwanzas (AOA) para Dólares (USD).',
        'Emissão e descarregamento automático de recibos de compra.'
      ]
    },
    {
      id: 4,
      phaseName: 'Quarta Fase',
      title: 'Leitor Digital E-Reader Avançado',
      estimatedDuration: '4 Semanas',
      subtitle: 'Navegação por Capítulos, Marcadores, Destaques, Anotações & Temas',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-700',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      badgeText: 'Concluído 100%',
      status: 'concluido',
      progressPercentage: 100,
      description: 'Desenvolvimento do leitor digital E-Reader imersivo na web: navegação por capítulos, suporte a marcadores de página, destaques coloridos, anotações pessoais e personalização visual da tipografia.',
      deliverables: [
        { title: 'Navegação Fluída por Capítulos', done: true, detail: 'Índice interativo, barra de progresso e viragem rápida de páginas.' },
        { title: 'Ajuste Tipográfico & Temas de Leitura', done: true, detail: 'Aumento de fonte, espaçamento de linhas, modo Dia, Noite e Sépia.' },
        { title: 'Marcadores, Destaques & Anotações', done: true, detail: 'Sublinhar trechos marcantes, adicionar notas pessoais e guardar trechos.' },
        { title: 'Modo E-Reader em Tela Cheia', done: true, detail: 'Interface minimalista focada no conforto visual e eliminação de distrações.' }
      ],
      technicalDetails: [
        'Efeito de papel sépia e controle refinado de margens CSS.',
        'Salvamento automático da última página lida e marcadores no perfil do leitor.',
        'Acessibilidade avançada com suporte a leitor de ecrã e alto contraste.'
      ]
    },
    {
      id: 5,
      phaseName: 'Quinta Fase',
      title: 'Estatísticas de Leitura & Progresso',
      estimatedDuration: '2 Semanas',
      subtitle: 'Gráficos de Frequência (30 dias), Minutos Lidos, Páginas, Velocidade Média & Histórico',
      icon: BarChart3,
      color: 'from-amber-600 to-rose-700',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      badgeText: 'Concluído 100%',
      status: 'concluido',
      progressPercentage: 100,
      description: 'Painel analítico para motivar o hábito de leitura: gráficos interativos (Recharts) com frequência dos últimos 30 dias, total de minutos e páginas lidas, velocidade média e conquistas literárias.',
      deliverables: [
        { title: 'Gráficos da Frequência de Leitura (30 Dias)', done: true, detail: 'Visualização interativa de minutos dedicados à leitura por dia.' },
        { title: 'Métricas Totais & Páginas Concluídas', done: true, detail: 'Contadores de livros lidos, páginas terminadas e velocidade média.' },
        { title: 'Distribuição de Gêneros Favoritos', done: true, detail: 'Gráfico em rosca mapeando as categorias mais consumidas pelo leitor.' },
        { title: 'Distintivos & Metas Pessoais', done: true, detail: 'Conquistas literárias desbloqueáveis para manter a constância diária.' }
      ],
      technicalDetails: [
        'Visualizações de dados reativas usando a biblioteca Recharts.',
        'Cálculo de média de palavras por minuto (PPM) durante as sessões de leitura.',
        'Histórico detalhado armazenado no perfil do utilizador.'
      ]
    },
    {
      id: 6,
      phaseName: 'Sexta Fase',
      title: 'Inteligência Artificial Zola IA',
      estimatedDuration: '3 Semanas',
      subtitle: 'Recomendações Personalizadas, Resumos, Dicionário Pop-up & Livros Semelhantes',
      icon: Bot,
      color: 'from-cyan-500 to-blue-700',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      badgeText: 'Concluído 100%',
      status: 'concluido',
      progressPercentage: 100,
      description: 'Integração com a inteligência artificial Gemini da Google para enriquecer a experiência literária: assistente de recomendações Zola IA, dicionário e tradutor integrado no e-reader e resumos de obras.',
      deliverables: [
        { title: 'Assistente Inteligente de Recomendações', done: true, detail: 'Sugestões personalizadas com base no histórico e preferências do leitor.' },
        { title: 'Dicionário & Tradutor Pop-up Integrado', done: true, detail: 'Seleção de qualquer palavra ou parágrafo no e-reader para explicação instantânea.' },
        { title: 'Resumos Executivos & Análise de Obras', done: true, detail: 'Síntese dos capítulos e destaques dos principais ensinamentos dos livros.' },
        { title: 'Descoberta de Autores Angolanos Semelhantes', done: true, detail: 'Conexão entre autores contemporâneos e clássicos da lusofonia.' }
      ],
      technicalDetails: [
        'SDK @google/genai integrado com chamadas server-side protegidas no server.ts.',
        'Modelos Gemini 3.6 Flash com resposta em tempo real e cache de pesquisas.',
        'Modal de tradução e consulta de termos com um clique.'
      ]
    },
    {
      id: 7,
      phaseName: 'Sétima Fase',
      title: 'Comunidade, Avaliações & Wishlist',
      estimatedDuration: '3 Semanas',
      subtitle: 'Clubes de Leitura, Classificações (Reviews), Comentários & Lista de Desejos com Alertas',
      icon: MessageSquare,
      color: 'from-rose-500 to-red-700',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      badgeText: 'Concluído 100%',
      status: 'concluido',
      progressPercentage: 100,
      description: 'Recursos sociais e de engajamento comunitário: criação de clubes de leitura, sistema de avaliações com estrelas e comentários, e Lista de Desejos (Wishlist) com notificações automáticas de desconto.',
      deliverables: [
        { title: 'Clubes de Leitura & Debates', done: true, detail: 'Criação e adesão a grupos temáticos para discussão de obras.' },
        { title: 'Sistema de Avaliações & Reviews', done: true, detail: 'Classificação de 1 a 5 estrelas e comentários detalhados dos leitores.' },
        { title: 'Lista de Desejos (Wishlist) com Alertas', done: true, detail: 'Guardar livros para compra futura com aviso de redução de preço.' },
        { title: 'Notificações no App & Gerador de Cartões', done: true, detail: 'Notificações in-app e partilha de citações personalizadas nas redes sociais.' }
      ],
      technicalDetails: [
        'Geração dinâmica de cartões em canvas para partilha social.',
        'Notificações push in-app gravadas no Firebase Firestore.',
        'Moderação comunitária de comentários e avaliações.'
      ]
    },
    {
      id: 8,
      phaseName: 'Oitava Fase',
      title: 'Painel para Autores & Editoras',
      estimatedDuration: '3 Semanas',
      subtitle: 'Carregamento de Livros (PDF/EPUB/MOBI), Relatórios de Royalties (85%) & Gestão de Vendas',
      icon: Upload,
      color: 'from-teal-500 to-emerald-700',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      badgeText: 'Concluído 100%',
      status: 'concluido',
      progressPercentage: 100,
      description: 'Área exclusiva para escritores angolanos e editoras parceiras publicarem suas obras digitalmente, acompanharem downloads em tempo real, gerirem preços e receberem até 85% de royalties.',
      deliverables: [
        { title: 'Upload de Arquivos PDF, EPUB & MOBI', done: true, detail: 'Processamento seguro e extração de capítulos para o e-reader web.' },
        { title: 'Acompanhamento de Royalties (85%) & Receitas', done: true, detail: 'Gráfico transparente de vendas diárias e comissões acumuladas em Kwanzas.' },
        { title: 'Gestão de Ficha Técnica & Capas', done: true, detail: 'Edição de detalhes da obra, categorização e definição de promoções.' },
        { title: 'Solicitação de Saque Bancário IBAN', done: true, detail: 'Transferência direta dos ganhos para a conta bancária do autor.' }
      ],
      technicalDetails: [
        'Upload de ficheiros com validação de formato e encriptação.',
        'Painel do Autor com acesso restrito via Role-Based Access Control (RBAC).',
        'Relatórios de vendas exportáveis em formato CSV.'
      ]
    },
    {
      id: 9,
      phaseName: 'Nona Fase',
      title: 'Administração Completa & Relatórios',
      estimatedDuration: '3 Semanas',
      subtitle: 'Gestão Global de Utilizadores, Aprovação de Livros, Cupões & Relatórios Financeiros',
      icon: LayoutDashboard,
      color: 'from-amber-600 to-orange-700',
      badgeBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      badgeText: 'Concluído 100%',
      status: 'concluido',
      progressPercentage: 100,
      description: 'Backoffice gestor para moderação da plataforma Zola Books: validação de comprovativos bancários IBAN, moderação de comentários, gestão do catálogo, criação de códigos promocionais e métricas operacionais.',
      deliverables: [
        { title: 'Gestão Completa de Utilizadores & Permissões', done: true, detail: 'Controle de papéis (Leitor, Autor, Editora, Administrador).' },
        { title: 'Validação de Pedidos & Comprovativos IBAN', done: true, detail: 'Aprovação com 1 clique para liberação instantânea de livros aos leitores.' },
        { title: 'Criador de Cupões & Motores de Promoção', done: true, detail: 'Criação de códigos de desconto por percentagem ou valor fixo em AOA.' },
        { title: 'Relatórios Financeiros Auditáveis', done: true, detail: 'Balanço consolidado de vendas em Kwanzas, taxas e royalties pagos.' }
      ],
      technicalDetails: [
        'Visualização de gráficos operacionais com Recharts.',
        'Backup e exportação completa do banco de dados em formato JSON.',
        'Auditoria de ações administrativas com registo de logs.'
      ]
    },
    {
      id: 10,
      phaseName: 'Décima Fase',
      title: 'Expansão, Apps & Audiolivros',
      estimatedDuration: '4 Semanas',
      subtitle: 'Aplicativo Instalável (PWA/Android/iOS), Audiolivros com Sintetizador (TTS) & Leitura Offline',
      icon: Rocket,
      color: 'from-purple-600 to-indigo-800',
      badgeBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
      badgeText: 'Em Expansão Contínua 🚀',
      status: 'em_progresso',
      progressPercentage: 92,
      description: 'Aceleração e expansão tecnológica da Zola Books: suporte a instalação como PWA nativo no Android e iPhone, leitor de áudio/sintetizador de voz (TTS) para audiolivros em Português e sincronização offline.',
      deliverables: [
        { title: 'Suporte PWA Instalável (Android & iPhone)', done: true, detail: 'Adicionar à tela principal como aplicativo nativo sem barras de navegador.' },
        { title: 'Sintetizador de Voz para Audiolivros (TTS)', done: true, detail: 'Narração de capítulos com ajuste de velocidade e pausa inteligente.' },
        { title: 'Leitura Offline Completa', done: true, detail: 'Download seguro do e-book para leitura em áreas sem cobertura de internet.' },
        { title: 'Internacionalização & Expansão Lusófona', done: true, detail: 'Abertura para leitores de Portugal, Moçambique, Brasil e Cabo Verde.' }
      ],
      technicalDetails: [
        'Integração com Web Speech API com voz em Português (pt-AO e pt-PT).',
        'Service Worker registrado (/sw.js) habilitando cache inteligente offline-first.',
        'Arquitetura PWA pronta para empacotamento em APK Android e iOS.'
      ]
    }
  ];

  const activeStage = stages.find((s) => s.id === selectedStageId) || stages[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-5xl rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl my-auto relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Cronograma & Plano Mestre em 10 Fases</span>
                <span className="bg-amber-500/20 text-amber-300 text-xs font-mono px-3 py-0.5 rounded-full border border-amber-500/30 hidden sm:inline">
                  Plataforma Zola Books
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Roteiro estratégico de desenvolvimento com estimativa de tempo e entregáveis para Angola e Lusofonia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-2xl hover:bg-slate-800 transition-all shrink-0"
            title="Fechar Cronograma"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Global Progress & Timeline Summary Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 p-4 sm:p-5 rounded-3xl space-y-3 relative z-10 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs uppercase font-black text-amber-400 tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" /> Estimativa Total do Cronograma: <strong className="text-white">30 Semanas (~7 Meses)</strong>
              </span>
              <p className="text-sm font-extrabold text-white">
                9 de 10 Fases Totalmente Concluídas (99% Conclusão Geral)
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs font-mono font-bold text-emerald-400 self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Plataforma Funcional & Operacional</span>
            </div>
          </div>

          {/* Combined Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 via-emerald-500 to-purple-500 h-full rounded-full transition-all duration-700"
              style={{ width: '99%' }}
            />
          </div>
        </div>

        {/* 10-Phase Horizontal/Grid Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 relative z-10">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isSelected = stage.id === selectedStageId;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1.5 relative overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xl scale-[1.02] font-black'
                    : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-extrabold uppercase ${isSelected ? 'text-slate-950' : 'text-slate-400'}`}>
                    Fase {stage.id}
                  </span>
                  {stage.status === 'concluido' ? (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                  ) : (
                    <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                  )}
                </div>

                <div className="flex items-center gap-1.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span className="text-xs font-extrabold truncate">
                    {stage.title}
                  </span>
                </div>

                <span className={`text-[9px] font-mono ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {stage.estimatedDuration}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 relative z-10 animate-in fade-in">
          
          {/* Header of Active Stage */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activeStage.color} text-white flex items-center justify-center font-black shadow-lg shrink-0`}>
                <activeStage.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-extrabold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                    {activeStage.phaseName}
                  </span>
                  <h3 className="text-lg font-black text-white">{activeStage.title}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${activeStage.badgeBg}`}>
                    {activeStage.badgeText}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{activeStage.subtitle}</p>
              </div>
            </div>

            {/* Stage Percentage & Duration Box */}
            <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-4 self-start sm:self-auto">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Tempo Estimado</span>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {activeStage.estimatedDuration}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Conclusão</span>
                <span className="text-lg font-black text-amber-400 font-mono">{activeStage.progressPercentage}%</span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {activeStage.description}
          </p>

          {/* Deliverables Checklist Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Entregáveis e Módulos Desenvolvidos nesta Fase:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeStage.deliverables.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-2xl space-y-1 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-xs font-extrabold text-white">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Stack Highlights */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-400" />
              Especificações Técnicas da Fase:
            </h4>
            <ul className="space-y-1 text-xs text-slate-300">
              {activeStage.technicalDetails.map((tech, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{tech}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-10">
          <span className="text-slate-400">
            Zola Books &bull; Cronograma Mestre em 10 Fases (~30 Semanas / 7 Meses de Escala)
          </span>

          <div className="flex items-center gap-2">
            {selectedStageId > 1 && (
              <button
                onClick={() => setSelectedStageId((prev) => Math.max(1, prev - 1))}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl transition-all"
              >
                Fase Anterior
              </button>
            )}

            {selectedStageId < 10 && (
              <button
                onClick={() => setSelectedStageId((prev) => Math.min(10, prev + 1))}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1"
              >
                <span>Próxima Fase</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl transition-all ml-2"
            >
              Fechar
            </button>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
};
