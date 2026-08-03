import { useState, useRef } from "react";
import { useComplaints } from "@/context/ComplaintsContext";
import { useLanguage } from "@/context/LanguageContext";
import { analyzeComplaint } from "@/services/aiService";
import { Mic, Loader2, CheckCircle2, ArrowLeft, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ElderlyPortal() {
    const { addComplaint } = useComplaints();
    const { lang } = useLanguage();
    const navigate = useNavigate();
    
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [step, setStep] = useState<"record" | "processing" | "success">("record");
    const [ticketId, setTicketId] = useState("");
    
    const recognitionRef = useRef<any>(null);
    // Use a ref to always have the latest transcript (avoids stale closure)
    const transcriptRef = useRef<string>("");

    const startVoiceRecording = () => {
        try {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert(lang === "ta"
                    ? "இந்த உலாவியில் குரல் அங்கீகாரம் ஆதரிக்கப்படவில்லை. Google Chrome ஐ பயன்படுத்தவும்."
                    : "Voice recognition is not supported in this browser. Please use Google Chrome.");
                return;
            }
            
            transcriptRef.current = "";
            setTranscript("");

            const recognition = new SpeechRecognition();
            recognition.lang = lang === "ta" ? "ta-IN" : "en-IN";
            recognition.continuous = true;
            recognition.interimResults = true;
            
            recognition.onstart = () => {
                setIsRecording(true);
                setTranscript("");
            };
            
            recognition.onresult = (event: any) => {
                let currentTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
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
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
            setStep("processing");
            
            // Wait a brief moment for final transcript if needed
            setTimeout(async () => {
                const finalTranscript = transcript || "Voice complaint submitted without clear transcript.";
                
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
        }
    };

    const isTamil = lang === "ta";

    return (
        <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            
            <button onClick={() => navigate("/")} className="absolute top-6 left-6 flex items-center gap-2 text-sm font-black text-gray-500 hover:text-gray-900 transition-colors bg-white/50 px-4 py-2 rounded-full shadow-sm">
                <ArrowLeft className="w-5 h-5" /> {isTamil ? "திரும்பு" : "Back"}
            </button>
            
            {step === "record" && (
                <div className="text-center w-full max-w-md animate-in fade-in zoom-in duration-500">
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                            {isTamil ? "உங்களுக்கு என்ன உதவி வேண்டும்?" : "How can we help you?"}
                        </h1>
                        <p className="text-lg text-gray-600 font-medium">
                            {isTamil ? "கீழே உள்ள பட்டனை அழுத்தி உங்கள் குறையை சொல்லுங்கள்." : "Tap the microphone below and speak your complaint."}
                        </p>
                    </div>
                    
                    <button 
                        onClick={isRecording ? stopAndSubmit : startVoiceRecording}
                        className={`relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center transition-all duration-300 mx-auto shadow-2xl ${
                            isRecording 
                                ? "bg-red-600 hover:bg-red-700 shadow-red-600/40" 
                                : "bg-[#059669] hover:bg-[#047857] shadow-[#059669]/40 hover:scale-105"
                        }`}
                    >
                        {isRecording && (
                            <>
                                <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-75" />
                                <div className="absolute -inset-4 rounded-full border-2 border-red-300 animate-pulse opacity-50" />
                            </>
                        )}
                        <Mic className={`w-20 h-20 md:w-28 md:h-28 text-white ${isRecording ? "animate-pulse" : ""}`} />
                    </button>
                    
                    <div className="mt-12 min-h-[60px]">
                        {isRecording ? (
                            <p className="text-xl md:text-2xl font-bold text-red-600 animate-pulse">
                                {isTamil ? "கேட்டுக்கொண்டிருக்கிறோம்... நிறுத்த தட்டவும்" : "Listening... tap to stop"}
                            </p>
                        ) : (
                            <p className="text-lg md:text-xl font-bold text-gray-500 flex items-center justify-center gap-2">
                                <Volume2 className="w-6 h-6" /> {isTamil ? "பேச தொடங்க தட்டவும்" : "Tap to start speaking"}
                            </p>
                        )}
                        
                        {transcript && (
                            <div className="mt-6 p-4 bg-white/80 rounded-2xl shadow-sm border border-gray-200">
                                <p className="text-gray-800 text-lg">{transcript}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {step === "processing" && (
                <div className="text-center w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-3">
                        {isTamil ? "செயலாக்கப்படுகிறது..." : "Processing..."}
                    </h2>
                    <p className="text-lg text-gray-500 font-medium">
                        {isTamil ? "உங்கள் குறையை பதிவு செய்கிறோம். காத்திருக்கவும்." : "We are filing your complaint. Please wait."}
                    </p>
                </div>
            )}
            
            {step === "success" && (
                <div className="text-center w-full max-w-md animate-in fade-in zoom-in duration-500">
                    <div className="w-40 h-40 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <CheckCircle2 className="w-24 h-24 text-emerald-600" />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        {isTamil ? "புகார் பதிவு செய்யப்பட்டது!" : "Complaint Registered!"}
                    </h2>
                    <div className="bg-white p-6 rounded-3xl inline-block text-gray-900 shadow-xl border border-gray-100 mt-4 w-full">
                        <p className="text-sm uppercase font-black mb-2 text-gray-500 tracking-widest">
                            {isTamil ? "உங்கள் புகார் எண்" : "Your Ticket Number"}
                        </p>
                        <p className="text-5xl font-mono font-black text-[#059669]">{ticketId}</p>
                    </div>
                    
                    <button 
                        onClick={() => {
                            setStep("record");
                            setTranscript("");
                        }}
                        className="mt-12 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors text-lg"
                    >
                        {isTamil ? "புதிய புகார் அளிக்க" : "File Another Complaint"}
                    </button>
                </div>
            )}
        </div>
    );
}
