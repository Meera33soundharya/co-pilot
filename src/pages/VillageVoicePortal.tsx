import React, { useState, useEffect, useRef } from "react";
import { Mic, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Globe, Bot, Send, Keyboard, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "@/context/ComplaintsContext";
import { analyzeComplaint } from "@/services/aiService";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const LANGUAGES = {
  TA: { code: 'ta-IN', name: 'தமிழ் (Tamil)', label: 'தமிழ்' },
  EN: { code: 'en-IN', name: 'English', label: 'ENG' }
};

type Status = "idle" | "listening" | "processing" | "success" | "error" | "waiting" | "speaking";

export default function VillageVoicePortal() {
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();
  
  const [lang, setLang] = useState<keyof typeof LANGUAGES>('TA');
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState<number>(0);
  const [messages, setMessages] = useState<{ id: number; sender: 'ai' | 'user'; text: string }[]>([]);
  const [inputText, setInputText] = useState("");
  
  const transcriptRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(0);
  const answersRef = useRef({ name: "", issue: "", ward: "", phone: "" });
  const recognitionRef = useRef<any>(null);
  const isListeningExpectedRef = useRef(false);
  const silenceTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = () => {
        setStatus("listening");
        setTranscript("");
        transcriptRef.current = "";
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        transcriptRef.current = currentTranscript;

        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
          if (transcriptRef.current.trim().length > 0) {
            isListeningExpectedRef.current = false;
            try { recognitionRef.current.stop(); } catch(e) {}
            processTranscriptStep(transcriptRef.current.trim());
            setTranscript("");
            transcriptRef.current = "";
          }
        }, 3000);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        isListeningExpectedRef.current = false;
        
        if (event.error === 'not-allowed') {
           setStatus("error");
           setErrorMsg(lang === 'TA' ? "மைக்ரோஃபோனை அனுமதிக்கவும்." : "Please allow microphone access.");
        } else if (event.error === 'network') {
           console.log("Network error from Web Speech API. Retrying silently...");
           setTimeout(() => {
               if (isListeningExpectedRef.current && recognitionRef.current) {
                   try { recognitionRef.current.start(); } catch(e) {}
               }
           }, 1000);
        } else {
           setStatus("error");
           setErrorMsg(lang === 'TA' ? "தவறு நிகழ்ந்தது. மீண்டும் முயற்சிக்கவும்." : "Something went wrong. Please try again.");
        }
      };
      
      recognitionRef.current.onend = () => {
        if (isListeningExpectedRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
        } else {
          setStatus(prev => {
            if (prev !== "waiting" && prev !== "processing" && prev !== "success" && prev !== "error" && prev !== "speaking") {
              return "idle";
            }
            return prev;
          });
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch(e) {}
      }
    };
  }, [lang]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANGUAGES[lang].code;
    }
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript, status]);

  const speak = (text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    
    try { window.speechSynthesis.cancel(); } catch (e) {}
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGES[lang].code;
    utterance.rate = 0.9;
    
    let called = false;
    const safeOnEnd = () => {
      if (!called) {
        called = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onend = safeOnEnd;
    utterance.onerror = safeOnEnd;

    const timeoutId = setTimeout(() => { safeOnEnd(); }, 8000);
    utterance.addEventListener('end', () => clearTimeout(timeoutId));
    utterance.addEventListener('error', () => clearTimeout(timeoutId));
    
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      safeOnEnd();
    }
  };

  const startStep = (s: number) => {
    stepRef.current = s;
    setStep(s);
    setStatus("speaking");
    setTranscript("");
    transcriptRef.current = "";
    
    if (s === 0) {
      answersRef.current = { name: "", issue: "", ward: "", phone: "" };
      setMessages([]);
    }
    
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    
    let textToSpeak = "";
    if (s === 0) {
      textToSpeak = lang === 'TA' ? "பொது புகார் இணையதளத்திற்கு வரவேற்கிறோம். உங்கள் பெயரை சொல்லுங்கள்." : "Welcome to the Public Grievance Portal. Please tell me your name.";
    } else if (s === 1) {
      textToSpeak = lang === 'TA' ? "உங்கள் புகாரை விவரிக்கவும்." : "Please describe your complaint.";
    } else if (s === 2) {
      textToSpeak = lang === 'TA' ? "உங்கள் வார்டு எண் அல்லது பகுதி பெயரை சொல்லுங்கள்." : "Please tell me your ward number or area name.";
    } else if (s === 3) {
      textToSpeak = lang === 'TA' ? "உங்கள் மொபைல் எண்ணை வழங்கவும்." : "Please provide your mobile number.";
    } else if (s === 4) {
      const { name, issue, ward, phone } = answersRef.current;
      textToSpeak = lang === 'TA' 
        ? `பெயர்: ${name}. புகார்: ${issue}. வார்டு: ${ward}. மொபைல்: ${phone}. தயவுசெய்து உறுதிப்படுத்தவும். சமர்ப்பிக்க ஆம் என்றும், மீண்டும் பதிவு செய்ய இல்லை என்றும் சொல்லுங்கள்.`
        : `Name: ${name}. Complaint: ${issue}. Ward: ${ward}. Mobile: ${phone}. Please confirm. Say YES to submit or NO to re-record.`;
    }

    setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: textToSpeak }]);

    speak(textToSpeak, () => {
      if (recognitionRef.current) {
        isListeningExpectedRef.current = true;
        try {
          recognitionRef.current.start();
        } catch(e) {
          console.log("Mic already listening or failed", e);
        }
      } else {
          // If no recognition support, just go to waiting to allow typing
          setStatus("waiting");
      }
    });
  };

  const processTranscriptStep = (text: string) => {
    setStatus("waiting"); 
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    
    if (stepRef.current === 0) {
       answersRef.current.name = text;
       let ackMsg = lang === 'TA' ? `நன்றி ${text}.` : `Thank you ${text}.`;
       setStatus("speaking");
       setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: ackMsg }]);
       speak(ackMsg, () => {
           setStatus("waiting");
           setTimeout(() => startStep(1), 1000);
       });
    } else if (stepRef.current === 1) {
       answersRef.current.issue = text;
       let ackMsg = lang === 'TA' ? `உங்கள் புகாரை பதிவு செய்துள்ளேன்.` : `I have recorded your complaint regarding ${text}.`;
       setStatus("speaking");
       setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: ackMsg }]);
       speak(ackMsg, () => {
           setStatus("waiting");
           setTimeout(() => startStep(2), 1000);
       });
    } else if (stepRef.current === 2) {
       answersRef.current.ward = text;
       let ackMsg = lang === 'TA' ? `நன்றி. நான் ${text} ஐ பதிவு செய்துள்ளேன்.` : `Thank you. I have recorded ${text}.`;
       setStatus("speaking");
       setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: ackMsg }]);
       speak(ackMsg, () => {
           setStatus("waiting");
           setTimeout(() => startStep(3), 1000);
       });
    } else if (stepRef.current === 3) {
       answersRef.current.phone = text;
       startStep(4);
    } else if (stepRef.current === 4) {
       const lower = text.toLowerCase();
       if (lower.includes("yes") || lower.includes("ஆம்") || lower.includes("s") || lower.includes("யெஸ்") || lower.includes("ok") || lower.includes("சரி")) {
           submitVoiceComplaint();
       } else {
           let ackMsg = lang === 'TA' ? `சரி, மீண்டும் தொடங்குவோம்.` : `Okay, let's start again.`;
           setStatus("speaking");
           setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: ackMsg }]);
           speak(ackMsg, () => startStep(0));
       }
    }
  };

  const submitVoiceComplaint = async () => {
    setStatus("processing");
    const { name, issue, ward, phone } = answersRef.current;
    
    try {
      const aiResult = await analyzeComplaint(issue, issue);
      const officerName = aiResult.dept === "Water Supply Department" ? "Rajiv Kumar" : "Field Officer";

      const id = addComplaint({
        citizen: name || "Village Voice User",
        phone: phone || "N/A",
        ward: ward || "Unknown",
        issue: issue,
        description: issue,
        priority: aiResult.priority,
        category: aiResult.category,
        dept: aiResult.dept,
        notifPref: "None",
        source: "voice",
        autoAssignTo: officerName
      });

      setStatus("success");
      const msg = lang === 'TA' 
        ? `உங்கள் புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது. உங்கள் புகார் எண் ${id}. புகார் சம்பந்தப்பட்ட அதிகாரிக்கு ஒதுக்கப்பட்டுள்ளது. நன்றி.` 
        : `Your complaint has been registered successfully. Your Complaint ID is ${id}. The complaint has been assigned to the concerned officer. Thank you.`;
      
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: msg }]);
      speak(msg);
    } catch (err) {
      console.error("Failed to process complaint via AI", err);
      setStatus("error");
      setErrorMsg(lang === 'TA' ? "தவறு நிகழ்ந்தது. மீண்டும் முயற்சிக்கவும்." : "Failed to process complaint. Please try again.");
    }
  };

  const toggleListen = () => {
    if (status === "listening") {
      isListeningExpectedRef.current = false;
      try { recognitionRef.current?.stop(); } catch(e) {}
      setStatus("idle");
    } else {
      if (status === "success" || status === "error") {
        answersRef.current = { name: "", issue: "", ward: "", phone: "" };
        setMessages([]);
        startStep(0);
        return;
      }
      if (stepRef.current === 0 && messages.length === 0) {
          startStep(0);
      } else {
          isListeningExpectedRef.current = true;
          try { recognitionRef.current?.start(); } catch(e) {}
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText("");
    
    isListeningExpectedRef.current = false;
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    try { recognitionRef.current?.stop(); } catch(e) {}
    
    setTranscript("");
    transcriptRef.current = "";
    processTranscriptStep(text);
  };

  const TEXTS = {
    TA: { title: "வாய்மொழி போர்ட்டல்" },
    EN: { title: "Voice Portal" }
  };

  return (
    <div className="min-h-screen bg-[#A8CDE2] flex flex-col font-sans">
      <header className="h-16 flex items-center justify-between px-6 shrink-0 relative z-10 bg-white/30 backdrop-blur-md border-b border-white/20">
        <button onClick={() => navigate("/")} className="px-5 py-1.5 bg-white/40 hover:bg-white/60 text-[#2B4B6F] rounded-full font-black text-[10px] tracking-widest uppercase shadow-sm transition-all">Back</button>
        <span className="font-black text-[#2B4B6F] uppercase tracking-widest">{TEXTS[lang].title}</span>

      </header>

      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto overflow-hidden relative pb-28">
        <div className="flex-1 w-full overflow-y-auto px-4 pt-6 space-y-6 scroll-smooth">
          
          {messages.length === 0 && status !== "success" && status !== "error" && (
            <div className="flex flex-col items-center justify-center py-20 opacity-80 animate-in fade-in duration-700">
               <Bot className="w-24 h-24 text-[#3A5D7C] mb-6 drop-shadow-md" />
               <h1 className="text-3xl font-black text-[#3A5D7C] mb-2 text-center" style={{ fontFamily: "'Nunito', 'Outfit', sans-serif" }}>
                 {lang === 'TA' ? "உங்களுக்கு எப்படி உதவலாம்?" : "How can we help you?"}
               </h1>
               <p className="text-lg font-bold text-[#5B88A8] text-center max-w-md">
                 {lang === 'TA' ? "கீழே உள்ள மைக் பட்டனை அழுத்தி பேசத்தொடங்கவும் அல்லது தட்டச்சு செய்யவும்." : "Tap the microphone below to start speaking or type your request."}
               </p>
               <button 
                  onClick={() => startStep(0)}
                  className="mt-8 px-10 py-4 bg-[#50A7B1] hover:bg-[#3D8F9A] text-white rounded-full font-black tracking-widest uppercase text-sm shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
               >
                 <Mic className="w-5 h-5" />
                 {lang === 'TA' ? "தொடங்க" : "Start"}
               </button>
            </div>
          )}

          {messages.map((msg, idx) => (
              <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                {msg.sender === 'ai' && <Bot className="w-8 h-8 text-[#3A5D7C] mr-3 shrink-0 mt-1" />}
                <div className={`max-w-[80%] rounded-[1.5rem] p-4 shadow-md text-left text-[15px] ${
                  msg.sender === 'user' 
                    ? 'bg-[#3A5D7C] text-white rounded-br-sm' 
                    : 'bg-white text-[#2B4B6F] border border-[#3A5D7C]/10 rounded-bl-sm font-bold'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.sender === 'user' && <User className="w-8 h-8 text-[#3A5D7C] ml-3 shrink-0 mt-1" />}
              </div>
          ))}

          {/* Live Transcript Bubble */}
          {transcript && status !== "success" && (
            <div className="flex w-full justify-end animate-in fade-in duration-200">
              <div className="max-w-[80%] bg-[#5B88A8] text-white border border-[#5B88A8] rounded-[1.5rem] rounded-br-sm p-4 shadow-md text-left text-[15px]">
                <p className="font-medium italic">{transcript}<span className="animate-pulse">...</span></p>
              </div>
              <User className="w-8 h-8 text-[#3A5D7C] ml-3 shrink-0 mt-1 opacity-50" />
            </div>
          )}
          
          {/* Status Indicators for AI */}
          {status === "processing" && (
            <div className="flex w-full justify-start animate-in fade-in">
              <Bot className="w-8 h-8 text-[#3A5D7C] mr-3 shrink-0 mt-1" />
              <div className="bg-white rounded-[1.5rem] p-4 shadow-sm rounded-bl-sm flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-[#50A7B1]" />
                <span className="text-[#3A5D7C] font-bold text-sm uppercase tracking-widest">
                  {lang === 'TA' ? "பதிவாகிறது..." : "Processing..."}
                </span>
              </div>
            </div>
          )}
          {status === "speaking" && (
            <div className="flex w-full justify-start animate-in fade-in">
              <Bot className="w-8 h-8 text-[#3A5D7C] mr-3 shrink-0 mt-1 animate-pulse" />
              <div className="bg-white rounded-[1.5rem] px-5 py-4 shadow-sm rounded-bl-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#50A7B1] animate-bounce" style={{ animationDelay: "0ms" }} />
                 <div className="w-2 h-2 rounded-full bg-[#50A7B1] animate-bounce" style={{ animationDelay: "150ms" }} />
                 <div className="w-2 h-2 rounded-full bg-[#50A7B1] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        {messages.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#8EBCD8] via-[#8EBCD8]/95 to-transparent flex justify-center pb-6 sm:pb-8">
            <div className="w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-2.5 shadow-2xl border border-white flex items-center gap-3 transition-all">
              
              <button 
                onClick={toggleListen}
                disabled={status === "speaking" || status === "processing" || status === "success"}
                className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all shadow-md ${
                  status === "listening" 
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/40 animate-pulse" 
                    : "bg-[#3A5D7C] hover:bg-[#2B4B6F] disabled:bg-gray-300 hover:scale-105"
                }`}
              >
                <Mic className={`w-5 h-5 text-white ${status === "listening" ? "animate-bounce" : ""}`} />
              </button>

              <form onSubmit={handleManualSubmit} className="flex-1 flex items-center bg-gray-100 rounded-full border border-gray-200 px-5 py-3 focus-within:border-[#50A7B1] focus-within:ring-4 focus-within:ring-[#50A7B1]/20 transition-all">
                <Keyboard className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={status === "processing" || status === "success"}
                  placeholder={
                    status === "listening" 
                      ? (lang === 'TA' ? "பேசுங்கள்..." : "Listening...")
                      : (lang === 'TA' ? "இங்கே தட்டச்சு செய்யவும்..." : "Type your message...")
                  }
                  className="flex-1 bg-transparent border-none focus:outline-none text-[#2B4B6F] font-bold placeholder:font-medium placeholder:text-gray-400 disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || status === "processing" || status === "success"}
                  className="ml-2 p-2.5 rounded-full bg-[#50A7B1] text-white disabled:opacity-40 disabled:bg-gray-400 hover:bg-[#3D8F9A] transition-colors hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
