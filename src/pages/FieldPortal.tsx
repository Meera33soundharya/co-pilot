import { useState, useMemo, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { useSearchParams } from "react-router-dom";
import { 
    CheckCircle2, Clock, MapPin, Phone, 
    Camera, Sparkles, Navigation,
    Search, Loader2, Play, Activity,
    AlertCircle, X, FileText, Paperclip, Video
} from "lucide-react";
import type { Complaint, Status } from "@/store/complaintsStore";

export default function FieldPortal() {
    const { complaints, currentUser, updateStatus, assignComplaint } = useComplaints();
    const [searchParams] = useSearchParams();
    const [filterStatus, setFilterStatus] = useState<Status | "All">(
        (searchParams.get("status") as Status) || "All"
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [proofNote, setProofNote] = useState("");
    const [proofImg, setProofImg] = useState<string | null>(null);
    const [supportingDocs, setSupportingDocs] = useState<string[]>([]);
    const [showAllDepts, setShowAllDepts] = useState(false);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    // Filter complaints for this officer and department
    const myTasks = useMemo(() => {
        return complaints.filter(c => {
            const matchesRole = currentUser?.role === "admin" || showAllDepts || c.dept === currentUser?.dept;
            const matchesStatus = filterStatus === "All" || c.status === filterStatus;
            const matchesSearch = c.issue.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 c.ward.toLowerCase().includes(searchQuery.toLowerCase());

            // User Requirement: ONLY show Voice Assistant complaints in the Field Portal
            if (c.source !== "voice") return false;

            return matchesRole && matchesStatus && matchesSearch;
        });
    }, [complaints, currentUser, filterStatus, searchQuery, showAllDepts]);

    const handleStatusUpdate = async (id: string, nextStatus: Status, note: string) => {
        setIsUpdating(true);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 1500));
        updateStatus(id, nextStatus, note, proofImg || undefined, supportingDocs);
        setIsUpdating(false);
        setSelectedTask(null);
        setProofNote("");
        setProofImg(null);
        setSupportingDocs([]);
    };

    const handleCapture = () => {
        cameraInputRef.current?.click();
    };

    const handleCameraFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = () => {
            setProofImg(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        // Reset so same file can be re-selected if needed
        e.target.value = "";
    };

    const handleUploadDoc = () => {
        docInputRef.current?.click();
    };

    const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64Url = reader.result as string;
                setSupportingDocs(prev => {
                    const currentNames = new Set(prev.map(url => {
                        const match = url.match(/#name=([^&]+)/);
                        return match ? decodeURIComponent(match[1]) : "";
                    }));
                    if (!currentNames.has(file.name)) {
                        return [...prev, `${base64Url}#name=${encodeURIComponent(file.name)}&type=${encodeURIComponent(file.type)}`];
                    }
                    return prev;
                });
            };
            reader.readAsDataURL(file);
        }
        e.target.value = "";
    };

    return (
        <DashboardLayout 
            title="Field Officer Portal" 
            subtitle="Managing Voice Assistant Tasks (Uneducated Citizens Portal)"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ── Left Side: Task List ── */}
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search tasks by ID or location..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-bold text-gray-700 focus:bg-white focus:border-[#B91C1C]/30 focus:ring-2 focus:ring-[#B91C1C]/10 focus:outline-none transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => setShowAllDepts(!showAllDepts)}
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all border shrink-0 shadow-sm ${
                                showAllDepts 
                                    ? "bg-amber-500 text-white border-amber-400 shadow-xl shadow-amber-900/20 scale-105" 
                                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600"
                            }`}
                        >
                            <Activity className={`w-3.5 h-3.5 ${showAllDepts ? "animate-pulse" : ""}`} />
                            {showAllDepts ? "Global Intelligence" : "Dept Console"}
                        </button>
                        
                        <div className="flex gap-2.5 flex-wrap">
                            {(["New", "Assigned", "In Progress", "Resolved", "All"] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all border duration-300 ${
                                        filterStatus === s 
                                            ? "bg-[#B91C1C] text-white border-[#B91C1C] shadow-lg shadow-red-900/20 scale-105" 
                                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-red-50 hover:text-[#B91C1C] hover:border-red-100"
                                    }`}
                                >
                                    {s} 
                                    {s === "New" && complaints.filter(c => c.status === "New" && (currentUser?.role === "admin" || showAllDepts || c.dept === currentUser?.dept)).length > 0 && (
                                        <span className="ml-2 w-1.5 h-1.5 rounded-full bg-[#B91C1C] animate-ping inline-block" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-4">
                        {myTasks.length === 0 ? (
                            <div className="bg-white border border-dashed border-gray-200 rounded-[2.5rem] p-20 text-center shadow-sm">
                                <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-black uppercase tracking-[0.2em]">No tasks found</p>
                            </div>
                        ) : (
                            myTasks.map(task => (
                                    <div 
                                        key={task.id}
                                        className={`bg-white border transition-all cursor-pointer rounded-[2.5rem] p-8 hover:translate-x-1 group/card shadow-sm ${
                                            selectedTask?.id === task.id 
                                                ? "border-[#B91C1C] shadow-xl shadow-red-900/10 ring-2 ring-[#B91C1C]/20" 
                                                : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                                        }`}
                                    >
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div className="flex-1 min-w-0" onClick={() => setSelectedTask(task)}>
                                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                    <span className="font-mono text-sm font-black text-[#B91C1C] px-2.5 py-1 bg-red-50 rounded-lg border border-red-100 tracking-widest">
                                                        {task.id}
                                                    </span>
                                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] ${
                                                        task.status === "New" ? "bg-purple-50 text-purple-600 border border-purple-100" :
                                                        task.status === "Assigned" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                        task.status === "In Progress" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                        "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                    }`}>
                                                        {task.status}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                                                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight group-hover/card:text-[#B91C1C] transition-colors">{task.issue}</h3>
                                                <div className="flex items-center gap-6 text-gray-400 text-sm font-black uppercase tracking-widest">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-[#B91C1C]" /> {task.ward}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-gray-300" /> {task.time}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Action Side Buttons */}
                                            <div className="flex items-center gap-3 shrink-0">
                                                {task.status === "New" && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (currentUser?.dept) assignComplaint(task.id, currentUser.dept, currentUser.name || "Officer");
                                                        }}
                                                        className="h-14 px-8 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-purple-900/20 transition-all active:scale-95 flex items-center gap-2"
                                                    >
                                                        <Play className="w-4 h-4 rotate-90" /> Accept
                                                    </button>
                                                )}
                                                {task.status === "Assigned" && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusUpdate(task.id, "In Progress", "Strategic deployment started.");
                                                        }}
                                                        className="h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-amber-900/20 transition-all active:scale-95 flex items-center gap-2"
                                                    >
                                                        <Play className="w-4 h-4" /> Start
                                                    </button>
                                                )}
                                                {task.status === "In Progress" && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTask(task);
                                                            // Scrolling to proof section logic could go here
                                                        }}
                                                        className="h-14 px-8 rounded-2xl bg-[#B91C1C] hover:bg-red-600 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-red-900/30 transition-all active:scale-95 flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" /> Resolve
                                                    </button>
                                                )}
                                                {task.status === "Pending Verification" && (
                                                    <span className="h-14 px-6 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" /> Pending Admin
                                                    </span>
                                                )}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                                                    className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all text-gray-400 hover:text-[#B91C1C]"
                                                >
                                                    <Navigation className="w-6 h-6" />
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
                                    <p className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-2">Resolution Console</p>
                                    <h2 className="text-2xl font-black leading-tight mb-4">{selectedTask.issue}</h2>
                                    <div className="flex items-center gap-4">
                                        <a href={`tel:${selectedTask.phone}`} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-base font-black border border-white/10 hover:bg-white/20 transition-all">
                                            <Phone className="w-3.5 h-3.5" /> Call Citizen
                                        </a>
                                        <button className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-base font-black border border-white/10 hover:bg-white/20 transition-all">
                                            <Navigation className="w-3.5 h-3.5" /> Navigate
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* 📎 Citizen Evidence Section */}
                                    {selectedTask.evidence && selectedTask.evidence.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Citizen Evidence Assets</p>
                                                <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">Secure Signal</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                {selectedTask.evidence.map((rawUrl, idx) => {
                                                    const [url, meta] = rawUrl.split('#');
                                                    const metaParsed = new URLSearchParams(meta || "");
                                                    const name = metaParsed.get("name") || `Evidence_${idx + 1}`;
                                                    const type = metaParsed.get("type") || "";
                                                    
                                                    const isAudio = type.includes('audio') || url.endsWith('.mp3') || url.endsWith('.wav') || url.startsWith('blob:audio');
                                                    const isVideo = type.includes('video') || url.endsWith('.mp4');
                                                    const isImage = type.includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                                    const isDoc   = type.includes('pdf') || type.includes('word') || type.includes('sheet') || url.match(/\.(pdf|docx|xlsx)$/i);

                                                    return (
                                                        <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden group relative aspect-video">
                                                            {isImage ? (
                                                                <img src={url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            ) : isAudio ? (
                                                                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-amber-600">
                                                                    <Activity className="w-5 h-5 mb-2 animate-pulse" />
                                                                    <audio src={url} controls className="w-full h-6 scale-90" />
                                                                </div>
                                                            ) : isDoc ? (
                                                                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-blue-500">
                                                                    <FileText className="w-5 h-5 mb-1" />
                                                                    <span className="text-[8px] font-black uppercase truncate w-full text-center px-1">{name}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-gray-400">
                                                                    <Paperclip className="w-5 h-5 mb-1" />
                                                                    <span className="text-[8px] font-black uppercase">Unknown Node</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl text-gray-900 shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                                                                    <Search className="w-4 h-4" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Insight */}
                                    <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 flex gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-base font-black uppercase tracking-widest text-amber-700 mb-1">Field Intelligence</p>
                                            <p className="text-lg font-bold text-amber-800 leading-relaxed">Based on sensors, this issue might require extra insulation due to moisture.</p>
                                        </div>
                                    </div>

                                    {/* Action Form */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-base font-black uppercase tracking-widest text-gray-400 mb-3 block">1. Capture Proof (Before/After)</label>
                                            <input
                                                ref={cameraInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleCameraFileChange}
                                            />
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
                                                    className="w-full aspect-video border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-red-50 hover:border-[#B91C1C]/30 transition-all group cursor-pointer"
                                                >
                                                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#B91C1C] transition-all">
                                                        <Camera className="w-7 h-7 text-[#B91C1C] group-hover:text-white transition-colors" />
                                                    </div>
                                                    <p className="text-sm font-black uppercase tracking-widest text-gray-500 group-hover:text-[#B91C1C] transition-colors">Tap to Capture / Upload Photo</p>
                                                    <p className="text-xs text-gray-400 font-medium">Supports JPG, PNG, WEBP</p>
                                                </button>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-base font-black uppercase tracking-widest text-gray-400 mb-3 block">2. Resolution Summary</label>
                                            <textarea 
                                                rows={4}
                                                value={proofNote}
                                                onChange={e => setProofNote(e.target.value)}
                                                placeholder="What action was taken? (e.g. Pipe welded and pressure tested)"
                                                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-3xl text-lg font-bold focus:bg-white focus:border-red-200 outline-none transition-all resize-none shadow-inner"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-base font-black uppercase tracking-widest text-gray-400 mb-3 block">3. Supporting Documents (Optional)</label>
                                            <div className="flex flex-wrap gap-3 mb-3">
                                                {supportingDocs.map((doc, idx) => {
                                                    const name = new URLSearchParams(doc.split('#')[1] || "").get("name") || `Doc_${idx+1}`;
                                                    return (
                                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
                                                            <FileText className="w-4 h-4 text-blue-500" />
                                                            <span className="text-xs font-bold text-blue-700">{name}</span>
                                                            <button onClick={() => setSupportingDocs(docs => docs.filter((_, i) => i !== idx))} className="ml-2 text-blue-400 hover:text-blue-700">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {/* Hidden file input for documents */}
                                            <input
                                                ref={docInputRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleDocFileChange}
                                            />
                                            <button 
                                                onClick={handleUploadDoc}
                                                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 font-bold uppercase tracking-widest text-sm transition-all"
                                            >
                                                <Paperclip className="w-4 h-4" /> Attach Documents
                                            </button>
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
                                                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl bg-purple-600 hover:bg-purple-700 text-white text-base font-black uppercase tracking-widest shadow-xl shadow-purple-200 transition-all active:scale-95"
                                                >
                                                    <Play className="w-5 h-5 rotate-90" />
                                                    Take Ownership
                                                </button>
                                            )}
                                            {selectedTask.status === "Assigned" && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(selectedTask.id, "In Progress", "Officer started work on-site")}
                                                    disabled={isUpdating}
                                                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-3xl bg-amber-500 hover:bg-amber-600 text-white text-base font-black uppercase tracking-widest shadow-xl shadow-amber-200 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                                    Start Work
                                                </button>
                                            )}
                                            {(selectedTask.status === "Assigned" || selectedTask.status === "In Progress") && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(selectedTask.id, "Pending Verification", proofNote || "Resolved on-site by officer")}
                                                    disabled={isUpdating || !proofNote}
                                                    className="flex-[2] flex items-center justify-center gap-3 py-4 rounded-3xl bg-[#B91C1C] hover:bg-red-700 text-white text-base font-black uppercase tracking-widest shadow-xl shadow-red-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                    Submit for Verification
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-dashed border-gray-200 rounded-[3rem] p-12 text-center shadow-sm">
                                <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-black text-gray-700 mb-2 uppercase tracking-wide">No Selection</h3>
                                <p className="text-base text-gray-400 leading-relaxed uppercase font-bold tracking-widest">Select a task from the list to start field operations.</p>
                            </div>
                        )}

                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-[#B91C1C]/40 to-red-900/40 backdrop-blur-md border border-red-500/20 rounded-[3rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-red-500/20 transition-all" />
                            <div className="flex items-center justify-between mb-8 relative">
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest text-white/40 mb-1">Quick Insight</p>
                                    <p className="text-3xl font-black tabular-nums">
                                        {complaints.filter(c => c.status === "New" && c.source === "voice" && (currentUser?.role === "admin" || c.dept === currentUser?.dept)).length}
                                        <span className="text-lg font-bold opacity-50 ml-2">New Voice Reports</span>
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
                                <p className="text-sm text-white/60 font-medium leading-relaxed italic">"Officers are notified instantly when a citizen files a report online."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
