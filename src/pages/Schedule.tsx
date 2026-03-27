import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Clock, MapPin, Users,
    Plus, ChevronLeft, ChevronRight, MoreVertical,
    CheckCircle2, AlertCircle, X, Shield
} from "lucide-react";

interface Event {
    id: string;
    title: string;
    time: string;
    duration: string;
    location: string;
    type: "Meeting" | "Site Visit" | "Review" | "Public Session";
    status: "Confirmed" | "Tentative" | "Critical";
    attendees: string[];
}

const scheduleEvents: Event[] = [
    {
        id: "1",
        title: "Ward 03 Area Inspection",
        time: "10:30 AM",
        duration: "1h 30m",
        location: "Ward 03 Main Square",
        type: "Site Visit",
        status: "Confirmed",
        attendees: ["Ramesh K.", "Sarah L.", "Admin"]
    },
    {
        id: "2",
        title: "Public Hearing: New Park",
        time: "02:00 PM",
        duration: "2h 00m",
        location: "Town Hall Room 4",
        type: "Public Session",
        status: "Critical",
        attendees: ["Community Leaders", "Admin"]
    },
    {
        id: "3",
        title: "Weekly Staff Review",
        time: "04:30 PM",
        duration: "45m",
        location: "Meeting Room B",
        type: "Review",
        status: "Tentative",
        attendees: ["Team Leads", "Admin"]
    },
    {
        id: "4",
        title: "Budget Planning Session",
        time: "09:00 AM",
        duration: "30m",
        location: "Office / Video Call",
        type: "Meeting",
        status: "Confirmed",
        attendees: ["Finance Dept", "Admin"]
    }
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Schedule() {
    const navigate = useNavigate();
    const [view, setView] = useState<"Day" | "Week" | "Month">("Day");
    const [currentTime] = useState(new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }));

    // Mock progress through day
    const progress = 45; // 45% of day passed

    const [showMissionModal, setShowMissionModal] = useState(false);

    return (
        <DashboardLayout 
            title="Strategic Schedule" 
            subtitle="Coordinate field operations and multi-tier governance sessions"
            bgImage="/images/dashboard_bg.png"
            actions={
                <button 
                    onClick={() => setShowMissionModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-[#B91C1C] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-red-900/30 hover:scale-[1.05] active:scale-[0.95] transition-all border border-red-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Coordinate Mission
                </button>
            }
        >
            <div className="space-y-8 pb-12 relative">
                
                {/* Mission Modal Overlay */}
                {showMissionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-300">
                        <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl" onClick={() => setShowMissionModal(false)} />
                        
                        <div className="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Sync New Mission</h2>
                                    <button onClick={() => setShowMissionModal(false)} className="p-3 hover:bg-red-50 text-gray-400 hover:text-[#B91C1C] rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mission Objective</label>
                                        <input type="text" placeholder="e.g. Ward 03 Strategic Inspection" className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-bold focus:outline-none focus:border-[#B91C1C]/30 transition-all" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Deployment Grid</label>
                                            <select className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-bold focus:outline-none">
                                                <option>Sector 01 - North</option>
                                                <option>Sector 02 - Core</option>
                                                <option>Sector 03 - Industrial</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Time Sequence</label>
                                            <input type="time" className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-bold focus:outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <Users className="w-5 h-5 text-[#B91C1C]" />
                                    </div>
                                    <p className="text-[10px] font-black text-red-900/60 uppercase tracking-widest flex-1">12 Unified Field Agents will be auto-synchronized for this deployment.</p>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setShowMissionModal(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Abort</button>
                                    <button className="flex-[2] py-5 bg-[#B91C1C] text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Authorize Mission</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Tactical Timeline Progress */}
                <div className="bg-[#0B1221] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[100px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 relative">
                                <Clock className="w-10 h-10 text-red-500 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter mb-1">{currentTime} <span className="text-white/20 text-sm ml-2 font-bold uppercase tracking-[0.3em]">IST</span></h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#B91C1C]">March 2026 Strategy Cycle</p>
                            </div>
                        </div>

                        <div className="flex-1 max-w-md space-y-4">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Day Cycle Completion</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{progress}%</p>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-red-600 to-[#B91C1C] rounded-full shadow-[0_0_15px_rgba(185,28,28,0.5)] transition-all duration-1000" 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
                            {["Day", "Week", "Month"].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setView(v as any)}
                                    className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === v ? "bg-white text-gray-900 shadow-xl" : "text-white/30 hover:text-white/60"}`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                    
                    {/* Left Column: Calendar Intelligence */}
                    <div className="xl:col-span-1 space-y-8">
                        <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B91C1C]/5 blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                            
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">March 2026</h3>
                                <div className="flex gap-2">
                                    <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors border border-gray-100"><ChevronLeft className="w-4 h-4" /></button>
                                    <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors border border-gray-100"><ChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 mb-4 relative z-10">
                                {dayNames.map(d => (
                                    <div key={d} className="text-[9px] font-black uppercase text-gray-300 text-center py-3 tracking-tighter">{d}</div>
                                ))}
                                {Array.from({ length: 31 }).map((_, i) => {
                                    const day = i + 1;
                                    const isSelected = day === 11;
                                    const hasEvent = [11, 14, 15, 22].includes(day);
                                    return (
                                        <button
                                            key={i}
                                            className={`h-12 rounded-2xl text-[11px] font-black transition-all flex flex-col items-center justify-center relative border ${isSelected ? "bg-[#B91C1C] border-[#B91C1C] text-white shadow-2xl shadow-red-900/30 scale-110 z-10" : "text-gray-500 bg-white border-transparent hover:border-[#B91C1C]/20 hover:bg-red-50/30"}`}
                                        >
                                            {day}
                                            {hasEvent && !isSelected && (
                                                <div className="absolute bottom-2.5 w-1 h-1 rounded-full bg-red-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-10 pt-10 border-t border-gray-50 space-y-8 relative z-10">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Priority Targets
                                    </h4>
                                    <div className="space-y-6">
                                        {[
                                            { label: "Quarterly Audit", date: "Mar 14", status: "Critical", icon: AlertCircle },
                                            { label: "Planning Grid", date: "Mar 15", status: "Normal", icon: Clock },
                                            { label: "Sector Inspection", date: "Mar 22", status: "Normal", icon: MapPin },
                                        ].map(m => (
                                            <div key={m.label} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.status === 'Critical' ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-400'}`}>
                                                        <m.icon className="w-4 h-4" />
                                                    </div>
                                                    <p className="text-[11px] font-black text-gray-700 uppercase tracking-tighter group-hover:text-[#B91C1C] transition-colors">{m.label}</p>
                                                </div>
                                                <span className="text-[10px] font-black text-gray-300 tabular-nums">{m.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conflict Detection Card */}
                        <div className="bg-[#B91C1C] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10">
                                <AlertCircle className="w-10 h-10 text-white mb-6 animate-bounce" />
                                <h3 className="text-2xl font-black mb-3 leading-none italic">SLA Conflict</h3>
                                <p className="text-xs text-white/70 leading-relaxed font-black uppercase tracking-widest opacity-80 decoration-white/20 underline underline-offset-4">Ward 03 Area Inspection</p>
                                <p className="text-[10px] text-white/40 mt-3 font-medium">Auto-detection: Parallel session in Region 7 found. Integrity breach risk.</p>
                                <button className="mt-10 w-full py-4 bg-white/10 hover:bg-white text-white hover:text-[#B91C1C] border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300">
                                    Recalibrate Time
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tactical Timeline Cards */}
                    <div className="xl:col-span-3 space-y-8">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-6">
                                    Wednesday, 11
                                    <span className="text-xs font-black py-2 px-6 bg-red-900/5 text-[#B91C1C] rounded-2xl uppercase tracking-[0.3em] border border-red-900/10">Active Strategy Phase</span>
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2 ml-1">4 Synchronized Operations Found</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {scheduleEvents.map((event, idx) => (
                                <div 
                                    key={event.id}
                                    className="bg-white border border-gray-100 rounded-[3.5rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden border-b-8 border-b-gray-50 hover:border-b-[#B91C1C]/10"
                                >
                                    {/* Status Left Accent */}
                                    <div className={`absolute top-0 left-0 bottom-0 w-2.5 ${
                                        event.status === 'Critical' ? 'bg-rose-500 shadow-[2px_0_15px_rgba(244,63,94,0.4)]' : 'bg-[#B91C1C]/10 group-hover:bg-[#B91C1C]'
                                    } transition-all duration-500`} />

                                    {/* Time Block */}
                                    <div className="flex flex-col items-center justify-center gap-2 min-w-[140px] border-r border-gray-50 pr-12 text-center">
                                        <p className="text-4xl font-black text-gray-900 tracking-tighter leading-none group-hover:scale-110 transition-transform">{event.time.split(' ')[0]}</p>
                                        <span className="text-[12px] font-black text-[#B91C1C] uppercase tracking-[0.3em] bg-red-50 px-3 py-1 rounded-lg">{event.time.split(' ')[1]}</span>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] ${
                                                        event.status === 'Critical' ? 'bg-rose-500 text-white' : 'bg-gray-900 text-white'
                                                    }`}>
                                                        {event.type}
                                                    </span>
                                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{event.duration} Long</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-[#B91C1C] transition-colors tracking-tight">{event.title}</h3>
                                            </div>
                                            <button className="p-4 bg-gray-50 rounded-3xl text-gray-300 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-100 transition-all active:scale-90">
                                                <MoreVertical className="w-6 h-6" />
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-[#B91C1C]/5 flex items-center justify-center border border-[#B91C1C]/10">
                                                    <MapPin className="w-5 h-5 text-[#B91C1C]" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Tactical Location</p>
                                                    <p className="text-xs font-black text-gray-700 tracking-tight">{event.location}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-red-100">
                                                    <Users className="w-5 h-5 text-gray-400 group-hover:text-[#B91C1C]" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Personnel Grid</p>
                                                    <p className="text-xs font-black text-gray-700 tracking-tight">{event.attendees.length} Verified Agents</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deployment HUD */}
                                        <div className="flex items-center gap-8 pt-8 border-t border-gray-50">
                                            <div className="flex -space-x-4">
                                                {event.attendees.map((a, i) => (
                                                    <div 
                                                        key={i} 
                                                        title={a}
                                                        className="w-12 h-12 rounded-[1.2rem] bg-gray-900 border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-xl cursor-pointer hover:-translate-y-2 transition-transform relative group/avatar"
                                                    >
                                                        {a.substring(0, 2).toUpperCase()}
                                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-[8px] rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                                            {a}
                                                        </div>
                                                    </div>
                                                ))}
                                                {idx === 1 && (
                                                    <div className="w-12 h-12 rounded-[1.2rem] bg-[#B91C1C] border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-xl relative animate-pulse">
                                                        +12
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="ml-auto flex items-center gap-4">
                                                <button className="px-8 py-3 bg-gray-900 hover:bg-[#B91C1C] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-xl shadow-gray-900/10">
                                                    Deploy Hud
                                                </button>
                                                <span className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    event.status === 'Confirmed' 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-rose-500 text-white border-rose-400 animate-pulse'
                                                }`}>
                                                    {event.status === 'Confirmed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                    {event.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tactical Footer */}
                        <div className="bg-gray-900 rounded-[3.5rem] p-16 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(185,28,28,0.1),transparent_70%)] pointer-events-none" />
                            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform duration-700">
                                <Clock className="w-10 h-10 text-white/20" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-white italic tracking-tight uppercase">Strategic Cycle Concluded</h4>
                                <p className="text-xs text-white/30 max-w-sm font-black uppercase tracking-widest mt-2">All operational grid sessions have been successfully logged to the Governance Core.</p>
                            </div>
                            <button className="px-10 py-4 bg-white text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#B91C1C] hover:text-white transition-all">
                                Request Summary
                            </button>
                        </div>

                        {/* Mission Coordination Manual HUD */}
                        <div className="bg-white border border-gray-100 rounded-[3.5rem] p-16 shadow-sm relative overflow-hidden group/manual mt-12">
                            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-red-600/5 blur-[150px] pointer-events-none group-hover/manual:bg-[#B91C1C]/10 transition-all duration-1000" />
                            
                            <div className="max-w-5xl mx-auto text-left">
                                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-50 text-[#B91C1C] rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-red-100 shadow-sm">
                                        <Shield className="w-3.5 h-3.5" /> Mission Protocol v3.2
                                    </div>
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Mission Coordination Manual</h2>
                                    <p className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] max-w-sm">Strategic Directives for Field Unit Deployment Grid</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                                    {[
                                        { 
                                            step: "01", 
                                            title: "Mission Sync", 
                                            desc: "Tap 'Coordinate Mission' to initialize a new deployment. Define the specific Ward grid and time sequence.",
                                            icon: Plus
                                        },
                                        { 
                                            step: "02", 
                                            title: "Telemetry Grid", 
                                            desc: "Monitor the 'Tactical Timeline' for real-time mission status. A red pulse indicates an active site session.",
                                            icon: Clock
                                        },
                                        { 
                                            step: "03", 
                                            title: "Conflict Detect", 
                                            desc: "Auto-scan for overlapping sessions or personnel shortages in the 'Calendar Intelligence' core.",
                                            icon: AlertCircle
                                        },
                                        { 
                                            step: "04", 
                                            title: "Deployment HUD", 
                                            desc: "Execute 'Deploy Hud' to transmit the final mission parameters directly to the assigned field officer's terminal.",
                                            icon: CheckCircle2
                                        },
                                    ].map((s, i) => {
                                        const Icon = s.icon;
                                        return (
                                            <div key={i} className="space-y-6 group/step">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-4xl font-black text-gray-900/5 italic tracking-tighter group-hover/step:text-[#B91C1C]/10 transition-colors uppercase">{s.step}</div>
                                                    <div className="h-px bg-gray-100 flex-1" />
                                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover/step:bg-red-500/5 group-hover/step:border-red-500/20 transition-all">
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
                                            <Shield className="w-10 h-10 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 italic">Security Status</p>
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Mission Core Synchronized</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => navigate("/schedule-guide")} className="px-10 py-5 bg-[#B91C1C] text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black transition-all shadow-2xl shadow-red-500/20 active:scale-95">
                                            View Full Protocol
                                        </button>
                                        <button className="px-10 py-5 bg-gray-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#B91C1C] transition-all shadow-2xl shadow-gray-950/20 active:scale-95">
                                            Print Operation Manifest
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
