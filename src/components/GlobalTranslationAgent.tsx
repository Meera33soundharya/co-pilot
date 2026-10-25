import React, { useState } from "react";
import {
  Languages,
  ArrowRightLeft,
  Loader2,
  Copy,
  Check,
  X,
  Volume2,
  Sparkles,
  Maximize2,
  Minimize2
} from "lucide-react";
import { executeTranslationAgent } from "../services/translationAgent";
import type {
  TargetLanguageMode,
  TranslationAgentResponse
} from "../services/translationAgent";

export default function GlobalTranslationAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [targetMode, setTargetMode] = useState<TargetLanguageMode>("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationAgentResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleTranslate = async (overrideMode?: TargetLanguageMode) => {
    const mode = overrideMode || targetMode;
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await executeTranslationAgent(inputText, mode);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.translatedText) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, lang: "ta" | "en") => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ta" ? "ta-IN" : "en-US";
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const swapDirection = () => {
    if (targetMode === "ta") {
      setTargetMode("en");
      if (result?.translatedText) {
        setInputText(result.translatedText);
        handleTranslate("en");
      }
    } else if (targetMode === "en") {
      setTargetMode("ta");
      if (result?.translatedText) {
        setInputText(result.translatedText);
        handleTranslate("ta");
      }
    } else {
      setTargetMode("ta");
    }
  };

  return (
    <>
      {/* Floating trigger button on bottom left to avoid clashing with AIAssistant on bottom right */}
      {!isOpen && (
        <button
          id="global-translation-agent-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-medium rounded-full shadow-2xl shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/30 group"
          title="Open Tamil & English Translation Agent"
        >
          <div className="relative">
            <Languages className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide">
            தமிழ் ⇄ English Agent
          </span>
        </button>
      )}

      {/* Translation Agent Modal / Dialog */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Tamil ⇄ English Agent
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                    AI Active
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Real-time bilingual translation for governance & citizens
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Target Language Switcher */}
            <div className="flex items-center justify-between bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setTargetMode("auto");
                  if (inputText) handleTranslate("auto");
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl font-medium transition ${
                  targetMode === "auto"
                    ? "bg-slate-800 text-emerald-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Auto Detect
              </button>
              <button
                onClick={() => {
                  setTargetMode("ta");
                  if (inputText) handleTranslate("ta");
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl font-medium transition ${
                  targetMode === "ta"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Into தமிழ்
              </button>
              <button
                onClick={() => {
                  setTargetMode("en");
                  if (inputText) handleTranslate("en");
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl font-medium transition ${
                  targetMode === "en"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Into English
              </button>
              <button
                onClick={swapDirection}
                title="Swap Direction"
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Input Box */}
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleTranslate();
                  }
                }}
                rows={3}
                placeholder="Type or paste in Tamil (தமிழ்), Tanglish, or English..."
                className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none font-normal"
              />
              {inputText && (
                <button
                  onClick={() => setInputText("")}
                  className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-300"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action Button & Sample Chips */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5 overflow-x-auto text-[11px]">
                <button
                  onClick={() => {
                    setInputText("குடிநீர் விநியோகம் 3 நாட்களாக தடைபட்டுள்ளது");
                    executeTranslationAgent("குடிநீர் விநியோகம் 3 நாட்களாக தடைபட்டுள்ளது", "en").then(setResult);
                  }}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg transition border border-slate-700/50"
                >
                  குடிநீர் விநியோகம்
                </button>
                <button
                  onClick={() => {
                    setInputText("Road damaged with potholes near bus stand");
                    executeTranslationAgent("Road damaged with potholes near bus stand", "ta").then(setResult);
                  }}
                  className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg transition border border-slate-700/50"
                >
                  Potholes repair
                </button>
              </div>

              <button
                onClick={() => handleTranslate()}
                disabled={loading || !inputText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/50 transition shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Translate
                  </>
                )}
              </button>
            </div>

            {/* Translation Output Card */}
            {result && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 relative">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1.5 border-b border-slate-800/70">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <span>{result.sourceLang === "ta" ? "தமிழ்" : "English"}</span>
                    <span>→</span>
                    <span className="text-white font-bold">
                      {result.targetLang === "ta" ? "தமிழ் (Tamil)" : "English"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSpeak(result.translatedText, result.targetLang)}
                      disabled={speaking}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                      title="Listen audio"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${speaking ? "text-emerald-400 animate-pulse" : ""}`} />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition flex items-center gap-1 text-[11px]"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-100 leading-relaxed whitespace-pre-wrap select-text">
                  {result.translatedText}
                </p>

                {result.tanglish && (
                  <div className="pt-1.5 text-xs text-slate-400 border-t border-slate-800/50">
                    <span className="text-slate-500 font-mono text-[10px] uppercase mr-1">Pronunciation:</span>
                    <span className="italic text-emerald-300/80">{result.tanglish}</span>
                  </div>
                )}

                {result.grammarNote && (
                  <div className="text-[11px] text-slate-500 italic">
                    ℹ️ {result.grammarNote}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
