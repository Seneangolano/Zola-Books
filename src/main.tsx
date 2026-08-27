import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { initSentry } from './lib/sentry';
import './index.css';

// Initialize Sentry error monitoring
initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </StrictMode>,
);

/**
 * Service Worker & Push Notification Registration Logic for Zola Books 🇦🇴
 * Prepares the application to receive real-time push alerts about new literary releases
 * even when the browser tab or app is closed.
 */
async function registerServiceWorkerAndRequestPushPermission() {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ [Zola Books SW] Service Workers não são suportados neste navegador.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('✅ [Zola Books SW] Service Worker registado com sucesso no escopo:', registration.scope);

    // Listen for Service Worker updates
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✨ [Zola Books SW] Nova versão da PWA/E-reader disponível! Recarregue para atualizar.');
          }
        });
      }
    });

    // Request Push Notification Permissions for new literary releases
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        console.log('🔔 [Zola Books Push] A solicitar permissão de Notificações Push para lançamentos literários...');
        
        // Prompt for notification permission shortly after page load
        setTimeout(async () => {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              console.log('🎉 [Zola Books Push] Permissão de notificações concedida pelo leitor!');
              
              if (registration.active) {
                registration.showNotification('📚 Zola Books 🇦🇴 — Notificações Ativas!', {
                  body: 'Vais receber alertas prioritários sobre novos lançamentos literários de autores angolanos.',
                  icon: '/manifest-icon-192.png',
                  badge: '/manifest-icon-192.png',
                  vibrate: [100, 50, 100],
                  tag: 'zola-welcome-notif'
                } as NotificationOptions);
              }
            } else if (permission === 'denied') {
              console.warn('⚠️ [Zola Books Push] Permissão de notificações recusada pelo leitor.');
            }
          } catch (notifErr) {
            console.error('❌ [Zola Books Push] Erro ao solicitar permissão de notificações:', notifErr);
          }
        }, 2000);

      } else if (Notification.permission === 'granted') {
        console.log('✅ [Zola Books Push] Permissão de notificações já concedida previamente.');
      } else {
        console.log('ℹ️ [Zola Books Push] Estado das notificações push:', Notification.permission);
      }
    }

  } catch (err) {
    console.error('❌ [Zola Books SW] Falha ao registar o Service Worker:', err);
  }
}

// Execute registration when the window has finished loading
if (document.readyState === 'complete') {
  registerServiceWorkerAndRequestPushPermission();
} else {
  window.addEventListener('load', registerServiceWorkerAndRequestPushPermission);
}

