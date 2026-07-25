import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, CheckCircle, Loader2, Send, X } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { analyzeComplaint } from '@/services/aiService';
import { useComplaints } from '@/context/ComplaintsContext';

export default function FieldPortal() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'idle' | 'recording' | 'waiting_1min' | 'processing' | 'confirm' | 'success'>('idle');
    const [voiceMode, setVoiceMode] = useState<'name' | 'complaint'>('name');
    const [userName, setUserName] = useState('');
    const [transcript, setTranscript] = useState('');
    const [parsedData, setParsedData] = useState<any>(null);
    const [complaintId, setComplaintId] = useState('');
    
    const { addComplaint } = useComplaints();

    const handleVoiceResult = async (text: string) => {
        if (!text.trim()) {
            setStep('idle');
            return;
        }

        if (voiceMode === 'name') {
            setUserName(text);
            setStep('waiting_1min');
            setTimeout(() => {
                setVoiceMode('complaint');
                setStep('idle');
            }, 60000); // 1 minute wait
            return;
        }

        setTranscript(text);
        setStep('processing');
        try {
            const result = await analyzeComplaint(text, "");
            setParsedData(result);
            setStep('confirm');
        } catch (error) {
            console.error(error);
            setStep('idle');
            alert('Failed to analyze audio. Please try again.');
        }
    };

    const { isListening, toggleListening, isSupported } = useVoiceAssistant({
        onResult: handleVoiceResult,
        lang: 'ta-IN'
    });

    const handleMicClick = () => {
        if (step === 'idle' || step === 'recording') {
            toggleListening();
            setStep(!isListening ? 'recording' : 'idle');
        }
    };

    const handleSubmit = () => {
        const newComplaint = {
            id: `CMPL-${Math.floor(10000 + Math.random() * 90000)}`,
            citizen: userName || parsedData?.name || 'Anonymous Voice',
            phone: parsedData?.phone || 'N/A',
            ward: parsedData?.location || 'Unknown',
            citizenId: 'voice_user',
            issue: parsedData?.title || transcript.substring(0, 50),
            description: transcript,
            category: parsedData?.category || 'Other',
            status: 'New' as any,
            priority: parsedData?.priority || 'Medium',
            assignedTo: 'Unassigned',
            dept: parsedData?.dept || 'General Administration',
            time: 'Just now',
            timestamp: Date.now(),
            notified: false,
            source: 'voice' as const,
            audit: [{ time: 'Just now', actor: 'System', action: 'Complaint submitted via Voice Portal' }]
        };
        addComplaint(newComplaint as any);
        setComplaintId(newComplaint.id);
        setStep('success');
    };

    const reset = () => {
        setStep('idle');
        setVoiceMode('name');
        setUserName('');
        setTranscript('');
        setParsedData(null);
    };

    if (!isSupported) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-md w-full">
                    <p className="text-xl text-red-600 font-bold">Your browser does not support voice recording.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-blue-600 text-white p-5 shadow-md flex items-center justify-between shrink-0">
                <div className="w-10"></div> {/* Spacer for centering */}
                <div className="text-center">
                    <h1 className="text-3xl font-black mb-1">மக்கள் குரல் பதிவு</h1>
                    <p className="text-sm font-bold opacity-90 uppercase tracking-widest">Voice Complaint Registration</p>
                </div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-10 h-10 flex items-center justify-center bg-blue-700 hover:bg-blue-800 rounded-full transition-colors"
                    title="Exit"
                >
                    <X className="w-6 h-6 text-white" />
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto">
                {(step === 'idle' || step === 'recording') && (
                    <div className="flex flex-col items-center justify-center gap-12 w-full">
                        <button 
                            onClick={handleMicClick}
                            className={`relative flex items-center justify-center w-56 h-56 rounded-full shadow-2xl transition-all duration-300 ${isListening ? 'bg-red-500 scale-105 shadow-red-500/50' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/40 hover:scale-105'}`}
                        >
                            {isListening && <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-60" />}
                            {isListening ? <MicOff className="w-24 h-24 text-white z-10" /> : <Mic className="w-24 h-24 text-white z-10" />}
                        </button>
                        <div className="text-center space-y-4 px-4">
                            <h2 className="text-4xl font-black text-gray-800 leading-tight">
                                {isListening 
                                    ? 'கவனிக்கப்படுகிறது...' 
                                    : voiceMode === 'name' 
                                        ? 'உங்கள் பெயரை கூறவும்' 
                                        : 'உங்கள் புகாரை பதிவு செய்ய அழுத்தவும்'}
                            </h2>
                            <p className="text-xl font-bold text-gray-500 uppercase tracking-wider">
                                {isListening 
                                    ? 'Listening...' 
                                    : voiceMode === 'name'
                                        ? '(Press to speak your name)'
                                        : '(Press to Record)'}
                            </p>
                        </div>
                    </div>
                )}

                {step === 'waiting_1min' && (
                    <div className="flex flex-col items-center gap-6 w-full animate-in fade-in zoom-in duration-500">
                        <Loader2 className="w-24 h-24 text-blue-600 animate-spin" />
                        <h2 className="text-3xl font-black text-gray-800 text-center leading-tight">1 நிமிடம் காத்திருக்கவும்...</h2>
                        <p className="text-xl font-bold text-gray-500 uppercase tracking-wide">Please wait 1 minute for representative connection...</p>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="flex flex-col items-center gap-6 w-full animate-in fade-in zoom-in duration-500">
                        <Loader2 className="w-24 h-24 text-blue-600 animate-spin" />
                        <h2 className="text-3xl font-black text-gray-800 text-center leading-tight">AI பகுப்பாய்வு செய்கிறது...</h2>
                        <p className="text-xl font-bold text-gray-500 uppercase tracking-wide">Analyzing Complaint...</p>
                    </div>
                )}

                {step === 'confirm' && parsedData && (
                    <div className="w-full bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col gap-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
                        <h2 className="text-2xl font-black text-gray-800 border-b border-gray-100 pb-4 text-center">
                            உறுதிப்படுத்தவும் <span className="text-gray-400 text-lg ml-2 font-bold uppercase">(Confirm)</span>
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                                <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">உங்கள் உரை (Transcript)</p>
                                <p className="text-xl text-gray-800 font-bold leading-relaxed">{transcript}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">பிரிவு (Category)</p>
                                    <p className="text-lg font-black text-gray-900 line-clamp-1">{parsedData.category}</p>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">முன்னுரிமை (Priority)</p>
                                    <p className="text-lg font-black text-gray-900 line-clamp-1">{parsedData.priority}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            <button 
                                onClick={handleSubmit}
                                className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-green-600/30 transition-all hover:scale-[1.02]"
                            >
                                <Send className="w-7 h-7" /> சமர்ப்பிக்கவும்
                            </button>
                            <button onClick={reset} className="w-full py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl text-lg transition-colors">
                                ரத்து செய் (Cancel)
                            </button>
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="w-full bg-white rounded-[2rem] p-8 shadow-xl border border-green-100 flex flex-col items-center gap-8 text-center animate-in slide-in-from-bottom-8 fade-in duration-500">
                        <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center shadow-inner">
                            <CheckCircle className="w-14 h-14 text-green-500" />
                        </div>
                        
                        <div className="space-y-3">
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 leading-tight">வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!</h2>
                            <p className="text-xl text-green-600 font-bold uppercase tracking-wide">Complaint Submitted</p>
                        </div>
                        
                        <div className="w-full bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-2">புகார் எண் (Complaint ID)</p>
                            <p className="text-4xl font-black text-gray-900 tracking-widest font-mono">{complaintId}</p>
                        </div>

                        <button onClick={reset} className="w-full py-5 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xl font-black shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]">
                            புதிய புகார் (New Complaint)
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
