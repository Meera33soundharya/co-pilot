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
    { name: "Water", value: 28, color: "#3B82F6" },
    { name: "Roads", value: 24, color: "#D4AF37" },
    { name: "Health", value: 18, color: "#EF4444" },
    { name: "Education", value: 14, color: "#10B981" },
    { name: "Electricity", value: 11, color: "#8B5CF6" },
    { name: "Other", value: 5, color: "#94A3B8" },
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

    return (
        <DashboardLayout title="Analytics" subtitle="Deep dive into governance performance metrics">
            <div className="space-y-6">
                {/* KPI bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpis.map(k => (
                        <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
                                    <k.icon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${k.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                    {k.change}
                                </span>
                            </div>
                            <p className="text-2xl font-black text-gray-900">{k.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{k.label}</p>
                        </div>
                    ))}
                </div>

                {/* Time selector + export */}
                <div className="flex items-center justify-between">
                    <div className="flex bg-white border border-gray-100 p-1 rounded-xl gap-1 shadow-sm">
                        {timeframes.map(t => (
                            <button
                                key={t}
                                onClick={() => setTf(t)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${tf === t ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-gray-400 hover:text-gray-700"}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => alert('Exporting analytics report as PDF...')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        <Download className="w-3.5 h-3.5" />
                        Export Report
                    </button>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Area Chart */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2">
                            <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
                            Monthly Complaint Trends
                        </h3>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.4} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                                    <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} fill="url(#totalGrad)" name="Total" />
                                    <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} fill="url(#resolvedGrad)" name="Resolved" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut */}
                    <div className="bg-[#0B1221] rounded-2xl p-6 shadow-2xl text-white">
                        <h3 className="font-black mb-5 text-sm">Issue Categories</h3>
                        <div className="h-44 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={catData} innerRadius={50} outerRadius={72} paddingAngle={6} dataKey="value" stroke="none">
                                        {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black">2.8k</span>
                                <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">cases</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {catData.map(c => (
                                <div key={c.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                                    <span className="text-[10px] text-white/60 font-bold">{c.name}</span>
                                    <span className="text-[10px] text-white/30 font-black ml-auto">{c.value}%</span>
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
                                    <Tooltip />
                                    <Bar dataKey="cases" fill="#4F46E5" radius={[0, 8, 8, 0]} />
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
                                    <Tooltip />
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
