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
  updatedAt?: any;
  lastSyncedAt?: string;
}

/**
 * Normalizes user ID or email into a valid Firestore doc key
 */
const getDocId = (userIdOrEmail: string): string => {
  return userIdOrEmail.replace(/[/.]/g, '_').toLowerCase();
};

/**
 * Saves or updates user library, favorites, reading progress, bookmarks, and highlights in Firestore
 */
export async function syncUserDataToFirestore(userData: UserSyncData): Promise<void> {
  if (!userData || !userData.id) return;
  const docId = getDocId(userData.id);
  const path = `users/${docId}`;
  try {
    const userRef = doc(db, 'users', docId);
    
    await setDoc(userRef, {
      id: userData.id,
      name: userData.name || 'Leitor Zola',
      email: userData.email || '',
      role: userData.role || 'customer',
      purchasedBookIds: userData.purchasedBookIds || [],
      favoriteBookIds: userData.favoriteBookIds || [],
      readingProgressMap: userData.readingProgressMap || {},
      bookmarks: userData.bookmarks || [],
      highlights: userData.highlights || [],
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Erro ao sincronizar dados com Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // rethrow or handle handled
    }
  }
}

/**
 * Fetches user sync data from Firestore once
 */
export async function fetchUserDataFromFirestore(userIdOrEmail: string): Promise<UserSyncData | null> {
  if (!userIdOrEmail) return null;
  const docId = getDocId(userIdOrEmail);
  const path = `users/${docId}`;
  try {
    const userRef = doc(db, 'users', docId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserSyncData;
    }
  } catch (error) {
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
  if (!userIdOrEmail) return () => {};
  
  const docId = getDocId(userIdOrEmail);
  const path = `users/${docId}`;
  const userRef = doc(db, 'users', docId);

  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as UserSyncData;
      onUpdate(data);
    }
  }, (err) => {
    console.warn('Snapshot listener error em Firestore:', err);
  });
}



