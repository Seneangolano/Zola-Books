import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Cloud, 
  Smartphone, 
  LogOut, 
  Key, 
  Check, 
  BookOpen, 
  Bookmark, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  HardDrive, 
  Trash2, 
  Sparkles, 
  Bell, 
  FileText,
  Upload,
  Loader2,
  Pin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { uploadUserAvatar } from '../lib/firebase';
import { SecurityBackupSection } from './SecurityBackupSection';
import { AccountDataExportCard } from './AccountDataExportCard';
import { AndroidStorageManagerSection } from './AndroidStorageManagerSection';
import { OfflineCacheSettingsSection } from './OfflineCacheSettingsSection';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';

export const UserProfileModal: React.FC = () => {
  const { 
    isUserProfileOpen, 
    setIsUserProfileOpen, 
    currentUser, 
    updateUserProfile, 
    logout, 
    theme, 
    toggleTheme,
    isSoundFeedbackActive,
    toggleSoundFeedback,
    purchasedBooks,
    bookmarks,
    offlineBooks,
    pinnedOfflineBookIds,
    clearAllOfflineBooks,
    setIsReadingReportModalOpen,
    isDeviceSyncModalOpen,
    setIsDeviceSyncModalOpen,
    cloudSyncStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'storage' | 'stats' | 'backup' | 'settings'>('info');

  // Form State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+244 923 456 789');
  const [country, setCountry] = useState(currentUser.country || 'Angola');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  
  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const downloadUrl = await uploadUserAvatar(file, currentUser.id || 'user');
      setAvatarUrl(downloadUrl);
    } catch (err) {
      console.error('Falha ao carregar avatar:', err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      phone,
      country,
      avatarUrl
    });
    if (newPassword.trim()) {
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
      setNewPassword('');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': return { label: 'Administrador Principal ( Admin)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'author': return { label: 'Autor Publicado', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'seller': return { label: 'Editora / Livraria Partner', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      default: return { label: 'Leitor VIP', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <AnimatePresence>
      {isUserProfileOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 my-auto space-y-6"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={avatarUrl} 
                    alt={currentUser.name} 
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-0.5 rounded-full border-2 border-slate-900" title="Sincronizado Firestore">
                    <Cloud className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <h2 className="font-black text-lg text-white flex items-center gap-2">
                    <span>{currentUser.name}</span>
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                    <span className="text-xs text-slate-400">{currentUser.email}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsUserProfileOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3">
                <div className="flex items-center justify-center text-amber-400 mb-1">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="font-extrabold text-white text-base">{purchasedBooks.length}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Livros na Biblioteca</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3">
                <div className="flex items-center justify-center text-amber-400 mb-1">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div className="font-extrabold text-white text-base">{bookmarks.length}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Marcadores Guardados</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3">
                <div className="flex items-center justify-center text-emerald-400 mb-1">
                  <Cloud className="w-4 h-4" />
                </div>
                <div className="font-extrabold text-emerald-400 text-xs">Ativa</div>
                <div className="text-[10px] text-slate-400 font-semibold">Sincronização Cloud</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-800/80 p-1 rounded-2xl text-xs font-extrabold border border-slate-700/60 overflow-x-auto gap-1">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'info' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dados Pessoais
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                  activeTab === 'storage' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Armazenamento &amp; Cache</span>
                {pinnedOfflineBookIds.length > 0 && (
                  <span className="bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    {pinnedOfflineBookIds.length}📌
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'backup' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Backup (.JSON)</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'settings' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Aparência
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'stats' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dispositivos
              </button>
            </div>

            {/* TAB 1: DADOS PESSOAIS */}
            {activeTab === 'info' && (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                {/* Avatar Presets & Custom Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-bold block">Escolher Foto de Perfil</label>
                    <label className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg cursor-pointer transition-colors border border-slate-700">
                      {isUploadingAvatar ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingAvatar ? 'A carregar...' : 'Carregar foto (Storage)'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarFileChange} 
                        className="hidden" 
                        disabled={isUploadingAvatar}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {AVATAR_PRESETS.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setAvatarUrl(url)}
                        className={`relative rounded-xl overflow-hidden shrink-0 border-2 transition-transform active:scale-95 ${
                          avatarUrl === url ? 'border-amber-400 scale-105' : 'border-slate-700 opacity-70'
                        }`}
                      >
                        <img src={url} alt="Avatar Preset" className="w-10 h-10 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">E-mail</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Telefone (Angola +244)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-bold block mb-1">País de Residência</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Change password */}
                <div className="border-t border-slate-800 pt-3">
                  <label className="text-slate-300 font-bold block mb-1">Alterar Palavra-passe</label>
                  <input
                    type="password"
                    placeholder="Deixe em branco para manter a atual"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                  />
                  {passwordSaved && (
                    <p className="text-emerald-400 font-bold text-[11px] mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Palavra-passe atualizada com sucesso!
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Alterações</span>
                  </button>
                </div>

                {/* Utilitário de Exportação de Dados .JSON */}
                <div className="pt-2">
                  <AccountDataExportCard />
                </div>
              </form>
            )}

            {/* TAB 2: ARMAZENAMENTO ANDROID & CACHE PERMANENTE */}
            {activeTab === 'storage' && (
              <div className="space-y-4">
                <OfflineCacheSettingsSection />
                <AndroidStorageManagerSection />
              </div>
            )}

            {/* TAB 3: DISPOSITIVOS & NUVEM */}
            {activeTab === 'stats' && (
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500 text-slate-950 rounded-xl mt-0.5">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-emerald-300">Firestore Cloud Sync em Tempo Real</h3>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        Os teus e-books comprados, livros favoritos, progresso de leitura em % e marcadores de página são sincronizados em tempo real no Firestore.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Device Sync Hub Button */}
                <div className="p-4 bg-gradient-to-r from-amber-500/20 via-slate-800 to-slate-900 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold shrink-0">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-xs">Central de Sincronização de Dispositivos</h4>
                      <p className="text-[10px] text-slate-300">Histórico de sincronizações, teste de latência e upload/download forçado.</p>
                    </div>
                  </div>

                  <button
                    id="profile-modal-open-sync-btn"
                    onClick={() => {
                      setIsUserProfileOpen(false);
                      setIsDeviceSyncModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Abrir Sincronização ☁️</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-200">Dispositivos Sincronizados</h4>
                  
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="font-bold text-white">Dispositivo Móvel (Android 15 / iOS)</div>
                        <div className="text-[10px] text-slate-400">PWA &amp; App Instalada • Atualizado agora</div>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Ativo
                    </span>
                  </div>

                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="font-bold text-white">Navegador Web Desktop</div>
                        <div className="text-[10px] text-slate-400">Google Chrome / Safari • Conexão Encriptada</div>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Ativo
                    </span>
                  </div>
                </div>

                {/* PDF Reading Report Export Banner */}
                <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-xs">Relatório Personalizado em PDF</h4>
                      <p className="text-[10px] text-slate-300">Exporta o histórico de livros lidos, progresso % e citações realçadas.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserProfileOpen(false);
                      setIsReadingReportModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Gerar PDF</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: BACKUP DE SEGURANÇA & RESTAURAÇÃO */}
            {activeTab === 'backup' && (
              <div className="space-y-4">
                <SecurityBackupSection />
              </div>
            )}

            {/* TAB 4: APARÊNCIA & CACHE */}
            {activeTab === 'settings' && (
              <div className="space-y-4 text-xs">
                {/* Embedded Backup Shortcut Section */}
                <SecurityBackupSection compact />

                {/* Global Theme Toggle Card (Persisted in Firestore) */}
                <ThemeToggleSwitch variant="card" />

                {/* Sound Feedback */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isSoundFeedbackActive ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                    <div>
                      <div className="font-bold text-white">Efeitos Sonoros de Interação</div>
                      <div className="text-[10px] text-slate-400">Sons táteis ao virar páginas, adicionar ao carrinho e clicar</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSoundFeedback()}
                    className={`font-bold text-xs px-3.5 py-2 rounded-xl border transition-all ${
                      isSoundFeedbackActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-700 text-slate-400 border-slate-600'
                    }`}
                  >
                    {isSoundFeedbackActive ? 'Ativado 🔊' : 'Desativado 🔇'}
                  </button>
                </div>

                {/* Offline Cache Stats & Permanent Pin Shortcut */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>Armazenamento &amp; Cache Permanente</span>
                        {pinnedOfflineBookIds.length > 0 && (
                          <span className="bg-purple-600/30 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                            {pinnedOfflineBookIds.length} fixado(s) 📌
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {offlineBooks.length} e-book(s) em cache local • Otimização para Android
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('storage')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>Gerir Livros Fixados</span>
                    </button>
                    {offlineBooks.length > 0 && (
                      <button
                        onClick={clearAllOfflineBooks}
                        className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs px-3 py-2 rounded-xl transition-all flex items-center gap-1"
                        title="Limpar todos os livros offline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Logout Footer Section */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={logout}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminar Sessão</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUserProfileOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
