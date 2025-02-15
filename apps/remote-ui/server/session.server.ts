import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { getFirebaseAdminAuth } from "./firebase/firebase-admin.server";
import { auth } from "./firebase/firebase.server";
import { signInWithCustomToken } from "firebase/auth";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(idToken: string, redirectTo: string) {
  const token = await getFirebaseAdminAuth().verifyIdToken(idToken);
  const session = await storage.getSession();
  session.set("token", token.uid);
  
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) return null;
  
  try {
    const user = await getFirebaseAdminAuth().getUser(token);
    return user;
  } catch {
    return null;
  }
}

export async function requireUser(request: Request) {
  if(!auth.currentUser){
    // destroy session cookie
    const session = await storage.getSession(request.headers.get("Cookie"));
    throw redirect("/", {
      headers: {
        "Set-Cookie": await storage.destroySession(session),
      },
    });
  }

  const user = await getUserSession(request);

  // check if firebase user is null

  if (!user) {
    throw redirect("/");
  }
  return user;
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  console.log("LOGOUT")
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}