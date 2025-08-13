import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const AuthCtx = createContext({
  currentUser: null,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Force-refresh the user object (needed after updateProfile)
  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();         // pull latest profile from server
      // push a new object ref so React actually re-renders
      setCurrentUser({ ...auth.currentUser });
    }
  };

  return (
    <AuthCtx.Provider value={{ currentUser, loading, refreshUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
