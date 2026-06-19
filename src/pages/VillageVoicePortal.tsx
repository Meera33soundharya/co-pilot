import { useState, useEffect, useRef } from "react";
import { Mic, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "@/context/ComplaintsContext";

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

type Status = "idle" | "listening" | "processing" | "success" | "error" | "waiting";

export default function VillageVoicePortal() {
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();
  
  const [lang, setLang] = useState<keyof typeof LANGUAGES>('TA');
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState<number>(0);
  
  const transcriptRef = useRef("");
  const stepRef = useRef(0);
  const answersRef = useRef({ name: "", issue: "", ward: "" });
  const recognitionRef = useRef<any>(null);

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
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = () => {
        setStatus("listening");
        setTranscript("");
        transcriptRef.current = "";
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        transcriptRef.current = currentTranscript;
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setStatus("error");
        if (event.error === 'not-allowed') {
           setErrorMsg(lang === 'TA' ? "மைக்ரோஃபோனை அனுமதிக்கவும்." : "Please allow microphone access.");
        } else {
           setErrorMsg(lang === 'TA' ? "தவறு நிகழ்ந்தது. மீண்டும் முயற்சிக்கவும்." : "Something went wrong. Please try again.");
        }
      };
      
      recognitionRef.current.onend = () => {
        if (transcriptRef.current.trim().length > 0) {
          processTranscriptStep(transcriptRef.current.trim());
        } else {
          // Timed out or nothing spoken
          setStatus("idle");
        }
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [lang]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANGUAGES[lang].code;
    }
  }, [lang]);

  const speak = (text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Speech Synthesis cancel error", e);
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGES[lang].code;
    utterance.rate = 0.85;
    
    const voices = window.speechSynthesis.getVoices();
    const specificVoice = voices.find(v => v.lang.startsWith(LANGUAGES[lang].code.split('-')[0]) && (v.name.includes('Google') || v.name.includes('Online')));
    if (specificVoice) utterance.voice = specificVoice;
    
    let called = false;
    const safeOnEnd = () => {
      if (!called) {
        called = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onend = safeOnEnd;
    utterance.onerror = safeOnEnd;

    // Safety timeout in case the speech synthesis API hangs or gets blocked by the browser
    const timeoutId = setTimeout(() => {
      safeOnEnd();
    }, 6000);

    utterance.addEventListener('end', () => clearTimeout(timeoutId));
    utterance.addEventListener('error', () => clearTimeout(timeoutId));
    
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis speak error", e);
      safeOnEnd();
    }
  };

  const startStep = (s: number) => {
    stepRef.current = s;
    setStep(s);
    setStatus("idle");
    setTranscript("");
    transcriptRef.current = "";
    
    let textToSpeak = "";
    if (s === 0) textToSpeak = lang === 'TA' ? "உங்கள் பெயர் என்ன?" : "What is your name?";
    else if (s === 1) textToSpeak = lang === 'TA' ? "உங்கள் புகார் என்ன?" : "What is your complaint?";
    else if (s === 2) textToSpeak = lang === 'TA' ? "எந்த பகுதி அல்லது வார்டு?" : "Which ward or area are you from?";

    speak(textToSpeak, () => {
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch(e) {}
        }
      }, 500); // Short delay after speaking before mic starts
    });
  };

  const processTranscriptStep = (text: string) => {
    setStatus("waiting"); // The gap
    
    // The user requested a 3 seconds gap after the person speaks before the next question
    setTimeout(() => {
      const currentStep = stepRef.current;
      
      if (currentStep === 0) {
        answersRef.current.name = text;
        startStep(1);
      } else if (currentStep === 1) {
        answersRef.current.issue = text;
        startStep(2);
      } else if (currentStep === 2) {
        answersRef.current.ward = text;
        stepRef.current = 3;
        setStep(3);
        submitComplaint();
      }
    }, 3000); 
  };

  const submitComplaint = () => {
    setStatus("processing");
    const { name, issue, ward } = answersRef.current;
    
    setTimeout(() => {
      let mappedIssue = lang === 'TA' ? "பொது புகார்" : "General Complaint";
      let priority: "High" | "Medium" | "Low" = "Low";
      
      const lowerText = issue.toLowerCase();
      if (lowerText.includes("தண்ணீர்") || lowerText.includes("water") || lowerText.includes("pipe")) {
        mappedIssue = "Water Supply Issue";
        priority = "High";
      } else if (lowerText.includes("ரோடு") || lowerText.includes("சாலை") || lowerText.includes("road")) {
        mappedIssue = "Road Damage";
        priority = "Medium";
      } else if (lowerText.includes("மின்சாரம்") || lowerText.includes("current") || lowerText.includes("light") || lowerText.includes("விளக்கு")) {
        mappedIssue = "Electricity Issue";
        priority = "High";
      } else if (lowerText.includes("குப்பை") || lowerText.includes("garbage") || lowerText.includes("waste")) {
        mappedIssue = "Sanitation & Garbage";
        priority = "Medium";
      }

      const id = addComplaint({
        citizen: name || "Village Voice User",
        phone: "N/A",
        ward: ward || "Unknown",
        issue: mappedIssue,
        description: issue,
        priority: priority,
        notifPref: "None"
      });

      setStatus("success");
      const codeId = id.split('-').pop() || id;
      const msg = lang === 'TA' 
        ? "உங்கள் புகார் பதிவு செய்யப்பட்டது. நன்றி!" 
        : "Your complaint is registered. Thank you!";
      
      speak(msg);
    }, 2000);
  };

  const toggleListen = () => {
    if (status === "listening") {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        setStatus("error");
        setErrorMsg(lang === 'TA' ? "உங்கள் உலாவி குரல் பதிவை ஆதரிக்கவில்லை." : "Your browser doesn't support speech recognition.");
        return;
      }
      
      // If we are at success/end, reset
      if (status === "success" || status === "error") {
        answersRef.current = { name: "", issue: "", ward: "" };
        startStep(0);
        return;
      }

      // If we are idle, just start the current step over
      startStep(stepRef.current);
    }
  };

  const simulateSpeech = () => {
    const currentStep = stepRef.current;
    
    // Stop active recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    setStatus("waiting");

    const namePhrase = lang === 'TA' ? "அரவிந்த்குமார்" : "Aravindkumar";
    const issuePhrase = lang === 'TA' ? "குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாகிறது" : "Water pipe leakage";
    const wardPhrase = lang === 'TA' ? "வார்டு 2" : "Ward 02";

    let text = "";
    if (currentStep === 0) text = namePhrase;
    else if (currentStep === 1) text = issuePhrase;
    else if (currentStep === 2) text = wardPhrase;

    setTranscript(text);
    transcriptRef.current = text;
    
    processTranscriptStep(text);
  };

  const TEXTS = {
    TA: {
      title: "உங்களுக்கு எப்படி உதவலாம்?",
      subtitle: "மைக்ரோஃபோனை அழுத்தி உங்கள் புகாரை சொல்லுங்கள்.",
      idle: "பேசத்தொடங்க மைக் பட்டனை அழுத்தவும்",
      listening: "பேசுங்கள்...",
      waiting: "காத்திருங்கள்...",
      processing: "உங்கள் புகார் பதிவு செய்யப்படுகிறது...",
      success: "புகார் வெற்றிகரமாக பதிவானது!",
      retry: "மீண்டும் புகார் அளிக்க"
    },
    EN: {
      title: "How can we help you?",
      subtitle: "Tap the microphone below and speak your complaint.",
      idle: "Tap to start speaking",
      listening: "Listening...",
      waiting: "Please wait...",
      processing: "Processing your complaint...",
      success: "Complaint Registered Successfully!",
      retry: "Register Another"
    }
  };

  const t = TEXTS[lang];

  return (
    <div className="min-h-screen bg-[#A8CDE2] flex flex-col font-sans selection:bg-blue-200">
      <header className="h-20 flex items-center justify-between px-6 shrink-0 relative z-10">
        <button onClick={() => navigate("/")} className="px-6 py-2 bg-white/20 hover:bg-white/40 text-[#2B4B6F] rounded-full font-black tracking-widest uppercase text-xs transition-colors backdrop-blur-sm shadow-sm">
          Back
        </button>
        
        <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1 shadow-sm">
          {(Object.keys(LANGUAGES) as Array<keyof typeof LANGUAGES>).map((k) => (
            <button
              key={k}
              onClick={() => { 
                setLang(k); 
                setStatus("idle"); 
                setTranscript(""); 
                transcriptRef.current=""; 
                stepRef.current = 0;
                setStep(0);
                answersRef.current = { name: "", issue: "", ward: "" };
              }}
              className={`px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 ${lang === k ? "bg-white text-[#2B4B6F] shadow-md" : "text-[#2B4B6F]/60 hover:text-[#2B4B6F]"}`}
            >
              {lang === k && <Globe className="w-3.5 h-3.5" />}
              {LANGUAGES[k].label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center w-full max-w-2xl mx-auto -mt-10">
        
        <div className="space-y-4 mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
          <h1 className="text-5xl sm:text-[4.5rem] font-black text-[#3A5D7C] tracking-tight leading-[1.1] pb-2 drop-shadow-sm" style={{ fontFamily: "'Nunito', 'Outfit', sans-serif" }}>
            {t.title}
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-[#5B88A8]">
            {t.subtitle}
          </p>
          
          {/* Display progress indicators for the questions */}
          <div className="flex items-center justify-center gap-4 mt-8">
             <div className={`w-3 h-3 rounded-full transition-colors ${step >= 0 ? "bg-[#3A5D7C]" : "bg-white/40"}`} />
             <div className={`w-12 h-1 rounded-full transition-colors ${step >= 1 ? "bg-[#3A5D7C]" : "bg-white/40"}`} />
             <div className={`w-3 h-3 rounded-full transition-colors ${step >= 1 ? "bg-[#3A5D7C]" : "bg-white/40"}`} />
             <div className={`w-12 h-1 rounded-full transition-colors ${step >= 2 ? "bg-[#3A5D7C]" : "bg-white/40"}`} />
             <div className={`w-3 h-3 rounded-full transition-colors ${step >= 2 ? "bg-[#3A5D7C]" : "bg-white/40"}`} />
          </div>
        </div>

        {/* Central Interaction Area */}
        <div className="relative w-full max-w-sm aspect-square flex items-center justify-center mb-10">
          
          {/* Background pulses for listening state */}
          {status === "listening" && (
            <>
              <div className="absolute inset-0 bg-[#50A7B1]/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute -inset-4 bg-[#50A7B1]/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            </>
          )}

          <button 
            onClick={toggleListen}
            disabled={status === "processing" || status === "waiting" || status === "success"}
            className={`relative z-10 w-64 h-64 sm:w-[22rem] sm:h-[22rem] rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-500 shadow-2xl ${
              status === "listening" 
                ? "bg-[#3D8F9A] scale-105 shadow-[#3D8F9A]/40" 
                : status === "processing" || status === "waiting"
                ? "bg-amber-400"
                : status === "success"
                ? "bg-emerald-400"
                : status === "error"
                ? "bg-red-400"
                : "bg-[#50A7B1] hover:bg-[#439CA6] hover:scale-105 cursor-pointer"
            }`}
          >
            {status === "listening" ? (
              <Mic className="w-24 h-24 sm:w-32 sm:h-32 text-white/90 animate-bounce" />
            ) : status === "processing" || status === "waiting" ? (
              <Loader2 className="w-24 h-24 sm:w-32 sm:h-32 text-white/90 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="w-24 h-24 sm:w-32 sm:h-32 text-white/90" />
            ) : status === "error" ? (
              <AlertCircle className="w-24 h-24 sm:w-32 sm:h-32 text-white/90" />
            ) : (
              <Mic className="w-24 h-24 sm:w-32 sm:h-32 text-white/80" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Status Text & Transcript */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 h-32 flex flex-col items-center">
          
          {(transcript || status === "success") ? (
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/40 text-center max-w-xl mx-auto w-full">
              {status === "success" ? (
                <div className="text-center space-y-4">
                  <p className="text-[#3A5D7C] font-black text-xl">{t.success}</p>
                  <button 
                    onClick={() => {
                      setStatus("idle");
                      setTranscript("");
                      transcriptRef.current = "";
                      stepRef.current = 0;
                      setStep(0);
                      answersRef.current = { name: "", issue: "", ward: "" };
                    }}
                    className="px-8 py-3 bg-[#50A7B1] hover:bg-[#3D8F9A] text-white rounded-xl font-black uppercase tracking-widest text-sm transition-colors cursor-pointer shadow-md"
                  >
                    {t.retry}
                  </button>
                </div>
              ) : (
                <p className="text-2xl font-bold text-[#3A5D7C] leading-relaxed italic">
                  "{transcript}"
                </p>
              )}
            </div>
          ) : (
            <div className={`flex items-center justify-center gap-3 text-xl font-black ${
              status === "error" ? "text-red-500" : "text-[#5B88A8]"
            }`}>
              {status === "idle" && (
                <>
                  <svg className="w-6 h-6 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9m-2.828 9.9a9 9 0 010-12.728m-2.828 12.728a13 13 0 010-18.384m-2.828 18.384L5.636 18.364a1 1 0 01-.293-.707V6.343a1 1 0 01.293-.707l2.828-2.828a1 1 0 011.414 0l8.485 8.485a1 1 0 010 1.414L9.88 21.192a1 1 0 01-1.414 0z" />
                  </svg>
                  <span>{step === 0 ? t.idle : "Tap to continue"}</span>
                </>
              )}
              {status === "listening" && <span className="animate-pulse">{t.listening}</span>}
              {status === "waiting" && <span className="animate-pulse">{t.waiting}</span>}
              {status === "processing" && <span className="animate-pulse">{t.processing}</span>}
              {status === "error" && <span>{errorMsg}</span>}
            </div>
          )}
        </div>

        {status !== "success" && status !== "processing" && (
          <div className="flex flex-col items-center gap-4 mt-8 animate-in fade-in duration-500">
            <button 
              onClick={simulateSpeech}
              className="px-8 py-3.5 bg-white/20 hover:bg-white/40 text-[#2B4B6F] hover:text-[#1F3752] rounded-2xl font-black uppercase tracking-widest text-xs transition-all cursor-pointer shadow-sm"
            >
              {lang === 'TA' ? "குரலை உருவகப்படுத்து (Simulate Speech)" : "Simulate Speech (Demo)"}
            </button>
            
            <button 
              onClick={() => navigate("/submit-complaint")}
              className="text-[#3A5D7C] hover:text-[#2B4B6F] text-xs font-black uppercase tracking-widest underline decoration-2 underline-offset-4 cursor-pointer"
            >
              {lang === 'TA' ? "விசைப்பலகை மூலம் எழுதவும் (Type Instead)" : "Type Complaint Instead"}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
