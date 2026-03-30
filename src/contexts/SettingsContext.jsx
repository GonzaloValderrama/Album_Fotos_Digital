import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    primaryColor: "#0f172a", // Default dark slate
    backgroundColor: "#ffffff",
    fontFamily: "Inter, sans-serif",
  });
  const [loading, setLoading] = useState(true);

  // Listen to Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "config"), (docRef) => {
      if (docRef.exists()) {
        const data = docRef.data();
        setSettings((prev) => ({ ...prev, ...data }));
        
        // Apply CSS Variables
        const root = document.documentElement;
        if (data.primaryColor) root.style.setProperty("--primary-color", data.primaryColor);
        if (data.backgroundColor) root.style.setProperty("--background-color", data.backgroundColor);
        if (data.fontFamily) root.style.setProperty("--font-family", data.fontFamily);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  // Update Settings
  const updateSettings = async (newSettings) => {
    try {
      await setDoc(doc(db, "settings", "config"), newSettings, { merge: true });
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
        {children}
    </SettingsContext.Provider>
  );
};
