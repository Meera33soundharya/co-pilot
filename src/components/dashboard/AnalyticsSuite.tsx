import { useState } from "react";
import {
    AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { TrendingUp, ArrowUpRight, Flame, Layers } from "lucide-react";

const trendData = [
    { month: "Aug", complaints: 310, resolved: 260, pending: 50 },
    { month: "Sep", complaints: 420, resolved: 340, pending: 80 },
    { month: "Oct", complaints: 380, resolved: 310, pending: 70 },
    { month: "Nov", complaints: 510, resolved: 390, pending: 120 },
    { month: "Dec", complaints: 460, resolved: 380, pending: 80 },
    { month: "Jan", complaints: 590, resolved: 470, pending: 120 },
    { month: "Feb", complaints: 530, resolved: 430, pending: 100 },
];

const categoryData = [
    { name: "Water Supply", value: 28, color: "#3B82F6" },
    { name: "Roads", value: 24, color: "#8B5CF6" },
    { name: "Public Health", value: 18, color: "#10B981" },
    { name: "Education", value: 14, color: "#D4AF37" },
    { name: "Electricity", value: 9, color: "#EF4444" },
    { name: "Others", value: 7, color: "#64748B" },
];

const wardData = [
    { ward: "W01", volume: 40, color: "#10B981" },
    { ward: "W02", volume: 15, color: "#3B82F6" },
    { ward: "W03", volume: 92, color: "#EF4444" },
    { ward: "W04", volume: 55, color: "#F59E0B" },
    { ward: "W05", volume: 25, color: "#10B981" },
    { ward: "W06", volume: 70, color: "#EF4444" },
    { ward: "W07", volume: 30, color: "#3B82F6" },
    { ward: "W08", volume: 45, color: "#F59E0B" },
    { ward: "W09", volume: 65, color: "#F59E0B" },
    { ward: "W10", volume: 20, color: "#10B981" },
    { ward: "W11", volume: 80, color: "#EF4444" },
    { ward: "W12", volume: 35, color: "#3B82F6" },
];

const radarData = [
    { subject: "Response Speed", value: 82 },
    { subject: "Resolution Rate", value: 78 },
    { subject: "Satisfaction", value: 82 },
    { subject: "AI Utilization", value: 91 },
    { subject: "Data Quality", value: 88 },
    { subject: "Alert Precision", value: 95 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0B1221] border border-white/10 rounded-2xl p-4 shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{label}</p>
                {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="capitalize">{p.dataKey}:</span>
                        <span>{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const timeframes = ["7D", "30D", "90D"];

export function AnalyticsSuite() {
    const [timeframe, setTimeframe] = useState("30D");

    const wardColor = (v: number) => v >= 70 ? "#EF4444" : v >= 40 ? "#F59E0B" : "#10B981";

    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600" />
                    <h2 className="text-base font-black text-gray-900 tracking-tight">Analytics Intelligence</h2>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">Multi-dimensional</span>
                </div>
                <button className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors">
                    Deep Analytics <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Top Row: Main Trend + Category */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* ── Trend Area Chart (spans 2 cols) ── */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-7 shadow-sm group hover:shadow-lg transition-all overflow-hidden relative">
                    {/* Top gradient line */}
                    <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-60" />

                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                <h3 className="text-sm font-black text-gray-900">Complaint Trend & Resolution Forecast</h3>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">AI-driven monthly analysis</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1 border border-gray-100">
                            {timeframes.map(tf => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeframe(tf)}
                                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${timeframe === tf ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-5 mb-5">
                        {[["#3B82F6", "Complaints"], ["#10B981", "Resolved"], ["#F59E0B", "Pending"]].map(([c, l]) => (
                            <div key={l} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                                <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: c }} />
                                {l}
                            </div>
                        ))}
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F5F9" strokeWidth={1} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} width={30} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="complaints" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gradBlue)" dot={false} activeDot={{ r: 5, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} />
                                <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2.5} fill="url(#gradGreen)" dot={false} activeDot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} />
                                <Area type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} fill="url(#gradAmber)" dot={false} activeDot={{ r: 5, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary stats */}
                    <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-4">
                        {[
                            { label: "Peak Month", val: "Jan", color: "text-blue-600" },
                            { label: "Best Resolution", val: "82.3%", color: "text-emerald-600" },
                            { label: "AI Forecast ▶ Mar", val: "+20%", color: "text-amber-600" },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className={`text-sm font-black ${s.color}`}>{s.val}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Category Donut (dark) ── */}
                <div className="rounded-3xl p-7 shadow-2xl relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #060D1A 0%, #0B1221 100%)' }}>
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Layers className="w-4 h-4 text-[#D4AF37]" />
                            <h3 className="text-sm font-black text-white">Issue Categories</h3>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-5">Classification across sectors</p>

                        <div className="flex justify-center mb-5">
                            <div className="relative">
                                <div className="h-44 w-44">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                                                {categoryData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} opacity={0.9} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-white">2.8k</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Total Cases</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            {categoryData.map(c => (
                                <div key={c.name} className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                    <span className="text-[11px] font-bold text-white/60 flex-1 truncate">{c.name}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${c.value * 3.5}%`, backgroundColor: c.color }} />
                                        </div>
                                        <span className="text-[10px] font-black text-white/50 w-8 text-right">{c.value}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Ward Heatmap + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* ── Ward Heatmap ── */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-7 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full bg-gradient-to-r from-rose-500 to-amber-500 opacity-40" />

                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Flame className="w-4 h-4 text-rose-500" />
                                <h3 className="text-sm font-black text-gray-900">Ward Density Heatmap</h3>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Geographic complaint concentration · 12 wards</p>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
                            {[["#10B981", "Low"], ["#F59E0B", "Medium"], ["#EF4444", "Critical"]].map(([c, l]) => (
                                <div key={l} className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
                                    <span className="text-gray-400">{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bar chart */}
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={wardData} barSize={18}>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F8FAFC" />
                                <XAxis dataKey="ward" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} width={25} domain={[0, 100]} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 4 }}
                                    contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 11, fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="volume" name="Complaint Volume" radius={[6, 6, 0, 0]}>
                                    {wardData.map((d, i) => (
                                        <Cell key={i} fill={wardColor(d.volume)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top 3 risk wards */}
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Top Risk:</span>
                        {wardData.filter(w => w.volume >= 70).map(w => (
                            <span key={w.ward} className="px-3 py-1 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-black text-rose-700 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                {w.ward} — {w.volume}%
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── Governance Radar ── */}
                <div className="rounded-3xl border border-indigo-100/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 p-7 shadow-sm hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <h3 className="text-sm font-black text-gray-900">Governance Scorecard</h3>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Multi-axis performance radar</p>

                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(99,102,241,0.15)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: '#6366F1' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-2 flex items-center justify-between p-3 bg-white rounded-2xl border border-indigo-100/50 shadow-sm">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Overall Score</p>
                            <p className="text-xl font-black text-gray-900 mt-0.5">86.0 <span className="text-sm font-bold text-indigo-500">/ 100</span></p>
                        </div>
                        <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-700">
                            A Grade
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
