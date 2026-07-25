import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import {
    Search, CheckCircle2,
    MapPin, Calendar, ChevronDown, ChevronUp,
    Clipboard, UserCheck, Wrench, ShieldCheck,
    Star, RefreshCw, ArrowRight, FileText,
    Hash, Building2, Zap, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Status, Priority } from "@/store/complaintsStore";

// ── Journey Step Config ─────────────────────────────────────
const JOURNEY: {
    key: Status[];
    label: string;
    sublabel: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
    dotColor: string;
}[] = [
    {
        key: ["Pending"],
        label: "Submitted",
        sublabel: "Complaint received & pending review",
        icon: Clipboard,
        color: "text-yellow-700",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        dotColor: "bg-yellow-500",
    },
    {
        key: ["Accepted"],
        label: "Accepted",
        sublabel: "Admin reviewed & accepted complaint",
        icon: FileText,
        color: "text-cyan-700",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        dotColor: "bg-cyan-500",
    },
    {
        key: ["Assigned"],
        label: "Assigned to Officer",
        sublabel: "Field officer dispatched",
        icon: UserCheck,
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        dotColor: "bg-amber-500",
    },
    {
        key: ["In Progress"],
        label: "In Progress",
        sublabel: "Work underway at location",
        icon: Wrench,
        color: "text-orange-700",
        bg: "bg-orange-50",
        border: "border-orange-200",
        dotColor: "bg-orange-500",
    },
    {
        key: ["Resolved"],
        label: "Resolved",
        sublabel: "Issue fixed by field officer",
        icon: ShieldCheck,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        dotColor: "bg-emerald-500",
    },
    {
        key: ["Closed"],
        label: "Closed",
        sublabel: "Admin verified & case closed",
        icon: ShieldCheck,
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
        dotColor: "bg-gray-400",
    },
];

const STATUS_ORDER: Record<Status, number> = {
    Pending: 0,
    Accepted: 1,
    Rejected: 0,
    Assigned: 2,
    "In Progress": 3,
    Resolved: 4,
    Closed: 5,
};

const PRIORITY_CFG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
    High: { label: "High Priority", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
    Medium: { label: "Medium Priority", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    Low: { label: "Low Priority", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
};

function JourneyTimeline({ status, auditLog }: { status: Status; auditLog: any[] }) {
    const currentIdx = STATUS_ORDER[status];

    return (
        <div className="relative">
            {JOURNEY.map((step, i) => {
                const stepIdx = STATUS_ORDER[step.key[0]];
                const isDone = stepIdx < currentIdx;
                const isActive = step.key.includes(status);
                const isPending = stepIdx > currentIdx;
                const Icon = step.icon;

                // Find audit entry that matches this step
                const relatedAudit = auditLog.filter(a => {
                    const action = a.action?.toLowerCase() || "";
                    if (step.key.includes("Pending") && (action.includes("submitted") || action.includes("created") || action.includes("pending"))) return true;
                    if (step.key.includes("Accepted") && (action.includes("accepted") || action.includes("categorized"))) return true;
                    if (step.key.includes("Assigned") && action.includes("assigned")) return true;
                    if (step.key.includes("In Progress") && (action.includes("progress") || action.includes("started") || action.includes("working"))) return true;
                    if (step.key.includes("Resolved") && (action.includes("resolved") || action.includes("fixed"))) return true;
                    if (step.key.includes("Closed") && action.includes("closed")) return true;
                    return false;
                });

                return (
                    <div key={step.label} className="flex gap-4 relative">
                        {/* Vertical line */}
                        {i < JOURNEY.length - 1 && (
                            <div className="absolute left-[19px] top-10 bottom-0 w-0.5 z-0"
                                style={{
                                    background: isDone
                                        ? "linear-gradient(to bottom, #10b981, #10b981)"
                                        : isActive
                                            ? "linear-gradient(to bottom, #f59e0b, #e5e7eb)"
                                            : "#e5e7eb"
                                }}
                            />
                        )}

                        {/* Icon Node */}
                        <div className="relative z-10 shrink-0">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all ${isDone
                                ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200"
                                : isActive
                                    ? `${step.bg} ${step.border} shadow-lg`
                                    : "bg-gray-100 border-gray-200"
                                }`}>
                                {isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : (
                                    <Icon className={`w-5 h-5 ${isPending ? "text-gray-300" : step.color}`} />
                                )}
                            </div>
                            {isActive && (
                                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${step.dotColor} animate-pulse`} />
                            )}
                        </div>

                        {/* Content */}
                        <div className={`flex-1 mb-6 pb-6 ${i < JOURNEY.length - 1 ? "border-b border-white/10" : ""}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <p className={`text-sm font-black uppercase tracking-wide ${isDone ? "text-white" : isActive ? "text-white" : "text-white/30"}`}>
                                    {step.label}
                                </p>
                                {isDone && (
                                    <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-400/20">
                                        Done
                                    </span>
                                )}
                                {isActive && (
                                    <span className={`text-[9px] font-black ${step.color} ${step.bg} px-2 py-0.5 rounded-full uppercase tracking-widest border ${step.border}`}>
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className={`text-[11px] font-medium ${isPending ? "text-white/20" : "text-white/50"}`}>
                                {step.sublabel}
                            </p>

                            {/* Audit entries for this step */}
                            {relatedAudit.length > 0 && relatedAudit.map((a, ai) => (
                                <div key={ai} className={`mt-3 p-3 rounded-xl border ${isActive ? `${step.bg} ${step.border}` : isDone ? "bg-emerald-400/10 border-emerald-400/20" : "bg-white/5 border-white/10"}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${isDone ? "text-emerald-400" : isActive ? step.color : "text-white/40"}`}>
                                            {a.actor}
                                        </span>
                                        <span className="text-[9px] text-white/30">·</span>
                                        <span className="text-[9px] text-white/30 font-bold">{a.time}</span>
                                    </div>
                                    <p className={`text-[11px] font-bold ${isDone ? "text-white/70" : isActive ? "text-white/80" : "text-white/30"}`}>
                                        {a.action}
                                    </p>
                                    {a.note && (
                                        <p className="text-[10px] italic text-white/40 mt-1">"{a.note}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function TrackComplaint() {
    const { complaints, rateComplaint, reopenComplaint } = useComplaints();
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Citizens only see their own; admin/officer see all
    const filtered = complaints
        .filter(c =>
            searchId.trim() === "" ||
            c.id.toLowerCase().includes(searchId.toLowerCase()) ||
            c.issue.toLowerCase().includes(searchId.toLowerCase())
        )
        .sort((a, b) => b.timestamp - a.timestamp);

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => !["Resolved", "Closed"].includes(c.status)).length,
        resolved: complaints.filter(c => ["Resolved", "Closed"].includes(c.status)).length,
    };

    return (
        <DashboardLayout
            title="Track Complaint"
            subtitle="Follow your complaint journey — from submission to resolution."
        >
            <div className="space-y-6 pb-10">

                {/* ── Stats Bar ─────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Total Filed", value: stats.total, color: "text-white", bg: "bg-white/5", border: "border-white/10" },
                        { label: "In Progress", value: stats.pending, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
                        { label: "Resolved", value: stats.resolved, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
                            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Search Bar ────────────────────────────────── */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search by Complaint ID (e.g. GRV-8300) or issue keyword..."
                        value={searchId}
                        onChange={e => setSearchId(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all"
                    />
                    {searchId && (
                        <button onClick={() => setSearchId("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* ── No Results ────────────────────────────────── */}
                {filtered.length === 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
                        <Clipboard className="w-14 h-14 text-white/10 mx-auto mb-4" />
                        <p className="text-lg font-black text-white/30 uppercase tracking-widest">No Complaints Found</p>
                        <p className="text-sm text-white/20 mt-2">Submit a complaint first to track it here.</p>
                        <button
                            onClick={() => navigate("/submit-complaint")}
                            className="mt-6 px-6 py-3 bg-[#B91C1C] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 mx-auto"
                        >
                            <ArrowRight className="w-4 h-4" /> Submit a Complaint
                        </button>
                    </div>
                )}

                {/* ── Complaint Cards ───────────────────────────── */}
                <div className="space-y-4">
                    {filtered.map(c => {
                        const isExp = expandedId === c.id;
                        const pc = PRIORITY_CFG[c.priority];
                        const currentStep = STATUS_ORDER[c.status];
                        const totalSteps = JOURNEY.length - 1;
                        const progress = Math.round((currentStep / totalSteps) * 100);

                        return (
                            <div
                                key={c.id}
                                className={`bg-white/5 border rounded-3xl overflow-hidden transition-all duration-300 ${isExp ? "border-white/20 shadow-2xl" : "border-white/10 hover:border-white/20"}`}
                            >
                                {/* ── Card Header ── */}
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => setExpandedId(isExp ? null : c.id)}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* ID + badges */}
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <span className="flex items-center gap-1 font-mono text-xs font-black text-[#B91C1C] bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                                                    <Hash className="w-3 h-3" /> {c.id}
                                                </span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase ${pc.bg} ${pc.color} ${pc.border}`}>
                                                    {pc.label}
                                                </span>
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-white/40">
                                                    <MapPin className="w-3 h-3" /> {c.ward}
                                                </span>
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-white/40">
                                                    <Calendar className="w-3 h-3" /> {c.time}
                                                </span>
                                            </div>

                                            {/* Issue title */}
                                            <h3 className="text-lg font-black text-white leading-snug truncate">{c.issue}</h3>

                                            {/* Dept */}
                                            {c.dept && (
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Building2 className="w-3 h-3 text-white/30" />
                                                    <span className="text-[10px] font-bold text-white/40">{c.dept}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status pill + expand */}
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <StatusPill status={c.status} />
                                            <button className="text-white/30 hover:text-white transition-colors">
                                                {isExp ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Journey Progress</span>
                                            <span className="text-[9px] font-black text-white/40">{progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${c.status === "Resolved" || c.status === "Closed"
                                                    ? "bg-emerald-500"
                                                    : "bg-gradient-to-r from-[#B91C1C] to-amber-500"
                                                    }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>

                                        {/* Mini step labels */}
                                        <div className="flex justify-between mt-2">
                                            {JOURNEY.map((step, i) => {
                                                const stepIdx = STATUS_ORDER[step.key[0]];
                                                const done = stepIdx < currentStep;
                                                const active = step.key.includes(c.status);
                                                return (
                                                    <span key={i} className={`text-[8px] font-black uppercase tracking-tight ${done ? "text-emerald-400" : active ? "text-amber-400" : "text-white/20"}`}>
                                                        {step.label.split(" ")[0]}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Expanded: Full Journey ── */}
                                {isExp && (
                                    <div className="border-t border-white/10 p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                            {/* LEFT: Full Journey Timeline */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-5">
                                                    <Zap className="w-4 h-4 text-amber-400" />
                                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Full Complaint Journey</h4>
                                                </div>
                                                <JourneyTimeline status={c.status} auditLog={c.audit} />
                                            </div>

                                            {/* RIGHT: Details + Actions */}
                                            <div className="space-y-5">
                                                {/* Complaint Details */}
                                                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Complaint Details</h4>
                                                    <div>
                                                        <p className="text-[9px] text-white/30 uppercase font-black mb-0.5">Issue</p>
                                                        <p className="text-sm font-bold text-white">{c.issue}</p>
                                                    </div>
                                                    {c.description && (
                                                        <div>
                                                            <p className="text-[9px] text-white/30 uppercase font-black mb-0.5">Description</p>
                                                            <p className="text-xs text-white/60 leading-relaxed">{c.description}</p>
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                                                        <div>
                                                            <p className="text-[9px] text-white/30 uppercase font-black mb-0.5">Ward</p>
                                                            <p className="text-xs font-bold text-white">{c.ward}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-white/30 uppercase font-black mb-0.5">Department</p>
                                                            <p className="text-xs font-bold text-white">{c.dept || "—"}</p>
                                                        </div>
                                                        {c.assignedTo && (
                                                            <div>
                                                                <p className="text-[9px] text-white/30 uppercase font-black mb-0.5">Assigned To</p>
                                                                <p className="text-xs font-bold text-white">{c.assignedTo}</p>
                                                            </div>
                                                        )}
                                                        {c.location && (
                                                            <div>
                                                                <p className="text-[9px] text-white/30 uppercase font-black mb-0.5">Location</p>
                                                                <p className="text-xs font-bold text-white truncate">{c.location}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Full Audit Trail */}
                                                <div>
                                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Live Activity Log</h4>
                                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                                        {c.audit.map((a, i) => (
                                                            <div key={i} className="flex gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-2 shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="text-[9px] font-black text-white/50 uppercase">{a.actor}</span>
                                                                        <span className="text-[9px] text-white/20">{a.time}</span>
                                                                    </div>
                                                                    <p className="text-[11px] text-white/70 font-medium">{a.action}</p>
                                                                    {a.note && <p className="text-[10px] italic text-white/30 mt-0.5">"{a.note}"</p>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Resolution Proof */}
                                                {c.resolutionProof && (
                                                    <div>
                                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Resolution Proof</h4>
                                                        <div className="rounded-2xl overflow-hidden border border-emerald-400/20 aspect-video">
                                                            <img src={c.resolutionProof} alt="Resolution" className="w-full h-full object-cover" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Rate Resolution */}
                                                {(c.status === "Resolved" || c.status === "Closed") && (
                                                    <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-5">
                                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 text-center">
                                                            Rate the Resolution
                                                        </h4>
                                                        <div className="flex items-center justify-center gap-2">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => rateComplaint(c.id, star)}
                                                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${c.rating && c.rating >= star ? "scale-110" : "opacity-30 hover:opacity-80"}`}
                                                                >
                                                                    <Star className={`w-6 h-6 ${c.rating && c.rating >= star ? "fill-emerald-400 text-emerald-400" : "text-white/30"}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <p className="text-[9px] text-center text-emerald-400/60 font-bold uppercase tracking-widest mt-3">
                                                            Your feedback improves governance
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Reopen */}
                                                {(c.status === "Resolved" || c.status === "Closed") && (
                                                    <button
                                                        onClick={() => reopenComplaint(c.id, "Citizen reopened: Issue persists")}
                                                        className="w-full py-3 border-2 border-dashed border-red-500/30 text-red-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 group"
                                                    >
                                                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                                        Issue Not Fixed? Reopen Case
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Footer CTA ────────────────────────────────── */}
                <div className="text-center pt-4">
                    <button
                        onClick={() => navigate("/submit-complaint")}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white/50 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                    >
                        <ArrowRight className="w-4 h-4" /> Submit a New Complaint
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatusPill({ status }: { status: Status }) {
    const cfg: Record<Status, { label: string; color: string; bg: string; border: string; dot: string }> = {
        Pending: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", dot: "bg-yellow-400 animate-pulse" },
        Accepted: { label: "Accepted", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", dot: "bg-cyan-400" },
        Rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", dot: "bg-red-400" },
        Assigned: { label: "Assigned", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", dot: "bg-amber-400" },
        "In Progress": { label: "In Field", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", dot: "bg-orange-400 animate-pulse" },
        Resolved: { label: "Resolved", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", dot: "bg-emerald-400" },
        Closed: { label: "Closed", color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20", dot: "bg-gray-400" },
    };
    const c = cfg[status];
    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${c.color} ${c.bg} ${c.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}
