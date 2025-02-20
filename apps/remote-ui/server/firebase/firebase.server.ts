import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { appConfig } from "../config.server";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

export const app = initializeApp(appConfig.firebase);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);
