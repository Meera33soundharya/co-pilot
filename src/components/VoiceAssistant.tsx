/**
 * VoiceAssistant — Floating Action Button Voice Complaint
 *
 * A floating mic button available on every page.
 * Simplified: one press → speak your complaint → AI classifies → submit.
 * Uses the current agentVoiceService (Tamil-only TTS/STT).
 */

import { useState, useCallback, useRef } from "react";
import { Mic, X, Loader2, CheckCircle2, AlertCircle, Bot, RefreshCw, ArrowRight } from "lucide-react";
import { useComplaints } from "@/context/ComplaintsContext";
import {
  speakText, listenForSpeech, classifyComplaint, PROMPTS,
} from "@/services/agentVoiceService";

// ── Waveform ─────────────────────────────────────────────────────────────

function MiniWaveform() {
  return (
    <div className="flex items-center justify-center gap-[2px] h-5">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="w-[2px] bg-white rounded-full"
          style={{
            animation: `fabWave 0.7s ease-in-out ${(i * 0.1).toFixed(1)}s infinite alternate`,
            height: "4px",
          }}
        />
      ))}
      <style>{`
        @keyframes fabWave {
          0%   { height: 3px; }
          100% { height: 16px; }
        }
      `}</style>
    </div>
  );
}

// ── FAB States ────────────────────────────────────────────────────────────

type FabState = "idle" | "listening" | "thinking" | "preview" | "submitting" | "done" | "error";

interface PreviewData {
  name: string;
  complaint: string;
  area: string;
  ward: string;
  category: string;
  dept: string;
  priority: "High" | "Medium" | "Low";
  estimatedTime: string;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function VoiceAssistant() {
  const { addComplaint } = useComplaints();
  const [open, setOpen] = useState(false);
  const [fabState, setFabState] = useState<FabState>("idle");
  const [liveText, setLiveText] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [ticketId, setTicketId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const abortRef = useRef(false);

  const isActive = !["idle", "done", "error"].includes(fabState);

  // ── Reset ─────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    abortRef.current = true;
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    setFabState("idle");
    setLiveText("");
    setPreview(null);
    setTicketId("");
    setErrorMsg("");
    // Allow new flows after a tick
    setTimeout(() => { abortRef.current = false; }, 100);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    setOpen(false);
  }, [reset]);

  // ── Helper: safe speak ────────────────────────────────────────────────

  const speak = async (text: string) => {
    if (abortRef.current) return;
    await speakText(text);
  };

  // ── Helper: safe listen ───────────────────────────────────────────────

  const listen = (maxMs: number): Promise<string> => {
    return listenForSpeech({
      maxMs,
      silenceAfterMs: 2500,
      onInterim: (t) => setLiveText(t),
    });
  };

  // ── Main flow ─────────────────────────────────────────────────────────

  const startFlow = useCallback(async () => {
    abortRef.current = false;
    setOpen(true);
    setPreview(null);
    setErrorMsg("");
    setLiveText("");

    try {
      // 1. Welcome
      await speak(PROMPTS.welcome);
      if (abortRef.current) return;

      // 2. Name
      await speak(PROMPTS.ask_name);
      if (abortRef.current) return;
      setFabState("listening");
      let name = await listen(60_000);
      setLiveText("");
      if (abortRef.current) return;

      if (!name) {
        await speak(PROMPTS.name_timeout);
        name = await listen(30_000);
        if (!name) { setFabState("error"); setErrorMsg(PROMPTS.retry); return; }
      }

      // 3. Complaint
      await speak(PROMPTS.ask_complaint);
      if (abortRef.current) return;
      setFabState("listening");
      let complaint = await listen(180_000);
      setLiveText("");
      if (abortRef.current) return;

      if (!complaint) {
        await speak(PROMPTS.complaint_timeout);
        complaint = await listen(60_000);
        if (!complaint) { setFabState("error"); setErrorMsg(PROMPTS.retry); return; }
      }

      // 4. Area
      await speak(PROMPTS.ask_area);
      if (abortRef.current) return;
      setFabState("listening");
      let area = await listen(120_000);
      setLiveText("");
      if (!area) area = "Not specified";
      if (abortRef.current) return;

      // 5. Ward
      await speak(PROMPTS.ask_ward);
      if (abortRef.current) return;
      setFabState("listening");
      let ward = await listen(120_000);
      setLiveText("");
      if (!ward) ward = area; // fallback to area
      if (abortRef.current) return;

      // 6. AI classification
      setFabState("thinking");
      await speak(PROMPTS.processing);
      const fields = { name, complaint, area, ward };
      const classified = await classifyComplaint(fields);

      setPreview({
        name,
        complaint,
        area,
        ward,
        category: classified.category,
        dept: classified.dept,
        priority: classified.priority,
        estimatedTime: classified.estimatedTime,
      });

      // 7. Read out summary
      await speak(PROMPTS.buildSummary(fields));
      await speak(PROMPTS.ask_confirm);
      if (abortRef.current) return;

      setFabState("preview");
    } catch (err) {
      if (!abortRef.current) {
        setFabState("error");
        setErrorMsg(PROMPTS.error);
      }
    }
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    if (!preview) return;
    setFabState("submitting");

    try {
      const id = await addComplaint({
        citizen: preview.name,
        phone: "N/A",
        ward: preview.ward || preview.area,
        issue: preview.complaint.substring(0, 120),
        description: preview.complaint,
        priority: preview.priority,
        category: preview.category as any,
        dept: preview.dept,
        location: preview.area,
        notifPref: "None",
        source: "voice",
        estimatedTime: preview.estimatedTime,
      });

      setTicketId(id as string);
      setFabState("done");
      await speakText(PROMPTS.success(id as string));

      setTimeout(() => {
        setOpen(false);
        reset();
      }, 6000);
    } catch (err) {
      setFabState("error");
      setErrorMsg(PROMPTS.error);
    }
  }, [preview, addComplaint, reset]);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">

      {/* Popup panel */}
      {open && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#1e3a57] to-[#2B4B6F]">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-300" />
              <span className="text-white font-black text-sm uppercase tracking-wider">
                AI புகார் உதவியாளர்
              </span>
            </div>
            <button onClick={handleClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 py-4 space-y-3">

            {/* LISTENING */}
            {fabState === "listening" && (
              <div className="flex flex-col items-center py-4 gap-3">
                <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                  <MiniWaveform />
                </div>
                <p className="text-gray-600 font-bold text-sm">🎤 பேசுங்கள்...</p>
                {liveText && (
                  <p className="text-gray-500 text-xs italic text-center bg-gray-50 rounded-xl px-3 py-2 w-full">
                    {liveText}
                  </p>
                )}
              </div>
            )}

            {/* THINKING */}
            {fabState === "thinking" && (
              <div className="flex flex-col items-center py-4 gap-3">
                <Loader2 className="w-10 h-10 text-[#2B4B6F] animate-spin" />
                <p className="text-gray-600 font-bold text-sm">AI பகுப்பாய்வு...</p>
              </div>
            )}

            {/* PREVIEW */}
            {fabState === "preview" && preview && (
              <div className="space-y-3">
                <div className="bg-[#1e3a57]/5 rounded-2xl p-3 border border-[#1e3a57]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-[#2B4B6F] uppercase tracking-widest">
                      AI கண்டறிந்தது
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      preview.priority === "High" ? "bg-red-100 text-red-700" :
                      preview.priority === "Medium" ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {preview.priority}
                    </span>
                  </div>
                  <p className="text-[#1e3a57] font-bold text-sm leading-snug">{preview.complaint.substring(0, 80)}</p>
                  <p className="text-gray-500 text-xs mt-1">{preview.dept} · {preview.estimatedTime}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-xl p-2 text-xs">
                    <p className="text-blue-400 font-bold uppercase text-[9px]">பெயர்</p>
                    <p className="text-blue-700 font-bold truncate">{preview.name}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-2 text-xs">
                    <p className="text-amber-400 font-bold uppercase text-[9px]">பகுதி</p>
                    <p className="text-amber-700 font-bold truncate">{preview.area}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={reset}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-all flex items-center justify-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    மீண்டும்
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-[2] py-2.5 rounded-xl bg-[#1e3a57] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#152d45] transition-all flex items-center justify-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3" />
                    பதிவு செய்
                  </button>
                </div>
              </div>
            )}

            {/* SUBMITTING */}
            {fabState === "submitting" && (
              <div className="flex flex-col items-center py-4 gap-3">
                <Loader2 className="w-8 h-8 text-[#2B4B6F] animate-spin" />
                <p className="text-gray-600 font-bold text-sm">பதிவு செய்கிறது...</p>
              </div>
            )}

            {/* DONE */}
            {fabState === "done" && ticketId && (
              <div className="flex flex-col items-center py-4 gap-3 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <div>
                  <p className="text-gray-800 font-black text-sm">வெற்றிகரமாக பதிவு!</p>
                  <p className="text-gray-500 text-xs mt-1">புகார் எண்</p>
                  <p className="text-[#1e3a57] font-black text-lg font-mono mt-1">{ticketId}</p>
                </div>
              </div>
            )}

            {/* ERROR */}
            {fabState === "error" && (
              <div className="flex flex-col items-center py-4 gap-3 text-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-gray-600 font-semibold text-sm">
                  {errorMsg || "பிழை ஏற்பட்டது"}
                </p>
                <button
                  onClick={startFlow}
                  className="flex items-center gap-2 px-5 py-2 bg-[#1e3a57] text-white rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  <RefreshCw className="w-3 h-3" />
                  மீண்டும்
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        id="voice-fab-btn"
        title="AI புகார் உதவியாளர்"
        onClick={isActive ? undefined : () => { if (fabState === "idle") startFlow(); else setOpen(v => !v); }}
        disabled={fabState === "submitting"}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          fabState === "listening"
            ? "bg-red-500 scale-110 shadow-red-500/40 animate-pulse cursor-default"
            : fabState === "thinking" || fabState === "submitting"
            ? "bg-[#2B4B6F] cursor-wait"
            : fabState === "done"
            ? "bg-emerald-500 shadow-emerald-500/30"
            : "bg-[#B91C1C] hover:bg-[#991B1B] hover:scale-105 active:scale-95 cursor-pointer shadow-red-900/30"
        }`}
      >
        {fabState === "listening" ? (
          <MiniWaveform />
        ) : fabState === "thinking" || fabState === "submitting" ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : fabState === "done" ? (
          <CheckCircle2 className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
