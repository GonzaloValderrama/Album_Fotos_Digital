import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, OWNER_EMAIL } from "../firebase/config";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsOwner(currentUser?.email === OWNER_EMAIL);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== OWNER_EMAIL) {
        // If someone else logs in, sign them out immediately
        await signOut(auth);
        throw new Error("No tienes permisos de administrador.");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    isOwner,
    loading,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
