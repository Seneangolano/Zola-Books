import * as Sentry from '@sentry/react';

const metaEnv = (import.meta as any).env || {};
const SENTRY_DSN = String(metaEnv.VITE_SENTRY_DSN || '').trim();

let isInitialized = false;

/**
 * Validates whether a given string is a valid Sentry DSN URL format.
 * Sentry DSN requires http/https scheme, public key (@), host, and project ID.
 */
function isValidDsn(dsn: string): boolean {
  if (!dsn || typeof dsn !== 'string') return false;
  const trimmed = dsn.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  // Sentry DSN must contain key@host/projectId format (e.g. https://key@o1234.ingest.sentry.io/56789)
  const sentryDsnRegex = /^https?:\/\/[^@\s]+@[^/%\s]+\/\w+$/;
  return sentryDsnRegex.test(trimmed);
}

/**
 * Initialize Sentry for real-time error tracking and performance monitoring.
 */
export function initSentry() {
  if (!SENTRY_DSN || !isValidDsn(SENTRY_DSN)) {
    console.info('ℹ️ Sentry DSN ausente ou inválido. Modo de diagnóstico local ativo.');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
      ],
      // Tracing performance
      tracesSampleRate: 1.0,
      // Set sample rate to capture 100% of errors
      sampleRate: 1.0,
      environment: metaEnv.MODE || 'development',
      beforeSend(event) {
        // Add custom tags for Zola Books platform
        event.tags = {
          ...event.tags,
          appName: 'ZolaBooks',
          platform: 'web'
        };
        return event;
      }
    });
    isInitialized = true;
    console.log('✅ Sentry monitorização de erros em tempo real inicializado com DSN.');
  } catch (e) {
    console.warn('⚠️ Erro ao inicializar Sentry:', e);
  }
}

/**
 * Identify current logged-in user in Sentry for faster debugging
 */
export function setSentryUser(user: { id?: string; email?: string; name?: string; role?: string } | null) {
  if (!isInitialized) return;
  try {
    if (!user) {
      Sentry.setUser(null);
      return;
    }
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      role: user.role
    });
  } catch (e) {
    console.warn('⚠️ Erro no Sentry setSentryUser:', e);
  }
}

/**
 * Capture payment failures (Multicaixa Express, Credit Card, IBAN, Stripe, etc.)
 */
export function capturePaymentError(
  error: unknown,
  paymentInfo: {
    method: string;
    amountAOA?: number;
    amountUSD?: number;
    orderId?: string;
    phoneNumber?: string;
    reference?: string;
  }
) {
  console.error('🔴 [Sentry Payment Alert]:', error, paymentInfo);
  if (!isInitialized) return;
  try {
    Sentry.withScope((scope) => {
      scope.setTag('module', 'payments');
      scope.setTag('payment_method', paymentInfo.method);
      scope.setExtra('paymentInfo', paymentInfo);
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(`Falha no Pagamento (${paymentInfo.method}): ${String(error)}`, 'error');
      }
    });
  } catch (e) {
    console.warn('⚠️ Erro ao enviar alerta Sentry:', e);
  }
}

/**
 * Capture e-reader rendering or progress sync failures
 */
export function captureReadingError(
  error: unknown,
  readingInfo: {
    bookId: string;
    bookTitle?: string;
    chapterIndex?: number;
    totalChapters?: number;
    deviceInfo?: string;
  }
) {
  console.error('🔴 [Sentry E-Reader Alert]:', error, readingInfo);
  if (!isInitialized) return;
  try {
    Sentry.withScope((scope) => {
      scope.setTag('module', 'ereader');
      scope.setTag('book_id', readingInfo.bookId);
      scope.setExtra('readingInfo', readingInfo);
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(`Erro na Leitura (${readingInfo.bookTitle || readingInfo.bookId}): ${String(error)}`, 'error');
      }
    });
  } catch (e) {
    console.warn('⚠️ Erro ao enviar alerta de e-reader Sentry:', e);
  }
}

/**
 * Generic exception logger
 */
export function captureException(error: unknown, context?: Record<string, any>) {
  console.error('🔴 [Sentry Exception]:', error, context);
  if (!isInitialized) return;
  try {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(String(error), 'error');
      }
    });
  } catch (e) {
    console.warn('⚠️ Erro ao capturar exceção Sentry:', e);
  }
}

// Buffer local de breadcrumbs recentes para diagnósticos
const recentBreadcrumbs: Array<{
  timestamp: string;
  category: string;
  message: string;
  data?: Record<string, any>;
  level?: string;
}> = [];

/**
 * Add breadcrumb for user navigation / critical steps
 */
export function addSentryBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, any>,
  level: 'info' | 'warning' | 'error' | 'debug' = 'info'
) {
  const timestamp = new Date().toISOString();
  
  // Guardar no buffer local em memória (máx 50)
  recentBreadcrumbs.push({ timestamp, category, message, data, level });
  if (recentBreadcrumbs.length > 50) {
    recentBreadcrumbs.shift();
  }

  // Se o Sentry estiver inicializado, enviar o breadcrumb
  if (isInitialized) {
    try {
      Sentry.addBreadcrumb({
        category,
        message,
        data,
        level,
        timestamp: Date.now() / 1000
      });
    } catch (e) {
      console.warn('⚠️ Erro ao adicionar breadcrumb Sentry:', e);
    }
  } else {
    // Log estruturado local quando Sentry está em modo de simulação
    console.debug(`📌 [Breadcrumb][${category.toUpperCase()}]:`, message, data || '');
  }
}

/**
 * Rastrear mudanças de vista (Navigation / View Change)
 */
export function trackViewChange(viewName: string, previousView?: string, details?: Record<string, any>) {
  const message = previousView
    ? `Navegação de vista: ${previousView} ➔ ${viewName}`
    : `Entrou na vista: ${viewName}`;

  addSentryBreadcrumb('navigation', message, {
    to: viewName,
    from: previousView || 'unknown',
    ...details
  }, 'info');
}

/**
 * Rastrear cliques em botões de compra e início de checkout
 */
export function trackPurchaseClick(
  bookId: string,
  bookTitle: string,
  priceAOA?: number,
  paymentMethod?: string,
  details?: Record<string, any>
) {
  const priceStr = priceAOA !== undefined ? ` (${priceAOA.toLocaleString('pt-AO')} Kz)` : '';
  const methodStr = paymentMethod ? ` via ${paymentMethod}` : '';
  const message = `Clique de Compra: "${bookTitle}" [ID: ${bookId}]${priceStr}${methodStr}`;

  addSentryBreadcrumb('checkout', message, {
    bookId,
    bookTitle,
    priceAOA,
    paymentMethod,
    ...details
  }, 'info');
}

/**
 * Rastrear ações no carrinho (adicionar, remover, limpar, abrir checkout)
 */
export function trackCartAction(
  action: 'add' | 'remove' | 'clear' | 'checkout',
  item?: { id: string; title: string; priceAOA?: number },
  details?: Record<string, any>
) {
  let message = `Carrinho: Ação ${action.toUpperCase()}`;
  if (item) {
    message = `Carrinho [${action.toUpperCase()}]: "${item.title}" (${item.id})`;
  }

  addSentryBreadcrumb('cart', message, {
    action,
    item,
    ...details
  }, 'info');
}

/**
 * Rastrear ações de autenticação (login, registo, logout, redefinição de palavra-passe)
 */
export function trackAuthAction(action: string, userDetails?: Record<string, any>) {
  addSentryBreadcrumb('auth', `Ação de Autenticação: ${action}`, userDetails, 'info');
}

/**
 * Rastrear ações no leitor E-Reader (mudar capítulo, zen mode, tradução, TTS)
 */
export function trackReaderAction(
  action: string,
  bookInfo: { bookId: string; title?: string; chapterIndex?: number },
  details?: Record<string, any>
) {
  const chapterStr = bookInfo.chapterIndex !== undefined ? ` (Capítulo ${bookInfo.chapterIndex + 1})` : '';
  const titleStr = bookInfo.title ? ` "${bookInfo.title}"` : ` [ID: ${bookInfo.bookId}]`;
  const message = `E-Reader [${action}]:${titleStr}${chapterStr}`;

  addSentryBreadcrumb('reader', message, {
    action,
    ...bookInfo,
    ...details
  }, 'info');
}

/**
 * Obter a lista de breadcrumbs recentes em memória (para logs de diagnóstico)
 */
export function getRecentBreadcrumbs() {
  return [...recentBreadcrumbs];
}

export { Sentry };

