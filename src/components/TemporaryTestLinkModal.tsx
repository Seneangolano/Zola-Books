import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Link as LinkIcon, 
  Clock, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  BookOpen, 
  Zap, 
  Share2,
  Key,
  Info,
  Lock,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Book } from '../types';
import { 
  TestTokenData, 
  generateTestPassToken, 
  parseTestPassToken 
} from '../lib/testLinkUtils';

export type { TestTokenData };
export { generateTestPassToken, parseTestPassToken };

interface TemporaryTestLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBook?: Book | null;
}

export const TemporaryTestLinkModal: React.FC<TemporaryTestLinkModalProps> = ({
  isOpen,
  onClose,
  defaultBook
}) => {
  const { books, addNotification } = useApp();

  const [selectedBookId, setSelectedBookId] = useState<string>(defaultBook ? defaultBook.id : 'all');
  const [durationHours, setDurationHours] = useState<number>(24); // default 24h
  const [testerName, setTesterName] = useState<string>('Avaliador / Testador VIP');
  const [copied, setCopied] = useState<boolean>(false);
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [currentToken, setCurrentToken] = useState<string>('');
  const [currentExpiresAt, setCurrentExpiresAt] = useState<number>(0);

  // Sync default book
  useEffect(() => {
    if (defaultBook) {
      setSelectedBookId(defaultBook.id);
    }
  }, [defaultBook]);

  // Generate secure token URL whenever options change
  const handleGenerateLink = () => {
    if (typeof window === 'undefined') return;

    const baseUrl = window.location.origin + window.location.pathname;
    const { token, expiresAt } = generateTestPassToken(selectedBookId, durationHours, testerName);

    const params = new URLSearchParams();
    params.set('token', token);
    params.set('testPass', '1');
    params.set('exp', expiresAt.toString());
    if (selectedBookId && selectedBookId !== 'all') {
      params.set('testBook', selectedBookId);
    }
    if (testerName.trim()) {
      params.set('tester', encodeURIComponent(testerName.trim()));
    }

    const fullUrl = `${baseUrl}?${params.toString()}`;
    setGeneratedUrl(fullUrl);
    setCurrentToken(token);
    setCurrentExpiresAt(expiresAt);
    setCopied(false);
  };

  useEffect(() => {
    handleGenerateLink();
  }, [selectedBookId, durationHours, testerName]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    addNotification(
      'Link de Teste Copiado!',
      `Link temporário e seguro de teste copiado para a área de transferência.`,
      'system'
    );
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenLinkDirectly = () => {
    window.open(generatedUrl, '_blank');
  };

  const selectedBook = books.find(b => b.id === selectedBookId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6 overflow-hidden"
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                <span>Gerador de Link de Teste</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Token Seguro
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cria uma URL temporária com token limitado para degustação sem login obrigatório.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4 text-xs">
          {/* Target Book Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>E-book Autorizado:</span>
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 font-medium focus:outline-none focus:border-amber-500/50 transition-colors"
            >
              <option value="all">⚡ Passe VIP Completo (Acesso a Todos os Livros)</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  📖 {b.title} — {b.author}
                </option>
              ))}
            </select>
          </div>

          {/* Time Limit Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Tempo de Expiração do Token:</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '1 Hora', value: 1 },
                { label: '24 Horas', value: 24 },
                { label: '3 Dias', value: 72 },
                { label: '7 Dias', value: 168 }
              ].map((dur) => (
                <button
                  key={dur.value}
                  type="button"
                  onClick={() => setDurationHours(dur.value)}
                  className={`py-2 px-3 rounded-xl font-bold text-center border transition-all ${
                    durationHours === dur.value
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tester Identifier Note */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Nome do Testador / Notas do Token:</span>
            </label>
            <input
              type="text"
              value={testerName}
              onChange={(e) => setTesterName(e.target.value)}
              placeholder="Ex: Revisor de Imprensa, Leitor Teste..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-medium focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Generated Token Link Display Box */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Link Temporário Seguro (Token Gerado)</span>
              </span>
              <button 
                onClick={handleGenerateLink}
                className="text-slate-400 hover:text-amber-300 flex items-center gap-1 text-[10px] font-bold transition-colors"
                title="Regerar Novo Token"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regerar Token</span>
              </button>
            </div>

            {/* URL Output with Inline Copy Button */}
            <div className={`p-3 bg-slate-900 border rounded-xl font-mono text-[11px] text-amber-300 break-all select-all leading-relaxed shadow-inner flex items-start gap-2 justify-between transition-all ${
              copied ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300' : 'border-slate-800'
            }`}>
              <span className="flex-1">{generatedUrl}</span>
              <button
                onClick={handleCopyLink}
                className={`p-1.5 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                }`}
                title="Copiar Link para a área de transferência"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Visual Success Toast Animation */}
            <AnimatePresence>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-emerald-500 text-slate-950 p-3 rounded-xl flex items-center gap-3 shadow-xl font-bold text-xs border border-emerald-400 animate-pulse"
                >
                  <div className="p-1 bg-slate-950/20 rounded-full text-slate-950">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-950 text-xs">¡Link Copiado com Sucesso!</p>
                    <p className="text-[10px] text-slate-900/90 font-medium">O link temporário com token seguro está pronto para partilha.</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-slate-950 opacity-80" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">
                  {selectedBook ? selectedBook.title : 'Todos os Livros do Catálogo'}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Expira: {new Date(currentExpiresAt || Date.now()).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })} ({new Date(currentExpiresAt || Date.now()).toLocaleDateString('pt-AO')})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
              copied
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Link Copiado para a Área de Transferência!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Link de Teste</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenLinkDirectly}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-all border border-slate-700 active:scale-95 flex items-center justify-center gap-1.5"
            title="Abrir diretamente numa nova aba para testar"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Testar Agora</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
