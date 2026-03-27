import { useNavigate } from "react-router-dom";
import { 
    User, Building2, 
    BrainCircuit, Sparkles, 
    ArrowRight, CheckCircle2, Zap, LayoutDashboard
} from "lucide-react";

export default function Landing() {
    const navigate = useNavigate();

    const portals = [
        {
            id: "citizen",
            title: "Citizen Portal",
            desc: "அம்மா, அப்பா... Everyone can file complaints easy-aa. Instant tracking included.",
            icon: User,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            count: "10k+ Citizens",
            link: "/submit-complaint"
        },
        {
            id: "officer",
            title: "Field Officer",
            desc: "Tier-1 problems priority-aa solve panna. Update site photos directly in portal.",
            icon: Building2,
            color: "text-blue-500",
            bg: "bg-blue-50",
            border: "border-blue-100",
            count: "124 Officers",
            link: "/field-portal"
        },
        {
            id: "admin",
            title: "Administrator",
            desc: "Predictive AI dashboards. District health score analysis 0–100 real-time.",
            icon: LayoutDashboard,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-100",
            count: "Admin Control",
            link: "/dashboard"
        }
    ];

    return (
        <div className="min-h-screen bg-[#F4F2EE] selection:bg-[#B91C1C]/20" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {/* Header */}
            <header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 z-[100] px-6 lg:px-20 flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B91C1C] to-[#7F1D1D] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">GovPilot</h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#B91C1C] mt-1 leading-none">District Governance AI</p>
                    </div>
                </div>

                {/* Live Ribbon (Hidden on small screens) */}
                <div className="hidden lg:flex items-center gap-4 bg-gray-50/50 px-5 py-2 rounded-2xl border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="overflow-hidden w-64">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap animate-marquee">
                            Ward 07: Water leak fixed • Ward 03: Streetlights repaired • New AI Cluster in Sector 4
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/login")} 
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
                        System Login
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-40 pb-20 px-6 lg:px-20 max-w-7xl mx-auto">
                <div className="text-center space-y-8 max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B91C1C]/5 border border-[#B91C1C]/10 text-[10px] font-bold uppercase tracking-widest text-[#B91C1C]">
                        <Sparkles className="w-3.5 h-3.5" /> Smarter Governance for a Better District
                    </div>
                    <h1 className="text-6xl lg:text-7xl font-black text-gray-900 leading-[1] tracking-tight">
                        One Platform.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B91C1C] via-[#D97706] to-[#B91C1C] bg-[length:200%_auto] animate-gradient">Total Accountability.</span>
                    </h1>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed">
                        GovPilot bridges the gap between citizens, officers, and admins using predictive AI 
                        to solve local problems before they become crises.
                    </p>
                    <div className="flex items-center justify-center gap-6 pt-4">
                        <div className="flex -space-x-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white bg-[#B91C1C] flex items-center justify-center text-[10px] font-black text-white">+5k</div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined by 5,000+ residents this month</p>
                    </div>
                </div>

                {/* Entry Points Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {portals.map((portal, idx) => (
                        <div key={portal.id} 
                            onClick={() => navigate(portal.link)}
                            style={{ animationDelay: `${idx * 150}ms` }}
                            className={`group aspect-[4/5] bg-white border border-gray-100 rounded-[3rem] p-10 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden animate-in fade-in zoom-in-95 duration-700`}
                        >
                            <div className={`absolute top-0 right-0 w-48 h-48 ${portal.id === 'admin' ? 'bg-red-500/5' : portal.id === 'officer' ? 'bg-blue-500/5' : 'bg-emerald-500/5'} blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-700`} />
                            
                            <div>
                                <div className={`w-16 h-16 rounded-3xl ${portal.bg} flex items-center justify-center mb-8 border ${portal.border} shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                                    <portal.icon className={`w-8 h-8 ${portal.color}`} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4">{portal.title}</h3>
                                <p className="text-sm font-medium text-gray-400 leading-relaxed mb-6 italic">
                                    {portal.desc}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">
                                        <Zap className="w-2.5 h-2.5 text-amber-500" /> AI-Enhanced
                                    </span>
                                    <span className="text-[10px] font-black uppercase text-gray-300">{portal.count}</span>
                                </div>
                                <button className="w-full py-4 bg-gray-900 group-hover:bg-[#B91C1C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2">
                                    Enter Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Features Section */}
                <div className="mt-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                Built for Transparency.<br />
                                Powered by <span className="text-[#B91C1C]">Explainable AI.</span>
                            </h2>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                District governance should not be a "lost in system" experience. 
                                GovPilot ensures every action has a reason and every voice has a trace.
                            </p>
                        </div>
                        <div className="space-y-6">
                            {[
                                { title: "XAI Transparency", desc: "Know EXACTLY why AI categorized your complaint." },
                                { title: "Predictive Health", desc: "Constituency scores based on resolution & urgency." },
                                { title: "Direct Hubs", desc: "No manual routing. Complaints go straight to Field units." }
                            ].map((feat, i) => (
                                <div key={i} className="flex gap-5">
                                    <div className="w-10 h-10 rounded-2xl bg-white shadow-xl shadow-gray-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 mb-1 uppercase tracking-tight">{feat.title}</p>
                                        <p className="text-xs font-medium text-gray-400">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-[#B91C1C] to-[#D97706] rounded-[4rem] blur-[100px] opacity-20 animate-pulse" />
                        <div className="relative bg-white p-4 rounded-[4rem] border border-gray-100 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                             <div className="text-center space-y-4">
                                <Sparkles className="w-16 h-16 text-[#B91C1C] mx-auto animate-bounce" />
                                <div className="space-y-1">
                                    <p className="text-3xl font-black text-gray-900">GovPilot</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Live Infrastructure</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="mt-32 pt-20 pb-10 border-t border-gray-100 bg-white/50 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">GovPilot District AI · Open Infrastructure</p>
                <div className="flex items-center justify-center gap-6">
                    {["API Documentation", "Transparency Report", "Public Ledger"].map(l => (
                        <a key={l} href="#" className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">{l}</a>
                    ))}
                </div>
            </footer>

            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-gradient { background-size: 200% auto; animation: gradient 4s ease infinite; }
                .animate-marquee { animation: marquee 15s linear infinite; }
            `}</style>
        </div>
    );
}
