
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { appConfig } from "./config.server";
import { getAuth } from 'firebase-admin/auth';


export function getFirebaseAdminAuth() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(appConfig.firebaseAdmin),
    });
  }
  return getAuth();
}

 