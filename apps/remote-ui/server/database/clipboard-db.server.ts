import { database } from '../firebase.server';
import { ref, set, onValue, get } from 'firebase/database';


export async function publishText(text: string){
   return set(ref(database, "clipboard"), {
      content: text,
      timestamp: Date.now(),
    });
}

export function subscribeText(fn : (newContent: string) => void) {
  return onValue(ref(database, "clipboard"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
         fn(data.content || "");
      }
   }
   );
}

export async function getText(): Promise<string>{
   const snapshot = await get(ref(database, "clipboard"));
   const data = snapshot.val();
   return data?.content || "";
}