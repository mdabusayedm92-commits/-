import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signInAnonymously,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ADMIN_EMAIL, isVerifiedAdminEmail } from './storeUtils';

export { ADMIN_EMAIL, isVerifiedAdminEmail };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
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

export function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'ইমেইল ঠিকানাটি সঠিক নয়।';
    case 'auth/user-disabled':
      return 'এই অ্যাকাউন্টটি সাময়িকভাবে বন্ধ করা হয়েছে।';
    case 'auth/user-not-found':
      return 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
    case 'auth/email-already-in-use':
      return 'এই ইমেইল দিয়ে আগেই একটি অ্যাকাউন্ট খোলা হয়েছে। লগইন করুন।';
    case 'auth/weak-password':
      return 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
    case 'auth/too-many-requests':
      return 'অতিরিক্ত চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
    case 'auth/popup-closed-by-user':
      return 'গুগল লগইন পপআপ বন্ধ করা হয়েছে। আবার চেষ্টা করুন।';
    case 'auth/popup-blocked':
      return 'ব্রাউজার পপআপ ব্লক করেছে। অনুগ্রহ করে পপআপ অনুমতি দিন।';
    case 'auth/operation-not-allowed':
      return 'ইমেইল/পাসওয়ার্ড লগইন Firebase Console-এ চালু করা নেই। এখন গুগল দিয়ে লগইন করুন অথবা Firebase Console থেকে Email/Password চালু করুন।';
    default:
      return (err as Error)?.message || 'লগইন সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।';
  }
}

export async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'shopSettings', 'public'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signInAnonymously,
  signOut
};
