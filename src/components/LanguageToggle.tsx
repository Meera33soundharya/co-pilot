import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang, detectAndSetLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-gray-500">🌐</div>
      <button onClick={() => setLang('en')} className={`px-2 py-1 rounded ${lang==='en'?'bg-gray-900 text-white':'bg-gray-50'}`}>English</button>
      <button onClick={() => setLang('ta')} className={`px-2 py-1 rounded ${lang==='ta'?'bg-gray-900 text-white':'bg-gray-50'}`}>தமிழ்</button>
      <button onClick={() => detectAndSetLanguage()} className="px-2 py-1 rounded bg-gray-50">Auto</button>
    </div>
  );
}
