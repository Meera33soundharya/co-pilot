import { useState, useEffect } from "react";
import { ShieldCheck, Zap, Bell, TrendingUp, Activity, Users, Clock, AlertTriangle, ChevronRight } from "lucide-react";

function getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

const tickerItems = [
    { label: "Ward 03 Water Crisis", status: "CRITICAL", color: "text-rose-400" },
    { label: "AI resolved 47 tickets today", status: "INFO", color: "text-blue-400" },
    { label: "Sentiment improved +3.2%", status: "POSITIVE", color: "text-emerald-400" },
    { label: "New policy: Road Safety 2026 uploaded", status: "UPDATE", color: "text-amber-400" },
    { label: "Ward 09 auto-rerouting active", status: "ACTION", color: "text-indigo-400" },
];

const liveStats = [
    { label: "Active Officers", value: "24", icon: Users, color: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-400", border: "border-blue-500/20" },
    { label: "AI Accuracy", value: "98.2%", icon: Activity, color: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-400", border: "border-emerald-500/20" },
    { label: "Avg Response", value: "4.2h", icon: Clock, color: "from-amber-500/20 to-amber-600/10", iconColor: "text-amber-400", border: "border-amber-500/20" },
    { label: "Sentiment", value: "82/100", icon: TrendingUp, color: "from-indigo-500/20 to-indigo-600/10", iconColor: "text-indigo-400", border: "border-indigo-500/20" },
];

export function HeroBanner() {
    const [tick, setTick] = useState(0);
    const [pulseCount, setPulseCount] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setTick(t => (t + 1) % tickerItems.length), 3500);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const id = setInterval(() => setPulseCount(c => c + 1), 2000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl" style={{ background: 'linear-gradient(135deg, #060D1A 0%, #0B1221 40%, #0d1a35 70%, #091628 100%)' }}>
            {/* Animated mesh grid */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.08) 1px, transparent 0)',
                backgroundSize: '36px 36px'
            }} />

            {/* Gold accent top border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60" />

            {/* Glow orbs */}
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-20 right-10 w-60 h-60 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />

            {/* Ticker bar */}
            <div className="relative z-10 border-b border-white/5 px-8 py-2.5 flex items-center gap-4 bg-white/[0.03]">
                <div className="flex items-center gap-2 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Live Feed</span>
                </div>
                <div className="flex-1 overflow-hidden">
                    <div key={tick} className="animate-fade-in flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 ${tickerItems[tick].color}`}>
                            {tickerItems[tick].status}
                        </span>
                        <span className="text-xs font-bold text-white/50">{tickerItems[tick].label}</span>
                    </div>
                </div>
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest shrink-0 hidden md:block">
                    {new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 px-8 py-8 flex flex-col xl:flex-row xl:items-center gap-8">
                {/* Left — greeting + status badges */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* Label */}
                    <div className="flex items-center gap-3">
                        <div className="h-px w-10 bg-gradient-to-r from-[#D4AF37] to-transparent" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
                            AI-Powered Governance Intelligence · GovCo-Pilot v2.0
                        </span>
                    </div>

                    {/* Greeting */}
                    <div>
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
                            {getTimeGreeting()},<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                                Arjun Kumar
                            </span>
                        </h1>
                        <p className="text-sm text-white/40 mt-3 leading-relaxed max-w-md">
                            Your governance intelligence system has processed <span className="text-white font-bold">2,847 citizen reports</span> this month.
                            Resolution rate is at <span className="text-emerald-400 font-bold">78.3%</span> and trending upward.
                        </p>
                    </div>

                    {/* Status chips */}
                    <div className="flex flex-wrap gap-2.5">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">7 Critical Anomalies</span>
                            <ChevronRight className="w-3 h-3 text-rose-400/50" />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">System Integrity Optimal</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <Bell className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-wider">24 Social Mentions</span>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-all">
                            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider">Run AI Audit</span>
                        </button>
                    </div>
                </div>

                {/* Right — stat grid */}
                <div className="grid grid-cols-2 gap-3 shrink-0 xl:w-80">
                    {liveStats.map((stat) => (
                        <div
                            key={stat.label}
                            className={`relative p-5 rounded-2xl border ${stat.border} overflow-hidden group cursor-default hover:scale-[1.02] transition-transform`}
                            style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)` }}
                        >
                            {/* Icon bg glow */}
                            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} blur-[20px]`} />
                            <stat.icon className={`w-4 h-4 ${stat.iconColor} mb-3 relative z-10`} />
                            <p className="text-2xl font-black text-white leading-none relative z-10">{stat.value}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1.5 relative z-10">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mission status bar */}
            <div className="relative z-10 border-t border-white/5 px-8 py-3 flex items-center gap-6 bg-white/[0.02]">
                {[
                    { label: "Critical Response SLA", value: 94, color: "#EF4444" },
                    { label: "AI Model Uptime", value: 99.8, color: "#10B981" },
                    { label: "Data Freshness", value: 100, color: "#3B82F6" },
                ].map(s => (
                    <div key={s.label} className="flex items-center gap-3 flex-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30 whitespace-nowrap hidden sm:block">{s.label}</span>
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${s.value}%`, backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}80` }} />
                        </div>
                        <span className="text-[9px] font-black text-white/50" style={{ color: s.color }}>{s.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
