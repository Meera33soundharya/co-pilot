// ─────────────────────────────────────────────────────────────────────────────
//  GovPilot — Global Language Context
//  Single source of truth for language state across the entire application.
//
//  IMPORTANT RULE:
//  This context controls APPLICATION UI language ONLY.
//  Complaint text submitted by citizens is NEVER translated here.
//  Always display complaint.issue as-is from the database.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, type Lang } from "../translations";

interface LanguageContextValue {
  /** Current active language */
  language: Lang;
  /** Toggle between 'en' and 'ta' */
  toggleLanguage: () => void;
  /** Set language directly */
  setLanguage: (lang: Lang) => void;
  detectAndSetLanguage?: (text: string) => void;
  /** Translate a UI key. Returns English fallback if key missing in Tamil. */
  t: (key: string, fallback?: string) => string;

  // Legacy aliases (for VoiceAssistant compatibility)
  lang: Lang;
  langTag: string;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "govpilot_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "ta" || saved === "en") return saved;
    } catch {
      // localStorage blocked
    }
    return "en";
  });

  // Persist to localStorage whenever language changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLang(prev => (prev === "en" ? "ta" : "en"));
  }, []);

  const setLanguage = useCallback((lang: Lang) => {
    setLang(lang);
  }, []);

  /**
   * Translate a UI key to the current language.
   * NEVER use this for citizen complaint text — display complaint.issue directly.
   */
  const t = useCallback(
    (key: string, fallback?: string): string => {
      try {
        const dict = translations[language];
        if (dict && dict[key]) return dict[key];
        // Fallback to English if key missing in Tamil
        const enDict = translations["en"];
        if (enDict && enDict[key]) return enDict[key];
      } catch {
        // ignore
      }
      // Last resort: return the key itself or the provided fallback
      return fallback ?? key;
    },
    [language]
  );

  const value: LanguageContextValue = {
    language,
    toggleLanguage,
    setLanguage,
    t,
    // Legacy aliases
    lang: language,
    langTag: language === "ta" ? "ta-IN" : "en-IN",
    setLang: setLanguage,
    detectAndSetLanguage: () => {},
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
