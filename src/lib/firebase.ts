import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore,
  setLogLevel, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { BookProgress, Bookmark, Highlight } from '../types';

// Silence verbose internal connection retry warnings when operating offline or during connection handshakes
setLogLevel('silent');

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

/**
 * Uploads a file/blob to Firebase Storage with automatic fallback to DataURL for offline/sandbox testing
 */
export async function uploadFileToFirebaseStorage(file: File | Blob, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload direct fallback to local DataURL:', error);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Helper to upload a book cover to storage
 */
export async function uploadBookCover(file: File, bookId?: string): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `book_covers/${bookId || 'temp'}_${timestamp}_${safeName}`;
  return uploadFileToFirebaseStorage(file, path);
}

/**
 * Helper to upload a user avatar to storage
 */
export async function uploadUserAvatar(file: File, userId: string): Promise<string> {
  const safeId = userId.replace(/[^a-zA-Z0-9]/g, '_');
  const path = `avatars/${safeId}_${Date.now()}`;
  return uploadFileToFirebaseStorage(file, path);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Translates Firebase Auth error codes to user-friendly Portuguese messages
 */
export function getFirebaseAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'Nenhuma conta encontrada com este e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou palavra-passe incorreta. Por favor tente novamente.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está associado a outra conta. Tente iniciar sessão.';
    case 'auth/weak-password':
      return 'A palavra-passe deve conter pelo menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'Por favor insira um endereço de e-mail válido.';
    case 'auth/popup-closed-by-user':
      return 'A janela de início de sessão com Google foi fechada.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela de login. Por favor permita popups.';
    case 'auth/network-request-failed':
      return 'Falha na ligação à rede. Verifique a sua ligação à internet.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas falhadas. Aguarde um instante e tente novamente.';
    case 'auth/operation-not-allowed':
      return 'O método de autenticação por e-mail/palavra-passe não está ativado no Firebase Console (Authentication > Sign-in method). Ative o provedor Email/Password no console do Firebase.';
    case 'auth/unauthorized-domain':
      return 'Domínio de publicação não autorizado no Firebase. Para permitir login na Vercel ou domínio personalizado, adicione o seu domínio em Firebase Console > Authentication > Settings > Authorized Domains.';
    case 'auth/user-disabled':
      return 'Esta conta de utilizador foi desativada pelo administrador.';
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta registada com este endereço de e-mail usando outro método de acesso (Google ou Palavra-passe).';
    case 'auth/requires-recent-login':
      return 'Esta operação requer uma autenticação recente. Por favor, termine sessão e volte a entrar.';
    default:
      return error?.message || 'Ocorreu um erro na autenticação. Tente novamente.';
  }
}

/**
 * Firebase Auth Helper Services
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
}

export async function loginWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
}

export async function registerWithEmail(email: string, pass: string, name?: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && result.user) {
      await updateProfile(result.user, { displayName: name });
    }
    return result.user;
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
}

export async function logoutFirebase() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao terminar sessão no Firebase:', error);
  }
}

export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(getFirebaseAuthErrorMessage(error));
  }
}

export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Tests connection to Firestore with timeout and graceful offline handling
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('connection_timeout')), 4000)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('offline') || msg.includes('unavailable') || msg.includes('Failed to fetch') || msg.includes('connection_timeout')) {
      console.warn("Firestore em modo de cache local / offline.");
    } else {
      console.info("Info de ligação Firestore:", msg);
    }
    return false;
  }
}

export interface UserSyncData {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  purchasedBookIds: string[];
  favoriteBookIds: string[];
  readingProgressMap?: Record<string, BookProgress>;
  bookmarks?: Bookmark[];
  highlights?: Highlight[];
  theme?: 'dark' | 'light';
  updatedAt?: any;
  lastSyncedAt?: string;
}

/**
 * Normalizes user ID or email into a valid Firestore doc key, prioritizing auth.currentUser.uid
 */
const getDocId = (userIdOrEmail?: string): string | null => {
  if (auth.currentUser && auth.currentUser.uid) {
    return auth.currentUser.uid;
  }
  return null;
};

/**
 * Saves or updates user library, favorites, reading progress, bookmarks, highlights, and theme in Firestore.
 * Requires an active Firebase Auth user session to comply with firestore.rules security boundaries.
 */
export async function syncUserDataToFirestore(userData: UserSyncData): Promise<void> {
  if (!userData) return;
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) {
    // User is offline or using local demo profile; skip remote Firestore sync
    return;
  }

  const docId = currentUid;
  const path = `users/${docId}`;
  try {
    const userRef = doc(db, 'users', docId);
    
    const updatePayload: Record<string, any> = {
      id: docId,
      name: userData.name || auth.currentUser?.displayName || 'Leitor Zola',
      email: userData.email || auth.currentUser?.email || '',
      role: userData.role || 'customer',
      purchasedBookIds: userData.purchasedBookIds || [],
      favoriteBookIds: userData.favoriteBookIds || [],
      readingProgressMap: userData.readingProgressMap || {},
      bookmarks: userData.bookmarks || [],
      highlights: userData.highlights || [],
      updatedAt: serverTimestamp()
    };

    if (userData.theme) {
      updatePayload.theme = userData.theme;
    }
    
    await setDoc(userRef, updatePayload, { merge: true });
  } catch (error: any) {
    // If the session expired or permissions were denied, log gracefully without breaking the UI
    if (error?.code === 'permission-denied' || error?.message?.includes('insufficient permissions')) {
      console.warn('Sincronização Firestore ignorada (sessão não autorizada ou utilizador local):', error?.message);
      return;
    }
    console.error('Erro ao sincronizar dados com Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Handled
    }
  }
}

/**
 * Fetches user sync data from Firestore once (requires authenticated user)
 */
export async function fetchUserDataFromFirestore(userIdOrEmail?: string): Promise<UserSyncData | null> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) return null;
  
  const docId = currentUid;
  const path = `users/${docId}`;
  try {
    const userRef = doc(db, 'users', docId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserSyncData;
    }
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('insufficient permissions')) {
      console.warn('Procura de dados Firestore ignorada (sem permissão ativa):', error?.message);
      return null;
    }
    console.error('Erro ao procurar dados no Firestore:', error);
  }
  return null;
}

/**
 * Real-time listener for user library, favorites, progress, and bookmarks sync across devices
 */
export function subscribeToUserSyncData(
  userIdOrEmail: string, 
  onUpdate: (data: UserSyncData) => void
) {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid) return () => {};
  
  const docId = currentUid;
  const path = `users/${docId}`;
  const userRef = doc(db, 'users', docId);

  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as UserSyncData;
      onUpdate(data);
    }
  }, (err) => {
    if (err?.code === 'permission-denied') {
      console.warn('Snapshot listener Firestore pausado: aguardando autenticação ativa.');
    } else {
      console.warn('Snapshot listener error em Firestore:', err);
    }
  });
}



