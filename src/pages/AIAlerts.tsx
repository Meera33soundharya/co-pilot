import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { AlertTriangle, Info, Zap, Filter, BellOff, Eye, ArrowRight, Activity, X, CheckCircle2 } from "lucide-react";

type AlertSeverity = "Critical" | "High" | "Medium" | "Low";

interface Alert {
    id: string;
    title: string;
    description: string;
    ward: string;
    category: string;
    severity: AlertSeverity;
    time: string;
    status: "active" | "acknowledged" | "resolved";
    aiConfidence: number;
}

const alerts: Alert[] = [
    { id: "ALT-001", title: "Water Pressure Critical Drop", description: "AI detected 280% surge in water-related complaints in Ward 03. Pressure dropped below operational threshold in 14 nodes.", ward: "Ward 03", category: "Infrastructure", severity: "Critical", time: "2 min ago", status: "active", aiConfidence: 97 },
    { id: "ALT-002", title: "Road Damage Cluster Detected", description: "Spatial clustering algorithm detected concentrated pothole reports on NH-7 stretch. High accident risk predicted.", ward: "Ward 06", category: "Roads", severity: "High", time: "18 min ago", status: "active", aiConfidence: 91 },
    { id: "ALT-003", title: "Sanitation Backlog Warning", description: "Waste collection delay exceeding 48hr threshold in 3 consecutive zones. Auto-rerouting resources initiated.", ward: "Ward 09", category: "Sanitation", severity: "High", time: "45 min ago", status: "acknowledged", aiConfidence: 88 },
    { id: "ALT-004", title: "Sentiment Spike – Education", description: "Negative sentiment related to public school facilities increased by 34% over last 24h. Action recommended.", ward: "City-wide", category: "Education", severity: "Medium", time: "1h ago", status: "active", aiConfidence: 82 },
    { id: "ALT-005", title: "Electricity Outage Pattern", description: "Recurring power outages detected in Ward 12 residential zone – 3rd time in 7 days.", ward: "Ward 12", category: "Electricity", severity: "Medium", time: "2h ago", status: "acknowledged", aiConfidence: 85 },
    { id: "ALT-006", title: "Public Health Advisory Trigger", description: "Dengue case reports from Ward 04 clinics spiked 22% above seasonal baseline.", ward: "Ward 04", category: "Health", severity: "High", time: "3h ago", status: "active", aiConfidence: 94 },
    { id: "ALT-007", title: "Noise Complaint Cluster", description: "Construction noise violations concentrated in Ward 11 commercial zone, violating nighttime ordinance.", ward: "Ward 11", category: "Enforcement", severity: "Low", time: "4h ago", status: "resolved", aiConfidence: 76 },
];

const severityConfig: Record<AlertSeverity, { bg: string; text: string; border: string; icon: any; dot: string }> = {
    Critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: AlertTriangle, dot: "bg-red-600" },
    High: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: Zap, dot: "bg-orange-500" },
    Medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Info, dot: "bg-amber-400" },
    Low: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: Activity, dot: "bg-gray-400" },
};

const statusStyle: Record<string, string> = {
    "active": "bg-red-50 text-red-600 border-red-100",
    "acknowledged": "bg-amber-50 text-amber-600 border-amber-100",
    "resolved": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function AIAlerts() {
    const [severityFilter, setSeverityFilter] = useState<string>("All");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [alertStatuses, setAlertStatuses] = useState<Record<string, string>>({});
    const [dismissed, setDismissed] = useState<string[]>([]);
    const [detail, setDetail] = useState<Alert | null>(null);

    const getStatus = (a: Alert) => alertStatuses[a.id] ?? a.status;

    const handleDismiss = (id: string) => setDismissed(prev => [...prev, id]);
    const handleAcknowledge = (id: string) => setAlertStatuses(prev => ({ ...prev, [id]: "acknowledged" }));
    const handleResolve = (id: string) => setAlertStatuses(prev => ({ ...prev, [id]: "resolved" }));

    const visible = alerts.filter(a => !dismissed.includes(a.id));
    const filtered = visible.filter(a => {
        const matchSev = severityFilter === "All" || a.severity === severityFilter;
        const matchStat = statusFilter === "All" || getStatus(a) === statusFilter;
        return matchSev && matchStat;
    });

    const critCount = visible.filter(a => a.severity === "Critical" && getStatus(a) === "active").length;
    const highCount = visible.filter(a => a.severity === "High" && getStatus(a) === "active").length;
    const resolvedCount = visible.filter(a => getStatus(a) === "resolved").length;

    return (
        <DashboardLayout title="AI Alerts" subtitle="AI-powered anomaly detection & real-time intelligence across grievances and sentiment">
            {/* Detail Panel */}
            {detail && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetail(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <span className="font-black text-gray-900">{detail.id}: {detail.title}</span>
                            <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-700 leading-relaxed">{detail.description}</p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-0.5">Ward</p><p className="font-bold text-gray-800">{detail.ward}</p></div>
                                <div><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-0.5">Category</p><p className="font-bold text-gray-800">{detail.category}</p></div>
                                <div><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-0.5">Severity</p><p className="font-bold" style={{ color: detail.severity === 'Critical' ? '#B91C1C' : '#D97706' }}>{detail.severity}</p></div>
                                <div><p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-0.5">AI Confidence</p><p className="font-bold text-red-600">{detail.aiConfidence}%</p></div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => { handleAcknowledge(detail.id); setDetail(null); }} className="flex-1 py-2.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all">Acknowledge</button>
                                <button onClick={() => { handleResolve(detail.id); setDetail(null); }} className="flex-1 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all" style={{ backgroundColor: '#B91C1C' }}>Mark Resolved</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Active", value: visible.filter(a => getStatus(a) === "active").length, bgStyle: { backgroundColor: "#B91C1C" }, text: "text-white" },
                        { label: "Critical", value: critCount, bg: "bg-red-50 border border-red-200", text: "text-red-700" },
                        { label: "High Priority", value: highCount, bg: "bg-orange-50 border border-orange-200", text: "text-orange-700" },
                        { label: "Resolved Today", value: resolvedCount, bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700" },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg ?? ""} ${s.text} rounded-xl p-5`} style={s.bgStyle}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{s.label}</p>
                            <p className="text-3xl font-black mt-1">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <Filter className="w-4 h-4 text-gray-400" />

                    <div className="flex bg-white border border-gray-100 p-1 rounded-xl gap-1 shadow-sm">
                        {["All", "Critical", "High", "Medium", "Low"].map(s => (
                            <button
                                key={s}
                                onClick={() => setSeverityFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${severityFilter === s ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-white border border-gray-100 p-1 rounded-xl gap-1 shadow-sm">
                        {["All", "active", "acknowledged", "resolved"].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === s ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-auto">
                        {filtered.length} of {visible.length} alerts
                    </span>
                </div>

                {/* Alerts Feed */}
                <div className="space-y-4">
                    {filtered.map(alertItem => {
                        const cfg = severityConfig[alertItem.severity];
                        const Icon = cfg.icon;
                        const currentStatus = getStatus(alertItem);
                        return (
                            <div key={alertItem.id} className={`bg-white border-2 ${cfg.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group`}>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className={`p-3 rounded-2xl ${cfg.bg} shrink-0 self-start`}>
                                        <Icon className={`w-5 h-5 ${cfg.text}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="text-xs font-black text-gray-400">{alertItem.id}</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${cfg.bg} ${cfg.text} ${cfg.border} flex items-center gap-1`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${alertItem.severity === "Critical" ? "animate-pulse" : ""}`} />
                                                {alertItem.severity}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusStyle[currentStatus]}`}>
                                                {currentStatus}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold">{alertItem.ward}</span>
                                            <span className="text-[10px] text-gray-400 font-bold ml-auto">{alertItem.time}</span>
                                        </div>

                                        <h3 className="font-black text-gray-900 text-base leading-tight">{alertItem.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{alertItem.description}</p>

                                        <div className="flex flex-wrap items-center gap-4 mt-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Confidence:</span>
                                                <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-600 rounded-full" style={{ width: `${alertItem.aiConfidence}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-red-600">{alertItem.aiConfidence}%</span>
                                            </div>

                                            <div className="flex items-center gap-2 ml-auto">
                                                <button
                                                    onClick={() => handleDismiss(alertItem.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-200 transition-all"
                                                >
                                                    <BellOff className="w-3 h-3" /> Dismiss
                                                </button>
                                                {currentStatus !== "acknowledged" && currentStatus !== "resolved" && (
                                                    <button
                                                        onClick={() => handleAcknowledge(alertItem.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl text-[10px] font-black text-amber-700 hover:bg-amber-100 transition-all"
                                                    >
                                                        <Eye className="w-3 h-3" /> Acknowledge
                                                    </button>
                                                )}
                                                {currentStatus !== "resolved" && (
                                                    <button
                                                        onClick={() => handleResolve(alertItem.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black text-white hover:opacity-90 transition-all shadow-md"
                                                        style={{ backgroundColor: '#B91C1C' }}
                                                    >
                                                        <CheckCircle2 className="w-3 h-3" /> Resolve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDetail(alertItem)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 rounded-xl text-[10px] font-black text-white hover:bg-red-700 transition-all shadow-md shadow-gray-200"
                                                >
                                                    Investigate <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
