"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import vi from "./vi";
import en from "./en";
import fr from "./fr";
import zh from "./zh";

export type Language = "vi" | "en" | "fr" | "zh";

const translations = { vi, en, fr, zh };

export type Translations = typeof vi;

const STORAGE_KEY = "customer-language";
const DEFAULT_LANGUAGE: Language = "vi";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

/**
 * Get stored language from localStorage (for use outside React components)
 * Falls back to default language if not set or invalid
 */
export function getStoredLocale(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === "vi" || stored === "en" || stored === "fr" || stored === "zh")) {
      return stored as Language;
    }
  } catch {
    // localStorage not available
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Set language in localStorage (for use outside React components)
 */
export function setStoredLocale(lang: Language): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage not available
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    setLangState(getStoredLocale());
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    setStoredLocale(newLang);
  }, []);

  const t = useMemo(() => translations[lang], [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  // Prevent hydration mismatch by using default until mounted
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ lang: DEFAULT_LANGUAGE, setLang, t: translations[DEFAULT_LANGUAGE] }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
