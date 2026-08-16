import React from 'react';
import { Tag, X, Sparkles, Filter, Hash } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playSoundEffect } from '../lib/soundEffects';

interface TagFilterBarProps {
  className?: string;
  showTitle?: boolean;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({ className = '', showTitle = true }) => {
  const { selectedTag, setSelectedTag, availableTags, books } = useApp();

  // Highlighted quick theme tags explicitly requested or popular in Angola
  const featuredQuickTags = [
    { name: 'Grátis', icon: '🎁' },
    { name: 'História de Angola', icon: '🇦🇴' },
    { name: 'Ficção Científica Africana', icon: '🚀' },
    { name: 'Autoajuda', icon: '💡' },
    { name: 'Desenvolvimento Pessoal', icon: '🌟' },
    { name: 'Afrofuturismo', icon: '⚡' },
    { name: 'Finanças', icon: '💰' },
    { name: 'Tecnologia', icon: '💻' },
    { name: 'Poesia', icon: '✍️' },
    { name: 'Infantil', icon: '🧒' }
  ];

  // Calculate tag book count map
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach(b => {
      if (b.tags && Array.isArray(b.tags)) {
        b.tags.forEach(t => {
          const clean = t.trim();
          counts[clean] = (counts[clean] || 0) + 1;
        });
      }
    });
    return counts;
  }, [books]);

  const handleSelectTag = (tag: string) => {
    playSoundEffect('click');
    if (selectedTag === tag) {
      setSelectedTag('Todas');
    } else {
      setSelectedTag(tag);
    }
  };

  return (
    <div className={`space-y-3 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-3xl backdrop-blur-md shadow-xl ${className}`}>
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        {showTitle && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                Filtrar Temas e Tags Literárias
                <Sparkles className="w-3 h-3 text-amber-400 inline" />
              </h3>
              <p className="text-[11px] text-slate-400">
                Explore e-books por áreas de conhecimento e temas específicos
              </p>
            </div>
          </div>
        )}

        {selectedTag && selectedTag !== 'Todas' && (
          <button
            onClick={() => {
              playSoundEffect('click');
              setSelectedTag('Todas');
            }}
            className="text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar Tag ({selectedTag})</span>
          </button>
        )}
      </div>

      {/* Featured Quick Theme Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
          Temas em Destaque:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            onClick={() => handleSelectTag('Todas')}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              selectedTag === 'Todas' || !selectedTag
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
            }`}
          >
            <span>✨ Todos os Temas</span>
          </button>

          {featuredQuickTags.map((qt) => {
            const isSelected = selectedTag === qt.name;
            const count = tagCounts[qt.name] || 0;
            return (
              <button
                key={qt.name}
                onClick={() => handleSelectTag(qt.name)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:border-amber-500/40 hover:text-white'
                }`}
              >
                <span>{qt.icon}</span>
                <span>{qt.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-amber-400 border border-slate-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Tags List */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 text-[11px]">
          <span className="text-slate-500 font-bold shrink-0 mr-1 flex items-center gap-1 text-[10px]">
            <Hash className="w-3 h-3 text-amber-400" /> Outras Tags:
          </span>
          {availableTags.map((tag) => {
            const isSelected = selectedTag === tag;
            const count = tagCounts[tag] || 0;
            return (
              <button
                key={tag}
                onClick={() => handleSelectTag(tag)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all border text-[11px] font-medium flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400 font-bold'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>#{tag}</span>
                {count > 0 && (
                  <span className="text-[9px] text-slate-500 font-mono">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
