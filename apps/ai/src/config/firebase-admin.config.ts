import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

export function getFirebaseAdminAuth() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(firebaseAdminConfig),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  }
  return getAuth();
}