import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import type { Complaint, Status, Priority } from "@/store/complaintsStore";
import {
  Search, Filter, ChevronRight, MapPin, User, Clock,
  Building2, AlertTriangle, CheckCircle2, Loader2,
  ClipboardList, FileText, Tag, Star, RefreshCw,
  SlidersHorizontal, ArrowUpDown, X, Save, Briefcase,
  Activity, Circle, ChevronDown, ArrowLeft
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  High:   { label: "High",   color: "text-red-700",    bg: "bg-red-50 border border-red-200",    dot: "bg-red-500" },
  Medium: { label: "Medium", color: "text-orange-700", bg: "bg-orange-50 border border-orange-200", dot: "bg-orange-500" },
  Low:    { label: "Low",    color: "text-green-700",  bg: "bg-green-50 border border-green-200",  dot: "bg-green-500" },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  "New":                 { label: "New",                 color: "text-blue-700",   bg: "bg-blue-50 border border-blue-200" },
  "Categorized":         { label: "Categorized",         color: "text-purple-700", bg: "bg-purple-50 border border-purple-200" },
  "Assigned":            { label: "Assigned",            color: "text-indigo-700", bg: "bg-indigo-50 border border-indigo-200" },
  "In Progress":         { label: "In Progress",         color: "text-yellow-700", bg: "bg-yellow-50 border border-yellow-200" },
  "Pending Verification":{ label: "Pending Verification",color: "text-orange-700", bg: "bg-orange-50 border border-orange-200" },
  "Resolved":            { label: "Resolved",            color: "text-green-700",  bg: "bg-green-50 border border-green-200" },
  "Closed":              { label: "Closed",              color: "text-gray-600",   bg: "bg-gray-100 border border-gray-200" },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.Medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["New"];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function AISeverityBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-red-500" : score >= 40 ? "bg-orange-400" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-500 w-7 text-right">{score}</span>
    </div>
  );
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}



// ── Main Component ────────────────────────────────────────────
export default function FieldPortal() {
  const { complaints, updateStatus, assignComplaint, currentUser } = useComplaints();

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "All">("All");
  const [filterStatus, setFilterStatus]     = useState<Status | "All">("All");
  const [selected, setSelected]             = useState<Complaint | null>(null);
  const [noteText, setNoteText]             = useState("");
  const [assignTo, setAssignTo]             = useState("");
  const [showAssign, setShowAssign]         = useState(false);
  const [showNote, setShowNote]             = useState(false);
  const [sortBy, setSortBy]                 = useState<"timestamp" | "priority">("timestamp");

  // Officer sees only complaints assigned to their dept (or all if admin-type officer)
  const myComplaints = useMemo(() => {
    let list = [...complaints];
    if (currentUser?.role === "officer" && currentUser?.dept) {
      list = list.filter(c => c.dept === currentUser.dept || c.assignedTo === currentUser.name);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.citizen.toLowerCase().includes(q) ||
        c.issue.toLowerCase().includes(q) ||
        (c.originalComplaintTamil || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q) ||
        c.ward.toLowerCase().includes(q) ||
        c.dept.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.area || "").toLowerCase().includes(q)
      );
    }
    if (filterPriority !== "All") list = list.filter(c => c.priority === filterPriority);
    if (filterStatus !== "All")   list = list.filter(c => c.status === filterStatus);
    list.sort((a, b) => {
      if (sortBy === "priority") {
        const order = { High: 0, Medium: 1, Low: 2 };
        return (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
      }
      return b.timestamp - a.timestamp;
    });
    return list;
  }, [complaints, currentUser, search, filterPriority, filterStatus, sortBy]);

  // Compute AI severity (deterministic from complaint id)
  const aiSeverity = (c: Complaint) => {
    const seed = c.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const base = c.priority === "High" ? 65 : c.priority === "Medium" ? 35 : 10;
    return Math.min(99, base + (seed % 25));
  };

  const handleAction = (action: "in-progress" | "resolve" | "save-note" | "assign") => {
    if (!selected) return;
    if (action === "in-progress") {
      updateStatus(selected.id, "In Progress", `Marked In Progress by ${currentUser?.name ?? "Officer"}`);
      setSelected(prev => prev ? { ...prev, status: "In Progress" } : null);
    } else if (action === "resolve") {
      updateStatus(selected.id, "Resolved", noteText || `Resolved by ${currentUser?.name ?? "Officer"}`);
      setSelected(prev => prev ? { ...prev, status: "Resolved" } : null);
      setNoteText("");
      setShowNote(false);
    } else if (action === "save-note") {
      if (!noteText.trim()) return;
      updateStatus(selected.id, selected.status, noteText);
      setNoteText("");
      setShowNote(false);
    } else if (action === "assign") {
      if (!assignTo.trim()) return;
      assignComplaint(selected.id, selected.dept, assignTo);
      setSelected(prev => prev ? { ...prev, assignedTo: assignTo } : null);
      setAssignTo("");
      setShowAssign(false);
    }
  };

  const statuses: (Status | "All")[] = ["All","New","Categorized","Assigned","In Progress","Pending Verification","Resolved","Closed"];
  const priorities: (Priority | "All")[] = ["All","High","Medium","Low"];

  return (
    <DashboardLayout 
      title="Field Officer Portal" 
      subtitle="Manage and resolve citizen complaints assigned to you"
    >
      <div className="flex h-[calc(100vh-160px)] border border-gray-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* ── LEFT PANEL: Complaint List ── */}
          <div className="w-[600px] flex-shrink-0 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
            {/* Search + Filters */}
            <div className="p-3 border-b border-gray-100 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search complaints, citizens, wards…"
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value as Priority | "All")}
                    className="w-full pl-3 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none font-medium text-gray-700"
                  >
                    {priorities.map(p => <option key={p}>{p}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as Status | "All")}
                    className="w-full pl-3 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none font-medium text-gray-700"
                  >
                    {statuses.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => setSortBy(s => s === "timestamp" ? "priority" : "timestamp")}
                  title={sortBy === "timestamp" ? "Sort by Priority" : "Sort by Date"}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Complaint Cards */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {myComplaints.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <ClipboardList className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No complaints found</p>
                </div>
              )}
              {myComplaints.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c); setShowAssign(false); setShowNote(false); }}
                  className={`w-full text-left p-3 hover:bg-blue-50 transition-colors ${selected?.id === c.id ? "bg-blue-50 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"}`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-blue-600">{c.id}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1 font-tamil">
                    {c.originalComplaintTamil || c.issue}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                    <User className="w-3 h-3" />
                    <span>{c.citizen}</span>
                    <span className="text-gray-300">·</span>
                    <MapPin className="w-3 h-3" />
                    <span>{c.ward}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="mt-2">
                    <AISeverityBar score={aiSeverity(c)} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL: Complaint Detail ── */}
          <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <ArrowLeft className="w-12 h-12 mb-4 opacity-30 animate-pulse text-blue-500" />
                <p className="text-lg font-bold text-gray-700">Select a complaint</p>
                <p className="text-sm mt-1 text-gray-500">Click a complaint from the left panel to view its details</p>
              </div>
            ) : (
              <div className="p-6 max-w-3xl">
                {/* Detail Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-mono font-bold text-blue-600">{selected.id}</span>
                      <StatusBadge status={selected.status} />
                      <PriorityBadge priority={selected.priority} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 font-tamil">
                      {selected.originalComplaintTamil || selected.issue}
                    </h2>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Citizen Details */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> குடிமகன் விவரம்
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Name</p>
                        <p className="text-sm font-semibold text-gray-800">{selected.citizen}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Ward</p>
                        <p className="text-sm font-semibold text-gray-800">{selected.ward}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                        <p className="text-sm font-semibold text-gray-800">{selected.phone || "—"}</p>
                      </div>
                      {selected.location && (
                        <div className="col-span-3">
                          <p className="text-xs text-gray-400 mb-0.5">Area / Location</p>
                          <p className="text-sm font-semibold text-gray-800">{selected.location}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Complaint Details */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> புகார் விவரம்
                    </h3>

                    {selected.originalComplaintTamil ? (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-1">புகார் விவரம்</p>
                        <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100 font-tamil">
                          {selected.originalComplaintTamil}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <p className="text-xs text-gray-400 mb-1">Complaint Details</p>
                        <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          {selected.description || "No description provided."}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">பிரிவு</p>
                        <p className="text-sm font-semibold text-gray-800">{selected.category}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">துறை</p>
                        <p className="text-sm font-semibold text-gray-800">{selected.dept}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Assigned To</p>
                        <p className="text-sm font-semibold text-gray-800">{selected.assignedTo || "—"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-400 mb-1">Submitted</p>
                        <p className="text-sm font-semibold text-gray-800">{formatDate(selected.timestamp)}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1.5">AI Severity Score</p>
                      <AISeverityBar score={aiSeverity(selected)} />
                    </div>
                  </div>

                  {/* Audit Trail */}
                  {selected.audit && selected.audit.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> நடவடிக்கை வரலாறு
                      </h3>
                      <div className="space-y-2">
                        {[...selected.audit].reverse().slice(0, 5).map((entry, i) => (
                          <div key={i} className="flex gap-3 text-sm">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-gray-700">{entry.actor}</span>
                              <span className="text-gray-500"> — {entry.action}</span>
                              {entry.note && <p className="text-xs text-gray-400 mt-0.5 italic">"{entry.note}"</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Actions</h3>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {/* Assign Officer */}
                      <button
                        onClick={() => { setShowAssign(a => !a); setShowNote(false); }}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        <Briefcase className="w-4 h-4" /> Assign Officer
                      </button>

                      {/* Mark In Progress */}
                      <button
                        onClick={() => handleAction("in-progress")}
                        disabled={selected.status === "In Progress" || selected.status === "Resolved" || selected.status === "Closed"}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Loader2 className="w-4 h-4" /> Mark In Progress
                      </button>

                      {/* Resolve */}
                      <button
                        onClick={() => handleAction("resolve")}
                        disabled={selected.status === "Resolved" || selected.status === "Closed"}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Resolve Complaint
                      </button>

                      {/* Add Note */}
                      <button
                        onClick={() => { setShowNote(n => !n); setShowAssign(false); }}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        <ClipboardList className="w-4 h-4" /> Add Officer Notes
                      </button>
                    </div>

                    {/* Assign Officer Input */}
                    {showAssign && (
                      <div className="flex gap-2 mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                        <input
                          value={assignTo}
                          onChange={e => setAssignTo(e.target.value)}
                          placeholder="Enter officer name or ID…"
                          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleAction("assign")}
                          className="px-3 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                        >
                          <Save className="w-4 h-4" /> Assign
                        </button>
                      </div>
                    )}

                    {/* Notes Input */}
                    {showNote && (
                      <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
                        <textarea
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Add officer notes or resolution remarks…"
                          rows={3}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <button
                          onClick={() => handleAction("save-note")}
                          className="w-full py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" /> Save Notes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </DashboardLayout>
  );
}
