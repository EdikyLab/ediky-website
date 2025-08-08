// src/pages/AuthTest.jsx
import React from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../login/firebaseConfig";
import { useAuth } from "../login/AuthContext";
import { setPersist } from "../login/AuthService";

export default function AuthTest() {
  const { currentUser, loading } = useAuth();

  const login = async () => {
    await setPersist(true);
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Auth Test</h2>
      <pre>loading: {String(loading)}</pre>
      <pre>user: {currentUser ? currentUser.email : "null"}</pre>
      <button onClick={login}>Google Login</button>
      <button onClick={() => signOut(auth)}>Sign out</button>
      <p>Hard refresh after logging in. If user stays non-null, persistence works.</p>
    </div>
  );
}
