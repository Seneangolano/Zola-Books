import React, { useRef, useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Sparkles, 
  Copy, 
  Check, 
  Palette, 
  Type, 
  BookOpen, 
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { Book } from '../types';

interface QuoteCardModalProps {
  quote: string;
  book: Book;
  onClose: () => void;
  onNotification?: (title: string, message: string, type?: 'system' | 'success') => void;
}

export type CardTheme = 'dark-gold' | 'sunset' | 'parchment' | 'midnight' | 'angolan-warm';
export type CardFont = 'serif' | 'sans' | 'mono';

export const QuoteCardModal: React.FC<QuoteCardModalProps> = ({
  quote: initialQuote,
  book,
  onClose,
  onNotification
}) => {
  const [quoteText, setQuoteText] = useState(initialQuote);
  const [theme, setTheme] = useState<CardTheme>('dark-gold');
  const [fontStyle, setFontStyle] = useState<CardFont>('serif');
  const [fontSize, setFontSize] = useState<number>(38); // 28 to 50
  const [includeCover, setIncludeCover] = useState(true);
  const [userHandle, setUserHandle] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Themes Configuration
  const themeConfigs: Record<CardTheme, {
    name: string;
    bgGradient: [string, string, string];
    textColor: string;
    accentColor: string;
    quoteColor: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
    isLight?: boolean;
  }> = {
    'dark-gold': {
      name: 'Zola Gold Dark',
      bgGradient: ['#0f172a', '#1e1b4b', '#020617'],
      textColor: '#f8fafc',
      accentColor: '#fbbf24',
      quoteColor: 'rgba(251, 191, 36, 0.25)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeText: '#fcd34d'
    },
    'sunset': {
      name: 'Pôr do Sol Caxito',
      bgGradient: ['#431407', '#7c2d12', '#9a3412'],
      textColor: '#fff7ed',
      accentColor: '#fdba74',
      quoteColor: 'rgba(253, 186, 116, 0.25)',
      borderColor: 'rgba(251, 146, 60, 0.4)',
      badgeBg: 'rgba(251, 146, 60, 0.2)',
      badgeText: '#ffedd5'
    },
    'parchment': {
      name: 'Pergaminho Clássico',
      bgGradient: ['#fef3c7', '#fffbeb', '#fef9c3'],
      textColor: '#1e293b',
      accentColor: '#b45309',
      quoteColor: 'rgba(180, 83, 9, 0.15)',
      borderColor: 'rgba(217, 119, 6, 0.3)',
      badgeBg: 'rgba(180, 83, 9, 0.12)',
      badgeText: '#78350f',
      isLight: true
    },
    'midnight': {
      name: 'Noite de Luanda',
      bgGradient: ['#1e1b4b', '#311042', '#0f172a'],
      textColor: '#f1f5f9',
      accentColor: '#c084fc',
      quoteColor: 'rgba(192, 132, 252, 0.25)',
      borderColor: 'rgba(168, 85, 247, 0.4)',
      badgeBg: 'rgba(168, 85, 247, 0.2)',
      badgeText: '#e9d5ff'
    },
    'angolan-warm': {
      name: 'Terra Angolana',
      bgGradient: ['#451a03', '#78350f', '#1c1917'],
      textColor: '#fef3c7',
      accentColor: '#f59e0b',
      quoteColor: 'rgba(245, 158, 11, 0.25)',
      borderColor: 'rgba(217, 119, 6, 0.4)',
      badgeBg: 'rgba(217, 119, 6, 0.2)',
      badgeText: '#fde68a'
    }
  };

  // Helper to wrap text cleanly in HTML5 Canvas
  const wrapText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    maxWidth: number
  ): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  // Render Canvas Card
  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    const cfg = themeConfigs[theme];

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, cfg.bgGradient[0]);
    gradient.addColorStop(0.5, cfg.bgGradient[1]);
    gradient.addColorStop(1, cfg.bgGradient[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle Radial Glows
    const radial = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 3, 500);
    radial.addColorStop(0, cfg.quoteColor);
    radial.addColorStop(1, 'transparent');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // 2. Decorative Outer Border Frame
    const inset = 40;
    ctx.strokeStyle = cfg.borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

    // Corner Accents
    const cornerSize = 20;
    ctx.strokeStyle = cfg.accentColor;
    ctx.lineWidth = 5;
    
    // Top Left
    ctx.beginPath();
    ctx.moveTo(inset, inset + cornerSize);
    ctx.lineTo(inset, inset);
    ctx.lineTo(inset + cornerSize, inset);
    ctx.stroke();

    // Top Right
    ctx.beginPath();
    ctx.moveTo(width - inset - cornerSize, inset);
    ctx.lineTo(width - inset, inset);
    ctx.lineTo(width - inset, inset + cornerSize);
    ctx.stroke();

    // Bottom Left
    ctx.beginPath();
    ctx.moveTo(inset, inset - cornerSize + height - inset * 2);
    ctx.lineTo(inset, height - inset);
    ctx.lineTo(inset + cornerSize, height - inset);
    ctx.stroke();

    // Bottom Right
    ctx.beginPath();
    ctx.moveTo(width - inset - cornerSize, height - inset);
    ctx.lineTo(width - inset, height - inset);
    ctx.lineTo(width - inset, height - inset - cornerSize);
    ctx.stroke();

    // 3. Header Badge: Zola Books Branding
    ctx.save();
    ctx.fillStyle = cfg.badgeBg;
    const badgeW = 260;
    const badgeH = 44;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 80;
    
    // Rounded rect for badge
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 22);
    ctx.fill();
    ctx.strokeStyle = cfg.borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = cfg.badgeText;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ZOLA BOOKS 🇦🇴 CITAÇÃO', width / 2, badgeY + badgeH / 2);
    ctx.restore();

    // 4. Large Background Quote Mark Icon
    ctx.save();
    ctx.fillStyle = cfg.quoteColor;
    ctx.font = 'bold 220px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('“', width / 2, 280);
    ctx.restore();

    // 5. Quote Text Formatting & Drawing
    ctx.save();
    let fontName = 'Georgia, serif';
    if (fontStyle === 'sans') fontName = 'system-ui, -apple-system, sans-serif';
    if (fontStyle === 'mono') fontName = 'Courier New, monospace';

    ctx.font = `italic ${fontSize}px ${fontName}`;
    ctx.fillStyle = cfg.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const maxTextWidth = width - 200;
    const lines = wrapText(ctx, `"${quoteText.trim()}"`, maxTextWidth);

    const lineHeight = fontSize * 1.5;
    const totalTextHeight = lines.length * lineHeight;
    
    // Position quote lines vertically centered
    let startY = 320 + (320 - totalTextHeight) / 2;
    if (startY < 240) startY = 240;

    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + idx * lineHeight);
    });
    ctx.restore();

    // 6. Footer Section: Book Details & Author
    const footerY = height - 180;

    // Decorative Line
    ctx.save();
    ctx.strokeStyle = cfg.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 80, footerY - 20);
    ctx.lineTo(width / 2 + 80, footerY - 20);
    ctx.stroke();

    // Book Title
    ctx.fillStyle = cfg.accentColor;
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const safeTitle = book.title.length > 45 ? book.title.substring(0, 45) + '...' : book.title;
    ctx.fillText(safeTitle, width / 2, footerY);

    // Book Author
    ctx.fillStyle = cfg.textColor;
    ctx.font = '500 20px sans-serif';
    ctx.fillText(`— ${book.author}`, width / 2, footerY + 36);

    // Optional User Tag / Handle
    if (userHandle.trim()) {
      ctx.fillStyle = cfg.badgeText;
      ctx.font = 'italic 16px sans-serif';
      ctx.fillText(`Partilhado por @${userHandle.replace(/^@/, '')}`, width / 2, footerY + 70);
    }
    ctx.restore();
  };

  useEffect(() => {
    drawCard();
  }, [quoteText, theme, fontStyle, fontSize, includeCover, userHandle]);

  // Download Card Image
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeTitle = book.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      link.download = `zola-citacao-${safeTitle}.png`;
      link.href = dataUrl;
      link.click();

      if (onNotification) {
        onNotification('Cartão Descarregado!', 'A imagem em alta resolução foi guardada no seu dispositivo.', 'success');
      }
    } catch (e) {
      console.error('Erro ao gerar PNG do canvas:', e);
    }
  };

  // Share Card Image via Web Share API or Clipboard
  const handleShareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], 'citacao-zola-books.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Citação do livro "${book.title}"`,
            text: `"${quoteText}" — ${book.title} (${book.author}). Lido na Zola Books 🇦🇴`,
            files: [file]
          });
          if (onNotification) onNotification('Partilhado!', 'Cartão enviado com sucesso.');
        } else {
          // Fallback to text copy
          await navigator.clipboard.writeText(`"${quoteText}" — ${book.title} (${book.author}) [Lido na Zola Books 🇦🇴]`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
          if (onNotification) onNotification('Citação Copiada!', 'A frase e os detalhes foram copiados para a área de transferência.');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Erro na partilha:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-4xl rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <span>Criador de Cartão de Citação</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                  Redes Sociais
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Transforme passagens marcantes de "{book.title}" em cartões em alta definição (Canvas API)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Grid (Canvas Preview vs Controls) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Real-time Canvas Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center space-y-3 bg-slate-950/70 p-4 rounded-3xl border border-slate-800">
            <div className="relative w-full aspect-square max-w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center font-medium">
              ✨ Pré-visualização HD (1080x1080px) pronta para Instagram, WhatsApp e Twitter
            </p>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Quote Textarea Edit */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Frase / Citação Selecionada:</span>
                <span className="text-[10px] text-amber-400 font-mono">{quoteText.length} carateres</span>
              </label>
              <textarea
                rows={3}
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Insira ou edite a frase para o cartão..."
                className="w-full bg-slate-950 text-xs text-slate-100 p-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-amber-500 font-serif leading-relaxed resize-none"
              />
            </div>

            {/* Theme Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Estilo Visual / Tema do Cartão:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(themeConfigs) as CardTheme[]).map((tKey) => {
                  const cfg = themeConfigs[tKey];
                  const isActive = theme === tKey;

                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setTheme(tKey)}
                      className={`p-2.5 rounded-2xl border text-left transition-all space-y-1.5 relative overflow-hidden ${
                        isActive 
                          ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-500/30' 
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" 
                          style={{ background: `linear-gradient(135deg, ${cfg.bgGradient[0]}, ${cfg.bgGradient[2]})` }}
                        />
                        <span className={`text-[11px] font-bold truncate ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                          {cfg.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Options & Text Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tipografia:</span>
                </label>
                <select
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value as CardFont)}
                  className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="serif">Serifada Clássica (Georgia)</option>
                  <option value="sans">Moderna sem Serifa (Sans)</option>
                  <option value="mono">Máquina de Escrever (Mono)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>Tamanho Texto:</span>
                  <span className="text-[10px] text-amber-400 font-mono">{fontSize}px</span>
                </label>
                <input
                  type="range"
                  min={28}
                  max={50}
                  step={2}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer mt-2"
                />
              </div>
            </div>

            {/* Custom Handle input */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Nome ou Handle do Leitor (Opcional):
              </label>
              <input
                type="text"
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                placeholder="ex: @leitor_angolano"
                className="w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Action Buttons: Download & Share */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadImage}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Descarregar Imagem (PNG)</span>
              </button>

              <button
                onClick={handleShareImage}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold text-xs py-3.5 rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Citação Copiada!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Partilhar / Copiar</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
