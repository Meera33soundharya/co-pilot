import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import {
    CheckCircle2, Clock, MapPin, Phone,
    Camera, Sparkles, Navigation,
    Search, Loader2, Play, Activity,
    X, AlertTriangle, User, Building2,
    FileText, Filter, RefreshCw, Eye,
    ChevronRight, Hash, Calendar
} from "lucide-react";
import type { Complaint } from "@/services/api";
import type { Status } from "@/store/complaintsStore";

type FilterTab = "All" | "New" | "Assigned" | "In Progress" | "Resolved" | "High Priority";

const PRIORITY_CONFIG = {
    High:   { bg: "bg-red-500/20",    text: "text-red-300",    border: "border-red-500/30",    dot: "bg-red-400"    },
    Medium: { bg: "bg-amber-500/20",  text: "text-amber-300",  border: "border-amber-500/30",  dot: "bg-amber-400"  },
    Low:    { bg: "bg-emerald-500/20",text: "text-emerald-300",border: "border-emerald-500/30",dot: "bg-emerald-400" },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
    Pending:     { bg: "bg-yellow-500/20",  text: "text-yellow-300",  border: "border-yellow-500/30",  label: "New" },
    Accepted:    { bg: "bg-blue-500/20",    text: "text-blue-300",    border: "border-blue-500/30",    label: "Accepted" },
    Assigned:    { bg: "bg-purple-500/20",  text: "text-purple-300",  border: "border-purple-500/30",  label: "Assigned" },
    "In Progress":{ bg: "bg-orange-500/20", text: "text-orange-300",  border: "border-orange-500/30",  label: "In Progress" },
    Resolved:    { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", label: "Resolved" },
    Closed:      { bg: "bg-gray-500/20",    text: "text-gray-300",    border: "border-gray-500/30",    label: "Closed" },
    Rejected:    { bg: "bg-red-500/20",     text: "text-red-300",     border: "border-red-500/30",     label: "Rejected" },
};

function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default function FieldPortal() {
    const { complaints, currentUser, updateStatus } = useComplaints();
    const [filterTab, setFilterTab] = useState<FilterTab>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState<Complaint | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [proofNote, setProofNote] = useState("");
    const [proofImg, setProofImg] = useState<string | null>(null);

    // Show ALL complaints for this officer's dept (or all if admin)
    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            const matchesRole = currentUser?.role === "admin"
                || c.dept === currentUser?.dept
                || !c.dept || c.dept === "";

            const matchesTab = (() => {
                if (filterTab === "All") return true;
                if (filterTab === "New") return c.status === "Pending";
                if (filterTab === "Assigned") return c.status === "Assigned" || c.status === "Accepted";
                if (filterTab === "In Progress") return c.status === "In Progress";
                if (filterTab === "Resolved") return c.status === "Resolved" || c.status === "Closed";
                if (filterTab === "High Priority") return c.priority === "High";
                return true;
            })();

            const q = searchQuery.toLowerCase();
            const matchesSearch = !q
                || c.issue.toLowerCase().includes(q)
                || c.id.toLowerCase().includes(q)
                || c.ward.toLowerCase().includes(q)
                || c.citizen.toLowerCase().includes(q)
                || (c.category || "").toLowerCase().includes(q);

            return matchesRole && matchesTab && matchesSearch;
        });
    }, [complaints, currentUser, filterTab, searchQuery]);

    // Stats
    const stats = useMemo(() => ({
        total:      complaints.length,
        newCount:   complaints.filter(c => c.status === "Pending").length,
        assigned:   complaints.filter(c => c.status === "Assigned" || c.status === "Accepted").length,
        inProgress: complaints.filter(c => c.status === "In Progress").length,
        resolved:   complaints.filter(c => c.status === "Resolved" || c.status === "Closed").length,
    }), [complaints]);

    const handleStatusUpdate = async (id: string, nextStatus: Status, note: string) => {
        setIsUpdating(true);
        await new Promise(r => setTimeout(r, 1200));
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
            "https://images.unsplash.com/photo-1590060417631-017606e30907?auto=format&fit=crop&q=80&w=800",
        ];
        setProofImg(demoImgs[Math.floor(Math.random() * demoImgs.length)]);
    };

    const TABS: { key: FilterTab; label: string; count?: number }[] = [
        { key: "All",          label: "All",         count: stats.total },
        { key: "New",          label: "New",         count: stats.newCount },
        { key: "Assigned",     label: "Assigned",    count: stats.assigned },
        { key: "In Progress",  label: "In Progress", count: stats.inProgress },
        { key: "Resolved",     label: "Resolved",    count: stats.resolved },
        { key: "High Priority",label: "High Priority" },
    ];

    const STAT_CARDS = [
        { label: "Total",       value: stats.total,      color: "from-blue-600/30 to-blue-800/20",    border: "border-blue-500/20", text: "text-blue-300",    icon: FileText },
        { label: "New",         value: stats.newCount,   color: "from-yellow-600/30 to-yellow-800/20",border: "border-yellow-500/20",text: "text-yellow-300",  icon: AlertTriangle },
        { label: "Assigned",    value: stats.assigned,   color: "from-purple-600/30 to-purple-800/20",border: "border-purple-500/20",text: "text-purple-300",  icon: User },
        { label: "In Progress", value: stats.inProgress, color: "from-orange-600/30 to-orange-800/20",border: "border-orange-500/20",text: "text-orange-300",  icon: Activity },
        { label: "Resolved",    value: stats.resolved,   color: "from-emerald-600/30 to-emerald-800/20",border:"border-emerald-500/20",text:"text-emerald-300",icon: CheckCircle2 },
    ];

    return (
        <DashboardLayout
            title="Field Officer Portal"
            subtitle="Manage citizen complaints efficiently."
        >
            <div className="space-y-6 animate-fade-in">

                {/* ── Summary Stats Row ───────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {STAT_CARDS.map(card => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} border ${card.border} p-5 backdrop-blur-sm transition-all hover:scale-[1.03] hover:shadow-lg`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{card.label}</p>
                                    <Icon className={`w-4 h-4 ${card.text}`} />
                                </div>
                                <p className={`text-3xl font-black tabular-nums ${card.text}`}>{card.value}</p>
                                {/* subtle shimmer */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                            </div>
                        );
                    })}
                </div>

                {/* ── Search + Filter Bar ─────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search by complaint ID, citizen, ward, issue…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/8 border border-white/10 text-white text-sm font-medium placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all backdrop-blur-sm"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilterTab(tab.key)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                                    filterTab === tab.key
                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                        : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                <Filter className="w-3 h-3" />
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                                        filterTab === tab.key ? "bg-white/20 text-white" : "bg-white/10 text-white/50"
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Results Count ───────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-white/30">
                        Showing <span className="text-white/60">{filteredComplaints.length}</span> complaints
                    </p>
                    <button
                        onClick={() => { setSearchQuery(""); setFilterTab("All"); }}
                        className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                    >
                        <RefreshCw className="w-3 h-3" /> Reset
                    </button>
                </div>

                {/* ── Complaint Cards Grid ────────────────────────────── */}
                {filteredComplaints.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/10 text-center"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-base font-black text-white/30 uppercase tracking-widest">No Complaints Found</p>
                        <p className="text-xs text-white/20 mt-2 font-medium">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {filteredComplaints.map(complaint => {
                            const priorityCfg = PRIORITY_CONFIG[complaint.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.Low;
                            const statusCfg   = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.Closed;
                            const isSelected  = selectedTask?.id === complaint.id;

                            return (
                                <div
                                    key={complaint.id}
                                    onClick={() => setSelectedTask(isSelected ? null : complaint)}
                                    className={`relative group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-2xl ${
                                        isSelected
                                            ? "border-blue-500/50 shadow-blue-500/20 shadow-xl"
                                            : "border-white/8 hover:border-white/20"
                                    }`}
                                    style={{ background: "rgba(30,41,59,0.85)", backdropFilter: "blur(16px)" }}
                                >
                                    {/* Priority accent bar */}
                                    <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                                        complaint.priority === "High" ? "bg-gradient-to-r from-red-500 to-red-400" :
                                        complaint.priority === "Medium" ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                                        "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                    }`} />

                                    {/* Hover glow */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                                        style={{ background: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 70%)" }} />

                                    <div className="p-5">
                                        {/* ── Header Row ── */}
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* ID */}
                                                <span className="flex items-center gap-1 text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg tracking-widest">
                                                    <Hash className="w-2.5 h-2.5" />{complaint.id}
                                                </span>
                                                {/* Priority */}
                                                <span className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border ${priorityCfg.bg} ${priorityCfg.text} ${priorityCfg.border} uppercase tracking-widest`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                                                    {complaint.priority}
                                                </span>
                                                {/* Status */}
                                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} uppercase tracking-widest`}>
                                                    {statusCfg.label}
                                                </span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 text-white/20 shrink-0 mt-0.5 transition-transform ${isSelected ? "rotate-90 text-blue-400" : "group-hover:translate-x-0.5"}`} />
                                        </div>

                                        {/* ── Complaint Issue ── */}
                                        <h3 className="text-base font-black text-white leading-snug mb-3 line-clamp-2">{complaint.issue}</h3>

                                        {/* ── Description ── */}
                                        {complaint.description && (
                                            <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-4 font-medium">{complaint.description}</p>
                                        )}

                                        {/* ── Info Grid ── */}
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 text-white/25 shrink-0" />
                                                <span className="text-xs text-white/50 font-semibold truncate">{complaint.citizen}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-white/25 shrink-0" />
                                                <a href={`tel:${complaint.phone}`} onClick={e => e.stopPropagation()}
                                                    className="text-xs text-blue-400/80 font-semibold hover:text-blue-300 transition-colors truncate">{complaint.phone}</a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-white/25 shrink-0" />
                                                <span className="text-xs text-white/50 font-semibold truncate">{complaint.ward}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5 text-white/25 shrink-0" />
                                                <span className="text-xs text-white/50 font-semibold truncate">{complaint.category}</span>
                                            </div>
                                            {complaint.location && (
                                                <div className="flex items-center gap-2 col-span-2">
                                                    <Navigation className="w-3.5 h-3.5 text-white/25 shrink-0" />
                                                    <span className="text-xs text-white/40 font-medium truncate">{complaint.location}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 col-span-2">
                                                <Calendar className="w-3.5 h-3.5 text-white/25 shrink-0" />
                                                <span className="text-xs text-white/40 font-medium">{formatDate(complaint.timestamp)}</span>
                                            </div>
                                        </div>

                                        {/* Assigned Officer */}
                                        {complaint.assignedTo && (
                                            <div className="mb-4 px-3 py-2 rounded-xl bg-white/5 border border-white/8 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                                    <User className="w-3 h-3 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/25">Assigned Officer</p>
                                                    <p className="text-xs font-bold text-white/60">{complaint.assignedTo}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── Action Buttons ── */}
                                        <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5" onClick={e => e.stopPropagation()}>
                                            {/* View Details */}
                                            <button
                                                onClick={() => setSelectedTask(isSelected ? null : complaint)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-wider hover:bg-white/15 hover:text-white transition-all"
                                            >
                                                <Eye className="w-3 h-3" /> View
                                            </button>

                                            {/* Accept if Pending */}
                                            {complaint.status === "Pending" && (
                                                <button
                                                    onClick={() => handleStatusUpdate(complaint.id, "Accepted", "Complaint accepted by field officer.")}
                                                    disabled={isUpdating}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/80 border border-blue-500/50 text-white text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 transition-all disabled:opacity-50 shadow-sm shadow-blue-500/20"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" /> Accept
                                                </button>
                                            )}

                                            {/* Start Work if Assigned/Accepted */}
                                            {(complaint.status === "Assigned" || complaint.status === "Accepted") && (
                                                <button
                                                    onClick={() => handleStatusUpdate(complaint.id, "In Progress", "Officer started work on-site.")}
                                                    disabled={isUpdating}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600/80 border border-amber-500/50 text-white text-[10px] font-black uppercase tracking-wider hover:bg-amber-600 transition-all disabled:opacity-50 shadow-sm shadow-amber-500/20"
                                                >
                                                    <Play className="w-3 h-3" /> Start Work
                                                </button>
                                            )}

                                            {/* Resolve if in progress */}
                                            {(complaint.status === "In Progress" || complaint.status === "Assigned" || complaint.status === "Accepted") && (
                                                <button
                                                    onClick={() => setSelectedTask(complaint)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/80 border border-emerald-500/50 text-white text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/20"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" /> Resolve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Resolution Panel (slide-in when complaint selected) ── */}
                {selectedTask && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-end p-4 lg:p-8">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
                        <div
                            className="relative w-full max-w-md h-full overflow-y-auto rounded-2xl border border-white/10 shadow-2xl animate-slide-left"
                            style={{ background: "rgba(15,23,42,0.97)", backdropFilter: "blur(24px)" }}
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-10 px-6 py-5 border-b border-white/8 flex items-start justify-between"
                                style={{ background: "rgba(15,23,42,0.98)", backdropFilter: "blur(24px)" }}>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Complaint Console</p>
                                    <h2 className="text-lg font-black text-white leading-tight">{selectedTask.issue}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all shrink-0 ml-3"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Complaint Info */}
                                <div className="space-y-3 p-4 rounded-xl border border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
                                    {[
                                        { icon: Hash,      label: "Case ID",    value: selectedTask.id },
                                        { icon: User,      label: "Citizen",    value: selectedTask.citizen },
                                        { icon: Phone,     label: "Mobile",     value: selectedTask.phone },
                                        { icon: MapPin,    label: "Ward",       value: selectedTask.ward },
                                        { icon: Building2, label: "Category",   value: selectedTask.category },
                                        { icon: Clock,     label: "Date",       value: formatDate(selectedTask.timestamp) },
                                    ].map(row => (
                                        <div key={row.label} className="flex items-center gap-3">
                                            <row.icon className="w-3.5 h-3.5 text-white/25 shrink-0" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 w-20 shrink-0">{row.label}</span>
                                            <span className="text-xs font-bold text-white/70 truncate">{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Description */}
                                {selectedTask.description && (
                                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Description</p>
                                        <p className="text-sm text-white/70 leading-relaxed font-medium">{selectedTask.description}</p>
                                    </div>
                                )}

                                {/* AI Field Intelligence */}
                                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex gap-3">
                                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Field Intelligence</p>
                                        <p className="text-xs text-white/60 leading-relaxed">Prioritize safety checks before proceeding. Ensure proper documentation before and after resolution.</p>
                                    </div>
                                </div>

                                {/* Quick Contact */}
                                <a
                                    href={`tel:${selectedTask.phone}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-black uppercase tracking-widest hover:bg-blue-600/40 transition-all"
                                >
                                    <Phone className="w-4 h-4" /> Call Citizen
                                </a>

                                {/* Proof Capture */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Capture Proof (Before / After)</label>
                                    {proofImg ? (
                                        <div className="relative aspect-video rounded-xl overflow-hidden group">
                                            <img src={proofImg} alt="Proof" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setProofImg(null)}
                                                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleCapture}
                                            className="w-full aspect-video border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-500/40 hover:bg-white/3 transition-all group"
                                        >
                                            <Camera className="w-8 h-8 text-white/20 group-hover:text-blue-400 transition-colors" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60">Open Field Camera</p>
                                        </button>
                                    )}
                                </div>

                                {/* Resolution Note */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3 block">Resolution Summary</label>
                                    <textarea
                                        rows={3}
                                        value={proofNote}
                                        onChange={e => setProofNote(e.target.value)}
                                        placeholder="What action was taken? (e.g. Pipe repaired and pressure tested)"
                                        className="w-full px-4 py-3 rounded-xl border border-white/10 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 transition-all resize-none"
                                        style={{ background: "rgba(255,255,255,0.05)" }}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pb-4">
                                    {selectedTask.status === "Pending" && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedTask.id, "Accepted", "Complaint accepted by field officer")}
                                            disabled={isUpdating}
                                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Accept Complaint
                                        </button>
                                    )}
                                    {(selectedTask.status === "Assigned" || selectedTask.status === "Accepted") && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedTask.id, "In Progress", "Officer started work on-site")}
                                            disabled={isUpdating}
                                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                            Start Work
                                        </button>
                                    )}
                                    {(selectedTask.status === "Assigned" || selectedTask.status === "Accepted" || selectedTask.status === "In Progress") && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedTask.id, "Resolved", proofNote || "Resolved on-site by officer")}
                                            disabled={isUpdating || !proofImg}
                                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Mark as Resolved
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className="w-full py-3 rounded-xl border border-white/10 text-white/40 text-xs font-black uppercase tracking-widest hover:text-white/70 hover:border-white/20 transition-all"
                                    >
                                        Close Panel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slide-left {
                    from { opacity: 0; transform: translateX(40px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-left { animation: slide-left 0.35s cubic-bezier(0.16,1,0.3,1) both; }
            `}</style>
        </DashboardLayout>
    );
}
