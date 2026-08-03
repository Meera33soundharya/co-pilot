import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  Play,
  Square,
  Sparkles,
  Volume2,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { analyzeComplaint, extractEntities } from "@/services/aiService";

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export default function SpeechStudio() {
  const { addComplaint } = useComplaints();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [status, setStatus] = useState("Ready to capture speech");
  const [outputText, setOutputText] = useState("Thank you. Your complaint has been successfully registered.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [workflowState, setWorkflowState] = useState({
    stt: false,
    ai: false,
    registration: false,
    assignment: false,
    confirmation: false,
    notification: false,
  });
  const [sessionSummary, setSessionSummary] = useState<{ complaintId: string; dept: string; category: string; priority: string } | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const recognitionSupported = useMemo(() => {
    return typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    const generatedKey = `GOVPILOT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setApiKey(generatedKey);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (!selectedVoice && availableVoices.length > 0) {
        const preferred = availableVoices.find((voice) => voice.lang.startsWith("en")) ?? availableVoices[0];
        setSelectedVoice(preferred?.name ?? "");
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [selectedVoice]);

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      setStatus("Speech synthesis is not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;

    const voice = voices.find((item) => item.name === selectedVoice);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatus("Voice generation failed. Please retry.");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setStatus("Generating audio response…");
  }, [selectedVoice, voices]);

  const handleCitizenFlow = useCallback(async (rawTranscript: string) => {
    const cleaned = rawTranscript.trim();
    if (!cleaned) return;

    setWorkflowState({ stt: true, ai: false, registration: false, assignment: false, confirmation: false, notification: false });
    setStatus("Analyzing citizen voice…");

    const entities = extractEntities(cleaned, 0.92);
    const aiResult = await analyzeComplaint(entities.issue || cleaned, cleaned);

    setWorkflowState((prev) => ({ ...prev, ai: true }));

    const complaintId = await addComplaint({
      citizen: entities.citizen || "Citizen",
      phone: entities.phone || "Not provided",
      ward: entities.ward || "Ward 28",
      issue: entities.issue || cleaned,
      description: `${cleaned}\n\nAI summary: ${aiResult.summary}`,
      priority: aiResult.priority,
      category: aiResult.category,
      dept: aiResult.dept,
      location: entities.ward || "Citizen voice portal",
      source: "voice",
      notifPref: "SMS",
    });

    setWorkflowState((prev) => ({ ...prev, registration: true, assignment: true }));
    const confirmationText = `Complaint ${complaintId} has been registered. ${aiResult.summary}. Routed to ${aiResult.dept}.`;
    setOutputText(confirmationText);
    setSessionSummary({ complaintId: String(complaintId), dept: aiResult.dept, category: aiResult.category, priority: aiResult.priority });
    setStatus("Citizen complaint auto-registered and routed");
    setWorkflowState((prev) => ({ ...prev, confirmation: true, notification: true }));
    speakText(confirmationText);
  }, [addComplaint, speakText]);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setStatus("Listening stopped");
  };

  const startListening = () => {
    if (!recognitionSupported) {
      setStatus("Speech recognition is not supported in this browser.");
      return;
    }

    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setStatus("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
      const results = Array.from(event.results) as Array<Array<{ transcript: string }>>;
      const result = results
        .map((item) => item[0]?.transcript ?? "")
        .join(" ")
        .trim();

      const finalText = results
        .filter((item) => item[0]?.transcript)
        .map((item) => item[0]?.transcript ?? "")
        .join(" ")
        .trim();

      setTranscript(finalText);
      setInterimText(result);
      if (result) {
        setStatus("Speech captured successfully");
        void handleCitizenFlow(finalText);
      }
    };

    recognition.onerror = (event: { error: string }) => {
      setStatus(`Recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus(transcript ? "Listening complete" : "Listening ended");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setStatus("Listening for speech…");
  };

  const handleSpeak = () => {
    speakText(outputText || transcript || "Hello from GovPilot");
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setStatus("Audio playback stopped");
  };

  return (
    <DashboardLayout
      title="Speech Studio"
      subtitle="Real-time speech-to-text and audio generation for civic workflows"
    >
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(200,29,37,0.2),_transparent_40%)] p-4 lg:p-8 text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#C81D25]">Speech Studio</p>
                <h1 className="text-3xl font-black text-white">Citizen voice pipeline for the public portal</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Public voice input is now routed through speech-to-text, AI classification, complaint registration, officer assignment, voice confirmation, and SMS/app notifications.
                </p>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                {status}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Auto-generated API key</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <code className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100">{apiKey || "Generating key…"}</code>
                  <button
                    onClick={() => {
                      const key = `GOVPILOT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
                      setApiKey(key);
                      setStatus("Voice session key refreshed");
                    }}
                    className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200"
                  >
                    Refresh key
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Current session</p>
                {sessionSummary ? (
                  <div className="mt-3 space-y-1 text-sm text-slate-300">
                    <p><span className="text-slate-500">Complaint:</span> {sessionSummary.complaintId}</p>
                    <p><span className="text-slate-500">Department:</span> {sessionSummary.dept}</p>
                    <p><span className="text-slate-500">Category:</span> {sessionSummary.category}</p>
                    <p><span className="text-slate-500">Priority:</span> {sessionSummary.priority}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">No voice complaint has been processed yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Real-time STT</p>
                  <h2 className="text-xl font-black text-white">Capture spoken complaint text</h2>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm font-semibold ${isListening ? "bg-red-500/15 text-red-300" : "bg-slate-800 text-slate-300"}`}>
                  {isListening ? "Listening" : "Idle"}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition ${isListening ? "bg-red-600 hover:bg-red-500" : "bg-[#C81D25] hover:bg-[#a01520]"}`}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                  <div>
                    <p className="font-semibold text-white">{isListening ? "Stop capture" : "Start listening"}</p>
                    <p className="text-sm text-slate-400">Works in supported browsers such as Chrome or Edge.</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Transcript</p>
                  <p className="mt-3 min-h-[96px] text-lg text-slate-200">
                    {transcript || interimText || "Speech will appear here as you speak."}
                  </p>
                  {interimText && transcript !== interimText && (
                    <p className="mt-2 text-sm text-slate-400">Interim text: {interimText}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Audio generation</p>
                  <h2 className="text-xl font-black text-white">Generate voice confirmation</h2>
                </div>
                <div className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-300">
                  {isSpeaking ? "Playing" : "Ready"}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Voice text</label>
                <textarea
                  value={outputText}
                  onChange={(event) => setOutputText(event.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none ring-0"
                />

                <label className="mt-4 mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Voice</label>
                <select
                  value={selectedVoice}
                  onChange={(event) => setSelectedVoice(event.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  {voices.length === 0 && <option value="">No voices detected</option>}
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={handleSpeak}
                    className="flex items-center gap-2 rounded-full bg-[#C81D25] px-5 py-3 font-semibold text-white transition hover:bg-[#a01520]"
                  >
                    {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    Generate audio
                  </button>
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-200 transition hover:bg-slate-700"
                  >
                    <Square className="h-4 w-4" /> Stop
                  </button>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#C81D25]" />
              <h3 className="text-lg font-black text-white">Citizen workflow status</h3>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                {[
                  { key: "stt", label: "Citizen Speaks" },
                  { key: "ai", label: "Speech-to-Text" },
                  { key: "registration", label: "AI Analysis" },
                  { key: "assignment", label: "Complaint Registration" },
                  { key: "confirmation", label: "Field Officer Assignment" },
                  { key: "notification", label: "Voice Confirmation / SMS & App" },
                ].map((step) => {
                  const done = workflowState[step.key as keyof typeof workflowState];
                  return (
                    <div key={step.key} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${done ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-slate-800 bg-slate-950/70 text-slate-300"}`}>
                      <span className="text-sm font-semibold">{step.label}</span>
                      <span className="text-xs uppercase tracking-[0.25em]">{done ? "Done" : "Pending"}</span>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-semibold">STT ready</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">The page captures voice input and turns it into text in real time.</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Volume2 className="h-4 w-4" />
                    <span className="text-sm font-semibold">TTS ready</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">The voice generator plays confirmation audio directly in the browser.</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center gap-2 text-amber-300">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Browser support</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Use Chrome, Edge, or another browser with Web Speech API support for the best experience.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
