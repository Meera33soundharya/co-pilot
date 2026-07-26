import { DashboardLayout } from "@/components/DashboardLayout";
import { Brain, Sparkles, Zap, Cpu, Network, Activity, Layers, ShieldCheck } from "lucide-react";

export default function BrainSpark() {
    return (
        <DashboardLayout title="BrainSpark™ Intelligence" subtitle="Deep-layer neural analysis & predictive governance models">
            <div className="space-y-8 pb-12">
                {/* Hero Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Neural Nodes Active", value: "1,248", icon: Network, color: "text-[#B91C1C]", bg: "bg-red-50/50" },
                        { label: "Inference Speed", value: "12ms", icon: Zap, color: "text-amber-600", bg: "bg-amber-50/50" },
                        { label: "Data Integrity", value: "99.99%", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50/50" },
                        { label: "Active Models", value: "42", icon: Brain, color: "text-gray-900", bg: "bg-gray-50/50" },
                    ].map(s => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${s.bg} group-hover:scale-110 transition-transform`}>
                                    <s.icon className={`w-5 h-5 ${s.color}`} />
                                </div>
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                            <p className="text-3xl font-black text-gray-900 tracking-tight">{s.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left: Deep Learning Viz */}
                    <div className="xl:col-span-2 bg-[#0B1221] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-white">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-600/10 blur-[80px] pointer-events-none" />

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#B91C1C] rounded-xl flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Neural Layer Activation</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Real-time model processing visualization</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black uppercase">
                                    <Activity className="w-3 h-3 text-emerald-400" /> High Performance
                                </div>
                            </div>
                        </div>

                        {/* Visualization placeholder */}
                        <div className="aspect-[21/9] bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col items-center justify-center p-8">
                            <Sparkles className="w-12 h-12 text-[#B91C1C]/20 mb-4 animate-pulse" />
                            <div className="flex gap-1.5 items-end h-32">
                                {[40, 70, 45, 90, 65, 80, 50, 95, 75, 60, 85, 40, 70, 55, 90].map((h, i) => (
                                    <div
                                        key={i}
                                        className="w-4 bg-gradient-to-t from-[#B91C1C] to-[#E5E7EB] rounded-t-sm animate-bounce"
                                        style={{ height: `${h}%`, animationDelay: `${i * 100}ms`, animationDuration: '2s' }}
                                    />
                                ))}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mt-8">Processing Governance Streams</p>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mt-8">
                            {[
                                { label: "Semantic Analysis", value: "Enabled" },
                                { label: "Pattern Recognition", value: "Active" },
                                { label: "Trend Prediction", value: "Running" },
                            ].map(x => (
                                <div key={x.label} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{x.label}</p>
                                    <p className="text-sm font-black text-[#B91C1C]">{x.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: AI Insights Panel */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm h-full">
                            <h3 className="text-gray-900 font-black text-lg mb-6 flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-amber-500" />
                                Intelligence Alerts
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { title: "Grievance Spike", body: "Ward 03 water complaints increased by 140% in last 2h. Neural pattern matched with 'Pipe Aging' cluster.", time: "12m ago", color: "bg-rose-50 border-rose-100", iconColor: "text-red-700" },
                                    { title: "Sentiment Shift", body: "Positive sentiment in Ward 12 up by 12% following road repairs. Efficiency correlation: Strong.", time: "45m ago", color: "bg-emerald-50 border-emerald-100", iconColor: "text-emerald-500" },
                                    { title: "Resource Optimization", body: "AI recommends reallocating 3 sanitation vehicles from Center to North zone to maintain SLA.", time: "1h ago", color: "bg-red-50 border-red-50", iconColor: "text-red-700" },
                                ].map((alert, i) => (
                                    <div key={i} className={`p-5 rounded-2xl border ${alert.color} group cursor-pointer hover:scale-[1.02] transition-all`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`text-xs font-black uppercase tracking-widest ${alert.iconColor}`}>{alert.title}</h4>
                                            <span className="text-[9px] font-black text-gray-400">{alert.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-700 leading-relaxed">{alert.body}</p>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">
                                Launch Full System Audit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Cluster Tech */}
                <div className="bg-gradient-to-r from-gray-900 to-black rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Cpu className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Neural Core Online</h3>
                            <p className="text-white/60 text-sm">Cluster 09-Alpha provides dedicated compute for predicted infrastructure risks.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-xs font-black uppercase">Model Confidence</p>
                            <p className="text-2xl font-black text-red-500">98.2%</p>
                        </div>
                        <div className="w-px h-10 bg-white/20 mx-4 hidden md:block" />
                        <button className="px-8 py-4 bg-white text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-xl">
                            Optimization Guide
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
