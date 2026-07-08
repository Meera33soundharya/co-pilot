import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useMemo } from "react";
import { useComplaints } from "@/context/ComplaintsContext";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { TrendingUp, TrendingDown, MapPin, Activity, Award, Download, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

// ── Time filter config ─────────────────────────────────────
const timeframes = [
    { key: "7D", label: "7D", days: 7 },
    { key: "1M", label: "1M", days: 30 },
    { key: "3M", label: "3M", days: 90 },
    { key: "6M", label: "6M", days: 180 },
    { key: "1Y", label: "1Y", days: 365 },
];

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
    "Water Supply": "#3B82F6",
    "Electricity": "#FBBF24",
    "Roads & Infrastructure": "#6B7280",
    "Sanitation": "#10B981",
    "Public Health": "#EF4444",
    "Parks & Recreation": "#8B5CF6",
    "Drainage": "#06B6D4",
    "Enforcement": "#F97316",
    "Education": "#EC4899",
    "Ward Committee & Governance": "#14B8A6",
    "Other": "#D1D5DB",
};

export default function Analytics() {
    const { complaints } = useComplaints();
    const [tf, setTf] = useState("3M");
    const [exporting, setExporting] = useState(false);

    const selectedDays = timeframes.find(t => t.key === tf)?.days ?? 90;

    // ── Filter complaints by selected time range ─────────────
    const filteredComplaints = useMemo(() => {
        const cutoff = Date.now() - selectedDays * 86400000;
        return complaints.filter(c => c.timestamp >= cutoff);
    }, [complaints, selectedDays]);

    // ── Compute live KPIs ─────────────────────────────────────
    const stats = useMemo(() => {
        const total = filteredComplaints.length;
        const resolved = filteredComplaints.filter(c => c.status === "Resolved" || c.status === "Closed").length;
        const highPri = filteredComplaints.filter(c => c.priority === "High" && c.status !== "Resolved" && c.status !== "Closed").length;
        const resRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : "0.0";

        // Avg resolution time (simulate from audit length — proxy)
        const resolvedItems = filteredComplaints.filter(c => c.status === "Resolved" || c.status === "Closed");
        let avgResHours = 0;
        if (resolvedItems.length > 0) {
            const totalHrs = resolvedItems.reduce((acc, c) => {
                const ageMs = Date.now() - c.timestamp;
                return acc + ageMs / 3600000;
            }, 0);
            avgResHours = totalHrs / resolvedItems.length;
        }

        // Top performing ward
        const wardCounts: Record<string, { total: number; resolved: number }> = {};
        filteredComplaints.forEach(c => {
            if (!wardCounts[c.ward]) wardCounts[c.ward] = { total: 0, resolved: 0 };
            wardCounts[c.ward].total++;
            if (c.status === "Resolved" || c.status === "Closed") wardCounts[c.ward].resolved++;
        });
        let topWard = "—";
        let topRate = 0;
        Object.entries(wardCounts).forEach(([ward, { total, resolved }]) => {
            const rate = total > 0 ? (resolved / total) * 100 : 0;
            if (rate >= topRate) { topRate = rate; topWard = ward; }
        });

        return {
            total,
            resolved,
            highPri,
            resRate,
            avgResHours: avgResHours.toFixed(1),
            topWard,
            topWardRate: topRate.toFixed(0),
        };
    }, [filteredComplaints]);

    // ── Generate monthly chart data from complaints ───────────
    const monthlyData = useMemo(() => {
        const cutoff = Date.now() - selectedDays * 86400000;
        const months: Record<string, { total: number; resolved: number; pending: number }> = {};

        // Create bucket for each month in range
        const startDate = new Date(cutoff);
        const endDate = new Date();
        const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

        while (current <= endDate) {
            const key = current.toLocaleString("en-US", { month: "short", year: "2-digit" });
            months[key] = { total: 0, resolved: 0, pending: 0 };
            current.setMonth(current.getMonth() + 1);
        }

        filteredComplaints.forEach(c => {
            const d = new Date(c.timestamp);
            const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
            if (months[key]) {
                months[key].total++;
                if (c.status === "Resolved" || c.status === "Closed") months[key].resolved++;
                else months[key].pending++;
            }
        });

        return Object.entries(months).map(([month, data]) => ({
            month,
            total: data.total,
            resolved: data.resolved,
            pending: data.pending,
        }));
    }, [filteredComplaints, selectedDays]);

    // ── Ward breakdown ────────────────────────────────────────
    const wardData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredComplaints.forEach(c => {
            counts[c.ward] = (counts[c.ward] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([ward, cases]) => ({ ward, cases }))
            .sort((a, b) => b.cases - a.cases)
            .slice(0, 8);
    }, [filteredComplaints]);

    // ── Category distribution ─────────────────────────────────
    const catData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredComplaints.forEach(c => {
            counts[c.category] = (counts[c.category] || 0) + 1;
        });
        const total = filteredComplaints.length || 1;
        return Object.entries(counts)
            .map(([name, count]) => ({
                name,
                value: Math.round((count / total) * 100),
                count,
                color: CATEGORY_COLORS[name] || "#D1D5DB",
            }))
            .sort((a, b) => b.value - a.value);
    }, [filteredComplaints]);

    // ── Resolution rate trend per month ───────────────────────
    const resolutionTrend = useMemo(() => {
        return monthlyData.map(m => ({
            month: m.month,
            rate: m.total > 0 ? Math.round((m.resolved / m.total) * 100) : 0,
        }));
    }, [monthlyData]);

    // ── KPI cards ─────────────────────────────────────────────
    const kpis = [
        {
            label: "Avg Resolution Time",
            value: `${stats.avgResHours}h`,
            change: stats.total > 0 ? "Active" : "No data",
            positive: true,
            icon: Clock,
        },
        {
            label: "Resolution Rate",
            value: `${stats.resRate}%`,
            change: `${stats.resolved}/${stats.total}`,
            positive: parseFloat(stats.resRate) >= 50,
            icon: CheckCircle2,
        },
        {
            label: "High Priority Open",
            value: `${stats.highPri}`,
            change: stats.highPri > 0 ? "Needs attention" : "All clear",
            positive: stats.highPri === 0,
            icon: AlertTriangle,
        },
        {
            label: "Top Performer",
            value: stats.topWard,
            change: `${stats.topWardRate}% resolve`,
            positive: true,
            icon: Award,
        },
    ];

    const handleExport = () => {
        setExporting(true);
        // Generate CSV
        setTimeout(() => {
            const headers = "ID,Citizen,Ward,Category,Priority,Status,Date\n";
            const rows = filteredComplaints.map(c =>
                `${c.id},${c.citizen},${c.ward},${c.category},${c.priority},${c.status},${new Date(c.timestamp).toLocaleDateString()}`
            ).join("\n");
            const blob = new Blob([headers + rows], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `analytics_${tf}_${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            setExporting(false);
        }, 800);
    };

    return (
        <DashboardLayout
            title="Analytics"
            subtitle={`Deep dive into governance performance — ${tf} view (${filteredComplaints.length} complaints)`}
        >
            <div className="space-y-6">
                {/* KPI bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map(k => (
                        <div key={k.label} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-[40px] pointer-events-none group-hover:bg-red-500/10 transition-all duration-700" />
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-red-50 transition-colors">
                                    <k.icon className="w-5 h-5 text-gray-400 group-hover:text-[#B91C1C] transition-colors" />
                                </div>
                                <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${k.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"} uppercase tracking-tight`}>
                                    {k.change}
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 leading-none mb-2 relative z-10">{k.value}</p>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mt-1 relative z-10">{k.label}</p>
                        </div>
                    ))}
                </div>

                {/* Time selector + export */}
                <div className="flex items-center justify-between">
                    <div className="flex bg-white border border-gray-100 p-1.5 rounded-2xl gap-1 shadow-sm">
                        {timeframes.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTf(t.key)}
                                className={`px-5 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${tf === t.key ? "bg-[#B91C1C] text-white shadow-lg shadow-red-900/20" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleExport} className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-base font-black text-gray-900 hover:bg-gray-50 transition-all shadow-sm active:scale-95 uppercase tracking-widest">
                        {exporting ? <Activity className="w-4 h-4 animate-spin text-[#B91C1C]" /> : <Download className="w-4 h-4 text-[#B91C1C]" />}
                        {exporting ? "Exporting..." : "Download CSV"}
                    </button>
                </div>

                {/* No-data state */}
                {filteredComplaints.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-20 text-center shadow-sm">
                        <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-lg font-black text-gray-400 uppercase tracking-widest">No complaints in this time range</p>
                        <p className="text-sm text-gray-300 mt-2">Try selecting a wider period</p>
                    </div>
                ) : (
                    <>
                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Area Chart */}
                            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
                                        Complaint Volume vs Resolved — {tf}
                                    </h3>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                                        <AreaChart data={monthlyData}>
                                            <defs>
                                                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }} allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                                                itemStyle={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: '#B91C1C' }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: 20 }} />
                                            <Area type="monotone" dataKey="total" stroke="#B91C1C" strokeWidth={4} fill="url(#totalGrad)" name="Total" />
                                            <Area type="monotone" dataKey="resolved" stroke="#111827" strokeWidth={4} fill="transparent" name="Resolved" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Donut */}
                            <div className="bg-[#111827] rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] pointer-events-none" />
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 mb-8 relative z-10">Category Distribution</h3>
                                <div className="h-44 relative z-10">
                                    <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                                        <PieChart>
                                            <Pie data={catData} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                                                {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: 16, border: 'none', backgroundColor: '#1F2937', color: '#fff', fontSize: 10, fontWeight: 900 }}
                                                formatter={(value: number, name: string) => [`${value}%`, name]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-black text-white">{filteredComplaints.length}</span>
                                        <span className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">Cases</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-8 relative z-10">
                                    {catData.slice(0, 4).map(c => (
                                        <div key={c.name} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-lg" style={{ background: c.color, boxShadow: `0 0 10px ${c.color}40` }} />
                                            <span className="text-[9px] text-white/60 font-black uppercase tracking-tight">{c.name}</span>
                                            <span className="text-[9px] text-white font-black ml-auto">{c.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bar Chart — Ward */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2 text-lg">
                                    <MapPin className="w-4 h-4 text-indigo-500" />
                                    Ward-wise Volume
                                </h3>
                                <div className="h-48">
                                    {wardData.length > 0 ? (
                                        <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                                            <BarChart data={wardData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.4} />
                                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} allowDecimals={false} />
                                                <YAxis type="category" dataKey="ward" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} width={50} />
                                                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 10, fontWeight: 900 }} />
                                                <Bar dataKey="cases" fill="#374151" radius={[0, 8, 8, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300 font-black uppercase tracking-widest text-sm">No ward data</div>
                                    )}
                                </div>
                            </div>

                            {/* Resolution Rate trend */}
                            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-black text-gray-900 mb-5 text-lg flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                    Resolution Rate Trend (%)
                                </h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                                        <LineChart data={resolutionTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.4} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 10, fontWeight: 900 }} />
                                            <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} name="Resolution %" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* ── Status Breakdown Table ────────────────────────── */}
                        <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
                                    <TrendingUp className="w-5 h-5 text-red-600" />
                                    Status Breakdown — {tf} Period
                                </h3>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                    Live data from {filteredComplaints.length} complaint records
                                </p>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {["New", "Categorized", "Assigned", "In Progress", "Resolved", "Closed"].map(status => {
                                    const count = filteredComplaints.filter(c => c.status === status).length;
                                    const pct = filteredComplaints.length > 0 ? Math.round((count / filteredComplaints.length) * 100) : 0;
                                    const statusColors: Record<string, string> = {
                                        "New": "#EF4444",
                                        "Categorized": "#F59E0B",
                                        "Assigned": "#3B82F6",
                                        "In Progress": "#F97316",
                                        "Resolved": "#10B981",
                                        "Closed": "#6B7280",
                                    };
                                    return (
                                        <div key={status} className="flex items-center gap-8 px-10 py-5 hover:bg-red-50/20 transition-all">
                                            <div className="flex items-center gap-4 min-w-[180px]">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusColors[status] || "#999" }} />
                                                <span className="text-base font-black text-gray-900 uppercase tracking-tight">{status}</span>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000"
                                                        style={{ width: `${pct}%`, backgroundColor: statusColors[status] || "#999" }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 shrink-0">
                                                <span className="text-lg font-black text-gray-900 min-w-[40px] text-right">{count}</span>
                                                <span className="text-sm font-black text-gray-400 min-w-[45px] text-right">{pct}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
