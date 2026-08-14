import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Bot, User, BookOpen, Heart, ShoppingCart, Compass, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Book } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedBookIds?: string[];
}

export const ZolaAIAssistantModal: React.FC = () => {
  const { 
    isZolaAIOpen, 
    setIsZolaAIOpen, 
    favoriteBookIds, 
    currentUser, 
    books, 
    setSelectedBookModal, 
    addToCart, 
    toggleFavorite,
    formatPrice 
  } = useApp();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Olá! Eu sou a **Zola IA**, a tua assistente literária com **Algoritmo de Recomendação de Autores Africanos**.\n\nPosso analisar os teus e-books favoritos e o teu histórico de leitura para sugerir novas obras marcantes da literatura angolana e africana adaptadas aos teus gostos!'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isZolaAIOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZolaAIOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZolaAIOpen, setIsZolaAIOpen]);

  // Extract book IDs from text if formatted as [ID: ZB-BK-xxx]
  const extractBookIds = (text: string): string[] => {
    const regex = /\[ID:\s*(ZB-BK-[A-Za-z0-9\-]+)\]/gi;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match[1] && books.some(b => b.id === match[1])) {
        matches.push(match[1]);
      }
    }
    return Array.from(new Set(matches));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = { id: `user-${Date.now()}`, sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    setIsLoading(true);

    try {
      const answer = await api.askZolaAI(query, favoriteBookIds, currentUser.purchasedBookIds);
      const bookIds = extractBookIds(answer);
      
      setMessages(prev => [
        ...prev, 
        { 
          id: `ai-${Date.now()}`, 
          sender: 'ai', 
          text: answer,
          recommendedBookIds: bookIds.length > 0 ? bookIds : undefined 
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { id: `ai-err-${Date.now()}`, sender: 'ai', text: 'Desculpe, ocorreu um pequeno contratempo ao consultar o modelo Gemini. Por favor, tente novamente.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunRecommendationAlgorithm = async (customPrompt?: string) => {
    const userPromptText = customPrompt || 'Gerar recomendações personalizadas baseadas nos meus Favoritos e Histórico de Leitura';
    
    const userMsg: Message = { 
      id: `user-rec-${Date.now()}`, 
      sender: 'user', 
      text: `🧠 **[Algoritmo de Recomendação]**: ${userPromptText}` 
    };
    setMessages(prev => [...prev, userMsg]);

    setIsLoading(true);

    try {
      const res = await api.getRecommendationsAI(
        favoriteBookIds,
        currentUser.purchasedBookIds,
        customPrompt
      );

      const bookIds = extractBookIds(res.recommendation);

      setMessages(prev => [
        ...prev,
        {
          id: `ai-rec-${Date.now()}`,
          sender: 'ai',
          text: res.recommendation,
          recommendedBookIds: bookIds.length > 0 ? bookIds : undefined
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { 
          id: `ai-rec-err-${Date.now()}`, 
          sender: 'ai', 
          text: 'Erro ao executar o algoritmo de recomendação. Verifique a ligação com o modelo Gemini.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isZolaAIOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="zola-ai-modal-title"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl h-[85vh] bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto text-slate-100"
          >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 id="zola-ai-modal-title" className="font-extrabold text-sm text-white flex items-center gap-2">
                Zola IA <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">Gemini 3.6</span>
              </h2>
              <p className="text-[11px] text-slate-400">Recomendador Inteligente de Literatura Africana</p>
            </div>
          </div>

          <button
            onClick={() => setIsZolaAIOpen(false)}
            aria-label="Fechar assistente Zola IA"
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Personalized Profile Analytics Strip */}
        <div className="px-6 py-2 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400">Análise do Leitor:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
              <Heart className="w-3 h-3 fill-rose-500" /> {favoriteBookIds.length} Favoritos
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <BookOpen className="w-3 h-3 text-amber-400" /> {currentUser.purchasedBookIds.length} Histórico
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleRunRecommendationAlgorithm()}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-[11px] px-3 py-1 rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <Compass className="w-3.5 h-3.5" /> Recomendar Autores
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-medium text-amber-300/90">
          <button
            onClick={() => handleRunRecommendationAlgorithm('Sugira romancistas angolanos contemporâneos')}
            className="whitespace-nowrap px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full transition-colors flex items-center gap-1"
          >
            🇦🇴 Romances de Angola
          </button>
          <button
            onClick={() => handleRunRecommendationAlgorithm('Recomende grandes clássicos africanos como Chinua Achebe, Mia Couto e Pepetela')}
            className="whitespace-nowrap px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full transition-colors flex items-center gap-1"
          >
            🌍 Clássicos Africanos
          </button>
          <button
            onClick={() => handleSendMessage('Quais são as obras de autoras africanas disponíveis?')}
            className="whitespace-nowrap px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full transition-colors"
          >
            👩🏽‍🦱 Autoras Africanas
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs leading-relaxed">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-amber-500 text-slate-950 font-bold' 
                  : 'bg-purple-600/30 border border-purple-500/40 text-purple-300'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="max-w-[85%] space-y-3">
                <div className={`p-4 rounded-2xl whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none shadow-md'
                }`}>
                  {msg.text}
                </div>

                {/* Render Interactive Recommended Book Cards if any matched IDs */}
                {msg.recommendedBookIds && msg.recommendedBookIds.length > 0 && (
                  <div className="bg-slate-950/70 border border-amber-500/30 rounded-2xl p-3 space-y-2 mt-2">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> Livros Recomendados do Catálogo:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.recommendedBookIds.map(bId => {
                        const book = books.find(b => b.id === bId);
                        if (!book) return null;
                        const isFav = favoriteBookIds.includes(book.id);

                        return (
                          <div 
                            key={book.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex gap-2.5 items-center hover:border-amber-500/50 transition-all"
                          >
                            <img 
                              src={book.coverImage} 
                              alt={book.title} 
                              className="w-12 h-16 object-cover rounded-md shadow shrink-0" 
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white text-xs truncate">{book.title}</h4>
                              <p className="text-[11px] text-slate-400 truncate">{book.author}</p>
                              <p className="text-[11px] text-amber-400 font-extrabold mt-0.5">
                                {formatPrice(book.priceAOA, book.priceUSD)}
                              </p>

                              <div className="flex items-center gap-1.5 mt-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBookModal(book)}
                                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded-md transition-colors"
                                >
                                  Ver Detalhes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => addToCart(book)}
                                  className="text-[10px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-1 rounded-md transition-colors"
                                  title="Adicionar ao Carrinho"
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleFavorite(book.id)}
                                  className={`text-[10px] p-1 rounded-md transition-colors ${
                                    isFav ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400 hover:text-rose-400'
                                  }`}
                                  title="Favoritar"
                                >
                                  <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold italic pl-11">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>O algoritmo Zola IA está a analisar os teus favoritos e catálogo de literatura africana...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2"
        >
          <input
            type="text"
            placeholder="Pergunte sobre livros, peça sugestões de autores africanos ou tire dúvidas..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 text-xs text-slate-100 placeholder-slate-500 p-3 rounded-2xl border border-slate-700 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-3 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 shadow-md shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

