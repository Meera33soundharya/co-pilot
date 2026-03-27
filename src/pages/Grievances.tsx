import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { CATEGORY_DEPT } from "@/store/complaintsStore";
import type { Priority, Status, Category, Complaint } from "@/store/complaintsStore";
import {
    Search, Plus, Clock, MessageSquare, X, MapPin, Building2, User,
    CheckCircle2, AlertTriangle, PlayCircle, ShieldAlert,
    XCircle, ChevronRight, Phone, FileText, ExternalLink, Bell,
    Tag, ArrowRight, Filter, Layers, ChevronDown,
    Sparkles, Lightbulb, ThumbsUp, Timer, Wrench
} from "lucide-react";

// ── AI Suggestions per category ──────────────────────────────────────────────
const AI_SUGGESTIONS: Record<string, {
    steps: string[];
    eta: string;
    dept: string;
    priority_note: string;
}> = {
    "Water Supply": {
        steps: ["Dispatch plumber to inspect main pipeline", "Identify and isolate leak point", "Replace damaged pipe section", "Restore water supply and test pressure", "Document repair with photo proof"],
        eta: "4–8 hours", dept: "Water Supply Department",
        priority_note: "Affects drinking water — treat as urgent",
    },
    "Electricity": {
        steps: ["Cordon off affected area immediately", "Alert Electricity Board for emergency dispatch", "Isolate faulty wire/transformer", "Carry out repair/replacement", "Safety inspection before restoring power"],
        eta: "2–6 hours", dept: "Electricity Board",
        priority_note: "Live wire risk — life threatening, escalate immediately",
    },
    "Roads & Infrastructure": {
        steps: ["Place warning signs / cones at pothole", "Schedule road repair crew", "Fill pothole with bitumen/cold mix", "Compact and level the surface", "Update citizen on completion"],
        eta: "1–3 days", dept: "Roads & PWD",
        priority_note: "Accident risk — fast-track if on main road",
    },
    "Sanitation": {
        steps: ["Schedule garbage collection truck", "Deploy sanitation workers to area", "Clear accumulated waste", "Disinfect area if needed", "Notify citizen of clearance"],
        eta: "24 hours", dept: "Sanitation Department",
        priority_note: "Health hazard if delayed beyond 48 hours",
    },
    "Drainage": {
        steps: ["Inspect drain outlet for blockage", "Deploy drain-cleaning equipment", "Clear blockage and flush drain", "Verify water flow is restored", "Log work with photos for records"],
        eta: "6–12 hours", dept: "Drainage & Sewerage",
        priority_note: "Waterlogging risk — high priority in monsoon season",
    },
    "Public Health": {
        steps: ["Conduct site inspection", "Identify health hazard source", "Notify Public Health Officer", "Arrange fumigation / medical response if needed", "Follow-up survey after 3 days"],
        eta: "12–24 hours", dept: "Public Health",
        priority_note: "Involve CHO (Community Health Officer) for disease risk",
    },
    "Parks & Recreation": {
        steps: ["Inspect damaged equipment", "Cordon off unsafe area", "Order replacement parts / materials", "Carry out repair or replacement", "Re-open area after safety check"],
        eta: "3–5 days", dept: "Parks Department",
        priority_note: "Child safety risk — prioritise broken swings and sharp edges",
    },
    "Enforcement": {
        steps: ["Record complaint details and GPS", "Send patrolling officer to verify", "Issue warning notice to offender", "Take legal action if repeated", "Confirm resolution to complainant"],
        eta: "24–48 hours", dept: "Municipal Enforcement",
        priority_note: "Noise/encroachment violations — follow municipal bylaw",
    },
    "Education": {
        steps: ["Verify complaint with school administration", "Escalate to Education Officer", "Schedule inspection visit", "Issue directive for corrective action", "Confirm improvement within 7 days"],
        eta: "3–7 days", dept: "Education Department",
        priority_note: "Involves minors — use child protection protocols",
    },
    "Other": {
        steps: ["Review complaint details", "Route to appropriate department", "Assign officer for site visit", "Take corrective action", "Update citizen on outcome"],
        eta: "2–5 days", dept: "General Administration",
        priority_note: "Classify properly before assigning",
    },
};

// ── AI Suggestion Panel ──────────────────────────────────────────────────────
function AISuggestionPanel({ complaint, onAccept }: { complaint: Complaint; onAccept: () => void }) {
    const suggestion = AI_SUGGESTIONS[complaint.category] ?? AI_SUGGESTIONS["Other"];
    const [accepted, setAccepted] = useState(false);
    return (
        <div className="mx-6 my-4 rounded-3xl border-2 border-amber-200 bg-amber-50 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-400">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70">AI Co-Pilot Suggestion</p>
                    <p className="text-sm font-black text-white truncate">Recommended Resolution Plan</p>
                </div>
                <div className="px-2.5 py-1 bg-white/20 rounded-lg text-[9px] font-black text-white uppercase tracking-wide flex items-center gap-1">
                    <Timer className="w-3 h-3" /> {suggestion.eta}
                </div>
            </div>

            <div className="p-5 space-y-4">
                <div className="flex items-start gap-2.5 p-3.5 bg-white rounded-2xl border border-amber-100">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-amber-800 leading-snug">{suggestion.priority_note}</p>
                </div>

                <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">Suggested Action Steps</p>
                    {suggestion.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                            </div>
                            <p className="text-xs font-medium text-gray-700 leading-snug">{step}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-2xl">
                    <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <p className="text-[11px] font-black text-blue-800">Assign to: <span className="text-blue-600">{suggestion.dept}</span></p>
                </div>

                {!accepted ? (
                    <button
                        onClick={() => { setAccepted(true); onAccept(); }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-200 active:scale-95"
                    >
                        <ThumbsUp className="w-4 h-4" /> Accept AI Plan & Assign
                    </button>
                ) : (
                    <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-100 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Plan Accepted — Officer Assigned</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Config maps ───────────────────────────────────────────────────────────────
const PRIORITY_CFG: Record<Priority, { pill: string; dot: string; avatar: string }> = {
    High: { pill: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500", avatar: "bg-red-600" },
    Medium: { pill: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400", avatar: "bg-gray-700" },
    Low: { pill: "bg-sky-50 text-sky-700 border border-sky-200", dot: "bg-sky-400", avatar: "bg-gray-400" },
};

const STATUS_CFG: Record<Status, { pill: string; dot: string; label: string; step: number }> = {
    "New": { pill: "bg-gray-100 text-gray-600 border border-gray-200", dot: "bg-gray-400", label: "New", step: 0 },
    "Categorized": { pill: "bg-purple-50 text-purple-700 border border-purple-200", dot: "bg-purple-400", label: "Categorized", step: 1 },
    "Assigned": { pill: "bg-blue-50 text-blue-700 border border-blue-200", dot: "bg-blue-500", label: "Assigned", step: 2 },
    "In Progress": { pill: "bg-amber-50 text-amber-700 border border-amber-200", dot: "bg-amber-400", label: "In Progress", step: 3 },
    "Resolved": { pill: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500", label: "Resolved ✓", step: 4 },
    "Closed": { pill: "bg-gray-100 text-gray-400 border border-gray-200", dot: "bg-gray-300", label: "Closed", step: 5 },
};

const WORKFLOW_STEPS: Status[] = ["New", "Categorized", "Assigned", "In Progress", "Resolved", "Closed"];

const ALL_CATEGORIES: Category[] = [
    "Water Supply", "Electricity", "Roads & Infrastructure", "Sanitation",
    "Public Health", "Parks & Recreation", "Drainage", "Enforcement", "Education", "Other"
];

function PriorityBadge({ priority }: { priority: Priority }) {
    const c = PRIORITY_CFG[priority];
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black ${c.pill}`}>
            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
            {priority}
        </span>
    );
}
function StatusBadge({ status }: { status: Status }) {
    const c = STATUS_CFG[status];
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black ${c.pill}`}>
            <span className={`w-2 h-2 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

function WorkflowBar({ status }: { status: Status }) {
    const current = STATUS_CFG[status].step;
    return (
        <div className="flex items-center gap-1 w-full">
            {WORKFLOW_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`h-1.5 flex-1 rounded-full transition-all ${i <= current ? "bg-[#B91C1C]" : "bg-gray-100"}`} />
                    {i < WORKFLOW_STEPS.length - 1 && (
                        <ChevronRight className={`w-2.5 h-2.5 shrink-0 ${i < current ? "text-[#B91C1C]" : "text-gray-200"}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

function AssignPanel({ complaint, onAssign }: { complaint: Complaint; onAssign: (dept: string, to: string) => void }) {
    const [dept, setDept] = useState(complaint.dept || "");
    const [to, setTo] = useState(complaint.assignedTo || "");
    return (
        <div className="space-y-3 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">Assign to Department</p>
            <select value={dept} onChange={e => { setDept(e.target.value); setTo(e.target.value + " Team"); }}
                className="w-full px-4 py-3 text-sm font-bold rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="">Choose department...</option>
                {ALL_CATEGORIES.map(c => (
                    <option key={c} value={CATEGORY_DEPT[c]}>{CATEGORY_DEPT[c]}</option>
                ))}
            </select>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="Officer / person name"
                className="w-full px-4 py-3 text-sm font-bold rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200" />
            <button disabled={!dept || !to} onClick={() => onAssign(dept, to)}
                className="btn-primary w-full !py-2.5 !bg-blue-600 hover:!bg-blue-700 !rounded-xl">
                Confirm Assignment
            </button>
        </div>
    );
}

function CategorizePanel({ onCategorize }: { onCategorize: (cat: Category) => void }) {
    const [cat, setCat] = useState<Category | "">("");
    return (
        <div className="space-y-3 p-4 bg-purple-50 border border-purple-100 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-700">Set / Change Category</p>
            <select value={cat} onChange={e => setCat(e.target.value as Category)}
                className="w-full px-3 py-2.5 text-xs font-bold rounded-xl border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
                <option value="">Choose category...</option>
                {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <button disabled={!cat} onClick={() => cat && onCategorize(cat)}
                className="btn-primary w-full !py-2.5 !bg-purple-600 hover:!bg-purple-700 !rounded-xl">
                Save Category
            </button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
const FILTER_PRIORITIES: (Priority | "All")[] = ["All", "High", "Medium", "Low"];

export default function Grievances() {
    const {
        complaints, currentUser,
        updateStatus, assignComplaint, notifyCitizen, categorize,
    } = useComplaints();

    const isAdmin = currentUser?.role === "admin" || !currentUser;
    const isOfficer = currentUser?.role === "officer";
    const isCitizen = currentUser?.role === "citizen";
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "All");
    const [priFilter, setPriFilter] = useState<Priority | "All">("All");
    const [catFilter, setCatFilter] = useState<Category | "All">("All");
    const [detail, setDetail] = useState<Complaint | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [showAssign, setShowAssign] = useState(false);
    const [showCatPanel, setShowCatPanel] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showAI, setShowAI] = useState(false);

    // Initial load from URL params
    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            const found = complaints.find(c => c.id === id);
            if (found) setDetail(found);
        }
        const q = searchParams.get("q");
        if (q) setQuery(q);
        const s = searchParams.get("status");
        if (s) setStatusFilter(s);
    }, [searchParams, complaints]);

    const sorted = useMemo(() => {
        const order: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
        return [...complaints].sort((a, b) =>
            (order[b.priority] - order[a.priority]) || (b.timestamp - a.timestamp)
        );
    }, [complaints]);

    const filtered = useMemo(() => sorted.filter(c => {
        const q = query.toLowerCase().trim();
        // Smarter ward search: match "Ward 3" with "Ward 03"
        const wardLabel = c.ward.toLowerCase();
        const wardMatch = wardLabel.includes(q) || (
            q.startsWith("ward ") &&
            wardLabel.includes("ward 0" + q.split(" ")[1])
        ) || (
                !isNaN(Number(q)) &&
                wardLabel.includes("ward 0" + q)
            );

        const matchQ = !q || c.issue.toLowerCase().includes(q) || c.citizen.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || wardMatch;
        const matchS = statusFilter === "All" || c.status === statusFilter;
        const matchP = priFilter === "All" || c.priority === priFilter;
        const matchC = catFilter === "All" || c.category === catFilter;
        // Citizens only see their own
        if (isCitizen && currentUser) return matchQ && matchS && matchP && matchC && c.citizenId === currentUser.citizenId;
        return matchQ && matchS && matchP && matchC;
    }), [sorted, query, statusFilter, priFilter, catFilter, isCitizen, currentUser]);

    function toast_(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    }

    function doStatus(id: string, s: Status, note: string) {
        updateStatus(id, s, note);
        if (detail?.id === id) setDetail(prev => prev ? { ...prev, status: s } : prev);
        toast_(note);
    }

    function doAssign(dept: string, to: string) {
        if (!detail) return;
        assignComplaint(detail.id, dept, to);
        setDetail(prev => prev ? { ...prev, dept, assignedTo: to, status: "Assigned" } : prev);
        setShowAssign(false);
        toast_(`${detail.id} assigned to ${to}`);
    }

    function doCategorize(cat: Category) {
        if (!detail) return;
        categorize(detail.id, cat);
        setDetail(prev => prev ? { ...prev, category: cat, status: "Categorized" } : prev);
        setShowCatPanel(false);
        toast_(`${detail.id} categorized as ${cat}`);
    }

    function doNotify(id: string) {
        notifyCitizen(id);
        if (detail?.id === id) setDetail(prev => prev ? { ...prev, notified: true } : prev);
        toast_("Citizen notified via SMS ✓");
    }

    const counts: Record<string, number> = { All: complaints.length };
    WORKFLOW_STEPS.forEach(s => { counts[s] = complaints.filter(c => c.status === s).length; });

    return (
        <DashboardLayout title="Complaints" subtitle={
            isAdmin ? "All complaints — full access" :
                isOfficer ? `Your dept: ${currentUser?.dept}` :
                    "Your submitted complaints"
        }>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-2.5 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    {toast}
                </div>
            )}

            {/* ── Detail Side Panel ──────────────────────────────────── */}
            {detail && (
                <div className="fixed inset-0 z-[100] flex">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setDetail(null); setShowAssign(false); setShowCatPanel(false); setShowAI(false); }} />
                    <div className="relative ml-auto bg-white h-full w-full max-w-[540px] shadow-2xl flex flex-col animate-slide-up">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-sm font-black text-[#B91C1C] bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">{detail.id}</span>
                                    <PriorityBadge priority={detail.priority} />
                                    <StatusBadge status={detail.status} />
                                    {detail.notified && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-600">
                                            <Bell className="w-2.5 h-2.5" /> Notified
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium mt-1">Filed {detail.time} · {detail.dept || "Unassigned"}</p>
                            </div>
                            <button onClick={() => { setDetail(null); setShowAssign(false); setShowCatPanel(false); setShowAI(false); }}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Workflow bar */}
                        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Complaint Journey</p>
                            <WorkflowBar status={detail.status} />
                            <div className="flex justify-between mt-2">
                                {WORKFLOW_STEPS.map(s => (
                                    <span key={s} className={`text-[8px] font-black uppercase tracking-tight ${detail.status === s ? "text-[#B91C1C]" : "text-gray-300"}`}>
                                        {s === "In Progress" ? "Working" : s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto">

                            {/* Issue + category */}
                            <div className="px-6 py-5 border-b border-gray-100 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1.5">
                                        <Tag className="w-2.5 h-2.5" /> {detail.category}
                                    </span>
                                </div>
                                <h2 className="text-lg font-black text-gray-900 leading-snug">{detail.issue}</h2>
                                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Details</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">{detail.description || "No additional details provided."}</p>
                                </div>
                            </div>

                            {/* Info grid */}
                            <div className="px-6 py-5 border-b border-gray-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Complaint Info</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { icon: User, label: "Filed by", value: detail.citizen },
                                        { icon: Phone, label: "Phone", value: detail.phone || "Not provided" },
                                        { icon: MapPin, label: "Ward", value: detail.ward },
                                        { icon: Building2, label: "Department", value: detail.dept || "Not assigned yet" },
                                        { icon: AlertTriangle, label: "Priority", value: `${detail.priority} Priority` },
                                        { icon: Clock, label: "Filed", value: detail.time },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                            <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                                                <p className="text-xs font-bold text-gray-800 mt-0.5">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── AI Suggestion Panel ── */}
                            {(isAdmin || isOfficer) && (
                                <div className="px-6 pt-4 pb-2">
                                    <button
                                        onClick={() => setShowAI(!showAI)}
                                        className={`w-full flex items-center gap-3 py-3.5 px-5 rounded-2xl border-2 transition-all ${showAI
                                            ? "border-amber-300 bg-amber-50 text-amber-700"
                                            : "border-amber-200 bg-white text-amber-600 hover:bg-amber-50"
                                            }`}
                                    >
                                        <Sparkles className="w-4 h-4 shrink-0" />
                                        <div className="flex-1 text-left">
                                            <p className="text-xs font-black uppercase tracking-widest">AI Solution Suggestion</p>
                                            <p className="text-[10px] font-medium opacity-70 mt-0.5">Auto-generated step-by-step resolution plan</p>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showAI ? "rotate-180" : ""}`} />
                                    </button>
                                </div>
                            )}
                            {showAI && (
                                <AISuggestionPanel
                                    complaint={detail}
                                    onAccept={() => {
                                        const sug = AI_SUGGESTIONS[detail.category] ?? AI_SUGGESTIONS["Other"];
                                        doAssign(sug.dept, sug.dept + " Team");
                                        toast_("✅ AI plan accepted — complaint assigned!");
                                        setShowAI(false);
                                    }}
                                />
                            )}

                            {/* Audit log */}
                            <div className="px-6 py-5 border-b border-gray-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Activity Log</p>
                                <div className="relative pl-5 space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
                                    {detail.audit.map((a, i) => (
                                        <div key={i} className="flex items-start gap-3 relative">
                                            <span className="absolute -left-[13px] w-3 h-3 rounded-full border-2 border-white mt-0.5 bg-gray-300" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{a.action}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{a.actor} · {a.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Admin panels */}
                            {isAdmin && (
                                <div className="px-6 py-5 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Admin Actions</p>
                                    <button onClick={() => { setShowCatPanel(!showCatPanel); setShowAssign(false); }}
                                        className="w-full flex items-center gap-2 py-3 px-4 rounded-2xl border border-purple-200 bg-purple-50 text-purple-700 text-xs font-black hover:bg-purple-100 transition-all">
                                        <Tag className="w-4 h-4" /> Change Category
                                        <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${showCatPanel ? "rotate-180" : ""}`} />
                                    </button>
                                    {showCatPanel && <CategorizePanel onCategorize={doCategorize} />}

                                    <button onClick={() => { setShowAssign(!showAssign); setShowCatPanel(false); }}
                                        className="w-full flex items-center gap-2 py-3 px-4 rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-black hover:bg-blue-100 transition-all">
                                        <Building2 className="w-4 h-4" /> Assign to Department
                                        <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${showAssign ? "rotate-180" : ""}`} />
                                    </button>
                                    {showAssign && <AssignPanel complaint={detail} onAssign={doAssign} />}
                                </div>
                            )}
                        </div>

                        {/* Action footer */}
                        <div className="shrink-0 border-t border-gray-100 bg-white p-5 space-y-2.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Update Status</p>

                            {(isAdmin || isOfficer) && detail.status === "New" && (
                                <button onClick={() => doStatus(detail.id, "Categorized", "Marked as categorized")}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition-all">
                                    <Tag className="w-4 h-4" /> Mark as Categorized
                                </button>
                            )}
                            {(isAdmin || isOfficer) && (detail.status === "New" || detail.status === "Categorized" || detail.status === "Assigned") && (
                                <button onClick={() => doStatus(detail.id, "In Progress", "Work started on complaint")}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all">
                                    <PlayCircle className="w-4 h-4" /> Start Working
                                </button>
                            )}
                            {(isAdmin || isOfficer) && (detail.status === "In Progress" || detail.status === "Assigned") && (
                                <button onClick={() => doStatus(detail.id, "Resolved", "Complaint resolved")}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all">
                                    <CheckCircle2 className="w-4 h-4" /> Mark as Resolved
                                </button>
                            )}
                            {(isAdmin || isOfficer) && detail.status === "Resolved" && !detail.notified && (
                                <button onClick={() => doNotify(detail.id)}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black transition-all">
                                    <Bell className="w-4 h-4" /> Notify Citizen of Resolution
                                </button>
                            )}
                            {isAdmin && detail.status !== "Closed" && (
                                <button onClick={() => { doStatus(detail.id, "Closed", "Complaint closed"); setTimeout(() => setDetail(null), 400); }}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 text-xs font-black transition-all">
                                    <XCircle className="w-4 h-4" /> Close Complaint
                                </button>
                            )}
                            {isAdmin && (
                                <button onClick={() => doStatus(detail.id, "New", "Escalated to senior officer")}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-[#B91C1C] hover:bg-red-800 text-white text-xs font-black transition-all">
                                    <ShieldAlert className="w-4 h-4" /> Escalate to Senior Officer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-5">

                {/* Citizen portal banner — admin/officer only */}
                {!isCitizen && (
                    <div className="bg-gradient-to-r from-[#B91C1C] to-red-700 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-xl shadow-red-200">
                        <div className="text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">🌐 Share with citizens</p>
                            <p className="text-lg font-black">Citizens can file complaints online</p>
                            <p className="text-xs opacity-70 mt-0.5">New submissions appear here instantly — auto-categorized & AI-prioritized</p>
                        </div>
                        <a href="/submit-complaint" target="_blank" rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-2 bg-white text-[#B91C1C] font-black text-xs px-4 py-2.5 rounded-2xl hover:bg-red-50 transition-all whitespace-nowrap">
                            <ExternalLink className="w-3.5 h-3.5" /> Open Portal
                        </a>
                    </div>
                )}

                {/* KPI Strip */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {WORKFLOW_STEPS.map(s => {
                        const cfg = STATUS_CFG[s];
                        const cnt = counts[s] ?? 0;
                        return (
                            <button key={s}
                                onClick={() => {
                                    const newVal = statusFilter === s ? "All" : s;
                                    setStatusFilter(newVal);
                                    setSearchParams(p => {
                                        if (newVal === "All") p.delete("status");
                                        else p.set("status", newVal);
                                        return p;
                                    });
                                }}
                                className={`rounded-2xl border p-4 text-center transition-all hover:scale-105 active:scale-95 ${statusFilter === s ? "border-[#B91C1C] bg-red-50 shadow-md" : "bg-white border-gray-100 shadow-sm"}`}>
                                <span className={`w-2.5 h-2.5 rounded-full mx-auto block mb-2 ${cfg.dot}`} />
                                <p className={`text-3xl font-black ${statusFilter === s ? "text-[#B91C1C]" : "text-gray-800"}`}>{cnt}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1 leading-tight">{s === "In Progress" ? "Working" : s}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Search + filters */}
                <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search by complaint, citizen, ID, ward…"
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-[#B91C1C]/20 focus:outline-none transition-all text-gray-700 placeholder:text-gray-400 placeholder:font-medium"
                            />
                        </div>
                        {!isCitizen && (
                            <button onClick={() => navigate("/submit-complaint")}
                                className="btn-primary !px-5 !py-3 shrink-0">
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">New</span>
                            </button>
                        )}
                        <button onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-black transition-all ${showFilters ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">Filters</span>
                            {(priFilter !== "All" || catFilter !== "All") && (
                                <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                            <div>
                                <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Priority</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {FILTER_PRIORITIES.map(p => (
                                        <button key={p} onClick={() => setPriFilter(p)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${priFilter === p ? "bg-[#B91C1C] text-white border-[#B91C1C]" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Category</p>
                                <select value={catFilter} onChange={e => setCatFilter(e.target.value as Category | "All")}
                                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#B91C1C]/30">
                                    <option value="All">All Categories</option>
                                    {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-white/60">
                        Showing {filtered.length} of {complaints.length} complaints
                        {(isAdmin || isOfficer) && ` · sorted by priority`}
                    </p>
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-white/40" />
                        <span className="text-xs font-black text-white/40 uppercase tracking-widest">
                            {isAdmin ? "Admin View" : isOfficer ? "Officer View" : "Citizen View"}
                        </span>
                    </div>
                </div>

                {/* Complaint cards */}
                <div className="space-y-3">
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
                            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="font-black text-gray-400 uppercase tracking-widest text-xs">No complaints found</p>
                            <p className="text-gray-300 text-xs mt-1">Try adjusting your filters</p>
                        </div>
                    ) : (
                        filtered.map(g => {
                            const priCfg = PRIORITY_CFG[g.priority];
                            return (
                                <div
                                    key={g.id}
                                    onClick={() => { setDetail(g); setShowAssign(false); setShowCatPanel(false); setShowAI(false); }}
                                    className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className={`w-12 h-12 rounded-2xl ${priCfg.avatar} flex items-center justify-center shrink-0 text-white text-sm font-black`}>
                                            {g.citizen.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                                        <span className="font-mono text-xs font-black text-[#B91C1C]">{g.id}</span>
                                                        <PriorityBadge priority={g.priority} />
                                                        <StatusBadge status={g.status} />
                                                        {g.notified && (
                                                            <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-lg font-black">SMS Sent</span>
                                                        )}
                                                    </div>
                                                    <p className="text-base font-black text-gray-900 truncate">{g.issue}</p>
                                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                                        {g.citizen} · {g.ward} · {g.category}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase">{g.time}</p>
                                                    <p className="text-xs text-gray-500 mt-1 font-semibold">{g.dept || "Unassigned"}</p>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="mt-3">
                                                <WorkflowBar status={g.status} />
                                            </div>

                                            {/* Inline quick actions */}
                                            <div className="flex items-center gap-2 mt-4 flex-wrap">
                                                {(isAdmin || isOfficer) && g.status === "New" && (
                                                    <button onClick={e => { e.stopPropagation(); doStatus(g.id, "Categorized", "Categorized"); }}
                                                        className="text-xs font-black px-4 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 transition-all">
                                                        ✦ Categorize
                                                    </button>
                                                )}
                                                {(isAdmin || isOfficer) && (g.status === "Categorized" || g.status === "Assigned") && (
                                                    <button onClick={e => { e.stopPropagation(); doStatus(g.id, "In Progress", "Work started"); }}
                                                        className="text-xs font-black px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition-all">
                                                        ▶ Start Work
                                                    </button>
                                                )}
                                                {(isAdmin || isOfficer) && g.status === "In Progress" && (
                                                    <button onClick={e => { e.stopPropagation(); doStatus(g.id, "Resolved", "Resolved"); }}
                                                        className="text-xs font-black px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-all">
                                                        ✓ Resolve
                                                    </button>
                                                )}
                                                {(isAdmin || isOfficer) && g.status === "Resolved" && !g.notified && (
                                                    <button onClick={e => { e.stopPropagation(); doNotify(g.id); }}
                                                        className="text-xs font-black px-4 py-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 hover:bg-sky-100 transition-all">
                                                        📱 Notify Citizen
                                                    </button>
                                                )}
                                                <button
                                                    className="text-xs font-black px-4 py-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 transition-all ml-auto flex items-center gap-1.5"
                                                >
                                                    View Details <ArrowRight className="w-3.5 h-3.5" />
                                                </button>
                                                {isCitizen && (
                                                    <a href="/submit-complaint" target="_blank" rel="noopener noreferrer"
                                                        onClick={e => e.stopPropagation()}
                                                        className="text-[9px] font-black px-3 py-1.5 rounded-xl bg-red-50 text-[#B91C1C] border border-red-100 hover:bg-red-100 transition-all flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> New Complaint
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
