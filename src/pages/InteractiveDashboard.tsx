import { DashboardLayout } from "@/components/DashboardLayout";
import {
    Target, Activity, Map,
    Layers, Maximize2,
    ChevronRight, Zap, ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { useComplaints } from "@/context/ComplaintsContext";

const ZONES: Record<string, string[]> = {
    "Central Zone": ["Ward 1", "Ward 4", "Ward 9", "Ward 10"],
    "North Grid": ["Ward 3", "Ward 6", "Ward 12"],
    "South Sector": ["Ward 2", "Ward 8", "Ward 11"],
    "West Hub": ["Ward 5", "Ward 7"],
};

export default function InteractiveDashboard() {
    const { complaints } = useComplaints();
    const [activeZone, setActiveZone] = useState("Central Zone");

    const zoneWards = ZONES[activeZone] || [];
    const zoneComplaints = complaints.filter(c => zoneWards.includes(c.ward));
    const total = zoneComplaints.length;
    const resolved = zoneComplaints.filter(c => c.status === "Resolved").length;
    const pending = total - resolved;
    
    // Tactical Integrity: (Resolved / Total if total > 0) else 100%
    const integrity = total === 0 ? 100 : Math.round((resolved / total) * 100);
    const critical = zoneComplaints.filter(c => c.priority === "High").length;

    return (
        <DashboardLayout 
            title="Strategic War Room" 
            subtitle="Command Center: Live Multi-Sector Governance Telemetry"
            bgImage="/images/globe_bg.png"
        >
            <div className="space-y-6 pb-12">

                {/* Tactical Header */}
                <div className="bg-[#0B1221] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-600/10 blur-[130px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#B91C1C] to-[#7F1D1D] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-900/40 relative group">
                                <Target className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#0B1221] animate-ping" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black tracking-tight">{activeZone} <span className="text-white/30 text-sm font-bold uppercase tracking-[0.3em] ml-2">Monitor</span></h1>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Sector Integrity: {integrity}%</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{zoneWards.length} Active Nodes (Wards)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 bg-white/5 p-2 rounded-3xl border border-white/10 backdrop-blur-md">
                            {Object.keys(ZONES).map(zone => (
                                <button
                                    key={zone}
                                    onClick={() => setActiveZone(zone)}
                                    className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeZone === zone
                                        ? "bg-[#B91C1C] text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400/20"
                                        : "hover:bg-white/10 text-white/40"
                                        }`}
                                >
                                    {zone}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Interactive Map / Controls Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    {/* The "Map" Area */}
                    <div className="xl:col-span-3 bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm min-h-[550px] relative overflow-hidden group/map">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(185,28,28,0.03)_0%,transparent_100%)] pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 flex items-center gap-3 uppercase tracking-widest">
                                    <Map className="w-5 h-5 text-[#B91C1C]" />
                                    Tactical Node Intelligence
                                </h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Satellite View Overlay: Active Wards In {activeZone}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-100">
                                    <Layers className="w-4 h-4" />
                                </button>
                                <button className="p-3 bg-[#B91C1C] rounded-2xl text-white shadow-lg shadow-red-900/10 active:scale-95 transition-all">
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Interactive Ward Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10 p-4 border border-gray-50 rounded-[2.5rem] bg-gray-50/50">
                            {zoneWards.map(w => {
                                const wData = complaints.filter(c => c.ward === w);
                                const isHottest = wData.length > 5;
                                return (
                                    <div
                                        key={w}
                                        className={`p-6 rounded-3xl transition-all duration-500 hover:scale-[1.05] border flex flex-col justify-between group cursor-pointer h-44 shadow-sm ${
                                            isHottest 
                                            ? "bg-[#B91C1C] border-[#B91C1C] text-white shadow-red-900/20"
                                            : "bg-white border-gray-100 text-gray-900 hover:border-red-200"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-0.5">
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${isHottest ? "text-white/60" : "text-gray-400"}`}>Node</p>
                                                <p className="text-sm font-black">{w}</p>
                                            </div>
                                            {isHottest && <Activity className="w-4 h-4 animate-pulse text-white/50" />}
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black tracking-tighter mb-1">{wData.length || 0}</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1 h-1 rounded-full ${isHottest ? 'bg-white' : 'bg-red-500'}`} />
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${isHottest ? "text-white/70" : "text-gray-400"}`}>Active Events</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tactical Alert Bar */}
                        <div className="mt-12 bg-[#060912] rounded-[2rem] p-6 shadow-2xl relative z-20 border border-white/5 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 blur-[60px] pointer-events-none" />
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
                                        <Activity className="w-6 h-6 text-rose-500 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Live Strategic Feed</p>
                                        </div>
                                        <p className="text-sm font-bold text-white/90 italic mt-0.5 tracking-tight px-1">
                                            {critical > 0 
                                                ? `Critical Alert: ${critical} high-priority breaches detected in ${zoneWards[0]}. Intelligence required.`
                                                : `Strategic Status: ${activeZone} reporting normal operations. No critical escalations detected.`}
                                        </p>
                                    </div>
                                </div>
                                <button className="px-8 py-3 bg-white text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2 border border-white shadow-xl">
                                    Deploy Units <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Analytics Protocol */}
                    <div className="space-y-6">
                        {[
                            { label: "Active Sector Load", value: total, unit: "Events", icon: Zap, color: "text-amber-500", bg: "bg-amber-50", bar: total > 20 ? 90 : total * 5 },
                            { label: "Strategic Resolved", value: resolved, unit: "Verified", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", bar: integrity },
                            { label: "Pending Response", value: pending, unit: "Active", icon: Activity, color: "text-red-700", bg: "bg-red-50", bar: (pending / (total || 1)) * 100 },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:scale-[1.02] transition-transform duration-300 group relative overflow-hidden">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`p-4 rounded-2xl ${stat.bg} group-hover:rotate-12 transition-transform duration-500`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{stat.unit}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">{stat.label}</p>
                                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${stat.color === 'text-red-700' ? 'bg-red-600' : stat.color === 'text-emerald-500' ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                        style={{ width: `${stat.bar}%` }} 
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="bg-gradient-to-br from-gray-900 to-[#121212] rounded-[3rem] p-10 text-white shadow-2xl border border-white/5">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-4">Tactical Summary</h3>
                            <p className="text-xs text-white/60 leading-relaxed italic">Currently monitoring all sectors with active AI predictive mapping. Sector integrity is linked to the central Governance Core.</p>
                        </div>
                    </div>
                </div>

                {/* War Room Strategic Operation Manual */}
                <div className="bg-white border border-gray-100 rounded-[3.5rem] p-16 shadow-sm relative overflow-hidden group/manual">
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#B91C1C]/5 blur-[150px] pointer-events-none group-hover/manual:bg-[#B91C1C]/10 transition-all duration-1000" />
                    
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col items-center text-center mb-16 space-y-4">
                            <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-50 text-[#B91C1C] rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-red-100 shadow-sm">
                                <ShieldCheck className="w-3.5 h-3.5" /> War Room Protocol v1.0
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Strategic Operation Manual</h2>
                            <p className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] max-w-sm">Standard Operating Procedures for District-Level Command Units</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                            {[
                                { 
                                    step: "01", 
                                    title: "Sector Toggling", 
                                    desc: "Use the top-tier zone selector to shift telemetry between Central, North, South, and West sectors.",
                                    icon: Map
                                },
                                { 
                                    step: "02", 
                                    title: "Integrity Analysis", 
                                    desc: "Monitor the 'Sector Integrity' percentage. Drops below 70% indicate critical resource depletion.",
                                    icon: Zap
                                },
                                { 
                                    step: "03", 
                                    title: "Node Hotspots", 
                                    desc: "Red-tinted Ward cards signify high-priority clusters (5+ events). Immediate intelligence verify required.",
                                    icon: Target
                                },
                                { 
                                    step: "04", 
                                    title: "Unit Deployment", 
                                    desc: "Execute the 'Deploy Units' protocol in the alert bar to transition pending events to active field missions.",
                                    icon: Activity
                                },
                            ].map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div key={i} className="space-y-6 group/step">
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl font-black text-gray-900/5 italic tracking-tighter group-hover/step:text-[#B91C1C]/10 transition-colors uppercase">{s.step}</div>
                                            <div className="h-px bg-gray-100 flex-1" />
                                            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover/step:bg-[#B91C1C]/5 group-hover/step:border-[#B91C1C]/20 transition-all">
                                                <Icon className="w-5 h-5 text-gray-300 group-hover/step:text-[#B91C1C]" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter group-hover/step:text-[#B91C1C] transition-colors italic">{s.title}</h4>
                                            <p className="text-[11px] text-gray-400 font-bold leading-relaxed tracking-tight group-hover/step:text-gray-500 transition-colors">{s.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-20 pt-16 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-gray-900 rounded-[2.5rem] flex items-center justify-center border-4 border-gray-100 shadow-2xl group-hover/manual:rotate-12 transition-transform duration-700">
                                    <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 italic">Security Status</p>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Encryption Core Synchronized</p>
                                </div>
                            </div>
                            <button className="px-10 py-5 bg-gray-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#B91C1C] transition-all shadow-2xl shadow-gray-950/20 active:scale-95">
                                Print Operation Manifest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
