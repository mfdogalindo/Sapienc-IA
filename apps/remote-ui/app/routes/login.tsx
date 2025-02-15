import { auth } from "server/firebase/firebase.server";
import { signInWithEmailAndPassword } from "firebase/auth";
import { createUserSession, getUserSession } from "server/session.server";

export async function action({ request }) {
   // Obtener el encabezado Authorization
   const authHeader = request.headers.get("Authorization");
 
   // Si no existe o no empieza con "Basic ", se requiere autenticación
   if (!authHeader || !authHeader.startsWith("Basic ")) {
     return new Response("Authentication required", {
       status: 401,
       headers: {
         "WWW-Authenticate": 'Basic realm="Mi App"',
       },
     });
   }
 
   // Extraer la parte codificada en Base64 y decodificarla
   const base64Credentials = authHeader.split(" ")[1];
   const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
 
   // Se espera el formato "email:contraseña"
   const [email, password] = credentials.split(":");
 
   try {
     const userCredential = await signInWithEmailAndPassword(auth, email, password);
     const idToken = await userCredential.user.getIdToken();
     return createUserSession(idToken, "/todos");
   } catch (error) {
     return new Response("Invalid login credentials", { status: 400 });
   }
 }