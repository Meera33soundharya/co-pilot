import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, AreaChart, Area
} from "recharts";
import {
    FileBarChart2, Download, Calendar, Filter, ChevronDown,
    TrendingUp, Clock, CheckCircle2, AlertTriangle, Award,
    RefreshCw, Sparkles, Zap, Shield, Target,
    Activity, Globe, Flame
} from "lucide-react";

// ── Realistic Data Sets ──────────────────────────────────────

const KPI_DATA = [
    { label: "Total Cases FY", value: "5,847", change: "+18.2%", icon: Target, color: "text-[#B91C1C]", bg: "bg-red-50" },
    { label: "Resolved Nodes", value: "5,090", change: "+21.4%", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "AI Triage Accuracy", value: "94.2%", change: "+5.1%", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Public Sentiment", value: "82/100", change: "+10.8%", icon: Award, color: "text-blue-600", bg: "bg-blue-50" },
];

const DEPT_STATS = [
    { dept: "Water Supply", score: 91, avg: "3.8h", status: "Elite", color: "#10B981" },
    { dept: "Electricity", score: 72, avg: "7.4h", status: "Critical", color: "#EF4444" },
    { dept: "Public Health", score: 84, avg: "4.1h", status: "Optimal", color: "#B91C1C" },
    { dept: "Infrastructure", score: 78, avg: "6.2h", status: "Improving", color: "#F59E0B" },
    { dept: "Sanitation", score: 88, avg: "5.0h", status: "Stable", color: "#111827" },
];

const VOLUME_CHART = [
    { month: "Aug", volume: 310, resolution: 260 },
    { month: "Sep", volume: 420, resolution: 340 },
    { month: "Oct", volume: 380, resolution: 310 },
    { month: "Nov", volume: 510, resolution: 390 },
    { month: "Dec", volume: 460, resolution: 380 },
    { month: "Jan", volume: 590, resolution: 470 },
    { month: "Feb", volume: 530, resolution: 510 },
];

const RADAR_DATA = [
    { subject: "Response Speed", A: 82, fullMark: 100 },
    { subject: "Resolution Accuracy", A: 78, fullMark: 100 },
    { subject: "Citizen Feedback", A: 82, fullMark: 100 },
    { subject: "AI Reliability", A: 95, fullMark: 100 },
    { subject: "SLA Compliance", A: 88, fullMark: 100 },
];

// ── Types & Interfaces ───────────────────────────────────────

type ReportType = "Executive Summary" | "Departmental Performance" | "AI Impact Analysis" | "Citizen Sentiment Report";

export default function Reports() {
    const [reportType, setReportType] = useState<ReportType>("Executive Summary");
    const [period, setPeriod] = useState("FY 2025–26");
    const [isGenerating, setIsGenerating] = useState(false);
    const [briefing, setBriefing] = useState<string | null>(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        setBriefing(null);
        
        // Dynamic AI Generation Logic
        setTimeout(() => {
            const summaries: Record<ReportType, string> = {
                "Executive Summary": "Overall district health is OPTIMAL at 82.1%. Case resolution has outpaced incoming volume by 12% in Q4. Primary growth in AI triage accuracy identified as the key performance driver.",
                "Departmental Performance": "Infrastructure & Electricity are current bottlenecks. Water Supply maintains a record 91% resolution rate. Recommend departmental cross-pollination to sync workflows.",
                "AI Impact Analysis": "AI has successfully reduced response latency by 28%. Automated classification is now 94.2% accurate, saving an estimated 1,240 administrative man-hours per month.",
                "Citizen Sentiment Report": "Sentiment has climbed from 74 to 82. Transparency noted as the most frequent positive feedback keyword. Resolved ward 07 water crisis improved global scores."
            };
            setBriefing(summaries[reportType]);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <DashboardLayout title="Reports" subtitle="Unified Governance KPI & Intelligence Portal">
            <div className="space-y-8 pb-20">

                {/* ── Control Console ──────────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] pointer-events-none" />
                    
                    <div className="flex flex-wrap gap-8 w-full xl:w-auto">
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Report Module</label>
                            <div className="relative group">
                                <select 
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value as ReportType)}
                                    className="pl-6 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:bg-white focus:border-red-100 appearance-none cursor-pointer transition-all min-w-[260px] shadow-sm"
                                >
                                    <option>Executive Summary</option>
                                    <option>Departmental Performance</option>
                                    <option>AI Impact Analysis</option>
                                    <option>Citizen Sentiment Report</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#B91C1C] transition-colors" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Archive Period</label>
                            <div className="relative group">
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-hover:text-[#B91C1C] transition-colors" />
                                <select 
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className="pl-14 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:bg-white focus:border-red-100 appearance-none cursor-pointer transition-all min-w-[200px] shadow-sm"
                                >
                                    <option>FY 2025–26</option>
                                    <option>Q4 2025</option>
                                    <option>Last 30 Days</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-[#B91C1C] transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full xl:w-auto">
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="flex-1 xl:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-[#B91C1C] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-neutral-900 transition-all shadow-2xl shadow-red-900/20 active:scale-95 disabled:opacity-60"
                        >
                            {isGenerating ? <><RefreshCw className="w-4 h-4 animate-spin" /> Compiling Intelligence...</> : <><Sparkles className="w-4 h-4" /> Generate Report Briefing</>}
                        </button>
                        <button className="p-5 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ── AI Intelligence Briefing ────────────────────────── */}
                {briefing && (
                    <div className="bg-[#0D1425] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/10 blur-[120px] pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                            <div className="w-20 h-20 rounded-3xl bg-red-600/20 border border-red-600/30 flex items-center justify-center shrink-0">
                                <Sparkles className="w-8 h-8 text-red-500 animate-pulse" />
                            </div>
                            <div className="space-y-4 text-center md:text-left">
                                <div className="flex items-center gap-3 justify-center md:justify-start">
                                    <h2 className="text-xl font-black text-white uppercase tracking-widest">{reportType} Insight</h2>
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-black uppercase tracking-widest">Live Analysis</span>
                                </div>
                                <p className="text-lg font-bold text-white/80 leading-relaxed max-w-4xl tracking-tight italic">
                                    "{briefing}"
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
                                        <Clock className="w-3 h-3" /> Updated 4 mins ago
                                    </div>
                                    <div className="w-px h-3 bg-white/10" />
                                    <div className="flex items-center gap-2 text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
                                        <Globe className="w-3 h-3" /> Regional Node Secure
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Core Metric Strip ───────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {KPI_DATA.map(k => (
                        <div key={k.label} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className={`p-3.5 rounded-2xl ${k.bg} border border-gray-50 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                                    <k.icon className={`w-5 h-5 ${k.color}`} />
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl text-emerald-600 text-[10px] font-black tracking-tight border border-emerald-100/50">
                                    <TrendingUp className="w-3 h-3" /> {k.change}
                                </div>
                            </div>
                            <p className="text-4xl font-black text-gray-900 leading-none mb-3 relative z-10 tracking-tighter">{k.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 relative z-10">{k.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── Visual Analytics ────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Resolution Performance Matrix */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-red-600" />
                                    Dynamic Case Lifecycle
                                </h3>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Correlation: Volume vs Resolution Capacity</p>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 group cursor-default">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#B91C1C] ring-4 ring-red-100" /> Incoming
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 group cursor-default">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-900 ring-4 ring-gray-100" /> Resolution
                                </div>
                            </div>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={VOLUME_CHART}>
                                    <defs>
                                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#B91C1C" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} />
                                    <Tooltip 
                                        cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }}
                                        itemStyle={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}
                                    />
                                    <Area type="monotone" dataKey="volume" stroke="#B91C1C" strokeWidth={4} fillOpacity={1} fill="url(#colorVolume)" />
                                    <Area type="monotone" dataKey="resolution" stroke="#111827" strokeWidth={4} strokeDasharray="8 8" fillOpacity={0} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Governance Scoring Radar */}
                    <div className="bg-[#0D1425] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-[80px] pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1 flex items-center gap-2">
                             <Shield className="w-3.5 h-3.5" /> Governance Radar
                        </h3>
                        <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-10">Cross-Division Protocol Health</p>
                        <div className="h-64 relative z-10 scale-110">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }} />
                                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="GovScore" dataKey="A" stroke="#B91C1C" fill="#B91C1C" fillOpacity={0.2} strokeWidth={4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 flex items-center justify-between pt-8 border-t border-white/5 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Gov-Index</p>
                                <p className="text-3xl font-black text-white italic">86.2<span className="text-xs text-[#B91C1C] ml-1">Pts</span></p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-red-600 group-hover:border-red-600 transition-all duration-500">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Detailed Performance Breakdown ───────────────────── */}
                <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
                                <Award className="w-5 h-5 text-red-600" />
                                Operational Scorecard
                            </h3>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Granular breakdown by administrative division</p>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black text-gray-600 hover:bg-[#B91C1C] hover:text-white hover:border-[#B91C1C] transition-all shadow-sm">
                            <Download className="w-4 h-4" /> Export CSV Source
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {DEPT_STATS.map((d, idx) => (
                            <div key={d.dept} className="flex flex-col lg:flex-row lg:items-center gap-8 px-10 py-6 hover:bg-red-50/20 transition-all group">
                                <div className="flex items-center gap-6 min-w-[280px]">
                                    <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center text-xs font-black text-white group-hover:bg-[#B91C1C] transition-colors">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <span className="text-sm font-black text-gray-900 block leading-tight">{d.dept}</span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Maintained Division</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Institutional Efficiency</span>
                                        <span className="text-sm font-black text-gray-900">{d.score}%</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000 relative"
                                            style={{ 
                                                width: `${d.score}%`, 
                                                backgroundColor: d.color 
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10 shrink-0">
                                    <div className="text-center">
                                        <p className="text-sm font-black text-gray-900">{d.avg}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Latency</p>
                                    </div>
                                    <div className="min-w-[120px]">
                                        <span className={`w-full px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${
                                            d.status === 'Elite' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                                            d.status === 'Critical' ? 'bg-red-50 text-red-700 border border-red-100 animate-pulse' : 
                                            'bg-gray-100 text-gray-600 border border-gray-200'
                                        }`}>
                                            {d.status === 'Elite' && <Globe className="w-3 h-3" />}
                                            {d.status === 'Critical' && <Flame className="w-3 h-3" />}
                                            {d.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
