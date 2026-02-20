import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import {
    FileBarChart2, Download, Calendar, Filter, ChevronDown,
    TrendingUp, Clock, CheckCircle2, AlertTriangle, Award,
    Printer, Share2, Sparkles, RefreshCw
} from "lucide-react";

const quarterlyKpis = [
    { label: "Total Grievances Received", q1: 1240, q2: 1380, q3: 1520, q4: 1847, unit: "" },
    { label: "Resolved", q1: 1040, q2: 1190, q3: 1340, q4: 1610, unit: "" },
    { label: "Resolution Rate", q1: 83.9, q2: 86.2, q3: 88.2, q4: 87.2, unit: "%" },
    { label: "Avg Resolution Time", q1: 5.8, q2: 5.1, q3: 4.6, q4: 4.2, unit: "h" },
    { label: "Citizen Sentiment Score", q1: 74, q2: 76, q3: 79, q4: 82, unit: "/100" },
    { label: "AI Alerts Generated", q1: 38, q2: 52, q3: 61, q4: 74, unit: "" },
];

const departmentPerf = [
    { dept: "Water Supply", resolved: 91, pending: 9, avgTime: "3.8h" },
    { dept: "Roads & Infrastructure", resolved: 78, pending: 22, avgTime: "6.2h" },
    { dept: "Public Health", resolved: 84, pending: 16, avgTime: "4.1h" },
    { dept: "Sanitation", resolved: 88, pending: 12, avgTime: "5.0h" },
    { dept: "Electricity", resolved: 72, pending: 28, avgTime: "7.4h" },
    { dept: "Parks & Recreation", resolved: 95, pending: 5, avgTime: "2.9h" },
];

const radarData = [
    { subject: "Response Speed", value: 82 },
    { subject: "Resolution Rate", value: 78 },
    { subject: "Citizen Satisfaction", value: 82 },
    { subject: "AI Utilization", value: 91 },
    { subject: "Data Quality", value: 88 },
    { subject: "Alert Accuracy", value: 95 },
];

const chartData = [
    { month: "Aug", received: 310, resolved: 260 },
    { month: "Sep", received: 420, resolved: 340 },
    { month: "Oct", received: 380, resolved: 310 },
    { month: "Nov", received: 510, resolved: 390 },
    { month: "Dec", received: 460, resolved: 380 },
    { month: "Jan", received: 590, resolved: 470 },
    { month: "Feb", received: 530, resolved: 430 },
];

const aiInsights = [
    { icon: TrendingUp, color: "text-blue-500 bg-blue-50", title: "Efficiency Trend", body: "Resolution rate improved by 4.1 percentage points YoY. Primary driver: automated triage via AI reduced misdirected tickets by 32%." },
    { icon: AlertTriangle, color: "text-rose-500 bg-rose-50", title: "Risk Signal", body: "Electricity department trails all others at 72% resolution. Recommend resource audit and SLA enforcement by next Monday." },
    { icon: Award, color: "text-emerald-500 bg-emerald-50", title: "Top Performer", body: "Parks & Recreation achieved 95% resolution with 2.9h avg time — benchmark for other departments. Share their workflow." },
    { icon: CheckCircle2, color: "text-indigo-500 bg-indigo-50", title: "AI Impact", body: "AI-assisted categorization cut avg response time from 5.8h (Q1) to 4.2h (Q4) — a 28% reduction in 9 months." },
];

const reportTypes = ["Executive Summary", "Departmental Deep-Dive", "AI Performance", "Citizen Experience", "Custom Range"];

export default function Reports() {
    const [reportType, setReportType] = useState("Executive Summary");
    const [period, setPeriod] = useState("FY 2025–26");
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => { setGenerating(false); setGenerated(true); }, 1800);
    };

    return (
        <DashboardLayout title="Reports" subtitle="Governance performance intelligence & exportable analytics">
            <div className="space-y-7">

                {/* Header Controls */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Report Type</label>
                            <div className="relative">
                                <select
                                    value={reportType}
                                    onChange={e => setReportType(e.target.value)}
                                    className="pl-4 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                                >
                                    {reportTypes.map(r => <option key={r}>{r}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Period</label>
                            <div className="relative">
                                <select
                                    value={period}
                                    onChange={e => setPeriod(e.target.value)}
                                    className="pl-4 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer"
                                >
                                    {["FY 2025–26", "FY 2024–25", "Q4 2025", "Q3 2025", "Last 30 Days"].map(p => <option key={p}>{p}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Department</label>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                <select className="pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer">
                                    <option>All Departments</option>
                                    {departmentPerf.map(d => <option key={d.dept}>{d.dept}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60"
                        >
                            {generating ? (
                                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                            ) : (
                                <><Sparkles className="w-3.5 h-3.5" /> Generate Report</>
                            )}
                        </button>
                        {generated && (
                            <>
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                                    <Download className="w-3.5 h-3.5" /> Export PDF
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                                    <Printer className="w-3.5 h-3.5" /> Print
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                                    <Share2 className="w-3.5 h-3.5" /> Share
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Header KPI Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Cases FY", value: "5,847", change: "+18.2%", icon: FileBarChart2, color: "text-blue-500" },
                        { label: "Resolved Cases", value: "5,090", change: "+21.4%", icon: CheckCircle2, color: "text-emerald-500" },
                        { label: "Avg Resolution Time", value: "4.2h", change: "-28%", icon: Clock, color: "text-indigo-500" },
                        { label: "Citizen Sentiment", value: "82/100", change: "+10.8%", icon: Award, color: "text-amber-500" },
                    ].map(k => (
                        <div key={k.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-xl bg-gray-50 group-hover:scale-110 transition-transform">
                                    <k.icon className={`w-4 h-4 ${k.color}`} />
                                </div>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700">{k.change}</span>
                            </div>
                            <p className="text-2xl font-black text-gray-900">{k.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{k.label}</p>
                        </div>
                    ))}
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Volume vs Resolution */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-black text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
                                Monthly Volume vs Resolution
                            </h3>
                            <div className="flex items-center gap-3 text-[10px] font-black text-gray-400">
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Received</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" /> Resolved</span>
                            </div>
                        </div>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.4} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 12, fontWeight: 700 }} />
                                    <Bar dataKey="received" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Received" />
                                    <Bar dataKey="resolved" fill="#10B981" radius={[6, 6, 0, 0]} name="Resolved" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Governance Radar */}
                    <div className="bg-[#0B1221] rounded-2xl p-6 shadow-2xl text-white">
                        <h3 className="font-black text-sm mb-1">Governance Scorecard</h3>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-4">Multi-axis performance radar</p>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 700 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar dataKey="value" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.2} strokeWidth={2} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Overall Score</span>
                            <span className="text-xl font-black text-[#D4AF37]">86.0</span>
                        </div>
                    </div>
                </div>

                {/* AI Generated Executive Insights */}
                <div className="bg-gradient-to-br from-[#0B1221] to-[#0f1f3d] rounded-2xl p-7 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-white">AI Executive Briefing</h3>
                                <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Auto-generated intelligence summary · {period}</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-black text-white/60 flex items-center gap-2 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Live
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiInsights.map(insight => (
                            <div key={insight.title} className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer">
                                <div className={`p-2.5 rounded-xl shrink-0 ${insight.color}`}>
                                    <insight.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{insight.title}</p>
                                    <p className="text-sm text-white/80 leading-relaxed">{insight.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quarterly KPI Table */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-black text-gray-900 flex items-center gap-2">
                            <Calendar className="w-4.5 h-4.5 text-indigo-500" />
                            Quarterly Performance Breakdown
                        </h3>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                            <Download className="w-3.5 h-3.5" /> Export CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Metric</th>
                                    {["Q1 FY26", "Q2 FY26", "Q3 FY26", "Q4 FY26"].map(q => (
                                        <th key={q} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">{q}</th>
                                    ))}
                                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {quarterlyKpis.map(kpi => {
                                    const improving = kpi.q4 > kpi.q1;
                                    return (
                                        <tr key={kpi.label} className="hover:bg-blue-50/20 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">{kpi.label}</td>
                                            {[kpi.q1, kpi.q2, kpi.q3, kpi.q4].map((v, i) => (
                                                <td key={i} className="px-6 py-4 text-right text-sm font-black text-gray-700">
                                                    {v}{kpi.unit}
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${improving ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                                    {improving ? "↑ Improving" : "↓ Declining"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Department Performance */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-black text-gray-900 flex items-center gap-2">
                            <Award className="w-4.5 h-4.5 text-amber-500" />
                            Department Performance Scorecard
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {departmentPerf.map((d, idx) => (
                            <div key={d.dept} className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-4 min-w-[200px]">
                                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-600">
                                        #{idx + 1}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{d.dept}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolution Rate</span>
                                        <span className="text-[10px] font-black text-gray-700">{d.resolved}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${d.resolved}%`,
                                                backgroundColor: d.resolved >= 90 ? '#10B981' : d.resolved >= 80 ? '#3B82F6' : '#EF4444'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="text-center">
                                        <p className="text-xs font-black text-gray-900">{d.avgTime}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Avg Time</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black text-amber-600">{d.pending}%</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Pending</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black ${d.resolved >= 90 ? "bg-emerald-50 text-emerald-700" : d.resolved >= 80 ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"}`}>
                                        {d.resolved >= 90 ? "Excellent" : d.resolved >= 80 ? "Good" : "Needs Attention"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
