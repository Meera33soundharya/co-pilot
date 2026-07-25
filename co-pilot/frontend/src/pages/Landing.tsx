import { useNavigate } from "react-router-dom";
import { 
    User, Building2, 
    BrainCircuit, Sparkles, 
    ArrowRight, CheckCircle2, Zap, LayoutDashboard,
    Activity, Shield, Users, Timer, Globe, Play, Languages, Trophy
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Landing() {
    const navigate = useNavigate();
    const { t, lang, setLang } = useLanguage();

    const stats = [
        { label: t("landing_stat_districts"), val: "24/28", change: "+12% MoM", icon: Globe, color: "text-blue-500" },
        { label: t("landing_stat_accuracy"), val: "99.4%", change: "+0.8%", icon: Shield, color: "text-emerald-500" },
        { label: t("landing_stat_time"), val: "2.4 Hrs", change: "-45% Time", icon: Timer, color: "text-amber-500" },
        { label: t("landing_stat_citizens"), val: "182K+", change: "+24k New", icon: Users, color: "text-red-500" },
    ];

    const portals = [
        {
            id: "citizen",
            title: t("portal_citizen_title"),
            desc: t("portal_citizen_desc"),
            icon: User,
            color: "from-emerald-500 to-teal-600",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20 hover:border-emerald-500/50",
            stat: "98.2% Satisfaction",
            actionText: t("portal_citizen_action"),
            link: "/submit-complaint"
        },
        {
            id: "officer",
            title: t("portal_officer_title"),
            desc: t("portal_officer_desc"),
            icon: Building2,
            color: "from-blue-500 to-indigo-600",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20 hover:border-blue-500/50",
            stat: "14 Min Avg Response",
            actionText: t("portal_officer_action"),
            link: "/field-portal"
        },
        {
            id: "admin",
            title: t("portal_admin_title"),
            desc: t("portal_admin_desc"),
            icon: LayoutDashboard,
            color: "from-red-500 to-rose-600",
            bg: "bg-red-500/10",
            border: "border-red-500/20 hover:border-red-500/50",
            stat: "Live Health Index: 92/100",
            actionText: t("portal_admin_action"),
            link: "/dashboard"
        },
        {
            id: "politician",
            title: "PoliticoAI",
            desc: "Election analytics, voter CRM, AI speech generation, media intelligence and campaign tools for elected representatives.",
            icon: Trophy,
            color: "from-amber-500 to-yellow-600",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20 hover:border-amber-500/50",
            stat: "AI Win Probability: 73%",
            actionText: "Open Politician Hub",
            link: "/election-analytics"
        }
    ];

    return (
        <div className="min-h-screen bg-[#080912] text-gray-100 selection:bg-red-500/30 selection:text-white relative overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
            
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[150px] pointer-events-none" />
            <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-950/20 blur-[180px] pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 inset-x-0 h-20 bg-[#080912]/80 backdrop-blur-md border-b border-gray-800/40 z-[100] px-4 md:px-12 flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B91C1C] to-[#7F1D1D] flex items-center justify-center shadow-lg shadow-red-900/20 group-hover:scale-105 transition-transform duration-300">
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white tracking-tight leading-none">GovPilot</h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#B91C1C] mt-1 leading-none">District Governance AI</p>
                    </div>
                </div>

                {/* Live Ribbon */}
                <div className="hidden lg:flex items-center gap-4 bg-gray-900/40 px-5 py-2 rounded-2xl border border-gray-800/60 max-w-sm overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div className="overflow-hidden w-64">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap animate-marquee">
                            Ward 07: Water leak fixed • Ward 03: Streetlights repaired • New AI Cluster in Sector 4
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setLang(lang === "en" ? "ta" : "en")}
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 bg-gray-900/60 text-gray-300 hover:text-white hover:border-gray-500 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <Languages className="w-4 h-4" />
                        {t("language")}
                    </button>
                    <button onClick={() => navigate("/login")} 
                        className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-red-900/30">
                        {t("landing_systemLogin")}
                    </button>
                </div>
            </header>

            <main className="w-[88%] max-w-[1400px] mx-auto pt-32 pb-24 space-y-24 relative z-10">
                
                {/* Hero Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[70vh]">
                    <div className="lg:col-span-7 space-y-8 text-left animate-in fade-in slide-in-from-left-6 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold uppercase tracking-widest text-red-400">
                            <Sparkles className="w-4 h-4 text-red-500 animate-pulse" /> {t("landing_tagline")}
                        </div>
                        <h1 className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.08] tracking-tight">
                            {t("landing_hero_title_1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-rose-600">{t("landing_hero_title_2")}</span>
                        </h1>
                        <p className="text-gray-400 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                            {t("landing_hero_desc")}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <button onClick={() => navigate("/login")}
                                className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-2xl flex items-center gap-2 group shadow-xl shadow-red-950/40 transition-all hover:-translate-y-0.5">
                                {t("landing_getStarted")} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => navigate("/login")}
                                className="px-8 py-4 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 hover:border-gray-700 font-bold rounded-2xl flex items-center gap-2 transition-all hover:-translate-y-0.5">
                                <Play className="w-4 h-4 text-red-500 fill-current" /> {t("landing_watchDemo")}
                            </button>
                        </div>

                        {/* Social proof */}
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-800/40 max-w-md">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#080912] bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                        USR
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 font-semibold tracking-wide">{t("landing_users")}</p>
                        </div>
                    </div>

                    {/* Stats Grid inside Hero area */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-6 duration-700 delay-100">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-gray-950/60 backdrop-blur-sm border border-gray-850 p-6 rounded-3xl space-y-4 hover:border-gray-800 transition-all hover:bg-gray-900/40">
                                <div className="flex justify-between items-start">
                                    <div className={`p-3 rounded-2xl bg-gray-900 border border-gray-800`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/10">
                                        {stat.change}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white">{stat.val}</h4>
                                    <p className="text-xs font-semibold tracking-wide text-gray-500 mt-1 uppercase">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Portals Grid */}
                <section className="space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{t("landing_accessPortals")}</h2>
                        <p className="text-gray-400 text-sm md:text-base font-medium">{t("landing_portalDesc")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {portals.map((portal) => (
                            <div key={portal.id} 
                                onClick={() => navigate(portal.link)}
                                className={`group bg-gray-950/40 backdrop-blur-md border ${portal.border} rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between hover:shadow-2xl hover:shadow-red-950/5 hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden`}
                            >
                                {/* Glow element */}
                                <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${portal.color} opacity-[0.03] group-hover:opacity-10 blur-3xl rounded-full transition-opacity duration-300`} />
                                
                                <div>
                                    <div className={`w-14 h-14 rounded-2xl ${portal.bg} flex items-center justify-center mb-8 border border-white/5 group-hover:scale-105 transition-transform duration-300`}>
                                        <portal.icon className={`w-7 h-7 text-white`} />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-white mb-3 tracking-tight">{portal.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                                        {portal.desc}
                                    </p>
                                </div>

                                <div className="space-y-6 pt-4 border-t border-gray-900">
                                    <div className="flex justify-between items-center text-xs font-semibold">
                                        <span className="flex items-center gap-1.5 text-gray-400 uppercase tracking-widest">
                                            <Zap className="w-3.5 h-3.5 text-red-500 fill-red-500/20" /> Active System
                                        </span>
                                        <span className="text-red-400 tracking-wide font-black">{portal.stat}</span>
                                    </div>
                                    <button className="w-full py-3.5 bg-gray-900 border border-gray-800 hover:border-red-500/30 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2">
                                        {portal.actionText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Dashboard Command Center Preview */}
                <section className="space-y-12">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                            <Activity className="w-3.5 h-3.5" /> Command Center Telemetry
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Administrative Intelligence Preview</h2>
                        <p className="text-gray-400 text-sm md:text-base font-medium">Get real-time updates and view deep metrics showing AI resolution cycles and district performance parameters.</p>
                    </div>

                    {/* Interactive Mock Dashboard View */}
                    <div className="relative group rounded-[2.5rem] border border-gray-850 bg-gray-950/60 p-6 md:p-8 backdrop-blur-md overflow-hidden shadow-2xl">
                        {/* Interactive overlay glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-950/5 to-blue-950/10 pointer-events-none" />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                            {/* System Status Panel */}
                            <div className="lg:col-span-4 space-y-4">
                                <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-800/60">
                                        <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">AI Pipeline status</span>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Active Queue</span>
                                            <span className="font-bold text-white">42 Jobs</span>
                                        </div>
                                        <div className="w-full bg-gray-850 h-2 rounded-full overflow-hidden">
                                            <div className="w-[70%] bg-gradient-to-r from-red-500 to-rose-500 h-full rounded-full" />
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500">Dispatch Speed</span>
                                            <span className="font-bold text-white">0.8s avg</span>
                                        </div>
                                        <div className="w-full bg-gray-850 h-2 rounded-full overflow-hidden">
                                            <div className="w-[90%] bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-3">
                                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider block">Real-time alerts</span>
                                    <div className="space-y-2">
                                        <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/20 text-[11px] flex items-center justify-between">
                                            <span className="text-red-300 font-medium">Critical Water Leak - Sector 2</span>
                                            <span className="text-red-400 font-bold">Dispatched</span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] flex items-center justify-between">
                                            <span className="text-emerald-300 font-medium">Power Line Restored - Ward 4</span>
                                            <span className="text-emerald-400 font-bold">Resolved</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chart Telemetry Panel */}
                            <div className="lg:col-span-8 p-5 md:p-6 rounded-2xl bg-gray-900/40 border border-gray-800 flex flex-col justify-between gap-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">District Health Analytics</h4>
                                        <p className="text-[11px] text-gray-500">Weekly resolution metrics versus incoming complaints</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-400 font-bold bg-gray-800 px-2.5 py-1 rounded-md">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Complaints
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-400 font-bold bg-gray-800 px-2.5 py-1 rounded-md">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Resolved
                                        </span>
                                    </div>
                                </div>

                                {/* Graph Mock */}
                                <div className="h-40 flex items-end justify-between gap-3 pt-4 border-b border-gray-800 pb-2">
                                    {[
                                        { complaints: 60, resolved: 80, label: "Mon" },
                                        { complaints: 40, resolved: 70, label: "Tue" },
                                        { complaints: 80, resolved: 90, label: "Wed" },
                                        { complaints: 50, resolved: 85, label: "Thu" },
                                        { complaints: 90, resolved: 95, label: "Fri" },
                                        { complaints: 30, resolved: 60, label: "Sat" },
                                        { complaints: 20, resolved: 50, label: "Sun" },
                                    ].map((day, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar">
                                            <div className="w-full flex items-end gap-1.5 h-32 justify-center">
                                                <div style={{ height: `${day.complaints}%` }} className="w-2 md:w-3 bg-red-500/80 rounded-t-sm group-hover/bar:bg-red-500 transition-colors" />
                                                <div style={{ height: `${day.resolved}%` }} className="w-2 md:w-3 bg-blue-500/80 rounded-t-sm group-hover/bar:bg-blue-500 transition-colors" />
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase">{day.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Predictive Resolution Score</span>
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                        <Activity className="w-3.5 h-3.5" /> Optimal (98.4%)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Checklist */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                                Built for Transparency. <br/>Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-500">Explainable AI.</span>
                            </h2>
                            <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed">
                                Avoid the black-box effect. GovPilot breaks down automated classification workflows and optimization parameters clearly, offering transparent governance models to administrators and citizens alike.
                            </p>
                        </div>
                        <div className="space-y-5">
                            {[
                                { title: "XAI-Driven Validation", desc: "Instantly audits incoming grievances for duplicate checks and validation routing." },
                                { title: "Telemetry Command Centers", desc: "Integrate multiple live telemetry metrics and responsive performance monitors directly." },
                                { title: "Optimized Field Dispatching", desc: "Utilizes advanced heuristics to match dispatch orders with field officer routes instantly." }
                            ].map((feat, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{feat.title}</h4>
                                        <p className="text-xs font-semibold text-gray-500 mt-1">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative flex justify-center items-center">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-red-500 to-blue-500 rounded-[3rem] blur-[80px] opacity-10 animate-pulse" />
                        <div className="relative bg-gray-950/60 p-10 rounded-[3rem] border border-gray-850 shadow-2xl overflow-hidden aspect-square w-full max-w-[400px] flex flex-col justify-between items-center text-center">
                            <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20 mt-4 animate-bounce">
                                <Sparkles className="w-12 h-12 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-black text-white tracking-tight">GovPilot Platform</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Live AI Environment</p>
                            </div>
                            <div className="px-5 py-2.5 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs font-semibold text-emerald-400">
                                Dispatch status: Active
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-900 bg-gray-950/80 pt-16 pb-12 text-center relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">GovPilot District AI · Open Infrastructure</p>
                <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {["API Documentation", "Transparency Report", "Public Ledger", "Terms of Service"].map(l => (
                        <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
                    ))}
                </div>
            </footer>

            {/* Global Keyframes & Animations */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee { animation: marquee 18s linear infinite; }
            `}</style>
        </div>
    );
}

