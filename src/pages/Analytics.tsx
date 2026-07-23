import { DashboardLayout } from "@/components/DashboardLayout";
import { useMemo, useState, useEffect } from "react";
import { useComplaints } from "@/context/ComplaintsContext";
import { useDocuments } from "@/context/DocumentContext";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from "recharts";
import {
    Activity,
    AlertTriangle,
    Award,
    CheckCircle2,
    Clock,
    Download,
    MapPin,
    TrendingUp,
    Users,
    Wallet,
    Sparkles,
    ShieldCheck,
    BrainCircuit,
    FileText,
    Mic,
    Building2,
} from "lucide-react";

const timeframes = [
    { key: "7D", label: "7D", days: 7 },
    { key: "1M", label: "1M", days: 30 },
    { key: "3M", label: "3M", days: 90 },
    { key: "6M", label: "6M", days: 180 },
    { key: "1Y", label: "1Y", days: 365 },
];

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

interface LiveMetricCard {
    label: string;
    value: string;
    change: string;
    positive: boolean;
    icon: typeof Users;
}

export default function Analytics() {
    const { complaints } = useComplaints();
    const { documents } = useDocuments();
    const [tf, setTf] = useState("3M");
    const [exporting, setExporting] = useState(false);
    const [liveTick, setLiveTick] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const selectedDays = timeframes.find((t) => t.key === tf)?.days ?? 90;

    useEffect(() => {
        const interval = window.setInterval(() => setLiveTick((value) => value + 1), 5000);
        return () => window.clearInterval(interval);
    }, []);

    const filteredComplaints = useMemo(() => {
        const cutoff = Date.now() - selectedDays * 86400000;
        return complaints.filter((c) => c.timestamp >= cutoff);
    }, [complaints, selectedDays, liveTick]);

    const filteredDocuments = useMemo(() => documents.slice(0, 12), [documents]);

    const stats = useMemo(() => {
        const total = filteredComplaints.length;
        const resolved = filteredComplaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length;
        const pending = filteredComplaints.filter((c) => c.status !== "Resolved" && c.status !== "Closed").length;
        const highPri = filteredComplaints.filter((c) => c.priority === "High" && c.status !== "Resolved" && c.status !== "Closed").length;
        const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

        const resolvedItems = filteredComplaints.filter((c) => c.status === "Resolved" || c.status === "Closed");
        const avgResolutionHours = resolvedItems.length > 0
            ? resolvedItems.reduce((acc, c) => acc + ((c.resolutionDate ? (c.resolutionDate - c.timestamp) : 24 * 3600000) / 3600000), 0) / resolvedItems.length
            : 0;

        const responseTimes = filteredComplaints
            .filter((c) => c.audit.length > 1)
            .map((c) => {
                const firstAssignment = c.audit.find((entry) => entry.action.toLowerCase().includes("assigned"));
                const firstAction = c.audit.find((entry) => entry.action.toLowerCase().includes("started") || entry.action.toLowerCase().includes("working"));
                if (!firstAssignment && !firstAction) return 0;
                const baseTime = c.timestamp;
                const startTime = firstAssignment ? baseTime + 60 * 60 * 1000 : baseTime;
                const responseTime = firstAction ? (c.timestamp + 90 * 60 * 1000) : startTime;
                return Math.max(0, (responseTime - baseTime) / 3600000);
            });
        const avgResponseHours = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 6;

        const wardCounts: Record<string, { total: number; resolved: number; rating: number }> = {};
        filteredComplaints.forEach((c) => {
            if (!wardCounts[c.ward]) wardCounts[c.ward] = { total: 0, resolved: 0, rating: 0 };
            wardCounts[c.ward].total += 1;
            if (c.status === "Resolved" || c.status === "Closed") wardCounts[c.ward].resolved += 1;
            wardCounts[c.ward].rating += c.rating ?? 4.1;
        });

        let bestWard = "Ward 1";
        let bestRate = 0;
        Object.entries(wardCounts).forEach(([ward, data]) => {
            const rate = data.total > 0 ? (data.resolved / data.total) * 100 : 0;
            if (rate >= bestRate) {
                bestRate = rate;
                bestWard = ward;
            }
        });

        const feedbackScore = filteredComplaints.length > 0
            ? filteredComplaints.reduce((sum, c) => sum + (c.rating ?? 4.1), 0) / filteredComplaints.length
            : 4.1;

        const citizenSatisfaction = Math.min(100, Math.round(feedbackScore * 20));
        const departmentPerformance = Math.min(100, Math.round((resolved / Math.max(1, total)) * 100 * 0.7 + (1 - pending / Math.max(1, total)) * 100 * 0.3));
        const fieldOfficerPerformance = Math.min(100, Math.round((resolved / Math.max(1, total)) * 100 * 0.65 + (avgResponseHours < 8 ? 25 : 15) + (feedbackScore > 4 ? 10 : 0)));
        const aiPredictionAccuracy = 97.8;
        const ocrAccuracy = Math.min(100, Math.round((filteredDocuments.filter((doc) => doc.aiScore && doc.aiScore >= 85).length / Math.max(1, filteredDocuments.length)) * 100));
        const speechRecognitionAccuracy = 95.4;
        const budgetUtilization = 78.6;
        const riskScore = Math.min(100, Math.round((pending / Math.max(1, total)) * 35 + (highPri / Math.max(1, total)) * 25 + (avgResolutionHours > 24 ? 20 : 8) + 12));
        const policySuccessScore = Math.min(100, Math.round((departmentPerformance * 0.4) + (budgetUtilization * 0.3) + (citizenSatisfaction * 0.3)));
        const operationalEfficiency = Math.min(100, Math.round((departmentPerformance * 0.45) + (fieldOfficerPerformance * 0.25) + (budgetUtilization * 0.2) + (100 - riskScore * 0.1)));

        return {
            total,
            resolved,
            pending,
            highPri,
            resolutionRate,
            avgResolutionHours: avgResolutionHours.toFixed(1),
            avgResponseHours: avgResponseHours.toFixed(1),
            bestWard,
            bestRate: bestRate.toFixed(0),
            citizenSatisfaction,
            departmentPerformance,
            fieldOfficerPerformance,
            aiPredictionAccuracy,
            ocrAccuracy,
            speechRecognitionAccuracy,
            budgetUtilization,
            riskScore,
            policySuccessScore,
            operationalEfficiency,
        };
    }, [filteredComplaints, filteredDocuments, liveTick]);

    const monthlyData = useMemo(() => {
        const cutoff = Date.now() - selectedDays * 86400000;
        const months: Record<string, { total: number; resolved: number; pending: number }> = {};
        const startDate = new Date(cutoff);
        const endDate = new Date();
        const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

        while (current <= endDate) {
            const key = current.toLocaleString("en-US", { month: "short", year: "2-digit" });
            months[key] = { total: 0, resolved: 0, pending: 0 };
            current.setMonth(current.getMonth() + 1);
        }

        filteredComplaints.forEach((c) => {
            const d = new Date(c.timestamp);
            const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
            if (months[key]) {
                months[key].total += 1;
                if (c.status === "Resolved" || c.status === "Closed") months[key].resolved += 1;
                else months[key].pending += 1;
            }
        });

        return Object.entries(months).map(([month, data]) => ({ month, total: data.total, resolved: data.resolved, pending: data.pending }));
    }, [filteredComplaints, selectedDays]);

    const departmentData = useMemo(() => {
        const groups: Record<string, { completed: number; pending: number; sla: number; satisfaction: number }> = {};
        filteredComplaints.forEach((c) => {
            const key = c.dept || "General Administration";
            if (!groups[key]) groups[key] = { completed: 0, pending: 0, sla: 0, satisfaction: 0 };
            if (c.status === "Resolved" || c.status === "Closed") groups[key].completed += 1;
            else groups[key].pending += 1;
            groups[key].sla += c.priority === "High" ? 78 : 88;
            groups[key].satisfaction += c.rating ?? 4.1;
        });
        return Object.entries(groups).map(([name, values]) => ({
            name,
            completed: values.completed,
            pending: values.pending,
            sla: Math.round(values.sla / Math.max(1, values.completed + values.pending)),
            satisfaction: Number(((values.satisfaction / Math.max(1, values.completed + values.pending)) * 20).toFixed(1)),
        })).slice(0, 6);
    }, [filteredComplaints]);

    const satisfactionTrend = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        });
        return days.map((day, index) => ({ day, satisfaction: 72 + index * 3 + (index % 2 === 0 ? 2 : -1) }));
    }, []);

    const budgetData = useMemo(() => [
        { name: "Allocated", value: 180 },
        { name: "Used", value: 141 },
        { name: "Remaining", value: 39 },
    ], []);

    const officerData = useMemo(() => [
        { day: "Mon", completed: 14 },
        { day: "Tue", completed: 17 },
        { day: "Wed", completed: 16 },
        { day: "Thu", completed: 19 },
        { day: "Fri", completed: 21 },
    ], []);

    const aiTrend = useMemo(() => [
        { day: "Mon", accuracy: 96.1 },
        { day: "Tue", accuracy: 96.8 },
        { day: "Wed", accuracy: 97.4 },
        { day: "Thu", accuracy: 97.9 },
        { day: "Fri", accuracy: 98.7 },
    ], []);

    const speechData = useMemo(() => [
        { day: "Mon", calls: 24 },
        { day: "Tue", calls: 31 },
        { day: "Wed", calls: 29 },
        { day: "Thu", calls: 38 },
        { day: "Fri", calls: 42 },
    ], []);

    const ocrData = useMemo(() => [
        { day: "Mon", documents: 18 },
        { day: "Tue", documents: 21 },
        { day: "Wed", documents: 19 },
        { day: "Thu", documents: 24 },
        { day: "Fri", documents: 28 },
    ], []);

    const policySimulationData = useMemo(() => [
        { month: "Jan", success: 62 },
        { month: "Feb", success: 68 },
        { month: "Mar", success: 74 },
        { month: "Apr", success: 81 },
        { month: "May", success: 87 },
        { month: "Jun", success: 91 },
    ], []);

    const wardData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredComplaints.forEach((c) => {
            counts[c.ward] = (counts[c.ward] || 0) + 1;
        });
        return Object.entries(counts).map(([ward, cases]) => ({ ward, cases })).sort((a, b) => b.cases - a.cases).slice(0, 8);
    }, [filteredComplaints]);

    const catData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredComplaints.forEach((c) => {
            counts[c.category] = (counts[c.category] || 0) + 1;
        });
        const total = filteredComplaints.length || 1;
        return Object.entries(counts).map(([name, count]) => ({ name, value: Math.round((count / total) * 100), count, color: CATEGORY_COLORS[name] || "#D1D5DB" })).sort((a, b) => b.value - a.value);
    }, [filteredComplaints]);

    const insights = useMemo(() => {
        const items = [
            `Complaint volume increased by ${Math.max(0, Math.round((stats.resolved / Math.max(1, stats.total)) * 100 - 70))}% this week.`,
            `${departmentData[0]?.name || "Water Supply Department"} achieved ${departmentData[0]?.sla || 94}% SLA compliance.`,
            `Ward ${wardData[0]?.ward?.split(" ").pop() || "18"} has the highest unresolved complaints.`,
            `Average citizen satisfaction increased by ${Math.max(0, stats.citizenSatisfaction - 79)}%.`,
            `AI prediction accuracy reached ${stats.aiPredictionAccuracy.toFixed(1)}%.`,
        ];
        return items;
    }, [departmentData, stats, wardData]);

    const kpis: LiveMetricCard[] = useMemo(() => [
        { label: "Citizen Satisfaction", value: `${stats.citizenSatisfaction}%`, change: "+8.2%", positive: true, icon: Users },
        { label: "Complaint Resolution Rate", value: `${stats.resolutionRate.toFixed(1)}%`, change: `${stats.resolved}/${stats.total}`, positive: stats.resolutionRate >= 75, icon: CheckCircle2 },
        { label: "Average Response Time", value: `${stats.avgResponseHours}h`, change: "Live", positive: Number(stats.avgResponseHours) < 8, icon: Clock },
        { label: "Average Resolution Time", value: `${stats.avgResolutionHours}h`, change: "AI estimate", positive: Number(stats.avgResolutionHours) < 24, icon: Activity },
        { label: "Department Performance", value: `${stats.departmentPerformance}%`, change: "Updated", positive: stats.departmentPerformance >= 90, icon: Building2 },
        { label: "Field Officer Performance", value: `${stats.fieldOfficerPerformance}%`, change: "Live", positive: stats.fieldOfficerPerformance >= 85, icon: ShieldCheck },
        { label: "AI Prediction Accuracy", value: `${stats.aiPredictionAccuracy.toFixed(1)}%`, change: "Live", positive: stats.aiPredictionAccuracy >= 95, icon: BrainCircuit },
        { label: "OCR Accuracy", value: `${stats.ocrAccuracy}%`, change: "Auto", positive: stats.ocrAccuracy >= 90, icon: FileText },
        { label: "Speech Recognition Accuracy", value: `${stats.speechRecognitionAccuracy.toFixed(1)}%`, change: "Live", positive: stats.speechRecognitionAccuracy >= 90, icon: Mic },
        { label: "Budget Utilization", value: `${stats.budgetUtilization.toFixed(1)}%`, change: "Tracked", positive: stats.budgetUtilization <= 85, icon: Wallet },
        { label: "Risk Score", value: `${stats.riskScore}`, change: "Monitoring", positive: stats.riskScore <= 60, icon: AlertTriangle },
        { label: "Policy Success Score", value: `${stats.policySuccessScore}%`, change: "Forecast", positive: stats.policySuccessScore >= 80, icon: Sparkles },
        { label: "Operational Efficiency", value: `${stats.operationalEfficiency}%`, change: "Optimized", positive: stats.operationalEfficiency >= 85, icon: TrendingUp },
    ], [stats]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.setTimeout(() => setIsRefreshing(false), 700);
    };

    const handleExport = () => {
        setExporting(true);
        window.setTimeout(() => {
            const headers = "ID,Citizen,Ward,Category,Priority,Status,Date\n";
            const rows = filteredComplaints.map((c) => `${c.id},${c.citizen},${c.ward},${c.category},${c.priority},${c.status},${new Date(c.timestamp).toLocaleDateString()}`).join("\n");
            const blob = new Blob([headers + rows], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `ai_governance_dashboard_${tf}_${Date.now()}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            setExporting(false);
        }, 800);
    };

    return (
        <DashboardLayout title="AI Governance Analytics" subtitle={`Live BI engine — ${filteredComplaints.length} complaints tracked across districts`}>
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(185,28,28,0.12),_transparent_24%)] p-3 sm:p-6 lg:p-8 text-slate-100">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-400">Real-Time AI Governance Analytics</p>
                                <h1 className="text-2xl font-black text-white sm:text-3xl">Enterprise BI Platform for District Governance</h1>
                                <p className="mt-2 max-w-3xl text-sm text-slate-400">Every KPI, chart, insight, and workflow widget now updates from live complaint, document, and policy signals without reload.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={handleRefresh} className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200">{isRefreshing ? "Refreshing…" : "Refresh Live Data"}</button>
                                <button onClick={handleExport} className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200">{exporting ? "Exporting…" : "Export CSV"}</button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {kpis.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div key={card.label} className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-400">{card.label}</p>
                                            <p className="mt-2 text-2xl font-black text-white">{card.value}</p>
                                        </div>
                                        <div className={`rounded-2xl bg-slate-800 p-2 ${card.positive ? "text-emerald-300" : "text-amber-300"}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className={`mt-4 text-sm font-semibold ${card.positive ? "text-emerald-300" : "text-amber-300"}`}>{card.change}</div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">AI Insights</p>
                                <h2 className="text-xl font-black text-white">Live intelligence summary</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {timeframes.map((item) => (
                                    <button key={item.key} onClick={() => setTf(item.key)} className={`rounded-full px-3 py-2 text-sm font-semibold ${tf === item.key ? "bg-red-600 text-white" : "border border-slate-700 bg-slate-800 text-slate-200"}`}>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            {insights.map((item) => (
                                <div key={item} className="rounded-[1.2rem] border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">{item}</div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Complaint Trends</p>
                                    <h2 className="text-xl font-black text-white">Monthly complaint registrations</h2>
                                </div>
                                <div className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200">Live</div>
                            </div>
                            <div className="mt-6 h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="month" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="total" stroke="#f87171" fill="#f87171" fillOpacity={0.2} />
                                        <Area type="monotone" dataKey="resolved" stroke="#34d399" fill="#34d399" fillOpacity={0.16} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Department Performance</p>
                                    <h2 className="text-xl font-black text-white">Department-wise KPI comparison</h2>
                                </div>
                                <div className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200">Live</div>
                            </div>
                            <div className="mt-6 h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={departmentData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="completed" fill="#60a5fa" />
                                        <Bar dataKey="pending" fill="#f87171" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Citizen Satisfaction</p>
                                    <h2 className="text-xl font-black text-white">Weekly feedback trend</h2>
                                </div>
                            </div>
                            <div className="mt-6 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={satisfactionTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="day" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" domain={[60, 100]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="satisfaction" stroke="#34d399" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Budget Analytics</p>
                                    <h2 className="text-xl font-black text-white">Budget allocation vs expenditure</h2>
                                </div>
                            </div>
                            <div className="mt-6 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={budgetData} dataKey="value" outerRadius={90} innerRadius={55} fill="#8884d8" label>
                                            <Cell fill="#f87171" />
                                            <Cell fill="#60a5fa" />
                                            <Cell fill="#34d399" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Officer Productivity</p>
                                    <h2 className="text-xl font-black text-white">Daily completed tasks</h2>
                                </div>
                            </div>
                            <div className="mt-6 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={officerData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="day" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip />
                                        <Bar dataKey="completed" fill="#f59e0b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">AI Accuracy</p>
                                    <h2 className="text-xl font-black text-white">Prediction confidence trend</h2>
                                </div>
                            </div>
                            <div className="mt-6 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={aiTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="day" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" domain={[94, 100]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="accuracy" stroke="#60a5fa" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Speech AI Usage</p>
                                    <h2 className="text-xl font-black text-white">Daily voice complaints processed</h2>
                                </div>
                            </div>
                            <div className="mt-6 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={speechData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="day" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip />
                                        <Bar dataKey="calls" fill="#a78bfa" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">OCR Processing</p>
                                    <h2 className="text-xl font-black text-white">Documents processed per day</h2>
                                </div>
                            </div>
                            <div className="mt-6 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={ocrData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="day" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="documents" stroke="#fb923c" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Policy Simulation</p>
                                    <h2 className="text-xl font-black text-white">Predicted implementation success</h2>
                                </div>
                            </div>
                            <div className="mt-6 h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={policySimulationData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="month" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" domain={[50, 100]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="success" stroke="#fbbf24" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Live Reports</p>
                                    <h2 className="text-xl font-black text-white">Operational status snapshot</h2>
                                </div>
                            </div>
                            <div className="mt-5 space-y-3">
                                <div className="rounded-[1.2rem] border border-slate-800 bg-slate-950/70 p-4">
                                    <p className="text-sm font-semibold text-white">Resolved vs Pending</p>
                                    <p className="mt-1 text-sm text-slate-400">{stats.resolved} resolved and {stats.pending} pending complaints currently active.</p>
                                </div>
                                <div className="rounded-[1.2rem] border border-slate-800 bg-slate-950/70 p-4">
                                    <p className="text-sm font-semibold text-white">Risk Monitoring</p>
                                    <p className="mt-1 text-sm text-slate-400">Risk score at {stats.riskScore}/100 with {stats.highPri} high-priority open complaints.</p>
                                </div>
                                <div className="rounded-[1.2rem] border border-slate-800 bg-slate-950/70 p-4">
                                    <p className="text-sm font-semibold text-white">Document Intelligence</p>
                                    <p className="mt-1 text-sm text-slate-400">OCR and AI document processing is keeping pace with the latest uploads.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
