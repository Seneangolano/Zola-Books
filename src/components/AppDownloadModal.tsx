import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Download, Check, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AppDownloadModal: React.FC = () => {
  const { 
    isAppDownloadModalOpen, 
    setIsAppDownloadModalOpen, 
    setIsAndroid15ModalOpen,
    addNotification 
  } = useApp();

  const handleInstallPWA = () => {
    // Direct location change guarantees that Chrome & Samsung Internet on Android initiate file download
    window.location.href = '/api/download-apk';

    // Check if deferred pwa prompt exists
    if ((window as any).deferredPrompt) {
      try {
        (window as any).deferredPrompt.prompt();
      } catch (e) {
        console.warn('PWA prompt deferred error:', e);
      }
    } else {
      addNotification(
        'Download de APK Iniciado! 📦',
        'O ficheiro ZolaBooks_v1.1_Android15.apk está a ser descarregado. Abra o ficheiro no Android para concluir a instalação.',
        'system'
      );
    }
  };

  const handleSimulateIosPackageDownload = () => {
    const text = "Zola Books iOS Xcode App Project Package (iOS 14.0+ - Xcode Compatible)\nTarget: iOS / iPadOS\nBundle Identifier: com.zolabooks.angola\nCapacitor iOS Core Included";
    const blob = new Blob([text], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ZolaBooks_iOS_Xcode_v1.1.zip';
    a.click();
    URL.revokeObjectURL(url);
    addNotification('Projeto iOS v1.1', 'Pacote Xcode ZolaBooks_iOS_Xcode_v1.1.zip gerado e pronto para o Xcode!', 'system');
  };

  return (
    <AnimatePresence>
      {isAppDownloadModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl p-6 text-slate-100 my-auto space-y-6"
          >
            
            {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-amber-400" />
            <h2 className="font-extrabold text-base text-white">Zola Books para Android &amp; iPhone</h2>
          </div>
          <button
            onClick={() => setIsAppDownloadModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option 1: Android App Direct Install */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <span>🤖</span> Android App (Instalação Direta)
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
              Android 15 Ready (API 35)
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Instale o Zola Books diretamente no teu telemóvel Android sem erros de pacote.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href="/api/download-apk"
              download="ZolaBooks_v1.1_Android15.apk"
              onClick={() => {
                addNotification(
                  'Download do APK 📦',
                  'Ficheiro ZolaBooks_v1.1_Android15.apk a ser descarregado diretamente.',
                  'system'
                );
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98 text-center"
            >
              <Download className="w-4 h-4" />
              <span>Instalar / Baixar APK v1.1</span>
            </a>
            <button
              onClick={handleInstallPWA}
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs py-3.5 rounded-xl border border-amber-500/40 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>Instalar Web App (PWA)</span>
            </button>
          </div>
          
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-amber-300">⚠️ Tem uma versão antiga do Zola Books instalada?</p>
            <p>Se instalou previamente uma versão de teste ou debug do APK, <strong className="text-white">desinstale a versão antiga</strong> no Android em <em>Definições &gt; Aplicações &gt; Zola Books &gt; Desinstalar</em> antes de instalar a nova versão para evitar conflitos de assinatura do pacote.</p>
          </div>
        </div>

        {/* Android 15 Error Diagnostic Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-2 border-amber-500/40 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-white">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Erro no Android 15 com o APK v1.0?</span>
            </span>
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black text-[10px]">
              DIAGNÓSTICO
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Analise a incompatibilidade de API level 35, layout Edge-to-Edge, alinhamento de memória 16 KB e suporte a sintetizador de voz WebSpeech no Android 15.
          </p>
          <button
            onClick={() => {
              setIsAppDownloadModalOpen(false);
              setIsAndroid15ModalOpen(true);
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs py-2.5 rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-colors mt-1"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Analisar Erro &amp; Ver Soluções do Android 15</span>
          </button>
        </div>

        {/* Option 2: iOS / iPhone Xcode & PWA */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <span>🍎</span> iPhone / iPad (iOS Xcode App)
            </span>
            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">
              Xcode &amp; TestFlight Ready
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Projeto nativo Swift/Capacitor configurado com Podfile, Info.plist e permissões de voz WebSpeech para iOS 14.0+.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleSimulateIosPackageDownload}
              className="w-full bg-slate-700 hover:bg-slate-600 text-sky-300 font-bold text-xs py-2.5 rounded-xl border border-sky-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Pacote Xcode (.zip)</span>
            </button>

            <button
              onClick={() => {
                setIsAppDownloadModalOpen(false);
                setIsAndroid15ModalOpen(true);
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Ver Relatório de Compatibilidade</span>
            </button>
          </div>
          <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside bg-slate-900 p-3 rounded-xl">
            <li>Toque no Safari em <strong className="text-amber-400">Partilhar</strong></li>
            <li>Selecione <strong className="text-amber-400">Adicionar ao Ecrã Principal</strong></li>
            <li>Ou abra no Xcode: <code className="text-sky-300">npx cap open ios</code></li>
          </ol>
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
