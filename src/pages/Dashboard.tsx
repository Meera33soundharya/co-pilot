import DashboardLayout from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
    MessageSquare, Activity, ChevronRight, Zap,
    Brain, Sparkles, Loader2, Shield, Eye, X, MapPin, User,
    TrendingUp, TrendingDown, Award, Bell, Megaphone, Mic, FileText, BarChart2
} from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
    const { complaints, currentUser, notifications, announcements = [] } = useComplaints();
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    const [viewGrievance, setViewGrievance] = useState<any>(null);

    const isAdmin = currentUser?.role === "admin";
    
    // Live stats
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;
    const pending = complaints.filter(c => c.status !== "Resolved" && c.status !== "Closed").length;
    // Mocking active citizens
    const activeCitizens = 1240;
    
    const todaysAnnouncements = announcements.filter(a => {
        const today = new Date().toDateString();
        const aDate = new Date(a.timestamp).toDateString();
        return today === aDate;
    }).length;
    
    const emergencyAlerts = announcements.filter(a => a.type === "Alert").length;

    // Chart Data Mock
    const trendData = [
        { day: 'Mon', complaints: 12 },
        { day: 'Tue', complaints: 19 },
        { day: 'Wed', complaints: 15 },
        { day: 'Thu', complaints: 25 },
        { day: 'Fri', complaints: 22 },
        { day: 'Sat', complaints: 10 },
        { day: 'Sun', complaints: 8 },
    ];

    const categoryData = useMemo(() => {
        const counts = complaints.reduce((acc: any, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
    }, [complaints]);
    
    const COLORS = ['#B91C1C', '#D97706', '#059669', '#2563EB', '#7C3AED', '#DB2777'];

    return (
        <DashboardLayout title={t('page.dashboard', 'Dashboard')} subtitle={t('page.dashboard.subtitle.admin', 'Live overview — all complaints')}>
            <div className="space-y-8 pb-10 relative">
                
                {/* ── KPI STATS ROW ─────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {[
                        { label: 'Total Complaints', value: total, icon: Activity, color: 'text-gray-900' },
                        { label: 'Pending Complaints', value: pending, icon: TrendingUp, color: 'text-amber-600' },
                        { label: 'Resolved Complaints', value: resolved, icon: TrendingDown, color: 'text-emerald-600' },
                        { label: 'Active Citizens', value: activeCitizens, icon: User, color: 'text-blue-600' },
                        { label: "Today's Announcements", value: todaysAnnouncements, icon: Megaphone, color: 'text-purple-600' },
                        { label: 'Emergency Alerts', value: emergencyAlerts, icon: Bell, color: 'text-red-600' },
                    ].map((card, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <card.icon className={`w-8 h-8 mb-3 ${card.color}`} />
                            <p className="text-3xl font-black text-gray-900">{card.value}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── COMMAND CONSOLE: QUICK ACTIONS ─────────────── */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-4">
                        {[
                            { label: 'New Complaint', icon: MessageSquare, link: "/citizen" },
                            { label: 'Create Announcement', icon: Megaphone, link: "/announcements" },
                            { label: 'Generate Voice Announcement', icon: Mic, link: "/voice-ai" },
                            { label: 'Upload Document', icon: FileText, link: "/documents" },
                            { label: 'Generate Report', icon: BarChart2, link: "/reports" },
                        ].map((btn, i) => (
                            <button key={i} onClick={() => navigate(btn.link)} className="flex items-center gap-3 px-6 py-4 bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors rounded-2xl border border-gray-100 font-bold text-gray-700">
                                <btn.icon className="w-5 h-5" />
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── CHARTS ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-96 flex flex-col">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Complaint Trend</h3>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#B91C1C" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 700}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 700}} dx={-10} />
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="complaints" stroke="#B91C1C" strokeWidth={3} fillOpacity={1} fill="url(#colorComplaints)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-96 flex flex-col">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Complaint Categories</h3>
                        <div className="flex-1 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData.length ? categoryData : [{name: 'No Data', value: 1}]}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-y-0 right-0 w-1/3 flex flex-col justify-center gap-3">
                                {categoryData.map((entry, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}} />
                                        <span className="text-xs font-bold text-gray-600 truncate">{entry.name} ({entry.value})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── LISTS ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Complaints */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Recent Complaints</h3>
                            <button onClick={() => navigate("/grievances")} className="text-xs font-bold text-red-600 uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {complaints.slice(0, 5).map(c => (
                                <div key={c.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{c.issue}</p>
                                        <p className="text-xs text-gray-500 font-medium">{c.citizen} • {c.ward}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${
                                        c.status === 'New' ? 'bg-red-50 text-red-600' :
                                        c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>{c.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Announcements */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Recent Announcements</h3>
                            <button onClick={() => navigate("/announcements")} className="text-xs font-bold text-red-600 uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {announcements.slice(0, 5).map((a, i) => (
                                <div key={i} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                            a.type === 'Alert' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>{a.type}</span>
                                        <span className="text-xs text-gray-400 font-bold">{new Date(a.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="font-bold text-gray-900 line-clamp-1">{a.title.en}</p>
                                </div>
                            ))}
                            {announcements.length === 0 && (
                                <div className="p-8 text-center text-gray-400 font-bold text-sm">No recent announcements</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
