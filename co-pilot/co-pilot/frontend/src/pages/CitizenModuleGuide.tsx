import { DashboardLayout } from "@/components/DashboardLayout";
import { 
    BookOpen, Shield, Zap, 
    MessageSquare, CheckCircle2, 
    Clock, Smartphone, Globe,
    ArrowRight, Search
} from "lucide-react";

export default function CitizenModuleGuide() {
    return (
        <DashboardLayout 
            title="Citizen Module Guide" 
            subtitle="Official documentation for using the GovPilot Citizen Portal"
        >
            <div className="max-w-5xl mx-auto space-y-12 pb-20">
                
                {/* ── Hero Section ────────────────────────────────────── */}
                <div className="bg-gradient-to-br from-[#0B1221] to-[#0f1f3d] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 blur-[120px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                            <BookOpen className="w-12 h-12 text-red-500" />
                        </div>
                        <div className="space-y-4 text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tight uppercase">Platform Standard v2.0</h2>
                            <p className="text-white/60 text-lg font-medium max-w-2xl leading-relaxed">
                                This document serves as the primary instructional manual for district citizens to interact with the GovPilot AI Governance framework.
                            </p>
                            <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start pt-4">
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40"><Shield className="w-3.5 h-3.5" /> SECURE ACCESS</span>
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40"><Zap className="w-3.5 h-3.5" /> AI-POWERED</span>
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40"><Smartphone className="w-3.5 h-3.5" /> MOBILE ENABLED</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Instructional Blocks ────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Step 1: Reporting */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                            <MessageSquare className="w-6 h-6 text-red-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">1. Raising a Grievance</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 italic">
                            "Transparency starts with a single report. Use the live submission portal to flag issues in your ward."
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Select a category (Roads, Water, Waste, etc.)",
                                "Attach a high-resolution photo of the issue",
                                "Provide a detailed description for AI processing",
                                "Confirm your precise ward and locality"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i+1}</div>
                                    <span className="text-xs font-bold text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Step 2: AI Triage */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                            <Search className="w-6 h-6 text-blue-600 group-hover:text-white" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">2. Neural Triage Engine</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 italic">
                            "Every report is analyzed by GovPilot's core intelligence to ensure rapid, departmental routing."
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#B91C1C] mb-2">Automated Categorization</p>
                                <p className="text-xs text-gray-600 font-medium">AI identifies the department responsible (e.g., Water Supply and Drainage) based on your text and data.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#B91C1C] mb-2">Priority Ranking</p>
                                <p className="text-xs text-gray-600 font-medium">Critical safety issues are upgraded to 'High' priority for immediate Field Officer intervention.</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── Live Tracking Guide ─────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-[3rem] p-12 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="p-4 bg-gray-900 rounded-3xl">
                            <Clock className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase">Live Tracking Center</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Real-time resolution updates Protocol</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: "Submitted", desc: "Report received & ID generated", icon: Globe, status: "Done" },
                            { label: "Assigned", desc: "Departmental unit dispatched", icon: Shield, status: "Active" },
                            { label: "In Progress", desc: "Field work actively underway", icon: Hammer, status: "Wait" },
                            { label: "Resolved", desc: "Proof uploaded & case verified", icon: CheckCircle2, status: "Final" }
                        ].map((step, i) => (
                            <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 relative group">
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-[#B91C1C] group-hover:text-white transition-all">
                                    0{i+1}
                                </div>
                                <step.icon className="w-6 h-6 text-[#B91C1C] mb-4" />
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2">{step.label}</h4>
                                <p className="text-[10px] text-gray-500 font-bold leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-12 p-8 bg-red-50 rounded-[2rem] border border-red-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-600 rounded-2xl"><Shield className="w-5 h-5 text-white" /></div>
                            <div>
                                <p className="text-sm font-black text-red-900">Need immediate assistance?</p>
                                <p className="text-xs font-bold text-red-700/60">Contact the District Liaison Office at 1-800-GOV-PILOT</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                            Open Portal <ArrowRight className="w-4 h-4 ml-2 inline" />
                        </button>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

function Hammer(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0-.83-.83-.83-2.17 0-3L12 9" />
      <path d="M17.64 15 22 10.64" />
      <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.35 5.35a2.14 2.14 0 0 1-.64 1.53L3.5 15.1" />
      <path d="M18 5.69a19.05 19.05 0 0 0-6 6" />
    </svg>
  );
}
