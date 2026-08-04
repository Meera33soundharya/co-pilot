import React, { createContext, useContext, useState } from "react";
import { listenOnce } from "@/utils/speech";

type Lang = 'en' | 'ta';

interface LangCtx {
  lang: Lang;
  langTag: string;
  setLang: (l: Lang) => void;
  detectAndSetLanguage: () => Promise<Lang>;
  t: (key: string) => string;
}

const translations: Record<string, Record<Lang, string>> = {
  'tap_microphone': { en: 'Tap the microphone and tell us your complaint.', ta: 'மைக்ரோஃபோன் பொத்தானை அழுத்தி உங்கள் புகாரை தெரிவிக்கவும்.' },
  'speak_name': { en: 'Hello. Please say your full name.', ta: 'வணக்கம். உங்கள் பெயரை சொல்லுங்கள்.' },
  'speak_phone': { en: 'Please say your phone number or say skip.', ta: 'உங்கள் தொலைபேசி எண்ணை சொல்லுங்கள், அல்லது பாஸிட் சொல்வதற்கு' },
  'speak_issue': { en: 'Now describe the problem you want to report.', ta: 'பயன்பாட்டிற்கான பிரச்சினையை சொல்லுங்கள்.' },
  'complaint_submitted': { en: 'Your complaint has been submitted. Case ID', ta: 'உங்கள் புகார் சமர்ப்பிக்கப்பட்டது. வழக்கு ஐடி' },
};

const Ctx = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  const setLang = (l: Lang) => setLangState(l);

  async function detectAndSetLanguage(): Promise<Lang> {
    // Try Tamil first with a short timeout, then English fallback
    try {
      const ta = await listenOnce('ta-IN', 4000);
      if (/[\u0B80-\u0BFF]/.test(ta) || ta.trim().length > 0 && ta.split(' ').length <= 20 && /[\u0B80-\u0BFF]/.test(ta)) {
        setLangState('ta');
        return 'ta';
      }
      const en = await listenOnce('en-IN', 4000);
      if (en && en.trim().length > 0) {
        setLangState('en');
        return 'en';
      }
    } catch (e) {
      // ignore
    }
    // fallback to browser locale
    const nav = typeof navigator !== 'undefined' ? (navigator.language || 'en').toLowerCase() : 'en';
    const detected: Lang = nav.startsWith('ta') ? 'ta' : 'en';
    setLangState(detected);
    return detected;
  }

  const ctx: LangCtx = {
    lang,
    langTag: lang === 'ta' ? 'ta-IN' : 'en-IN',
    setLang,
    detectAndSetLanguage,
    t: (key: string) => (translations[key] ? translations[key][lang] : key),
  };

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useLanguage must be used within LanguageProvider');
  return c;
}
