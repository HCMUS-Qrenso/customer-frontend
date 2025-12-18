'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { translations, Language, Translations } from './translations';

const LANGUAGE_STORAGE_KEY = 'qrenso_preferred_language';
const DEFAULT_LANGUAGE: Language = 'vi';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLang?: Language;
}

export function LanguageProvider({ children, initialLang }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Language>(initialLang ?? DEFAULT_LANGUAGE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'vi' || stored === 'en') {
      setLangState(stored);
    }
    setIsHydrated(true);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
  }, []);

  const t = useMemo(() => translations[lang], [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  // Prevent hydration mismatch by rendering with default until client is ready
  if (!isHydrated) {
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

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
