import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { 
    CheckCircle2, Clock, MapPin, Phone, 
    Camera, Sparkles, Navigation,
    Search, Loader2, Play, Activity,
    AlertCircle, X
} from "lucide-react";
import type { Complaint, Status } from "@/store/complaintsStore";

export default function FieldPortal() {
    const { complaints, currentUser, updateStatus, assignComplaint } = useComplaints();
    const [filterStatus, setFilterStatus] = useState<Status | "All">("New");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [proofNote, setProofNote] = useState("");
    const [proofImg, setProofImg] = useState<string | null>(null);
    const [showAllDepts, setShowAllDepts] = useState(false);

    // Filter complaints for this officer and department
    const myTasks = useMemo(() => {
        return complaints.filter(c => {
            const matchesRole = currentUser?.role === "admin" || showAllDepts || c.dept === currentUser?.dept;
            const matchesStatus = filterStatus === "All" || c.status === filterStatus;
            const matchesSearch = c.issue.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 c.ward.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesRole && matchesStatus && matchesSearch;
        });
    }, [complaints, currentUser, filterStatus, searchQuery]);

    const handleStatusUpdate = async (id: string, nextStatus: Status, note: string) => {
        setIsUpdating(true);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 1500));
        updateStatus(id, nextStatus, note, proofImg || undefined);
        setIsUpdating(false);
        setSelectedTask(null);
        setProofNote("");
        setProofImg(null);
    };

    const handleCapture = () => {
        // Demo: select a random resolution image
        const demoImgs = [
            "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1581094288338-2314dddb7bc3?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1590060417631-017606e30907?auto=format&fit=crop&q=80&w=800"
        ];
        setProofImg(demoImgs[Math.floor(Math.random() * demoImgs.length)]);
    };

    return (
        <DashboardLayout 
            title="Field Officer Portal" 
            subtitle={`Managing tasks for ${currentUser?.dept || "General Operations"}`}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ── Left Side: Task List ── */}
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input 
                                type="text"
                                placeholder="Search tasks by ID or location..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-transparent rounded-2xl text-sm font-bold text-white focus:bg-white/10 focus:border-white/20 focus:outline-none transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => setShowAllDepts(!showAllDepts)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                                showAllDepts 
                                    ? "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-900/20" 
                                    : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                            }`}
                        >
                            <Activity className="w-3 h-3" />
                            {showAllDepts ? "Global View ON" : "Dept View"}
                        </button>
                        
                        <div className="flex gap-2 flex-wrap">
                            {(["New", "Assigned", "In Progress", "Resolved", "All"] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                        filterStatus === s 
                                            ? "bg-[#B91C1C] text-white shadow-lg shadow-red-900/40" 
                                            : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                                    }`}
                                >
                                    {s} {s === "New" && complaints.filter(c => c.status === "New" && (currentUser?.role === "admin" || showAllDepts || c.dept === currentUser?.dept)).length > 0 && (
                                        <span className="ml-1.5 w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-4">
                        {myTasks.length === 0 ? (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] p-20 text-center">
                                <Clock className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <p className="text-white/40 font-black uppercase tracking-[0.2em]">No tasks found</p>
                            </div>
                        ) : (
                            myTasks.map(task => (
                                <div 
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className={`bg-white/5 border transition-all cursor-pointer rounded-[2rem] p-6 hover:translate-x-1 ${
                                        selectedTask?.id === task.id 
                                            ? "border-[#B91C1C] bg-white/10 shadow-2xl shadow-red-900/20" 
                                            : "border-white/10 hover:bg-white/10"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="font-mono text-sm font-black text-[#B91C1C] px-2 py-0.5 bg-red-900/20 rounded-md border border-red-900/30">
                                                    {task.id}
                                                </span>
                                                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                                    task.status === "New" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                                                    task.status === "Assigned" ? "bg-blue-500/20 text-blue-400" :
                                                    task.status === "In Progress" ? "bg-amber-500/20 text-amber-400" :
                                                    "bg-emerald-500/20 text-emerald-400"
                                                }`}>
                                                    {task.status}
                                                </span>
                                                <span className="text-xs font-black px-2.5 py-1 rounded-md bg-emerald-900/40 text-emerald-400 border border-emerald-900/50 flex items-center gap-1.5">
                                                    <Activity className="w-3 h-3" /> ONLINE
                                                </span>
                                                <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                                                    task.priority === "High" ? "bg-red-500 text-white" :
                                                    task.priority === "Medium" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                                                }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-white mb-2">{task.issue}</h3>
                                            <div className="flex items-center gap-4 text-white/50 text-xs font-bold">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-[#B91C1C]" /> {task.ward}
                                                </div>
                                                <div className="flex items-center gap-2 text-white/60">
                                                    <Clock className="w-4 h-4" /> Filed {task.time}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-[#B91C1C]/10 transition-colors">
                                            <Navigation className="w-6 h-6 text-white/20 group-hover:text-[#B91C1C]" />
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
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Resolution Console</p>
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

                                <div className="p-8 space-y-8">
                                    {/* AI Insight */}
                                    <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 flex gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">Field Intelligence</p>
                                            <p className="text-sm font-bold text-amber-800 leading-relaxed">Based on sensors, this issue might require extra insulation due to moisture.</p>
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
                                            {selectedTask.status === "New" && (
                                                <button 
                                                    onClick={() => {
                                                        if (currentUser?.dept) {
                                                            assignComplaint(selectedTask.id, currentUser.dept, currentUser.name || "Officer");
                                                            setSelectedTask(prev => prev ? { ...prev, status: "Assigned" as Status } : null);
                                                        }
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-200 transition-all active:scale-95"
                                                >
                                                    <Play className="w-5 h-5 rotate-90" />
                                                    Take Ownership
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
                                            {(selectedTask.status === "Assigned" || selectedTask.status === "In Progress") && (
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
                                <AlertCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">No Selection</h3>
                                <p className="text-xs text-white/40 leading-relaxed uppercase font-bold tracking-widest">Select a task from the list to start field operations.</p>
                            </div>
                        )}

                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-[#B91C1C]/40 to-red-900/40 backdrop-blur-md border border-red-500/20 rounded-[3rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-red-500/20 transition-all" />
                            <div className="flex items-center justify-between mb-8 relative">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Quick Insight</p>
                                    <p className="text-3xl font-black tabular-nums">
                                        {complaints.filter(c => c.status === "New" && (currentUser?.role === "admin" || c.dept === currentUser?.dept)).length}
                                        <span className="text-sm font-bold opacity-50 ml-2">New Online</span>
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-3xl bg-white/10 flex items-center justify-center border border-white/20">
                                    <Activity className="w-8 h-8 text-white animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-4 relative">
                                <div className="flex justify-between items-end">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Response Readiness</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest">Active</p>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[100%] rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
                                </div>
                                <p className="text-[10px] text-white/60 font-medium leading-relaxed italic">"Officers are notified instantly when a citizen files a report online."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
