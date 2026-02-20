import { useState, useEffect, useRef } from "react";
import { BrainCircuit, Send, X, Sparkles, User2, Bot } from "lucide-react";

interface Message {
    role: "user" | "ai";
    text: string;
    time: string;
}

const aiResponses: Record<string, string> = {
    default: "I've analyzed the latest governance data. Resolution rate is trending upward at 78.3%. Ward 03 requires immediate attention due to a critical water pressure anomaly with 280% spike in complaints.",
    grievance: "Currently 183 high-priority grievances are open. Top categories: Water Supply (28%), Roads (24%), Health (18%). I recommend fast-tracking Ward 03 and Ward 09 cases.",
    alert: "7 active AI anomalies detected. Critical: Ward 03 water pressure drop. High: Ward 06 road damage cluster, Ward 04 health spike. Recommend dispatching emergency teams.",
    analytics: "Monthly complaint volume is up 18.2% vs last quarter. However, resolution efficiency improved by 5.1%. AI predicts a 20% spike in infrastructure cases by Monday.",
    speech: "I can generate a speech for the Ward 03 water crisis. Shall I draft a formal address, a public advisory, or an urgent citizen notification? Choose tone: Formal, Empathetic, or Urgent.",
};

function getAIResponse(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes("grievance") || lower.includes("complaint")) return aiResponses.grievance;
    if (lower.includes("alert") || lower.includes("anomaly") || lower.includes("crisis")) return aiResponses.alert;
    if (lower.includes("analytic") || lower.includes("stat") || lower.includes("trend")) return aiResponses.analytics;
    if (lower.includes("speech") || lower.includes("address") || lower.includes("announce")) return aiResponses.speech;
    return aiResponses.default;
}

function now() {
    return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const suggestions = [
    "Summarize today's alerts",
    "Top grievance categories?",
    "Generate Ward 03 speech",
    "Predict next week's trend",
];

export default function AIAssistant() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [thinking, setThinking] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", text: "👋 I'm your Governance Co-Pilot. Ask me about grievances, alerts, analytics, or generate speeches.", time: now() }
    ]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, thinking]);

    const send = (text: string) => {
        if (!text.trim()) return;
        const userMsg: Message = { role: "user", text, time: now() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setThinking(true);
        setTimeout(() => {
            const aiMsg: Message = { role: "ai", text: getAIResponse(text), time: now() };
            setMessages(prev => [...prev, aiMsg]);
            setThinking(false);
        }, 1200);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center justify-center hover:bg-blue-700 hover:scale-110 transition-all group"
            >
                <BrainCircuit className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">7</span>
            </button>

            {/* Chat Panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-[#0B1221] px-5 py-4 flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-white">GovPilot AI Assistant</p>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Online · 98.2% accuracy</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2 py-0.5 bg-white/10 rounded-lg text-[9px] font-black text-white/60 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI
                            </div>
                            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white/60">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" style={{ maxHeight: 380 }}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-black ${msg.role === "ai" ? "bg-blue-600" : "bg-gray-700"}`}>
                                    {msg.role === "ai" ? <Bot className="w-4 h-4" /> : <User2 className="w-4 h-4" />}
                                </div>
                                <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "ai"
                                        ? "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm"
                                        : "bg-blue-600 text-white rounded-tr-sm"
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-bold px-1">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        {thinking && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                                    {[0, 0.15, 0.3].map((d, i) => (
                                        <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick Suggestions */}
                    <div className="px-4 py-2 border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-none bg-white shrink-0">
                        {suggestions.map(s => (
                            <button
                                key={s}
                                onClick={() => send(s)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-[10px] font-black text-gray-500 whitespace-nowrap transition-all border border-transparent hover:border-blue-100"
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-gray-100 flex gap-3 items-center bg-white shrink-0">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && send(input)}
                            placeholder="Ask about grievances, alerts, analytics..."
                            className="flex-1 text-sm px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium text-gray-700"
                        />
                        <button
                            onClick={() => send(input)}
                            disabled={!input.trim() || thinking}
                            className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-40 shadow-lg shadow-blue-500/20"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
