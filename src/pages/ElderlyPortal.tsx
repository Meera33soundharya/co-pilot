import { useState, useRef, useEffect } from "react";
import { useComplaints } from "@/context/ComplaintsContext";
import { useLanguage } from "@/context/LanguageContext";
import { analyzeComplaint } from "@/services/aiService";
import { Mic, Loader2, CheckCircle2, ArrowLeft, Volume2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ElderlyPortal() {
    const { addComplaint } = useComplaints();
    const { language } = useLanguage();
    const navigate = useNavigate();
    
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [step, setStep] = useState<"record" | "processing" | "success">("record");
    const [ticketId, setTicketId] = useState("");
    
    const recognitionRef = useRef<any>(null);
    // Use a ref to always have the latest transcript (avoids stale closure)
    const transcriptRef = useRef<string>("");
    const stopAndSubmitRef = useRef<() => void>(() => {});

    const startVoiceRecording = () => {
        try {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert(language === "ta"
                    ? "இந்த உலாவியில் குரல் அங்கீகாரம் ஆதரிக்கப்படவில்லை. Google Chrome ஐ பயன்படுத்தவும்."
                    : "Voice recognition is not supported in this browser. Please use Google Chrome.");
                return;
            }
            
            transcriptRef.current = "";
            setTranscript("");

            const recognition = new SpeechRecognition();
            recognition.lang = language === "ta" ? "ta-IN" : "en-IN";
            recognition.continuous = false;
            recognition.interimResults = true;
            
            recognition.onstart = () => {
                setIsRecording(true);
                setTranscript("");
            };
            
            recognition.onend = () => {
                if (transcriptRef.current.trim().length > 0) {
                    stopAndSubmitRef.current();
                } else {
                    setIsRecording(false);
                }
            };
            
            recognition.onresult = (event: any) => {
                let currentTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
                transcriptRef.current = currentTranscript;
            };
            
            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };
            
            recognitionRef.current = recognition;
            recognition.start();
            
        } catch (error) {
            console.error("Error starting recognition", error);
        }
    };
    
    const stopAndSubmit = async () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) {}
        }
        setIsRecording(false);
        setIsProcessing(true);
        setStep("processing");
        
        // Wait a brief moment for final transcript if needed
        setTimeout(async () => {
            const finalTranscript = transcriptRef.current || transcript || "Voice complaint submitted without clear transcript.";
            
            try {
                    // Send transcript to AI for routing
                    const analysis = await analyzeComplaint("Elderly Voice User Complaint", finalTranscript);
                    
                    const id = await addComplaint({
                        citizen: "Voice User",
                        phone: "Not Provided",
                        ward: "Ward 01",
                        priority: analysis.priority || "Medium",
                        issue: analysis.category || "Voice Complaint",
                        description: finalTranscript,
                        location: "From Voice Portal",
                        coords: { lat: 12.9716, lng: 77.5946 },
                        evidence: [],
                        notifPref: "None",
                        category: analysis.category,
                        dept: analysis.dept,
                        source: "voice"
                    });
                    
                    setTicketId(id);
                    setStep("success");
                } catch (err) {
                    console.error("Failed to submit voice complaint", err);
                    // Fallback
                    const id = await addComplaint({
                        citizen: "Voice User",
                        phone: "Not Provided",
                        ward: "Ward 01",
                        priority: "Medium",
                        issue: "Voice Complaint",
                        description: finalTranscript,
                        location: "From Voice Portal",
                        coords: { lat: 12.9716, lng: 77.5946 },
                        evidence: [],
                        notifPref: "None",
                        source: "voice"
                    });
                    setTicketId(id);
                    setStep("success");
                } finally {
                    setIsProcessing(false);
                }
            }, 500);
    };

    useEffect(() => {
        stopAndSubmitRef.current = stopAndSubmit;
    }, [stopAndSubmit]);

    const isTamil = language === "ta";

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

            <button onClick={() => navigate("/")} className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-white/60 backdrop-blur-md border border-white/40 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md">
                <ArrowLeft className="w-5 h-5" /> {isTamil ? "திரும்பு" : "Back"}
            </button>

            <button onClick={() => navigate("/village-voice")} className="absolute top-6 right-6 z-10 flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-indigo-200/50 hover:shadow-md hover:bg-white/90">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                {isTamil ? "உரையாடல் உதவியாளர்" : "AI Assistant"}
            </button>
            
            <AnimatePresence mode="wait">
                {step === "record" && (
                    <motion.div 
                        key="record"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="text-center w-full max-w-lg z-10"
                    >
                        <div className="mb-14">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight drop-shadow-sm">
                                {isTamil ? "உங்களுக்கு என்ன உதவி வேண்டும்?" : "How can we help you?"}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 font-medium max-w-md mx-auto">
                                {isTamil ? "கீழே உள்ள பட்டனை அழுத்தி உங்கள் குறையை சொல்லுங்கள்." : "Tap the microphone below and speak your complaint naturally."}
                            </p>
                        </div>
                        
                        <div className="relative flex justify-center items-center h-72">
                            {isRecording && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1.2 }}
                                    className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" 
                                />
                            )}
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={isRecording ? stopAndSubmit : startVoiceRecording}
                                className={`relative w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center transition-all duration-300 mx-auto shadow-2xl overflow-hidden ${
                                    isRecording 
                                        ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/40" 
                                        : "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-teal-500/40"
                                }`}
                            >
                                {isRecording && (
                                    <>
                                        <div className="absolute inset-0 rounded-full border-[6px] border-red-300 animate-ping opacity-60" />
                                        <div className="absolute -inset-8 rounded-full border-2 border-red-200 animate-pulse opacity-40" />
                                    </>
                                )}
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] rounded-full pointer-events-none" />
                                <Mic className={`w-20 h-20 md:w-24 md:h-24 text-white z-10 drop-shadow-md ${isRecording ? "animate-pulse" : ""}`} />
                            </motion.button>
                        </div>
                        
                        <div className="mt-10 min-h-[80px]">
                            <AnimatePresence mode="wait">
                                {isRecording ? (
                                    <motion.p 
                                        key="listening"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-xl md:text-2xl font-bold text-red-500 tracking-wide"
                                    >
                                        <span className="animate-pulse">{isTamil ? "கேட்டுக்கொண்டிருக்கிறோம்..." : "Listening..."}</span>
                                        <br />
                                        <span className="text-sm font-medium text-slate-500 mt-2 block">
                                            {isTamil ? "நிறுத்த மீண்டும் தட்டவும்" : "Tap again to stop"}
                                        </span>
                                    </motion.p>
                                ) : (
                                    <motion.p 
                                        key="start"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-lg md:text-xl font-semibold text-slate-500 flex items-center justify-center gap-2"
                                    >
                                        <Volume2 className="w-6 h-6 text-slate-400" /> {isTamil ? "பேச தொடங்க தட்டவும்" : "Tap to start speaking"}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            
                            {transcript && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-5 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 max-w-lg mx-auto"
                                >
                                    <p className="text-slate-800 text-lg font-medium leading-relaxed">{transcript}</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
                
                {step === "processing" && (
                    <motion.div 
                        key="processing"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="text-center w-full max-w-md z-10"
                    >
                        <div className="relative w-36 h-36 mx-auto mb-8">
                            <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping blur-md" />
                            <div className="relative w-full h-full bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl border border-white/50">
                                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-3 drop-shadow-sm">
                            {isTamil ? "செயலாக்கப்படுகிறது..." : "Processing AI..."}
                        </h2>
                        <p className="text-lg text-slate-500 font-medium">
                            {isTamil ? "உங்கள் குறையை பதிவு செய்கிறோம். காத்திருக்கவும்." : "Analyzing your voice and filing the ticket..."}
                        </p>
                    </motion.div>
                )}
                
                {step === "success" && (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        className="text-center w-full max-w-md z-10"
                    >
                        <div className="w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30 border-4 border-white">
                            <CheckCircle2 className="w-20 h-20 text-white drop-shadow-md" />
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
                            {isTamil ? "புகார் பதிவு செய்யப்பட்டது!" : "Complaint Registered!"}
                        </h2>
                        
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl inline-block text-slate-800 shadow-xl border border-white/50 mt-4 w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                            <p className="text-sm uppercase font-bold mb-3 text-slate-400 tracking-widest">
                                {isTamil ? "உங்கள் புகார் எண்" : "Your Ticket Number"}
                            </p>
                            <p className="text-5xl md:text-6xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 drop-shadow-sm">
                                {ticketId}
                            </p>
                        </motion.div>
                        
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setStep("record");
                                setTranscript("");
                            }}
                            className="mt-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-10 rounded-full shadow-lg shadow-slate-900/20 transition-all text-lg border border-slate-700"
                        >
                            {isTamil ? "புதிய புகார் அளிக்க" : "File Another Complaint"}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
