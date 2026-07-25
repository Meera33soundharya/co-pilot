import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic, MicOff, Loader2, CheckCircle2, Bot, Send, Keyboard, User, StopCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "@/context/ComplaintsContext";
import { analyzeComplaint } from "@/services/aiService";
import { transcribeAudio, extractEntitiesGPT, extractEntitiesLocal } from "@/services/voiceAiService";

// ── Constants ────────────────────────────────────────────────────────────────

const LANGUAGES = {
  TA: { code: "ta-IN", whisper: "ta" as const, name: "தமிழ் (Tamil)", label: "தமிழ்" },
  EN: { code: "en-IN", whisper: "en" as const, name: "English", label: "ENG" },
};

const OPENAI_AVAILABLE = !!import.meta.env.VITE_OPENAI_API_KEY;

type LangKey = keyof typeof LANGUAGES;
type Status = "idle" | "recording" | "transcribing" | "processing" | "success" | "error" | "speaking" | "waiting";

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
}

// Step questions
const STEPS = {
  TA: [
    "பொது புகார் இணையதளத்திற்கு வரவேற்கிறோம். உங்கள் பெயரை சொல்லுங்கள்.",
    "உங்கள் புகாரை விவரிக்கவும்.",
    "உங்கள் வார்டு எண் அல்லது பகுதி பெயரை சொல்லுங்கள்.",
    "உங்கள் மொபைல் எண்ணை வழங்கவும்.",
    "", // built dynamically at step 4
  ],
  EN: [
    "Welcome to the Public Grievance Portal. Please tell me your name.",
    "Please describe your complaint.",
    "Please tell me your ward number or area name.",
    "Please provide your mobile number.",
    "",
  ],
};

// ── Component ────────────────────────────────────────────────────────────────

export default function VillageVoicePortal() {
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();

  const [lang, setLang] = useState<LangKey>("TA");
  const [status, setStatus] = useState<Status>("idle");
  const [liveText, setLiveText] = useState(""); // live caption while recording
  const [errorMsg, setErrorMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");

  // Refs
  const msgIdRef = useRef(0);
  const nextId = () => ++msgIdRef.current;
  const stepRef = useRef(0);
  const answersRef = useRef({ name: "", issue: "", ward: "", phone: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Browser SpeechRecognition (live caption only, not used for final result)
  const recognitionRef = useRef<any>(null);
  const recogActiveRef = useRef(false);

  // SpeechSynthesis
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Prime voices
    synthRef.current.getVoices();
    synthRef.current.onvoiceschanged = () => synthRef.current.getVoices();

    // Set up browser STT for live captions only
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
      rec.onerror = () => {}; // silently ignore — captions are optional
      recognitionRef.current = rec;
    }

    return () => {
      stopRecording(false);
      try { synthRef.current.cancel(); } catch (_) {}
    };
  }, []);

  // Update recognition language when lang changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANGUAGES[lang].code;
    }
  }, [lang]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveText, status]);

  // ── Speech Synthesis ────────────────────────────────────────────────────

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!synthRef.current) { onEnd?.(); return; }
      try { synthRef.current.cancel(); } catch (_) {}

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = LANGUAGES[lang].code;
      utter.rate = 0.88;

      let fired = false;
      const done = () => { if (!fired) { fired = true; onEnd?.(); } };
      utter.onend = done;
      utter.onerror = done;
      const guard = setTimeout(done, Math.max(5000, text.length * 100));
      utter.addEventListener("end", () => clearTimeout(guard));
      utter.addEventListener("error", () => clearTimeout(guard));

      try { synthRef.current.speak(utter); } catch (_) { done(); }
    },
    [lang]
  );

  // ── Recording ───────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setLiveText("");

      // Start live captions (best-effort)
      if (recognitionRef.current && !recogActiveRef.current) {
        try { recognitionRef.current.start(); } catch (_) {}
      }

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mr = new MediaRecorder(stream, { mimeType });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(250);
      mediaRecorderRef.current = mr;
      setStatus("recording");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        lang === "TA"
          ? "மைக்ரோஃபோனை அனுமதிக்கவும்."
          : "Please allow microphone access."
      );
    }
  }, [lang]);

  const stopRecording = useCallback((process = true) => {
    // Stop live captions
    if (recognitionRef.current && recogActiveRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }

    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      return;
    }

    mr.onstop = async () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (!process || chunksRef.current.length === 0) return;

      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      chunksRef.current = [];
      await handleAudioBlob(blob);
    };

    try { mr.stop(); } catch (_) {}
  }, []);

  // ── Transcription ───────────────────────────────────────────────────────

  const handleAudioBlob = useCallback(
    async (blob: Blob) => {
      setStatus("transcribing");
      setLiveText("");

      let finalText = "";

      if (OPENAI_AVAILABLE) {
        try {
          finalText = await transcribeAudio(blob, LANGUAGES[lang].whisper);
        } catch (e) {
          console.warn("Whisper failed, using live caption:", e);
          finalText = liveText;
        }
      } else {
        // Use live caption from browser STT as the transcript
        finalText = liveText;
      }

      if (!finalText.trim()) {
        // Nothing heard — ask again
        setStatus("waiting");
        addAIMessage(
          lang === "TA"
            ? "மன்னிக்கவும், நான் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்."
            : "Sorry, I didn't catch that. Please try again."
        );
        return;
      }

      // Show user message
      addUserMessage(finalText);
      await processStep(finalText);
    },
    [lang, liveText]
  );

  // ── Message Helpers ──────────────────────────────────────────────────────

  const addAIMessage = (text: string) =>
    setMessages((p) => [...p, { id: nextId(), sender: "ai", text }]);

  const addUserMessage = (text: string) =>
    setMessages((p) => [...p, { id: nextId(), sender: "user", text }]);

  // ── Step Flow ────────────────────────────────────────────────────────────

  const goToStep = useCallback(
    (s: number) => {
      stepRef.current = s;
      if (s === 0) {
        answersRef.current = { name: "", issue: "", ward: "", phone: "" };
        setMessages([]);
        msgIdRef.current = 0;
      }

      let text = STEPS[lang][s];
      if (s === 4) {
        const { name, issue, ward, phone } = answersRef.current;
        text =
          lang === "TA"
            ? `பெயர்: ${name}. புகார்: ${issue}. வார்டு: ${ward}. மொபைல்: ${phone}. உறுதிப்படுத்த ஆம் சொல்லுங்கள்.`
            : `Name: ${name}. Complaint: ${issue}. Ward: ${ward}. Mobile: ${phone}. Say YES to submit or NO to re-record.`;
      }

      setStatus("speaking");
      addAIMessage(text);
      speak(text, () => {
        setStatus("waiting");
        startRecording();
      });
    },
    [lang, speak, startRecording]
  );

  const processStep = useCallback(
    async (text: string) => {
      setStatus("processing");
      const s = stepRef.current;
      const extractor = OPENAI_AVAILABLE ? extractEntitiesGPT : (t: string, f: any) => Promise.resolve(extractEntitiesLocal(t, f));

      let ack = "";

      if (s === 0) {
        answersRef.current.name = await extractor(text, "name");
        ack =
          lang === "TA"
            ? `நன்றி ${answersRef.current.name}.`
            : `Thank you, ${answersRef.current.name}.`;
      } else if (s === 1) {
        answersRef.current.issue = await extractor(text, "issue");
        ack =
          lang === "TA"
            ? "உங்கள் புகாரை பதிவு செய்துள்ளேன்."
            : `I have recorded your complaint.`;
      } else if (s === 2) {
        answersRef.current.ward = await extractor(text, "ward");
        ack =
          lang === "TA"
            ? `${answersRef.current.ward} பதிவு செய்யப்பட்டது.`
            : `Recorded: ${answersRef.current.ward}.`;
      } else if (s === 3) {
        answersRef.current.phone = await extractor(text, "phone") || text;
        // Skip ack — go straight to confirmation
        goToStep(4);
        return;
      } else if (s === 4) {
        const answer = await extractor(text, "confirm");
        if (answer === "YES") {
          await submitComplaint();
        } else {
          ack =
            lang === "TA"
              ? "சரி, மீண்டும் தொடங்குவோம்."
              : "Okay, let's start again.";
          setStatus("speaking");
          addAIMessage(ack);
          speak(ack, () => goToStep(0));
        }
        return;
      }

      setStatus("speaking");
      addAIMessage(ack);
      speak(ack, () => setTimeout(() => goToStep(s + 1), 800));
    },
    [lang, speak, goToStep]
  );

  const submitComplaint = async () => {
    setStatus("processing");
    const { name, issue, ward, phone } = answersRef.current;
    try {
      const aiResult = await analyzeComplaint(issue, issue);
      const id = addComplaint({
        citizen: name || "Voice User",
        phone: phone || "N/A",
        ward: ward || "Unknown",
        issue,
        description: issue,
        priority: aiResult.priority,
        category: aiResult.category,
        dept: aiResult.dept,
        notifPref: "None",
        source: "voice",
        autoAssignTo: "Field Officer",
      });

      setStatus("success");
      const msg =
        lang === "TA"
          ? `உங்கள் புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது. புகார் எண்: ${id}. நன்றி.`
          : `Your complaint has been registered. Complaint ID: ${id}. Thank you.`;
      addAIMessage(msg);
      speak(msg);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        lang === "TA"
          ? "தவறு நிகழ்ந்தது. மீண்டும் முயற்சிக்கவும்."
          : "Failed to submit. Please try again."
      );
    }
  };

  // ── Toggle Mic ───────────────────────────────────────────────────────────

  const handleMicClick = () => {
    if (status === "recording") {
      stopRecording(true);
    } else if (status === "waiting" || status === "idle") {
      if (messages.length === 0) {
        goToStep(0);
      } else {
        startRecording();
      }
    } else if (status === "success" || status === "error") {
      setMessages([]);
      msgIdRef.current = 0;
      goToStep(0);
    }
  };

  // ── Manual Text Input ────────────────────────────────────────────────────

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    addUserMessage(text);
    processStep(text);
  };

  // ── UI Helpers ───────────────────────────────────────────────────────────

  const micBusy = ["transcribing", "processing", "speaking"].includes(status);
  const isRecording = status === "recording";

  const statusLabel = () => {
    if (isRecording) return lang === "TA" ? "பேசுங்கள்..." : "Speak now...";
    if (status === "transcribing") return lang === "TA" ? "பகுப்பாய்கிறது..." : "Transcribing...";
    if (status === "processing") return lang === "TA" ? "செயலாக்குகிறது..." : "Processing...";
    if (status === "speaking") return lang === "TA" ? "AI பேசுகிறது..." : "AI speaking...";
    if (status === "success") return lang === "TA" ? "வெற்றிகரமாக பதிவு செய்யப்பட்டது!" : "Successfully submitted!";
    if (status === "error") return errorMsg;
    return lang === "TA" ? "மைக் அழுத்தி பேசவும்" : "Tap mic to speak";
  };

  return (
    <div className="min-h-screen bg-[#A8CDE2] flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-white/30 backdrop-blur-md border-b border-white/20">
        <button
          onClick={() => navigate("/")}
          className="px-5 py-1.5 bg-white/40 hover:bg-white/60 text-[#2B4B6F] rounded-full font-black text-sm tracking-widest uppercase shadow-sm transition-all"
        >
          Back
        </button>
        <span className="font-black text-[#2B4B6F] uppercase tracking-widest">
          {lang === "TA" ? "வாய்மொழி போர்ட்டல்" : "Voice Portal"}
        </span>
        {/* Language Toggle */}
        <button
          onClick={() => setLang((l) => (l === "TA" ? "EN" : "TA"))}
          className="px-4 py-1.5 bg-white/40 hover:bg-white/60 text-[#2B4B6F] rounded-full font-black text-xs tracking-widest uppercase shadow-sm transition-all"
        >
          {lang === "TA" ? "ENG" : "தமிழ்"}
        </button>
      </header>

      {/* Chat area */}
      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto overflow-hidden relative pb-36">
        <div className="flex-1 w-full overflow-y-auto px-4 pt-6 space-y-4 scroll-smooth">

          {/* Welcome placeholder */}
          {messages.length === 0 && status === "idle" && (
            <div className="flex flex-col items-center justify-center py-20 opacity-80 animate-in fade-in duration-700">
              <Bot className="w-24 h-24 text-[#3A5D7C] mb-6 drop-shadow-md" />
              <h1 className="text-3xl font-black text-[#3A5D7C] mb-2 text-center">
                {lang === "TA" ? "உங்களுக்கு எப்படி உதவலாம்?" : "How can we help you?"}
              </h1>
              <p className="text-lg font-bold text-[#5B88A8] text-center max-w-md mb-8">
                {lang === "TA"
                  ? "கீழே உள்ள மைக் பட்டனை அழுத்தி பேசத்தொடங்கவும் அல்லது தட்டச்சு செய்யவும்."
                  : "Tap the microphone below to start speaking or type your message."}
              </p>
              {OPENAI_AVAILABLE && (
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest">
                  ✓ Whisper + GPT-4o Active
                </span>
              )}
              <button
                onClick={() => goToStep(0)}
                className="mt-6 px-10 py-4 bg-[#50A7B1] hover:bg-[#3D8F9A] text-white rounded-full font-black tracking-widest uppercase text-lg shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
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
                <Bot className="w-8 h-8 text-[#3A5D7C] mr-3 shrink-0 mt-1" />
              )}
              <div
                className={`max-w-[80%] rounded-[1.5rem] p-4 shadow-md text-left text-[15px] ${
                  msg.sender === "user"
                    ? "bg-[#3A5D7C] text-white rounded-br-sm"
                    : "bg-white text-[#2B4B6F] border border-[#3A5D7C]/10 rounded-bl-sm font-bold"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
              {msg.sender === "user" && (
                <User className="w-8 h-8 text-[#3A5D7C] ml-3 shrink-0 mt-1" />
              )}
            </div>
          ))}

          {/* Live caption while recording */}
          {isRecording && liveText && (
            <div className="flex w-full justify-end animate-in fade-in duration-200">
              <div className="max-w-[80%] bg-[#5B88A8]/70 text-white rounded-[1.5rem] rounded-br-sm p-4 shadow-md text-[15px]">
                <p className="font-medium italic">
                  {liveText}
                  <span className="animate-pulse">…</span>
                </p>
              </div>
              <User className="w-8 h-8 text-[#3A5D7C] ml-3 shrink-0 mt-1 opacity-50" />
            </div>
          )}

          {/* Status indicator */}
          {(status === "transcribing" || status === "processing") && (
            <div className="flex w-full justify-start animate-in fade-in">
              <Bot className="w-8 h-8 text-[#3A5D7C] mr-3 shrink-0 mt-1 animate-pulse" />
              <div className="bg-white rounded-[1.5rem] p-4 shadow-sm rounded-bl-sm flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-[#50A7B1]" />
                <span className="text-[#3A5D7C] font-bold uppercase tracking-widest text-sm">
                  {status === "transcribing"
                    ? lang === "TA" ? "மொழிபெயர்க்கிறது..." : "Transcribing..."
                    : lang === "TA" ? "செயலாக்குகிறது..." : "Processing..."}
                </span>
              </div>
            </div>
          )}

          {status === "speaking" && (
            <div className="flex w-full justify-start animate-in fade-in">
              <Bot className="w-8 h-8 text-[#3A5D7C] mr-3 shrink-0 mt-1 animate-pulse" />
              <div className="bg-white rounded-[1.5rem] px-5 py-4 shadow-sm rounded-bl-sm flex items-center gap-2">
                {[0, 150, 300].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-2 rounded-full bg-[#50A7B1] animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#8EBCD8] via-[#8EBCD8]/95 to-transparent pb-6 sm:pb-8">

          {/* Status label */}
          <p className="text-center text-sm font-black text-[#2B4B6F] uppercase tracking-widest mb-3 min-h-[1.25rem]">
            {statusLabel()}
          </p>

          <div className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-2.5 shadow-2xl border border-white flex items-center gap-3">

            {/* Mic / Stop button */}
            <button
              onClick={handleMicClick}
              disabled={micBusy}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all shadow-md ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/40 animate-pulse"
                  : micBusy
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#3A5D7C] hover:bg-[#2B4B6F] hover:scale-105"
              }`}
            >
              {isRecording ? (
                <StopCircle className="w-6 h-6 text-white" />
              ) : micBusy ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Text input */}
            <form
              onSubmit={handleTextSubmit}
              id="voice-text-form"
              className="flex-1 flex items-center bg-gray-100 rounded-full border border-gray-200 px-5 py-3 focus-within:border-[#50A7B1] focus-within:ring-4 focus-within:ring-[#50A7B1]/20 transition-all"
            >
              <Keyboard className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input
                id="voice-text-input"
                name="voice-text-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={micBusy || status === "success"}
                placeholder={
                  isRecording
                    ? lang === "TA" ? "பேசுங்கள்..." : "Listening..."
                    : lang === "TA" ? "இங்கே தட்டச்சு செய்யவும்..." : "Type your message..."
                }
                className="flex-1 bg-transparent border-none focus:outline-none text-[#2B4B6F] font-bold placeholder:font-medium placeholder:text-gray-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || micBusy || status === "success"}
                className="ml-2 p-2.5 rounded-full bg-[#50A7B1] text-white disabled:opacity-40 disabled:bg-gray-400 hover:bg-[#3D8F9A] transition-colors hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
