import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import {
    PlusCircle, MessageSquare, Clock, CheckCircle2,
    AlertTriangle, ArrowRight, MapPin, Calendar,
    ChevronRight, Search, Filter, Shield,
    Star, RefreshCw, MessageCircle, ImageIcon,
    X, Zap, Mail, Phone, Info, Megaphone, Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Status, Priority } from "@/store/complaintsStore";

const STATUS_CFG: Record<Status, { color: string; bg: string; icon: any; step: number }> = {
    "New": { color: "text-gray-500", bg: "bg-gray-50", icon: Clock, step: 1 },
    "Categorized": { color: "text-purple-600", bg: "bg-purple-50", icon: Filter, step: 2 },
    "Assigned": { color: "text-blue-600", bg: "bg-blue-50", icon: ArrowRight, step: 3 },
    "In Progress": { color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle, step: 4 },
    "Resolved": { color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2, step: 5 },
    "Closed": { color: "text-gray-400", bg: "bg-gray-100", icon: MessageSquare, step: 6 },
};

const PRIORITY_COLOR: Record<Priority, string> = {
    High: "text-red-600 bg-red-50 border-red-100",
    Medium: "text-amber-600 bg-amber-50 border-amber-100",
    Low: "text-blue-600 bg-blue-50 border-blue-100",
};

// 4-step timeline matching reference app
const TIMELINE_STEPS = ["Submitted", "Assigned", "In Progress", "Resolved"];
const STATUS_TO_STEP: Record<Status, number> = {
    "New": 1,
    "Categorized": 1,
    "Assigned": 2,
    "In Progress": 3,
    "Resolved": 4,
    "Closed": 4,
};

function ComplaintTimeline({ status }: { status: Status }) {
    const currentStep = STATUS_TO_STEP[status];
    return (
        <div className="mt-5 flex items-center gap-0">
            {TIMELINE_STEPS.map((label, i) => {
                const step = i + 1;
                const done = step < currentStep;
                const active = step === currentStep;
                return (
                    <div key={label} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${done ? "bg-[#B91C1C] border-[#B91C1C]" :
                                    active ? "bg-white border-[#B91C1C] shadow-lg shadow-red-100" :
                                        "bg-white border-gray-200"
                                }`}>
                                {done && <div className="w-2 h-2 rounded-full bg-white" />}
                                {active && <div className="w-2 h-2 rounded-full bg-[#B91C1C]" />}
                            </div>
                            <span className={`mt-1.5 text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${active ? "text-[#B91C1C]" : done ? "text-gray-400" : "text-gray-200"
                                }`}>{label}</span>
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${step < currentStep ? "bg-[#B91C1C]" : "bg-gray-100"
                                }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function CitizenModule() {
    const { complaints, currentUser, rateComplaint, reopenComplaint, announcements } = useComplaints();
    const navigate = useNavigate();

    // UI Local State
    const [filter, setFilter] = useState<Status | "All">("All");
    const [search, setSearch] = useState("");
    const [selectedC, setSelectedC] = useState<string | null>(null);
    const [dismissedAnns, setDismissedAnns] = useState<string[]>([]);

    // Filtered List
    const filtered = complaints
        .filter(c => filter === "All" || c.status === filter)
        .filter(c => c.issue.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status !== "Resolved" && c.status !== "Closed").length,
        resolved: complaints.filter(c => c.status === "Resolved").length,
    };

    // Latest 3 announcements, not dismissed by this citizen
    const visibleAnns = announcements
        .filter(a => !dismissedAnns.includes(a.id))
        .slice(0, 3);

    const TYPE_STYLE: Record<string, { bar: string; badge: string; icon: string }> = {
        Alert: { bar: "border-red-300 bg-red-50", badge: "bg-red-100 text-red-700", icon: "text-red-500" },
        Resolution: { bar: "border-emerald-200 bg-emerald-50", badge: "bg-emerald-100 text-emerald-700", icon: "text-emerald-500" },
        Event: { bar: "border-blue-200 bg-blue-50", badge: "bg-blue-100 text-blue-700", icon: "text-blue-500" },
        General: { bar: "border-gray-200 bg-gray-50", badge: "bg-gray-100 text-gray-600", icon: "text-gray-400" },
    };

    return (
        <DashboardLayout
            title="Citizen Portal"
            subtitle={`Welcome, ${currentUser?.name || 'Citizen'}. Managing your local governance interaction.`}
        >
            <div className="space-y-8 pb-10">

                {/* ── ANNOUNCEMENT NOTIFICATIONS ───────────────────────── */}
                {visibleAnns.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-[#B91C1C]" />
                                <span className="text-xs font-black uppercase tracking-widest text-white">Official Announcements</span>
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#B91C1C] text-white">{visibleAnns.length}</span>
                            </div>
                            <button
                                onClick={() => navigate("/announcements")}
                                className="text-[10px] font-black text-white/50 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-widest"
                            >
                                View All <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                        {visibleAnns.map(ann => {
                            const style = TYPE_STYLE[ann.type] ?? TYPE_STYLE.General;
                            return (
                                <div key={ann.id}
                                    onClick={() => navigate(`/announcements?id=${ann.id}`)}
                                    className={`rounded-2xl border p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-all ${style.bar} ${ann.type === "Alert" ? "animate-pulse-slow" : ""}`}
                                >
                                    <div className={`mt-0.5 shrink-0`}>
                                        {ann.type === "Alert" ? <AlertTriangle className={`w-4 h-4 ${style.icon}`} /> :
                                            ann.type === "Resolution" ? <CheckCircle2 className={`w-4 h-4 ${style.icon}`} /> :
                                                ann.type === "Event" ? <Calendar className={`w-4 h-4 ${style.icon}`} /> :
                                                    <Megaphone className={`w-4 h-4 ${style.icon}`} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${style.badge}`}>{ann.type}</span>
                                            <span className="text-[9px] text-gray-500 font-bold flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{ann.ward}</span>
                                            <span className="text-[9px] text-gray-400 font-bold">{ann.date}</span>
                                        </div>
                                        <p className="text-sm font-black text-gray-900 leading-snug">{ann.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ann.body}</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDismissedAnns(p => [...p, ann.id]); }}
                                        className="shrink-0 p-1 rounded-lg hover:bg-black/10 text-gray-400 transition-colors"
                                        title="Dismiss"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* ── Dashboard Quick Actions ────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Raise Button (Large) */}
                    <div onClick={() => navigate("/submit-complaint")}
                        className="lg:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-2xl flex items-center justify-between group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <div>
                            <h2 className="text-2xl font-black mb-1">Got a Problem?</h2>
                            <p className="text-emerald-50 text-sm font-medium opacity-80">Tap to report issues in your ward.</p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1.5 rounded-full">
                                <PlusCircle className="w-4 h-4" /> Raise Complaint
                            </div>
                        </div>
                        <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center p-5 group-hover:scale-110 transition-transform">
                            <PlusCircle className="w-full h-full text-white" />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-[2.5rem] p-7 border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-3 bg-blue-50 rounded-2xl"><MessageSquare className="w-5 h-5 text-blue-600" /></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reports</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Submitted</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-7 border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <div className="p-3 bg-amber-50 rounded-2xl"><Clock className="w-5 h-5 text-amber-600" /></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">{stats.pending}</p>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Currently Pending</p>
                        </div>
                    </div>
                </div>

                {/* ── Main Tracking Section ──────────────────────────── */}
                <div className="space-y-4">
                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Live Tracking Center
                        </h3>

                        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input type="text" placeholder="Search by ID or Issue..." value={search} onChange={e => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-transparent text-xs font-bold text-white focus:outline-none w-48" />
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <select value={filter} onChange={e => setFilter(e.target.value as any)}
                                className="bg-transparent text-white/70 text-xs font-black uppercase tracking-widest px-3 focus:outline-none">
                                <option value="All" className="bg-gray-900 text-white">All Status</option>
                                <option value="New" className="bg-gray-900 text-white">New</option>
                                <option value="Assigned" className="bg-gray-900 text-white">In Queue</option>
                                <option value="In Progress" className="bg-gray-900 text-white">In Progress</option>
                                <option value="Resolved" className="bg-gray-900 text-white">Resolved</option>
                            </select>
                        </div>
                    </div>

                    {/* Complaint Feed */}
                    {filtered.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-20 text-center">
                            <Shield className="w-16 h-16 text-white/10 mx-auto mb-6" />
                            <h4 className="text-xl font-black text-white/40 uppercase tracking-widest">No matching records</h4>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map(c => {
                                const isExp = selectedC === c.id;
                                const S = STATUS_CFG[c.status];
                                const SIcon = S.icon;
                                const sentimentLvl = c.sentiment ?? 65;

                                return (
                                    <div key={c.id} className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm transition-all overflow-hidden ${isExp ? 'ring-4 ring-emerald-400/20' : 'hover:shadow-xl'}`}>
                                        <div className="p-8">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                                {/* Left: Status Visual */}
                                                <div className={`w-14 h-14 rounded-[1.5rem] ${S.bg} flex items-center justify-center shrink-0 border border-gray-100`}>
                                                    <SIcon className={`w-6 h-6 ${S.color}`} />
                                                </div>

                                                {/* Body */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <span className="font-mono text-[10px] font-black text-[#B91C1C] bg-red-50 px-2 py-0.5 rounded-lg uppercase border border-red-100">{c.id}</span>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase ${PRIORITY_COLOR[c.priority]}`}>{c.priority}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.ward}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.time}</span>
                                                    </div>
                                                    <h4 className="text-xl font-black text-gray-900 group-hover:text-[#B91C1C] transition-colors truncate">{c.issue}</h4>

                                                    <ComplaintTimeline status={c.status} />
                                                </div>

                                                {/* Sentiment / Community Urgency */}
                                                <div className="hidden lg:block w-32 border-l border-gray-50 pl-6 shrink-0">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Community Pull</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 flex-1 bg-gray-50 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-400" style={{ width: `${sentimentLvl}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-emerald-600">{sentimentLvl}%</span>
                                                    </div>
                                                </div>

                                                {/* Expand Action */}
                                                <button onClick={() => setSelectedC(isExp ? null : c.id)}
                                                    className={`h-16 w-16 rounded-[2rem] border border-gray-100 flex items-center justify-center transition-all ${isExp ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-400'}`}>
                                                    {isExp ? <X className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                                                </button>
                                            </div>

                                            {/* Expanded Body: Officer Notes, Feedback, Proof */}
                                            {isExp && (
                                                <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-top-4">
                                                    {/* Left: Audit / Officer Updates */}
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <MessageCircle className="w-4 h-4 text-blue-500" />
                                                            <h5 className="text-xs font-black uppercase tracking-widest text-gray-900">Live Timeline & Updates</h5>
                                                        </div>
                                                        <div className="space-y-4 relative ml-3 border-l border-gray-100 pl-6">
                                                            {c.audit.map((a, i) => (
                                                                <div key={i} className="relative">
                                                                    <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-white border-2 border-gray-200" />
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">{a.time} · {a.actor}</p>
                                                                    <p className="text-[11px] font-black text-gray-700">{a.action}</p>
                                                                    {a.note && <div className="mt-2 p-3 bg-gray-50 rounded-xl text-[10px] italic text-gray-500 font-medium">"{a.note}"</div>}
                                                                    {a.image && (
                                                                        <div className="mt-2 w-28 aspect-video bg-gray-200 rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
                                                                            <img src={a.image} className="w-full h-full object-cover" alt="Proof" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Right: Actions / Evidence / Proof */}
                                                    <div className="space-y-8">
                                                        {/* Citizen Feedback (If Resolved) */}
                                                        {c.status === "Resolved" && (
                                                            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-4 text-center">Rate the Resolution</h5>
                                                                <div className="flex items-center justify-center gap-3">
                                                                    {[1, 2, 3, 4, 5].map(star => (
                                                                        <button key={star} onClick={() => rateComplaint(c.id, star)}
                                                                            className={`w-10 h-10 flex items-center justify-center transition-all ${c.rating && c.rating >= star ? 'scale-110' : 'opacity-30 hover:opacity-100'}`}>
                                                                            <Star className={`w-6 h-6 ${c.rating && c.rating >= star ? 'fill-emerald-500 text-emerald-500' : 'text-gray-400'}`} />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <p className="text-[10px] text-center text-emerald-600 font-bold mt-4 uppercase">Your feedback helps us improve governance</p>
                                                            </div>
                                                        )}

                                                        {/* Evidence / Resolution Proof */}
                                                        <div>
                                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-50 pb-2">Evidence & Verification</h5>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {/* Submit Evidence */}
                                                                <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-2">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase">My Submission</p>
                                                                    <div className="aspect-square bg-white rounded-xl flex items-center justify-center italic text-[10px] text-gray-300">
                                                                        {c.evidence && c.evidence.length > 0 ? <ImageIcon className="w-6 h-6" /> : "No Media"}
                                                                    </div>
                                                                </div>
                                                                {/* Officer Proof */}
                                                                <div className="p-4 bg-emerald-50 rounded-2xl flex flex-col gap-2">
                                                                    <p className="text-[9px] font-black text-emerald-600 uppercase">Resolution Proof</p>
                                                                    <div className="aspect-square bg-white rounded-xl flex items-center justify-center italic text-[10px] text-gray-300 font-bold overflow-hidden">
                                                                        {c.resolutionProof ? <img src={c.resolutionProof} className="w-full h-full object-cover" /> : "Awaiting Verification"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* REOPEN ACTION */}
                                                        {c.status === "Resolved" || c.status === "Closed" ? (
                                                            <div className="p-6 border-2 border-dashed border-red-100 rounded-[2rem] flex flex-col gap-4 text-center">
                                                                <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Still have a problem?</p>
                                                                <button onClick={() => reopenComplaint(c.id, "Citizen reopened: Issue persists")}
                                                                    className="w-full py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-100 flex items-center justify-center gap-2 group active:scale-95 transition-all">
                                                                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                                                    Reopen Case
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="p-6 bg-gray-50 rounded-[2rem] flex items-center gap-4 border border-gray-100">
                                                                <Info className="w-6 h-6 text-blue-500" />
                                                                <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase">Assigning an regular officer will expedite the resolution process.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Alerts & Notifications Panel ──────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Security Alert Opt-in */}
                    <div className="lg:col-span-2 bg-[#111821] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px]" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-black mb-1">Live Notifications</h3>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-6">Secured G-SMS Protocol</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center"><Phone className="w-4 h-4 text-emerald-400" /></div>
                                        <div>
                                            <p className="text-xs font-black">SMS Alerts</p>
                                            <p className="text-[9px] text-white/40">Immediate action pings</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1 cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                                    </div>
                                </div>
                                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center"><Mail className="w-4 h-4 text-blue-400" /></div>
                                        <div>
                                            <p className="text-xs font-black">Email Updates</p>
                                            <p className="text-[9px] text-white/40">Weekly summary reports</p>
                                        </div>
                                    </div>
                                    <div className="w-12 h-6 bg-gray-700/50 rounded-full flex items-center justify-start px-1 cursor-pointer">
                                        <div className="w-4 h-4 bg-white/20 rounded-full shadow-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6"><Shield className="w-6 h-6 text-gray-900" /></div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">Citizen Support</h4>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">Need help with your report? Our artificial intelligence is available 24/7 to assist with your queries.</p>
                        <button className="mt-auto flex items-center justify-center gap-2 py-4 bg-gray-900 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-[#B91C1C] transition-all">
                            Ask AI Assistant <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {/* Citizen Strategic Manual HUD */}
                <div className="bg-white border border-gray-100 rounded-[3.5rem] p-16 shadow-sm relative overflow-hidden group/manual mt-12">
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-500/5 blur-[150px] pointer-events-none group-hover/manual:bg-[#B91C1C]/10 transition-all duration-1000" />
                    
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col items-center text-center mb-16 space-y-4">
                            <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-emerald-100 shadow-sm">
                                <Shield className="w-3.5 h-3.5" /> Citizen Engagement Protocol v1.0
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Citizen Strategic Manual</h2>
                            <p className="text-xs text-gray-400 font-black uppercase tracking-[0.3em] max-w-sm">Official Guidelines for Ward-Level Governance Interaction</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                            {[
                                { 
                                    step: "01", 
                                    title: "Grievance Draft", 
                                    desc: "Initiate reporting via the 'Raise Complaint' console. Ensure high-resolution evidence is attached.",
                                    icon: PlusCircle
                                },
                                { 
                                    step: "02", 
                                    title: "Neural Triage", 
                                    desc: "GovPilot AI auto-routes your request to the relevant department (Water, Waste, Roads, etc.)",
                                    icon: Zap
                                },
                                { 
                                    step: "03", 
                                    title: "Field Deployment", 
                                    desc: "Monitor the 'Live Tracking' bar. A blue pulse indicates a Field Officer has been dispatched.",
                                    icon: MapPin
                                },
                                { 
                                    step: "04", 
                                    title: "Verification", 
                                    desc: "Once resolved, verify the 'Resolution Proof' and provide feedback to finalize the governance cycle.",
                                    icon: CheckCircle2
                                },
                            ].map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div key={i} className="space-y-6 group/step">
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl font-black text-gray-900/5 italic tracking-tighter group-hover/step:text-emerald-500/10 transition-colors uppercase">{s.step}</div>
                                            <div className="h-px bg-gray-100 flex-1" />
                                            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover/step:bg-emerald-500/5 group-hover/step:border-emerald-500/20 transition-all">
                                                <Icon className="w-5 h-5 text-gray-300 group-hover/step:text-emerald-600" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter group-hover/step:text-emerald-600 transition-colors italic">{s.title}</h4>
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
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 italic">Submission Status</p>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Gov-Protocol Synchronized</p>
                                </div>
                            </div>
                            <button className="px-10 py-5 bg-gray-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-emerald-600 transition-all shadow-2xl shadow-gray-950/20 active:scale-95">
                                Print Operation Manifest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
