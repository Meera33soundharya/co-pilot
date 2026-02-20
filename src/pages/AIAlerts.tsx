import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { AlertTriangle, Info, Zap, Filter, BellOff, Eye, ArrowRight, Activity } from "lucide-react";

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
    Critical: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: AlertTriangle, dot: "bg-rose-500" },
    High: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: Zap, dot: "bg-orange-500" },
    Medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Info, dot: "bg-amber-400" },
    Low: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Activity, dot: "bg-blue-400" },
};

const statusStyle: Record<string, string> = {
    "active": "bg-rose-50 text-rose-600 border-rose-100",
    "acknowledged": "bg-amber-50 text-amber-600 border-amber-100",
    "resolved": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function AIAlerts() {
    const [severityFilter, setSeverityFilter] = useState<string>("All");
    const [statusFilter, setStatusFilter] = useState<string>("All");

    const filtered = alerts.filter(a => {
        const matchSev = severityFilter === "All" || a.severity === severityFilter;
        const matchStat = statusFilter === "All" || a.status === statusFilter;
        return matchSev && matchStat;
    });

    const critCount = alerts.filter(a => a.severity === "Critical" && a.status === "active").length;
    const highCount = alerts.filter(a => a.severity === "High" && a.status === "active").length;
    const resolvedCount = alerts.filter(a => a.status === "resolved").length;

    return (
        <DashboardLayout title="AI Alerts" subtitle="Anomaly detection & real-time intelligence feed">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Active", value: alerts.filter(a => a.status === "active").length, bg: "bg-rose-600", text: "text-white" },
                        { label: "Critical", value: critCount, bg: "bg-rose-50 border border-rose-200", text: "text-rose-700" },
                        { label: "High Priority", value: highCount, bg: "bg-orange-50 border border-orange-200", text: "text-orange-700" },
                        { label: "Resolved Today", value: resolvedCount, bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700" },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} ${s.text} rounded-2xl p-5`}>
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
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${severityFilter === s ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-700"}`}
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
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === s ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-700"}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-auto">
                        {filtered.length} alerts
                    </span>
                </div>

                {/* Alerts Feed */}
                <div className="space-y-4">
                    {filtered.map(alert => {
                        const cfg = severityConfig[alert.severity];
                        const Icon = cfg.icon;
                        return (
                            <div key={alert.id} className={`bg-white border-2 ${cfg.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group`}>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className={`p-3 rounded-2xl ${cfg.bg} shrink-0 self-start`}>
                                        <Icon className={`w-5 h-5 ${cfg.text}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <span className="text-xs font-black text-gray-400">{alert.id}</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${cfg.bg} ${cfg.text} ${cfg.border} flex items-center gap-1`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${alert.severity === "Critical" ? "animate-pulse" : ""}`} />
                                                {alert.severity}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusStyle[alert.status]}`}>
                                                {alert.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold">{alert.ward}</span>
                                            <span className="text-[10px] text-gray-400 font-bold ml-auto">{alert.time}</span>
                                        </div>

                                        <h3 className="font-black text-gray-900 text-base leading-tight group-hover:text-blue-700 transition-colors">{alert.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{alert.description}</p>

                                        <div className="flex flex-wrap items-center gap-4 mt-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Confidence:</span>
                                                <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${alert.aiConfidence}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-blue-600">{alert.aiConfidence}%</span>
                                            </div>

                                            <div className="flex items-center gap-2 ml-auto">
                                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-200 transition-all">
                                                    <BellOff className="w-3 h-3" /> Dismiss
                                                </button>
                                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-200 transition-all">
                                                    <Eye className="w-3 h-3" /> Acknowledge
                                                </button>
                                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 rounded-xl text-[10px] font-black text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
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
