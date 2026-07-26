import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { 
    CheckCircle2, Clock, MapPin, Phone, 
    Camera, Sparkles, Navigation,
    Search, Loader2, Play, Activity,
    X, Mic, Volume2
} from "lucide-react";
import type { Complaint } from "@/services/api";
import type { Status } from "@/store/complaintsStore";

type VoiceFilterTab = "New" | "Assigned" | "In Progress" | "Resolved" | "All";

export default function FieldPortal() {
    const { complaints, currentUser, updateStatus } = useComplaints();
    const [filterTab, setFilterTab] = useState<VoiceFilterTab>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [proofNote, setProofNote] = useState("");
    const [proofImg, setProofImg] = useState<string | null>(null);
    const [showAllDepts, setShowAllDepts] = useState(false);

    // ── Only show VOICE complaints ────────────────────────────────
    const voiceComplaints = useMemo(() => {
        return complaints.filter(c => {
            const isVoice = (c as any).source === "voice" || 
                            c.citizen === "Voice User" || 
                            c.notifPref === "None" && c.location === "From Voice Portal";
            if (!isVoice) return false;

            const matchesRole = currentUser?.role === "admin" || showAllDepts
                || c.dept === currentUser?.dept
                || (!c.dept || c.dept === "");

            const matchesTab = (() => {
                if (filterTab === "All") return true;
                if (filterTab === "New") return c.status === "Pending";
                if (filterTab === "Assigned") return c.status === "Assigned";
                if (filterTab === "In Progress") return c.status === "In Progress";
                if (filterTab === "Resolved") return c.status === "Resolved" || c.status === "Closed";
                return true;
            })();

            const matchesSearch = c.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.ward.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesRole && matchesTab && matchesSearch;
        });
    }, [complaints, currentUser, filterTab, searchQuery, showAllDepts]);

    const newCount = useMemo(() => complaints.filter(c => (c as any).source === "voice" || c.citizen === "Voice User").filter(c => c.status === "Pending").length, [complaints]);

    const handleStatusUpdate = async (id: string, nextStatus: Status, note: string) => {
        setIsUpdating(true);
        await new Promise(r => setTimeout(r, 1500));
        updateStatus(id, nextStatus, note, proofImg || undefined);
        setIsUpdating(false);
        setSelectedTask(null);
        setProofNote("");
        setProofImg(null);
    };

    const handleCapture = () => {
        const demoImgs = [
            "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1581094288338-2314dddb7bc3?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1590060417631-017606e30907?auto=format&fit=crop&q=80&w=800"
        ];
        setProofImg(demoImgs[Math.floor(Math.random() * demoImgs.length)]);
    };

    const TABS: { key: VoiceFilterTab; label: string }[] = [
        { key: "New", label: "NEW" },
        { key: "Assigned", label: "ASSIGNED" },
        { key: "In Progress", label: "IN PROGRESS" },
        { key: "Resolved", label: "RESOLVED" },
        { key: "All", label: "ALL" },
    ];

    return (
        <DashboardLayout 
            title="Field Officer Portal" 
            subtitle="Managing Voice Assistant Tasks (Uneducated Citizens Portal)"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ── Left Side: Voice Complaint List ── */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Top Control Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white rounded-full text-xs font-bold text-gray-900 focus:outline-none shadow-sm"
                            />
                        </div>
                        
                        {/* Dept Console Button */}
                        <button 
                            onClick={() => setShowAllDepts(!showAllDepts)}
                            className="flex items-center gap-2 px-5 py-3 bg-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <Activity className="w-3.5 h-3.5" />
                            DEPT CONSOLE
                        </button>

                        {/* Filter Tabs */}
                        {TABS.map(tab => {
                            const isAll = tab.key === "All";
                            const isActive = filterTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilterTab(tab.key)}
                                    className={`px-5 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 ${
                                        isActive || isAll 
                                            ? "bg-[#B91C1C] text-white" 
                                            : "bg-white text-gray-500 hover:text-gray-900"
                                    }`}
                                >
                                    {tab.label}
                                    {tab.key === "New" && (
                                        <div className="w-2 h-2 rounded-full bg-red-200" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Task List */}
                    <div className="space-y-4">
                        {voiceComplaints.length === 0 ? (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] p-20 text-center">
                                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center mx-auto mb-4">
                                    <Volume2 className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-white font-black uppercase tracking-[0.2em] text-sm">No voice complaints found</p>
                            </div>
                        ) : (
                            voiceComplaints.map(task => (
                                <div 
                                    key={task.id}
                                    className={`bg-white transition-all cursor-pointer rounded-[2rem] p-6 hover:translate-x-1 group/card shadow-sm ${
                                        selectedTask?.id === task.id ? "ring-4 ring-purple-500/20" : ""
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div className="flex-1 min-w-0" onClick={() => setSelectedTask(task)}>
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                {/* ID Tag */}
                                                <span className="text-[10px] font-black text-red-500 px-3 py-1.5 bg-red-50 rounded-full tracking-widest">
                                                    {task.id}
                                                </span>
                                                {/* Status Tag */}
                                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                                                    task.status === "Pending" ? "bg-purple-100 text-purple-600" :
                                                    task.status === "In Progress" ? "bg-amber-100 text-amber-600" :
                                                    "bg-gray-100 text-gray-600"
                                                }`}>
                                                    {task.status === "Pending" ? "NEW" : task.status}
                                                </span>
                                                {/* Live Tag */}
                                                <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">LIVE</span>
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-xl font-black text-gray-900 mb-4">{task.issue}</h3>
                                            
                                            <div className="flex items-center gap-6 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-red-500" /> {task.ward}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-300" /> {task.time}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Action Side Buttons */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            {task.status === "Pending" ? (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusUpdate(task.id, "Accepted", "Complaint accepted by field officer.");
                                                    }}
                                                    className="px-6 py-3.5 rounded-2xl bg-[#a855f7] hover:bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/30 transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> ACCEPT
                                                </button>
                                            ) : task.status === "Assigned" || task.status === "In Progress" ? (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTask(task);
                                                    }}
                                                    className="px-6 py-3.5 rounded-2xl bg-[#B91C1C] hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> RESOLVE
                                                </button>
                                            ) : null}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                                                className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-900"
                                            >
                                                <Navigation className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── Right Side: Task Execution ── */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-6">
                        {selectedTask ? (
                            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-500">
                                <div className="bg-gray-900 p-8 text-white relative">
                                    <button 
                                        onClick={() => setSelectedTask(null)}
                                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mic className="w-4 h-4 text-purple-400" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-300">Voice Complaint Console</p>
                                    </div>
                                    <h2 className="text-2xl font-black leading-tight mb-4">{selectedTask.issue}</h2>
                                    <div className="flex items-center gap-4">
                                        <a href={`tel:${selectedTask.phone}`} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-black border border-white/10 hover:bg-white/20 transition-all">
                                            <Phone className="w-3.5 h-3.5" /> Call Citizen
                                        </a>
                                        <button className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-black border border-white/10 hover:bg-white/20 transition-all">
                                            <Navigation className="w-3.5 h-3.5" /> Navigate
                                        </button>
                                    </div>
                                </div>

                                {/* Voice transcript preview */}
                                {selectedTask.description && (
                                    <div className="mx-6 mt-6 bg-purple-50 border border-purple-100 rounded-3xl p-5 flex gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center shrink-0">
                                            <Volume2 className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-purple-700 mb-1">Voice Transcript</p>
                                            <p className="text-sm font-bold text-purple-800 leading-relaxed line-clamp-3">{selectedTask.description}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="p-8 space-y-8">
                                    {/* AI Insight */}
                                    <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 flex gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">Field Intelligence</p>
                                            <p className="text-sm font-bold text-amber-800 leading-relaxed">Based on the voice complaint, prioritize safety checks before proceeding with repair.</p>
                                        </div>
                                    </div>

                                    {/* Action Form */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">1. Capture Proof (Before/After)</label>
                                            {proofImg ? (
                                                <div className="relative aspect-video rounded-3xl overflow-hidden group">
                                                    <img src={proofImg} alt="Proof" className="w-full h-full object-cover" />
                                                    <button 
                                                        onClick={() => setProofImg(null)}
                                                        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={handleCapture}
                                                    className="w-full aspect-video border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-[#B91C1C]/20 transition-all group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Camera className="w-6 h-6 text-gray-300 group-hover:text-[#B91C1C]" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Open Field Camera</p>
                                                </button>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">2. Resolution Summary</label>
                                            <textarea 
                                                rows={4}
                                                value={proofNote}
                                                onChange={e => setProofNote(e.target.value)}
                                                placeholder="What action was taken? (e.g. Pipe welded and pressure tested)"
                                                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-3xl text-sm font-bold focus:bg-white focus:border-red-200 outline-none transition-all resize-none shadow-inner"
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            {selectedTask.status === "Pending" && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(selectedTask.id, "Accepted", "Complaint accepted by field officer")}
                                                    disabled={isUpdating}
                                                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl bg-[#B91C1C] hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                    Accept
                                                </button>
                                            )}
                                            {selectedTask.status === "Assigned" && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(selectedTask.id, "In Progress", "Officer started work on-site")}
                                                    disabled={isUpdating}
                                                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-200 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                                    Start Work
                                                </button>
                                            )}
                                            {(selectedTask.status === "Assigned" || selectedTask.status === "In Progress" || selectedTask.status === "Accepted") && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(selectedTask.id, "Resolved", proofNote || "Resolved on-site by officer")}
                                                    disabled={isUpdating || !proofImg}
                                                    className="flex-[2] flex items-center justify-center gap-3 py-4 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                    Mark Resolved
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-[3rem] p-12 text-center">
                                <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Mic className="w-8 h-8 text-purple-400/40" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">No Selection</h3>
                                <p className="text-xs text-white/40 leading-relaxed uppercase font-bold tracking-widest">Select a voice complaint to start field operations.</p>
                            </div>
                        )}

                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-[#B91C1C]/40 to-red-900/40 backdrop-blur-md border border-red-500/20 rounded-[3rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-red-500/20 transition-all" />
                            <div className="flex items-center justify-between mb-8 relative">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Voice Complaints</p>
                                    <p className="text-3xl font-black tabular-nums">
                                        {complaints.filter(c => (c as any).source === "voice" || c.citizen === "Voice User").length}
                                        <span className="text-sm font-bold opacity-50 ml-2">Total</span>
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-3xl bg-purple-500/20 flex items-center justify-center border border-purple-500/20">
                                    <Mic className="w-8 h-8 text-purple-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-4 relative">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/5 rounded-2xl p-3 text-center">
                                        <p className="text-2xl font-black tabular-nums text-yellow-400">{newCount}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">New</p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-3 text-center">
                                        <p className="text-2xl font-black tabular-nums text-emerald-400">
                                            {complaints.filter(c => ((c as any).source === "voice" || c.citizen === "Voice User") && c.status === "Resolved").length}
                                        </p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-1">Resolved</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/60 font-medium leading-relaxed italic">"Citizens can now file complaints in their own language via voice."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
