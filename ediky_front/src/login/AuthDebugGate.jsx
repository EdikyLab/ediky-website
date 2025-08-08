import { useEffect } from "react";
import { getApp } from "firebase/app";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function AuthDebugGate({ children }) {
  useEffect(() => {
    const app = getApp();
    console.log("[app] projectId:", app.options.projectId);
    console.log("[app] authDomain:", app.options.authDomain);
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("[auth] onAuthStateChanged:", !!u, u?.email);
    });
    return unsub;
  }, []);
  return children;
}
