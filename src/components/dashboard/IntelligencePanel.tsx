import { AlertTriangle, Shield, Trash2, Signal, Brain, TrendingUp, ArrowUpRight } from "lucide-react";
import { RiskMeter } from "./PredictiveMeters";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
    const navigate = useNavigate();
    const [dismissed, setDismissed] = useState<number[]>([]);

    const visibleAnomalies = anomalies.filter(a => !dismissed.includes(a.id));

    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-rose-500 to-orange-600 shadow-sm" />
                    <h2 className="text-base font-bold text-gray-950 tracking-tight">Critical Issues</h2>
                    <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-xl shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                        7 Issues Found
                    </span>
                </div>
                <button onClick={() => navigate("/ai-alerts")} className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-widest hover:text-rose-800 transition-all hover:gap-2">
                    View All Alerts <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                {/* Anomaly Feed */}
                <div className="xl:col-span-2 space-y-3">
                    {visibleAnomalies.map((a, idx) => {
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
                                        <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                                            <span className="text-sm font-extrabold text-[#0B1221] tracking-tight">{a.ward}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2.5 py-0.5 bg-gray-100 border border-gray-200/50 rounded-lg">{a.dept}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm ${a.severityStyle}`}>
                                                {a.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed mb-3">{a.description}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <RiskMeter value={a.risk} label="Risk Score" />
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={(e) => { e.stopPropagation(); setDismissed(prev => [...prev, a.id]); }} className="px-4 py-2 text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm group">
                                                    Ignore
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); navigate("/ai-alerts"); }} className={`px-5 py-2 text-[11px] font-bold text-white rounded-xl transition-all hover:scale-[1.05] active:scale-95 shadow-lg group ${a.dot === 'bg-rose-500' ? 'bg-rose-600 shadow-rose-500/30' : a.dot === 'bg-orange-500' ? 'bg-orange-600 shadow-orange-500/30' : 'bg-amber-600 shadow-amber-500/30'}`}>
                                                    Done →
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
                        <div className="flex items-center gap-3 mb-6">
                            <Brain className="w-5 h-5 text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
                            <span className="text-sm font-bold text-white tracking-tight">AI Ideas</span>
                            <span className="ml-auto text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Online</span>
                        </div>

                        <div className="text-5xl font-extrabold text-white text-center mb-1 tabular-nums tracking-tighter shadow-sm">82</div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] text-center mb-6">Public Confidence Index</p>

                        <div className="space-y-4">
                            <RiskMeter value={14} label="System Failure Probability" />
                            <RiskMeter value={68} label="Public Outcry Risk (Ward 03)" />
                            <RiskMeter value={33} label="Escalation Risk" />
                        </div>
                    </div>

                    {/* AI Generated Insights */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 rounded-lg bg-violet-50 border border-violet-100 shadow-sm">
                                <Brain className="w-4 h-4 text-violet-600" />
                            </div>
                            <span className="text-sm font-bold text-[#0B1221] tracking-tight">AI Notes</span>
                            <span className="ml-auto w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                        </div>
                        <div className="space-y-2.5">
                            {aiInsights.map(ins => (
                                <div key={ins.type} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all cursor-pointer group/insight">
                                    <div className={`p-2 rounded-xl shrink-0 ${ins.color} transition-transform group-hover/insight:scale-110 shadow-sm`}>
                                        <ins.icon className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{ins.type}</p>
                                        <p className="text-sm text-gray-700 leading-relaxed font-medium">{ins.text}</p>
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
