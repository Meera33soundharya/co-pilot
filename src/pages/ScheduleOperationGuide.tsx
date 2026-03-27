import { DashboardLayout } from "@/components/DashboardLayout";
import { 
    Clock, MapPin, Shield, Zap, 
    Plus, CheckCircle2, AlertCircle, 
    ArrowRight, Smartphone,
    LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ScheduleOperationGuide() {
    const navigate = useNavigate();

    return (
        <DashboardLayout 
            title="Mission Protocol Guide" 
            subtitle="Operational standard for coordinating district field units"
        >
            <div className="max-w-6xl mx-auto space-y-16 pb-20">
                
                {/* ── MISSION COMMAND HERO ────────────────────────────── */}
                <div className="bg-[#0B1221] rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl border border-white/5">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#B91C1C]/10 blur-[150px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                        <div className="w-28 h-28 rounded-[2.5rem] bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-2xl">
                            <LayoutDashboard className="w-14 h-14 text-red-500" />
                        </div>
                        <div className="space-y-6 text-center md:text-left flex-1">
                            <div className="inline-flex items-center gap-3 px-5 py-2 bg-red-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-lg shadow-red-900/40">
                                Official Strategic Directive v3.2
                            </div>
                            <h2 className="text-5xl font-black tracking-tight italic uppercase leading-none">Command Center Protocol</h2>
                            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-2xl">
                                Detailed instructional framework for district administrators to synchronize field operations, 
                                manage telemetry grids, and authorize unit deployments via the GovPilot Mission Core.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── THE 4-PHASE CYCLE ──────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* Phase 01: Coordination */}
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-12 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-16 bg-red-50 rounded-[1.5rem] flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-700 border border-red-100/50">
                                <Plus className="w-8 h-8 text-[#B91C1C] group-hover:text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase 01</p>
                                <h3 className="text-2xl font-black text-gray-900 uppercase italic leading-none">Mission Coordination</h3>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 font-bold mb-8 leading-relaxed">
                            "Every mission begins with precise synchronization. Define the tactical parameters to ensure successful site intervention."
                        </p>
                        <div className="space-y-4 mt-auto">
                            {[
                                { title: "Define Sector", desc: "Select the specific Election Ward and locality for terminal mapping." },
                                { title: "Personnel Sync", desc: "Assign active Field Officers based on current cluster availability." },
                                { title: "Time Sequence", desc: "Set the operational window for mission start and target resolution." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[11px] font-black text-gray-900 shadow-sm shrink-0 uppercase">{i+1}</div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-gray-900 uppercase italic">{item.title}</p>
                                        <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phase 02: Intelligence Scanning */}
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-12 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-16 bg-amber-50 rounded-[1.5rem] flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-700 border border-amber-100/50">
                                <Shield className="w-8 h-8 text-amber-600 group-hover:text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase 02</p>
                                <h3 className="text-2xl font-black text-gray-900 uppercase italic leading-none">Conflict Triage</h3>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 font-bold mb-8 leading-relaxed">
                            "The GovPilot Engine automatically scans for operational friction to prevent overlapping or high-risk deployments."
                        </p>
                        <div className="grid grid-cols-1 gap-4 mt-auto">
                            <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 flex items-center gap-5">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                                <div>
                                    <p className="text-xs font-black text-red-900 uppercase tracking-tighter italic">Conflict Detection</p>
                                    <p className="text-[10px] text-red-700 font-bold leading-relaxed">Identifies overlapping missions in the same ward or personnel shortages during peak hours.</p>
                                </div>
                            </div>
                            <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-5">
                                <Zap className="w-10 h-10 text-emerald-600" />
                                <div>
                                    <p className="text-xs font-black text-emerald-900 uppercase tracking-tighter italic">SLA Authorization</p>
                                    <p className="text-[10px] text-emerald-700 font-bold leading-relaxed">Auto-verifies that the mission duration meets the district governance response standards.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── LIVE TELEMETRY GUIDE ───────────────────────────── */}
                <div className="bg-gray-900 rounded-[4rem] p-20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[150px]" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl">
                            <Clock className="w-12 h-12 text-white" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Phase 03: Telemetry Grid</h3>
                            <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">Real-time Operational Tracking Flow</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        {[
                            { step: "01", label: "Sync Ready", desc: "Mission initialized but awaiting final authorization hub.", icon: Smartphone, color: "text-blue-400" },
                            { step: "02", label: "Deployed", desc: "Terminal instructions received by field unit sensors.", icon: LayoutDashboard, color: "text-amber-400" },
                            { step: "03", label: "On Site", desc: "Active site intervention documented via photo-proof.", icon: MapPin, color: "text-emerald-400" },
                            { step: "04", label: "Resolved", desc: "Final integrity verification logged to Governance Core.", icon: CheckCircle2, color: "text-white" }
                        ].map((s, i) => (
                            <div key={i} className="space-y-6 relative group">
                                <div className="text-6xl font-black text-white/5 italic tracking-tighter uppercase leading-none">{s.step}</div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <s.icon className={`w-5 h-5 ${s.color}`} />
                                        <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{s.label}</h4>
                                    </div>
                                    <p className="text-[10px] text-white/40 font-bold leading-relaxed">{s.desc}</p>
                                </div>
                                {i < 3 && <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-px h-12 bg-white/5" />}
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl">
                                <Smartphone className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase text-white/30 tracking-[0.3em] italic">Authorized Hub</p>
                                <p className="text-lg font-black text-white uppercase tracking-tight italic">Mission Core v3.2 Protocol</p>
                            </div>
                        </div>
                        <button onClick={() => navigate("/schedule")} className="px-12 py-6 bg-red-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-gray-900 transition-all shadow-2xl shadow-red-950/20 active:scale-95 group">
                            Return to Command Hub <ArrowRight className="w-4 h-4 ml-3 inline group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
