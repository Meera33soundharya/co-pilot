import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface LanguageToggleProps {
  variant?: "pill" | "buttons" | "minimal";
  className?: string;
}

export default function LanguageToggle({ variant = "pill", className = "" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === "minimal") {
    return (
      <div className={`inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm p-1 rounded-xl border border-white/20 ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            language === "en" ? "bg-white text-gray-900 shadow-sm" : "text-white/80 hover:text-white"
          }`}
        >
          English
        </button>
        <span className="text-white/30 text-xs">|</span>
        <button
          type="button"
          onClick={() => setLanguage("ta")}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            language === "ta" ? "bg-white text-gray-900 shadow-sm" : "text-white/80 hover:text-white"
          }`}
        >
          தமிழ்
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shadow-sm p-0.5 ${className}`}>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-label="Switch to English"
        className={`px-3 py-1.5 text-xs font-black tracking-wide rounded-lg transition-all duration-150 ${
          language === "en"
            ? "bg-[#B91C1C] text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
        }`}
      >
        English
      </button>
      <div className="w-px h-3.5 bg-gray-300 mx-0.5" />
      <button
        type="button"
        onClick={() => setLanguage("ta")}
        aria-label="தமிழுக்கு மாற்றவும்"
        className={`px-3 py-1.5 text-xs font-black tracking-wide rounded-lg transition-all duration-150 ${
          language === "ta"
            ? "bg-[#B91C1C] text-white shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
}
