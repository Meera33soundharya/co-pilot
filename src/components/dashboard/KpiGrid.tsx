import { useNavigate } from "react-router-dom";
import { MessageSquare, AlertTriangle, Zap, CheckCircle2, Clock, Laugh, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { Sparkline } from "./Sparkline";

const kpiData = [
    {
        label: "Total Complaints",
        value: 2847,
        display: "2,847",
        change: "+12.4%",
        up: true,
        icon: MessageSquare,
        gradient: "from-blue-500 to-blue-600",
        bg: "bg-blue-50",
        iconColor: "text-blue-600",
        glow: "rgba(59,130,246,0.15)",
        sparkline: [{ value: 30 }, { value: 45 }, { value: 35 }, { value: 50 }, { value: 40 }, { value: 60 }],
        sparkColor: "#3B82F6",
    },
    {
        label: "High Priority Cases",
        value: 183,
        display: "183",
        change: "-8.2%",
        up: false,
        icon: AlertTriangle,
        gradient: "from-rose-500 to-red-600",
        bg: "bg-rose-50",
        iconColor: "text-rose-600",
        glow: "rgba(239,68,68,0.15)",
        sparkline: [{ value: 40 }, { value: 30 }, { value: 35 }, { value: 20 }, { value: 25 }, { value: 15 }],
        sparkColor: "#EF4444",
    },
    {
        label: "AI Alerts Active",
        value: 7,
        display: "7",
        change: "+3",
        up: true,
        icon: Zap,
        gradient: "from-amber-500 to-yellow-500",
        bg: "bg-amber-50",
        iconColor: "text-amber-600",
        glow: "rgba(212,175,55,0.15)",
        sparkline: [{ value: 5 }, { value: 8 }, { value: 4 }, { value: 10 }, { value: 7 }, { value: 9 }],
        sparkColor: "#D4AF37",
    },
    {
        label: "Resolution Rate",
        value: 78.3,
        display: "78.3%",
        change: "+5.1%",
        up: true,
        icon: CheckCircle2,
        gradient: "from-emerald-500 to-green-600",
        bg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        glow: "rgba(16,185,129,0.15)",
        sparkline: [{ value: 65 }, { value: 68 }, { value: 72 }, { value: 70 }, { value: 75 }, { value: 78 }],
        sparkColor: "#10B981",
    },
    {
        label: "Avg Resolution Time",
        value: 4,
        display: "4.2h",
        change: "-0.5h",
        up: true,
        icon: Clock,
        gradient: "from-violet-500 to-purple-600",
        bg: "bg-violet-50",
        iconColor: "text-violet-600",
        glow: "rgba(139,92,246,0.15)",
        sparkline: [{ value: 5.2 }, { value: 5.0 }, { value: 4.8 }, { value: 4.5 }, { value: 4.3 }, { value: 4.2 }],
        sparkColor: "#8B5CF6",
    },
    {
        label: "Happiness Score",
        value: 82,
        display: "82/100",
        change: "+2.4%",
        up: true,
        icon: Laugh,
        gradient: "from-pink-500 to-rose-500",
        bg: "bg-pink-50",
        iconColor: "text-pink-600",
        glow: "rgba(236,72,153,0.15)",
        sparkline: [{ value: 75 }, { value: 77 }, { value: 80 }, { value: 79 }, { value: 81 }, { value: 82 }],
        sparkColor: "#EC4899",
    },
];

function KpiCard({ kpi, index }: { kpi: typeof kpiData[0]; index: number }) {
    const navigate = useNavigate();
    const Icon = kpi.icon;
    const TrendIcon = kpi.up ? TrendingUp : TrendingDown;

    return (
        <div
            onClick={() => navigate(kpi.label.includes("Alert") ? "/ai-alerts" : "/reports")}
            className="relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-blue-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group overflow-hidden cursor-pointer"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Hover glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${kpi.glow} 0%, transparent 70%)` }}
            />

            {/* Top bar gradient line */}
            <div className={`absolute top-0 left-6 right-6 h-[2px] rounded-b-full bg-gradient-to-r ${kpi.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Header */}
            <div className="flex items-start justify-between mb-5 relative z-10">
                <div className={`p-3 rounded-2xl ${kpi.bg} group-hover:scale-110 transition-transform duration-300 border border-transparent group-hover:border-inherit`}>
                    <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-xl shadow-sm ${kpi.up ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50" : "bg-rose-50 text-rose-700 border border-rose-100/50"}`}>
                    <TrendIcon className="w-3.5 h-3.5" />
                    {kpi.change}
                </div>
            </div>

            {/* Value */}
            <div className="space-y-1 mb-5 relative z-10">
                <div className="text-3xl font-extrabold text-[#0B1221] tracking-tight leading-none tabular-nums">
                    {kpi.display}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-500 transition-colors">{kpi.label}</div>
            </div>

            {/* Sparkline */}
            <div className="relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                <Sparkline data={kpi.sparkline} color={kpi.sparkColor} />
            </div>

            {/* Hover arrow indicator */}
            <div className="absolute bottom-4 right-4 w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-blue-600 group-hover:border-blue-600 scale-90 group-hover:scale-100">
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
            </div>
        </div>
    );
}

export function KpiGrid() {
    const navigate = useNavigate();
    return (
        <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                    <h2 className="text-base font-bold text-gray-950 tracking-tight">Main Stats</h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white border border-gray-100 px-3 py-1 rounded-xl shadow-sm">Live Tracker</span>
                </div>
                <button
                    onClick={() => navigate("/reports")}
                    className="flex items-center gap-2 text-xs font-extrabold text-[#0B1221] uppercase tracking-widest hover:text-blue-600 transition-all hover:gap-3 active:scale-95 group"
                >
                    View All Reports <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpiData.map((kpi, i) => (
                    <KpiCard key={kpi.label} kpi={kpi} index={i} />
                ))}
            </div>
        </div>
    );
}
