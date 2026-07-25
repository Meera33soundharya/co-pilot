import React, { useState } from "react";
import { Mic, Loader2, RefreshCcw, Check, Languages } from "lucide-react";
import { useVoiceAssistant, type VoiceLanguage } from "@/hooks/useVoiceAssistant";

interface VoiceAssistantFABProps {
  onResult: (text: string) => void;
  className?: string;
}

export function VoiceAssistantFAB({ onResult, className = "" }: VoiceAssistantFABProps) {
  const [lang, setLang] = useState<VoiceLanguage>("ta-IN");
  const [showLangMenu, setShowLangMenu] = useState(false);

  const {
    isListening,
    isProcessing,
    error,
    toggleListening,
    isSupported
  } = useVoiceAssistant({
    onResult,
    lang
  });

  if (!isSupported) {
    return null; // hide entirely if unsupported
  }

  return (
    <div className={`fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50 ${className}`}>
      
      {/* Language Selector Popover */}
      {showLangMenu && (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 mb-2 animate-in slide-in-from-bottom-2">
          {[
            { code: "en-IN", label: "EN", title: "English" },
            { code: "hi-IN", label: "HI", title: "Hindi (हिंदी)" },
            { code: "ta-IN", label: "TA", title: "Tamil (தமிழ்)" },
          ].map(l => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code as VoiceLanguage);
                setShowLangMenu(false);
              }}
              className={`px-4 py-3 rounded-lg text-lg font-black transition-colors ${
                lang === l.code ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"
              }`}
              title={l.title}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Language Toggle Button */}
        {!isListening && !isProcessing && (
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
            title="Change Language"
          >
            <Languages className="w-5 h-5" />
          </button>
        )}

        {/* Retry Button on Error */}
        {error && !isListening && !isProcessing && (
          <button
            onClick={toggleListening}
            className="h-14 px-5 rounded-full bg-red-100 text-red-600 shadow-lg font-bold flex items-center gap-2 hover:bg-red-200 transition-colors animate-in zoom-in"
          >
            <RefreshCcw className="w-5 h-5" /> Retry
          </button>
        )}

        {/* Main Mic Button */}
        <button
          onClick={toggleListening}
          disabled={isProcessing}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isProcessing
              ? "bg-green-500 text-white scale-100"
              : isListening
              ? "bg-red-500 text-white scale-110 animate-pulse ring-4 ring-red-500/30"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
          }`}
          title="Voice Assistant"
        >
          {isProcessing ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>
    </div>
  );
}
