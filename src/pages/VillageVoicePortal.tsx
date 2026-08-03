/**
 * VillageVoicePortal — Tamil-Only Agentic AI Voice Complaint System
 *
 * Strict conversational flow matching the required requirements:
 * Name (1m) -> Complaint (3m) -> Area (2m) -> Ward (2m) -> Process -> Confirm -> Submit
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic, RefreshCw, CheckCircle2, Bot,
  Loader2, MapPin, User, AlertCircle
} from "lucide-react";
import { useComplaints } from "@/context/ComplaintsContext";
import {
  classifyComplaint, speakText, listenForSpeech,
  isDontKnow, isConfirmation, PROMPTS,
  type CollectedFields, type ClassifiedData
} from "@/services/agentVoiceService";

// ── Types ──────────────────────────────────────────────────────────────────

type UIState = "idle" | "running" | "submitting" | "success" | "error";

interface ChatMessage {
  id: number;
  role: "ai" | "user";
  text: string;
  isTyping?: boolean;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-200 ${active ? "bg-white" : "bg-white/30"}`}
          style={{
            width: "3px",
            height: active ? `${8 + Math.sin((i / 12) * Math.PI * 2) * 16 + 8}px` : "4px",
            animation: active
              ? `agentWave 0.8s ease-in-out ${(i * 0.07).toFixed(2)}s infinite alternate`
              : "none",
          }}
        />
      ))}
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1.5 items-center py-1">
      {[0, 150, 300].map((d) => (
        <div
          key={d}
          className="w-2.5 h-2.5 rounded-full bg-white/70"
          style={{ animation: `bounce 1.2s ease-in-out ${d}ms infinite` }}
        />
      ))}
    </div>
  );
}

function AiMsg({ text, isTyping }: { text: string; isTyping?: boolean }) {
  return (
    <div className="flex w-full justify-start animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3 shrink-0 border border-white/10 shadow-lg">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-5 py-3.5 bg-white/10 backdrop-blur-md border border-white/10 text-white text-base font-medium leading-relaxed">
        {isTyping ? <ThinkingDots /> : <p className="whitespace-pre-wrap">{text}</p>}
      </div>
    </div>
  );
}

function UserMsg({ text, interim }: { text: string; interim?: boolean }) {
  return (
    <div className="flex w-full justify-end animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className={`max-w-[80%] rounded-2xl rounded-br-sm px-5 py-3.5 bg-indigo-600/90 border border-indigo-500/50 text-white text-base font-medium leading-relaxed ${interim ? 'opacity-70 italic' : ''}`}>
        <p className="whitespace-pre-wrap">{text || "..."}</p>
      </div>
    </div>
  );
}

function SuccessCard({ id, onNew }: { id: string; onNew: () => void }) {
  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden text-center animate-in zoom-in-90 fade-in duration-500">
      <div className="bg-gradient-to-b from-emerald-400 to-emerald-500 px-6 pt-8 pb-6">
        <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-3" strokeWidth={1.5} />
        <h2 className="text-white font-black text-xl">வெற்றிகரமாக பதிவு!</h2>
      </div>
      <div className="px-6 py-5">
        <p className="text-gray-500 text-sm font-semibold mb-2">பதிவு எண்</p>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-4 py-3 mb-5">
          <p className="text-emerald-700 font-black text-2xl tracking-widest font-mono">{id}</p>
        </div>
        <button
          onClick={onNew}
          className="w-full py-3 bg-[#1e3a57] hover:bg-[#152d45] text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all"
        >
          மீண்டும் புகார் சொல்லுங்கள்
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

let _msgId = 0;

export default function VillageVoicePortal() {
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();

  const [uiState, setUiState] = useState<UIState>("idle");
  const [isListeningUI, setIsListeningUI] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interimText, setInterimText] = useState("");
  const [successId, setSuccessId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interimText, uiState]);

  // ── Stable message adders ──────────────────────────────────────────────
  const pushAi = useCallback((text: string) => {
    setMessages(prev => [...prev, { id: ++_msgId, role: "ai", text }]);
  }, []);

  const pushUser = useCallback((text: string) => {
    setMessages(prev => [...prev, { id: ++_msgId, role: "user", text }]);
  }, []);

  const pushTyping = useCallback(() => {
    const id = ++_msgId;
    setMessages(prev => [...prev, { id, role: "ai", text: "", isTyping: true }]);
    return id;
  }, []);

  const resolveTyping = useCallback((id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  // ── Single imperative async runner ─────────────────────────────────────
  const runFlow = useCallback(async () => {
    abortRef.current = false;
    setUiState("running");
    setMessages([]);
    setInterimText("");
    setSuccessId("");
    setErrorMsg("");
    _msgId = 0;

    const fields: CollectedFields = { name: "", complaint: "", area: "", ward: "" };

    // Smart listen wrapper
    const listen = async (maxMs: number) => {
      setIsListeningUI(true);
      setInterimText("");
      const resp = await listenForSpeech({
        maxMs,
        silenceAfterMs: 3000,
        onInterim: (text) => setInterimText(text)
      });
      setIsListeningUI(false);
      setInterimText("");
      return resp;
    };

    // Helper: speak + listen with one retry
    const ask = async (prompt: string, timeoutPrompt: string, fieldKey: keyof CollectedFields, maxMs: number): Promise<boolean> => {
      pushAi(prompt);
      await speakText(prompt);
      if (abortRef.current) return false;

      let resp = await listen(maxMs);
      if (abortRef.current) return false;

      if (!resp) {
        pushAi(timeoutPrompt);
        await speakText(timeoutPrompt);
        if (abortRef.current) return false;

        resp = await listen(maxMs);
        if (abortRef.current) return false;
      }

      if (!resp) return false;

      pushUser(resp);
      fields[fieldKey] = resp;
      return true;
    };

    // 1 & 2. Welcome & Ask Name (wait 1 min = 60000ms)
    const nameOk = await ask(PROMPTS.welcome + " " + PROMPTS.ask_name, PROMPTS.name_timeout, "name", 60000);
    if (!nameOk || abortRef.current) {
      if (!abortRef.current) { setErrorMsg("பெயர் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்."); setUiState("error"); }
      return;
    }

    // 3. Ask Complaint (wait 3 min = 180000ms)
    const complaintOk = await ask(PROMPTS.ask_complaint, PROMPTS.complaint_timeout, "complaint", 180000);
    if (!complaintOk || abortRef.current) {
      if (!abortRef.current) { setErrorMsg("புகார் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்."); setUiState("error"); }
      return;
    }

    // 4. Ask Area (wait 2 min = 120000ms)
    const areaOk = await ask(PROMPTS.ask_area, PROMPTS.area_timeout, "area", 120000);
    if (!areaOk || abortRef.current) {
      if (!abortRef.current) { setErrorMsg("பகுதி கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்."); setUiState("error"); }
      return;
    }

    // 5. Ask Ward (wait 2 min = 120000ms)
    pushAi(PROMPTS.ask_ward);
    await speakText(PROMPTS.ask_ward);
    if (abortRef.current) return;

    let wardResp = await listen(120000);
    if (abortRef.current) return;

    if (!wardResp) {
      pushAi(PROMPTS.ward_timeout);
      await speakText(PROMPTS.ward_timeout);
      if (abortRef.current) return;
      wardResp = await listen(120000);
    } else if (isDontKnow(wardResp)) {
      pushUser(wardResp);
      pushAi(PROMPTS.ask_ward_landmark);
      await speakText(PROMPTS.ask_ward_landmark);
      if (abortRef.current) return;
      wardResp = await listen(120000);
    }

    if (abortRef.current) return;
    if (!wardResp) {
      if (!abortRef.current) { setErrorMsg("வார்டு கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்."); setUiState("error"); }
      return;
    }
    pushUser(wardResp);
    fields.ward = wardResp;

    // Processing
    pushAi(PROMPTS.processing);
    await speakText(PROMPTS.processing);
    if (abortRef.current) return;

    const typingId = pushTyping();
    let classified: ClassifiedData & { summary: string } | null = null;
    try {
      classified = await classifyComplaint(fields);
      if (abortRef.current) return;
    } catch {
      resolveTyping(typingId);
      if (!abortRef.current) { setErrorMsg("AI பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்."); setUiState("error"); }
      return;
    }
    resolveTyping(typingId);

    // 6. Confirmation
    const summaryPrompt = PROMPTS.buildSummary(fields);
    pushAi(summaryPrompt);
    await speakText(summaryPrompt);
    if (abortRef.current) return;

    pushAi(PROMPTS.ask_confirm);
    await speakText(PROMPTS.ask_confirm);
    if (abortRef.current) return;

    let confirmResp = await listen(60000);
    if (abortRef.current) return;

    if (!confirmResp) {
      pushAi(PROMPTS.retry);
      await speakText(PROMPTS.retry);
      if (abortRef.current) return;
      confirmResp = await listen(60000);
    }

    if (abortRef.current) return;
    if (!confirmResp) {
      if (!abortRef.current) { setErrorMsg("பதில் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்."); setUiState("error"); }
      return;
    }

    pushUser(confirmResp);

    if (!isConfirmation(confirmResp)) {
      // User said no, or something else. For now, abort or restart.
      pushAi("நீங்கள் தகவல்களை உறுதிப்படுத்தவில்லை. மீண்டும் முதலிலிருந்து தொடங்குகிறேன்.");
      await speakText("நீங்கள் தகவல்களை உறுதிப்படுத்தவில்லை. மீண்டும் முதலிலிருந்து தொடங்குகிறேன்.");
      if (!abortRef.current) runFlow(); // restart
      return;
    }

    // 7. Submit
    setUiState("submitting");

    try {
      const id = await addComplaint({
        citizen: fields.name || "Voice Citizen",
        phone: "N/A",
        ward: fields.ward || "Unknown",
        issue: fields.complaint.substring(0, 60),
        description: fields.complaint,
        priority: classified.priority,
        category: classified.category,
        dept: classified.dept,
        location: fields.area || classified.landmark,
        notifPref: "None",
        source: "voice",
      });

      if (abortRef.current) return;
      setSuccessId(id as string);
      setUiState("success");

      const msg = PROMPTS.success(id as string);
      pushAi(msg);
      await speakText(msg);
    } catch (err) {
      if (abortRef.current) return;
      setErrorMsg(String(err));
      setUiState("error");
    }
  }, [pushAi, pushUser, pushTyping, resolveTyping, addComplaint]);

  // ── Reset ──────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    abortRef.current = true;
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    setIsListeningUI(false);
    setUiState("idle");
    setMessages([]);
    setInterimText("");
    _msgId = 0;
  }, []);

  const isActive = uiState !== "idle";

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <style>{`
        @keyframes agentWave {
          0%   { height: 4px; }
          100% { height: 32px; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-5 bg-slate-900/40 backdrop-blur-xl border-b border-white/10 shrink-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/15 text-white/90 text-xs font-bold uppercase tracking-widest transition-all border border-white/10"
        >
          ← திரும்பு
        </button>
        <div className="flex flex-col items-center">
          <span className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            அரசு புகார் மையம்
          </span>
          <span className="text-indigo-300/60 text-[9px] font-bold uppercase tracking-widest mt-0.5">குரல் மூலம் பதிவு செய்யுங்கள்</span>
        </div>
        <div className="w-20 flex justify-end">
          {isActive && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 transition-all"
              title="Restart"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden z-10">

        {/* IDLE */}
        {uiState === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-10 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping scale-[1.3] blur-sm" />
              <div
                className="absolute inset-0 rounded-full bg-blue-500/10 scale-[1.8]"
                style={{ animation: "pulseRing 2.5s ease-out 0.5s infinite" }}
              />
              <div className="w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 relative z-10 border border-white/10">
                <Mic className="w-24 h-24 text-white drop-shadow-md" strokeWidth={1.5} />
              </div>
            </div>
            <div>
              <h1 className="text-white font-black text-4xl mb-4 leading-tight">
                பேசுங்கள், நாங்கள் கேட்கிறோம்
              </h1>
              <p className="text-indigo-200 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                தண்ணீர், சாலை, குப்பை, விளக்கு — எந்த பிரச்சனையாக இருந்தாலும் சொல்லுங்கள்.
              </p>
            </div>
            <button
              onClick={runFlow}
              className="w-72 py-5 bg-white hover:bg-gray-100 text-indigo-900 rounded-full font-black text-xl uppercase tracking-wider shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              <Mic className="w-7 h-7 text-indigo-600" />
              புகார் சொல்லுங்கள்
            </button>
          </div>
        )}

        {/* RUNNING */}
        {(uiState === "running" || uiState === "submitting") && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
              {messages.map((msg) =>
                msg.role === "ai"
                  ? <AiMsg key={msg.id} text={msg.text} isTyping={msg.isTyping} />
                  : <UserMsg key={msg.id} text={msg.text} />
              )}
              {interimText && <UserMsg text={interimText} interim />}
              {uiState === "submitting" && <AiMsg text="பதிவு செய்யப்படுகிறது..." />}
              <div ref={messagesEndRef} className="h-20" />
            </div>

            {/* Listening bar */}
            {isListeningUI && (
              <div className="bg-slate-900/70 backdrop-blur-2xl border-t border-white/10 px-6 py-5 flex flex-col items-center gap-3 shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse flex items-center justify-center">
                      <Mic className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <Waveform active={true} />
                </div>
                <p className="text-indigo-200 text-sm font-semibold animate-pulse">
                  கேட்கிறோம்... சொல்லுங்கள்
                </p>
              </div>
            )}
          </div>
        )}

        {/* SUCCESS */}
        {uiState === "success" && (
          <div className="flex-1 flex items-center justify-center p-6 animate-in fade-in">
            <SuccessCard id={successId} onNew={handleReset} />
          </div>
        )}

        {/* ERROR */}
        {uiState === "error" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-in zoom-in-95 fade-in">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">சரியாக கேட்கவில்லை</h2>
            <p className="text-red-200/80 max-w-sm mb-8">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold uppercase tracking-wider transition-all"
            >
              மீண்டும் பேசுங்கள்
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
