import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Languages, 
  Check, 
  ChevronDown, 
  Search, 
  Loader2, 
  Sparkles, 
  RotateCcw, 
  Columns, 
  Eye, 
  BookOpen,
  Info,
  X
} from 'lucide-react';

export interface ReaderLanguageOption {
  code: string;
  name: string;
  nativeName: string;
  category: 'original' | 'international' | 'angolan' | 'african';
  flag: string;
  ttsCode: string;
}

export const READER_LANGUAGES: ReaderLanguageOption[] = [
  { code: 'pt', name: 'Português', nativeName: 'Português (Original)', category: 'original', flag: '🇦🇴', ttsCode: 'pt-PT' },
  { code: 'en', name: 'Inglês', nativeName: 'English (Inglês)', category: 'international', flag: '🇬🇧', ttsCode: 'en-US' },
  { code: 'fr', name: 'Francês', nativeName: 'Français (Francês)', category: 'international', flag: '🇫🇷', ttsCode: 'fr-FR' },
  { code: 'es', name: 'Espanhol', nativeName: 'Español (Espanhol)', category: 'international', flag: '🇪🇸', ttsCode: 'es-ES' },
  { code: 'de', name: 'Alemão', nativeName: 'Deutsch (Alemão)', category: 'international', flag: '🇩🇪', ttsCode: 'de-DE' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano', category: 'international', flag: '🇮🇹', ttsCode: 'it-IT' },
  { code: 'zh', name: 'Mandarim', nativeName: '中文 (Mandarim / Chinês)', category: 'international', flag: '🇨🇳', ttsCode: 'zh-CN' },
  { code: 'ar', name: 'Árabe', nativeName: 'العربية (Árabe)', category: 'international', flag: '🇸🇦', ttsCode: 'ar-SA' },
  { code: 'ru', name: 'Russo', nativeName: 'Русский (Russo)', category: 'international', flag: '🇷🇺', ttsCode: 'ru-RU' },
  { code: 'ja', name: 'Japonês', nativeName: '日本語 (Japonês)', category: 'international', flag: '🇯🇵', ttsCode: 'ja-JP' },
  { code: 'umb', name: 'Umbundu', nativeName: 'Umbundu (Língua Nacional Angolana)', category: 'angolan', flag: '🇦🇴', ttsCode: 'pt-AO' },
  { code: 'kmb', name: 'Kimbundu', nativeName: 'Kimbundu (Língua Nacional Angolana)', category: 'angolan', flag: '🇦🇴', ttsCode: 'pt-AO' },
  { code: 'cjk', name: 'Cokwe', nativeName: 'Cokwe / Tchokwe (Língua Nacional)', category: 'angolan', flag: '🇦🇴', ttsCode: 'pt-AO' },
  { code: 'kkg', name: 'Kikongo', nativeName: 'Kikongo (Língua Nacional Angolana)', category: 'angolan', flag: '🇦🇴', ttsCode: 'pt-AO' },
  { code: 'ln', name: 'Lingala', nativeName: 'Lingala (Língua Regional Africana)', category: 'african', flag: '🇨🇩', ttsCode: 'fr-CD' }
];

export type TranslationDisplayMode = 'translated' | 'bilingual' | 'original';

interface EReaderLanguageSelectorProps {
  currentLanguageCode: string;
  onSelectLanguage: (langCode: string) => void;
  displayMode: TranslationDisplayMode;
  onSelectDisplayMode: (mode: TranslationDisplayMode) => void;
  isTranslating: boolean;
  onRefreshTranslation?: () => void;
  compact?: boolean;
}

export const EReaderLanguageSelector: React.FC<EReaderLanguageSelectorProps> = ({
  currentLanguageCode,
  onSelectLanguage,
  displayMode,
  onSelectDisplayMode,
  isTranslating,
  onRefreshTranslation,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'international' | 'angolan'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = READER_LANGUAGES.find(l => l.code === currentLanguageCode) || READER_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredLanguages = READER_LANGUAGES.filter(lang => {
    const matchesSearch = 
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'angolan') return lang.category === 'angolan' || lang.category === 'african';
    if (selectedCategory === 'international') return lang.category === 'international' || lang.category === 'original';
    return true;
  });

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm border ${
          currentLanguageCode !== 'pt'
            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-amber-500/20'
            : 'bg-current/10 hover:bg-current/20 border-transparent text-slate-200 hover:text-white'
        }`}
        title={`Idioma de Leitura: ${activeLang.nativeName} (Clique para mudar ou traduzir em tempo real)`}
      >
        {isTranslating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
        ) : (
          <Globe className={`w-3.5 h-3.5 ${currentLanguageCode !== 'pt' ? 'text-slate-950' : 'text-amber-500'}`} />
        )}
        
        <span className="text-sm leading-none">{activeLang.flag}</span>
        
        <span className={`${compact ? 'hidden md:inline' : 'inline'}`}>
          {currentLanguageCode === 'pt' ? 'Idioma' : activeLang.name}
        </span>

        {currentLanguageCode !== 'pt' && displayMode === 'bilingual' && (
          <span className="text-[10px] bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider">
            2L
          </span>
        )}

        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto top-12 z-50 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-3xl p-4 shadow-2xl text-slate-100 backdrop-blur-xl animate-in fade-in slide-in-from-top-3 max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-amber-500" />
              <div>
                <h3 className="font-extrabold text-sm text-white">Tradução do E-Book em Tempo Real</h3>
                <p className="text-[10px] text-amber-400/90 font-medium">Powered by Gemini 3.7 Flash • Preserva a Formatação</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Selector (Traduzido vs Bilíngue vs Original) */}
          <div className="py-3 border-b border-slate-800 space-y-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-400" /> Modo de Visualização
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => {
                  onSelectDisplayMode('translated');
                  if (currentLanguageCode === 'pt') {
                    onSelectLanguage('en');
                  }
                }}
                className={`py-1.5 px-2 rounded-xl transition-all flex flex-col items-center gap-0.5 text-center ${
                  displayMode === 'translated' && currentLanguageCode !== 'pt'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Substitui o texto original pela tradução fluida"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-[11px]">Traduzido</span>
              </button>

              <button
                onClick={() => {
                  onSelectDisplayMode('bilingual');
                  if (currentLanguageCode === 'pt') {
                    onSelectLanguage('en');
                  }
                }}
                className={`py-1.5 px-2 rounded-xl transition-all flex flex-col items-center gap-0.5 text-center ${
                  displayMode === 'bilingual' && currentLanguageCode !== 'pt'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Exibe o parágrafo original ao lado do traduzido para estudo comparativo"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="text-[11px]">Bilíngue</span>
              </button>

              <button
                onClick={() => {
                  onSelectDisplayMode('original');
                  onSelectLanguage('pt');
                }}
                className={`py-1.5 px-2 rounded-xl transition-all flex flex-col items-center gap-0.5 text-center ${
                  currentLanguageCode === 'pt' || displayMode === 'original'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Restaura o texto original da obra em Português"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Original</span>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="pt-3 pb-2 shrink-0 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar idioma (ex: Inglês, Umbundu, Francês...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-0.5 rounded-lg font-bold border transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Todos ({READER_LANGUAGES.length})
              </button>
              <button
                onClick={() => setSelectedCategory('angolan')}
                className={`px-2.5 py-0.5 rounded-lg font-bold border transition-colors flex items-center gap-1 ${
                  selectedCategory === 'angolan'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 border-slate-800 text-amber-400 hover:text-amber-300'
                }`}
              >
                <span>🇦🇴 Angola</span>
              </button>
              <button
                onClick={() => setSelectedCategory('international')}
                className={`px-2.5 py-0.5 rounded-lg font-bold border transition-colors ${
                  selectedCategory === 'international'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Internacionais
              </button>
            </div>
          </div>

          {/* Languages List */}
          <div className="overflow-y-auto space-y-1 pr-1 flex-1 max-h-60">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Nenhum idioma encontrado para "{searchQuery}".
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLanguageCode === lang.code;

                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      if (lang.code !== 'pt' && displayMode === 'original') {
                        onSelectDisplayMode('translated');
                      }
                      setIsOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg leading-none shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{lang.name}</span>
                          {lang.category === 'angolan' && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-black">
                              ANGOLA
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate font-normal">
                          {lang.nativeName}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 text-amber-400 shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="pt-3 mt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Tradução com Gemini IA
            </span>
            {onRefreshTranslation && currentLanguageCode !== 'pt' && (
              <button
                onClick={() => {
                  onRefreshTranslation();
                  setIsOpen(false);
                }}
                className="text-amber-400 hover:underline font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Retraduzir
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
