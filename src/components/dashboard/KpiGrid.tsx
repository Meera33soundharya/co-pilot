import { useCountUp } from "@/hooks/useCountUp";
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
        label: "Sentiment Index",
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
    const Icon = kpi.icon;
    const TrendIcon = kpi.up ? TrendingUp : TrendingDown;

    return (
        <div
            className="relative bg-white rounded-3xl p-6 border border-gray-100/80 hover:border-gray-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 group overflow-hidden cursor-pointer"
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
                <div className={`p-3 rounded-2xl ${kpi.bg} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-xl ${kpi.up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    <TrendIcon className="w-3 h-3" />
                    {kpi.change}
                </div>
            </div>

            {/* Value */}
            <div className="space-y-1 mb-4 relative z-10">
                <div className="text-3xl font-black text-gray-900 tracking-tight leading-none tabular-nums">
                    {kpi.display}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">{kpi.label}</div>
            </div>

            {/* Sparkline */}
            <div className="relative z-10">
                <Sparkline data={kpi.sparkline} color={kpi.sparkColor} />
            </div>

            {/* Hover arrow */}
            <button className="absolute bottom-4 right-4 w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100">
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
        </div>
    );
}

export function KpiGrid() {
    return (
        <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                    <h2 className="text-base font-black text-gray-900 tracking-tight">Performance KPIs</h2>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">Live · Updated just now</span>
                </div>
                <button className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">
                    View Full Report <ArrowUpRight className="w-3.5 h-3.5" />
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
