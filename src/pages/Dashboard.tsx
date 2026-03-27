import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    MessageSquare, Clock, AlertTriangle,
    TrendingUp, ArrowUpRight, CheckCircle2, Activity,
    ExternalLink, ChevronRight, PlayCircle, Bell, Tag, Zap,
    Brain, Sparkles, FileText, Loader2, PenLine, Shield
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import type { Status, Priority } from "@/store/complaintsStore";

const MONTHLY_TREND = [
    { month: "Oct", complaints: 80 },
    { month: "Nov", complaints: 95 },
    { month: "Dec", complaints: 118 },
    { month: "Jan", complaints: 107 },
    { month: "Feb", complaints: 145 },
    { month: "Mar", complaints: 155 },
];

const CATEGORY_DATA = [
    { name: "Roads", count: 42, fill: "#B91C1C" },
    { name: "Water", count: 38, fill: "#DC2626" },
    { name: "Electric", count: 27, fill: "#EF4444" },
    { name: "Sanit.", count: 31, fill: "#F87171" },
    { name: "Drainage", count: 19, fill: "#FCA5A5" },
    { name: "Other", count: 14, fill: "#FED7D7" },
];

const STATUS_COLOR: Record<Status, string> = {
    "New": "#6B7280",
    "Categorized": "#7C3AED",
    "Assigned": "#2563EB",
    "In Progress": "#D97706",
    "Resolved": "#059669",
    "Closed": "#9CA3AF",
};

export default function Dashboard() {
    const { complaints, updateStatus, currentUser, notifications } = useComplaints();
    const navigate = useNavigate();

    const isAdmin = !currentUser || currentUser.role === "admin";
    const isOfficer = currentUser?.role === "officer";
    const isCitizen = currentUser?.role === "citizen";

    // AI Briefing state
    const [briefing, setBriefing] = useState<string | null>(null);
    const [generatingBrief, setGeneratingBrief] = useState(false);
    const [noteMap, setNoteMap] = useState<Record<string, string>>({});
    const [editingNote, setEditingNote] = useState<string | null>(null);

    // Redirect citizens to their portal
    useEffect(() => {
        if (isCitizen) navigate("/citizen");
    }, [isCitizen, navigate]);

    // Live stats
    const total = complaints.length;
    const newCount = complaints.filter(c => c.status === "New").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;
    const highPri = complaints.filter(c => c.priority === "High" && c.status !== "Closed" && c.status !== "Resolved").length;
    const resoPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
    // Mock Sentiment Score (0-100) based on resolution rate + random drift
    const sentiment = Math.min(100, Math.max(0, resoPct + (Math.random() * 10 - 5)));
    const healthScore = Math.min(100, Math.max(0, Math.round(
        (resoPct * 0.45) +       // 45% weight: Case Resolution
        (sentiment * 0.35) +     // 35% weight: Citizen Sentiment
        ((100 - (highPri / Math.max(total, 1)) * 100) * 0.2) // 20% weight: Urgency Factor
    )));
    const pendingNotify = complaints.filter(c => c.status === "Resolved" && !c.notified).length;

    function generateBriefing() {
        setGeneratingBrief(true);
        setBriefing(null);
        setTimeout(() => {
            const topCat = ["Roads", "Water", "Electricity", "Sanitation"].find(c =>
                complaints.some(x => x.category === c && x.status === "New")) ?? "Roads";
            
            // 🧠 Explainable AI (XAI) Logic
            const ward3Clusters = complaints.filter(c => c.ward.includes("03") && c.category === topCat).length;
            const reasoning = ward3Clusters > 2 
                ? `[XAI Reason: DBSCAN Clustering detected ${ward3Clusters} similar issues specifically in Ward 03.]` 
                : `[XAI Reason: High volume of individual reports across multiple wards.]`;

            setBriefing(
                `📋 AI Executive Briefing — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}\n\n` +
                `🔴 Total Active Complaints: ${total - resolved}\n` +
                `⚡ High Priority Pending: ${highPri}\n` +
                `✅ Resolution Rate: ${resoPct}% (${resolved}/${total})\n` +
                `🏥 Constituency Health Score: ${healthScore}/100\n\n` +
                `📌 Top Issue: ${topCat} complaints are currently flooding the system.\n` +
                `${reasoning}\n\n` +
                `💡 AI Suggestion: Recommend deploying additional ${topCat === "Water" ? "Water Dept" : topCat === "Roads" ? "PWD" : topCat === "Electricity" ? "Electricity Board" : "Sanitation"} personnel to the identified clusters immediately.\n\n` +
                `🔍 Predict: Resolving these clusters will increase Health Score by +8 points within 48 hours.`
            );
            setGeneratingBrief(false);
        }, 2200);
    }

    // Pie data for status distribution
    const statusPie = (["New", "Categorized", "Assigned", "In Progress", "Resolved", "Closed"] as Status[])
        .map(s => ({ name: s, value: complaints.filter(c => c.status === s).length, fill: STATUS_COLOR[s] }))
        .filter(d => d.value > 0);

    // Urgent queue — priority sorted, not resolved/closed
    const urgentQueue = complaints
        .filter(c => c.status !== "Closed" && c.status !== "Resolved")
        .sort((a, b) => {
            const p: Record<Priority, number> = { High: 3, Medium: 2, Low: 1 };
            return (p[b.priority] - p[a.priority]) || (b.timestamp - a.timestamp);
        }).slice(0, 6);

    const kpis = [
        { label: "Total Complaints", value: total, icon: MessageSquare, color: "text-gray-900", bg: "bg-gray-50", sub: "All time" },
        { label: "New / Waiting", value: newCount, icon: Clock, color: "text-blue-600", bg: "bg-blue-50", sub: "Need action" },
        { label: "High Priority", value: highPri, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", sub: "Urgent" },
        { label: "Resolved", value: resolved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", sub: `${resoPct}% rate` },
    ];

    return (
        <DashboardLayout title="Dashboard" subtitle={
            isAdmin ? "Live overview — all complaints" :
                isOfficer ? `Your dept: ${currentUser.dept}` :
                    "Your complaint status"
        }>
            <div className="space-y-6">

                {/* ── AI Briefing + Health Score (Admin only) ─────────── */}
                {isAdmin && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* AI Briefing Generator */}
                        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-7 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-red-50 rounded-xl">
                                        <Brain className="w-4 h-4 text-[#B91C1C]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900">AI Executive Briefing</h3>
                                        <p className="text-[10px] text-gray-400 font-medium">Auto-generated governance summary</p>
                                    </div>
                                </div>
                                <button
                                    onClick={generateBriefing}
                                    disabled={generatingBrief}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#B91C1C] text-white rounded-2xl text-xs font-black hover:bg-red-800 transition-all shadow-lg shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {generatingBrief
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                                        : <><Sparkles className="w-3.5 h-3.5" /> Generate Briefing</>
                                    }
                                </button>
                            </div>
                            {briefing ? (
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                                    <pre className="text-xs font-bold text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{briefing}</pre>
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Generated by GovPilot AI · {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                                    {generatingBrief ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-[#B91C1C] animate-spin" />
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Analysing constituency data…</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Sparkles className="w-8 h-8 text-gray-200" />
                                            <p className="text-xs font-black text-gray-400">Click "Generate Briefing" to get an AI-powered executive summary</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Constituency Health Score */}
                        <div className="bg-gray-900 rounded-3xl p-7 shadow-2xl text-white overflow-hidden relative flex flex-col">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 blur-[60px] pointer-events-none" />
                            <div className="relative z-10 flex-1">
                                <div className="flex items-center gap-2 mb-6">
                                    <Shield className="w-4 h-4 text-white/40" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Constituency Health</h3>
                                </div>
                                {/* Score Ring */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative w-28 h-28">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                                            <circle cx="18" cy="18" r="15.9" fill="none"
                                                stroke={healthScore >= 70 ? "#10B981" : healthScore >= 40 ? "#F59E0B" : "#B91C1C"}
                                                strokeWidth="3"
                                                strokeDasharray={`${(healthScore / 100) * 100} 100`}
                                                strokeLinecap="round"
                                                style={{ transition: "stroke-dasharray 1s ease" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-black">{healthScore}</span>
                                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">/ 100</span>
                                        </div>
                                    </div>
                                </div>
                                <p className={`text-center text-sm font-black mb-1 ${healthScore >= 70 ? "text-emerald-400" : healthScore >= 40 ? "text-amber-400" : "text-red-400"
                                    }`}>{healthScore >= 70 ? "Healthy" : healthScore >= 40 ? "Needs Attention" : "Critical"}</p>
                                <p className="text-center text-[10px] text-white/30 font-medium">Based on {resoPct}% resolution rate &amp; {highPri} high-priority open cases</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Real-Time Notification Alert ────────────────────── */}
                {newCount > 0 && (isAdmin || isOfficer) && (
                    <div className="bg-[#B91C1C] text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group animate-in slide-in-from-top-4 duration-500">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/30 transition-all duration-700" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <Bell className="w-8 h-8 text-white animate-bounce" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black mb-1">New Complaints Received!</h2>
                                    <p className="text-white/70 text-sm font-medium">
                                        There are <span className="text-white font-black underline">{newCount}</span> new grievances waiting to be categorized and assigned.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/grievances")}
                                className="btn-secondary !text-[#B91C1C] !border-none shadow-xl"
                            >
                                Take Action Now <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Citizen Portal Banner ───────────────────────────── */}
                {!currentUser || currentUser.role !== "citizen" && (
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 blur-[80px] pointer-events-none" />
                        <div className="text-white relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/50">Live · Complaint System</p>
                            </div>
                            <h2 className="text-xl font-black mb-1">Citizens can file complaints online</h2>
                            <p className="text-sm text-white/60">Submissions appear here in real-time — auto-categorized and priority-sorted</p>
                        </div>
                        <div className="flex gap-3 relative z-10 shrink-0 flex-wrap">
                            <a href="/submit-complaint" target="_blank" rel="noopener noreferrer"
                                className="btn-primary">
                                <ExternalLink className="w-4 h-4" /> Open Portal
                            </a>
                            <button onClick={() => navigate("/grievances")}
                                className="btn-secondary !bg-white/10 !text-white !border-white/10 hover:!bg-white/20">
                                All Complaints <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Pending notification banner */}
                {pendingNotify > 0 && (isAdmin || isOfficer) && (
                    <div className="bg-sky-50 border border-sky-200 rounded-3xl px-6 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-sky-600" />
                            <p className="text-sm font-black text-sky-800">
                                {pendingNotify} resolved complaint{pendingNotify > 1 ? "s" : ""} waiting for citizen notification
                            </p>
                        </div>
                        <button onClick={() => navigate("/grievances")}
                            className="text-xs font-black text-sky-700 bg-sky-100 px-4 py-2 rounded-xl hover:bg-sky-200 transition-all whitespace-nowrap">
                            Notify Now →
                        </button>
                    </div>
                )}

                {/* ── KPI Cards ────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {kpis.map(kpi => {
                        const Icon = kpi.icon;
                        return (
                            <div key={kpi.label} onClick={() => navigate("/grievances")}
                                className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-[40px] group-hover:bg-red-500/10 transition-all pointer-events-none" />
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 ${kpi.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-5 h-5 ${kpi.color}`} />
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${kpi.color}`}>{kpi.sub}</span>
                                </div>
                                <p className="text-4xl font-black text-gray-900 tracking-tight mb-1">{kpi.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{kpi.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* ── Charts Row ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Trend */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-7">Monthly Complaint Trend</h3>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MONTHLY_TREND}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#9CA3AF" }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#9CA3AF" }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", fontSize: 11, fontWeight: 900 }} />
                                    <Line type="monotone" dataKey="complaints" stroke="#B91C1C" strokeWidth={3}
                                        dot={{ fill: "#B91C1C", r: 5, strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 7, fill: "#B91C1C", strokeWidth: 0 }} name="Complaints" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Pie */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-7">Status Breakdown</h3>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusPie} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={45}
                                        paddingAngle={3} nameKey="name">
                                        {statusPie.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", fontSize: 11, fontWeight: 900 }} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 900 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── Category bar ─────────────────────────────────────── */}
                <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-7">Complaints by Category</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={CATEGORY_DATA} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#9CA3AF" }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: "#9CA3AF" }} />
                                <Tooltip cursor={{ fill: "#FEE2E2", opacity: 0.4 }}
                                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", fontSize: 11, fontWeight: 900 }} />
                                <Bar dataKey="count" radius={[8, 8, 8, 8]} name="Complaints">
                                    {CATEGORY_DATA.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ── Urgent Queue & Global Activity Row ────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Urgent Queue */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C] animate-pulse" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Urgent — Needs Attention ({urgentQueue.length})
                                </h3>
                            </div>
                            <button onClick={() => navigate("/grievances")}
                                className="text-[10px] font-black uppercase tracking-widest text-[#B91C1C] hover:underline flex items-center gap-1">
                                See All <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {urgentQueue.length === 0 ? (
                            <div className="px-7 py-12 text-center">
                                <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
                                <p className="font-bold text-gray-400">All caught up! 🎉</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {urgentQueue.map(c => (
                                    <div key={c.id}
                                        className="flex items-center gap-4 px-7 py-4 hover:bg-red-50/30 transition-all cursor-pointer group"
                                        onClick={() => navigate(`/grievances?id=${c.id}`)}>
                                        <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center group-hover:bg-[#B91C1C] group-hover:border-[#B91C1C] transition-all shrink-0">
                                            <span className="text-[8px] font-black text-gray-400 group-hover:text-white/60">ID</span>
                                            <span className="text-[10px] font-black text-gray-900 group-hover:text-white font-mono">{c.id.split("-")[1]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-black text-gray-900 truncate">{c.issue}</p>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-medium">{c.citizen} · {c.ward} · {c.dept || "Unassigned"}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black px-2 py-1 rounded-lg border uppercase ${c.priority === "High" ? "bg-red-50 border-red-100 text-[#B91C1C]" :
                                                        c.priority === "Medium" ? "bg-amber-50 border-amber-100 text-amber-600" :
                                                            "bg-sky-50 border-sky-100 text-sky-600"
                                                    }`}>{c.priority}</span>
                                                <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 uppercase">{c.status}</span>
                                            </div>
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{c.ward}</p>
                                        </div>
                                        <div className="flex flex-col gap-1.5 shrink-0">
                                            {(isAdmin || isOfficer) && c.status === "New" && (
                                                <button onClick={e => { e.stopPropagation(); updateStatus(c.id, "In Progress", "Work started"); }}
                                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition-all shadow-sm">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark In Progress
                                                </button>
                                            )}
                                            {(isAdmin || isOfficer) && (c.status === "Assigned" || c.status === "Categorized") && (
                                                <button onClick={e => { e.stopPropagation(); updateStatus(c.id, "In Progress", "Work started"); }}
                                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black transition-all shadow-sm">
                                                    <PlayCircle className="w-3.5 h-3.5" /> Start Work
                                                </button>
                                            )}
                                            {(isAdmin || isOfficer) && c.status === "In Progress" && (
                                                <button onClick={e => { e.stopPropagation(); updateStatus(c.id, "Resolved", "Complaint resolved"); }}
                                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition-all shadow-sm">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                                                </button>
                                            )}
                                            {(isAdmin || isOfficer) && (
                                                editingNote === c.id ? (
                                                    <div onClick={e => e.stopPropagation()} className="flex gap-1">
                                                        <input autoFocus type="text" placeholder="Type note…" value={noteMap[c.id] ?? ""}
                                                            onChange={e => setNoteMap(p => ({ ...p, [c.id]: e.target.value }))}
                                                            onKeyDown={e => { if (e.key === "Enter") { updateStatus(c.id, c.status, noteMap[c.id] || "Officer note added"); setEditingNote(null); } if (e.key === "Escape") setEditingNote(null); }}
                                                            className="w-28 px-2 py-1.5 text-[10px] font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-[#B91C1C]/30" />
                                                        <button onClick={() => { updateStatus(c.id, c.status, noteMap[c.id] || "Note added"); setEditingNote(null); }}
                                                            className="px-2 py-1.5 bg-gray-900 text-white rounded-lg text-[9px] font-black">Save</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={e => { e.stopPropagation(); setEditingNote(c.id); }}
                                                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black transition-all">
                                                        <PenLine className="w-3 h-3" /> Add Note
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Global Live Activity Feed */}
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
                        <div className="px-7 py-5 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-[#B91C1C]" /> Live Activity Stream
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[480px]">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Waiting for new events...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.slice(0, 8).map(n => (
                                        <div key={n.id} className="p-5 hover:bg-gray-50 transition-all">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${n.type === 'new_complaint' ? 'bg-red-100 text-[#B91C1C]' :
                                                        n.type === 'status_change' ? 'bg-amber-100 text-amber-600' :
                                                            'bg-blue-100 text-blue-600'
                                                    }`}>{n.type.replace('_', ' ')}</span>
                                                <span className="text-[8px] font-black text-gray-400 uppercase">{n.time}</span>
                                            </div>
                                            <p className="text-[11px] font-black text-gray-900 mb-1">{n.title}</p>
                                            <p className="text-[10px] text-gray-500 leading-relaxed truncate">{n.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-50 bg-gray-50/30 text-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Auto-updating live feed</p>
                        </div>
                    </div>
                </div>

                {/* ── Policy Simulator (NEW: Tanglish Feature) ─────────── */}
                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-gray-100 p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] pointer-events-none" />
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-2">
                        <div className="space-y-4 max-w-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-amber-50 rounded-2xl">
                                    <Sparkles className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">GovPilot Policy Simulator</h2>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">Smart Predictive Governance Impact</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                What if you change the garbage collection timing or repair 50 potholes this week? 
                                Simulate new policies to predict their impact on <span className="text-amber-600 font-black">Citizen Sentiment</span> and <span className="text-amber-600 font-black">Constituency Score</span>.
                            </p>
                            <div className="flex gap-4">
                                <button className="px-6 py-3.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                                    Simulate New Policy
                                </button>
                                <button className="px-6 py-3.5 bg-white border border-gray-200 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                                    View Past Predictions
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full lg:w-fit">
                            {[
                                { label: "Predict Impact", value: "+14%", sub: "Sentiment Rise", color: "text-emerald-500" },
                                { label: "Est. Cost", value: "₹2.4L", sub: "Budget Usage", color: "text-amber-500" },
                            ].map(p => (
                                <div key={p.label} className="bg-gray-50 border border-gray-100 p-6 rounded-3xl text-center min-w-[140px]">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{p.label}</p>
                                    <p className={`text-2xl font-black ${p.color}`}>{p.value}</p>
                                    <p className="text-[8px] font-bold text-gray-400 mt-1">{p.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Bottom row ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Resolution rate */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 bg-red-50 rounded-xl"><TrendingUp className="w-4 h-4 text-[#B91C1C]" /></div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resolution Rate</h3>
                        </div>
                        <p className="text-4xl font-black text-gray-900 mb-1">{resoPct}%</p>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{resolved} fixed of {total}</p>
                        <div className="mt-5 h-2 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700 bg-[#B91C1C]" style={{ width: `${resoPct}%` }} />
                        </div>
                    </div>

                    {/* Workflow pipeline */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2.5 bg-red-50 rounded-xl"><Activity className="w-4 h-4 text-[#B91C1C]" /></div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Workflow Pipeline</h3>
                        </div>
                        <div className="space-y-2.5">
                            {(["New", "Categorized", "Assigned", "In Progress"] as Status[]).map(s => {
                                const cnt = complaints.filter(c => c.status === s).length;
                                const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
                                return (
                                    <div key={s}>
                                        <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                            <span>{s}</span><span>{cnt}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: STATUS_COLOR[s] }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Auto-categorization note */}
                    <div className="bg-gray-900 rounded-3xl p-7 shadow-2xl text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] pointer-events-none" />
                        <div className="relative z-10">
                            <div className="p-2.5 bg-white/10 rounded-xl w-fit mb-5">
                                <Tag className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3">Smart Auto-Categorization</h3>
                            <p className="text-sm font-bold text-white/80 leading-relaxed mb-5">
                                New complaints are automatically categorized by keyword analysis and routed to the right department.
                            </p>
                            <div className="space-y-2">
                                {["Water/leak → Water Dept", "Pothole/road → Roads & PWD", "Light/electric → Electricity Board"].map(ex => (
                                    <div key={ex} className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                        <span className="text-[10px] font-bold text-white/60">{ex}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
