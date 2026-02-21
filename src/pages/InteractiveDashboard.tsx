import { DashboardLayout } from "@/components/DashboardLayout";
import {
    Target, Activity, Users, Map,
    MousePointer2, Layers, Filter, Maximize2,
    ChevronRight, Zap, ShieldCheck
} from "lucide-react";
import { useState } from "react";

export default function InteractiveDashboard() {
    const [activeZone, setActiveZone] = useState("Central Zone");

    return (
        <DashboardLayout title="War Room: Interactive Grid" subtitle="Direct tactical control & multi-layer governance intelligence">
            <div className="space-y-6 pb-12">

                {/* Tactical Header */}
                <div className="bg-[#0B1221] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px]" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-600/20 animate-pulse">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">{activeZone} Status</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        Integrity: 94%
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">12 Live Agents</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            {["Central Zone", "North Grid", "South Sector", "West Hub"].map(zone => (
                                <button
                                    key={zone}
                                    onClick={() => setActiveZone(zone)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeZone === zone
                                        ? "bg-white text-gray-900 shadow-xl"
                                        : "bg-white/5 text-white/40 hover:bg-white/10"
                                        }`}
                                >
                                    {zone}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Interactive Map / Controls Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                    {/* The "Map" Area */}
                    <div className="xl:col-span-3 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm min-h-[500px] relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black text-gray-900 flex items-center gap-3">
                                <Map className="w-5 h-5 text-blue-500" />
                                Intelligence Heatmap
                            </h3>
                            <div className="flex items-center gap-3">
                                <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
                                    <Layers className="w-4 h-4" />
                                </button>
                                <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
                                    <Filter className="w-4 h-4" />
                                </button>
                                <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Visual Mock of a Heatmap/Grid */}
                        <div className="absolute inset-x-8 bottom-32 top-24 border border-gray-100 rounded-3xl bg-gray-50/50 flex items-center justify-center group cursor-crosshair">
                            <div className="grid grid-cols-6 gap-2 p-8">
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-12 h-12 rounded-xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center text-[10px] font-black ${i === 7 ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse" :
                                            i % 5 === 0 ? "bg-emerald-500/20 text-emerald-600" :
                                                "bg-white border border-gray-200 text-gray-300"
                                            }`}
                                    >
                                        {i === 7 ? "!" : i + 1}
                                    </div>
                                ))}
                            </div>
                            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MousePointer2 className="w-3 h-3 text-blue-500" />
                                <span className="text-[9px] font-black uppercase text-gray-900 tracking-widest">Select Node</span>
                            </div>
                        </div>

                        {/* Bottom Info Bar */}
                        <div className="absolute inset-x-8 bottom-8 h-20 bg-gray-900 rounded-3xl p-5 flex items-center justify-between text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Node 08 Detection</p>
                                    <p className="text-sm font-black italic text-rose-400">Conflict Detected: SLA Breach in Ward 03</p>
                                </div>
                            </div>
                            <button className="px-6 py-2.5 bg-white text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2">
                                Investigate <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Active Stats */}
                    <div className="space-y-6">
                        {[
                            { label: "Live Residents", value: "248,391", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                            { label: "Active Patrols", value: "12 Unit", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
                            { label: "System Load", value: "42%", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:translate-x-1 transition-all group">
                                <div className={`p-4 rounded-2xl ${stat.bg} mb-4 inline-block group-hover:rotate-6 transition-transform`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-2">{stat.label}</p>
                            </div>
                        ))}

                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-600/20">
                            <h3 className="font-black text-sm mb-4">Tactical Summary</h3>
                            <p className="text-xs text-white/60 leading-relaxed mb-6">Currently monitoring 4 sectors with active AI predictive modeling. All units are synced to the central grid.</p>
                            <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Open Full Console
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
