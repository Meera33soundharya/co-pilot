import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { TrendingUp, TrendingDown, MapPin, Activity, Award, Download } from "lucide-react";

const monthlyData = [
    { month: "Aug", total: 310, resolved: 260, pending: 50 },
    { month: "Sep", total: 420, resolved: 340, pending: 80 },
    { month: "Oct", total: 380, resolved: 310, pending: 70 },
    { month: "Nov", total: 510, resolved: 390, pending: 120 },
    { month: "Dec", total: 460, resolved: 380, pending: 80 },
    { month: "Jan", total: 590, resolved: 470, pending: 120 },
    { month: "Feb", total: 530, resolved: 430, pending: 100 },
];

const wardData = [
    { ward: "W03", cases: 312 },
    { ward: "W09", cases: 287 },
    { ward: "W06", cases: 245 },
    { ward: "W12", cases: 198 },
    { ward: "W01", cases: 176 },
    { ward: "W07", cases: 154 },
    { ward: "W04", cases: 143 },
    { ward: "W11", cases: 128 },
];

const catData = [
    { name: "Water", value: 28, color: "#B91C1C" },
    { name: "Roads", value: 24, color: "#9CA3AF" },
    { name: "Health", value: 18, color: "#F87171" },
    { name: "Education", value: 14, color: "#10B981" },
    { name: "Electricity", value: 11, color: "#FBBF24" },
    { name: "Other", value: 5, color: "#D1D5DB" },
];

const resolutionTrend = [
    { month: "Aug", rate: 83.9 }, { month: "Sep", rate: 80.9 }, { month: "Oct", rate: 81.6 },
    { month: "Nov", rate: 76.5 }, { month: "Dec", rate: 82.6 }, { month: "Jan", rate: 79.7 }, { month: "Feb", rate: 81.1 },
];

const kpis = [
    { label: "Avg Resolution Time", value: "4.2h", change: "-0.5h", positive: true, icon: Activity },
    { label: "Resolution Rate", value: "78.3%", change: "+5.1%", positive: true, icon: TrendingUp },
    { label: "Volume Growth", value: "+18.2%", change: "vs last quarter", positive: false, icon: TrendingDown },
    { label: "Top Performer", value: "Ward 07", change: "94% resolve rate", positive: true, icon: Award },
];

const timeframes = ["7D", "1M", "3M", "6M", "1Y"];

export default function Analytics() {
    const [tf, setTf] = useState("1M");
    const [exporting, setExporting] = useState(false);

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => setExporting(null as any), 2000);
    };

    return (
        <DashboardLayout 
            title="Analytics" 
            subtitle="Deep dive into governance performance metrics"
            bgImage="/images/network_bg.png"
        >
            <div className="space-y-6">
                {/* KPI bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map(k => (
                        <div key={k.label} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-[40px] pointer-events-none group-hover:bg-red-500/10 transition-all duration-700" />
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div className="p-3 rounded-2xl bg-gray-50 group-hover:bg-red-50 transition-colors">
                                    <k.icon className="w-5 h-5 text-gray-400 group-hover:text-[#B91C1C] transition-colors" />
                                </div>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${k.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"} uppercase tracking-tight`}>
                                    {k.change}
                                </span>
                            </div>
                            <p className="text-3xl font-black text-gray-900 leading-none mb-2 relative z-10">{k.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1 relative z-10">{k.label}</p>
                        </div>
                    ))}
                </div>

                {/* Time selector + export */}
                <div className="flex items-center justify-between">
                    <div className="flex bg-white border border-gray-100 p-1.5 rounded-2xl gap-1 shadow-sm">
                        {timeframes.map(t => (
                            <button
                                key={t}
                                onClick={() => setTf(t)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tf === t ? "bg-[#B91C1C] text-white shadow-lg shadow-red-900/20" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleExport} className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-gray-900 hover:bg-gray-50 transition-all shadow-sm active:scale-95 uppercase tracking-widest">
                        {exporting ? <Activity className="w-4 h-4 animate-spin text-[#B91C1C]" /> : <Download className="w-4 h-4 text-[#B91C1C]" />}
                        {exporting ? "Simulating..." : "Download Ledger"}
                    </button>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Area Chart */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
                                Strategic Signal Trends
                            </h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94A3B8' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                                        itemStyle={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: '#B91C1C' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: 20 }} />
                                    <Area type="monotone" dataKey="total" stroke="#B91C1C" strokeWidth={4} fill="url(#totalGrad)" name="Total Signals" />
                                    <Area type="monotone" dataKey="resolved" stroke="#111827" strokeWidth={4} fill="transparent" name="Resolved" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut */}
                    <div className="bg-[#111827] rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] pointer-events-none" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-8 relative z-10">Issue Distribution</h3>
                        <div className="h-44 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={catData} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                                        {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: 16, border: 'none', backgroundColor: '#1F2937', color: '#fff', fontSize: 10, fontWeight: 900 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-white">2.8k</span>
                                <span className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">Units</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-8 relative z-10">
                            {catData.slice(0, 4).map(c => (
                                <div key={c.name} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-lg" style={{ background: c.color, boxShadow: `0 0 10px ${c.color}40` }} />
                                    <span className="text-[9px] text-white/60 font-black uppercase tracking-tight">{c.name}</span>
                                    <span className="text-[9px] text-white font-black ml-auto">{c.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            Ward-wise Volume
                        </h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={wardData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.4} />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                    <YAxis type="category" dataKey="ward" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} width={30} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 10, fontWeight: 900 }} />
                                    <Bar dataKey="cases" fill="#374151" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Resolution Rate trend */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-5 text-sm flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            Resolution Rate Trend
                        </h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={resolutionTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.4} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                    <YAxis domain={[70, 90]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 10, fontWeight: 900 }} />
                                    <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
