import React, { useState, useEffect } from "react";
import { Mic, Square, Send, X, Loader2, CheckCircle2 } from "lucide-react";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { extractEntities, analyzeComplaint } from "@/services/aiService";
import { useComplaints } from "@/context/ComplaintsContext";

interface VoiceAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function VoiceAssistantModal({ isOpen, onClose }: VoiceAssistantModalProps) {
    const { addComplaint } = useComplaints();
    
    const [step, setStep] = useState<"idle" | "listening" | "processing" | "review" | "success">("idle");
    const [transcriptText, setTranscriptText] = useState("");
    
    const [form, setForm] = useState({
        citizen: "",
        issue: "",
        description: "",
        dept: "",
        priority: "Medium" as "High" | "Medium" | "Low",
        ward: "",
    });

    const handleVoiceResult = async (text: string) => {
        setTranscriptText(text);
        setStep("processing");
        
        try {
            const entities = extractEntities(text, 0.85);
            const analysis = await analyzeComplaint(text, text);
            
            setForm({
                citizen: entities.citizen || "",
                issue: analysis.summary || text,
                description: text,
                dept: analysis.dept || "General Administration",
                priority: analysis.priority || "Medium",
                ward: entities.ward || "",
            });
            setStep("review");
        } catch (error) {
            console.error("Error processing voice:", error);
            // Fallback just in case
            setForm(f => ({ ...f, description: text, issue: text }));
            setStep("review");
        }
    };

    const {
        isListening,
        toggleListening,
        isSupported
    } = useVoiceAssistant({
        onResult: handleVoiceResult,
        lang: "ta-IN"
    });

    // Sync isListening with step
    useEffect(() => {
        if (isListening && step === "idle") {
            setStep("listening");
        } else if (!isListening && step === "listening") {
            // It stopped listening (either manually or automatically)
            // Wait for onResult to fire and change step to "processing", 
            // but if it just timed out without result, we can reset to idle
            const timer = setTimeout(() => {
                setStep(s => s === "listening" ? "idle" : s);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isListening, step]);

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setStep("idle");
            setTranscriptText("");
            setForm({ citizen: "", issue: "", description: "", dept: "", priority: "Medium", ward: "" });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        addComplaint({
            citizen: form.citizen || "Citizen",
            phone: "N/A",
            ward: form.ward || "Unknown",
            issue: form.issue,
            description: form.description,
            priority: form.priority,
            dept: form.dept,
            source: "voice",
        });
        setStep("success");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Mic className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">Voice Assistant</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                    
                    {(step === "idle" || step === "listening") && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-8 relative">
                                {isListening && (
                                    <>
                                        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20" style={{ transform: "scale(1.5)" }}></div>
                                        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-40" style={{ transform: "scale(1.2)", animationDelay: "0.2s" }}></div>
                                    </>
                                )}
                                <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${isListening ? 'bg-red-50 border-4 border-red-100' : 'bg-blue-50 border-4 border-blue-100'}`}>
                                    <Mic className={`w-12 h-12 ${isListening ? 'text-red-500' : 'text-blue-500'}`} />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4">
                                {isListening ? "I'm listening..." : "Ready when you are"}
                            </h2>
                            <p className="text-lg text-gray-500 font-medium">
                                {isListening 
                                    ? "Please describe your complaint. I'm listening." 
                                    : "Click 'Start Listening' to speak your complaint."}
                            </p>
                        </div>
                    )}

                    {step === "processing" && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
                            <h2 className="text-2xl font-black text-gray-900">Processing Audio...</h2>
                            <p className="text-gray-500 mt-2">Our AI is extracting details from your speech.</p>
                        </div>
                    )}

                    {step === "review" && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Review Details</h2>
                            <p className="text-gray-500 mb-6 font-medium text-sm">Please verify the extracted information before submitting. You can edit any field.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Complaint Title</label>
                                    <input type="text" value={form.issue} onChange={e => setForm({...form, issue: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Description</label>
                                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Department</label>
                                    <input type="text" value={form.dept} onChange={e => setForm({...form, dept: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Priority</label>
                                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Location (Ward)</label>
                                    <input type="text" value={form.ward} onChange={e => setForm({...form, ward: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Citizen Name</label>
                                    <input type="text" value={form.citizen} onChange={e => setForm({...form, citizen: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional" />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Success!</h2>
                            <p className="text-lg text-gray-500 font-medium">Your complaint has been successfully registered.</p>
                            <button onClick={onClose} className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-colors">
                                Return to Dashboard
                            </button>
                        </div>
                    )}

                </div>

                {/* Footer Controls */}
                {step !== "success" && step !== "processing" && (
                    <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-3 justify-center">
                        
                        {(step === "idle" || step === "review") && !isListening && (
                            <button 
                                onClick={toggleListening}
                                disabled={!isSupported}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                <Mic className="w-5 h-5" /> Start Listening
                            </button>
                        )}

                        {(step === "listening" || isListening) && (
                            <button 
                                onClick={toggleListening}
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors shadow-sm animate-pulse"
                            >
                                <Square className="w-5 h-5 fill-current" /> Stop Recording
                            </button>
                        )}

                        {step === "review" && (
                            <button 
                                onClick={handleSubmit}
                                disabled={!form.issue || !form.description}
                                className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" /> Submit Complaint
                            </button>
                        )}
                        
                    </div>
                )}
            </div>
        </div>
    );
}
