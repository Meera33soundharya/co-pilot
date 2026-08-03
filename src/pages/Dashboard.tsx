import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
    MessageSquare, Activity, ChevronRight, Zap,
    Brain, Sparkles, Loader2, Shield, Eye, X, MapPin, User,
    TrendingUp, TrendingDown, Award, Bell,
    Users, Building2, AlertTriangle, CheckCircle2, Clock,
    BarChart3, FileText, Settings, Search, RefreshCw,
    Filter, Download
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";

const DEPT_COLORS: Record<string, string> = {
    "Water Supply": "#3b82f6",
    "Roads & PWD": "#f97316",
    "Electricity Board": "#eab308",
    "Sanitation": "#22c55e",
    "Public Health": "#ec4899",
    "Revenue": "#8b5cf6",
    "Police": "#ef4444",
    "Education": "#06b6d4",
    "General Administration": "#94a3b8",
};

const STATUS_COLORS: Record<string, string> = {
    "Submitted":   "#94a3b8",
    "Assigned":    "#3b82f6",
    "Accepted":    "#06b6d4",
    "In Progress": "#f59e0b",
    "Resolved":    "#10b981",
    "Closed":      "#6366f1",
};

export default function Dashboard() {
    const { complaints, currentUser, notifications } = useComplaints();
    const navigate = useNavigate();
    const [viewGrievance, setViewGrievance] = useState<any>(null);
    const [viewNotification, setViewNotification] = useState<any>(null);

    const isAdmin = currentUser?.role === "admin";
    const isOfficer = currentUser?.role === "officer";
    const isCitizen = currentUser?.role === "citizen";

    // Admin tabs
    const [adminTab, setAdminTab] = useState<"overview"|"analytics"|"manage"|"search">("overview");

    // AI Briefing state
    const [briefing, setBriefing] = useState<string | null>(null);
    const [generatingBrief, setGeneratingBrief] = useState(false);

    // Complaint table state
    const [tableQ, setTableQ] = useState("");
    const [tableStatus, setTableStatus] = useState("All");

    // Search state (Task 7)
    const [searchQ, setSearchQ] = useState("");
    const [searchDept, setSearchDept] = useState("All");
    const [searchPri, setSearchPri] = useState("All");

    const location = useLocation();

    // Check for notification ID in URL to open modal
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const notifId = params.get("notificationId");
        if (notifId) {
            const n = notifications.find(x => x.id === notifId);
            if (n) {
                setViewNotification(n);
                navigate("/dashboard", { replace: true });
            }
        }
    }, [location.search, notifications, navigate]);

    // Redirect citizens to their portal
    useEffect(() => {
        if (isCitizen) navigate("/citizen");
    }, [isCitizen, navigate]);

    // Live stats
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;
    const closed = complaints.filter(c => c.status === "Closed").length;
    const highPri = complaints.filter(c => c.priority === "High" && c.status !== "Closed" && c.status !== "Resolved").length;
    const assigned = complaints.filter(c => c.status === "Assigned" || c.status === "In Progress").length;
    const resoPct = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const healthScore = Math.min(100, Math.max(0, Math.round(
        (resoPct * 0.5) +
        ((100 - (highPri / Math.max(total, 1)) * 100) * 0.3) +
        ((assigned / Math.max(total, 1)) * 100 * 0.2)
    )));

    // ── Admin Analytics ──────────────────────────────────────────
    const deptBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        complaints.forEach(c => {
            const dept = c.dept || "General Administration";
            map[dept] = (map[dept] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value).slice(0, 8);
    }, [complaints]);

    const statusBreakdown = useMemo(() => {
        const map: Record<string, number> = {};
        complaints.forEach(c => { map[c.status] = (map[c.status] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [complaints]);

    const priorityBreakdown = useMemo(() => [
        { name: "High", value: complaints.filter(c => c.priority === "High").length, color: "#ef4444" },
        { name: "Medium", value: complaints.filter(c => c.priority === "Medium").length, color: "#f59e0b" },
        { name: "Low", value: complaints.filter(c => c.priority === "Low").length, color: "#22c55e" },
    ], [complaints]);

    // Last-7-days trend
    const trendData = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const dayEnd = dayStart + 86400000;
            const day = complaints.filter(c => c.timestamp >= dayStart && c.timestamp < dayEnd);
            return {
                day: d.toLocaleDateString("en-IN", { weekday: "short" }),
                submitted: day.length,
                resolved: day.filter(c => c.status === "Resolved" || c.status === "Closed").length,
            };
        });
    }, [complaints]);

    // Ward hotspots
    const wardHotspots = useMemo(() => {
        const map: Record<string, number> = {};
        complaints.forEach(c => { map[c.ward] = (map[c.ward] || 0) + 1; });
        return Object.entries(map).map(([ward, count]) => ({ ward, count }))
            .sort((a, b) => b.count - a.count).slice(0, 6);
    }, [complaints]);

    // Unique departments and officers
    const uniqueDepts = useMemo(() => [...new Set(complaints.map(c => c.dept).filter(Boolean))], [complaints]);
    const uniqueOfficers = useMemo(() => [...new Set(complaints.map(c => c.assignedTo).filter(Boolean))], [complaints]);

    // Filtered complaints for table
    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            if (tableStatus !== "All" && c.status !== tableStatus) return false;
            if (tableQ && !(`${c.issue} ${c.description} ${c.ward} ${c.citizen}`.toLowerCase()).includes(tableQ.toLowerCase())) return false;
            return true;
        });
    }, [complaints, tableQ, tableStatus]);

    // System-wide search results (Task 7)
    const searchResults = useMemo(() => {
        if (!searchQ && searchDept === "All" && searchPri === "All") return [];
        return complaints.filter(c => {
            const matchQ = !searchQ || [c.id, c.citizen, c.ward, c.issue, c.description, c.dept]
                .join(" ").toLowerCase().includes(searchQ.toLowerCase());
            const matchDept = searchDept === "All" || c.dept === searchDept;
            const matchPri = searchPri === "All" || c.priority === searchPri;
            return matchQ && matchDept && matchPri;
        });
    }, [complaints, searchQ, searchDept, searchPri]);

    // Urgent queue
    const urgentQueue = complaints
        .filter(c => c.status !== "Closed" && c.status !== "Resolved")
        .sort((a, b) => {
            const p: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
            return (p[b.priority] - p[a.priority]) || (b.timestamp - a.timestamp);
        }).slice(0, 6);

    // Recent notifications
    const recentNotifs = notifications.slice(0, 4);

    function generateBriefing() {
        setGeneratingBrief(true);
        setBriefing(null);
        setTimeout(() => {
            const topDept = deptBreakdown[0]?.name ?? "Roads";
            const topWard = wardHotspots[0]?.ward ?? "Ward 03";
            setBriefing(
                `📋 AI Executive Briefing — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}\n\n` +
                `🔴 Total Active Complaints: ${total - resolved - closed}\n` +
                `⚡ High Priority Pending: ${highPri}\n` +
                `✅ Resolution Rate: ${resoPct}% (${resolved}/${total})\n` +
                `🏥 Constituency Health Score: ${healthScore}/100\n\n` +
                `📌 Top Department Under Pressure: ${topDept}\n` +
                `📍 Hotspot Ward: ${topWard} — ${wardHotspots[0]?.count ?? 0} complaints logged\n\n` +
                `💡 AI Suggestion: Deploy additional ${topDept} personnel to ${topWard} immediately.\n\n` +
                `🔍 Forecast: Resolving these clusters will improve Health Score by +8 within 48 hours.`
            );
            setGeneratingBrief(false);
        }, 1800);
    }

    // ── CSV Export ─────────────────────────────────────────────────
    function exportCSV() {
        const headers = ["ID,Citizen,Ward,Issue,Category,Dept,Priority,Status,Time"];
        const rows = complaints.map(c =>
            `${c.id},${c.citizen},${c.ward},"${c.issue}",${c.category},${c.dept},${c.priority},${c.status},${c.time}`
        );
        const csv = [headers, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `govpilot_complaints_${Date.now()}.csv`; a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <DashboardLayout title="Dashboard" subtitle={
            isAdmin ? "Live overview — all complaints" :
            isOfficer ? `Your dept: ${currentUser?.dept}` :
            "Your complaint status"
        }>
            <div className="space-y-8 pb-10 relative">

                {/* ── GRIEVANCE DETAIL SIDE-TRAY ────────────────── */}
                {viewGrievance && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-end p-4 lg:p-8">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setViewGrievance(null)} />
                        <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg h-full overflow-hidden animate-slide-left border border-white/20">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] pointer-events-none" />
                            <div className="p-10 space-y-8 relative z-10 h-full overflow-y-auto">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                            <Shield className="w-7 h-7 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 uppercase italic">Complaint Detail</h3>
                                            <p className="text-sm text-gray-400 font-black uppercase tracking-widest">ID: {viewGrievance.id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setViewGrievance(null)} className="p-3 rounded-2xl hover:bg-gray-100 text-gray-300 transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={`px-4 py-1.5 rounded-xl text-sm font-black uppercase tracking-widest border ${viewGrievance.priority === 'High' ? 'bg-red-50 border-red-100 text-red-600' : viewGrievance.priority === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                                                {viewGrievance.priority} Priority
                                            </span>
                                            <span className="px-4 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-sm font-black uppercase tracking-widest text-gray-400">
                                                {viewGrievance.status}
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-black text-gray-900 italic uppercase leading-tight">{viewGrievance.issue}</h4>
                                        <p className="text-gray-500 font-medium leading-relaxed">{viewGrievance.description || "No description provided."}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: "Citizen", value: viewGrievance.citizen, icon: <User className="w-3.5 h-3.5 text-gray-400" /> },
                                            { label: "Ward", value: viewGrievance.ward, icon: <MapPin className="w-3.5 h-3.5 text-gray-400" /> },
                                            { label: "Department", value: viewGrievance.dept || "Unassigned", icon: <Building2 className="w-3.5 h-3.5 text-gray-400" /> },
                                            { label: "Category", value: viewGrievance.category, icon: <FileText className="w-3.5 h-3.5 text-gray-400" /> },
                                        ].map(item => (
                                            <div key={item.label} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {item.icon}
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                                                </div>
                                                <p className="font-black text-gray-900 uppercase italic text-sm truncate">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {viewGrievance.estimatedTime && (
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <div>
                                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Est. Resolution</p>
                                                <p className="text-blue-700 font-black text-sm">{viewGrievance.estimatedTime}</p>
                                            </div>
                                        </div>
                                    )}

                                    {viewGrievance.audit?.length > 0 && (
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Audit Trail</p>
                                            {viewGrievance.audit.slice(-3).map((a: any, i: number) => (
                                                <div key={i} className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                                                    <p className="text-xs text-gray-500"><span className="font-bold">{a.action}</span> — {a.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => { navigate(`/grievances?id=${viewGrievance.id}`); setViewGrievance(null); }} className="flex-1 py-4 bg-gray-900 text-white rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                                        Full Log
                                    </button>
                                    <button onClick={() => setViewGrievance(null)} className="px-8 py-4 bg-gray-200 text-gray-900 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-gray-300 transition-all">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── NOTIFICATION DETAIL SIDE-TRAY ────────────────── */}
                {viewNotification && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-end p-4 lg:p-8">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setViewNotification(null)} />
                        <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-slide-left border border-white/20">
                            <div className="p-10 space-y-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                            <Bell className="w-7 h-7 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 uppercase italic">{viewNotification.title}</h3>
                                            <p className="text-sm text-gray-400 font-black uppercase tracking-widest">{viewNotification.time}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setViewNotification(null)} className="p-3 rounded-2xl hover:bg-gray-100 transition-colors">
                                        <X className="w-5 h-5 text-gray-300" />
                                    </button>
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">{viewNotification.message}</p>
                                {viewNotification.complaintId && (
                                    <button onClick={() => { navigate(`/grievances?id=${viewNotification.complaintId}`); setViewNotification(null); }}
                                        className="w-full py-4 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-600 transition-all">
                                        View Complaint
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STAT CARDS ─────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: "Total", value: total, icon: <MessageSquare className="w-5 h-5" />, color: "from-gray-900 to-gray-700", text: "text-white" },
                        { label: "High Priority", value: highPri, icon: <AlertTriangle className="w-5 h-5" />, color: "from-red-600 to-red-800", text: "text-white" },
                        { label: "In Progress", value: assigned, icon: <Activity className="w-5 h-5" />, color: "from-amber-500 to-amber-700", text: "text-white" },
                        { label: "Resolved", value: resolved, icon: <CheckCircle2 className="w-5 h-5" />, color: "from-emerald-500 to-emerald-700", text: "text-white" },
                        { label: "Closed", value: closed, icon: <Shield className="w-5 h-5" />, color: "from-indigo-500 to-indigo-700", text: "text-white" },
                        { label: "Reso. Rate", value: `${resoPct}%`, icon: <Award className="w-5 h-5" />, color: "from-blue-500 to-blue-700", text: "text-white" },
                    ].map(stat => (
                        <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-3xl p-5 shadow-lg relative overflow-hidden`}>
                            <div className="flex items-center gap-2 mb-3 opacity-70">
                                {stat.icon}
                                <span className={`text-[10px] font-black uppercase tracking-widest ${stat.text} opacity-70`}>{stat.label}</span>
                            </div>
                            <p className={`text-3xl font-black italic ${stat.text}`}>{stat.value}</p>
                            <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-white/5 rounded-full" />
                        </div>
                    ))}
                </div>

                {/* ── ADMIN TABS ──────────────────────────────────── */}
                {isAdmin && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {([
                            { key: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
                            { key: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
                            { key: "manage", label: "Management", icon: <Users className="w-4 h-4" /> },
                            { key: "search", label: "Search & Filter", icon: <Search className="w-4 h-4" /> },
                        ] as const).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setAdminTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                    adminTab === tab.key
                                        ? "bg-gray-900 text-white shadow-lg"
                                        : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400"
                                }`}
                            >
                                {tab.icon}{tab.label}
                            </button>
                        ))}
                        <button onClick={exportCSV} className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all whitespace-nowrap">
                            <Download className="w-4 h-4" />Export CSV
                        </button>
                    </div>
                )}

                {/* ── OVERVIEW TAB ────────────────────────────────── */}
                {(!isAdmin || adminTab === "overview") && (
                    <>
                        {/* AI Briefing + Health Score */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/3 blur-[100px] pointer-events-none" />
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-gray-900 rounded-[1.5rem]">
                                            <Brain className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 uppercase italic">AI Intelligence Sweep</h3>
                                            <p className="text-sm text-gray-400 font-black uppercase tracking-widest">Executive Briefing Engine</p>
                                        </div>
                                    </div>
                                    <button onClick={generateBriefing} disabled={generatingBrief}
                                        className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[#B91C1C] transition-all disabled:opacity-60">
                                        {generatingBrief ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : <><Sparkles className="w-4 h-4" />Generate</>}
                                    </button>
                                </div>
                                {briefing ? (
                                    <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 relative">
                                        <pre className="text-base font-bold text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{briefing}</pre>
                                        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200/50">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Decision Support Active</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center">
                                        <Sparkles className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Request AI intelligence sweep to begin</p>
                                    </div>
                                )}
                            </div>

                            {/* Health Score */}
                            <div className="bg-gray-900 rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-[#B91C1C]" />
                                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] pointer-events-none" />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-white/20" />
                                        <h3 className="text-base font-black uppercase tracking-[0.3em] text-white/40 italic">Health Index</h3>
                                    </div>
                                    <div className="flex justify-center py-4">
                                        <div className="relative w-36 h-36">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
                                                <circle cx="18" cy="18" r="15.9" fill="none"
                                                    stroke={healthScore >= 70 ? "#10B981" : healthScore >= 40 ? "#F59E0B" : "#B91C1C"}
                                                    strokeWidth="3.5"
                                                    strokeDasharray={`${(healthScore / 100) * 100} 100`}
                                                    strokeLinecap="round"
                                                    style={{ transition: "stroke-dasharray 1.5s ease" }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-5xl font-black tracking-tighter italic">{healthScore}</span>
                                                <span className="text-xs font-black text-white/20 uppercase">/ 100</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-2xl font-black uppercase italic ${healthScore >= 70 ? "text-emerald-400" : healthScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                                            {healthScore >= 70 ? "Stable" : healthScore >= 40 ? "Needs Attention" : "Critical"}
                                        </p>
                                        <p className="text-sm text-white/30 font-black uppercase tracking-widest mt-1">Constituency Index</p>
                                    </div>
                                    {/* Mini stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: "Depts Active", value: uniqueDepts.length },
                                            { label: "Officers", value: uniqueOfficers.length },
                                        ].map(s => (
                                            <div key={s.label} className="bg-white/5 rounded-2xl p-3 text-center">
                                                <p className="text-xl font-black">{s.value}</p>
                                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Urgent Queue */}
                        <div className="bg-white border border-gray-100 rounded-[3.5rem] overflow-hidden shadow-sm">
                            <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                                    <h3 className="text-lg font-black text-gray-900 uppercase italic">Urgent Operation Queue</h3>
                                </div>
                                <button onClick={() => navigate("/grievances")} className="text-sm font-black uppercase tracking-[0.2em] text-[#B91C1C] hover:text-black flex items-center gap-2 transition-colors">
                                    Full Log <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {urgentQueue.slice(0, 5).map(c => (
                                    <div key={c.id} className="flex items-center gap-6 px-10 py-5 hover:bg-red-50/20 transition-all cursor-pointer group" onClick={() => setViewGrievance(c)}>
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-[#B91C1C] transition-all shrink-0 relative">
                                            <span className="text-sm font-black text-gray-900 group-hover:text-white font-mono">{c.id.split("-")[1]}</span>
                                            {c.priority === "High" && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse" />}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <h4 className="text-base font-black text-gray-900 truncate uppercase italic">{c.issue}</h4>
                                            <p className="text-sm text-gray-400 font-bold uppercase">{c.citizen} · {c.ward} · {c.dept || "Unassigned"}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-black px-3 py-1 rounded-xl border uppercase tracking-widest ${c.priority === "High" ? "bg-red-50 border-red-100 text-red-600" : c.priority === "Medium" ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
                                                {c.priority}
                                            </span>
                                            <Eye className="w-4 h-4 text-gray-300 group-hover:text-gray-700 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                                {urgentQueue.length === 0 && (
                                    <div className="px-10 py-12 text-center text-gray-400 font-bold">✅ No urgent complaints pending</div>
                                )}
                            </div>
                        </div>

                        {/* Complaint Table + Notifications */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                            <MessageSquare className="w-5 h-5 text-[#B91C1C]" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 uppercase italic">Complaint Monitor</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input value={tableQ} onChange={e => setTableQ(e.target.value)} placeholder="Search..." className="px-4 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-red-300 transition-all" />
                                        <select value={tableStatus} onChange={e => setTableStatus(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none">
                                            <option>All</option>
                                            <option>Submitted</option>
                                            <option>Assigned</option>
                                            <option>In Progress</option>
                                            <option>Resolved</option>
                                            <option>Closed</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="text-left text-xs text-gray-400 uppercase tracking-widest font-black">
                                            <tr>
                                                <th className="p-3">ID</th>
                                                <th className="p-3">Issue</th>
                                                <th className="p-3">Ward</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Priority</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredComplaints.slice(0, 8).map(c => (
                                                <tr key={c.id} className="border-t border-gray-50 hover:bg-red-50/20 transition-colors cursor-pointer" onClick={() => setViewGrievance(c)}>
                                                    <td className="p-3 font-black text-gray-900 text-xs">{c.id}</td>
                                                    <td className="p-3 font-bold text-gray-700 truncate max-w-[180px]">{c.issue}</td>
                                                    <td className="p-3 text-gray-500 text-xs">{c.ward}</td>
                                                    <td className="p-3">
                                                        <span className={`text-xs font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                                                            c.status === "Resolved" ? "bg-emerald-50 text-emerald-600" :
                                                            c.status === "In Progress" ? "bg-amber-50 text-amber-600" :
                                                            c.status === "Closed" ? "bg-indigo-50 text-indigo-600" :
                                                            "bg-gray-50 text-gray-500"
                                                        }`}>{c.status}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`text-xs font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                                                            c.priority === "High" ? "bg-red-50 text-red-600" :
                                                            c.priority === "Medium" ? "bg-amber-50 text-amber-600" :
                                                            "bg-gray-50 text-gray-500"
                                                        }`}>{c.priority}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredComplaints.length === 0 && (
                                        <p className="text-center text-gray-400 font-bold py-8 text-sm">No complaints match the filter.</p>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                    <button onClick={() => navigate("/grievances")} className="text-sm font-black text-[#B91C1C] uppercase tracking-widest hover:text-gray-900 flex items-center gap-2 mx-auto transition-colors">
                                        View All ({filteredComplaints.length}) <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Notification Center */}
                            <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                        <Bell className="w-5 h-5 text-[#B91C1C]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 uppercase italic">Notifications</h3>
                                        <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em]">Recent alerts</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {recentNotifs.length === 0 ? (
                                        <div className="text-center py-10">
                                            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No notifications yet</p>
                                        </div>
                                    ) : (
                                        recentNotifs.map(n => (
                                            <div key={n.id} onClick={() => setViewNotification(n)} className={`p-4 rounded-2xl border transition-all hover:shadow-sm cursor-pointer ${!n.read ? "bg-red-50/30 border-red-100" : "bg-gray-50 border-gray-100"}`}>
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-[#B91C1C]" : "bg-gray-300"}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight mb-1 truncate">{n.title}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                                                        <p className="text-xs font-black text-gray-400 uppercase mt-1">{n.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── ANALYTICS TAB ────────────────────────────────── */}
                {isAdmin && adminTab === "analytics" && (
                    <div className="space-y-8">
                        {/* 7-Day Trend */}
                        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6 flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-[#B91C1C]" />7-Day Complaint Trend
                            </h3>
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="submitted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e2e8f0", fontSize: 12 }} />
                                    <Legend />
                                    <Area type="monotone" dataKey="submitted" stroke="#B91C1C" fill="url(#submitted)" name="Submitted" strokeWidth={2} />
                                    <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#resolved)" name="Resolved" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Dept breakdown */}
                            <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6 flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-[#B91C1C]" />Complaints by Department
                                </h3>
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={deptBreakdown} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 11 }} />
                                        <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 11 }} />
                                        <Bar dataKey="value" name="Complaints" radius={[0, 8, 8, 0]}>
                                            {deptBreakdown.map((entry, index) => (
                                                <Cell key={index} fill={DEPT_COLORS[entry.name] || "#94a3b8"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Priority donut */}
                            <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6">Priority Split</h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={priorityBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                            {priorityBreakdown.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-2 mt-2">
                                    {priorityBreakdown.map(p => (
                                        <div key={p.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                                <span className="text-xs font-black text-gray-500 uppercase">{p.name}</span>
                                            </div>
                                            <span className="text-sm font-black text-gray-900">{p.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Status breakdown + Ward hotspots */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6">Status Distribution</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={statusBreakdown}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }} />
                                        <Bar dataKey="value" name="Complaints" radius={[6, 6, 0, 0]}>
                                            {statusBreakdown.map((entry, index) => (
                                                <Cell key={index} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6 flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-[#B91C1C]" />Ward Hotspots
                                </h3>
                                <div className="space-y-3">
                                    {wardHotspots.map((w, i) => (
                                        <div key={w.ward} className="flex items-center gap-4">
                                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500">{i + 1}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-black text-gray-700">{w.ward}</span>
                                                    <span className="text-sm font-black text-gray-900">{w.count}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-700 transition-all"
                                                        style={{ width: `${Math.min(100, (w.count / (wardHotspots[0]?.count || 1)) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {wardHotspots.length === 0 && <p className="text-gray-400 text-sm font-bold text-center py-6">No ward data yet</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MANAGEMENT TAB ──────────────────────────────── */}
                {isAdmin && adminTab === "manage" && (
                    <div className="space-y-8">
                        {/* System Stats row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { label: "Active Departments", value: uniqueDepts.length || 0, icon: <Building2 className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 border-blue-100" },
                                { label: "Officers On Record", value: uniqueOfficers.length || 0, icon: <Users className="w-5 h-5 text-purple-500" />, color: "bg-purple-50 border-purple-100" },
                                { label: "Notifications Sent", value: notifications.length, icon: <Bell className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 border-amber-100" },
                            ].map(s => (
                                <div key={s.label} className={`${s.color} border rounded-3xl p-6 flex items-center gap-4`}>
                                    <div className="p-3 bg-white rounded-2xl shadow-sm">{s.icon}</div>
                                    <div>
                                        <p className="text-2xl font-black text-gray-900">{s.value}</p>
                                        <p className="text-xs text-gray-500 font-black uppercase tracking-wider">{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Dept performance table */}
                        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6 flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-[#B91C1C]" />Department Performance
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs text-gray-400 uppercase tracking-widest font-black">
                                            <th className="p-3">Department</th>
                                            <th className="p-3">Total</th>
                                            <th className="p-3">In Progress</th>
                                            <th className="p-3">Resolved</th>
                                            <th className="p-3">Reso. Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deptBreakdown.map(dept => {
                                            const dc = complaints.filter(c => c.dept === dept.name);
                                            const dr = dc.filter(c => c.status === "Resolved" || c.status === "Closed").length;
                                            const dp = dc.filter(c => c.status === "In Progress").length;
                                            const dpct = dc.length > 0 ? Math.round((dr / dc.length) * 100) : 0;
                                            return (
                                                <tr key={dept.name} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DEPT_COLORS[dept.name] || "#94a3b8" }} />
                                                            <span className="font-black text-gray-800 text-xs">{dept.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 font-black text-gray-700">{dc.length}</td>
                                                    <td className="p-3 font-bold text-amber-600">{dp}</td>
                                                    <td className="p-3 font-bold text-emerald-600">{dr}</td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[60px]">
                                                                <div className={`h-2 rounded-full ${dpct >= 70 ? "bg-emerald-500" : dpct >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                                                                    style={{ width: `${dpct}%` }} />
                                                            </div>
                                                            <span className="text-xs font-black text-gray-700">{dpct}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {deptBreakdown.length === 0 && (
                                    <p className="text-center text-gray-400 py-8 font-bold text-sm">No department data yet. Submit complaints to populate this table.</p>
                                )}
                            </div>
                        </div>

                        {/* Officers performance */}
                        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6 flex items-center gap-3">
                                <Users className="w-5 h-5 text-[#B91C1C]" />Assigned Officers
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {uniqueOfficers.slice(0, 9).map(officer => {
                                    const oc = complaints.filter(c => c.assignedTo === officer);
                                    const or = oc.filter(c => c.status === "Resolved" || c.status === "Closed").length;
                                    const opct = oc.length > 0 ? Math.round((or / oc.length) * 100) : 0;
                                    return (
                                        <div key={officer} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-gray-900 truncate">{officer}</p>
                                                    <p className="text-xs text-gray-400">{oc.length} cases</p>
                                                </div>
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${opct >= 70 ? "bg-emerald-100 text-emerald-700" : opct >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                                    {opct}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full ${opct >= 70 ? "bg-emerald-500" : opct >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                                                    style={{ width: `${opct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {uniqueOfficers.length === 0 && (
                                    <p className="text-gray-400 text-sm font-bold col-span-3 text-center py-6">No officers assigned yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SEARCH & FILTER TAB (Task 7) ─────────────────── */}
                {isAdmin && adminTab === "search" && (
                    <div className="space-y-6">
                        {/* Search Bar */}
                        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6 flex items-center gap-3">
                                <Search className="w-5 h-5 text-[#B91C1C]" />System-Wide Search
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-3">
                                    <input
                                        value={searchQ}
                                        onChange={e => setSearchQ(e.target.value)}
                                        placeholder="Search by ID, citizen name, ward, issue, department..."
                                        className="w-full px-6 py-4 rounded-2xl border border-gray-200 text-sm font-semibold bg-gray-50 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Department</label>
                                    <select value={searchDept} onChange={e => setSearchDept(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-red-300">
                                        <option value="All">All Departments</option>
                                        {uniqueDepts.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                                    <select value={searchPri} onChange={e => setSearchPri(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-red-300">
                                        <option value="All">All Priorities</option>
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button onClick={() => { setSearchQ(""); setSearchDept("All"); setSearchPri("All"); }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 text-sm font-black text-gray-500 hover:bg-gray-100 transition-all">
                                        <RefreshCw className="w-4 h-4" />Reset
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        {(searchQ || searchDept !== "All" || searchPri !== "All") && (
                            <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black text-gray-900 uppercase italic">
                                        Results <span className="text-[#B91C1C]">({searchResults.length})</span>
                                    </h3>
                                    {searchResults.length > 0 && (
                                        <button onClick={exportCSV} className="flex items-center gap-2 text-sm font-black text-emerald-600 hover:text-emerald-800 transition-colors">
                                            <Download className="w-4 h-4" />Export
                                        </button>
                                    )}
                                </div>
                                {searchResults.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No matching complaints found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {searchResults.slice(0, 20).map(c => (
                                            <div key={c.id} onClick={() => setViewGrievance(c)}
                                                className="flex items-center gap-6 p-4 rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-black text-gray-600 font-mono">{c.id.split("-")[1]}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <p className="text-sm font-black text-gray-900 truncate">{c.issue}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{c.citizen} · {c.ward} · {c.dept}</p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className={`text-xs font-black px-2 py-1 rounded-lg uppercase ${
                                                        c.priority === "High" ? "bg-red-50 text-red-600" :
                                                        c.priority === "Medium" ? "bg-amber-50 text-amber-600" :
                                                        "bg-gray-50 text-gray-500"
                                                    }`}>{c.priority}</span>
                                                    <span className="text-xs font-black px-2 py-1 rounded-lg bg-gray-50 text-gray-500 uppercase">{c.status}</span>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-700 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                        {searchResults.length > 20 && (
                                            <p className="text-center text-xs font-black text-gray-400 uppercase tracking-widest pt-4">
                                                Showing 20 of {searchResults.length} results — use filters to narrow down
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
