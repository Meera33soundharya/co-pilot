import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import type { Complaint, Status, Priority } from "@/store/complaintsStore";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Legend
} from "recharts";
import {
  AlertTriangle, CheckCircle2, Clock, Users, TrendingUp,
  Search, Filter, ChevronDown, X, Eye, RefreshCw,
  Building2, UserCheck, ShieldCheck, Layers, ArrowUpRight,
  Circle, BarChart2, PieChart as PieIcon, ChevronRight
} from "lucide-react";

// ── Types & helpers ──────────────────────────────────────────
const PRIORITY_CFG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  High:   { label: "High",   color: "text-red-700",    bg: "bg-red-50 border border-red-200",    dot: "bg-red-500" },
  Medium: { label: "Medium", color: "text-orange-700", bg: "bg-orange-50 border border-orange-200", dot: "bg-orange-500" },
  Low:    { label: "Low",    color: "text-green-700",  bg: "bg-green-50 border border-green-200",  dot: "bg-green-500" },
};
const STATUS_CFG: Record<Status, { label: string; color: string; bg: string }> = {
  "New":                 { label: "New",                 color: "text-blue-700",   bg: "bg-blue-50 border border-blue-200" },
  "Categorized":         { label: "Categorized",         color: "text-purple-700", bg: "bg-purple-50 border border-purple-200" },
  "Assigned":            { label: "Assigned",            color: "text-indigo-700", bg: "bg-indigo-50 border border-indigo-200" },
  "In Progress":         { label: "In Progress",         color: "text-yellow-700", bg: "bg-yellow-50 border border-yellow-200" },
  "Pending Verification":{ label: "Pending Verification",color: "text-orange-700", bg: "bg-orange-50 border border-orange-200" },
  "Resolved":            { label: "Resolved",            color: "text-green-700",  bg: "bg-green-50 border border-green-200" },
  "Closed":              { label: "Closed",              color: "text-gray-600",   bg: "bg-gray-100 border border-gray-200" },
};

const PIE_COLORS = ["#3B82F6","#A855F7","#6366F1","#EAB308","#F97316","#22C55E","#6B7280"];

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CFG[priority] ?? PRIORITY_CFG.Medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG["New"];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

function KPICard({
  icon: Icon, label, value, sub, color
}: { icon: any; label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Modals ───────────────────────────────────────────────────
function AssignModal({
  complaint, onClose, onAssign
}: { complaint: Complaint; onClose: () => void; onAssign: (dept: string, officer: string) => void }) {
  const [dept, setDept]       = useState(complaint.dept);
  const [officer, setOfficer] = useState(complaint.assignedTo || "");

  const depts = [
    "Water Supply Department", "Electricity Board", "Roads & PWD",
    "Sanitation Department", "Public Health", "Parks Department",
    "Drainage & Sewerage", "Municipal Enforcement", "General Administration",
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Assign / Reassign — {complaint.id}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Department</label>
            <select
              value={dept}
              onChange={e => setDept(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {depts.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Assign Officer</label>
            <input
              value={officer}
              onChange={e => setOfficer(e.target.value)}
              placeholder="Officer name or ID…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => { onAssign(dept, officer); onClose(); }}
            className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
          >
            Save Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

function ViewModal({ complaint, onClose }: { complaint: Complaint; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-sm font-mono font-bold text-blue-600">{complaint.id}</span>
            <h3 className="font-bold text-gray-900 mt-0.5">{complaint.issue}</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Citizen",    complaint.citizen],
              ["Phone",      complaint.phone],
              ["Ward",       complaint.ward],
              ["Category",   complaint.category],
              ["Department", complaint.dept],
              ["Assigned To",complaint.assignedTo || "—"],
              ["Submitted",  formatDate(complaint.timestamp)],
              ["Source",     complaint.source === "voice" ? "🎙️ Voice (Tamil)" : "Web"],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                <p className="font-semibold text-gray-800">{v}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Complaint Summary</p>
            <p className="text-gray-700 leading-relaxed">{complaint.aiSummary || complaint.description}</p>
          </div>

          {complaint.source === "voice" && complaint.originalComplaintTamil && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-500 font-bold uppercase mb-1">Original Voice Transcript (Tamil)</p>
              <p className="text-sm text-gray-700 leading-relaxed font-tamil">{complaint.originalComplaintTamil}</p>
            </div>
          )}

          {complaint.translatedEnglish && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">English Translation</p>
              <p className="text-gray-700 leading-relaxed">{complaint.translatedEnglish}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function AdminPanel() {
  const { allComplaints, updateStatus, assignComplaint } = useComplaints();

  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [filterPriority, setFilterPriority] = useState<Priority | "All">("All");
  const [filterDept, setFilterDept]   = useState("All");
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [viewTarget, setViewTarget]   = useState<Complaint | null>(null);
  const [page, setPage]               = useState(1);
  const PER_PAGE = 10;

  // ── KPI stats ──
  const stats = useMemo(() => ({
    total:      allComplaints.length,
    pending:    allComplaints.filter(c => ["New","Categorized","Assigned"].includes(c.status)).length,
    inProgress: allComplaints.filter(c => c.status === "In Progress").length,
    resolved:   allComplaints.filter(c => ["Resolved","Closed"].includes(c.status)).length,
    high:       allComplaints.filter(c => c.priority === "High").length,
  }), [allComplaints]);

  // ── Chart data ──
  const deptChart = useMemo(() => {
    const map: Record<string, number> = {};
    allComplaints.forEach(c => { map[c.dept] = (map[c.dept] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 7)
      .map(([name, count]) => ({ name: name.replace(" Department", "").replace(" Board", ""), count }));
  }, [allComplaints]);

  const wardChart = useMemo(() => {
    const map: Record<string, number> = {};
    allComplaints.forEach(c => { map[c.ward] = (map[c.ward] ?? 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [allComplaints]);

  const statusChart = useMemo(() => {
    const map: Record<string, number> = {};
    allComplaints.forEach(c => { map[c.status] = (map[c.status] ?? 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [allComplaints]);

  const dateChart = useMemo(() => {
    const map: Record<string, number> = {};
    allComplaints.forEach(c => {
      const d = new Date(c.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      map[d] = (map[d] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-14)
      .map(([date, count]) => ({ date, count }));
  }, [allComplaints]);

  // ── Filtered table ──
  const allDepts = useMemo(() => ["All", ...Array.from(new Set(allComplaints.map(c => c.dept)))], [allComplaints]);

  const filtered = useMemo(() => {
    let list = [...allComplaints];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.citizen.toLowerCase().includes(q) ||
        c.dept.toLowerCase().includes(q) ||
        c.ward.toLowerCase().includes(q) ||
        c.assignedTo.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "All")   list = list.filter(c => c.status === filterStatus);
    if (filterPriority !== "All") list = list.filter(c => c.priority === filterPriority);
    if (filterDept !== "All")     list = list.filter(c => c.dept === filterDept);
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [allComplaints, search, filterStatus, filterPriority, filterDept]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const statuses: (Status | "All")[] = ["All","New","Categorized","Assigned","In Progress","Pending Verification","Resolved","Closed"];
  const priorities: (Priority | "All")[] = ["All","High","Medium","Low"];

  const handleClose = (id: string) => updateStatus(id, "Closed", "Closed by Admin");

  return (
    <DashboardLayout 
      title="Admin Portal — Complaint Management"
      subtitle="Monitor, assign, and manage all citizen complaints from the voice-based submission system"
    >
      <div className="space-y-6">
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KPICard icon={Layers}       label="Total Complaints" value={stats.total}      color="bg-blue-500"   />
            <KPICard icon={Clock}        label="Pending"          value={stats.pending}     color="bg-purple-500" sub="New + Categorized + Assigned" />
            <KPICard icon={TrendingUp}   label="In Progress"      value={stats.inProgress}  color="bg-yellow-500" />
            <KPICard icon={CheckCircle2} label="Resolved"         value={stats.resolved}    color="bg-green-500"  />
            <KPICard icon={AlertTriangle}label="High Priority"    value={stats.high}        color="bg-red-500"    />
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By Department */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" /> Complaints by Department
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptChart} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* By Status (Pie) */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-500" /> Complaints by Status
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 9 }}>
                    {statusChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* By Ward */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> Complaints by Ward
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={wardChart} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* By Date (Line) */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" /> Complaints Over Time
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dateChart} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Line type="monotone" dataKey="count" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Complaint Table ── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Table toolbar */}
            <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-500" />
                All Complaints
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full font-bold">{filtered.length}</span>
              </h3>

              <div className="flex-1 min-w-0" />

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search…"
                  className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-44"
                />
              </div>

              {[
                { value: filterStatus,   setValue: (v: string) => { setFilterStatus(v as Status | "All"); setPage(1); },   options: statuses,   placeholder: "Status" },
                { value: filterPriority, setValue: (v: string) => { setFilterPriority(v as Priority | "All"); setPage(1); }, options: priorities, placeholder: "Priority" },
                { value: filterDept,     setValue: (v: string) => { setFilterDept(v); setPage(1); },                        options: allDepts,   placeholder: "Department" },
              ].map(({ value, setValue, options, placeholder }) => (
                <div key={placeholder} className="relative">
                  <select
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="pl-3 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none text-gray-700 font-medium"
                  >
                    {options.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Complaint ID","Citizen","Department","Ward","Assigned Officer","Status","Priority","Date","Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageData.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                        No complaints match your filters.
                      </td>
                    </tr>
                  )}
                  {pageData.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-blue-600">{c.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 whitespace-nowrap">{c.citizen}</p>
                        <p className="text-xs text-gray-400">{c.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-xs">{c.dept}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs whitespace-nowrap">{c.ward}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {c.assignedTo || <span className="text-gray-300 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(c.timestamp)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* View */}
                          <button
                            onClick={() => setViewTarget(c)}
                            title="View Complaint"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Assign */}
                          <button
                            onClick={() => setAssignTarget(c)}
                            title="Assign Department / Officer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          {/* Close */}
                          <button
                            onClick={() => handleClose(c.id)}
                            disabled={c.status === "Closed"}
                            title="Close Complaint"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 font-semibold text-gray-700">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Modals */}
      {assignTarget && (
        <AssignModal
          complaint={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssign={(dept, officer) => assignComplaint(assignTarget.id, dept, officer)}
        />
      )}
      {viewTarget && (
        <ViewModal complaint={viewTarget} onClose={() => setViewTarget(null)} />
      )}
    </DashboardLayout>
  );
}
