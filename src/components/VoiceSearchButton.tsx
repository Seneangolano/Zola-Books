import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playSoundEffect } from '../lib/soundEffects';

interface VoiceSearchButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onSearchComplete?: (query: string) => void;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  className = '',
  size = 'md',
  onSearchComplete
}) => {
  const { searchQuery, setSearchQuery, setActiveView, addNotification } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedLang, setSelectedLang] = useState<'pt-AO' | 'pt-PT' | 'pt-BR'>('pt-AO');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = (langCode = selectedLang) => {
    setErrorMessage(null);
    setTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage('A pesquisa por voz não é suportada por este navegador. Tente utilizar o Google Chrome, Edge ou Safari.');
      addNotification('Pesquisa por Voz Indisponível', 'Este navegador não suporta a Web Speech API.', 'system');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = langCode;

      recognition.onstart = () => {
        setIsListening(true);
        playSoundEffect('click');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        setSearchQuery(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Erro de reconhecimento de voz:', event.error);
        setIsListening(false);
        playSoundEffect('error');
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Acesso ao microfone foi negado. Por favor, permita o microfone no navegador.');
          addNotification('Microfone Negado', 'Permita o acesso ao microfone nas definições do navegador.', 'system');
        } else if (event.error === 'no-speech') {
          setErrorMessage('Nenhum áudio foi detetado. Tente falar novamente.');
        } else {
          setErrorMessage(`Erro no reconhecimento: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Falha ao iniciar microfone:', err);
      setIsListening(false);
      playSoundEffect('error');
      setErrorMessage('Não foi possível aceder ao microfone.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const handleToggle = () => {
    playSoundEffect('toggle');
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleConfirmSearch = (textToSearch?: string) => {
    const finalQuery = textToSearch || transcript || searchQuery;
    if (finalQuery.trim()) {
      setSearchQuery(finalQuery);
      setActiveView('catalog');
      stopListening();
      playSoundEffect('success');
      if (onSearchComplete) {
        onSearchComplete(finalQuery);
      }
      addNotification('Pesquisa por Voz', `A pesquisar por: "${finalQuery}"`);
    }
  };

  const buttonSizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'px-3 py-2 text-base'
  }[size];

  const quickVoiceSuggestions = [
    'O Vendedor de Passados',
    'Pepetela',
    'Agualusa',
    'Livros Grátis',
    'História de Angola',
    'Mayombe'
  ];

  return (
    <>
      {/* Mic Button in Search Input */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex items-center justify-center rounded-full transition-all focus:outline-none ${buttonSizeClasses} ${
          isListening
            ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40 ring-2 ring-rose-400'
            : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
        } ${className}`}
        title={isListening ? 'A ouvir... Clique para parar' : 'Pesquisar livros por voz (Microfone)'}
        aria-label="Pesquisa por Voz"
      >
        {isListening ? (
          <span className="relative flex items-center justify-center">
            <Mic className="w-4 h-4 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-200 animate-ping" />
          </span>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Listening / Voice Search Active Drawer / Overlay */}
      {isListening && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-center text-slate-100 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={stopListening}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pulse Animated Mic Graphic */}
            <div className="relative my-4 flex justify-center items-center">
              <div className="w-24 h-24 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center animate-ping absolute" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 via-amber-500 to-rose-500 flex items-center justify-center shadow-xl shadow-rose-500/30 z-10">
                <Mic className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>

            {/* Title & Live Status */}
            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2 mt-2">
              <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
              A ouvir o seu microfone...
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Fale o título do livro, autor ou tema em português (ex: "Pepetela" ou "Romances de Angola")
            </p>

            {/* Language Dialect Selector */}
            <div className="flex items-center justify-center gap-2 my-2">
              <span className="text-[10px] text-slate-400 font-semibold">Idioma:</span>
              <button
                type="button"
                onClick={() => { setSelectedLang('pt-AO'); if (isListening) { stopListening(); setTimeout(() => startListening('pt-AO'), 200); } }}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-bold transition-all ${
                  selectedLang === 'pt-AO' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                🇦🇴 Português (AO)
              </button>
              <button
                type="button"
                onClick={() => { setSelectedLang('pt-PT'); if (isListening) { stopListening(); setTimeout(() => startListening('pt-PT'), 200); } }}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-bold transition-all ${
                  selectedLang === 'pt-PT' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                🇵🇹 Português (PT)
              </button>
              <button
                type="button"
                onClick={() => { setSelectedLang('pt-BR'); if (isListening) { stopListening(); setTimeout(() => startListening('pt-BR'), 200); } }}
                className={`text-[10px] px-2 py-0.5 rounded-full border font-bold transition-all ${
                  selectedLang === 'pt-BR' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                🇧🇷 Português (BR)
              </button>
            </div>

            {/* Live Soundwave Bar Simulation */}
            <div className="flex items-center justify-center gap-1 my-4 h-8">
              <span className="w-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.4s] h-6" />
              <span className="w-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.2s] h-8" />
              <span className="w-1.5 bg-amber-300 rounded-full animate-bounce [animation-delay:-0.3s] h-5" />
              <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.1s] h-7" />
              <span className="w-1.5 bg-amber-500 rounded-full animate-bounce h-4" />
            </div>

            {/* Live Transcript Display Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-h-[70px] flex items-center justify-center my-3 text-sm">
              {transcript ? (
                <span className="text-amber-300 font-semibold text-lg italic">
                  "{transcript}"
                </span>
              ) : (
                <span className="text-slate-500 text-xs italic">
                  A escutar a sua voz... Diga algo agora.
                </span>
              )}
            </div>

            {/* Action buttons inside overlay */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={stopListening}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <MicOff className="w-4 h-4 text-slate-400" /> Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleConfirmSearch()}
                disabled={!transcript && !searchQuery}
                className={`px-5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  transcript || searchQuery
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" /> Buscar Agora
              </button>
            </div>

            {/* Quick Demo Suggestions */}
            <div className="mt-5 pt-4 border-t border-slate-800 text-left">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Sugestões rápidas por toque:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickVoiceSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setTranscript(sug);
                      handleConfirmSearch(sug);
                    }}
                    className="text-[11px] bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/50 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error / Not Supported Modal Banner */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-5 max-w-sm w-full text-center text-slate-100 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <h4 className="font-bold text-base text-white">Pesquisa por Voz</h4>
            <p className="text-xs text-slate-300 mt-2">{errorMessage}</p>

            <button
              onClick={() => setErrorMessage(null)}
              className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
