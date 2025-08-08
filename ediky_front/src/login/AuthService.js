import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

export async function setPersist(remember) {
  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    console.log("[auth] persistence:", remember ? "local" : "session");
  } catch (e) {
    console.warn("[auth] local persistence blocked; falling back to session:", e?.code);
    await setPersistence(auth, browserSessionPersistence);
  }
}

export async function loginWithEmail(email, password, remember = true) {
  await setPersist(remember);
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signupWithEmail(email, password, remember = true) {
  await setPersist(remember);
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}

export async function loginWithGoogle(remember = true) {
  await setPersist(remember);
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  return user;
}

export async function sendReset(email) {
  return sendPasswordResetEmail(auth, email);
}
