import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  ShieldCheck, 
  Check, 
  Eye, 
  EyeOff, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  Send,
  Cloud,
  Smartphone,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authReasonNotice, 
    setAuthReasonNotice,
    login, 
    registerUser, 
    loginWithGoogleHandler,
    resetPasswordHandler,
    isAuthLoading,
    addNotification 
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('923 456 789');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('customer');
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao iniciar sessão.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;
    if (!agreedTerms) {
      addNotification('Termos Necessários', 'Por favor aceite os termos de serviço para criar a sua conta.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone.startsWith('+244') ? regPhone : `+244 ${regPhone}`,
        role: regRole,
        avatarUrl: regRole === 'author' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogleHandler();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao iniciar sessão com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      await resetPasswordHandler(forgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar instruções de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoRole: 'customer' | 'author' | 'admin') => {
    if (demoRole === 'admin') {
      login('aseneangolano@gmail.com');
    } else if (demoRole === 'author') {
      login('pepetela@zolabooks.ao');
    } else {
      login('manuel.agostinho@zolabooks.ao');
    }
  };

  const closeModal = () => {
    setIsAuthModalOpen(false);
    setAuthReasonNotice(null);
    setForgotSent(false);
    setErrorMsg(null);
  };

  const isLoadingState = loading || isAuthLoading;

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 my-auto space-y-5"
          >
            {/* Contextual Action Banner */}
            {authReasonNotice && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-3 text-xs text-amber-200 flex items-start gap-2.5 shadow-sm"
              >
                <div className="bg-amber-500 text-slate-950 p-1.5 rounded-xl mt-0.5 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-amber-300">Ação Protegida por Autenticação</p>
                  <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                    Para <span className="font-bold underline text-white">{authReasonNotice}</span>, inicie sessão ou crie uma conta gratuita.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/15 border border-red-500/40 rounded-2xl p-3 text-xs text-red-200 flex items-start gap-2.5 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-red-300">{errorMsg}</p>
                </div>
              </motion.div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-white flex items-center gap-1.5">
                    <span>
                      {mode === 'login' && 'Entrar na Zola Books'}
                      {mode === 'register' && 'Criar Conta Gratuita'}
                      {mode === 'forgot' && 'Recuperar Acesso'}
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Sincronização em tempo real via Firebase Auth
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Google Quick Login Button */}
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isLoadingState}
                  onClick={handleGoogleSignIn}
                  className="w-full bg-slate-800 hover:bg-slate-700/90 text-white font-bold text-xs py-3 rounded-2xl border border-slate-700 flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                  </svg>
                  <span>Continuar com a Conta Google</span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider absolute">
                    ou com e-mail
                  </span>
                </div>
              </div>
            )}

            {/* Mode Switch Tabs */}
            {mode !== 'forgot' && (
              <div className="flex bg-slate-800/80 p-1 rounded-2xl text-xs font-extrabold border border-slate-700/60">
                <button
                  onClick={() => { setMode('login'); setErrorMsg(null); }}
                  className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'login' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Iniciar Sessão</span>
                </button>
                <button
                  onClick={() => { setMode('register'); setErrorMsg(null); }}
                  className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'register' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Criar Conta</span>
                </button>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">E-mail</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="exemplo@zolabooks.ao"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-800/90 text-slate-100 p-3 pl-10 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-slate-300 font-bold">Palavra-passe</label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMsg(null); }}
                      className="text-amber-400 hover:underline font-bold text-[11px]"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-800/90 text-slate-100 p-3 pl-10 pr-10 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoadingState}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingState ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Entrar com E-mail</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Access Options */}
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400 mb-2 text-center">
                    ⚡ Entrar Rapidamente (Modo Demonstrativo)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('customer')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2.5 rounded-xl font-bold transition-all text-center"
                    >
                      👤 Leitor Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin('author')}
                      className="bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-800/50 p-2.5 rounded-xl font-bold transition-all text-center"
                    >
                      ✍️ Autor Demo
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Tipo de Perfil Zola</label>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setRegRole('customer')}
                      className={`p-2.5 rounded-xl border transition-all text-center ${
                        regRole === 'customer' ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm' : 'bg-slate-800/80 text-slate-400 border-slate-700'
                      }`}
                    >
                      📖 Leitor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('author')}
                      className={`p-2.5 rounded-xl border transition-all text-center ${
                        regRole === 'author' ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-sm' : 'bg-slate-800/80 text-slate-400 border-slate-700'
                      }`}
                    >
                      ✍️ Autor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('seller')}
                      className={`p-2.5 rounded-xl border transition-all text-center ${
                        regRole === 'seller' ? 'bg-blue-500/20 text-blue-300 border-blue-500 shadow-sm' : 'bg-slate-800/80 text-slate-400 border-slate-700'
                      }`}
                    >
                      🏪 Editora
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nome Completo</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Manuel Agostinho"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-800/90 text-slate-100 p-3 pl-10 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">E-mail</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="manuel@exemplo.ao"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-800/90 text-slate-100 p-3 pl-10 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Telefone (Angola)</label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center gap-1 text-slate-300 font-bold text-xs pointer-events-none">
                      <span>🇦🇴</span>
                      <span>+244</span>
                    </div>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="923 456 789"
                      className="w-full bg-slate-800/90 text-slate-100 p-3 pl-20 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Palavra-passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-800/90 text-slate-100 p-3 pl-10 pr-10 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
                  />
                  <label htmlFor="terms-check" className="text-[11px] text-slate-300 cursor-pointer">
                    Concordo com os Termos de Serviço e Privacidade da Zola Books.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoadingState}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingState ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <>
                      <span>Criar Conta no Firebase</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
                {forgotSent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Send className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-emerald-300">Instruções Enviadas!</h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Verifique a caixa de entrada de <span className="font-bold text-white">{forgotEmail}</span> para redefinir a palavra-passe.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMsg(null); }}
                      className="mt-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs inline-block"
                    >
                      Voltar ao Login
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-slate-300 leading-relaxed">
                      Insira o teu e-mail cadastrado. Enviaremos um link de redefinição de palavra-passe do Firebase Auth.
                    </p>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">E-mail Cadastrado</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="teu.email@exemplo.ao"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full bg-slate-800/90 text-slate-100 p-3 pl-10 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoadingState}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoadingState ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar Instruções de Recuperação</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMsg(null); }}
                      className="w-full text-slate-400 hover:text-white font-bold text-center block py-1"
                    >
                      ← Voltar para Iniciar Sessão
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Cloud Sync Footer Badge */}
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Firebase Auth & Firestore Sincronizados</span>
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Android • iPhone • Web</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

