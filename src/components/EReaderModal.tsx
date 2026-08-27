import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Type, 
  Sun, 
  Moon, 
  BookOpen, 
  Bookmark, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  List, 
  Share2,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  Languages,
  Globe,
  Copy,
  Loader2,
  Plus,
  Trash2,
  BookOpenCheck,
  Zap,
  HardDrive,
  Upload,
  FileText,
  Quote,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Mic,
  BookMarked,
  SlidersHorizontal,
  MoveVertical,
  RotateCcw,
  Search,
  Edit3,
  MessageSquare,
  Tag,
  Star,
  CheckCircle2,
  Cloud,
  CloudOff,
  RefreshCw,
  Keyboard,
  Smartphone,
  Columns,
  Layers,
  Highlighter,
  Palette,
  Info
} from 'lucide-react';
import { Book, Highlight, HighlightColor } from '../types';
import { useApp } from '../context/AppContext';
import { parseEpubFile } from '../lib/epubParser';
import { QuoteCardModal } from './QuoteCardModal';
import { DictionaryPopup } from './DictionaryPopup';
import { captureReadingError } from '../lib/sentry';
import { 
  EReaderLanguageSelector, 
  READER_LANGUAGES, 
  TranslationDisplayMode 
} from './EReaderLanguageSelector';

interface EReaderModalProps {
  book: Book;
  onClose: () => void;
}

export const EReaderModal: React.FC<EReaderModalProps> = ({ book, onClose }) => {
  const { 
    addNotification, 
    purchasedBooks, 
    downloadBookForOffline, 
    removeBookFromOffline,
    isBookOfflineCached, 
    addCustomEpubBook,
    setActiveEReaderBook,
    isOnline,
    updateBookProgress,
    getBookProgress,
    bookmarks: globalBookmarks,
    addBookmark,
    removeBookmark,
    updateBookmarkNote,
    toggleChapterBookmark,
    isChapterBookmarked,
    getBookmarksForBook,
    highlights: globalHighlights,
    addHighlight,
    removeHighlight,
    updateHighlightNote,
    getHighlightsForBook,
    cloudSyncStatus,
    lastSyncedAt,
    triggerCloudSync
  } = useApp();
  const isOfflineCached = isBookOfflineCached(book.id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsingEpub, setIsParsingEpub] = useState(false);

  const handleEpubFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.epub')) {
      addNotification('Ficheiro Inválido', 'Por favor selecione um ficheiro com extensão .epub', 'system');
      return;
    }

    setIsParsingEpub(true);
    try {
      const parsedBook = await parseEpubFile(file);
      addCustomEpubBook(parsedBook);
      setCurrentChapterIndex(0);
    } catch (err) {
      console.error('Erro ao ler ficheiro .epub:', err);
      captureReadingError(err, { bookId: 'epub_upload', bookTitle: file.name });
      addNotification('Erro no EPUB', 'Não foi possível extrair o conteúdo do ficheiro .epub selecionado.', 'system');
    } finally {
      setIsParsingEpub(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isPurchased = purchasedBooks.some(b => b.id === book.id);
  const content = isPurchased ? book.fullContent : book.sampleContent;
  const chapters = content?.chapters || [
    { title: 'Capítulo 1', content: 'Conteúdo de leitura do livro digital Zola Books.' }
  ];

  const contentScrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoadRef = useRef(true);
  const [resumedNotice, setResumedNotice] = useState<string | null>(null);

  // Resume at last saved chapter progress if available
  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    const saved = getBookProgress(book.id);
    if (saved && typeof saved.currentChapterIndex === 'number' && saved.currentChapterIndex < chapters.length) {
      return saved.currentChapterIndex;
    }
    return 0;
  });

  const currentProgressPercentage = Math.min(
    100, 
    Math.max(1, Math.round(((currentChapterIndex + 1) / (chapters.length || 1)) * 100))
  );

  // Restore scroll position on initial mount & auto-scroll to saved position
  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      const saved = getBookProgress(book.id);
      if (saved) {
        if (saved.scrollPosition && saved.scrollPosition > 10) {
          setTimeout(() => {
            if (contentScrollRef.current) {
              contentScrollRef.current.scrollTop = saved.scrollPosition!;
            }
          }, 150);
          setResumedNotice(`Progresso restaurado: Capítulo ${saved.currentChapterIndex + 1}`);
          setTimeout(() => setResumedNotice(null), 4000);
        } else if (saved.currentChapterIndex > 0) {
          setResumedNotice(`Progresso restaurado: Capítulo ${saved.currentChapterIndex + 1}`);
          setTimeout(() => setResumedNotice(null), 4000);
        }
      }
    } else {
      // Reset scroll on manual chapter navigation
      if (contentScrollRef.current) {
        contentScrollRef.current.scrollTop = 0;
      }
    }
  }, [currentChapterIndex]);

  // Sync reading progress whenever current chapter changes
  useEffect(() => {
    if (book && book.id) {
      const scrollPos = contentScrollRef.current ? contentScrollRef.current.scrollTop : 0;
      updateBookProgress(book.id, currentChapterIndex, chapters.length || 1, scrollPos);
    }
  }, [book?.id, currentChapterIndex, chapters.length]);

  // Throttled scroll listener to auto-save page position
  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = setTimeout(() => {
      if (book && book.id) {
        updateBookProgress(book.id, currentChapterIndex, chapters.length || 1, scrollTop);
      }
    }, 250);
  };
  // Reading Preferences (Font Size, Line Height, Side Margins, Font Family, Theme) saved to localStorage
  const READER_PREFS_KEY = 'zolabooks_ereader_preferences';

  const DEFAULT_READER_PREFS = {
    fontSize: 18,
    lineHeight: 1.8,
    sideMargin: 24,
    fontFamily: 'serif' as 'serif' | 'sans' | 'mono',
    readerTheme: 'dark' as 'dark' | 'light' | 'sepia' | 'night'
  };

  const [readerPrefs, setReaderPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(READER_PREFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fontSize: typeof parsed.fontSize === 'number' ? Math.max(12, Math.min(32, parsed.fontSize)) : DEFAULT_READER_PREFS.fontSize,
          lineHeight: typeof parsed.lineHeight === 'number' ? Math.max(1.2, Math.min(2.6, parsed.lineHeight)) : DEFAULT_READER_PREFS.lineHeight,
          sideMargin: typeof parsed.sideMargin === 'number' ? Math.max(0, Math.min(64, parsed.sideMargin)) : DEFAULT_READER_PREFS.sideMargin,
          fontFamily: ['serif', 'sans', 'mono'].includes(parsed.fontFamily) ? (parsed.fontFamily as 'serif' | 'sans' | 'mono') : DEFAULT_READER_PREFS.fontFamily,
          readerTheme: ['dark', 'light', 'sepia', 'night'].includes(parsed.readerTheme) ? (parsed.readerTheme as 'dark' | 'light' | 'sepia' | 'night') : DEFAULT_READER_PREFS.readerTheme,
        };
      }
    } catch (e) {
      console.warn('Erro ao carregar preferências de leitura:', e);
    }
    return DEFAULT_READER_PREFS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(READER_PREFS_KEY, JSON.stringify(readerPrefs));
    } catch (e) {
      console.warn('Erro ao guardar preferências de leitura:', e);
    }
  }, [readerPrefs]);

  const fontSize = readerPrefs.fontSize;
  const setFontSize = (val: number | ((prev: number) => number)) => {
    setReaderPrefs(prev => ({
      ...prev,
      fontSize: typeof val === 'function' ? val(prev.fontSize) : val
    }));
  };

  const lineHeight = readerPrefs.lineHeight;
  const setLineHeight = (val: number) => {
    setReaderPrefs(prev => ({ ...prev, lineHeight: val }));
  };

  const sideMargin = readerPrefs.sideMargin;
  const setSideMargin = (val: number) => {
    setReaderPrefs(prev => ({ ...prev, sideMargin: val }));
  };

  const readerTheme = readerPrefs.readerTheme;
  const setReaderTheme = (val: 'dark' | 'light' | 'sepia' | 'night') => {
    setReaderPrefs(prev => ({ ...prev, readerTheme: val }));
  };

  const fontFamily = readerPrefs.fontFamily;
  const setFontFamily = (val: 'serif' | 'sans' | 'mono') => {
    setReaderPrefs(prev => ({ ...prev, fontFamily: val }));
  };

  const resetReaderPrefs = () => {
    setReaderPrefs(DEFAULT_READER_PREFS);
  };

  // Page Display Layout Mode: 'single' (Página Única), 'dual' (Coluna Dupla / Livro), 'continuous' (Rolo Contínuo)
  const [pageLayoutMode, setPageLayoutMode] = useState<'single' | 'dual' | 'continuous'>('single');

  // Format Menu Tab: 'format' | 'shortcuts'
  const [formatMenuTab, setFormatMenuTab] = useState<'format' | 'shortcuts'>('format');

  // Keyboard Shortcuts & Touch Gestures Configuration (saved in localStorage)
  const SHORTCUTS_GESTURES_KEY = 'zolabooks_ereader_shortcuts_gestures';

  const DEFAULT_SHORTCUTS = {
    nextPage: 'ArrowRight',
    prevPage: 'ArrowLeft',
    toggleLayout: 'KeyM',
    toggleZen: 'KeyZ',
    toggleBookmark: 'KeyB'
  };

  const DEFAULT_GESTURES = {
    swipeLeft: 'next_page' as const,
    swipeRight: 'prev_page' as const,
    doubleTap: 'toggle_zen' as const,
    longPress: 'toggle_immersion' as const
  };

  const [shortcutsConfig, setShortcutsConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(SHORTCUTS_GESTURES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.shortcuts) return { ...DEFAULT_SHORTCUTS, ...parsed.shortcuts };
      }
    } catch (_) {}
    return DEFAULT_SHORTCUTS;
  });

  const [gesturesConfig, setGesturesConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(SHORTCUTS_GESTURES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.gestures) return { ...DEFAULT_GESTURES, ...parsed.gestures };
      }
    } catch (_) {}
    return DEFAULT_GESTURES;
  });

  const [recordingAction, setRecordingAction] = useState<keyof typeof DEFAULT_SHORTCUTS | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SHORTCUTS_GESTURES_KEY, JSON.stringify({
        shortcuts: shortcutsConfig,
        gestures: gesturesConfig
      }));
    } catch (_) {}
  }, [shortcutsConfig, gesturesConfig]);

  const resetShortcutsAndGestures = () => {
    setShortcutsConfig(DEFAULT_SHORTCUTS);
    setGesturesConfig(DEFAULT_GESTURES);
    addNotification('Atalhos e Gestos Restaurados', 'Definições padrão de teclado e toque ativadas.', 'system');
  };

  const formatKeyDisplay = (keyStr: string): string => {
    if (!keyStr) return 'Nenhum';
    if (keyStr === 'ArrowRight') return 'Seta Direita (→)';
    if (keyStr === 'ArrowLeft') return 'Seta Esquerda (←)';
    if (keyStr === 'ArrowUp') return 'Seta Cima (↑)';
    if (keyStr === 'ArrowDown') return 'Seta Baixo (↓)';
    if (keyStr === 'Space' || keyStr === ' ') return 'Barra de Espaço';
    if (keyStr === 'PageDown') return 'Page Down';
    if (keyStr === 'PageUp') return 'Page Up';
    if (keyStr.startsWith('Key')) return `Tecla ${keyStr.replace('Key', '')}`;
    if (keyStr.startsWith('Digit')) return `Número ${keyStr.replace('Digit', '')}`;
    return keyStr.toUpperCase();
  };

  const GESTURE_ACTION_LABELS: Record<string, string> = {
    'next_page': 'Virar para Página Seguinte',
    'prev_page': 'Voltar à Página Anterior',
    'toggle_layout': 'Alternar Modo de Exibição (Único / Duplo / Contínuo)',
    'toggle_night': 'Alternar Modo Leitura Noturna',
    'toggle_zen': 'Alternar Modo Zen',
    'toggle_immersion': 'Alternar Imersão Total',
    'bookmark': 'Marcar / Desmarcar Página',
    'none': 'Desativado / Sem Ação'
  };

  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'chapters' | 'bookmarks' | 'highlights' | 'search'>('chapters');
  const [showToc, setShowToc] = useState(false);

  // In-Book Full Text Search Engine State
  const [showInBookSearch, setShowInBookSearch] = useState<boolean>(false);
  const [inBookSearchQuery, setInBookSearchQuery] = useState<string>('');
  const [searchScope, setSearchScope] = useState<'chapter' | 'all'>('all');
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);

  interface SearchResultMatch {
    chapterIndex: number;
    chapterTitle: string;
    paragraphIndex: number;
    paragraphSnippet: string;
    matchStartInPara: number;
    matchLength: number;
    globalMatchIndex: number;
  }

  const bookSearchMatches = useMemo(() => {
    if (!inBookSearchQuery.trim() || inBookSearchQuery.trim().length < 2) {
      return [];
    }

    const query = inBookSearchQuery.trim().toLowerCase();
    const results: SearchResultMatch[] = [];
    let globalCounter = 0;

    const targetChapters = searchScope === 'chapter' 
      ? [{ chap: chapters[currentChapterIndex] || chapters[0], index: currentChapterIndex }]
      : chapters.map((chap, idx) => ({ chap, index: idx }));

    targetChapters.forEach(({ chap, index }) => {
      if (!chap || !chap.content) return;
      const paras = chap.content.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);

      paras.forEach((para, pIdx) => {
        const lowerPara = para.toLowerCase();
        let matchIdx = lowerPara.indexOf(query);
        while (matchIdx !== -1) {
          results.push({
            chapterIndex: index,
            chapterTitle: chap.title || `Capítulo ${index + 1}`,
            paragraphIndex: pIdx,
            paragraphSnippet: para,
            matchStartInPara: matchIdx,
            matchLength: query.length,
            globalMatchIndex: globalCounter
          });
          globalCounter++;
          matchIdx = lowerPara.indexOf(query, matchIdx + 1);
        }
      });
    });

    return results;
  }, [chapters, inBookSearchQuery, searchScope, currentChapterIndex]);

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [inBookSearchQuery, searchScope]);

  const currentChapterMatches = useMemo(() => {
    return bookSearchMatches.filter(m => m.chapterIndex === currentChapterIndex);
  }, [bookSearchMatches, currentChapterIndex]);

  const jumpToSearchMatch = (match: SearchResultMatch) => {
    if (!match) return;
    if (match.chapterIndex !== currentChapterIndex) {
      setCurrentChapterIndex(match.chapterIndex);
    }
    setTimeout(() => {
      const paraEl = document.getElementById(`reader-paragraph-${match.paragraphIndex}`);
      if (paraEl) {
        paraEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  };

  const handleNextSearchMatch = () => {
    if (bookSearchMatches.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % bookSearchMatches.length;
    setActiveMatchIndex(nextIdx);
    jumpToSearchMatch(bookSearchMatches[nextIdx]);
  };

  const handlePrevSearchMatch = () => {
    if (bookSearchMatches.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + bookSearchMatches.length) % bookSearchMatches.length;
    setActiveMatchIndex(prevIdx);
    jumpToSearchMatch(bookSearchMatches[prevIdx]);
  };

  const currentBookBookmarks = useMemo(() => getBookmarksForBook(book.id), [globalBookmarks, book.id]);
  const isCurrentChapterBookmarked = isChapterBookmarked(book.id, currentChapterIndex);

  // Bookmark Search & Editing State
  const [bookmarkSearchQuery, setBookmarkSearchQuery] = useState<string>('');
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');

  const filteredBookBookmarks = useMemo(() => {
    if (!bookmarkSearchQuery.trim()) return currentBookBookmarks;
    const q = bookmarkSearchQuery.toLowerCase();
    return currentBookBookmarks.filter(b => 
      b.chapterTitle.toLowerCase().includes(q) ||
      (b.snippet && b.snippet.toLowerCase().includes(q)) ||
      (b.note && b.note.toLowerCase().includes(q))
    );
  }, [currentBookBookmarks, bookmarkSearchQuery]);

  // Highlights Engine State & Helpers
  const currentBookHighlights = useMemo(() => getHighlightsForBook(book.id), [globalHighlights, book.id]);
  const currentChapterHighlights = useMemo(() => currentBookHighlights.filter(h => h.chapterIndex === currentChapterIndex), [currentBookHighlights, currentChapterIndex]);

  const [highlightSearchQuery, setHighlightSearchQuery] = useState<string>('');
  const [highlightFilterColor, setHighlightFilterColor] = useState<HighlightColor | 'all'>('all');
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [editingHighlightNoteText, setEditingHighlightNoteText] = useState<string>('');

  const filteredBookHighlights = useMemo(() => {
    let result = currentBookHighlights;
    if (highlightFilterColor !== 'all') {
      result = result.filter(h => h.color === highlightFilterColor);
    }
    if (highlightSearchQuery.trim()) {
      const q = highlightSearchQuery.toLowerCase();
      result = result.filter(h => 
        h.text.toLowerCase().includes(q) ||
        (h.chapterTitle && h.chapterTitle.toLowerCase().includes(q)) ||
        (h.note && h.note.toLowerCase().includes(q))
      );
    }
    return result;
  }, [currentBookHighlights, highlightSearchQuery, highlightFilterColor]);

  const handleAddHighlightColor = (color: HighlightColor) => {
    if (!selectedSnippet) return;
    const currentChap = chapters[currentChapterIndex] || chapters[0];
    addHighlight({
      bookId: book.id,
      bookTitle: book.title,
      chapterIndex: currentChapterIndex,
      chapterTitle: currentChap?.title || `Capítulo ${currentChapterIndex + 1}`,
      text: selectedSnippet,
      color
    });
    setFloatingTranslatePos(null);
    window.getSelection()?.removeAllRanges();
  };

  const getHighlightColorClasses = (color: HighlightColor) => {
    switch (color) {
      case 'green':
        return 'bg-emerald-300/50 text-emerald-950 dark:text-emerald-100 border-b-2 border-emerald-500 shadow-xs';
      case 'blue':
        return 'bg-sky-300/50 text-sky-950 dark:text-sky-100 border-b-2 border-sky-500 shadow-xs';
      case 'pink':
        return 'bg-pink-300/50 text-pink-950 dark:text-pink-100 border-b-2 border-pink-500 shadow-xs';
      case 'purple':
        return 'bg-purple-300/50 text-purple-950 dark:text-purple-100 border-b-2 border-purple-500 shadow-xs';
      case 'yellow':
      default:
        return 'bg-amber-300/60 text-amber-950 dark:text-amber-100 border-b-2 border-amber-500 shadow-xs';
    }
  };

  const renderParagraphWithHighlights = (para: string, chapterHighlights: Highlight[], pIdx: number) => {
    const trimmedQuery = inBookSearchQuery.trim().toLowerCase();
    const hasSearch = trimmedQuery.length >= 2;
    const hasHighlights = chapterHighlights && chapterHighlights.length > 0;

    if (!hasSearch && !hasHighlights) {
      return para;
    }

    type Interval = {
      start: number;
      end: number;
      type: 'user_highlight' | 'search_match';
      highlight?: Highlight;
      isCurrentMatch?: boolean;
      globalMatchIdx?: number;
    };

    const intervals: Interval[] = [];

    // 1. User Colored Highlights
    if (hasHighlights) {
      chapterHighlights.forEach(h => {
        if (!h.text || h.text.length < 2) return;
        let idx = para.indexOf(h.text);
        while (idx !== -1) {
          intervals.push({
            start: idx,
            end: idx + h.text.length,
            type: 'user_highlight',
            highlight: h
          });
          idx = para.indexOf(h.text, idx + 1);
        }
      });
    }

    // 2. In-text Search Matches
    if (hasSearch) {
      const paraMatches = currentChapterMatches.filter(m => m.paragraphIndex === pIdx);
      paraMatches.forEach(m => {
        intervals.push({
          start: m.matchStartInPara,
          end: m.matchStartInPara + m.matchLength,
          type: 'search_match',
          isCurrentMatch: m.globalMatchIndex === activeMatchIndex,
          globalMatchIdx: m.globalMatchIndex
        });
      });
    }

    if (intervals.length === 0) return para;

    intervals.sort((a, b) => a.start - b.start || (a.type === 'search_match' ? -1 : 1));

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    intervals.forEach((inter, i) => {
      if (inter.start < lastIdx) return;
      if (inter.start > lastIdx) {
        elements.push(para.substring(lastIdx, inter.start));
      }

      const segmentText = para.substring(inter.start, inter.end);

      if (inter.type === 'search_match') {
        elements.push(
          <mark
            key={`search-${i}-${inter.start}`}
            id={inter.isCurrentMatch ? 'active-search-match' : undefined}
            className={`rounded px-1 py-0.5 font-bold transition-all ${
              inter.isCurrentMatch
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 scale-105 shadow-md font-black inline-block animate-pulse'
                : 'bg-amber-500/40 text-amber-100 border-b-2 border-amber-400/80 hover:bg-amber-400/60'
            }`}
            title={`Ocorrência #${(inter.globalMatchIdx ?? 0) + 1} da busca no e-book`}
          >
            {segmentText}
          </mark>
        );
      } else if (inter.highlight) {
        const colorClass = getHighlightColorClasses(inter.highlight.color);
        const hl = inter.highlight;
        elements.push(
          <mark
            key={`hl-${hl.id}-${i}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedHighlight(hl);
              setEditingHighlightNoteText(hl.note || '');
            }}
            className={`cursor-pointer rounded px-1 py-0.5 font-medium transition-all hover:scale-105 ${colorClass}`}
            title={hl.note ? `Nota: "${hl.note}" — Clique para copiar, partilhar ou gerir` : 'Clique para copiar, partilhar nas redes sociais ou gerir este realce'}
          >
            {segmentText}
            {hl.note && <span className="ml-1 text-[10px]">💬</span>}
          </mark>
        );
      }

      lastIdx = inter.end;
    });

    if (lastIdx < para.length) {
      elements.push(para.substring(lastIdx));
    }

    return elements;
  };
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showZenToast, setShowZenToast] = useState(false);
  const [isTotalImmersion, setIsTotalImmersion] = useState(false);
  const [showImmersionToast, setShowImmersionToast] = useState(false);
  const [isHoldingCenter, setIsHoldingCenter] = useState(false);
  const touchPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Text-To-Speech (TTS) Accessibility Engine State
  const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1.0); // 0.75x to 2.0x
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentSpeakingParagraphIndex, setCurrentSpeakingParagraphIndex] = useState<number | null>(null);
  const [showTtsDock, setShowTtsDock] = useState<boolean>(false);

  const currentChapter = chapters[currentChapterIndex] || chapters[0];

  // Real-time Book Translation State (Full Chapter Translation via Gemini AI)
  const [readerLanguage, setReaderLanguage] = useState<string>(() => {
    return localStorage.getItem('zolabooks_ereader_language') || 'pt';
  });
  const [translationDisplayMode, setTranslationDisplayMode] = useState<TranslationDisplayMode>(() => {
    return (localStorage.getItem('zolabooks_translation_display_mode') as TranslationDisplayMode) || 'translated';
  });
  const [translationCache, setTranslationCache] = useState<Record<string, { translatedTitle: string; translatedParagraphs: string[]; note?: string }>>(() => {
    try {
      const saved = sessionStorage.getItem(`zolabooks_trans_${book.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isTranslatingChapter, setIsTranslatingChapter] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  // Sync translation preferences and session cache
  useEffect(() => {
    localStorage.setItem('zolabooks_ereader_language', readerLanguage);
  }, [readerLanguage]);

  useEffect(() => {
    localStorage.setItem('zolabooks_translation_display_mode', translationDisplayMode);
  }, [translationDisplayMode]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`zolabooks_trans_${book.id}`, JSON.stringify(translationCache));
    } catch (_) {}
  }, [translationCache, book.id]);

  // Split chapter into readable paragraphs
  const rawParagraphs = React.useMemo(() => {
    if (!currentChapter?.content) return [];
    const splitArr = currentChapter.content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    return splitArr.length > 0 ? splitArr : [currentChapter.content];
  }, [currentChapter]);

  const activeTranslationKey = `chap_${currentChapterIndex}_${readerLanguage}`;
  const activeChapterTranslation = useMemo(() => {
    if (readerLanguage === 'pt') return null;
    return translationCache[activeTranslationKey] || null;
  }, [translationCache, activeTranslationKey, readerLanguage]);

  const isTranslatedMode = readerLanguage !== 'pt' && translationDisplayMode === 'translated' && !!activeChapterTranslation;
  const isBilingualMode = readerLanguage !== 'pt' && translationDisplayMode === 'bilingual' && !!activeChapterTranslation;

  // Active paragraphs (translated or original)
  const paragraphs = useMemo(() => {
    if (isTranslatedMode && activeChapterTranslation?.translatedParagraphs?.length) {
      return activeChapterTranslation.translatedParagraphs;
    }
    return rawParagraphs;
  }, [isTranslatedMode, activeChapterTranslation, rawParagraphs]);

  const currentChapterDisplayTitle = useMemo(() => {
    if (readerLanguage !== 'pt' && activeChapterTranslation?.translatedTitle) {
      return activeChapterTranslation.translatedTitle;
    }
    return currentChapter.title;
  }, [readerLanguage, activeChapterTranslation, currentChapter]);

  const translateCurrentChapter = async (forceRefresh: boolean = false) => {
    if (readerLanguage === 'pt') return;
    const langObj = READER_LANGUAGES.find(l => l.code === readerLanguage);
    if (!langObj) return;

    const cacheKey = `chap_${currentChapterIndex}_${readerLanguage}`;
    if (!forceRefresh && translationCache[cacheKey]) {
      return;
    }

    if (rawParagraphs.length === 0) return;

    setIsTranslatingChapter(true);
    setTranslationError(null);

    try {
      const response = await fetch('/api/ai/translate-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterTitle: currentChapter.title || `Capítulo ${currentChapterIndex + 1}`,
          paragraphs: rawParagraphs,
          targetLanguage: langObj.name,
          sourceLanguage: 'Português',
          bookTitle: book.title,
          author: book.author
        })
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.translatedParagraphs)) {
        setTranslationCache(prev => ({
          ...prev,
          [cacheKey]: {
            translatedTitle: data.translatedTitle || `${currentChapter.title} (${langObj.name})`,
            translatedParagraphs: data.translatedParagraphs,
            note: data.culturalNote
          }
        }));
        addNotification(
          `Capítulo Traduzido 🌐`,
          `Capítulo traduzido para ${langObj.nativeName} preservando a formatação original.`,
          'success'
        );
      } else {
        throw new Error(data.error || 'Falha ao traduzir o capítulo.');
      }
    } catch (err: any) {
      console.error('Erro na tradução do capítulo:', err);
      setTranslationError(err?.message || 'Não foi possível traduzir o capítulo.');
      addNotification('Erro na Tradução', 'Não foi possível traduzir o capítulo no momento.', 'system');
    } finally {
      setIsTranslatingChapter(false);
    }
  };

  // Automatically trigger chapter translation when chapter or language changes
  useEffect(() => {
    if (readerLanguage !== 'pt') {
      translateCurrentChapter(false);
    }
  }, [currentChapterIndex, readerLanguage]);

  // Load browser speech synthesis voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setSpeechVoices(available);
      
      if (!selectedVoiceURI && available.length > 0) {
        // Find best Portuguese voice (pt-PT or pt-BR or generic pt)
        const ptVoice = available.find(v => v.lang.startsWith('pt-PT')) || 
                        available.find(v => v.lang.startsWith('pt')) || 
                        available[0];
        if (ptVoice) {
          setSelectedVoiceURI(ptVoice.voiceURI);
        }
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoiceURI]);

  // Instant Translation State
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Inglês');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState<{
    translation: string;
    note?: string;
    originalLanguage?: string;
  } | null>(null);
  const [floatingTranslatePos, setFloatingTranslatePos] = useState<{ x: number; y: number } | null>(null);
  const [copiedTranslation, setCopiedTranslation] = useState(false);

  // Quote Card State
  const [showQuoteCardModal, setShowQuoteCardModal] = useState(false);
  const [quoteForCard, setQuoteForCard] = useState('');

  // Pop-up Dictionary State
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState('');
  const [dictionaryContext, setDictionaryContext] = useState('');

  const handleOpenDictionary = (wordToLookup?: string, context?: string) => {
    const textToUse = wordToLookup || selectedSnippet || 'leitura';
    const cleanWord = textToUse.trim().split(/\s+/)[0].replace(/^[^\wáàâãéèêíïóôõúüçÁÀÂÃÉÈÊÍÓÔÕÚÜÇ]+|[^\wáàâãéèêíïóôõúüçÁÀÂÃÉÈÊÍÓÔÕÚÜÇ]+$/gi, '');
    setDictionaryWord(cleanWord || 'leitura');
    setDictionaryContext(context || selectedSnippet || currentChapter?.title || '');
    setShowDictionaryModal(true);
    setFloatingTranslatePos(null);
  };

  const handleParagraphDoubleClick = (paragraphText: string) => {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';
    if (selectedText && selectedText.length >= 2) {
      handleOpenDictionary(selectedText, paragraphText);
    } else {
      toggleZenMode();
    }
  };

  const handleOpenQuoteCard = (overrideText?: string) => {
    const textToUse = overrideText || selectedSnippet || (chapters[currentChapterIndex]?.content?.substring(0, 180) + '...') || book.title;
    setQuoteForCard(textToUse);
    setShowQuoteCardModal(true);
    setFloatingTranslatePos(null);
  };

  const availableLanguages = [
    { label: 'Inglês (English)', value: 'Inglês', flag: '🇬🇧' },
    { label: 'Francês (Français)', value: 'Francês', flag: '🇫🇷' },
    { label: 'Espanhol (Español)', value: 'Espanhol', flag: '🇪🇸' },
    { label: 'Alemão (Deutsch)', value: 'Alemão', flag: '🇩🇪' },
    { label: 'Mandarim (中文)', value: 'Mandarim', flag: '🇨🇳' },
    { label: 'Umbundu (Língua Angolana)', value: 'Umbundu', flag: '🇦🇴' },
    { label: 'Kimbundu (Língua Angolana)', value: 'Kimbundu', flag: '🇦🇴' },
    { label: 'Lingala (Língua Africana)', value: 'Lingala', flag: '🇦🇴' }
  ];

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';
    if (text.length >= 3) {
      setSelectedSnippet(text);
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setFloatingTranslatePos({
          x: Math.min(window.innerWidth - 180, Math.max(20, rect.left + rect.width / 2 - 90)),
          y: Math.max(10, rect.top - 50)
        });
      }
    } else {
      setFloatingTranslatePos(null);
    }
  };

  const handleTranslateSnippet = async (textToTranslate?: string, targetLang?: string) => {
    const text = textToTranslate || selectedSnippet;
    const lang = targetLang || targetLanguage;

    if (!text || !text.trim()) {
      addNotification('Tradução Instantânea', 'Selecione ou introduza um trecho de texto no e-book para traduzir.', 'system');
      return;
    }

    setIsTranslating(true);
    setTranslationResult(null);

    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          targetLanguage: lang,
          bookTitle: book.title,
          author: book.author
        })
      });

      const data = await response.json();
      if (data.success) {
        setTranslationResult({
          translation: data.translation,
          note: data.note,
          originalLanguage: data.originalLanguage || 'Português'
        });
      } else {
        setTranslationResult({
          translation: `[Tradução em ${lang}]: "${text}"`,
          note: 'Nota: Acompanhamento de leitura literária.'
        });
      }
    } catch (err) {
      console.error('Erro na API de tradução:', err);
      setTranslationResult({
        translation: `[Tradução em ${lang}]: "${text}"`,
        note: 'Nota: Acompanhamento de leitura em modo de estudo.'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeakTranslation = () => {
    if (!translationResult?.translation || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translationResult.translation);
    utterance.lang = targetLanguage.startsWith('Inglês') ? 'en-US' : targetLanguage.startsWith('Francês') ? 'fr-FR' : 'es-ES';
    window.speechSynthesis.speak(utterance);
  };

  const toggleZenMode = () => {
    const next = !isZenMode;
    setIsZenMode(next);
    if (next) {
      setShowToc(false);
      setShowFormatMenu(false);
      setShowInBookSearch(false);
      setShowTtsDock(false);
      setIsTotalImmersion(false);
      setShowZenToast(true);
      setTimeout(() => setShowZenToast(false), 4000);
      addNotification('Modo Zen Ativado ✨', 'Todas as barras foram ocultadas. Duplo clique na área de leitura ou pressione ESC para sair.', 'system');
    } else {
      setShowZenToast(false);
      addNotification('Modo Zen Desativado', 'Controlos e barras de navegação restaurados.', 'system');
    }
  };

  const toggleTotalImmersion = () => {
    const next = !isTotalImmersion;
    setIsTotalImmersion(next);
    if (next) {
      setShowToc(false);
      setShowTtsDock(false);
      setIsZenMode(false);
      setShowImmersionToast(true);
      setTimeout(() => setShowImmersionToast(false), 4500);
      addNotification('Imersão Total Ativada', 'Todas as barras foram ocultadas. Mantenha o dedo pressionado (1s) no centro para retornar aos controlos.', 'system');
    }
  };

  const toggleNightMode = () => {
    if (readerTheme === 'night') {
      setReaderTheme('dark');
      addNotification('Modo Noturno Desativado', 'Esquema de cores padrão restaurado.', 'system');
    } else {
      setReaderTheme('night');
      addNotification('Modo Leitura Noturna Ativado 🌙', 'Fundo escuro com texto cinza claro ativado para conforto visual em ambientes com pouca luz.', 'system');
    }
  };

  const startLongPress = () => {
    if (!isTotalImmersion) return;
    setIsHoldingCenter(true);
    if (touchPressTimerRef.current) clearTimeout(touchPressTimerRef.current);
    touchPressTimerRef.current = setTimeout(() => {
      setIsTotalImmersion(false);
      setIsHoldingCenter(false);
      if ('vibrate' in navigator) {
        try { navigator.vibrate(100); } catch (_) {}
      }
      addNotification('Saiu da Imersão Total', 'Os controlos e barras do leitor foram restaurados.', 'system');
    }, 900);
  };

  const cancelLongPress = () => {
    setIsHoldingCenter(false);
    if (touchPressTimerRef.current) {
      clearTimeout(touchPressTimerRef.current);
      touchPressTimerRef.current = null;
    }
  };

  // Central Reader Action Dispatcher
  const executeReaderAction = (actionName: string) => {
    switch (actionName) {
      case 'next_page':
        if (currentChapterIndex < chapters.length - 1) {
          setCurrentChapterIndex(prev => prev + 1);
          setSelectedSnippet('');
          setTranslationResult(null);
          if (contentScrollRef.current) contentScrollRef.current.scrollTop = 0;
          addNotification('Página Avançada', `Capítulo ${currentChapterIndex + 2} de ${chapters.length}`, 'system');
        }
        break;
      case 'prev_page':
        if (currentChapterIndex > 0) {
          setCurrentChapterIndex(prev => prev - 1);
          setSelectedSnippet('');
          setTranslationResult(null);
          if (contentScrollRef.current) contentScrollRef.current.scrollTop = 0;
          addNotification('Página Anterior', `Capítulo ${currentChapterIndex} de ${chapters.length}`, 'system');
        }
        break;
      case 'toggle_layout': {
        const next = pageLayoutMode === 'single' ? 'dual' : pageLayoutMode === 'dual' ? 'continuous' : 'single';
        setPageLayoutMode(next);
        const labels = { single: 'Página Única', dual: 'Coluna Dupla (Modo Livro)', continuous: 'Rolo Contínuo' };
        addNotification('Modo de Exibição', `Alterado para ${labels[next]}`, 'system');
        break;
      }
      case 'toggle_zen': {
        toggleZenMode();
        break;
      }
      case 'toggle_night':
        toggleNightMode();
        break;
      case 'toggle_immersion':
        toggleTotalImmersion();
        break;
      case 'bookmark':
        toggleBookmark();
        addNotification(isCurrentChapterBookmarked ? 'Marcador Removido' : 'Marcador Guardado', 'Status de marcador atualizado.', 'system');
        break;
      default:
        break;
    }
  };

  // Touch Gesture Detection (Swipe & Double Tap)
  const touchStartPosRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  const handleTouchStartCanvas = (e: React.TouchEvent) => {
    startLongPress();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartPosRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    }
  };

  const handleTouchEndCanvas = (e: React.TouchEvent) => {
    cancelLongPress();
    if (!touchStartPosRef.current) return;

    const endTouch = e.changedTouches[0];
    if (!endTouch) return;

    const deltaX = endTouch.clientX - touchStartPosRef.current.x;
    const deltaY = endTouch.clientY - touchStartPosRef.current.y;
    const deltaTime = Date.now() - touchStartPosRef.current.time;

    touchStartPosRef.current = null;

    // Double Tap detection (two quick taps within 300ms)
    const now = Date.now();
    if (deltaTime < 250 && Math.abs(deltaX) < 15 && Math.abs(deltaY) < 15) {
      if (now - lastTapTimeRef.current < 300) {
        if (gesturesConfig.doubleTap && gesturesConfig.doubleTap !== 'none') {
          executeReaderAction(gesturesConfig.doubleTap);
        }
        lastTapTimeRef.current = 0;
        return;
      }
      lastTapTimeRef.current = now;
    }

    // Swipe gesture detection (horizontal swipe > 45px)
    if (deltaTime < 450 && Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < -45) {
        if (gesturesConfig.swipeLeft && gesturesConfig.swipeLeft !== 'none') {
          executeReaderAction(gesturesConfig.swipeLeft);
        }
      } else if (deltaX > 45) {
        if (gesturesConfig.swipeRight && gesturesConfig.swipeRight !== 'none') {
          executeReaderAction(gesturesConfig.swipeRight);
        }
      }
    }
  };

  // Global Keyboard Event Listener with Shortcut Customization & Capture Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If capturing/recording a new key binding
      if (recordingAction) {
        e.preventDefault();
        if (e.key === 'Escape') {
          setRecordingAction(null);
          return;
        }
        const keyCaptured = e.code || e.key;
        setShortcutsConfig(prev => ({ ...prev, [recordingAction]: keyCaptured }));
        addNotification('Atalho de Teclado Reatribuído', `Atalho de ${recordingAction} alterado para: ${formatKeyDisplay(keyCaptured)}`, 'system');
        setRecordingAction(null);
        return;
      }

      // Ignore standard key shortcuts if typing in editable input/textarea
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Escape') {
        if (isTotalImmersion) {
          setIsTotalImmersion(false);
          addNotification('Saiu da Imersão Total', 'Controlos e barras restauradas.', 'system');
        } else if (isZenMode) {
          setIsZenMode(false);
        } else if (showFormatMenu) {
          setShowFormatMenu(false);
        } else {
          onClose();
        }
        return;
      }

      const keyUpper = e.key.toUpperCase();

      const matchesKey = (targetKey: string) => {
        if (!targetKey) return false;
        return (
          e.code === targetKey || 
          e.key === targetKey || 
          keyUpper === targetKey.toUpperCase() ||
          (`Key${keyUpper}` === targetKey) ||
          (targetKey === 'Space' && (e.key === ' ' || e.code === 'Space'))
        );
      };

      if (matchesKey(shortcutsConfig.nextPage)) {
        e.preventDefault();
        executeReaderAction('next_page');
      } else if (matchesKey(shortcutsConfig.prevPage)) {
        e.preventDefault();
        executeReaderAction('prev_page');
      } else if (matchesKey(shortcutsConfig.toggleLayout)) {
        e.preventDefault();
        executeReaderAction('toggle_layout');
      } else if (matchesKey(shortcutsConfig.toggleZen)) {
        e.preventDefault();
        executeReaderAction('toggle_zen');
      } else if (matchesKey(shortcutsConfig.toggleBookmark)) {
        e.preventDefault();
        executeReaderAction('bookmark');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTotalImmersion, 
    isZenMode, 
    showFormatMenu, 
    currentChapterIndex, 
    chapters.length, 
    onClose, 
    recordingAction, 
    shortcutsConfig, 
    gesturesConfig,
    isCurrentChapterBookmarked
  ]);

  // Advanced Text-To-Speech (TTS) Engine
  const playParagraph = (index: number) => {
    if (!('speechSynthesis' in window) || index >= paragraphs.length) {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentSpeakingParagraphIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentSpeakingParagraphIndex(index);
    setIsSpeaking(true);
    setIsPaused(false);
    setShowTtsDock(true);

    const currentLangObj = READER_LANGUAGES.find(l => l.code === readerLanguage) || READER_LANGUAGES[0];
    const paragraphText = (isTranslatedMode && activeChapterTranslation?.translatedParagraphs?.[index])
      ? activeChapterTranslation.translatedParagraphs[index]
      : (isBilingualMode && activeChapterTranslation?.translatedParagraphs?.[index])
        ? activeChapterTranslation.translatedParagraphs[index]
        : (paragraphs[index] || rawParagraphs[index]);

    const utterance = new SpeechSynthesisUtterance(paragraphText);

    if (selectedVoiceURI) {
      const chosenVoice = speechVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (chosenVoice) utterance.voice = chosenVoice;
    } else {
      utterance.lang = currentLangObj.ttsCode || (book.language === 'Português' ? 'pt-PT' : 'en-US');
    }

    utterance.rate = speechRate;

    utterance.onend = () => {
      if (index + 1 < paragraphs.length) {
        playParagraph(index + 1);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentSpeakingParagraphIndex(null);
        addNotification('Leitura Concluída 🎧', 'A leitura por voz deste capítulo foi finalizada.');
      }
    };

    utterance.onerror = (err) => {
      console.warn('Erro TTS:', err);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);

    // Auto-scroll to active paragraph
    setTimeout(() => {
      const el = document.getElementById(`reader-paragraph-${index}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handlePauseSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleResumeSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else if (currentSpeakingParagraphIndex !== null) {
        playParagraph(currentSpeakingParagraphIndex);
      } else {
        playParagraph(0);
      }
    }
  };

  const handleStopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentSpeakingParagraphIndex(null);
    }
  };

  const handleSpeechToggle = () => {
    if (!('speechSynthesis' in window)) {
      addNotification('Text-to-Speech', 'O teu navegador não suporta síntese de voz.', 'system');
      return;
    }

    if (isSpeaking) {
      if (isPaused) {
        handleResumeSpeech();
      } else {
        handlePauseSpeech();
      }
    } else {
      playParagraph(0);
    }
  };

  const handleSpeakSnippet = (textToSpeak: string) => {
    if (!('speechSynthesis' in window) || !textToSpeak) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    setIsPaused(false);
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (selectedVoiceURI) {
      const chosenVoice = speechVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (chosenVoice) utterance.voice = chosenVoice;
    } else {
      utterance.lang = 'pt-PT';
    }
    utterance.rate = speechRate;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Stop TTS when chapter changes
  useEffect(() => {
    handleStopSpeech();
  }, [currentChapterIndex]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleBookmark = (note?: string) => {
    const currentChap = chapters[currentChapterIndex] || chapters[0];
    const snippet = currentChap?.content ? currentChap.content.substring(0, 150) + '...' : undefined;
    toggleChapterBookmark(
      book, 
      currentChapterIndex, 
      currentChap?.title || `Capítulo ${currentChapterIndex + 1}`, 
      snippet, 
      note
    );
  };

  const handleDownloadFile = () => {
    const textContent = `${book.title} - por ${book.author}\n\n${currentChapter.title}\n\n${currentChapter.content}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/\s+/g, '_')}_ZolaBooks.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Download Concluído', `Ficheiro e-book de "${book.title}" descarregado com sucesso.`);
  };

  // Theme styling helpers
  const getThemeClasses = () => {
    switch (readerTheme) {
      case 'light':
        return 'bg-amber-50/90 text-slate-900 border-amber-200';
      case 'sepia':
        return 'bg-[#f8f1e3] text-[#433422] border-[#e2d5c3]';
      case 'night':
        return 'bg-[#0f172a] text-[#cbd5e1] border-slate-800';
      default: // dark
        return 'bg-slate-950 text-slate-100 border-slate-800';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'sans': return 'font-sans';
      case 'mono': return 'font-mono';
      default: return 'font-serif';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center transition-all ${isZenMode || isTotalImmersion ? 'p-0' : 'p-2 sm:p-4'}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Leitor Digital E-Reader: ${book.title}`}
    >
      <Helmet>
        <title>{`A Ler: ${book.title} — ${book.author} | E-Reader Zola Books`}</title>
        <meta name="description" content={`Leitura online do e-book "${book.title}" por ${book.author} no E-Reader Digital Zola Books.`} />
        <meta property="og:title" content={`A Ler: ${book.title}`} />
        <meta property="og:description" content={`E-book digital "${book.title}" de ${book.author}`} />
        <meta property="og:image" content={book.coverImage} />
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`w-full h-full flex flex-col overflow-hidden transition-all duration-300 ${getThemeClasses()} ${
          isZenMode || isTotalImmersion ? 'rounded-none border-none max-w-none shadow-none' : 'max-w-4xl h-[92vh] rounded-3xl border shadow-2xl'
        }`}
      >
        
        {/* Header Controls Bar (Hidden in Zen Mode and Imersão Total) */}
        {!isZenMode && !isTotalImmersion && (
          <div className="px-4 py-3 border-b border-current/10 flex items-center justify-between gap-2 text-xs font-semibold">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <h2 className="font-bold truncate text-sm">{book.title}</h2>
                  {!isOnline && (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase shrink-0">
                      Modo Offline SW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-80 text-[11px] truncate">
                  <span>{isPurchased ? 'Edição Completa Digital' : 'Amostra Gratuita'}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{currentProgressPercentage}% Concluído</span>
                </div>
              </div>
            </div>

            {/* Center/Right Controls */}
            <div className="flex items-center gap-1 sm:gap-2">

              {/* Botão Modo Leitura Noturna */}
              <button
                onClick={toggleNightMode}
                className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm ${
                  readerTheme === 'night'
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md ring-2 ring-sky-400/40'
                    : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
                }`}
                title={
                  readerTheme === 'night'
                    ? 'Desativar Modo Leitura Noturna (Restaurar tema escuro padrão)'
                    : 'Modo Leitura Noturna — Fundo escuro com texto cinza claro para conforto visual com pouca luz'
                }
              >
                <Moon className={`w-3.5 h-3.5 ${readerTheme === 'night' ? 'fill-current text-slate-950' : 'text-indigo-300'}`} />
                <span className="hidden sm:inline">
                  {readerTheme === 'night' ? 'Leitura Noturna ✓' : 'Leitura Noturna'}
                </span>
              </button>

              {/* Botão Imersão Total */}
              <button
                onClick={toggleTotalImmersion}
                className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm"
                title="Imersão Total - Esconde todas as barras e menus (Toque prolongado no centro para sair)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Imersão Total</span>
              </button>

              {/* Modo Zen Button */}
              <button
                onClick={toggleZenMode}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-500 border border-amber-500/30 transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm"
                title="Modo Zen - Leitura Sem Distrações"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current text-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Modo Zen</span>
              </button>

              {/* Table of Contents Button */}
              <button
                onClick={() => {
                  setShowToc(!showToc || drawerTab !== 'chapters');
                  setDrawerTab('chapters');
                }}
                className={`p-2 rounded-xl transition-colors flex items-center gap-1 ${
                  showToc && drawerTab === 'chapters' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'hover:bg-current/10'
                }`}
                title="Índice de Capítulos"
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline text-xs font-bold">Índice</span>
              </button>

              {/* Speech Button */}
              <button
                onClick={handleSpeechToggle}
                className={`p-2 rounded-xl transition-colors flex items-center gap-1 ${
                  isSpeaking ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-current/10'
                }`}
                title="Ouvir Leitura por Voz"
              >
                {isSpeaking ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden md:inline">{isSpeaking ? 'A Ouvir' : 'Ouvir'}</span>
              </button>

              {/* Pop-up Dictionary Button */}
              <button
                onClick={() => handleOpenDictionary()}
                className={`p-2 rounded-xl transition-colors flex items-center gap-1 ${
                  showDictionaryModal ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-current/10'
                }`}
                title="Dicionário Pop-up Literário (Definição, Sinónimos e Gramática)"
              >
                <BookMarked className="w-4 h-4 text-amber-500" />
                <span className="hidden md:inline">Dicionário</span>
              </button>

              {/* Real-time Language & Translation Selector */}
              <EReaderLanguageSelector
                currentLanguageCode={readerLanguage}
                onSelectLanguage={(code) => setReaderLanguage(code)}
                displayMode={translationDisplayMode}
                onSelectDisplayMode={(mode) => setTranslationDisplayMode(mode)}
                isTranslating={isTranslatingChapter}
                onRefreshTranslation={() => translateCurrentChapter(true)}
                compact={true}
              />

              {/* Instant Translation Modal Button */}
              <button
                onClick={() => {
                  setShowTranslateModal(true);
                  if (selectedSnippet) {
                    handleTranslateSnippet(selectedSnippet, targetLanguage);
                  }
                }}
                className={`p-2 rounded-xl transition-colors flex items-center gap-1 ${
                  showTranslateModal ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-current/10'
                }`}
                title="Tradução Instantânea de Trechos Selecionados"
              >
                <Languages className="w-4 h-4 text-amber-500" />
                <span className="hidden md:inline">Traduzir Trecho</span>
              </button>

              {/* Quote Card Generator Button */}
              <button
                onClick={() => handleOpenQuoteCard()}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 font-bold text-xs"
                title="Criar Cartão de Citação para Redes Sociais"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Cartão Citação</span>
              </button>

              {/* Quick Page Layout Mode Button in Header */}
              <button
                onClick={() => executeReaderAction('toggle_layout')}
                className="p-2 rounded-xl bg-current/10 hover:bg-current/20 transition-all flex items-center gap-1.5 font-bold text-xs"
                title={`Modo de Exibição: ${
                  pageLayoutMode === 'single' ? 'Página Única' : pageLayoutMode === 'dual' ? 'Coluna Dupla (Livro)' : 'Rolo Contínuo'
                } (Atalho: ${formatKeyDisplay(shortcutsConfig.toggleLayout)})`}
              >
                {pageLayoutMode === 'single' ? (
                  <FileText className="w-4 h-4 text-amber-500" />
                ) : pageLayoutMode === 'dual' ? (
                  <Columns className="w-4 h-4 text-amber-500" />
                ) : (
                  <MoveVertical className="w-4 h-4 text-amber-500" />
                )}
                <span className="hidden lg:inline text-xs font-bold">
                  {pageLayoutMode === 'single' ? '1 Coluna' : pageLayoutMode === 'dual' ? '2 Colunas' : 'Contínuo'}
                </span>
              </button>

              {/* Reading Preferences & Shortcuts Settings Button */}
              <div className="relative">
                <button
                  onClick={() => setShowFormatMenu(!showFormatMenu)}
                  className={`p-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    showFormatMenu ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-current/10 hover:bg-current/20'
                  }`}
                  title="Ajustes de Leitura, Atalhos de Teclado e Gestos de Toque"
                >
                  <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline text-xs font-bold">Ajustes</span>
                </button>

                {/* Popover Menu com Sliders e Configuração de Atalhos e Gestos */}
                {showFormatMenu && (
                  <div className="absolute top-12 right-0 sm:right-auto sm:left-0 z-50 w-80 sm:w-[420px] bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl text-slate-100 backdrop-blur-xl animate-in fade-in slide-in-from-top-3 max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                        <h3 className="font-extrabold text-sm text-white">Definições do Leitor</h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowFormatMenu(false);
                          setRecordingAction(null);
                        }}
                        className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Header Navigation Tabs for Popover */}
                    <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800/80 mb-4 text-xs font-bold">
                      <button
                        onClick={() => setFormatMenuTab('format')}
                        className={`py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                          formatMenuTab === 'format'
                            ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        <span>Formatação & Tema</span>
                      </button>
                      <button
                        onClick={() => setFormatMenuTab('shortcuts')}
                        className={`py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                          formatMenuTab === 'shortcuts'
                            ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Keyboard className="w-3.5 h-3.5" />
                        <span>Atalhos & Gestos</span>
                      </button>
                    </div>

                    {formatMenuTab === 'format' ? (
                      <div className="space-y-4 text-xs">
                        {/* Modo de Exibição de Página */}
                        <div className="space-y-1.5">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Columns className="w-3.5 h-3.5 text-amber-500" /> Layout de Leitura
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => setPageLayoutMode('single')}
                              className={`py-2 rounded-lg text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 ${
                                pageLayoutMode === 'single' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>1 Coluna</span>
                            </button>
                            <button
                              onClick={() => setPageLayoutMode('dual')}
                              className={`py-2 rounded-lg text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 ${
                                pageLayoutMode === 'dual' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <Columns className="w-3.5 h-3.5" />
                              <span>Modo Livro (2C)</span>
                            </button>
                            <button
                              onClick={() => setPageLayoutMode('continuous')}
                              className={`py-2 rounded-lg text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 ${
                                pageLayoutMode === 'continuous' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <MoveVertical className="w-3.5 h-3.5" />
                              <span>Contínuo</span>
                            </button>
                          </div>
                        </div>

                        {/* 1. Tamanho da Fonte */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="font-bold flex items-center gap-1.5">
                              <Type className="w-3.5 h-3.5 text-amber-500" /> Tamanho da Fonte
                            </span>
                            <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-extrabold text-[11px]">
                              {fontSize}px
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 shrink-0 flex items-center justify-center border border-slate-700"
                              title="Diminuir Fonte"
                            >
                              A-
                            </button>
                            <input
                              type="range"
                              min={12}
                              max={32}
                              step={1}
                              value={fontSize}
                              onChange={(e) => setFontSize(Number(e.target.value))}
                              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                            />
                            <button
                              onClick={() => setFontSize(Math.min(32, fontSize + 1))}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 shrink-0 flex items-center justify-center border border-slate-700"
                              title="Aumentar Fonte"
                            >
                              A+
                            </button>
                          </div>
                        </div>

                        {/* 2. Espaçamento entre Linhas */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="font-bold flex items-center gap-1.5">
                              <MoveVertical className="w-3.5 h-3.5 text-amber-500" /> Espaçamento de Linhas
                            </span>
                            <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-extrabold text-[11px]">
                              {lineHeight.toFixed(1)}x
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold w-6 text-right">1.2</span>
                            <input
                              type="range"
                              min={1.2}
                              max={2.6}
                              step={0.1}
                              value={lineHeight}
                              onChange={(e) => setLineHeight(Number(e.target.value))}
                              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                            />
                            <span className="text-[10px] text-slate-500 font-bold w-6">2.6</span>
                          </div>
                        </div>

                        {/* 3. Margens Laterais */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="font-bold flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5 text-amber-500" /> Margens Laterais
                            </span>
                            <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-extrabold text-[11px]">
                              {sideMargin}px
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold w-6 text-right">0px</span>
                            <input
                              type="range"
                              min={0}
                              max={64}
                              step={4}
                              value={sideMargin}
                              onChange={(e) => setSideMargin(Number(e.target.value))}
                              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                            />
                            <span className="text-[10px] text-slate-500 font-bold w-6">64px</span>
                          </div>
                        </div>

                        {/* 4. Tipo de Fonte */}
                        <div className="space-y-1.5 pt-1">
                          <span className="font-bold text-slate-300 block">Família de Fonte</span>
                          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => setFontFamily('serif')}
                              className={`py-1.5 rounded-lg text-xs font-serif font-bold transition-colors ${
                                fontFamily === 'serif' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Serifada
                            </button>
                            <button
                              onClick={() => setFontFamily('sans')}
                              className={`py-1.5 rounded-lg text-xs font-sans font-bold transition-colors ${
                                fontFamily === 'sans' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Moderna
                            </button>
                            <button
                              onClick={() => setFontFamily('mono')}
                              className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                                fontFamily === 'mono' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Código
                            </button>
                          </div>
                        </div>

                        {/* 5. Tema de Leitura */}
                        <div className="space-y-1.5 pt-1">
                          <span className="font-bold text-slate-300 block">Tema do Leitor</span>
                          <div className="grid grid-cols-4 gap-1.5">
                            <button
                              onClick={() => setReaderTheme('dark')}
                              className={`py-1.5 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
                                readerTheme === 'dark' ? 'border-amber-500 bg-slate-950 text-amber-400 ring-2 ring-amber-500/30' : 'border-slate-800 bg-slate-950 text-slate-400'
                              }`}
                            >
                              Escuro
                            </button>
                            <button
                              onClick={() => setReaderTheme('sepia')}
                              className={`py-1.5 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
                                readerTheme === 'sepia' ? 'border-amber-600 bg-[#f8f1e3] text-[#433422] ring-2 ring-amber-600/30' : 'border-slate-800 bg-[#f8f1e3]/20 text-amber-200/70'
                              }`}
                            >
                              Sépia
                            </button>
                            <button
                              onClick={() => setReaderTheme('light')}
                              className={`py-1.5 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
                                readerTheme === 'light' ? 'border-amber-500 bg-amber-50 text-slate-900 ring-2 ring-amber-500/30' : 'border-slate-800 bg-slate-100/10 text-slate-300'
                              }`}
                            >
                              Claro
                            </button>
                            <button
                              onClick={() => setReaderTheme('night')}
                              className={`py-1.5 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
                                readerTheme === 'night' ? 'border-sky-500 bg-[#0f172a] text-sky-400 ring-2 ring-sky-500/30' : 'border-slate-800 bg-[#0f172a] text-slate-400'
                              }`}
                            >
                              Noite
                            </button>
                          </div>
                        </div>

                        {/* 6. Idioma e Tradução em Tempo Real */}
                        <div className="space-y-2 pt-1 border-t border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-amber-500" /> Idioma do E-Book
                            </span>
                            {isTranslatingChapter && (
                              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> A traduzir...
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <select
                              value={readerLanguage}
                              onChange={(e) => {
                                const newLang = e.target.value;
                                setReaderLanguage(newLang);
                                if (newLang !== 'pt' && translationDisplayMode === 'original') {
                                  setTranslationDisplayMode('translated');
                                }
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                            >
                              {READER_LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                                  {l.flag} {l.name} ({l.nativeName})
                                </option>
                              ))}
                            </select>
                          </div>

                          {readerLanguage !== 'pt' && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[11px] text-slate-400 font-medium">Modo de Exibição</span>
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  onClick={() => setTranslationDisplayMode('translated')}
                                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                                    translationDisplayMode === 'translated'
                                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  Texto Traduzido
                                </button>
                                <button
                                  onClick={() => setTranslationDisplayMode('bilingual')}
                                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                                    translationDisplayMode === 'bilingual'
                                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  Bilíngue (Lado a Lado)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer / Reset */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 italic">✓ Salvo no localStorage</span>
                          <button
                            onClick={resetReaderPrefs}
                            className="text-slate-400 hover:text-amber-400 transition-colors text-[11px] font-bold flex items-center gap-1"
                            title="Restaurar valores padrão"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restaurar Padrões</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Configuração de Atalhos de Teclado e Gestos de Toque */
                      <div className="space-y-4 text-xs">
                        {/* Banner de Captura de Tecla Ativo */}
                        {recordingAction && (
                          <div className="p-3 bg-amber-500/20 border-2 border-amber-500 rounded-2xl text-amber-300 font-bold text-center animate-pulse space-y-1">
                            <p className="text-xs">⌨️ A aguardar pressão de tecla...</p>
                            <p className="text-[10px] text-amber-400/80 font-normal">
                              Pressione qualquer tecla para reatribuir o atalho ou pressione <kbd className="px-1 py-0.5 bg-slate-900 rounded border border-amber-500/50">ESC</kbd> para cancelar.
                            </p>
                          </div>
                        )}

                        {/* Seção 1: Atalhos de Teclado */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-amber-400 flex items-center gap-1.5 text-xs">
                              <Keyboard className="w-4 h-4 text-amber-500" /> Atalhos de Teclado
                            </span>
                            <span className="text-[10px] text-slate-400">Clique para alterar</span>
                          </div>

                          <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                            {/* Virar Página Seguinte */}
                            <div className="flex items-center justify-between py-1 border-b border-slate-900">
                              <span className="text-slate-300 font-medium">Virar Página Seguinte:</span>
                              <button
                                onClick={() => setRecordingAction('nextPage')}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all border ${
                                  recordingAction === 'nextPage'
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-bounce'
                                    : 'bg-slate-900 text-amber-300 border-slate-700 hover:border-amber-500 hover:bg-slate-800'
                                }`}
                              >
                                {recordingAction === 'nextPage' ? 'A Pressionar...' : formatKeyDisplay(shortcutsConfig.nextPage)}
                              </button>
                            </div>

                            {/* Virar Página Anterior */}
                            <div className="flex items-center justify-between py-1 border-b border-slate-900">
                              <span className="text-slate-300 font-medium">Virar Página Anterior:</span>
                              <button
                                onClick={() => setRecordingAction('prevPage')}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all border ${
                                  recordingAction === 'prevPage'
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-bounce'
                                    : 'bg-slate-900 text-amber-300 border-slate-700 hover:border-amber-500 hover:bg-slate-800'
                                }`}
                              >
                                {recordingAction === 'prevPage' ? 'A Pressionar...' : formatKeyDisplay(shortcutsConfig.prevPage)}
                              </button>
                            </div>

                            {/* Alternar Layout de Exibição */}
                            <div className="flex items-center justify-between py-1 border-b border-slate-900">
                              <span className="text-slate-300 font-medium">Alternar Modo Exibição:</span>
                              <button
                                onClick={() => setRecordingAction('toggleLayout')}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all border ${
                                  recordingAction === 'toggleLayout'
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-bounce'
                                    : 'bg-slate-900 text-amber-300 border-slate-700 hover:border-amber-500 hover:bg-slate-800'
                                }`}
                              >
                                {recordingAction === 'toggleLayout' ? 'A Pressionar...' : formatKeyDisplay(shortcutsConfig.toggleLayout)}
                              </button>
                            </div>

                            {/* Alternar Modo Zen */}
                            <div className="flex items-center justify-between py-1 border-b border-slate-900">
                              <span className="text-slate-300 font-medium">Alternar Modo Zen:</span>
                              <button
                                onClick={() => setRecordingAction('toggleZen')}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all border ${
                                  recordingAction === 'toggleZen'
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-bounce'
                                    : 'bg-slate-900 text-amber-300 border-slate-700 hover:border-amber-500 hover:bg-slate-800'
                                }`}
                              >
                                {recordingAction === 'toggleZen' ? 'A Pressionar...' : formatKeyDisplay(shortcutsConfig.toggleZen)}
                              </button>
                            </div>

                            {/* Marcar Página */}
                            <div className="flex items-center justify-between py-1">
                              <span className="text-slate-300 font-medium">Marcar / Guardar Página:</span>
                              <button
                                onClick={() => setRecordingAction('toggleBookmark')}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all border ${
                                  recordingAction === 'toggleBookmark'
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-bounce'
                                    : 'bg-slate-900 text-amber-300 border-slate-700 hover:border-amber-500 hover:bg-slate-800'
                                }`}
                              >
                                {recordingAction === 'toggleBookmark' ? 'A Pressionar...' : formatKeyDisplay(shortcutsConfig.toggleBookmark)}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Seção 2: Gestos de Toque no Ecrã */}
                        <div className="space-y-2 pt-1">
                          <span className="font-extrabold text-amber-400 flex items-center gap-1.5 text-xs">
                            <Smartphone className="w-4 h-4 text-amber-500" /> Gestos de Toque (Mobile & Touch)
                          </span>

                          <div className="space-y-2.5 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                            {/* Swipe Left */}
                            <div className="space-y-1">
                              <label className="text-slate-300 font-medium block">Deslizar para a Esquerda (← Swipe):</label>
                              <select
                                value={gesturesConfig.swipeLeft}
                                onChange={(e) => setGesturesConfig(prev => ({ ...prev, swipeLeft: e.target.value as any }))}
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-slate-200 font-bold focus:ring-1 focus:ring-amber-500"
                              >
                                <option value="next_page">Virar para Página Seguinte</option>
                                <option value="prev_page">Voltar à Página Anterior</option>
                                <option value="toggle_layout">Alternar Modo de Exibição</option>
                                <option value="toggle_zen">Alternar Modo Zen</option>
                                <option value="bookmark">Marcar Página</option>
                                <option value="none">Desativado / Nenhuma Ação</option>
                              </select>
                            </div>

                            {/* Swipe Right */}
                            <div className="space-y-1">
                              <label className="text-slate-300 font-medium block">Deslizar para a Direita (Swipe →):</label>
                              <select
                                value={gesturesConfig.swipeRight}
                                onChange={(e) => setGesturesConfig(prev => ({ ...prev, swipeRight: e.target.value as any }))}
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-slate-200 font-bold focus:ring-1 focus:ring-amber-500"
                              >
                                <option value="prev_page">Voltar à Página Anterior</option>
                                <option value="next_page">Virar para Página Seguinte</option>
                                <option value="toggle_layout">Alternar Modo de Exibição</option>
                                <option value="toggle_zen">Alternar Modo Zen</option>
                                <option value="bookmark">Marcar Página</option>
                                <option value="none">Desativado / Nenhuma Ação</option>
                              </select>
                            </div>

                            {/* Double Tap */}
                            <div className="space-y-1">
                              <label className="text-slate-300 font-medium block">Toque Duplo Rápido / Duplo Clique na Leitura:</label>
                              <select
                                value={gesturesConfig.doubleTap}
                                onChange={(e) => setGesturesConfig(prev => ({ ...prev, doubleTap: e.target.value as any }))}
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-slate-200 font-bold focus:ring-1 focus:ring-amber-500"
                              >
                                <option value="toggle_zen">Alternar Modo Zen (Ocultar todas as barras e botões)</option>
                                <option value="toggle_layout">Alternar Modo de Exibição (Único / Livro / Contínuo)</option>
                                <option value="bookmark">Marcar / Desmarcar Página</option>
                                <option value="next_page">Avançar Página</option>
                                <option value="none">Desativado / Nenhuma Ação</option>
                              </select>
                            </div>

                            {/* Long Press */}
                            <div className="space-y-1">
                              <label className="text-slate-300 font-medium block">Pressionar Prolongado no Centro (1s):</label>
                              <select
                                value={gesturesConfig.longPress}
                                onChange={(e) => setGesturesConfig(prev => ({ ...prev, longPress: e.target.value as any }))}
                                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-[11px] text-slate-200 font-bold focus:ring-1 focus:ring-amber-500"
                              >
                                <option value="toggle_immersion">Alternar Modo Imersão Total</option>
                                <option value="bookmark">Marcar Página</option>
                                <option value="toggle_zen">Alternar Modo Zen</option>
                                <option value="toggle_layout">Alternar Modo de Exibição</option>
                                <option value="none">Desativado / Nenhuma Ação</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Footer / Reset Shortcuts & Gestures */}
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 italic">✓ Atalhos salvos no dispositivo</span>
                          <button
                            onClick={resetShortcutsAndGestures}
                            className="text-slate-400 hover:text-amber-400 transition-colors text-[11px] font-bold flex items-center gap-1"
                            title="Restaurar atalhos e gestos padrão"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restaurar Atalhos Padrão</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Toggle Bookmark Action */}
              <button
                onClick={() => toggleBookmark()}
                className={`p-2 rounded-xl hover:bg-current/10 transition-colors flex items-center gap-1.5 ${
                  isCurrentChapterBookmarked ? 'text-amber-500 font-bold bg-amber-500/10' : ''
                }`}
                title={isCurrentChapterBookmarked ? 'Remover Marcador de Leitura' : 'Marcar esta Página/Capítulo'}
              >
                <Bookmark className={`w-4 h-4 ${isCurrentChapterBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span className="hidden md:inline text-xs font-bold">
                  {isCurrentChapterBookmarked ? 'Marcado ★' : 'Marcar Página'}
                </span>
              </button>

              {/* Ver Lista de Marcadores Drawer Button */}
              <button
                onClick={() => {
                  setShowToc(!showToc || drawerTab !== 'bookmarks');
                  setDrawerTab('bookmarks');
                }}
                className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                  showToc && drawerTab === 'bookmarks' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'hover:bg-current/10'
                }`}
                title="Abrir Lista de Marcadores deste livro"
              >
                <div className="relative flex items-center">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  {currentBookBookmarks.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-slate-900">
                      {currentBookBookmarks.length}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-bold">Marcadores</span>
              </button>

              {/* In-Book Full Text Search Toolbar Button */}
              <button
                onClick={() => {
                  setShowInBookSearch(!showInBookSearch);
                }}
                className={`p-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  showInBookSearch ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'hover:bg-current/10'
                }`}
                title="Pesquisar Palavras ou Frases no Texto do Livro"
              >
                <div className="relative flex items-center">
                  <Search className={`w-4 h-4 ${showInBookSearch ? 'text-slate-950' : 'text-amber-400'}`} />
                  {bookSearchMatches.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-full border border-slate-900">
                      {bookSearchMatches.length}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold">
                  {showInBookSearch ? 'Pesquisa Ativa' : 'Pesquisar'}
                </span>
              </button>

              {/* Hidden EPUB File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".epub" 
                className="hidden" 
                onChange={handleEpubFileChange} 
              />

              {/* Upload .EPUB Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsingEpub}
                className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm disabled:opacity-50"
                title="Carregar Ficheiro .EPUB Próprio"
              >
                {isParsingEpub ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-purple-300" />
                )}
                <span className="hidden sm:inline">
                  {isParsingEpub ? 'A Processar...' : 'Carregar .EPUB'}
                </span>
              </button>

              {/* Offline SW Cache Button */}
              <button
                onClick={() => {
                  if (isOfflineCached) {
                    removeBookFromOffline(book.id);
                  } else {
                    downloadBookForOffline(book);
                  }
                }}
                className={`p-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  isOfflineCached 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md hover:bg-emerald-400' 
                    : 'bg-current/10 hover:bg-amber-500 hover:text-slate-950'
                }`}
                title={isOfflineCached ? 'E-book Guardado no Cache SW (Clica para remover do cache offline)' : 'Guardar no Cache Service Worker para Leitura Offline'}
              >
                <Zap className={`w-4 h-4 ${isOfflineCached ? 'fill-current text-slate-950' : 'text-amber-500'}`} />
                <span className="hidden lg:inline text-xs font-bold">
                  {isOfflineCached ? 'Offline Pronto ⚡' : 'Salvar SW Offline'}
                </span>
              </button>

              {/* Firestore Cloud Sync Button */}
              <button
                onClick={() => triggerCloudSync()}
                disabled={cloudSyncStatus === 'syncing'}
                className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold ${
                  cloudSyncStatus === 'syncing'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : cloudSyncStatus === 'synced'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                }`}
                title={`Sincronização Cloud Firestore: ${
                  cloudSyncStatus === 'syncing' ? 'A sincronizar...' : cloudSyncStatus === 'synced' ? 'Sincronizado na nuvem' : 'Clique para sincronizar'
                }`}
              >
                {cloudSyncStatus === 'syncing' ? (
                  <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                ) : cloudSyncStatus === 'offline' ? (
                  <CloudOff className="w-4 h-4 text-amber-400" />
                ) : (
                  <Cloud className="w-4 h-4 text-emerald-400" />
                )}
                <span className="hidden xl:inline">
                  {cloudSyncStatus === 'syncing' ? 'A Sincronizar...' : cloudSyncStatus === 'synced' ? 'Nuvem OK ☁️' : 'Sincronizar'}
                </span>
              </button>

              {/* Download File */}
              <button
                onClick={handleDownloadFile}
                className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
                title="Descarregar E-book (TXT/PDF)"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Close Modal */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Floating In-Book Search Control Panel Bar */}
        {showInBookSearch && !isTotalImmersion && (
          <div className="bg-slate-950/95 border-b border-amber-500/40 backdrop-blur-xl px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-white shadow-2xl z-30 animate-in slide-in-from-top-2 shrink-0">
            {/* Left: Input with icon */}
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inBookSearchQuery}
                  onChange={(e) => setInBookSearchQuery(e.target.value)}
                  placeholder="Pesquisar termo ou expressão no e-book..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-medium shadow-inner"
                  autoFocus
                />
                {inBookSearchQuery && (
                  <button
                    onClick={() => setInBookSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg"
                    title="Limpar texto pesquisado"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Center: Scope Toggle + Counter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center p-0.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-bold">
                <button
                  onClick={() => setSearchScope('chapter')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    searchScope === 'chapter' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Capítulo Atual
                </button>
                <button
                  onClick={() => setSearchScope('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    searchScope === 'all' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todo o Livro
                </button>
              </div>

              {inBookSearchQuery.trim().length >= 2 && (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30 whitespace-nowrap shadow-xs">
                  {bookSearchMatches.length === 0
                    ? 'Sem resultados'
                    : `${activeMatchIndex + 1} de ${bookSearchMatches.length} ocorrência${bookSearchMatches.length === 1 ? '' : 's'}`}
                </span>
              )}
            </div>

            {/* Right: Prev / Next Match Navigation & Drawer View */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevSearchMatch}
                disabled={bookSearchMatches.length === 0}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-slate-200 flex items-center gap-1 text-xs font-bold transition-all shadow-xs"
                title="Ir para ocorrência anterior"
              >
                <ChevronUp className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <button
                onClick={handleNextSearchMatch}
                disabled={bookSearchMatches.length === 0}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-slate-200 flex items-center gap-1 text-xs font-bold transition-all shadow-xs"
                title="Ir para próxima ocorrência"
              >
                <ChevronDown className="w-4 h-4" />
                <span className="hidden sm:inline">Próxima</span>
              </button>

              <button
                onClick={() => {
                  setShowToc(true);
                  setDrawerTab('search');
                }}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors text-xs font-bold flex items-center gap-1"
                title="Ver todas as ocorrências em lista lateral"
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline">Ver Lista ({bookSearchMatches.length})</span>
              </button>

              <button
                onClick={() => {
                  setShowInBookSearch(false);
                  setInBookSearchQuery('');
                }}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors ml-1"
                title="Fechar Painel de Busca"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content Body Container */}
        <div className="flex-1 overflow-hidden relative flex">

          {/* Floating Exit Zen Button & Minimal Toolbar in Zen Mode */}
          {isZenMode && !isTotalImmersion && (
            <div className="absolute top-4 right-6 z-40 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <span className="hidden sm:inline text-[11px] font-bold text-amber-400/90 bg-slate-950/80 px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                ✨ Modo Zen • Duplo clique para sair
              </span>
              <button
                onClick={toggleNightMode}
                className={`p-1.5 rounded-full backdrop-blur-md font-bold text-xs transition-all border ${
                  readerTheme === 'night'
                    ? 'bg-sky-500 text-slate-950 border-sky-400'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-sky-300 border-slate-700'
                }`}
                title={readerTheme === 'night' ? 'Desativar Modo Leitura Noturna' : 'Ativar Modo Leitura Noturna'}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                className="p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-amber-300 border border-slate-700 backdrop-blur-md font-bold text-xs"
                title="Diminuir Fonte"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(Math.min(32, fontSize + 1))}
                className="p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-amber-300 border border-slate-700 backdrop-blur-md font-bold text-xs"
                title="Aumentar Fonte"
              >
                A+
              </button>
              <button
                onClick={toggleZenMode}
                className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
                title="Sair do Modo Zen (Duplo clique ou ESC)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Sair Zen</span>
              </button>
            </div>
          )}

          {/* Table of Contents & Bookmarks Drawer */}
          {showToc && !isZenMode && !isTotalImmersion && (
            <div className="w-72 sm:w-80 border-r border-current/10 bg-slate-900/95 backdrop-blur-xl p-4 overflow-y-auto space-y-4 z-30 text-white shadow-2xl shrink-0">
              {/* Drawer Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setDrawerTab('chapters')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    drawerTab === 'chapters' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Capítulos ({chapters.length})</span>
                </button>
                <button
                  onClick={() => setDrawerTab('bookmarks')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    drawerTab === 'bookmarks' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>Marcadores ({currentBookBookmarks.length})</span>
                </button>
                <button
                  onClick={() => setDrawerTab('highlights')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    drawerTab === 'highlights' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Realces ({currentBookHighlights.length})</span>
                </button>
                <button
                  onClick={() => setDrawerTab('search')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    drawerTab === 'search' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Busca ({bookSearchMatches.length})</span>
                </button>
              </div>

              {drawerTab === 'chapters' ? (
                <div className="space-y-1.5">
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-2 px-1">Índice de Leitura</h3>
                  {chapters.map((chap, idx) => {
                    const hasBkm = isChapterBookmarked(book.id, idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentChapterIndex(idx);
                          setShowToc(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
                          currentChapterIndex === idx 
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg' 
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate pr-2">{chap.title}</span>
                        {hasBkm && <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : drawerTab === 'bookmarks' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 px-1">Marcadores Guardados</h3>
                    <button
                      onClick={() => toggleBookmark()}
                      className="text-[10px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isCurrentChapterBookmarked ? 'Remover Atual' : 'Marcar Página Atual'}</span>
                    </button>
                  </div>

                  {/* Search Filter for Bookmarks */}
                  {currentBookBookmarks.length > 0 && (
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Pesquisar marcadores e notas..."
                        value={bookmarkSearchQuery}
                        onChange={(e) => setBookmarkSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 text-xs text-slate-200 pl-8 pr-7 py-2 rounded-xl border border-slate-800 focus:border-amber-500/70 focus:outline-none"
                      />
                      {bookmarkSearchQuery && (
                        <button
                          onClick={() => setBookmarkSearchQuery('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}

                  {currentBookBookmarks.length === 0 ? (
                    <div className="p-6 text-center bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-2">
                      <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400 font-medium">Ainda não marcou nenhuma página neste e-book.</p>
                      <button
                        onClick={() => toggleBookmark()}
                        className="mt-2 text-xs font-bold text-amber-400 underline hover:text-amber-300"
                      >
                        Guardar marcador no capítulo atual
                      </button>
                    </div>
                  ) : filteredBookBookmarks.length === 0 ? (
                    <div className="p-4 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400">
                      Nenhum marcador encontrado para "{bookmarkSearchQuery}".
                    </div>
                  ) : (
                    filteredBookBookmarks.map((bkm) => {
                      const isEditing = editingBookmarkId === bkm.id;
                      return (
                        <div
                          key={bkm.id}
                          className="p-3 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-2 relative group hover:border-amber-400 transition-colors shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <button
                              onClick={() => {
                                setCurrentChapterIndex(bkm.chapterIndex);
                                setShowToc(false);
                              }}
                              className="text-left font-bold text-xs text-amber-300 hover:underline line-clamp-1 flex-1 flex items-center gap-1.5"
                            >
                              <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                              <span>{bkm.chapterTitle}</span>
                            </button>
                            <button
                              onClick={() => removeBookmark(bkm.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors shrink-0"
                              title="Remover Marcador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {bkm.snippet && (
                            <p className="text-[11px] text-slate-300 italic bg-slate-900 p-2 rounded-xl border border-slate-800/80 line-clamp-2">
                              "{bkm.snippet}"
                            </p>
                          )}

                          {/* Note / Comment Section */}
                          {isEditing ? (
                            <div className="space-y-1.5 pt-1">
                              <textarea
                                value={editingNoteText}
                                onChange={(e) => setEditingNoteText(e.target.value)}
                                placeholder="Adicione uma nota ou reflexão sobre este capítulo..."
                                className="w-full text-xs p-2 rounded-xl bg-slate-900 border border-amber-500/50 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingBookmarkId(null);
                                    setEditingNoteText('');
                                  }}
                                  className="px-2 py-1 rounded-lg text-[10px] text-slate-400 hover:bg-slate-800"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => {
                                    updateBookmarkNote(bkm.id, editingNoteText);
                                    setEditingBookmarkId(null);
                                    setEditingNoteText('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                                >
                                  Guardar Nota
                                </button>
                              </div>
                            </div>
                          ) : bkm.note ? (
                            <div className="flex items-start justify-between gap-1 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-[11px] text-amber-200/90">
                              <div className="flex items-start gap-1 flex-1">
                                <MessageSquare className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                                <span className="break-words">{bkm.note}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setEditingBookmarkId(bkm.id);
                                  setEditingNoteText(bkm.note || '');
                                }}
                                className="text-[10px] text-amber-400 hover:underline shrink-0 font-bold pl-1"
                              >
                                Editar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingBookmarkId(bkm.id);
                                setEditingNoteText('');
                              }}
                              className="text-[10px] text-slate-500 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors pt-0.5"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Adicionar nota pessoal</span>
                            </button>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-900">
                            <span>{new Date(bkm.createdAt).toLocaleDateString('pt-AO')}</span>
                            <button
                              onClick={() => {
                                setCurrentChapterIndex(bkm.chapterIndex);
                                setShowToc(false);
                              }}
                              className="text-amber-400 font-bold flex items-center gap-1 hover:underline text-[11px]"
                            >
                              <span>Ir para leitura</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : drawerTab === 'highlights' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                      Realces Coloridos ({filteredBookHighlights.length})
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <Cloud className="w-3 h-3" /> Firestore
                    </span>
                  </div>

                  {/* Search and Color Filter for Highlights */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={highlightSearchQuery}
                        onChange={(e) => setHighlightSearchQuery(e.target.value)}
                        placeholder="Pesquisar nos realces..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                      <button
                        onClick={() => setHighlightFilterColor('all')}
                        className={`px-2 py-0.5 rounded-lg font-bold border transition-colors shrink-0 ${
                          highlightFilterColor === 'all' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => setHighlightFilterColor('yellow')}
                        className={`px-2 py-0.5 rounded-lg font-bold border transition-colors shrink-0 ${
                          highlightFilterColor === 'yellow' ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-950 border-slate-800 text-amber-300'
                        }`}
                      >
                        🟡 Amarelo
                      </button>
                      <button
                        onClick={() => setHighlightFilterColor('green')}
                        className={`px-2 py-0.5 rounded-lg font-bold border transition-colors shrink-0 ${
                          highlightFilterColor === 'green' ? 'bg-emerald-400 text-slate-950 border-emerald-300' : 'bg-slate-950 border-slate-800 text-emerald-300'
                        }`}
                      >
                        🟢 Verde
                      </button>
                      <button
                        onClick={() => setHighlightFilterColor('blue')}
                        className={`px-2 py-0.5 rounded-lg font-bold border transition-colors shrink-0 ${
                          highlightFilterColor === 'blue' ? 'bg-sky-400 text-slate-950 border-sky-300' : 'bg-slate-950 border-slate-800 text-sky-300'
                        }`}
                      >
                        🔵 Azul
                      </button>
                      <button
                        onClick={() => setHighlightFilterColor('pink')}
                        className={`px-2 py-0.5 rounded-lg font-bold border transition-colors shrink-0 ${
                          highlightFilterColor === 'pink' ? 'bg-pink-400 text-slate-950 border-pink-300' : 'bg-slate-950 border-slate-800 text-pink-300'
                        }`}
                      >
                        🩷 Rosa
                      </button>
                      <button
                        onClick={() => setHighlightFilterColor('purple')}
                        className={`px-2 py-0.5 rounded-lg font-bold border transition-colors shrink-0 ${
                          highlightFilterColor === 'purple' ? 'bg-purple-400 text-slate-950 border-purple-300' : 'bg-slate-950 border-slate-800 text-purple-300'
                        }`}
                      >
                        🟣 Roxo
                      </button>
                    </div>
                  </div>

                  {currentBookHighlights.length === 0 ? (
                    <div className="p-4 text-center bg-slate-950/40 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-400">
                      <Highlighter className="w-8 h-8 text-amber-500/50 mx-auto" />
                      <p className="font-semibold text-slate-300">Sem realces neste livro</p>
                      <p className="text-[11px] text-slate-500">Selecione qualquer trecho no texto e escolha uma cor para destacar e guardar na nuvem.</p>
                    </div>
                  ) : filteredBookHighlights.length === 0 ? (
                    <div className="p-4 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400">
                      Nenhum realce encontrado para os filtros selecionados.
                    </div>
                  ) : (
                    filteredBookHighlights.map((hl) => (
                      <div
                        key={hl.id}
                        className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 relative group hover:border-amber-500/40 transition-all shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full inline-block" style={{
                              backgroundColor: hl.color === 'green' ? '#10b981' : hl.color === 'blue' ? '#38bdf8' : hl.color === 'pink' ? '#f472b6' : hl.color === 'purple' ? '#c084fc' : '#fbbf24'
                            }} />
                            <span>{hl.chapterTitle || `Capítulo ${hl.chapterIndex + 1}`}</span>
                          </span>
                          <button
                            onClick={() => removeHighlight(hl.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors shrink-0"
                            title="Remover Realce"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <blockquote className={`text-xs p-2.5 rounded-xl border-l-3 ${
                          hl.color === 'green' ? 'border-emerald-400 bg-emerald-950/30 text-emerald-100' :
                          hl.color === 'blue' ? 'border-sky-400 bg-sky-950/30 text-sky-100' :
                          hl.color === 'pink' ? 'border-pink-400 bg-pink-950/30 text-pink-100' :
                          hl.color === 'purple' ? 'border-purple-400 bg-purple-950/30 text-purple-100' :
                          'border-amber-400 bg-amber-950/30 text-amber-100'
                        } italic font-serif leading-relaxed break-words`}>
                          "{hl.text}"
                        </blockquote>

                        {hl.note && (
                          <div className="flex items-start gap-1.5 bg-slate-900 p-2 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="break-words">{hl.note}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900 gap-1 flex-wrap">
                          <span>{new Date(hl.createdAt).toLocaleDateString('pt-AO')}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                const formatted = `"${hl.text}"\n\n— ${book.title}, ${book.author} (via Zola Books)`;
                                navigator.clipboard.writeText(formatted);
                                addNotification('Citação Copiada!', 'Texto copiado com autoria para a área de transferência.', 'success');
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 font-bold flex items-center gap-1 transition-colors border border-slate-800"
                              title="Copiar citação com autoria"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </button>

                            <button
                              onClick={() => {
                                setShowToc(false);
                                handleOpenQuoteCard(hl.text);
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center gap-1 transition-colors border border-amber-500/30"
                              title="Criar e partilhar cartão minimalista para redes sociais"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Partilhar</span>
                            </button>

                            <button
                              onClick={() => {
                                setCurrentChapterIndex(hl.chapterIndex);
                                setShowToc(false);
                              }}
                              className="text-amber-400 font-bold flex items-center gap-0.5 hover:underline pl-0.5"
                            >
                              <span>Ver</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                      Resultados da Busca ({bookSearchMatches.length})
                    </h3>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      {searchScope === 'chapter' ? 'Capítulo' : 'Todo o Livro'}
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inBookSearchQuery}
                      onChange={(e) => setInBookSearchQuery(e.target.value)}
                      placeholder="Pesquisar termo no texto..."
                      className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/70"
                    />
                    {inBookSearchQuery && (
                      <button
                        onClick={() => setInBookSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                        title="Limpar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {!inBookSearchQuery.trim() || inBookSearchQuery.trim().length < 2 ? (
                    <div className="p-5 text-center bg-slate-950/50 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-400">
                      <Search className="w-8 h-8 text-amber-500/40 mx-auto" />
                      <p className="font-bold text-slate-300">Digite 2 ou mais caracteres</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Os resultados serão destacados no e-book instantaneamente à medida que lê.
                      </p>
                    </div>
                  ) : bookSearchMatches.length === 0 ? (
                    <div className="p-5 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
                      Nenhuma ocorrência de "{inBookSearchQuery}" encontrada.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                      {bookSearchMatches.map((m) => {
                        const isActive = m.globalMatchIndex === activeMatchIndex;
                        const before = m.paragraphSnippet.substring(0, m.matchStartInPara);
                        const match = m.paragraphSnippet.substring(m.matchStartInPara, m.matchStartInPara + m.matchLength);
                        const after = m.paragraphSnippet.substring(m.matchStartInPara + m.matchLength);

                        return (
                          <div
                            key={`search-res-${m.globalMatchIndex}`}
                            onClick={() => {
                              setActiveMatchIndex(m.globalMatchIndex);
                              jumpToSearchMatch(m);
                            }}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                              isActive
                                ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                                : 'bg-slate-950 border-slate-800/80 hover:border-amber-500/40 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold">
                              <span className="truncate max-w-[170px]">{m.chapterTitle}</span>
                              <span className="text-slate-500 shrink-0">#{m.globalMatchIndex + 1}</span>
                            </div>

                            <p className="text-xs line-clamp-3 font-serif leading-relaxed italic text-slate-300">
                              "...{before.slice(-35)}
                              <mark className="bg-amber-400 text-slate-950 font-black px-1 py-0.5 rounded shadow-xs mx-0.5">
                                {match}
                              </mark>
                              {after.slice(0, 45)}..."
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Toast de Orientação da Imersão Total */}
          {isTotalImmersion && showImmersionToast && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-sky-500/60 text-sky-200 text-xs px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 pointer-events-none">
              <Maximize2 className="w-4 h-4 text-sky-400 animate-pulse" />
              <span><strong>Imersão Total:</strong> Toque e mantenha no centro (1s) para retornar aos controlos</span>
            </div>
          )}

          {/* Indicador de Pressão ao manter o centro premido para sair da Imersão Total */}
          {isHoldingCenter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs pointer-events-none">
              <div className="bg-slate-900/95 border border-sky-400 p-5 rounded-3xl text-center space-y-3 text-sky-300 shadow-2xl animate-in zoom-in-95">
                <div className="w-10 h-10 mx-auto rounded-full border-3 border-sky-400 border-t-transparent animate-spin" />
                <p className="text-xs font-black uppercase tracking-wider">A restaurar controlos do e-reader...</p>
              </div>
            </div>
          )}

          {/* Subtil Botão Flutuante de Saída Rápida da Imersão Total */}
          {isTotalImmersion && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
              <button
                onClick={() => {
                  setIsTotalImmersion(false);
                  addNotification('Saiu da Imersão Total', 'Controlos e barras do e-reader restaurados com sucesso.', 'system');
                }}
                className="opacity-40 hover:opacity-100 transition-opacity px-4 py-2 rounded-full bg-slate-900/90 border border-sky-500/40 text-sky-200 text-[11px] font-bold shadow-2xl backdrop-blur-md flex items-center gap-2"
                title="Toque rápido aqui ou mantenha o dedo 1s no centro do ecrã para restaurar as barras"
              >
                <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Sair da Imersão Total</span>
              </button>
            </div>
          )}

          {/* Toast de Orientação do Modo Zen */}
          {isZenMode && showZenToast && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-amber-500/60 text-amber-200 text-xs px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 pointer-events-none">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span><strong>Modo Zen:</strong> Dê um duplo clique na área de leitura ou pressione ESC para sair</span>
            </div>
          )}

          {/* Toast de Confirmação de Leitura Retomada */}
          {resumedNotice && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
              <Bookmark className="w-3.5 h-3.5 fill-slate-950" />
              <span>{resumedNotice}</span>
            </div>
          )}

          {/* Reading Canvas Text Area */}
          <div 
            ref={contentScrollRef}
            onScroll={handleContainerScroll}
            onDoubleClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('select')) return;
              toggleZenMode();
            }}
            onMouseUp={(e) => {
              handleTextSelection();
              cancelLongPress();
            }}
            onMouseDown={startLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={handleTouchStartCanvas}
            onTouchEnd={handleTouchEndCanvas}
            onTouchCancel={cancelLongPress}
            onKeyUp={handleTextSelection}
            className={`flex-1 overflow-y-auto ${
              isTotalImmersion 
                ? 'p-8 sm:p-20 md:p-32' 
                : isZenMode 
                  ? 'p-8 sm:p-20 md:p-28' 
                  : 'p-6 sm:p-12'
            } space-y-6 selection:bg-amber-500/30 selection:text-amber-200`}
          >
            <div 
              className={`mx-auto space-y-8 transition-all ${isTotalImmersion || isZenMode ? 'max-w-3xl' : 'max-w-2xl'}`}
              style={{ paddingLeft: `${sideMargin}px`, paddingRight: `${sideMargin}px` }}
            >
              
              <div className="border-b border-current/10 pb-4">
                {isCurrentChapterBookmarked && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-3 flex items-center justify-between bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-2xl text-xs text-amber-400 font-bold shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                      <span>Página Marcada na sua Biblioteca</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowToc(true);
                        setDrawerTab('bookmarks');
                      }}
                      className="text-[11px] underline hover:text-amber-300 transition-colors shrink-0"
                    >
                      Ver Marcadores
                    </button>
                  </motion.div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                    {book.author} — {book.publishedYear}
                  </span>
                  {isTotalImmersion ? (
                    <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 animate-pulse" /> Imersão Total
                    </span>
                  ) : isZenMode ? (
                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Modo Zen
                    </span>
                  ) : null}
                </div>
                <h1 className={`font-black mt-1 ${isTotalImmersion || isZenMode ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>
                  {currentChapterDisplayTitle}
                </h1>
              </div>

              {/* Real-time Chapter Translation Status Banner */}
              {readerLanguage !== 'pt' && (
                <div className="space-y-3">
                  {isTranslatingChapter ? (
                    <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-300">
                            A traduzir capítulo para {READER_LANGUAGES.find(l => l.code === readerLanguage)?.nativeName} em tempo real...
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Gemini 3.7 Flash a preservar estrutura de parágrafos, diálogos e fidelidade literária.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setReaderLanguage('pt')}
                        className="text-[11px] font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : translationError ? (
                    <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-rose-300">
                        <Info className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Erro na tradução: {translationError}</span>
                      </div>
                      <button
                        onClick={() => translateCurrentChapter(true)}
                        className="px-3 py-1 bg-rose-500 text-slate-950 font-bold rounded-xl hover:bg-rose-400 transition-colors shrink-0 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Tentar Novamente
                      </button>
                    </div>
                  ) : activeChapterTranslation ? (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2.5 text-xs text-amber-300">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{READER_LANGUAGES.find(l => l.code === readerLanguage)?.flag}</span>
                        <span className="font-bold">
                          Traduzido para {READER_LANGUAGES.find(l => l.code === readerLanguage)?.name}
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase">
                          {translationDisplayMode === 'bilingual' ? 'Modo Bilíngue (Lado a Lado)' : 'Tradução Fluida'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setTranslationDisplayMode(translationDisplayMode === 'bilingual' ? 'translated' : 'bilingual')}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1"
                          title="Alternar entre modo bilíngue ou leitura contínua traduzida"
                        >
                          <Columns className="w-3 h-3 text-amber-400" />
                          <span>{translationDisplayMode === 'bilingual' ? 'Ver só Tradução' : 'Modo Bilíngue'}</span>
                        </button>
                        <button
                          onClick={() => setReaderLanguage('pt')}
                          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-all flex items-center gap-1"
                          title="Restaurar texto original em Português"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Original (PT)</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <div 
                className={`leading-relaxed space-y-6 transition-all ${getFontFamilyClass()}`}
                style={{ fontSize: `${isTotalImmersion || isZenMode ? fontSize + 2 : fontSize}px`, lineHeight: `${lineHeight}` }}
              >
                {rawParagraphs.map((origPara, idx) => {
                  const isCurrentPara = idx === currentSpeakingParagraphIndex;
                  const translatedPara = activeChapterTranslation?.translatedParagraphs?.[idx];
                  const displayedText = (isTranslatedMode && translatedPara) ? translatedPara : origPara;

                  if (isBilingualMode && translatedPara) {
                    return (
                      <div
                        key={idx}
                        id={`reader-paragraph-${idx}`}
                        className={`group relative transition-all duration-300 rounded-2xl p-4 border space-y-3 ${
                          isCurrentPara
                            ? 'bg-amber-500/15 border-amber-500 shadow-xl ring-1 ring-amber-500/30'
                            : 'bg-current/5 border-current/10 hover:border-amber-500/30'
                        }`}
                      >
                        {/* Original Paragraph Block */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-wider text-slate-400">
                            <span className="flex items-center gap-1">
                              <span>🇦🇴</span> Original (Português)
                            </span>
                          </div>
                          <p 
                            onDoubleClick={() => handleParagraphDoubleClick(origPara)}
                            className="whitespace-pre-line cursor-pointer opacity-80"
                          >
                            {renderParagraphWithHighlights(origPara, currentChapterHighlights, idx)}
                          </p>
                        </div>

                        {/* Translated Paragraph Block */}
                        <div className="pt-3 border-t border-current/10 space-y-1">
                          <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-wider text-amber-400">
                            <span className="flex items-center gap-1">
                              <span>{READER_LANGUAGES.find(l => l.code === readerLanguage)?.flag}</span> 
                              Tradução ({READER_LANGUAGES.find(l => l.code === readerLanguage)?.name})
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => playParagraph(idx)}
                                className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-300 transition-colors"
                                title="Ouvir parágrafo traduzido"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p 
                            onDoubleClick={() => handleParagraphDoubleClick(translatedPara)}
                            className="whitespace-pre-line cursor-pointer font-medium"
                          >
                            {translatedPara}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      id={`reader-paragraph-${idx}`}
                      className={`group relative transition-all duration-300 rounded-2xl ${
                        isCurrentPara 
                          ? 'bg-amber-500/15 border-l-4 border-amber-500 p-4 shadow-xl ring-1 ring-amber-500/30' 
                          : 'hover:bg-current/5 p-2 -mx-2'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p 
                          onDoubleClick={() => handleParagraphDoubleClick(displayedText)}
                          className="flex-1 whitespace-pre-line cursor-pointer selection:bg-amber-500/40"
                          title="Selecione um trecho para realçar com cores ou ver o Dicionário Pop-up"
                        >
                          {renderParagraphWithHighlights(displayedText, currentChapterHighlights, idx)}
                        </p>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {currentChapterHighlights.some(h => displayedText.includes(h.text)) && (
                            <button
                              onClick={() => {
                                const hl = currentChapterHighlights.find(h => displayedText.includes(h.text));
                                if (hl) {
                                  setSelectedHighlight(hl);
                                  setEditingHighlightNoteText(hl.note || '');
                                }
                              }}
                              className="p-1.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30"
                              title="Gerir, copiar ou criar cartão de redes sociais para citação deste parágrafo"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => playParagraph(idx)}
                            className={`p-1.5 rounded-xl shrink-0 transition-all ${
                              isCurrentPara
                                ? 'bg-amber-500 text-slate-950 font-bold opacity-100 scale-105'
                                : 'opacity-0 group-hover:opacity-100 bg-current/10 hover:bg-amber-500 hover:text-slate-950'
                            }`}
                            title={`Ouvir parágrafo ${idx + 1}`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isPurchased && (
                <div className="mt-12 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                  <h4 className="font-bold text-base text-amber-500">Gostou da amostra?</h4>
                  <p className="text-xs opacity-80">
                    Compre a edição completa de "{book.title}" em Kwanzas por Multicaixa Express ou Cartão Internacional para desbloquear todos os capítulos.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Floating Action Menu for Selected Text */}
        {floatingTranslatePos && (
          <div 
            style={{ position: 'fixed', left: `${floatingTranslatePos.x}px`, top: `${floatingTranslatePos.y}px` }}
            className="z-50 animate-in zoom-in-90 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-full border border-amber-500/50 shadow-2xl"
          >
            <button
              onClick={() => handleOpenDictionary(selectedSnippet)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95 shadow-md"
              title="Ver definição e sinónimos no Dicionário Pop-up"
            >
              <BookMarked className="w-3.5 h-3.5 text-slate-950" />
              <span>Dicionário 📖</span>
            </button>

            <button
              onClick={() => {
                handleSpeakSnippet(selectedSnippet);
                setFloatingTranslatePos(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95"
              title="Ouvir este trecho com síntese de voz"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>Ouvir 🔊</span>
            </button>

            <button
              onClick={() => {
                setShowTranslateModal(true);
                handleTranslateSnippet(selectedSnippet, targetLanguage);
                setFloatingTranslatePos(null);
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Traduzir</span>
            </button>

            <button
              onClick={() => handleOpenQuoteCard(selectedSnippet)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Criar Cartão ✨</span>
            </button>

            <button
              onClick={() => {
                toggleBookmark(selectedSnippet ? `Trecho: "${selectedSnippet.substring(0, 120)}..."` : undefined);
                setFloatingTranslatePos(null);
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1 transition-all active:scale-95 shadow-md"
              title="Guardar este trecho selecionado como Marcador"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Marcar ★</span>
            </button>

            {/* Highlights Palette Picker */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-700/80">
              <button
                onClick={() => handleAddHighlightColor('yellow')}
                className="w-6 h-6 rounded-full bg-amber-400 hover:scale-110 transition-transform ring-2 ring-amber-300/60 shadow-sm flex items-center justify-center text-[10px]"
                title="Realçar em Amarelo (Sincronizado na nuvem)"
              >
                🟡
              </button>
              <button
                onClick={() => handleAddHighlightColor('green')}
                className="w-6 h-6 rounded-full bg-emerald-400 hover:scale-110 transition-transform ring-2 ring-emerald-300/60 shadow-sm flex items-center justify-center text-[10px]"
                title="Realçar em Verde (Sincronizado na nuvem)"
              >
                🟢
              </button>
              <button
                onClick={() => handleAddHighlightColor('blue')}
                className="w-6 h-6 rounded-full bg-sky-400 hover:scale-110 transition-transform ring-2 ring-sky-300/60 shadow-sm flex items-center justify-center text-[10px]"
                title="Realçar em Azul (Sincronizado na nuvem)"
              >
                🔵
              </button>
              <button
                onClick={() => handleAddHighlightColor('pink')}
                className="w-6 h-6 rounded-full bg-pink-400 hover:scale-110 transition-transform ring-2 ring-pink-300/60 shadow-sm flex items-center justify-center text-[10px]"
                title="Realçar em Rosa (Sincronizado na nuvem)"
              >
                🩷
              </button>
              <button
                onClick={() => handleAddHighlightColor('purple')}
                className="w-6 h-6 rounded-full bg-purple-400 hover:scale-110 transition-transform ring-2 ring-purple-300/60 shadow-sm flex items-center justify-center text-[10px]"
                title="Realçar em Roxo (Sincronizado na nuvem)"
              >
                🟣
              </button>
            </div>
          </div>
        )}

        {/* Floating Text-To-Speech Player Dock */}
        {showTtsDock && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 text-slate-100 p-3 sm:p-4 rounded-3xl shadow-2xl space-y-3 animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Mic className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-400 flex items-center gap-1">
                    <span>Acessibilidade: Leitura por Voz</span>
                    {isSpeaking && !isPaused && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {currentSpeakingParagraphIndex !== null
                      ? `Parágrafo ${currentSpeakingParagraphIndex + 1} de ${paragraphs.length}`
                      : 'Pronto para iniciar leitura'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Voice Selector */}
                {speechVoices.length > 0 && (
                  <select
                    value={selectedVoiceURI}
                    onChange={(e) => {
                      setSelectedVoiceURI(e.target.value);
                      if (isSpeaking && currentSpeakingParagraphIndex !== null) {
                        playParagraph(currentSpeakingParagraphIndex);
                      }
                    }}
                    className="bg-slate-800 text-slate-200 text-[10px] font-bold rounded-xl px-2 py-1 border border-slate-700 outline-none max-w-[130px] truncate"
                    title="Selecione a Voz de Leitura"
                  >
                    {speechVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => setShowTtsDock(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Fechar Leitor de Voz"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              {/* Speed Rate Control */}
              <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl gap-1">
                <span className="text-[10px] text-slate-400 font-bold px-1 hidden sm:inline">Velocidade:</span>
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setSpeechRate(rate);
                      if (isSpeaking && currentSpeakingParagraphIndex !== null) {
                        playParagraph(currentSpeakingParagraphIndex);
                      }
                    }}
                    className={`px-2 py-0.5 text-[10px] font-black rounded-xl transition-all ${
                      speechRate === rate
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const prevIdx = Math.max(0, (currentSpeakingParagraphIndex ?? 0) - 1);
                    playParagraph(prevIdx);
                  }}
                  disabled={currentSpeakingParagraphIndex === 0 || currentSpeakingParagraphIndex === null}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
                  title="Parágrafo Anterior"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleSpeechToggle}
                  className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-transform active:scale-95 shadow-md flex items-center gap-1.5"
                >
                  {isSpeaking && !isPaused ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isPaused ? 'Continuar' : 'Ouvir'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStopSpeech}
                  disabled={!isSpeaking}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 disabled:opacity-40 transition-colors"
                  title="Parar Leitura"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>

                <button
                  onClick={() => {
                    const nextIdx = Math.min(paragraphs.length - 1, (currentSpeakingParagraphIndex ?? -1) + 1);
                    playParagraph(nextIdx);
                  }}
                  disabled={currentSpeakingParagraphIndex === paragraphs.length - 1}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
                  title="Próximo Parágrafo"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Pop-up Dictionary for Definitions, Synonyms & Grammar */}
        {showDictionaryModal && (
          <DictionaryPopup
            initialWord={dictionaryWord}
            contextSentence={dictionaryContext}
            bookTitle={book.title}
            author={book.author}
            onClose={() => setShowDictionaryModal(false)}
            onOpenTranslate={(wordToTranslate) => {
              setShowDictionaryModal(false);
              setSelectedSnippet(wordToTranslate);
              setShowTranslateModal(true);
              handleTranslateSnippet(wordToTranslate, targetLanguage);
            }}
            onNotification={addNotification}
          />
        )}

        {/* Modal: Quote Card Generator for Social Media */}
        {showQuoteCardModal && (
          <QuoteCardModal
            quote={quoteForCard}
            book={book}
            onClose={() => setShowQuoteCardModal(false)}
            onNotification={addNotification}
          />
        )}

        {/* Modal: Instant Literary Translation Tool */}
        {showTranslateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <span>Tradução Instantânea Literária</span>
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                        Zola IA
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Aprendizado bilingue e análise de vocabulário no e-book</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTranslateModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Snippet Input / Preview */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 font-bold block">
                      Trecho do Livro a Traduzir:
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {selectedSnippet ? `${selectedSnippet.length} carateres` : 'Digita ou seleciona no e-book'}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Selecione um texto na página do e-book ou digite um trecho aqui para traduzir..."
                    value={selectedSnippet}
                    onChange={(e) => setSelectedSnippet(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-amber-500 resize-none font-serif leading-relaxed"
                  />
                </div>

                {/* Target Language Grid Selector */}
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">
                    Idioma de Destino:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => {
                          setTargetLanguage(lang.value);
                          if (selectedSnippet) {
                            handleTranslateSnippet(selectedSnippet, lang.value);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 truncate ${
                          targetLanguage === lang.value
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="truncate">{lang.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Translate Button */}
                <button
                  onClick={() => handleTranslateSnippet(selectedSnippet, targetLanguage)}
                  disabled={isTranslating || !selectedSnippet.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-xs py-3 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>A Traduzir com Zola IA...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Traduzir Trecho para {targetLanguage}</span>
                    </>
                  )}
                </button>

                {/* Translation Output Card */}
                {translationResult && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                        <BookOpenCheck className="w-3.5 h-3.5" />
                        <span>Tradução em {targetLanguage}</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleSpeakTranslation}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                          title="Ouvir Pronúncia da Tradução"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(translationResult.translation);
                            setCopiedTranslation(true);
                            setTimeout(() => setCopiedTranslation(false), 2000);
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                          title="Copiar Tradução"
                        >
                          {copiedTranslation ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-100 font-serif leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      "{translationResult.translation}"
                    </p>

                    {translationResult.note && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[11px] text-amber-300 space-y-1">
                        <span className="font-extrabold block uppercase text-[9px] text-amber-400 tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Nota de Aprendizado Literário
                        </span>
                        <p className="leading-relaxed">{translationResult.note}</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* Modal / Popup for Managing Selected Highlight */}
        {selectedHighlight && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Highlighter className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm text-amber-300">Gerir Realce Colorido</h3>
                </div>
                <button
                  onClick={() => setSelectedHighlight(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <blockquote className={`text-xs p-3 rounded-2xl border-l-4 ${
                selectedHighlight.color === 'green' ? 'border-emerald-400 bg-emerald-950/40 text-emerald-100' :
                selectedHighlight.color === 'blue' ? 'border-sky-400 bg-sky-950/40 text-sky-100' :
                selectedHighlight.color === 'pink' ? 'border-pink-400 bg-pink-950/40 text-pink-100' :
                selectedHighlight.color === 'purple' ? 'border-purple-400 bg-purple-950/40 text-purple-100' :
                'border-amber-400 bg-amber-950/40 text-amber-100'
              } italic font-serif leading-relaxed max-h-36 overflow-y-auto`}>
                "{selectedHighlight.text}"
              </blockquote>

              {/* Actions Row: Copy Quote & Share Social Media Card */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    const formatted = `"${selectedHighlight.text}"\n\n— ${book.title}, ${book.author} (via Zola Books)`;
                    navigator.clipboard.writeText(formatted);
                    addNotification('Citação Copiada!', 'Texto copiado com autoria para a área de transferência.', 'success');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  title="Copiar citação com título e autor do livro"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copiar Citação</span>
                </button>

                <button
                  onClick={() => {
                    const text = selectedHighlight.text;
                    setSelectedHighlight(null);
                    handleOpenQuoteCard(text);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  title="Gerar cartão minimalista para redes sociais (Instagram, Twitter, WhatsApp)"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Partilhar Cartão ✨</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 block">Nota Pessoal / Reflexão:</label>
                <textarea
                  value={editingHighlightNoteText}
                  onChange={(e) => setEditingHighlightNoteText(e.target.value)}
                  placeholder="Escreva uma reflexão ou anotação sobre este trecho realçado..."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    removeHighlight(selectedHighlight.id);
                    setSelectedHighlight(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Realce</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedHighlight(null)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      updateHighlightNote(selectedHighlight.id, editingHighlightNoteText);
                      setSelectedHighlight(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md transition-colors"
                  >
                    Guardar Nota
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Bar (Hidden in Zen Mode and Imersão Total) */}
        {!isTotalImmersion && !isZenMode && (
          <div className="px-6 py-3 border-t border-current/10 flex items-center justify-between text-xs font-semibold">
            <button
              disabled={currentChapterIndex === 0}
              onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
              className="flex items-center gap-1 p-2 rounded-xl hover:bg-current/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="opacity-70 text-[11px]">
                  Capítulo {currentChapterIndex + 1} de {chapters.length}
                </span>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {currentProgressPercentage}% Lido
                </span>
              </div>
              <div className="w-28 sm:w-44 h-1.5 bg-current/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${currentProgressPercentage}%` }}
                />
              </div>
            </div>

            <button
              disabled={currentChapterIndex === chapters.length - 1}
              onClick={() => setCurrentChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
              className="flex items-center gap-1 p-2 rounded-xl hover:bg-current/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
};
