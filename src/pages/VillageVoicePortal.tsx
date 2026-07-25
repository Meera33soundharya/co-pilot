import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic, Loader2, Bot, Send, Keyboard, User, StopCircle, RefreshCw, CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "@/context/ComplaintsContext";

// ── Constants ─────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
const GEMINI_URL = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
  : "";

const LANGUAGES = {
  TA: { code: "ta-IN", name: "Tamil" },
  EN: { code: "en-IN", name: "English" },
};

type LangKey = keyof typeof LANGUAGES;
type Step = 0 | 1 | 2 | 3 | 4; // 0=name,1=complaint,2=ward,3=phone,4=confirm

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
  isTyping?: boolean;
}

interface Answers {
  name: string;
  complaint: string;
  ward: string;
  phone: string;
}

// ── Scripted Questions (local fallback, always reliable) ──────────────────────

const Q = {
  TA: [
    "வணக்கம்! நான் உங்கள் புகார் பதிவு உதவியாளர். உங்கள் பெயரை சொல்லுங்கள்.",
    (name: string) => `நன்றி ${name}! உங்கள் புகாரை விவரிக்கவும். என்ன பிரச்சனை உள்ளது?`,
    (complaint: string) => `சரி, "${complaint.substring(0, 30)}..." என்று பதிவு செய்தேன். உங்கள் வார்டு எண் அல்லது பகுதி பெயரை சொல்லுங்கள்.`,
    (ward: string) => `${ward} பதிவு செய்யப்பட்டது. இப்போது உங்கள் மொபைல் எண்ணை வழங்கவும்.`,
    (a: Answers) => `உறுதிப்படுத்தல்:\nபெயர்: ${a.name}\nபுகார்: ${a.complaint}\nவார்டு: ${a.ward}\nமொபைல்: ${a.phone}\n\nசரியா? "ஆம்" அல்லது "இல்லை" என்று சொல்லுங்கள்.`,
  ],
  EN: [
    "Hello! I'm your complaint registration assistant. Please tell me your name.",
    (name: string) => `Thank you ${name}! Please describe your complaint. What is the issue?`,
    (complaint: string) => `Got it — "${complaint.substring(0, 30)}...". Now tell me your ward number or area name.`,
    (ward: string) => `Recorded: ${ward}. Please provide your mobile number.`,
    (a: Answers) => `Confirmation:\nName: ${a.name}\nComplaint: ${a.complaint}\nWard: ${a.ward}\nMobile: ${a.phone}\n\nIs this correct? Say "Yes" or "No".`,
  ],
};

// ── Gemini AI (optional enhancement) ─────────────────────────────────────────

async function tryGemini(history: { role: string; parts: { text: string }[] }[]): Promise<string | null> {
  if (!GEMINI_URL) return null;
  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: `You are a civic grievance assistant. You are currently at a specific step in collecting: name, complaint description, ward/area, and phone number. 
            Acknowledge the user's answer warmly in 1 short sentence only. Do NOT ask any questions — just acknowledge. 
            Respond in the SAME language as the user (Tamil or English). Keep it under 15 words.`
          }]
        },
        contents: history.slice(-3),
        generationConfig: { temperature: 0.7, maxOutputTokens: 60 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

// ── Entity Extraction (local) ─────────────────────────────────────────────────

function extractName(text: string): string {
  const enMatch = text.match(/(?:my name is|i am|this is|name is)\s+([A-Za-z][a-z]+(?:\s+[A-Za-z][a-z]+)?)/i);
  if (enMatch) return enMatch[1].trim();
  const taMatch = text.match(/(?:என் பெயர்|பெயர்|நான்)\s+([^\s,।]+)/);
  if (taMatch) return taMatch[1].trim();
  // Fall back to first 1-3 words
  const words = text.trim().split(/\s+/).slice(0, 3).join(" ");
  return words || text.trim();
}

function extractPhone(text: string): string {
  const m = text.match(/(?:\+91|91)?\s*([6-9]\d{9})/);
  return m ? m[1] : text.replace(/\D/g, "").slice(0, 10) || text.trim();
}

function extractWard(text: string): string {
  const m = text.match(/(?:ward|வார்டு|வார்ட்)[^\d]*(\d+)/i) || text.match(/(\d+)\s*(?:ward|வார்டு)/i);
  if (m) return `Ward ${m[1]}`;
  return text.trim();
}

function isYes(text: string): boolean {
  const t = text.toLowerCase();
  return ["yes", "ஆம்", "ஆம", "சரி", "ok", "okay", "ஓகே", "யெஸ்", "correct", "confirm", "right", "ஆமா"].some(w => t.includes(w));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VillageVoicePortal() {
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();

  const [lang, setLang] = useState<LangKey>("TA");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [liveText, setLiveText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Answers>({ name: "", complaint: "", ward: "", phone: "" });

  const msgIdRef = useRef(0);
  const nextId = () => ++msgIdRef.current;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const recogActiveRef = useRef(false);
  const synthRef = useRef(window.speechSynthesis);
  const historyRef = useRef<{ role: string; parts: { text: string }[] }[]>([]);
  const stepRef = useRef<Step>(0);
  const answersRef = useRef<Answers>({ name: "", complaint: "", ward: "", phone: "" });

  // ── Setup ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    synthRef.current.getVoices();
    synthRef.current.onvoiceschanged = () => synthRef.current.getVoices();

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      rec.onstart = () => { recogActiveRef.current = true; };
      rec.onend = () => { recogActiveRef.current = false; };
      rec.onresult = (e: any) => {
        let t = "";
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        setLiveText(t);
      };
      rec.onerror = () => {};
      recognitionRef.current = rec;
    }
    return () => {
      cleanupRecording();
      try { synthRef.current.cancel(); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.lang = LANGUAGES[lang].code;
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveText]);

  // ── Speech ─────────────────────────────────────────────────────────────────

  const speak = useCallback((text: string, onEnd?: () => void) => {
    try { synthRef.current.cancel(); } catch (_) {}
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LANGUAGES[lang].code;
    utter.rate = 0.9;
    let fired = false;
    const done = () => { if (!fired) { fired = true; onEnd?.(); } };
    utter.onend = done;
    utter.onerror = done;
    const guard = setTimeout(done, Math.max(3000, text.length * 80));
    utter.addEventListener("end", () => clearTimeout(guard));
    utter.addEventListener("error", () => clearTimeout(guard));
    try { synthRef.current.speak(utter); } catch (_) { done(); }
  }, [lang]);

  // ── Recording ───────────────────────────────────────────────────────────────

  const cleanupRecording = () => {
    if (recognitionRef.current && recogActiveRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setLiveText("");
      if (recognitionRef.current && !recogActiveRef.current) {
        try {
          recognitionRef.current.lang = LANGUAGES[lang].code;
          recognitionRef.current.start();
        } catch (_) {}
      }
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(250);
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch {
      addAIMsg(lang === "TA" ? "மைக்ரோஃபோன் அனுமதி தேவை. தட்டச்சு செய்து பயன்படுத்தவும்." : "Mic access denied. Please type instead.");
    }
  }, [lang, isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && recogActiveRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    const mr = mediaRecorderRef.current;
    const capturedLiveText = liveText;
    setIsRecording(false);
    if (!mr || mr.state === "inactive") {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      return;
    }
    mr.onstop = async () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const transcript = capturedLiveText.trim();
      setLiveText("");
      if (!transcript) {
        addAIMsg(lang === "TA" ? "கேட்கவில்லை. மீண்டும் பேசவும் அல்லது தட்டச்சு செய்யவும்." : "Didn't catch that. Speak again or type.");
        setTimeout(() => startRecording(), 1500);
        return;
      }
      await handleUserInput(transcript);
    };
    try { mr.stop(); } catch (_) {}
  }, [liveText, lang]);

  // ── Message Helpers ────────────────────────────────────────────────────────

  const addAIMsg = (text: string) =>
    setMessages((p) => [...p, { id: nextId(), sender: "ai", text }]);

  const addUserMsg = (text: string) =>
    setMessages((p) => [...p, { id: nextId(), sender: "user", text }]);

  const addTyping = () => {
    const id = nextId();
    setMessages((p) => [...p, { id, sender: "ai", text: "", isTyping: true }]);
    return id;
  };

  const resolveTyping = (id: number, text: string) =>
    setMessages((p) => p.map((m) => m.id === id ? { ...m, text, isTyping: false } : m));

  // ── Core: Ask Question at Step ─────────────────────────────────────────────

  const askQuestion = useCallback((s: Step, ans: Answers) => {
    const qList = Q[lang];
    let question = "";
    if (s === 0) question = qList[0] as string;
    else if (s === 1) question = (qList[1] as Function)(ans.name);
    else if (s === 2) question = (qList[2] as Function)(ans.complaint);
    else if (s === 3) question = (qList[3] as Function)(ans.ward);
    else if (s === 4) question = (qList[4] as Function)(ans);

    const typingId = addTyping();
    setTimeout(() => {
      resolveTyping(typingId, question);
      speak(question, () => {
        setTimeout(() => startRecording(), 400);
      });
    }, 500);
  }, [lang, speak, startRecording]);

  // ── Core: Handle User Input ────────────────────────────────────────────────

  const handleUserInput = useCallback(async (text: string) => {
    setIsBusy(true);
    addUserMsg(text);
    historyRef.current.push({ role: "user", parts: [{ text }] });

    const currentStep = stepRef.current;
    const currentAnswers = { ...answersRef.current };

    // Extract the answer for this step
    let newAnswers = { ...currentAnswers };
    if (currentStep === 0) newAnswers.name = extractName(text);
    else if (currentStep === 1) newAnswers.complaint = text.trim();
    else if (currentStep === 2) newAnswers.ward = extractWard(text);
    else if (currentStep === 3) newAnswers.phone = extractPhone(text);
    else if (currentStep === 4) {
      if (isYes(text)) {
        // Submit complaint
        const typingId = addTyping();
        try {
          const id = addComplaint({
            citizen: newAnswers.name || "Voice User",
            phone: newAnswers.phone || "N/A",
            ward: newAnswers.ward || "Unknown",
            issue: newAnswers.complaint,
            description: newAnswers.complaint,
            priority: "Medium",
            notifPref: "None",
            source: "voice",
            autoAssignTo: "Field Officer",
          });
          const successMsg = lang === "TA"
            ? `✅ புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது! புகார் எண்: ${id}`
            : `✅ Complaint registered successfully! ID: ${id}`;
          resolveTyping(typingId, successMsg);
          speak(successMsg);
          setSubmittedId(id as string);
          setIsSubmitted(true);
        } catch {
          resolveTyping(typingId, lang === "TA" ? "பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்." : "Submission failed. Try again.");
        }
        setIsBusy(false);
        return;
      } else {
        // Re-start
        const restartMsg = lang === "TA" ? "சரி, மீண்டும் தொடங்குவோம்." : "Okay, let's start over.";
        addAIMsg(restartMsg);
        speak(restartMsg, () => {
          const freshAnswers = { name: "", complaint: "", ward: "", phone: "" };
          answersRef.current = freshAnswers;
          stepRef.current = 0;
          setAnswers(freshAnswers);
          setStep(0);
          setTimeout(() => askQuestion(0, freshAnswers), 800);
        });
        setIsBusy(false);
        return;
      }
    }

    answersRef.current = newAnswers;
    setAnswers(newAnswers);

    // Try Gemini for a warm acknowledgment (non-blocking, optional)
    let ack = "";
    const geminiAck = await tryGemini([
      ...historyRef.current.slice(-4),
    ]);
    if (geminiAck) {
      ack = geminiAck;
      historyRef.current.push({ role: "model", parts: [{ text: ack }] });
    }

    // Show ack if we have one, then move to next step in 1 second
    const nextStep = (currentStep + 1) as Step;
    stepRef.current = nextStep;
    setStep(nextStep);

    if (ack && nextStep < 4) {
      // Show Gemini ack, then ask next question in 1s
      const ackId = addTyping();
      setTimeout(() => {
        resolveTyping(ackId, ack);
        speak(ack, () => {
          setTimeout(() => {
            setIsBusy(false);
            askQuestion(nextStep, newAnswers);
          }, 1000);
        });
      }, 300);
    } else {
      // No ack, directly ask next question in 1s
      setIsBusy(false);
      setTimeout(() => askQuestion(nextStep, newAnswers), 1000);
    }
  }, [lang, speak, addComplaint, askQuestion]);

  // ── Start Conversation ─────────────────────────────────────────────────────

  const startConversation = useCallback(() => {
    const fresh: Answers = { name: "", complaint: "", ward: "", phone: "" };
    answersRef.current = fresh;
    stepRef.current = 0;
    historyRef.current = [];
    msgIdRef.current = 0;
    setMessages([]);
    setAnswers(fresh);
    setStep(0);
    setIsSubmitted(false);
    setSubmittedId("");
    setIsBusy(false);
    askQuestion(0, fresh);
  }, [askQuestion]);

  // ── Text Submit ────────────────────────────────────────────────────────────

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    if (messages.length === 0) { startConversation(); return; }
    if (isBusy || isSubmitted) return;
    if (isRecording) stopRecording();
    await handleUserInput(text);
  };

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = () => {
    cleanupRecording();
    try { synthRef.current.cancel(); } catch (_) {}
    setMessages([]);
    msgIdRef.current = 0;
    setLiveText("");
    setIsRecording(false);
    setIsBusy(false);
    setIsSubmitted(false);
    setSubmittedId("");
    setStep(0);
    setAnswers({ name: "", complaint: "", ward: "", phone: "" });
    answersRef.current = { name: "", complaint: "", ward: "", phone: "" };
    stepRef.current = 0;
    historyRef.current = [];
  };

  // ── Mic Button ─────────────────────────────────────────────────────────────

  const handleMicClick = () => {
    if (isRecording) { stopRecording(); return; }
    if (isSubmitted) { reset(); return; }
    if (messages.length === 0) { startConversation(); return; }
    if (!isBusy) startRecording();
  };

  // ── Step indicator ─────────────────────────────────────────────────────────

  const stepNames = lang === "TA"
    ? ["பெயர்", "புகார்", "வார்டு", "மொபைல்", "உறுதி"]
    : ["Name", "Complaint", "Ward", "Mobile", "Confirm"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A8CDE2] via-[#8EBCD8] to-[#6BA3C4] flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-5 shrink-0 bg-white/30 backdrop-blur-md border-b border-white/20">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-1.5 bg-white/40 hover:bg-white/60 text-[#2B4B6F] rounded-full font-black text-sm tracking-widest uppercase shadow-sm transition-all"
        >
          Back
        </button>
        <div className="flex flex-col items-center">
          <span className="font-black text-[#2B4B6F] uppercase tracking-widest text-sm">
            {lang === "TA" ? "வாய்மொழி போர்ட்டல்" : "Voice Portal"}
          </span>
          <span className="text-[10px] text-[#3A5D7C] font-semibold opacity-60">Gemini AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang((l) => (l === "TA" ? "EN" : "TA"))}
            className="px-3 py-1.5 bg-white/40 hover:bg-white/60 text-[#2B4B6F] rounded-full font-black text-xs uppercase shadow-sm transition-all"
          >
            {lang === "TA" ? "ENG" : "தமிழ்"}
          </button>
          {messages.length > 0 && (
            <button onClick={reset} className="p-2 bg-white/40 hover:bg-white/60 text-[#2B4B6F] rounded-full transition-all" title="Restart">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Step Progress */}
      {messages.length > 0 && !isSubmitted && (
        <div className="flex items-center justify-center gap-1 py-2 px-4 bg-white/20 backdrop-blur-sm border-b border-white/10">
          {stepNames.map((name, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                i < step ? "bg-emerald-400 text-white" : i === step ? "bg-[#2B4B6F] text-white" : "bg-white/30 text-[#3A5D7C]"
              }`}>
                {i < step ? "✓" : i + 1} {name}
              </div>
              {i < stepNames.length - 1 && <div className="w-3 h-px bg-white/40" />}
            </div>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <main className="flex-1 flex flex-col w-full max-w-2xl mx-auto overflow-hidden relative pb-36">
        <div className="flex-1 w-full overflow-y-auto px-4 pt-6 space-y-4 scroll-smooth">

          {/* Welcome */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-700">
              <div className="w-28 h-28 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/60">
                <Bot className="w-14 h-14 text-[#2B4B6F]" />
              </div>
              <h1 className="text-2xl font-black text-[#2B4B6F] mb-2 text-center">
                {lang === "TA" ? "AI புகார் உதவியாளர்" : "AI Grievance Assistant"}
              </h1>
              <p className="text-sm font-semibold text-[#3A5D7C] text-center max-w-xs mb-6 opacity-80">
                {lang === "TA"
                  ? "தமிழ் அல்லது ஆங்கிலத்தில் பேசுங்கள் — AI தானாக புகாரை பதிவு செய்யும்"
                  : "Speak in Tamil or English — AI will register your complaint automatically"}
              </p>
              <button
                onClick={startConversation}
                className="px-10 py-4 bg-[#2B4B6F] hover:bg-[#1e3a57] text-white rounded-full font-black tracking-widest uppercase text-base shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <Mic className="w-5 h-5" />
                {lang === "TA" ? "தொடங்க" : "Start"}
              </button>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 fade-in duration-300`}
            >
              {msg.sender === "ai" && (
                <div className="w-9 h-9 rounded-full bg-[#2B4B6F] flex items-center justify-center mr-3 shrink-0 mt-1 shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`max-w-[78%] rounded-[1.5rem] px-5 py-3.5 shadow-md text-left text-[15px] leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[#2B4B6F] text-white rounded-br-sm"
                  : "bg-white text-[#2B4B6F] rounded-bl-sm font-semibold"
              }`}>
                {msg.isTyping ? (
                  <div className="flex items-center gap-1.5 py-1">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-2 h-2 rounded-full bg-[#50A7B1] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
              {msg.sender === "user" && (
                <div className="w-9 h-9 rounded-full bg-[#5B88A8] flex items-center justify-center ml-3 shrink-0 mt-1 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Live caption */}
          {isRecording && liveText && (
            <div className="flex w-full justify-end animate-in fade-in">
              <div className="max-w-[78%] bg-[#5B88A8]/60 text-white rounded-[1.5rem] rounded-br-sm px-5 py-3 shadow-md text-[14px]">
                <p className="italic opacity-80">{liveText}<span className="animate-pulse">…</span></p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#5B88A8]/50 flex items-center justify-center ml-3 shrink-0 mt-1">
                <User className="w-5 h-5 text-white opacity-60" />
              </div>
            </div>
          )}

          {/* Success card */}
          {isSubmitted && submittedId && (
            <div className="flex justify-center animate-in fade-in zoom-in duration-500 mt-4">
              <div className="bg-white rounded-2xl p-6 shadow-xl text-center max-w-xs border border-emerald-100">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-black text-emerald-700 text-base mb-1">
                  {lang === "TA" ? "வெற்றிகரமாக பதிவு!" : "Successfully Submitted!"}
                </p>
                <p className="text-emerald-600 font-bold text-sm bg-emerald-50 rounded-lg px-3 py-1.5 mb-4">
                  ID: {submittedId}
                </p>
                <button
                  onClick={reset}
                  className="px-6 py-2 bg-[#2B4B6F] hover:bg-[#1e3a57] text-white rounded-full font-black text-sm uppercase tracking-wider transition-all"
                >
                  {lang === "TA" ? "புதிய புகார்" : "New Complaint"}
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#6BA3C4] via-[#8EBCD8]/95 to-transparent pb-6">
          {/* Status label */}
          <p className="text-center text-[11px] font-black text-[#2B4B6F] uppercase tracking-widest mb-3 min-h-[1rem] opacity-75">
            {isRecording
              ? (lang === "TA" ? "பேசுங்கள் — நிறுத்த அழுத்தவும்" : "Speak — tap to stop")
              : isBusy
              ? (lang === "TA" ? "AI சிந்திக்கிறது..." : "AI thinking...")
              : isSubmitted
              ? (lang === "TA" ? "வெற்றிகரமாக பதிவு!" : "Successfully submitted!")
              : messages.length === 0
              ? (lang === "TA" ? "தொடங்க அழுத்தவும்" : "Tap to start")
              : (lang === "TA" ? "மைக் அழுத்தி பேசவும் அல்லது தட்டச்சு செய்யவும்" : "Tap mic to speak or type")}
          </p>

          <div className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-2.5 shadow-2xl border border-white flex items-center gap-3">
            <button
              onClick={handleMicClick}
              disabled={isBusy && !isRecording}
              aria-label={isRecording ? "Stop" : "Record"}
              className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all shadow-md ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/40 animate-pulse"
                  : isBusy
                  ? "bg-gray-300 cursor-not-allowed"
                  : isSubmitted
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-[#2B4B6F] hover:bg-[#1e3a57] hover:scale-105"
              }`}
            >
              {isRecording ? (
                <StopCircle className="w-6 h-6 text-white" />
              ) : isBusy ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : isSubmitted ? (
                <RefreshCw className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            <form
              onSubmit={handleTextSubmit}
              className="flex-1 flex items-center bg-gray-100 rounded-full border border-gray-200 px-5 py-3 focus-within:border-[#50A7B1] focus-within:ring-4 focus-within:ring-[#50A7B1]/20 transition-all"
            >
              <Keyboard className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSubmitted}
                placeholder={
                  isRecording
                    ? (lang === "TA" ? "பேசுங்கள்..." : "Listening...")
                    : (lang === "TA" ? "இங்கே தட்டச்சு செய்யவும்..." : "Type your message...")
                }
                className="flex-1 bg-transparent border-none focus:outline-none text-[#2B4B6F] font-semibold placeholder:font-medium placeholder:text-gray-400 disabled:opacity-50 text-[15px]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSubmitted}
                className="ml-2 p-2.5 rounded-full bg-[#50A7B1] text-white disabled:opacity-40 disabled:bg-gray-400 hover:bg-[#3D8F9A] transition-colors hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
