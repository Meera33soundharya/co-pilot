import { AlertTriangle, Shield, Trash2, Signal, Brain, TrendingUp, ArrowUpRight } from "lucide-react";
import { RiskMeter } from "./PredictiveMeters";

const anomalies = [
    {
        id: 1, ward: "Ward 03", dept: "Infrastructure",
        description: "Critical water pressure drop detected in 14 nodes. 280% spike in citizen reports.",
        severity: "Critical", risk: 92, color: "border-rose-500/40 bg-rose-500/5",
        severityStyle: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
        dot: "bg-rose-500", icon: AlertTriangle, iconColor: "text-rose-400",
    },
    {
        id: 2, ward: "Ward 12", dept: "Public Safety",
        description: "Night-time street light failure in educational zone. Sentiment score dropping.",
        severity: "High Risk", risk: 67, color: "border-orange-500/40 bg-orange-500/5",
        severityStyle: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
        dot: "bg-orange-500", icon: Shield, iconColor: "text-orange-400",
    },
    {
        id: 3, ward: "Ward 09", dept: "Sanitation",
        description: "Waste collection delays exceeding 48hr threshold. Auto-rerouting active.",
        severity: "Medium Risk", risk: 44, color: "border-amber-500/40 bg-amber-500/5",
        severityStyle: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        dot: "bg-amber-500", icon: Trash2, iconColor: "text-amber-400",
    },
];

const aiInsights = [
    { type: "Efficiency", text: "Water resolution time improved by 14% this week vs baseline.", icon: TrendingUp, color: "text-emerald-400 bg-emerald-500/10" },
    { type: "Priority", text: "Ward 09 requires sanitation resource reallocation within 24h.", icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10" },
    { type: "Forecast", text: "Expected 20% spike in infrastructure cases by Monday.", icon: Signal, color: "text-blue-400 bg-blue-500/10" },
    { type: "AI Note", text: "Model confidence at 98.2%. 47 tickets auto-resolved today.", icon: Brain, color: "text-violet-400 bg-violet-500/10" },
];

export function IntelligencePanel() {
    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-rose-500 to-orange-600" />
                    <h2 className="text-base font-black text-gray-900 tracking-tight">Crisis Intelligence</h2>
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        7 Active Anomalies
                    </span>
                </div>
                <button className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 uppercase tracking-widest hover:text-rose-800 transition-colors">
                    View All Alerts <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                {/* Anomaly Feed */}
                <div className="xl:col-span-2 space-y-3">
                    {anomalies.map((a, idx) => {
                        const Icon = a.icon;
                        return (
                            <div
                                key={a.id}
                                className={`rounded-2xl border p-5 ${a.color} hover:scale-[1.01] transition-all cursor-pointer group`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl ${a.severityStyle.replace('text-', 'bg-').split(' ')[0]}/10 shrink-0`}>
                                        <Icon className={`w-5 h-5 ${a.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 flex-wrap mb-2">
                                            <span className="text-sm font-black text-gray-900">{a.ward}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2 py-0.5 bg-gray-100/70 rounded-lg">{a.dept}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-lg ${a.severityStyle}`}>
                                                {a.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed mb-3">{a.description}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <RiskMeter value={a.risk} label="Risk Score" />
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button className="px-3 py-1.5 text-[10px] font-black text-gray-600 bg-white/80 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                                                    Dismiss
                                                </button>
                                                <button className={`px-3 py-1.5 text-[10px] font-black text-white rounded-xl transition-all hover:opacity-90 ${a.dot === 'bg-rose-500' ? 'bg-rose-500' : a.dot === 'bg-orange-500' ? 'bg-orange-500' : 'bg-amber-500'}`}>
                                                    Investigate →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* AI Insights + Predictive Meters */}
                <div className="space-y-4">
                    {/* Predictive dashboard */}
                    <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0B1221, #0f1f3d)' }}>
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
                        <div className="flex items-center gap-2 mb-5">
                            <Brain className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-xs font-black text-white">Predictive Pulse</span>
                            <span className="ml-auto text-[9px] font-black text-white/30 uppercase tracking-widest">AI Live</span>
                        </div>

                        <div className="text-5xl font-black text-white text-center mb-1">82</div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest text-center mb-5">Public Sentiment Score</p>

                        <div className="space-y-4">
                            <RiskMeter value={14} label="System Failure Probability" />
                            <RiskMeter value={68} label="Public Outcry Risk (Ward 03)" />
                            <RiskMeter value={33} label="Escalation Risk" />
                        </div>
                    </div>

                    {/* AI Generated Insights */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain className="w-3.5 h-3.5 text-violet-500" />
                            <span className="text-xs font-black text-gray-900">Generated Insights</span>
                            <span className="ml-auto w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        </div>
                        <div className="space-y-2.5">
                            {aiInsights.map(ins => (
                                <div key={ins.type} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/70 hover:bg-gray-100/50 transition-colors cursor-pointer">
                                    <div className={`p-1.5 rounded-lg shrink-0 ${ins.color}`}>
                                        <ins.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{ins.type}</p>
                                        <p className="text-[11px] text-gray-700 leading-snug">{ins.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
