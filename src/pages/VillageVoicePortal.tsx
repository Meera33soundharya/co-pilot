import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic, Loader2, Bot, Keyboard, StopCircle, Clock, Volume2, Save, CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "@/context/ComplaintsContext";
import { analyzeComplaint } from "@/services/aiService";
import { transcribeAudio, extractEntitiesGPT, extractEntitiesLocal, generateConversationSummary, refineTranscriptGPT } from "@/services/voiceAiService";

const LANGUAGES = {
  TA: { code: "ta-IN", whisper: "ta" as const, name: "தமிழ் (Tamil)", label: "தமிழ்" },
  EN: { code: "en-IN", whisper: "en" as const, name: "English", label: "ENG" },
};

const OPENAI_AVAILABLE = !!import.meta.env.VITE_OPENAI_API_KEY;

type LangKey = keyof typeof LANGUAGES;
type Status = "idle" | "speaking" | "listening" | "transcribing" | "processing" | "saving" | "completed" | "error";

const STEPS = {
  TA: [
    "வணக்கம்! நான் GovPilot AI உதவியாளர். உங்கள் பெயரை சொல்லுங்கள்.",
    "உங்கள் புகாரை விவரிக்கவும்.",
    "உங்கள் வார்டு எண் அல்லது பகுதி பெயரை சொல்லுங்கள்.",
    "உங்கள் மொபைல் எண்ணை வழங்கவும்.",
    "",
  ],
  EN: [
    "Welcome to the Public Grievance Portal. I am the GovPilot AI Assistant. Please tell me your name.",
    "Please describe your complaint.",
    "Please tell me your ward number or area name.",
    "Please provide your mobile number.",
    "",
  ],
};

export default function VillageVoicePortal() {
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();

  const [lang, setLang] = useState<LangKey>("TA");
  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState(0);
  const [liveText, setLiveText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [timer, setTimer] = useState(0);
  const [summary, setSummary] = useState("");
  const [transcripts, setTranscripts] = useState<string[]>([]);
  
  // Refs for logic
  const stepRef = useRef(0);
  const answersRef = useRef({ name: "", issue: "", ward: "", phone: "" });
  const retryCountRef = useRef(0);
  
  // Timers
  const globalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const noResponseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize SpeechSynthesis & Global Timer
  useEffect(() => {
    synthRef.current.getVoices();
    synthRef.current.onvoiceschanged = () => synthRef.current.getVoices();

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      
      rec.onresult = (e: any) => {
        let t = "";
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        setLiveText(t);
        
        // VAD Logic: Reset no-response timeout, start speech-end timeout
        if (noResponseTimeoutRef.current) clearTimeout(noResponseTimeoutRef.current);
        if (speechEndTimeoutRef.current) clearTimeout(speechEndTimeoutRef.current);
        
        speechEndTimeoutRef.current = setTimeout(() => {
          stopRecording(true); // User finished speaking
        }, 3000); // 3 seconds of silence
      };
      rec.onerror = () => {};
      recognitionRef.current = rec;
    }

    return () => {
      stopAll();
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANGUAGES[lang].code;
    }
  }, [lang]);

  const stopAll = () => {
    stopRecording(false);
    try { synthRef.current.cancel(); } catch (_) {}
    if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    if (noResponseTimeoutRef.current) clearTimeout(noResponseTimeoutRef.current);
    if (speechEndTimeoutRef.current) clearTimeout(speechEndTimeoutRef.current);
  };

  // ── Speech Synthesis ────────────────────────────────────────────────────
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) { onEnd?.(); return; }
    try { synthRef.current.cancel(); } catch (_) {}

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = LANGUAGES[lang].code;
    utter.rate = 0.88;

    let fired = false;
    const done = () => { if (!fired) { fired = true; onEnd?.(); } };
    utter.onend = done;
    utter.onerror = done;
    
    // Fallback if event doesn't fire
    const guard = setTimeout(done, Math.max(5000, text.length * 100));
    utter.addEventListener("end", () => clearTimeout(guard));
    utter.addEventListener("error", () => clearTimeout(guard));

    try { synthRef.current.speak(utter); } catch (_) { done(); }
  }, [lang]);

  // ── VAD Recording ───────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setLiveText("");
      setStatus("listening");

      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (_) {}
      }

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType });
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(250);
      mediaRecorderRef.current = mr;
      
      // 30 seconds global no-response timeout
      if (noResponseTimeoutRef.current) clearTimeout(noResponseTimeoutRef.current);
      noResponseTimeoutRef.current = setTimeout(() => {
        handleSilenceTimeout();
      }, 30000);

    } catch (err) {
      setStatus("error");
      setErrorMsg(lang === "TA" ? "மைக்ரோஃபோனை அனுமதிக்கவும்." : "Please allow microphone access.");
    }
  }, [lang]);

  const handleSilenceTimeout = () => {
    stopRecording(false);
    retryCountRef.current += 1;
    if (retryCountRef.current > 2) {
      // Skip to next question
      goToStep(stepRef.current + 1);
    } else {
      // Polite retry
      const retryMsg = lang === "TA" ? "மன்னிக்கவும், நீங்கள் பேசியது கேட்கவில்லை. மீண்டும் கூறுங்கள்." : "I'm sorry, I didn't hear that. Could you please repeat?";
      setStatus("speaking");
      speak(retryMsg, () => {
        startRecording();
      });
    }
  };

  const stopRecording = useCallback((process = true) => {
    if (noResponseTimeoutRef.current) clearTimeout(noResponseTimeoutRef.current);
    if (speechEndTimeoutRef.current) clearTimeout(speechEndTimeoutRef.current);
    if (recognitionRef.current) {
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

  // ── Transcription & Processing ──────────────────────────────────────────
  const handleAudioBlob = useCallback(async (blob: Blob) => {
    setStatus("transcribing");
    let finalText = "";

    if (OPENAI_AVAILABLE) {
      try {
        finalText = await transcribeAudio(blob, LANGUAGES[lang].whisper);
      } catch (e) {
        finalText = liveText;
      }
    } else {
      finalText = liveText;
    }

    if (!finalText.trim()) {
      handleSilenceTimeout();
      return;
    }

    if (OPENAI_AVAILABLE) {
      setStatus("processing"); // Show processing while refining
      finalText = await refineTranscriptGPT(finalText, LANGUAGES[lang].whisper);
    }

    retryCountRef.current = 0; // reset retries
    setTranscripts(prev => [...prev, `Citizen: ${finalText}`]);
    await processStep(finalText);
  }, [lang, liveText]);

  // ── Step Flow ───────────────────────────────────────────────────────────
  const goToStep = useCallback((s: number) => {
    stepRef.current = s;
    setStep(s);
    retryCountRef.current = 0;

    if (s === 0) {
      answersRef.current = { name: "", issue: "", ward: "", phone: "" };
      setTranscripts([]);
      setTimer(0);
      if (globalTimerRef.current) clearInterval(globalTimerRef.current);
      globalTimerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }

    let text = STEPS[lang][s];
    if (s === 4) {
      const { name, issue, ward, phone } = answersRef.current;
      text = lang === "TA"
        ? `பெயர்: ${name}. புகார்: ${issue}. வார்டு: ${ward}. மொபைல்: ${phone}. அனைத்தும் சரியா? ஆம் அல்லது இல்லை என கூறவும்.`
        : `Name: ${name}. Complaint: ${issue}. Ward: ${ward}. Mobile: ${phone}. Is this correct? Say YES or NO.`;
    }

    setStatus("speaking");
    setTranscripts(prev => [...prev, `AI: ${text}`]);
    speak(text, () => {
      if (s <= 4) startRecording();
    });
  }, [lang, speak, startRecording]);

  const processStep = useCallback(async (text: string) => {
    setStatus("processing");
    const s = stepRef.current;
    const extractor = OPENAI_AVAILABLE ? extractEntitiesGPT : (t: string, f: any) => Promise.resolve(extractEntitiesLocal(t, f));

    let ack = "";

    if (s === 0) {
      answersRef.current.name = await extractor(text, "name");
    } else if (s === 1) {
      answersRef.current.issue = await extractor(text, "issue");
    } else if (s === 2) {
      answersRef.current.ward = await extractor(text, "ward");
    } else if (s === 3) {
      answersRef.current.phone = await extractor(text, "phone") || text;
    } else if (s === 4) {
      const answer = await extractor(text, "confirm");
      if (answer === "YES") {
        await submitComplaint();
      } else {
        ack = lang === "TA" ? "சரி, மீண்டும் தொடங்குவோம்." : "Okay, let's start again.";
        setStatus("speaking");
        speak(ack, () => goToStep(0));
      }
      return;
    }

    // Auto save response behavior
    setStatus("saving");
    setTimeout(() => {
      goToStep(s + 1);
    }, 3000); // Wait 3 seconds before next question
  }, [lang, speak, goToStep]);

  const submitComplaint = async () => {
    setStatus("saving");
    if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    
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

      // Generate summary
      const sumText = await generateConversationSummary(transcripts, LANGUAGES[lang].whisper);
      setSummary(sumText);
      setStatus("completed");

      const msg = lang === "TA"
        ? `உங்கள் புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது. நன்றி.`
        : `Your complaint has been successfully registered. Thank you.`;
      speak(msg);
    } catch (err) {
      setStatus("error");
      setErrorMsg(lang === "TA" ? "தவறு நிகழ்ந்தது. மீண்டும் முயற்சிக்கவும்." : "Failed to submit.");
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const currentQuestionText = step <= 4 ? STEPS[lang][step] : "";
  const progressPercent = Math.min(((step + 1) / 5) * 100, 100);

  return (
    <div className="min-h-screen bg-[#A8CDE2] flex flex-col font-sans">
      <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-white/30 backdrop-blur-md border-b border-white/20">
        <button onClick={() => navigate("/")} className="px-5 py-1.5 bg-white/40 hover:bg-white/60 text-[#2B4B6F] rounded-full font-black text-sm tracking-widest uppercase shadow-sm transition-all">
          Back
        </button>
        <span className="font-black text-[#2B4B6F] uppercase tracking-widest">
          {lang === "TA" ? "வாய்மொழி போர்ட்டல்" : "Voice Portal"}
        </span>
        <button onClick={() => setLang((l) => (l === "TA" ? "EN" : "TA"))} className="px-4 py-1.5 bg-white/40 hover:bg-white/60 text-[#2B4B6F] rounded-full font-black text-xs tracking-widest uppercase shadow-sm transition-all">
          {lang === "TA" ? "ENG" : "தமிழ்"}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {status === "idle" && (
          <div className="text-center animate-in fade-in duration-700">
            <Bot className="w-24 h-24 text-[#3A5D7C] mb-6 drop-shadow-md mx-auto" />
            <h1 className="text-3xl font-black text-[#3A5D7C] mb-4">
              {lang === "TA" ? "GovPilot AI உதவியாளர்" : "GovPilot AI Assistant"}
            </h1>
            <p className="text-lg font-bold text-[#5B88A8] max-w-md mx-auto mb-8">
              {lang === "TA" ? "உங்கள் புகாரை பதிவு செய்ய கீழே தொடங்கவும்." : "Start below to register your grievance hands-free."}
            </p>
            <button onClick={() => goToStep(0)} className="px-10 py-4 bg-[#50A7B1] hover:bg-[#3D8F9A] text-white rounded-full font-black tracking-widest uppercase text-lg shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto transition-all">
              <Mic className="w-5 h-5" />
              {lang === "TA" ? "தொடங்க" : "Start"}
            </button>
          </div>
        )}

        {status !== "idle" && status !== "completed" && (
          <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100">
              <div className="h-full bg-[#50A7B1] transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="absolute top-4 right-6 flex items-center gap-2 text-sm font-bold text-[#5B88A8]">
              <Clock className="w-4 h-4" /> {formatTimer(timer)}
            </div>

            {/* Avatar & Animation */}
            <div className="relative mt-8 mb-6">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${
                status === "listening" ? "bg-[#50A7B1]/20 animate-pulse" :
                status === "speaking" ? "bg-[#3A5D7C]/10" :
                "bg-gray-100"
              }`}>
                <Bot className={`w-14 h-14 ${status === "listening" ? "text-[#50A7B1]" : "text-[#3A5D7C]"}`} />
              </div>
              
              {status === "listening" && (
                <div className="absolute inset-0 rounded-full border-4 border-[#50A7B1] animate-ping opacity-20" />
              )}
            </div>

            {/* Status Label */}
            <div className="h-8 mb-4 flex items-center justify-center">
              {status === "listening" && <span className="flex items-center gap-2 text-sm font-black text-[#50A7B1] tracking-widest uppercase"><Mic className="w-4 h-4 animate-pulse"/> {lang === "TA" ? "பேசுங்கள்..." : "Listening..."}</span>}
              {status === "speaking" && <span className="flex items-center gap-2 text-sm font-black text-[#3A5D7C] tracking-widest uppercase"><Volume2 className="w-4 h-4 animate-bounce"/> {lang === "TA" ? "AI பேசுகிறது..." : "Speaking..."}</span>}
              {status === "transcribing" && <span className="flex items-center gap-2 text-sm font-black text-[#5B88A8] tracking-widest uppercase"><Loader2 className="w-4 h-4 animate-spin"/> {lang === "TA" ? "பகுப்பாய்கிறது..." : "Transcribing..."}</span>}
              {status === "processing" && <span className="flex items-center gap-2 text-sm font-black text-[#5B88A8] tracking-widest uppercase"><Loader2 className="w-4 h-4 animate-spin"/> {lang === "TA" ? "செயலாக்குகிறது..." : "Processing..."}</span>}
              {status === "saving" && <span className="flex items-center gap-2 text-sm font-black text-emerald-600 tracking-widest uppercase"><Save className="w-4 h-4 animate-bounce"/> {lang === "TA" ? "சேமிக்கப்படுகிறது..." : "Saving Response..."}</span>}
              {status === "error" && <span className="flex items-center gap-2 text-sm font-black text-red-500 tracking-widest uppercase">⚠️ {lang === "TA" ? "பிழை ஏற்பட்டது" : "Error Occurred"}</span>}
            </div>

            {/* Current Question */}
            <h2 className="text-2xl font-black text-[#2B4B6F] mb-6 min-h-[4rem] flex items-center justify-center">
              {step === 4 ? (lang === "TA" ? "விவரங்களை சரிபார்க்கவும்" : "Verify Details") : currentQuestionText}
            </h2>

            {/* Live Text / Thinking */}
            <div className="w-full bg-gray-50 rounded-2xl p-4 min-h-[4rem] text-left border border-gray-100 flex items-center shadow-inner">
              {status === "listening" ? (
                <p className="text-[#5B88A8] italic font-medium">
                  {liveText || (lang === "TA" ? "..." : "...")}
                  <span className="animate-pulse">|</span>
                </p>
              ) : status === "speaking" ? (
                <div className="flex gap-1.5 w-full justify-center">
                  {[0, 150, 300].map(d => <div key={d} className="w-2.5 h-2.5 rounded-full bg-[#3A5D7C] animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              ) : (
                <p className="text-[#5B88A8] italic font-medium w-full text-center">...</p>
              )}
            </div>

            {step === 4 && (
              <div className="w-full mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-left space-y-2 font-medium text-[#2B4B6F]">
                <p><span className="font-bold opacity-70">Name:</span> {answersRef.current.name}</p>
                <p><span className="font-bold opacity-70">Issue:</span> {answersRef.current.issue}</p>
                <p><span className="font-bold opacity-70">Ward:</span> {answersRef.current.ward}</p>
                <p><span className="font-bold opacity-70">Phone:</span> {answersRef.current.phone}</p>
              </div>
            )}

            {status === "listening" && (
              <button 
                onClick={() => stopRecording(true)}
                className="mt-6 px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-black tracking-widest uppercase shadow-lg flex items-center justify-center gap-2 w-full max-w-[200px] mx-auto transition-all hover:scale-105 active:scale-95"
              >
                <StopCircle className="w-5 h-5" />
                {lang === "TA" ? "நிறுத்து" : "Stop"}
              </button>
            )}

            {status === "error" && (
              <button 
                onClick={() => goToStep(step)}
                className="mt-6 px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-black tracking-widest uppercase shadow-lg flex items-center justify-center gap-2 w-full max-w-[200px] mx-auto transition-all hover:scale-105 active:scale-95"
              >
                {lang === "TA" ? "மீண்டும் முயற்சி செய்" : "Retry"}
              </button>
            )}
            
          </div>
        )}

        {status === "completed" && (
          <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-500 text-center">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6 drop-shadow-md" />
            <h2 className="text-3xl font-black text-[#2B4B6F] mb-4">
              {lang === "TA" ? "வெற்றிகரமாக முடிந்தது!" : "Conversation Completed!"}
            </h2>
            <p className="text-lg text-[#5B88A8] font-bold mb-6">
              {lang === "TA" ? "உங்கள் புகார் பதிவு செய்யப்பட்டது." : "Your grievance has been securely registered."}
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100 shadow-inner mb-8">
              <h3 className="font-black text-[#3A5D7C] uppercase tracking-widest text-sm mb-3">AI Summary</h3>
              <p className="text-[#2B4B6F] font-medium leading-relaxed">{summary}</p>
            </div>

            <button onClick={() => navigate("/dashboard")} className="px-10 py-4 bg-[#2B4B6F] hover:bg-[#1A3350] text-white rounded-full font-black tracking-widest uppercase shadow-xl transition-all hover:scale-105">
              {lang === "TA" ? "முகப்புக்கு திரும்பு" : "Go to Dashboard"}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
