import { signInWithCustomToken } from "firebase/auth";
import { getFirebaseAdminAuth } from "../config/firebase-admin.config";
import { auth, db } from "../config/firebase-config";
import { DatabaseReference, DataSnapshot, ref as dbRef, onValue, set } from "firebase/database";
import { EventEmitter } from "events";

export class FirebaseCoordinator {
   private dbRef: DatabaseReference | undefined = undefined;
   private emittersMap: Map<string, EventEmitter> = new Map<string, EventEmitter>();
   private lastValues: Map<string, any> = new Map<string, any>();

   constructor() {

   }

   async loginAndSubscribe() {
      const authAdmin = getFirebaseAdminAuth();
      const token = await authAdmin.createCustomToken('storage-user', { authorized: true });
      // Sign in with custom token
      await signInWithCustomToken(auth, token).then((userCredential) => {
         console.log('Signed in with custom token: ', userCredential.user.uid);
         this.dbRef = dbRef(db, 'coordinator');
         onValue(this.dbRef, (snapshot) => {
            this.listener(snapshot);
         });
      })
   }

   createEmitter(name: string): EventEmitter {
      const emitter = new EventEmitter();
      this.emittersMap.set(name, emitter);
      return emitter;
   }

   removeEmitter(name: string): void {
      this.emittersMap.delete(name);
   }

   getEmitter(name: string): EventEmitter | undefined {
      return this.emittersMap.get(name);
   }

   private isEqual(val1: any, val2: any): boolean {
      return JSON.stringify(val1) === JSON.stringify(val2);
   }

   listener(snapshot: DataSnapshot) {
      const data = snapshot.val();
      if (data) {
         for (const [key, value] of Object.entries(data)) {
            if (this.emittersMap.has(key)) {
               const previousValue = this.lastValues.get(key);
               if (!this.isEqual(previousValue, value)) {
                  this.lastValues.set(key, value);
                  this.emittersMap.get(key)?.emit('data', value);
               }
            }
         }
      }
   }

   publish(key: string, data: any) {
      if (this.dbRef) {
         set(dbRef(db, key), data);
      }
   }

   read(key: string): any {
      return this.lastValues.get(key);
   }

}