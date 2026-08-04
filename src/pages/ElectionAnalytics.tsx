import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import {
    Trophy, TrendingUp, TrendingDown, Users, MapPin,
    BarChart2, AlertTriangle, Zap, Target, ChevronRight,
    Brain, Sparkles, Shield, Activity
} from "lucide-react";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line, AreaChart, Area
} from "recharts";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const VOTE_SHARE = [
    { name: "Selvam (INC)", value: 48.2, color: "#2563EB", seats: 14 },
    { name: "Opponent (BJP)", value: 31.4, color: "#DC2626", seats: 9 },
    { name: "DMK Alliance", value: 13.7, color: "#D97706", seats: 4 },
    { name: "Others", value: 6.7, color: "#9CA3AF", seats: 1 },
];

const BOOTH_DATA = [
    { ward: "Ward 01", support: 72, swing: false, votes: 3240 },
    { ward: "Ward 02", support: 55, swing: true, votes: 2890 },
    { ward: "Ward 03", support: 81, swing: false, votes: 4120 },
    { ward: "Ward 04", support: 44, swing: true, votes: 2210 },
    { ward: "Ward 05", support: 67, swing: false, votes: 3560 },
    { ward: "Ward 06", support: 38, swing: true, votes: 1980 },
    { ward: "Ward 07", support: 79, swing: false, votes: 3890 },
    { ward: "Ward 08", support: 52, swing: true, votes: 2640 },
    { ward: "Ward 09", support: 88, swing: false, votes: 4430 },
    { ward: "Ward 10", support: 41, swing: true, votes: 2070 },
];

const OPPONENT_RADAR = [
    { metric: "Public Trust", you: 82, opponent: 58 },
    { metric: "Social Media", you: 74, opponent: 69 },
    { metric: "Complaint Resolution", you: 91, opponent: 42 },
    { metric: "Youth Support", you: 68, opponent: 71 },
    { metric: "Rural Reach", you: 77, opponent: 55 },
    { metric: "Media Coverage", you: 65, opponent: 78 },
];

const ELECTION_TREND = [
    { year: "2014", selvam: 41.2, opponent: 38.1 },
    { year: "2016", selvam: 44.8, opponent: 36.7 },
    { year: "2019", selvam: 46.1, opponent: 33.2 },
    { year: "2021", selvam: 48.2, opponent: 31.4 },
    { year: "2026 (Proj.)", selvam: 51.8, opponent: 29.1 },
];

const SWING_WARDS = BOOTH_DATA.filter(b => b.swing);
const STRONG_WARDS = BOOTH_DATA.filter(b => !b.swing && b.support >= 70);

export default function ElectionAnalytics() {
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    function generateAIInsight() {
        setGenerating(true);
        setAiInsight(null);
        setTimeout(() => {
            setAiInsight(
                `📊 AI Election Intelligence — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}\n\n` +
                `🏆 Projected Win Probability: 73.4% (High Confidence)\n` +
                `⚡ Critical Swing Wards: Ward 02, 04, 06, 08, 10 — require immediate ground-level engagement\n\n` +
                `📌 Key Findings:\n` +
                `• Ward 09 is your stronghold (+88% support) — use for volunteer mobilization\n` +
                `• Youth vote in Ward 06 is trending against you (-8% MoM) — deploy youth wing campaign\n` +
                `• Opponent gaining in media coverage (+13%) — recommend 2 press conferences this week\n\n` +
                `💡 AI Strategy: Focus complaint resolution in Wards 04, 06, 10 over next 30 days. Resolving 15+ complaints in these wards is predicted to swing ~4,000 votes in your favour.\n\n` +
                `🔮 Projection: Current trajectory gives 51.8% vote share — exceeding 2021 by +3.6 points.`
            );
            setGenerating(false);
        }, 2000);
    }

    const totalVotes = BOOTH_DATA.reduce((s, b) => s + b.votes, 0);
    const yourVotes = Math.round(totalVotes * 0.482);
    const winMargin = Math.round(totalVotes * (0.482 - 0.314));

    return (
        <DashboardLayout title="Election Analytics" subtitle="AI-powered vote intelligence & constituency performance">
            <div className="space-y-6">

                {/* ── Hero KPIs ─────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: "Vote Share", value: "48.2%", sub: "+2.1% vs 2019", icon: Trophy, color: "text-amber-600", bg: "bg-amber-50", trend: "up" },
                        { label: "Seats Won", value: "14/28", sub: "Simple majority", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", trend: "up" },
                        { label: "Win Margin", value: winMargin.toLocaleString(), sub: "Votes ahead", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", trend: "up" },
                        { label: "Swing Wards", value: SWING_WARDS.length, sub: "Need action", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", trend: "down" },
                    ].map(kpi => {
                        const Icon = kpi.icon;
                        return (
                            <div key={kpi.label} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 blur-[30px] group-hover:bg-red-500/10 transition-all pointer-events-none" />
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 ${kpi.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-5 h-5 ${kpi.color}`} />
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${kpi.trend === "up" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                        {kpi.sub}
                                    </span>
                                </div>
                                <p className="text-4xl font-black text-gray-900 tracking-tight mb-1">{kpi.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{kpi.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* ── AI Election Briefing ──────────────────────────────── */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-amber-500/20 rounded-2xl">
                                <Brain className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">AI Election Intelligence</h2>
                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Predictive analysis · Strategy recommendations</p>
                            </div>
                        </div>
                        <button
                            onClick={generateAIInsight}
                            disabled={generating}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-60 shrink-0"
                        >
                            <Sparkles className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
                            {generating ? "Analysing…" : "Generate AI Insight"}
                        </button>
                    </div>
                    {aiInsight && (
                        <div className="relative z-10 mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
                            <pre className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed font-sans">{aiInsight}</pre>
                        </div>
                    )}
                    {!aiInsight && !generating && (
                        <div className="relative z-10 mt-6 bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                            <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-2" />
                            <p className="text-white/30 text-xs font-black uppercase tracking-widest">Click "Generate AI Insight" for strategic election intelligence</p>
                        </div>
                    )}
                    {generating && (
                        <div className="relative z-10 mt-6 bg-white/5 border border-white/10 rounded-2xl p-8 flex items-center justify-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                            <p className="text-white/50 text-xs font-black uppercase tracking-widest">Analysing constituency data & election patterns…</p>
                        </div>
                    )}
                </div>

                {/* ── Vote Share + Trend ────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Vote Share Donut */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <BarChart2 className="w-4 h-4" /> Vote Share Breakdown
                        </h3>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={VOTE_SHARE} dataKey="value" cx="50%" cy="50%"
                                        outerRadius={90} innerRadius={55} paddingAngle={3} nameKey="name">
                                        {VOTE_SHARE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(val) => [`${val}%`, "Vote Share"]}
                                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", fontSize: 11, fontWeight: 900 }} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 900 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {VOTE_SHARE.map(p => (
                                <div key={p.name} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-black text-gray-900 truncate">{p.name}</p>
                                        <p className="text-[9px] text-gray-400 font-black">{p.value}% · {p.seats} seats</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Election Trend */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Multi-Election Trend
                        </h3>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ELECTION_TREND}>
                                    <defs>
                                        <linearGradient id="youGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="oppGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: "#9CA3AF" }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: "#9CA3AF" }} domain={[25, 60]} tickFormatter={v => `${v}%`} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.08)", fontSize: 11, fontWeight: 900 }}
                                        formatter={(val) => [`${val}%`]} />
                                    <Area type="monotone" dataKey="selvam" stroke="#2563EB" strokeWidth={3} fill="url(#youGrad)" name="Selvam (You)" dot={{ fill: "#2563EB", r: 5, strokeWidth: 2, stroke: "#fff" }} />
                                    <Area type="monotone" dataKey="opponent" stroke="#DC2626" strokeWidth={2} strokeDasharray="4 2" fill="url(#oppGrad)" name="Opponent" dot={{ fill: "#DC2626", r: 4, strokeWidth: 2, stroke: "#fff" }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── Opponent Radar + Booth Performance ───────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Opponent Radar */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Opponent Comparison
                        </h3>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={OPPONENT_RADAR}>
                                    <PolarGrid stroke="#F3F4F6" />
                                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 8, fontWeight: 700, fill: "#9CA3AF" }} />
                                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="You" dataKey="you" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
                                    <Radar name="Opponent" dataKey="opponent" stroke="#DC2626" fill="#DC2626" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 2" />
                                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 9, fontWeight: 900 }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Booth-wise Performance */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ward-wise Support Map</h3>
                            </div>
                            <div className="flex items-center gap-3 text-[9px] font-black text-gray-400 uppercase">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Strong</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Swing</span>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {BOOTH_DATA.map(b => (
                                <div key={b.ward} className="flex items-center gap-4 px-7 py-3.5 hover:bg-gray-50/50 transition-all">
                                    <div className={`w-2 h-8 rounded-full shrink-0 ${b.swing ? "bg-amber-400" : b.support >= 70 ? "bg-blue-500" : "bg-gray-200"}`} />
                                    <div className="w-16 shrink-0">
                                        <p className="text-xs font-black text-gray-900">{b.ward}</p>
                                        <p className="text-[9px] text-gray-400 font-black">{b.votes.toLocaleString()} votes</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[9px] font-black text-gray-500">{b.support}% support</span>
                                            {b.swing && (
                                                <span className="text-[8px] font-black px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full uppercase">Swing</span>
                                            )}
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${b.support >= 70 ? "bg-blue-500" : b.support >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                                                style={{ width: `${b.support}%` }}
                                            />
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Swing Ward Action Plan ─────────────────────────── */}
                <div className="bg-amber-50 border border-amber-200 rounded-[2.5rem] p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-amber-100 rounded-2xl">
                            <Zap className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-amber-900">Swing Ward AI Action Plan</h2>
                            <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">{SWING_WARDS.length} wards need immediate ground mobilization</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {SWING_WARDS.map((w, i) => (
                            <div key={w.ward} className="bg-white rounded-2xl p-5 border border-amber-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-black text-gray-900">{w.ward}</span>
                                    <span className="text-[9px] font-black px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{w.support}%</span>
                                </div>
                                <p className="text-[9px] text-gray-500 font-bold leading-relaxed">
                                    {i === 0 && "Focus on water supply complaints — 12 unresolved. High impact."}
                                    {i === 1 && "Youth voter base. Deploy college outreach + social media push."}
                                    {i === 2 && "Road repair pending since 90 days. Resolve to flip this ward."}
                                    {i === 3 && "Electricity issue affecting 2,400 homes. Urgent resolution."}
                                </p>
                                <button className="mt-3 w-full text-[9px] font-black uppercase tracking-wider bg-amber-100 hover:bg-amber-200 text-amber-800 py-2 rounded-xl transition-all flex items-center justify-center gap-1">
                                    Deploy Team <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
