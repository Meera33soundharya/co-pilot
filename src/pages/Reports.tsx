/**
 * Reports — Daily / Weekly / Monthly report generation
 * Uses live complaint data from ComplaintsContext.
 * Task 8: PDF (print) + CSV (Excel) export simulation.
 */
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useMemo } from "react";
import { useComplaints } from "@/context/ComplaintsContext";
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell,
    PieChart, Pie, Legend
} from "recharts";
import {
    Download, Calendar, ChevronDown,
    TrendingUp, Clock, CheckCircle2, Award,
    RefreshCw, Sparkles, Shield, Target,
    Activity, FileText, AlertTriangle, Building2,
    Printer, BarChart3, Users
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────

function escHtml(v: string | undefined) {
    return String(v ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const PERIOD_OPTIONS = [
    { label: "Daily (Today)", days: 1 },
    { label: "Weekly (7 Days)", days: 7 },
    { label: "Monthly (30 Days)", days: 30 },
    { label: "Quarterly (90 Days)", days: 90 },
    { label: "Annual (365 Days)", days: 365 },
    { label: "All Time", days: 9999 },
];

const DEPT_COLORS: Record<string, string> = {
    "Water Supply": "#3b82f6",
    "Roads & PWD": "#f97316",
    "Electricity Board": "#eab308",
    "Sanitation": "#22c55e",
    "Public Health": "#ec4899",
    "Revenue": "#8b5cf6",
    "Police": "#ef4444",
    "General Administration": "#94a3b8",
};

const STATUS_COLORS: Record<string, string> = {
    "Submitted": "#94a3b8", "Assigned": "#3b82f6", "Accepted": "#06b6d4",
    "In Progress": "#f59e0b", "Resolved": "#10b981", "Closed": "#6366f1",
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function Reports() {
    const { complaints, currentUser } = useComplaints();
    const [period, setPeriod] = useState(PERIOD_OPTIONS[1]); // Default: weekly
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);

    // Filter complaints by period
    const cutoff = Date.now() - period.days * 86_400_000;
    const filtered = useMemo(() => {
        if (period.days >= 9999) return complaints;
        return complaints.filter(c => c.timestamp >= cutoff);
    }, [complaints, period, cutoff]);

    // KPIs
    const total = filtered.length;
    const resolved = filtered.filter(c => c.status === "Resolved" || c.status === "Closed").length;
    const pending = filtered.filter(c => c.status !== "Resolved" && c.status !== "Closed").length;
    const highPri = filtered.filter(c => c.priority === "High").length;
    const resoPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const avgResoTime = "4.2h"; // Simulated

    // Daily trend (last N days, max 30)
    const trendDays = Math.min(period.days, 30);
    const trendData = useMemo(() => Array.from({ length: trendDays }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (trendDays - 1 - i));
        const ds = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const de = ds + 86_400_000;
        const day = complaints.filter(c => c.timestamp >= ds && c.timestamp < de);
        return {
            day: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
            submitted: day.length,
            resolved: day.filter(c => c.status === "Resolved" || c.status === "Closed").length,
        };
    }), [complaints, trendDays]);

    // Dept breakdown
    const deptData = useMemo(() => {
        const map: Record<string, number> = {};
        filtered.forEach(c => { const d = c.dept || "General Administration"; map[d] = (map[d] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [filtered]);

    // Status breakdown
    const statusData = useMemo(() => {
        const map: Record<string, number> = {};
        filtered.forEach(c => { map[c.status] = (map[c.status] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    // Priority breakdown
    const priorityData = useMemo(() => [
        { name: "High", value: filtered.filter(c => c.priority === "High").length, color: "#ef4444" },
        { name: "Medium", value: filtered.filter(c => c.priority === "Medium").length, color: "#f59e0b" },
        { name: "Low", value: filtered.filter(c => c.priority === "Low").length, color: "#22c55e" },
    ], [filtered]);

    // Ward hotspots
    const wardData = useMemo(() => {
        const map: Record<string, number> = {};
        filtered.forEach(c => { map[c.ward] = (map[c.ward] || 0) + 1; });
        return Object.entries(map).map(([ward, count]) => ({ ward, count })).sort((a, b) => b.count - a.count).slice(0, 8);
    }, [filtered]);

    // AI Summary generation
    function generateSummary() {
        setGenerating(true);
        setAiSummary(null);
        setTimeout(() => {
            const topDept = deptData[0]?.name ?? "General Administration";
            const topWard = wardData[0]?.ward ?? "N/A";
            setAiSummary(
                `📊 ${period.label} Report Summary — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}\n\n` +
                `🔹 ${total} complaint(s) were received during this period.\n` +
                `🔹 ${resolved} resolved (${resoPct}% resolution rate).\n` +
                `🔹 ${pending} complaint(s) still pending action.\n` +
                `🔹 ${highPri} high-priority case(s) require immediate attention.\n\n` +
                `📌 Top Department: ${topDept} (${deptData[0]?.value ?? 0} complaints)\n` +
                `📍 Hotspot Ward: ${topWard} (${wardData[0]?.count ?? 0} complaints)\n\n` +
                `💡 Recommendation: ${resoPct >= 80 ? "Performance is excellent. Maintain current response protocols." : resoPct >= 50 ? `Increase staffing in ${topDept} to improve response speed.` : `Urgent intervention required. Deploy field teams to ${topWard} immediately.`}`
            );
            setGenerating(false);
        }, 1500);
    }

    // CSV Export
    function exportCSV() {
        const header = "ID,Citizen,Phone,Ward,Issue,Category,Department,Priority,Status,Time,Estimated Time";
        const rows = filtered.map(c =>
            `${c.id},"${c.citizen}","${c.phone}","${c.ward}","${c.issue}","${c.category}","${c.dept}",${c.priority},${c.status},"${c.time}","${c.estimatedTime ?? "N/A"}"`
        );
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `GovPilot_${period.label.replace(/\s/g, "_")}_Report_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // PDF (Print) Export
    function exportPDF() {
        const topDeptRows = deptData.slice(0, 8).map(d =>
            `<tr><td>${escHtml(d.name)}</td><td style="text-align:center">${d.value}</td><td style="text-align:center">${Math.round((d.value / Math.max(total, 1)) * 100)}%</td></tr>`
        ).join("");
        const recentRows = filtered.slice(0, 20).map(c =>
            `<tr><td>${escHtml(c.id)}</td><td>${escHtml(c.citizen)}</td><td>${escHtml(c.ward)}</td><td>${escHtml(c.issue?.substring(0, 40))}</td><td>${escHtml(c.priority)}</td><td>${escHtml(c.status)}</td></tr>`
        ).join("");

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>GovPilot Report</title>
<style>
body { font-family: Arial, sans-serif; color: #1e293b; padding: 40px; }
h1 { color: #B91C1C; font-size: 28px; margin-bottom: 4px; }
h2 { color: #374151; font-size: 16px; margin-top: 32px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
.meta { color: #94a3b8; font-size: 12px; margin-bottom: 24px; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
.kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
.kpi .val { font-size: 32px; font-weight: 900; color: #1e293b; }
.kpi .lbl { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 10px; color: #64748b; }
td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
tr:hover td { background: #fafafa; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
.badge-high { background: #fee2e2; color: #dc2626; }
.badge-medium { background: #fef3c7; color: #d97706; }
.badge-low { background: #d1fae5; color: #059669; }
.footer { margin-top: 40px; color: #94a3b8; font-size: 11px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
@media print { body { padding: 20px; } }
</style></head><body>
<h1>🏛️ GovPilot — ${escHtml(period.label)} Report</h1>
<p class="meta">Generated: ${new Date().toLocaleString("en-IN")} &nbsp;|&nbsp; By: ${escHtml(currentUser?.name ?? "Admin")} &nbsp;|&nbsp; Period: ${escHtml(period.label)}</p>
<h2>Key Performance Indicators</h2>
<div class="kpi-grid">
<div class="kpi"><div class="val">${total}</div><div class="lbl">Total</div></div>
<div class="kpi"><div class="val" style="color:#10b981">${resolved}</div><div class="lbl">Resolved</div></div>
<div class="kpi"><div class="val" style="color:#ef4444">${highPri}</div><div class="lbl">High Priority</div></div>
<div class="kpi"><div class="val" style="color:#B91C1C">${resoPct}%</div><div class="lbl">Resolution Rate</div></div>
</div>
${aiSummary ? `<h2>AI Executive Summary</h2><pre style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;font-family:inherit;font-size:13px;white-space:pre-wrap">${escHtml(aiSummary)}</pre>` : ""}
<h2>Department Breakdown</h2>
<table><thead><tr><th>Department</th><th style="text-align:center">Complaints</th><th style="text-align:center">Share</th></tr></thead>
<tbody>${topDeptRows}</tbody></table>
<h2>Recent Complaints (Latest 20)</h2>
<table><thead><tr><th>ID</th><th>Citizen</th><th>Ward</th><th>Issue</th><th>Priority</th><th>Status</th></tr></thead>
<tbody>${recentRows}</tbody></table>
<div class="footer">GovPilot Enterprise AI Government Co-Pilot &nbsp;|&nbsp; Confidential Government Document &nbsp;|&nbsp; ${new Date().getFullYear()}</div>
</body></html>`;

        const win = window.open("", "_blank", "noopener,noreferrer");
        if (!win) { alert("Allow pop-ups to export the PDF report."); return; }
        win.document.write(html);
        win.document.close();
        setTimeout(() => { win.focus(); win.print(); }, 600);
    }

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <DashboardLayout title="Reports" subtitle={`${period.label} — ${total} complaint(s) in scope`}>
            <div className="space-y-8 pb-10">

                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Period Selector */}
                    <div className="relative">
                        <button
                            id="reports-period-btn"
                            onClick={() => setShowPeriodMenu(v => !v)}
                            className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-black uppercase tracking-wider hover:border-gray-400 transition-all shadow-sm"
                        >
                            <Calendar className="w-4 h-4 text-[#B91C1C]" />
                            {period.label}
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showPeriodMenu && (
                            <div className="absolute top-full left-0 mt-2 z-30 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden min-w-[200px]">
                                {PERIOD_OPTIONS.map(p => (
                                    <button key={p.label} onClick={() => { setPeriod(p); setShowPeriodMenu(false); }}
                                        className={`w-full text-left px-5 py-3 text-sm font-bold hover:bg-gray-50 transition-colors ${p.label === period.label ? "text-[#B91C1C] font-black" : "text-gray-700"}`}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={generateSummary} disabled={generating}
                            id="reports-ai-summary-btn"
                            className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-[#B91C1C] transition-all disabled:opacity-60">
                            {generating ? <><RefreshCw className="w-4 h-4 animate-spin" />Analyzing...</> : <><Sparkles className="w-4 h-4" />AI Summary</>}
                        </button>
                        <button onClick={exportCSV} id="reports-csv-btn"
                            className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-emerald-100 transition-all">
                            <Download className="w-4 h-4" />CSV / Excel
                        </button>
                        <button onClick={exportPDF} id="reports-pdf-btn"
                            className="flex items-center gap-2 px-5 py-3 bg-red-50 text-[#B91C1C] border border-red-200 rounded-2xl text-sm font-black uppercase tracking-wider hover:bg-red-100 transition-all">
                            <Printer className="w-4 h-4" />PDF / Print
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: "Total", value: total, icon: <Target className="w-5 h-5" />, color: "from-gray-900 to-gray-700" },
                        { label: "Resolved", value: resolved, icon: <CheckCircle2 className="w-5 h-5" />, color: "from-emerald-500 to-emerald-700" },
                        { label: "Pending", value: pending, icon: <Clock className="w-5 h-5" />, color: "from-amber-500 to-amber-700" },
                        { label: "High Priority", value: highPri, icon: <AlertTriangle className="w-5 h-5" />, color: "from-red-600 to-red-800" },
                        { label: "Reso. Rate", value: `${resoPct}%`, icon: <Award className="w-5 h-5" />, color: "from-blue-500 to-blue-700" },
                        { label: "Avg. Time", value: avgResoTime, icon: <Activity className="w-5 h-5" />, color: "from-indigo-500 to-indigo-700" },
                    ].map(s => (
                        <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-3xl p-5 shadow-lg text-white relative overflow-hidden`}>
                            <div className="flex items-center gap-2 mb-3 opacity-60">
                                {s.icon}
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{s.label}</span>
                            </div>
                            <p className="text-3xl font-black italic">{s.value}</p>
                            <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-white/5 rounded-full" />
                        </div>
                    ))}
                </div>

                {/* AI Summary */}
                {aiSummary && (
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-5 h-5 text-[#B91C1C]" />
                            <h3 className="text-lg font-black text-gray-900 uppercase italic">AI Executive Summary</h3>
                        </div>
                        <pre className="text-sm font-semibold text-gray-700 whitespace-pre-wrap leading-relaxed font-sans bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            {aiSummary}
                        </pre>
                    </div>
                )}

                {/* Trend Chart */}
                <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-[#B91C1C]" />
                        Complaint Trend — {period.label}
                    </h3>
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="rptSubmitted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="rptResolved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700 }} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                                <Legend />
                                <Area type="monotone" dataKey="submitted" stroke="#B91C1C" fill="url(#rptSubmitted)" name="Submitted" strokeWidth={2} />
                                <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="url(#rptResolved)" name="Resolved" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-gray-400 font-bold text-sm">
                            No data for this period
                        </div>
                    )}
                </div>

                {/* Dept + Priority charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Dept Bar */}
                    <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6 flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-[#B91C1C]" />Complaints by Department
                        </h3>
                        {deptData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={deptData.slice(0, 7)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                    <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 9, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }} />
                                    <Bar dataKey="value" name="Complaints" radius={[0, 8, 8, 0]}>
                                        {deptData.map((e, i) => <Cell key={i} fill={DEPT_COLORS[e.name] || "#94a3b8"} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-gray-400 font-bold text-sm">No data</div>
                        )}
                    </div>

                    {/* Priority Donut */}
                    <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6">Priority Split</h3>
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                    {priorityData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 mt-3">
                            {priorityData.map(p => (
                                <div key={p.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                                        <span className="text-xs font-black text-gray-500 uppercase">{p.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-gray-800">{p.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status + Ward */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6 flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-[#B91C1C]" />Status Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }} />
                                <Bar dataKey="value" name="Complaints" radius={[6, 6, 0, 0]}>
                                    {statusData.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name] || "#94a3b8"} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Ward Hotspots */}
                    <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 uppercase italic mb-6 flex items-center gap-3">
                            <Shield className="w-5 h-5 text-[#B91C1C]" />Ward Hotspots
                        </h3>
                        <div className="space-y-3">
                            {wardData.length === 0 ? (
                                <p className="text-center text-gray-400 font-bold py-8 text-sm">No ward data for this period</p>
                            ) : wardData.map((w, i) => (
                                <div key={w.ward} className="flex items-center gap-4">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shrink-0">{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-black text-gray-700">{w.ward}</span>
                                            <span className="text-sm font-black text-gray-900">{w.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-700 transition-all"
                                                style={{ width: `${Math.min(100, (w.count / (wardData[0]?.count || 1)) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Complaint Data Table */}
                <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-900 uppercase italic flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[#B91C1C]" />
                            Complaint Log ({total})
                        </h3>
                        <button onClick={exportCSV} className="flex items-center gap-2 text-sm font-black text-emerald-600 hover:text-emerald-800 transition-colors">
                            <Download className="w-4 h-4" />Export All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-gray-400 uppercase tracking-widest font-black">
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Citizen</th>
                                    <th className="p-3">Ward</th>
                                    <th className="p-3">Issue</th>
                                    <th className="p-3">Dept</th>
                                    <th className="p-3">Priority</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.slice(0, 25).map(c => (
                                    <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-3 font-black text-gray-900 text-xs">{c.id}</td>
                                        <td className="p-3 font-bold text-gray-700 text-xs">{c.citizen}</td>
                                        <td className="p-3 text-gray-500 text-xs">{c.ward}</td>
                                        <td className="p-3 font-bold text-gray-700 truncate max-w-[160px] text-xs">{c.issue}</td>
                                        <td className="p-3 text-gray-500 text-xs truncate max-w-[120px]">{c.dept}</td>
                                        <td className="p-3">
                                            <span className={`text-xs font-black px-2 py-0.5 rounded-lg uppercase ${
                                                c.priority === "High" ? "bg-red-50 text-red-600" :
                                                c.priority === "Medium" ? "bg-amber-50 text-amber-600" :
                                                "bg-gray-50 text-gray-500"
                                            }`}>{c.priority}</span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-xs font-black px-2 py-0.5 rounded-lg uppercase ${
                                                c.status === "Resolved" || c.status === "Closed" ? "bg-emerald-50 text-emerald-600" :
                                                c.status === "In Progress" ? "bg-amber-50 text-amber-600" :
                                                "bg-gray-50 text-gray-500"
                                            }`}>{c.status}</span>
                                        </td>
                                        <td className="p-3 text-gray-400 text-xs whitespace-nowrap">{c.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="text-center py-12 text-gray-400 font-bold text-sm">
                                No complaints for this time period
                            </div>
                        )}
                        {filtered.length > 25 && (
                            <div className="text-center pt-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                                Showing 25 of {filtered.length} — export CSV for full data
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
