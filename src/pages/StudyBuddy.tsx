import { DashboardLayout } from "@/components/DashboardLayout";
import { BookOpen, GraduationCap, Search, Sparkles, Star, History, FileText, ArrowRight, PlayCircle, Bookmark, AlertCircle, Database, Network } from "lucide-react";
import { useState } from "react";

export default function StudyBuddy() {
    const [search, setSearch] = useState("");

    return (
        <DashboardLayout title="AI Study Buddy" subtitle="Master complex governance frameworks with interactive learning">
            <div className="space-y-8 pb-12">
                {/* Search / Ask section */}
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden text-center max-w-4xl mx-auto">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/5 blur-[50px]" />

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100">
                        <Sparkles className="w-3 h-3" /> Powered by Gov-Large v4
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">What shall we master today?</h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
                        I've analyzed over 1,200 local government policies and 45 active projects.
                        Ask me any question or choose a module to begin.
                    </p>

                    <div className="relative group max-w-2xl mx-auto">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Ask about water policy, road safety laws, or ward maps..."
                            className="w-full pl-14 pr-32 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-gray-700"
                        />
                        <button className="absolute right-3 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                            Search Hub
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                        {["Water Act 2024", "Ward 03 Boundaries", "Budget Allocation Plan", "SLA Requirements"].map(tag => (
                            <button key={tag} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Core Learning Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: "Governance Basics", count: "14 Modules", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50", desc: "Understanding the organizational structure and decision-making flow." },
                        { title: "Policy Deep-Dive", count: "8 Handbooks", icon: FileText, color: "text-violet-500", bg: "bg-violet-50", desc: "Technical analysis of current laws and municipal guidelines." },
                        { title: "Citizen Interaction", count: "5 Simulations", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50", desc: "Best practices for grievance resolution and communication." },
                    ].map(card => (
                        <div key={card.title} className="bg-white border border-gray-100 rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl ${card.bg}`}>
                                    <card.icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{card.count}</span>
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-3">{card.title}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed mb-6">{card.desc}</p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 group-hover:gap-4 transition-all">
                                Start Learning <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Your Progress */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-gray-900 flex items-center gap-3">
                                <History className="w-5 h-5 text-gray-400" />
                                Resume Learning
                            </h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">View History</button>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: "Unit 3: Crisis Management Protocols", progress: 75, lastActive: "Yesterday", icon: AlertCircle },
                                { title: "Policy: Ward 03 Resource Usage", progress: 40, lastActive: "2 days ago", icon: Database },
                                { title: "Overview: Digital Governance Grid", progress: 95, lastActive: "3 days ago", icon: Network },
                            ].map((unit, i) => (
                                <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-gray-200 transition-colors">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                                        <PlayCircle className="w-7 h-7 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-sm font-black text-gray-900 truncate">{unit.title}</h4>
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{unit.lastActive}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${unit.progress}%` }} />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-600">{unit.progress}%</span>
                                        </div>
                                    </div>
                                    <button className="px-5 py-2.5 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Resume</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0B1221] rounded-[2.5rem] p-8 text-white">
                        <h3 className="font-black mb-6">Expertise Level</h3>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-white/10 flex items-center justify-center">
                                <span className="text-xl font-black">L4</span>
                            </div>
                            <div>
                                <p className="font-black">Senior Analyst</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Next rank: Governance Strategist</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Star className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Learning XP</p>
                                    <p className="text-sm font-black text-white">12,840 XP</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                                <div className="p-2 bg-cyan-500/20 rounded-lg">
                                    <Bookmark className="w-4 h-4 text-cyan-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Policies Masters</p>
                                    <p className="text-sm font-black text-white">32 Policies</p>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                            Download Certificate
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}


