import { DashboardLayout } from "@/components/DashboardLayout";
import {
    Brain, ShieldCheck, Cpu,
    Network, CheckCircle2, ChevronRight,
    Layers, Zap, Info, MessageSquare, AlertCircle
} from "lucide-react";
import { useState } from "react";

export default function ExplainableAI() {
    const [selectedStep, setSelectedStep] = useState(0);

    const reasoningSteps = [
        {
            title: "Data Ingestion",
            icon: Network,
            desc: "The system scanned 12,482 citizen reports, 45 media outlets, and 12 ward-level data streams.",
            details: "Processing unstructured text via BERT-based neural models to identify intent and gravity."
        },
        {
            title: "Pattern Recognition",
            icon: Layers,
            desc: "Identified a cluster of anomalies related to 'Inconsistent Water Supply' specifically in Ward 03.",
            details: "Spatial clustering (DBSCAN) revealed that 92% of complaints are localized within a 500-meter radius."
        },
        {
            title: "Policy Alignment",
            icon: ShieldCheck,
            desc: "Consulted current 'Public Utilities Protocol' (Section 4.2) regarding emergency resolution SLAs.",
            details: "Rule-based validation confirms this constitutes a Tier-1 status violation."
        },
        {
            title: "Impact Projection",
            icon: Zap,
            desc: "Simulated a resolution window of 48 hours vs. 72 hours on public sentiment.",
            details: "Expected +14% trust boost if resolved within the 'Golden Hour' (first 12h of detected spike)."
        },
        {
            title: "Final Recommendation",
            icon: Brain,
            desc: "Proposed immediate reallocation of 4 repair units and 2 social communication officers.",
            details: "Confidence score: 98.2%. Recommendation optimized for cost-efficiency and citizen satisfaction."
        }
    ];

    return (
        <DashboardLayout 
            title="Explainable AI Dashboard" 
            subtitle="Unlocking the 'Black Box' — Step-by-step reasoning for every AI recommendation"
            bgImage="/images/explainable_bg.png"
        >
            <div className="space-y-8 pb-12">

                {/* Active Analysis Banner */}
                <div className="bg-gradient-to-r from-red-600 to-gray-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md animate-pulse">
                            <Network className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Active Chain-of-Thought</h3>
                            <p className="text-white/60 text-sm">Reviewing recommendation for: <span className="text-white font-black underline underline-offset-4 decoration-red-400">Ward 03 Resource Reallocation</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-xs font-black uppercase">Internal Audit ID</p>
                            <p className="font-mono text-sm opacity-60">XAI-992-ALPHA</p>
                        </div>
                        <div className="w-px h-10 bg-white/20 mx-4 hidden md:block" />
                        <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            Verified Transparent
                        </span>
                    </div>
                </div>

                {/* Reasoning Workflow */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        {reasoningSteps.map((step, idx) => (
                            <button
                                key={step.title}
                                onClick={() => setSelectedStep(idx)}
                                className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all group flex items-center gap-5 ${selectedStep === idx
                                        ? "bg-white border-[#B91C1C] shadow-xl shadow-red-500/10 scale-[1.02]"
                                        : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-200"
                                    }`}
                            >
                                <div className={`p-4 rounded-2xl shrink-0 transition-transform ${selectedStep === idx ? "bg-[#B91C1C] text-white scale-110" : "bg-white text-gray-400 group-hover:text-red-600"
                                    }`}>
                                    <step.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedStep === idx ? "text-red-600" : "text-gray-400"
                                        }`}>Step 0{idx + 1}</h4>
                                    <p className="text-base font-black text-gray-900 truncate">{step.title}</p>
                                </div>
                                <ChevronRight className={`w-5 h-5 transition-transform ${selectedStep === idx ? "text-red-500 translate-x-1" : "text-gray-200"
                                    }`} />
                            </button>
                        ))}
                    </div>

                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm h-full flex flex-col">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-red-50 rounded-2xl">
                                        {(() => {
                                            const StepIcon = reasoningSteps[selectedStep].icon;
                                            return <StepIcon className="w-8 h-8 text-[#B91C1C]" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">{reasoningSteps[selectedStep].title}</h3>
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Deep Analysis Node</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                                    <Cpu className="w-3.5 h-3.5" /> Latency: 24ms
                                </div>
                            </div>

                            <div className="flex-1 space-y-8">
                                <div className="p-8 bg-red-50/50 rounded-3xl border border-red-100 relative">
                                    <Info className="absolute top-6 right-6 w-5 h-5 text-red-300" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#B91C1C] mb-4">Finding Summary</h4>
                                    <p className="text-lg font-bold text-gray-700 leading-relaxed">
                                        {reasoningSteps[selectedStep].desc}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-gray-900 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-gray-400" />
                                            Technical Justification
                                        </h4>
                                        <p className="text-sm text-gray-500 leading-relaxed italic">
                                            "{reasoningSteps[selectedStep].details}"
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Confidence Intervals</h4>
                                        <div className="space-y-3">
                                            <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                                                <div className="h-full bg-red-600 rounded-full" style={{ width: '92%' }} />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black text-gray-500">
                                                <span>DATA QUALITY</span>
                                                <span className="text-red-700">92%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-100">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-black text-gray-500">
                                            JD
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                                        +4
                                    </div>
                                </div>
                                <button className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-3">
                                    Generate Official Audit PDF <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Transparency Compliance</p>
                            <p className="text-lg font-black text-gray-900">Tier 1 Elite</p>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-500">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Bias Monitoring</p>
                            <p className="text-lg font-black text-gray-900">0.02% Anomaly</p>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-2xl text-red-500">
                            <Network className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Decisions Audited</p>
                            <p className="text-lg font-black text-gray-900">2,841 Resolved</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
