import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, Play, Square, Settings, Volume2, Upload, FileAudio, 
  BarChart2, Activity, MessageSquare, Zap, CheckCircle2,
  Clock, Download, RefreshCw, Languages, BrainCircuit,
  Bot, AlertTriangle, ShieldCheck, ChevronRight, Copy, Trash2, StopCircle,
  Pause, RotateCcw
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

// ─── TYPES ────────────────────────────────────────────────────────
type Tab = "DASHBOARD" | "STT" | "TTS" | "CITIZEN_FLOW";

const INDIAN_LANGUAGES = [
  "English (India)", "Hindi", "Tamil", "Telugu", "Malayalam", 
  "Kannada", "Bengali", "Marathi", "Gujarati", "Punjabi"
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function SpeechStudio() {
  const [activeTab, setActiveTab] = useState<Tab>("STT");

  return (
    <DashboardLayout 
      title="Speech AI Studio" 
      subtitle="Enterprise voice services for government communications."
    >
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-140px)] w-full overflow-hidden bg-slate-900 rounded-[2.5rem] shadow-2xl relative border border-slate-700/50">
        
        {/* Sidebar / Left Nav (GovPilot Theme: Dark Navy) */}
        <div className="w-full md:w-72 bg-slate-800/80 backdrop-blur-2xl border-r border-slate-700/50 flex flex-col p-6 space-y-2 z-10">
          <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2 pt-2">Studio Modules</div>
          
          <NavButton 
            active={activeTab === "DASHBOARD"} 
            onClick={() => setActiveTab("DASHBOARD")}
            icon={<BarChart2 className="w-5 h-5" />} 
            label="Overview Dashboard" 
          />
          <NavButton 
            active={activeTab === "STT"} 
            onClick={() => setActiveTab("STT")}
            icon={<Mic className="w-5 h-5" />} 
            label="Real-time STT" 
          />
          <NavButton 
            active={activeTab === "TTS"} 
            onClick={() => setActiveTab("TTS")}
            icon={<Volume2 className="w-5 h-5" />} 
            label="Audio Generation" 
          />
          <NavButton 
            active={activeTab === "CITIZEN_FLOW"} 
            onClick={() => setActiveTab("CITIZEN_FLOW")}
            icon={<BrainCircuit className="w-5 h-5" />} 
            label="Citizen Workflow" 
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-900/50 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/40 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative p-6 lg:p-10 w-full mx-auto min-h-full">
            {activeTab === "DASHBOARD" && <DashboardTab />}
            {activeTab === "STT" && <STTTab />}
            {activeTab === "TTS" && <TTSTab />}
            {activeTab === "CITIZEN_FLOW" && <CitizenFlowTab />}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

// ─── NAV COMPONENT ────────────────────────────────────────────────
function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
        active 
          ? "bg-[#C81D25] text-white shadow-[0_0_20px_rgba(200,29,37,0.4)]" 
          : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────
function DashboardTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Analytics Overview</h2>
          <p className="text-slate-400 mt-1 font-medium">Platform performance and usage metrics.</p>
        </div>
        <div className="text-sm font-bold text-slate-300 bg-slate-800 px-5 py-2.5 rounded-full border border-slate-700 shadow-sm flex items-center gap-2">
          <Clock className="w-4 h-4" /> Last 30 Days
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={<Activity />} label="Total Voice Requests" value="124,592" trend="+14.2%" />
        <KpiCard icon={<CheckCircle2 />} label="Transcription Accuracy" value="98.7%" trend="+0.4%" />
        <KpiCard icon={<Zap />} label="Avg Processing Time" value="1.2s" trend="-0.3s" />
        <KpiCard icon={<Languages />} label="Active Languages" value="10" trend="0" />
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Language Distribution</h3>
          <div className="h-64 flex items-end gap-3 justify-between">
            {[45, 80, 30, 50, 20, 60, 40, 25, 35, 15].map((val, i) => (
              <div key={i} className="w-full bg-slate-800 rounded-t-xl relative group cursor-pointer hover:bg-slate-700 transition-colors" style={{ height: `${val}%` }}>
                <div className="absolute bottom-0 left-0 right-0 bg-[#C81D25] rounded-t-xl transition-all shadow-[0_0_15px_rgba(200,29,37,0.3)]" style={{ height: `${val * 0.8}%` }} />
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg z-10 whitespace-nowrap shadow-xl">
                  {INDIAN_LANGUAGES[i]}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 text-xs font-bold text-slate-500 border-t border-slate-700/50 pt-4">
            {INDIAN_LANGUAGES.map(l => <span key={l} className="truncate w-8 text-center">{l.substring(0,2).toUpperCase()}</span>)}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl flex flex-col">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Recent Activity</h3>
          <div className="flex-1 space-y-5">
            {[
              { t: "Tamil STT Processed", d: "2m ago", s: "Success" },
              { t: "Announcement Generated", d: "15m ago", s: "Success" },
              { t: "Hindi STT Processed", d: "1h ago", s: "Success" },
              { t: "Voice Batch Failed", d: "2h ago", s: "Error" },
              { t: "Telugu Audio Download", d: "3h ago", s: "Success" }
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
                <div>
                  <div className="font-bold text-white">{log.t}</div>
                  <div className="text-slate-400 text-xs mt-1">{log.d}</div>
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${log.s === 'Success' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' : 'text-red-400 bg-red-400/10 border border-red-400/20'}`}>
                  {log.s}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-xl flex flex-col gap-4 hover:shadow-2xl hover:bg-white/10 transition-all cursor-default">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-[#C81D25]/10 text-[#C81D25] flex items-center justify-center border border-[#C81D25]/20">
          {icon}
        </div>
        <div className={`text-sm font-black ${trend.startsWith('+') ? 'text-emerald-400' : trend.startsWith('-') ? 'text-red-400' : 'text-slate-400'}`}>
          {trend}
        </div>
      </div>
      <div className="mt-2">
        <div className="text-4xl font-black text-white mb-1 tracking-tight">{value}</div>
        <div className="text-sm font-bold text-slate-400">{label}</div>
      </div>
    </div>
  );
}

// ─── STT TAB (Real-time Speech to Text) ───────────────────────────
type MicStatus = "READY" | "LISTENING" | "PROCESSING" | "COMPLETED";

function STTTab() {
  const [micStatus, setMicStatus] = useState<MicStatus>("READY");
  const [transcript, setTranscript] = useState("");
  const [insights, setInsights] = useState<any>(null);
  const [timer, setTimer] = useState(0);

  // Simulated timer
  useEffect(() => {
    let interval: any;
    if (micStatus === "LISTENING") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [micStatus]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleMicClick = () => {
    if (micStatus === "LISTENING") {
      setMicStatus("PROCESSING");
      
      // Simulate AI Processing delay
      setTimeout(() => {
        setMicStatus("COMPLETED");
        setInsights({
          summary: "Citizen reporting a non-functional street light causing safety concerns.",
          category: "Street Lighting",
          dept: "Public Works",
          priority: "High",
          ward: "Ward 12",
          citizenDetails: "Verified Resident",
          action: "Dispatch maintenance crew to inspect pole L-421.",
          confidence: "94%"
        });
      }, 2500);
    } else if (micStatus === "READY" || micStatus === "COMPLETED") {
      setMicStatus("LISTENING");
      setTranscript("");
      setInsights(null);
      
      // Simulate typing text
      let text = "Street light not working in Ward 12. It has been dark for three days and is very unsafe for pedestrians at night.";
      let current = "";
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          current += text[i];
          setTranscript(current);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 40);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      
      {/* Top Toolbar */}
      <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#C81D25]/20 flex items-center justify-center text-[#C81D25] border border-[#C81D25]/30">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">GovPilot Engine</h2>
            <p className="text-xs font-bold text-slate-400">Microphone Array (Realtek Audio)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-700 text-sm font-bold text-slate-300">
            <div className={`w-2 h-2 rounded-full ${micStatus === 'LISTENING' ? 'bg-red-500 animate-pulse' : micStatus === 'PROCESSING' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            {micStatus === 'LISTENING' ? 'Recording' : micStatus === 'PROCESSING' ? 'Analyzing' : 'Ready'}
          </div>
          <select className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm outline-none focus:border-[#C81D25] focus:ring-1 focus:ring-[#C81D25]">
            <option>Auto-Detect Language</option>
            {INDIAN_LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        
        {/* Left: Input Console (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] shadow-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
          
          <div className="absolute top-6 left-0 right-0 text-center z-20">
            <div className="text-3xl font-black text-slate-800 font-mono tracking-widest">{formatTime(timer)}</div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Duration</div>
          </div>

          {/* Animated Waveforms background if recording */}
          {micStatus === "LISTENING" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 bg-[#C81D25]/10 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="w-64 h-64 bg-[#C81D25]/5 rounded-full animate-ping absolute" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
            </div>
          )}

          <button 
            onClick={handleMicClick}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative z-10 ${
              micStatus === "LISTENING"
                ? "bg-[#C81D25] text-white shadow-[0_0_40px_rgba(200,29,37,0.5)] scale-110" 
                : "bg-slate-50 border-4 border-[#C81D25] text-[#C81D25] hover:bg-[#C81D25] hover:text-white"
            }`}
          >
            {micStatus === "LISTENING" ? <StopCircle className="w-14 h-14" /> : <Mic className="w-14 h-14" />}
          </button>
          
          <div className="mt-10 text-center z-10">
            <h3 className="text-xl font-black text-slate-800">
              {micStatus === "LISTENING" ? "Listening..." : micStatus === "PROCESSING" ? "Processing..." : "Click to Speak"}
            </h3>
            <p className="text-slate-500 mt-2 text-sm font-medium max-w-xs mx-auto leading-relaxed">
              Speak your request clearly. The AI will auto-detect your language and extract details.
            </p>
          </div>
        </div>

        {/* Right: Output & Analysis (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          
          {/* Transcription Box */}
          <div className="bg-white rounded-[2rem] shadow-2xl p-6 flex flex-col min-h-[250px]">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-4 mb-4 gap-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-[#C81D25]" /> Live Transcription
              </h3>
              
              <div className="flex items-center gap-3">
                {transcript && (
                  <div className="flex gap-2">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">Auto: English</span>
                    <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg">Confidence: High</span>
                  </div>
                )}
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors" title="Copy text">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => setTranscript("")} title="Clear">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="text-lg text-slate-800 font-medium leading-relaxed p-2">
                {transcript || <span className="text-slate-400 italic font-normal">Awaiting voice input...</span>}
              </div>
            </div>
          </div>

          {/* AI Insights Box */}
          <div className="bg-white rounded-[2rem] shadow-2xl p-6 flex flex-col relative overflow-hidden min-h-[300px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#C81D25]" /> AI Processing Results
              </h3>
              {insights && (
                <span className="text-xs font-bold bg-[#C81D25]/10 text-[#C81D25] px-3 py-1.5 rounded-lg border border-[#C81D25]/20">
                  Score: {insights.confidence}
                </span>
              )}
            </div>

            {micStatus === "PROCESSING" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                <RefreshCw className="w-10 h-10 animate-spin text-[#C81D25]" />
                <p className="font-bold text-sm tracking-widest uppercase">Extracting Intelligence...</p>
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500 content-start">
                
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Complaint Summary</div>
                  <div className="text-slate-800 font-bold">{insights.summary}</div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category & Dept</div>
                  <div className="text-slate-800 font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
                    {insights.category} <span className="text-slate-400 font-normal">|</span> {insights.dept}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</div>
                    <div className="text-red-700 font-black bg-red-100 w-fit px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" /> {insights.priority}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</div>
                    <div className="text-slate-800 font-bold">{insights.ward}</div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Suggested Action</div>
                  <div className="text-blue-900 font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600" /> {insights.action}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm font-medium italic opacity-50">
                <Bot className="w-12 h-12 mb-4 text-slate-300" />
                Processing will begin automatically after recording.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── TTS & ANNOUNCEMENT TAB ───────────────────────────────────────
function TTSTab() {
  const [text, setText] = useState("Attention citizens. Scheduled maintenance for water supply will begin tomorrow at 10 AM. Please store sufficient water.");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Audio Generation Studio</h2>
          <p className="text-slate-400 mt-1 font-medium">Generate lifelike voice announcements in multiple languages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Controls */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] shadow-2xl p-8 space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Target Language</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-[#C81D25] focus:ring-2 focus:ring-[#C81D25]/20 transition-all">
              {INDIAN_LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Voice Model</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none focus:border-[#C81D25] focus:ring-2 focus:ring-[#C81D25]/20 transition-all">
              <option>Aarav (Male, Neural)</option>
              <option>Kavya (Female, Neural)</option>
              <option>Official Broadcast (Neutral)</option>
            </select>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-6">
            <div>
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                <span>Speed</span>
                <span className="text-[#C81D25]">1.0x</span>
              </div>
              <input type="range" className="w-full accent-[#C81D25]" />
            </div>
            <div>
              <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                <span>Pitch</span>
                <span className="text-[#C81D25]">Default</span>
              </div>
              <input type="range" className="w-full accent-[#C81D25]" />
            </div>
          </div>
        </div>

        {/* Right: Text & Player */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Announcement Script</h3>
              <button className="text-xs font-black text-[#C81D25] bg-[#C81D25]/10 px-4 py-2 rounded-xl hover:bg-[#C81D25]/20 transition-colors uppercase tracking-widest">
                Load Template
              </button>
            </div>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-800 text-lg font-medium resize-none outline-none focus:border-[#C81D25] focus:ring-4 focus:ring-[#C81D25]/10 transition-all"
            />
            <div className="mt-6 flex justify-between items-center border-t border-slate-100 pt-6">
              <span className="text-xs font-bold text-slate-400">{text.length} characters</span>
              <button className="bg-[#C81D25] hover:bg-[#a01520] text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#C81D25]/30 transition-all flex items-center gap-2 active:scale-95">
                <Zap className="w-4 h-4" /> Generate Voice
              </button>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-slate-800 rounded-[2rem] p-6 shadow-2xl flex items-center gap-6 text-white border border-slate-700/50">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 bg-[#C81D25] text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all shrink-0 shadow-lg shadow-[#C81D25]/30"
            >
              {isPlaying ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            
            <div className="flex-1">
              <div className="flex justify-between text-xs font-black text-slate-400 mb-3 tracking-widest">
                <span>0:00</span>
                <span>0:08</span>
              </div>
              <div className="h-10 w-full flex items-center gap-1 opacity-80">
                {/* Simulated waveform */}
                {Array.from({length: 40}).map((_, i) => (
                  <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${isPlaying ? 'bg-[#C81D25]' : 'bg-slate-600'}`} style={{ height: `${isPlaying ? Math.max(20, Math.random() * 100) : 20}%` }} />
                ))}
              </div>
            </div>

            <button className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center hover:bg-slate-700 transition-colors shrink-0 text-slate-300 border border-slate-600">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── CITIZEN WORKFLOW TAB ─────────────────────────────────────────
const ENGLISH_TEXT = "Thank you. Your complaint has been successfully registered. Your Complaint ID is GP-2026-1024. Your complaint has been forwarded to the Water Supply Department. A Field Officer will be assigned shortly. You will receive updates through SMS and the GovPilot application.";
const TAMIL_TEXT = "Vanakkam. Ungal complaint successfully register seyyappattullathu. Ungal Complaint ID GP-2026-1024. Indha complaint Water Supply Department-ku anuppappattullathu. Field Officer seekiram assign seyyappaduvar. SMS matrum GovPilot application moolama updates receive pannuveergal. Nandri.";

function CitizenFlowTab() {
  const [step, setStep] = useState(0);
  
  // TTS State
  const [lang, setLang] = useState<"en-IN" | "ta-IN">("en-IN");
  const [gender, setGender] = useState<"Male" | "Female">("Female");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const synth = window.speechSynthesis;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synth.cancel();
    };
  }, []);

  const runSimulation = () => {
    setStep(0);
    setStatus("Listening...");
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setStep(current);
      
      if (current === 2) setStatus("Processing Speech...");
      if (current === 3) setStatus("Generating Voice...");
      
      if (current >= 5) {
        clearInterval(interval);
        startTTS();
      }
    }, 1500);
  };

  const getVoice = () => {
    let voices = synth.getVoices();
    // Try to find a voice matching the language and gender heuristic
    let filtered = voices.filter(v => v.lang.includes(lang.split('-')[0]));
    if (filtered.length === 0) filtered = voices; // fallback
    
    // Simple heuristic for gender based on name (very rough for Web Speech API)
    let selected = filtered.find(v => gender === "Female" ? (v.name.includes("Female") || v.name.includes("Zira")) : (v.name.includes("Male") || v.name.includes("David")));
    return selected || filtered[0] || voices[0];
  };

  const startTTS = () => {
    synth.cancel();
    const text = lang === "en-IN" ? ENGLISH_TEXT : TAMIL_TEXT;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getVoice();
    utterance.volume = volume;
    utterance.rate = rate;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setStatus("Playing Confirmation...");
      
      // Fake progress bar animation (since Web Speech API doesn't give accurate progress % easily)
      const duration = text.length * 60; // rough estimate ms
      const interval = 100;
      let elapsed = 0;
      const progTimer = setInterval(() => {
        elapsed += interval;
        setProgress(Math.min((elapsed / duration) * 100, 99));
        if (!synth.speaking) clearInterval(progTimer);
      }, interval);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setStatus("Completed - Voice Delivered Successfully");
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setStatus("Voice generation failed. Please retry.");
    };

    synth.speak(utterance);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      synth.pause();
      setIsPaused(true);
      setIsPlaying(false);
      setStatus("Paused");
    } else if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      setStatus("Playing Confirmation...");
    } else if (step === 5) {
      startTTS();
    }
  };

  const handleStop = () => {
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setStatus("Stopped");
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleRate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRate(parseFloat(e.target.value));
  };

  const steps = [
    { icon: <Mic />, title: "Citizen Speaks", desc: '"Street light not working in Ward 12"' },
    { icon: <FileAudio />, title: "Speech-to-Text", desc: "Transcribed with 99% confidence" },
    { icon: <BrainCircuit />, title: "GovPilot AI Analysis", desc: "Dept: Public Works | Priority: Medium" },
    { icon: <CheckCircle2 />, title: "Complaint Registered", desc: "Generated Ticket ID: GP-2026-1024" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto py-8">
      
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Pipeline Visualization */}
        <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Voice Assistant Workflow</h2>
          <p className="text-slate-400 font-medium mb-8">End-to-end voice complaint processing simulation.</p>
          
          <button 
            onClick={runSimulation}
            disabled={step > 0 && step < 5 && isPlaying}
            className="mb-10 w-full bg-[#C81D25] hover:bg-[#a01520] disabled:bg-slate-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#C81D25]/30 transition-all active:scale-95"
          >
            {step === 0 ? "Start Flow" : "Restart Simulation"}
          </button>

          <div className="relative px-4 pb-8">
            <div className="absolute left-[35px] top-6 bottom-6 w-1 bg-slate-800 rounded-full" />
            
            <div className="space-y-8">
              {steps.map((s, i) => {
                const isActive = step === i + 1;
                const isDone = step > i + 1;
                
                return (
                  <div key={i} className={`flex gap-6 relative transition-all duration-500 ${step >= i + 1 ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-8'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 z-10 border-2 border-slate-900 ${
                      isActive ? 'bg-[#C81D25] text-white scale-110 shadow-[0_0_20px_rgba(200,29,37,0.5)]' : 
                      isDone ? 'bg-emerald-500 text-white' : 
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-6 h-6" /> : React.cloneElement(s.icon as React.ReactElement, { className: "w-6 h-6" })}
                    </div>
                    <div className={`flex-1 bg-white p-5 rounded-2xl shadow-md flex justify-between items-center ${isActive ? 'ring-2 ring-[#C81D25] ring-offset-2 ring-offset-slate-900' : ''}`}>
                      <div>
                        <h3 className={`font-black ${isActive ? 'text-[#C81D25]' : 'text-slate-800'}`}>{s.title}</h3>
                        <p className="text-slate-500 text-xs mt-1 font-bold">{s.desc}</p>
                      </div>
                      {isActive && <RefreshCw className="w-5 h-5 text-[#C81D25] animate-spin" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: TTS Audio Control Panel (Step 5) */}
        <div className="flex-1 flex flex-col gap-6">
          
          <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-[#C81D25]" /> Auto-Voice Confirmation
              </h3>
              <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                status.includes('Completed') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                status.includes('failed') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                'bg-slate-700 text-slate-300 border-slate-600'
              }`}>
                {status || "Waiting..."}
              </div>
            </div>

            <div className={`flex-1 transition-all duration-700 ${step >= 5 ? 'opacity-100 blur-none' : 'opacity-30 blur-sm pointer-events-none'}`}>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Language</label>
                  <select value={lang} onChange={e => setLang(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none">
                    <option value="en-IN">English (India)</option>
                    <option value="ta-IN">Tamil</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Voice Model</label>
                  <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none">
                    <option value="Female">Female Voice</option>
                    <option value="Male">Male Voice</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 mb-6 relative overflow-hidden h-32 flex flex-col justify-end">
                {/* Waveform Animation */}
                <div className="absolute inset-0 flex items-center gap-1 px-4 opacity-50">
                  {Array.from({length: 40}).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-full transition-all duration-200 ${isPlaying ? 'bg-[#C81D25]' : 'bg-slate-600'}`} style={{ height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '10%' }} />
                  ))}
                </div>
                <div className="relative z-10 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-auto">
                  <div className="bg-[#C81D25] h-full transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-6">
                <div className="flex justify-center items-center gap-6">
                  <button onClick={() => startTTS()} className="text-slate-400 hover:text-white transition-colors"><RotateCcw className="w-6 h-6" /></button>
                  <button onClick={handlePlayPause} className="w-16 h-16 bg-[#C81D25] text-white rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-[#C81D25]/30">
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>
                  <button onClick={handleStop} className="text-slate-400 hover:text-white transition-colors"><Square className="w-6 h-6" /></button>
                  <button onClick={() => alert("Downloading audio is not supported in the native Web Speech API. Use an external TTS provider like Azure/AWS for file generation.")} className="text-slate-400 hover:text-white transition-colors"><Download className="w-6 h-6" /></button>
                </div>
                
                <div className="grid grid-cols-2 gap-8 px-4">
                  <div className="flex items-center gap-4">
                    <Volume2 className="w-4 h-4 text-slate-500 shrink-0" />
                    <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolume} className="w-full accent-[#C81D25]" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Speed</div>
                    <select value={rate} onChange={handleRate} className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer">
                      <option value="0.75">0.75x</option>
                      <option value="1">1.0x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
