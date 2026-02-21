import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, FileText, FolderOpen, Mic, BarChart2,
    Zap, X, FileBarChart2,
    Brain, GraduationCap, Quote, Gamepad2,
    Activity, Cpu, ShieldCheck, Shield, ChevronDown, Menu, Search, BellRing, AtSign, Settings, HelpCircle, Bell, Wifi
} from "lucide-react";
import { useState, useEffect } from "react";

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Zap, label: "Interactive Grid", path: "/interactive-dashboard" },
    { icon: Brain, label: "BrainSpark", path: "/brainspark" },
    { icon: Activity, label: "Policy Simulator", path: "/policy-simulator" },
    { icon: Cpu, label: "Explainable AI", path: "/explainable-ai" },
    { icon: GraduationCap, label: "Study Buddy", path: "/study-buddy" },
    { icon: Quote, label: "Proverbs", path: "/proverbs" },
    { icon: Gamepad2, label: "Reword Game", path: "/reword-game" },
    { icon: FileText, label: "Grievances", path: "/grievances", badge: "183" },
    { icon: FolderOpen, label: "Documents", path: "/documents" },
    { icon: Mic, label: "SpeechAI", path: "/speech-ai" },
    { icon: BarChart2, label: "Analytics", path: "/analytics" },
    { icon: AtSign, label: "Mentions", path: "/mentions", badge: "24" },
    { icon: BellRing, label: "AI Alerts", path: "/ai-alerts", badge: "7" },
    { icon: FileBarChart2, label: "Reports", path: "/reports" },
];

const bottomNavItems = [
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help & Support", path: "/help" },
];

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    useEffect(() => {
        const id = setInterval(() => {
            setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="flex h-screen bg-[#F1F5F9] overflow-hidden font-sans">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex flex-col w-64 bg-[#0B1221] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
                {/* Logo */}
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                            <Shield className="w-5 h-5 text-white" />
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0B1221]" />
                        </div>
                        <div>
                            <span className="font-black text-lg tracking-tight leading-none block text-white">GovCo-Pilot</span>
                            <span className="text-[8px] text-[#D4AF37]/60 font-black uppercase tracking-[0.25em]">Intelligence Grid v2.0</span>
                        </div>
                    </div>
                    <button
                        className="lg:hidden text-white/40 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* System status */}
                <div className="mx-4 mb-4 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">All Systems Normal</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                    {navItems.map(({ icon: Icon, label, path, badge }) => (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `relative flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive ? "text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/80 to-blue-700/60 shadow-lg shadow-blue-600/20" />
                                    )}
                                    {isActive && (
                                        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-white/60" />
                                    )}
                                    <div className="flex items-center gap-3 relative z-10">
                                        <Icon className={`w-[18px] h-[18px] transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-white/40 group-hover:text-blue-400"}`} />
                                        <span className="text-sm font-bold tracking-tight">{label}</span>
                                    </div>
                                    {badge && (
                                        <span className={`relative z-10 text-[10px] font-black px-2 py-0.5 rounded-lg ${isActive ? "bg-white/20 text-white" : "bg-rose-500/90 text-white"}`}>
                                            {badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-white/5 space-y-0.5">
                    {bottomNavItems.map(({ icon: Icon, label, path }) => (
                        <NavLink
                            key={label}
                            to={path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? "bg-blue-600 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-bold">{label}</span>
                        </NavLink>
                    ))}

                    <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border border-white/20 flex items-center justify-center text-xs font-black">AD</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold leading-tight truncate">Administrator</p>
                                <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Executive Admin</p>
                            </div>
                            <button
                                onClick={() => navigate("/login")}
                                className="p-2 text-white/20 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                title="Sign Out"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span>GovPilot</span>
                            <ChevronDown className="w-3 h-3 -rotate-90" />
                            <span className="text-gray-900">{title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="pl-10 pr-12 py-2 bg-[#F8FAFC] border border-gray-100 rounded-xl text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium text-gray-700 placeholder:text-gray-400"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-400 border border-gray-200">
                                ⌘K
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/ai-alerts")}
                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl relative transition-all active:scale-95"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>

                        <div className="h-7 w-[1px] bg-gray-100" />

                        <div className="hidden xl:flex items-center gap-4 px-4 py-2 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">Hardware Vault Active</span>
                            </div>
                            <div className="w-px h-3 bg-emerald-200" />
                            <div className="flex items-center gap-2">
                                <Wifi className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-blue-600">Sync: Secure</span>
                            </div>
                        </div>

                        <div className="h-7 w-[1px] bg-gray-100 hidden xl:block" />

                        <div className="hidden lg:flex flex-col items-end">
                            <span className="text-sm font-black text-gray-900 tabular-nums tracking-tight">{time}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                        </div>

                        <div className="h-7 w-[1px] bg-gray-100 hidden lg:block" />

                        <button
                            onClick={() => navigate("/ai-alerts")}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            AI Audit
                        </button>

                        <button
                            onClick={() => navigate("/settings")}
                            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100 active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-full bg-[#0B1221] text-white flex items-center justify-center text-xs font-black">AD</div>
                            <div className="hidden lg:block text-left">
                                <p className="text-xs font-black text-gray-900 leading-none">Administrator</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Admin</p>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
                        <div className="mb-6 hidden sm:block">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
                            {subtitle && <p className="text-sm text-gray-400 font-medium mt-1">{subtitle}</p>}
                        </div>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
