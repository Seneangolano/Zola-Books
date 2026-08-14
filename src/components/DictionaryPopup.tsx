import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Volume2, 
  Sparkles, 
  Search, 
  Loader2, 
  Copy, 
  Check, 
  Globe, 
  ArrowRight,
  Layers,
  Languages,
  BookMarked,
  Info
} from 'lucide-react';
import { LOCAL_DICTIONARY, DictionaryEntry } from '../data/dictionaryData';

interface DictionaryPopupProps {
  initialWord: string;
  contextSentence?: string;
  bookTitle?: string;
  author?: string;
  onClose: () => void;
  onOpenTranslate?: (wordToTranslate: string) => void;
  onNotification?: (title: string, message: string, type?: 'system' | 'badge' | 'reward') => void;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = ({
  initialWord,
  contextSentence = '',
  bookTitle = 'E-Book Zola Books',
  author = 'Autor',
  onClose,
  onOpenTranslate,
  onNotification
}) => {
  const [searchWord, setSearchWord] = useState(initialWord);
  const [inputTerm, setInputTerm] = useState(initialWord);
  const [isLoading, setIsLoading] = useState(false);
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Clean word helper
  const sanitizeWord = (w: string) => {
    return w.trim().replace(/^[^\wáàâãéèêíïóôõúüçÁÀÂÃÉÈÊÍÓÔÕÚÜÇ]+|[^\wáàâãéèêíïóôõúüçÁÀÂÃÉÈÊÍÓÔÕÚÜÇ]+$/gi, '').toLowerCase();
  };

  const lookupWord = async (wordToLookup: string) => {
    const clean = sanitizeWord(wordToLookup);
    if (!clean) return;

    setSearchWord(clean);
    setInputTerm(clean);
    setIsLoading(true);

    // 1. Check local dictionary first for instant zero-latency result
    const localMatch = LOCAL_DICTIONARY[clean];

    if (localMatch) {
      setEntry(localMatch);
      setIsLoading(false);
      return;
    }

    // 2. Fetch from backend Gemini AI endpoint /api/ai/dictionary
    try {
      const response = await fetch('/api/ai/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: clean,
          contextSentence,
          bookTitle,
          author
        })
      });

      const data = await response.json();

      if (data.success) {
        setEntry({
          word: data.word || clean,
          phonetic: data.phonetic || `[${clean}]`,
          category: data.category || 'Substantivo / Vocábulo',
          definition: data.definition || `Definição da palavra "${clean}".`,
          culturalNote: data.culturalNote || undefined,
          synonyms: Array.isArray(data.synonyms) && data.synonyms.length > 0 ? data.synonyms : ['termo', 'expressão'],
          antonyms: Array.isArray(data.antonyms) && data.antonyms.length > 0 ? data.antonyms : undefined,
          etymology: data.etymology || undefined,
          example: data.example || contextSentence || `A palavra "${clean}" ocorre na obra.`
        });
      } else {
        // Fallback generic entry
        setEntry({
          word: clean,
          phonetic: `[${clean}]`,
          category: 'Vocábulo Literário',
          definition: `Termo utilizado na obra "${bookTitle}".`,
          synonyms: ['palavra', 'termo', 'expressão'],
          example: contextSentence || `"${clean}" no contexto literário.`
        });
      }
    } catch (err) {
      console.warn('Erro ao carregar do dicionário backend:', err);
      setEntry({
        word: clean,
        phonetic: `[${clean}]`,
        category: 'Vocábulo Literário',
        definition: `A palavra "${clean}" faz parte do vocabulário do e-book.`,
        synonyms: ['palavra', 'termo'],
        example: contextSentence || `Reforço de leitura para "${clean}".`
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    lookupWord(initialWord);
  }, [initialWord]);

  const handleSpeak = (textToSpeak: string) => {
    if (!('speechSynthesis' in window) || !textToSpeak) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-PT';
    utterance.rate = 0.9;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyDefinition = () => {
    if (!entry) return;
    const text = `${entry.word.toUpperCase()} (${entry.category}): ${entry.definition}\nSinónimos: ${entry.synonyms.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onNotification) {
      onNotification('Dicionário Zola Books', 'Definição e sinónimos copiados para a área de transferência.');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTerm.trim()) {
      lookupWord(inputTerm);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Dicionário Pop-up Literário</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                  Zola Dicionário
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-xs">
                Análise em tempo real no e-book "{bookTitle}"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            title="Fechar Dicionário"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleManualSearchSubmit} className="relative z-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar outra palavra no dicionário..."
              value={inputTerm}
              onChange={(e) => setInputTerm(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white pl-9 pr-24 py-2.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-amber-500 transition-all font-medium"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <button
              type="submit"
              disabled={isLoading || !inputTerm.trim()}
              className="absolute right-1.5 top-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-[11px] px-3 py-1 rounded-xl transition-all shadow-sm"
            >
              Consultar
            </button>
          </div>
        </form>

        {/* Main Content Area */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400 relative z-10">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-xs font-semibold">A analisar vocabulário com Zola IA...</p>
          </div>
        ) : entry ? (
          <div className="space-y-4 relative z-10 animate-in fade-in">
            
            {/* Word Header Card */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-baseline gap-2.5">
                  <h2 className="text-2xl font-black text-white capitalize tracking-tight">
                    {entry.word}
                  </h2>
                  {entry.phonetic && (
                    <span className="text-xs text-amber-400 font-mono">
                      {entry.phonetic}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSpeak(entry.word)}
                    className={`p-2 rounded-xl border transition-all ${
                      isSpeaking
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-900 border-slate-800 hover:border-amber-500 text-amber-400'
                    }`}
                    title="Ouvir Pronúncia da Palavra"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleCopyDefinition}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
                    title="Copiar Definição e Sinónimos"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {onOpenTranslate && (
                    <button
                      onClick={() => onOpenTranslate(entry.word)}
                      className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all"
                      title="Traduzir esta palavra para outros idiomas"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grammatical Category Badge & Etymology */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {entry.category}
                </span>

                {entry.etymology && (
                  <span className="text-[10px] text-slate-400 italic">
                    Origem: {entry.etymology}
                  </span>
                )}
              </div>
            </div>

            {/* Definition Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Definição & Significado:
              </span>
              <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl text-xs text-slate-100 font-serif leading-relaxed">
                {entry.definition}
              </div>
            </div>

            {/* Cultural / Literary Context Note if available */}
            {entry.culturalNote && (
              <div className="bg-gradient-to-r from-amber-950/40 to-purple-950/40 border border-amber-500/30 p-3.5 rounded-2xl space-y-1 text-xs text-amber-200">
                <span className="font-extrabold uppercase text-[10px] text-amber-400 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Contexto Cultural e Literário:
                </span>
                <p className="leading-relaxed text-[11px]">{entry.culturalNote}</p>
              </div>
            )}

            {/* Interactive Clickable Synonyms */}
            {entry.synonyms && entry.synonyms.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" /> Sinónimos (Clique para pesquisar):
                  </span>
                  <span className="text-[10px] text-slate-500">Clique em qualquer sinónimo</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {entry.synonyms.map((syn, idx) => (
                    <button
                      key={idx}
                      onClick={() => lookupWord(syn)}
                      className="bg-slate-950/80 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/60 px-3 py-1 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                    >
                      <span>{syn}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400/60" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Antonyms list if present */}
            {entry.antonyms && entry.antonyms.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block">
                  Antónimos:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {entry.antonyms.map((ant, idx) => (
                    <span
                      key={idx}
                      onClick={() => lookupWord(ant)}
                      className="bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2.5 py-0.5 rounded-xl text-[11px] font-semibold cursor-pointer hover:bg-rose-500/20"
                    >
                      {ant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Example Usage Sentence */}
            {entry.example && (
              <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Exemplo no Contexto Literário:
                </span>
                <p className="italic text-slate-300 font-serif">"{entry.example}"</p>
              </div>
            )}

          </div>
        ) : (
          <div className="py-8 text-center space-y-2 text-slate-400">
            <Info className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs">Nenhuma definição encontrada para "{searchWord}".</p>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Dicionário Literário Zola Books</span>
          <span className="font-mono text-amber-400">Clique duplo em qualquer palavra no leitor</span>
        </div>

      </div>
    </div>
  );
};
