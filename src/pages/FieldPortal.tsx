import { useState, useRef, useEffect } from "react";
import { useComplaints } from "@/context/ComplaintsContext";
import { Mic, Loader2, CheckCircle2, ArrowLeft, X, Volume2, MicOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { analyzeComplaint } from "@/services/aiService";

type ConversationStep = "idle" | "name" | "issue" | "location" | "confirm" | "success";

export default function FieldPortal() {
    const { addComplaint } = useComplaints();
    const navigate = useNavigate();

    const [step, setStep] = useState<ConversationStep>("idle");
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Conversation data
    const [citizenName, setCitizenName] = useState("");
    const [issueText, setIssueText] = useState("");
    const [locationText, setLocationText] = useState("");
    const [ticketId, setTicketId] = useState("");
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);

    const recognitionRef = useRef<any>(null);
    const synth = window.speechSynthesis;

    // We use a ref to track the current expected input to avoid stale closures in recognition
    const currentStepRef = useRef<ConversationStep>("idle");
    useEffect(() => { currentStepRef.current = step; }, [step]);

    const speak = (text: string, onEnd?: () => void) => {
        if (synth.speaking) synth.cancel();
        
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ta-IN"; // Tamil
        utterance.rate = 0.9;
        
        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };
        
        synth.speak(utterance);
    };

    const startListening = () => {
        try {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Voice recognition is not supported in this browser.");
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.lang = "ta-IN";
            recognition.continuous = false; // We want it to stop when they pause naturally
            recognition.interimResults = false;

            recognition.onstart = () => setIsRecording(true);
            
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                handleVoiceInput(transcript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
                // Restart listening on error if we are expecting input
                if (currentStepRef.current !== "idle" && currentStepRef.current !== "success" && currentStepRef.current !== "confirm") {
                    setTimeout(() => startListening(), 1000);
                }
            };
            
            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (error) {
            console.error("Error starting recognition", error);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
        if (synth.speaking) synth.cancel();
    };

    const handleVoiceInput = async (text: string) => {
        const current = currentStepRef.current;
        
        if (current === "name") {
            setCitizenName(text);
            setStep("issue");
            speak(`நன்றி ${text}. உங்கள் புகாரை சுருக்கமாக கூறவும்.`, () => startListening());
        } 
        else if (current === "issue") {
            setIssueText(text);
            setStep("location");
            speak("நன்றி. புகார் பதிவு செய்ய வேண்டிய இடத்தை கூறவும்.", () => startListening());
        }
        else if (current === "location") {
            setLocationText(text);
            setIsProcessing(true);
            stopListening();
            speak("உங்கள் புகார் பரிசீலிக்கப்படுகிறது. தயவுசெய்து காத்திருக்கவும்.");
            
            try {
                // Analyze using AI
                const fullText = `Issue: ${issueText}. Location: ${text}.`;
                const analysis = await analyzeComplaint("Field Portal Voice", fullText);
                setAiAnalysis(analysis);
                
                setIsProcessing(false);
                setStep("confirm");
                speak(`உங்கள் புகார் ${analysis.category} துறையின் கீழ் பதிவு செய்ய தயாராக உள்ளது. உறுதிப்படுத்த ஆம் என்று கூறவும்.`, () => startListening());
            } catch (err) {
                console.error(err);
                setIsProcessing(false);
                setStep("confirm");
                speak("உங்கள் புகார் தயாராக உள்ளது. உறுதிப்படுத்த ஆம் என்று கூறவும்.", () => startListening());
            }
        }
        else if (current === "confirm") {
            if (text.toLowerCase().includes("ஆம்") || text.toLowerCase().includes("yes") || text.toLowerCase().includes("s") || text.toLowerCase().includes("ok") || text.toLowerCase().includes("சரி")) {
                finalizeComplaint();
            } else {
                speak("மன்னிக்கவும், மீண்டும் கூறவும். உறுதிப்படுத்த ஆம் என்று கூறவும்.", () => startListening());
            }
        }
    };

    const finalizeComplaint = async () => {
        setIsProcessing(true);
        try {
            const id = await addComplaint({
                citizen: citizenName || "Unknown Citizen",
                phone: "Not Provided",
                ward: "Ward 01",
                priority: aiAnalysis?.priority || "Medium",
                issue: aiAnalysis?.category || "Voice Complaint",
                description: issueText,
                location: locationText || "Unknown Area",
                coords: { lat: 12.9716, lng: 77.5946 },
                evidence: [],
                notifPref: "None",
                category: aiAnalysis?.category || "Infrastructure",
                dept: aiAnalysis?.dept || "General"
            });
            
            setTicketId(id);
            setStep("success");
            setIsProcessing(false);
            speak(`உங்கள் புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது. உங்கள் புகார் எண் ${id.replace(/\D/g, '').split('').join(' ')}`);
        } catch (err) {
            console.error(err);
            setIsProcessing(false);
        }
    };

    const startConversation = () => {
        setStep("name");
        speak("வணக்கம். உங்கள் பெயரை கூறவும்.", () => startListening());
    };

    const exitFlow = () => {
        stopListening();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <button 
                onClick={exitFlow} 
                className="absolute top-6 left-6 flex items-center gap-2 text-sm font-black text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl shadow-xl hover:bg-white/10 z-50 backdrop-blur-xl"
            >
                <ArrowLeft className="w-4 h-4" /> வெளியேறு (Exit)
            </button>

            <div className="text-center w-full max-w-2xl z-10 animate-in fade-in zoom-in duration-700 ease-out">
                
                {step === "idle" && (
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 border border-white/20 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 group-hover:translate-y-full transition-transform duration-500" />
                                <Mic className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                FieldPortal <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">குரல் பதிவு அமைப்பு</span>
                            </h1>
                            <p className="text-lg text-gray-400 font-medium max-w-md mx-auto">
                                Type-free complaint registration. Completely Voice-Driven.
                            </p>
                        </div>

                        <button 
                            onClick={startConversation}
                            className="relative group w-full max-w-sm mx-auto flex flex-col items-center justify-center p-12 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-[3rem] transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/40 relative z-10 group-hover:scale-110 transition-transform duration-500">
                                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-50" style={{ animationDuration: '3s' }} />
                                <Mic className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white relative z-10 tracking-tight">தொடங்க அழுத்தவும்</h2>
                            <p className="text-sm text-gray-400 mt-2 relative z-10 font-bold uppercase tracking-widest">(Tap to Start)</p>
                        </button>
                    </div>
                )}

                {(step !== "idle" && step !== "success") && (
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
                        
                        {/* Audio visualizer effect */}
                        {(isSpeaking || isRecording) && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 animate-pulse" />
                        )}

                        <div className="flex flex-col items-center justify-center space-y-10 relative z-10">
                            
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                    {step === "name" && "உங்கள் பெயரை கூறவும்"}
                                    {step === "issue" && "உங்கள் புகாரை கூறவும்"}
                                    {step === "location" && "இடத்தை கூறவும்"}
                                    {step === "confirm" && "உறுதிப்படுத்த ஆம் என்று கூறவும்"}
                                </h2>
                                <p className="text-blue-400/80 font-bold tracking-widest uppercase text-sm">
                                    {step === "name" && "Listening for Name..."}
                                    {step === "issue" && "Listening for Complaint..."}
                                    {step === "location" && "Listening for Location..."}
                                    {step === "confirm" && "Waiting for Confirmation..."}
                                </p>
                            </div>

                            <div className="relative">
                                {isSpeaking ? (
                                    <div className="w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center border-4 border-blue-500/30 animate-pulse">
                                        <Volume2 className="w-12 h-12 text-blue-400" />
                                    </div>
                                ) : isProcessing ? (
                                    <div className="w-32 h-32 bg-amber-500/20 rounded-full flex items-center justify-center border-4 border-amber-500/30">
                                        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
                                    </div>
                                ) : isRecording ? (
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping" />
                                        <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center border-4 border-red-500/50 relative z-10">
                                            <Mic className="w-12 h-12 text-red-500 animate-pulse" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 bg-gray-500/10 rounded-full flex items-center justify-center border-4 border-gray-500/20 cursor-pointer hover:bg-gray-500/20 transition-colors" onClick={() => startListening()}>
                                        <MicOff className="w-12 h-12 text-gray-500" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full bg-black/20 rounded-2xl p-6 text-left space-y-4 border border-white/5">
                                <div className={`flex justify-between items-center ${citizenName ? "text-white" : "text-gray-600"}`}>
                                    <span className="text-sm font-bold uppercase tracking-widest">பெயர் (Name):</span>
                                    <span className="text-lg font-black truncate max-w-[200px]">{citizenName || "---"}</span>
                                </div>
                                <div className={`flex justify-between items-center ${issueText ? "text-white" : "text-gray-600"}`}>
                                    <span className="text-sm font-bold uppercase tracking-widest">புகார் (Issue):</span>
                                    <span className="text-lg font-black truncate max-w-[200px]">{issueText || "---"}</span>
                                </div>
                                <div className={`flex justify-between items-center ${locationText ? "text-white" : "text-gray-600"}`}>
                                    <span className="text-sm font-bold uppercase tracking-widest">இடம் (Location):</span>
                                    <span className="text-lg font-black truncate max-w-[200px]">{locationText || "---"}</span>
                                </div>
                                {aiAnalysis && (
                                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2 justify-center">
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-black uppercase tracking-widest">{aiAnalysis.category}</span>
                                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-black uppercase tracking-widest">{aiAnalysis.priority} Priority</span>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}

                {step === "success" && (
                    <div className="bg-gradient-to-b from-emerald-500/20 to-transparent border border-emerald-500/30 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden backdrop-blur-3xl animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/40 relative">
                            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-50" />
                            <CheckCircle2 className="w-12 h-12 text-white relative z-10" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">புகார் பதிவு செய்யப்பட்டது!</h2>
                        <p className="text-emerald-400 font-medium mb-10 text-lg">Your complaint has been successfully registered.</p>
                        <div className="bg-black/20 p-6 rounded-3xl border border-white/10 backdrop-blur-md mb-10">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">புகார் எண் (Ticket ID)</p>
                            <p className="text-5xl font-mono font-black text-white tracking-widest">{ticketId}</p>
                        </div>
                        <button 
                            onClick={exitFlow}
                            className="btn-primary w-full max-w-xs mx-auto py-4 text-sm tracking-widest font-black uppercase bg-emerald-600 hover:bg-emerald-500 border-none rounded-2xl shadow-xl shadow-emerald-900/50"
                        >
                            முகப்புக்குச் செல் (Home)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
