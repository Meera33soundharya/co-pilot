import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, MessageSquare, Settings,
    Calendar, X, Menu, Search, Bell, LogOut,
    ChevronRight, Shield, FolderOpen, Layers, Zap, FileBarChart2, Volume2,
    User, Building2, PlusCircle, Activity, ArrowRight, BarChart2, Megaphone,
    Map, Users2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useComplaints } from "@/context/ComplaintsContext";

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    bgImage?: string;
    actions?: ReactNode;
}

interface NavItem {
    icon: any;
    label: string;
    path: string;
    badge?: string;
}

interface NavGroup {
    group: string;
    items: NavItem[];
}

// ── Nav definitions per role ─────────────────────────────────
const ADMIN_NAV: NavGroup[] = [
    {
        group: "Overview", items: [
            { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
            { icon: Map, label: "Heatmap", path: "/heatmap" },
        ]
    },
    {
        group: "People", items: [
            { icon: LayoutDashboard, label: "Field Portal", path: "/field-portal" },
            { icon: Users2, label: "People", path: "/people" },
        ]
    },
    {
        group: "Complaints", items: [
            { icon: MessageSquare, label: "Complaints", path: "/grievances", badge: "live" },
            { icon: BarChart2, label: "Analytics", path: "/analytics" },
            { icon: FileBarChart2, label: "Reports", path: "/reports" },
        ]
    },
    {
        group: "Comms & AI", items: [
            { icon: Megaphone, label: "Announcements", path: "/announcements" },
            { icon: Volume2, label: "Speech AI", path: "/speech-ai" },
            { icon: Layers, label: "War Room", path: "/interactive-dashboard" },
            { icon: Zap, label: "Impact Sim", path: "/policy-simulator" },
            { icon: FolderOpen, label: "Documents", path: "/documents" },
            { icon: Calendar, label: "Schedule", path: "/schedule" },
        ]
    },
    {
        group: "Account", items: [
            { icon: User, label: "My Profile", path: "/profile" },
            { icon: Settings, label: "Settings", path: "/settings" },
        ]
    },
];

const OFFICER_NAV: NavGroup[] = [
    {
        group: "Main", items: [
            { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
            { icon: MessageSquare, label: "Assigned Complaints", path: "/grievances", badge: "live" },
        ]
    },
    {
        group: "Work", items: [
            { icon: LayoutDashboard, label: "Field Portal", path: "/field-portal", badge: "new" },
            { icon: FileBarChart2, label: "Reports", path: "/reports" },
            { icon: Megaphone, label: "Announcements", path: "/announcements" },
            { icon: Calendar, label: "Schedule", path: "/schedule" },
            { icon: FolderOpen, label: "Documents", path: "/documents" },
        ]
    },
    {
        group: "Account", items: [
            { icon: User, label: "My Profile", path: "/profile" },
            { icon: Settings, label: "Settings", path: "/settings" },
        ]
    },
];

const CITIZEN_NAV: NavGroup[] = [
    {
        group: "My Account", items: [
            { icon: LayoutDashboard, label: "Dashboard", path: "/citizen" },
            { icon: PlusCircle, label: "Submit Complaint", path: "/submit-complaint" },
            { icon: MessageSquare, label: "Track Complaint", path: "/citizen" },
            { icon: Megaphone, label: "Announcements", path: "/announcements" },
            { icon: User, label: "My Profile", path: "/profile" },
        ]
    },
];

export function DashboardLayout({ children, title, subtitle, bgImage, actions }: DashboardLayoutProps) {
    const navigate = useNavigate();
    const { currentUser, logout, complaints, notifications, readNotification } = useComplaints();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showNotifs, setShowNotifs] = useState(false);
    const [lastNotif, setLastNotif] = useState<any>(null);
    const [showToast, setShowToast] = useState(false);
    const [time, setTime] = useState(() =>
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );

    useEffect(() => {
        const id = setInterval(() => {
            setTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    // 🔔 Live Toast Logic
    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            if (!latest.read && (!lastNotif || latest.id !== lastNotif.id)) {
                setLastNotif(latest);
                setShowToast(true);
                const timer = setTimeout(() => setShowToast(false), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [notifications, lastNotif]);

    const role = currentUser?.role ?? "admin";
    const navGroups = role === "citizen" ? CITIZEN_NAV : role === "officer" ? OFFICER_NAV : ADMIN_NAV;
    const unreadCount = notifications.filter(n => !n.read).length;
    const newCount = complaints.filter(c => c.status === "New").length;

    const roleCfg = {
        admin: { color: "#B91C1C", label: "Administrator", abbr: "AD" },
        officer: { color: "#2563EB", label: "Field Officer", abbr: "OF" },
        citizen: { color: "#059669", label: "Citizen", abbr: currentUser?.name?.slice(0, 2).toUpperCase() ?? "CT" },
    }[role];

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#F5F0E8", fontFamily: "'Inter', sans-serif" }}>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ──────────────────────────────────────────── */}
            <aside className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto flex flex-col w-56 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>

                {/* Brand */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center relative shadow-lg shadow-red-900/10" style={{ backgroundColor: "#B91C1C" }}>
                            <Shield className="w-5 h-5 text-white" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                        </div>
                        <div>
                            <span className="font-black text-lg text-gray-900 tracking-tight block leading-none">GovPilot</span>
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none block mt-1 flex items-center gap-1" style={{ color: roleCfg.color }}>
                                <div className="w-1 h-1 rounded-full bg-current animate-ping" /> {roleCfg.label}
                            </span>
                        </div>
                    </div>
                    <button className="lg:hidden text-gray-400 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Role strip */}
                <div className="mx-3 mt-3 px-4 py-2.5 rounded-2xl border flex items-center gap-2 text-base font-black" style={{
                    borderColor: `${roleCfg.color}30`,
                    backgroundColor: `${roleCfg.color}10`,
                    color: roleCfg.color,
                }}>
                    {role === "admin" && <Shield className="w-4 h-4 shrink-0" />}
                    {role === "officer" && <Building2 className="w-4 h-4 shrink-0" />}
                    {role === "citizen" && <User className="w-4 h-4 shrink-0" />}
                    <span className="truncate">{currentUser?.name ?? roleCfg.label}</span>
                </div>

                {/* Live new complaints banner */}
                {(role === "admin" || role === "officer") && newCount > 0 && (
                    <button
                        onClick={() => navigate("/grievances?status=New")}
                        className="mx-3 mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide text-red-700 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors group"
                    >
                        <span className="live-dot w-2.5 h-2.5 shrink-0" />
                        {newCount} New Complaint{newCount > 1 ? "s" : ""}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-red-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                )}

                {/* Nav */}
                <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
                    {navGroups.map(({ group, items }) => (
                        <div key={group}>
                            <p className="px-3 mb-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400">{group}</p>
                            <div className="space-y-0.5">
                                {items.map(({ icon: Icon, label, path, badge }) => {
                                    const liveCnt = badge === "live" ? newCount : 0;
                                    return (
                                        <NavLink
                                            key={path}
                                            to={label === "Complaints" && liveCnt > 0 ? `${path}?status=New` : path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group text-base font-medium ${isActive
                                                    ? "text-white shadow-lg shadow-red-900/20"
                                                    : "text-gray-600 hover:bg-red-50 hover:text-[#B91C1C]"
                                                }`
                                            }
                                            style={({ isActive }) => isActive ? { backgroundColor: "#B91C1C" } : {}}
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <div className="flex items-center gap-3">
                                                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400 group-hover:text-[#B91C1C]"}`} />
                                                        <span className="font-bold">{label}</span>
                                                    </div>
                                                    {liveCnt > 0 && (
                                                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : "bg-red-50 text-[#B91C1C]"}`}>
                                                            {liveCnt}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="px-2 py-3 border-t border-gray-100 space-y-0.5">
                    <div className="mt-2 px-1">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100 shadow-sm"
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                                style={{ backgroundColor: roleCfg.color }}
                            >
                                {roleCfg.abbr}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-black text-gray-900 truncate">{currentUser?.name ?? roleCfg.label}</p>
                                <p className="text-[11px] text-gray-400 font-bold capitalize">{role}</p>
                            </div>
                            <LogOut className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#B91C1C] transition-colors" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg" onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </button>

                        {role !== "citizen" ? (
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search complaints, wards, officers…"
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            navigate(`/grievances?q=${encodeURIComponent(e.currentTarget.value)}`);
                                            e.currentTarget.value = "";
                                        }
                                    }}
                                    className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[#B91C1C]/30 focus:ring-2 focus:ring-[#B91C1C]/10 font-medium text-gray-700 placeholder:text-gray-400 transition-all"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                                <User className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-xs font-black text-emerald-700">Citizen Portal</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:block text-sm font-bold text-gray-500 tabular-nums">{time}</span>
                        <div className="w-px h-5 bg-gray-200 hidden sm:block" />

                        {/* Notification bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifs(!showNotifs)}
                                className={`p-2.5 rounded-xl border transition-all ${showNotifs ? "bg-red-50 border-red-200 text-[#B91C1C]" : "bg-white/50 border-gray-100 text-gray-400 hover:bg-white"
                                    }`}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#B91C1C] rounded-full border-2 border-white shadow-sm" />
                                )}
                            </button>

                            {showNotifs && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
                                        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-[#B91C1C]" /> Notifications
                                            </h3>
                                            {unreadCount > 0 && (
                                                <span className="text-xs font-black bg-red-100 text-[#B91C1C] px-2.5 py-0.5 rounded-full uppercase">{unreadCount} New</span>
                                            )}
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-12 text-center">
                                                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No notifications</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-50">
                                                    {notifications.map(n => (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => {
                                                                readNotification(n.id);
                                                                if (n.announcementId) {
                                                                    navigate(`/announcements?id=${n.announcementId}`);
                                                                } else if (n.complaintId) {
                                                                    if (role === "citizen") navigate("/citizen");
                                                                    else if (role === "officer") navigate("/field-portal");
                                                                    else navigate("/grievances");
                                                                }
                                                                setShowNotifs(false);
                                                            }}
                                                            className={`p-5 hover:bg-gray-50 transition-all cursor-pointer group flex gap-4 ${!n.read ? "bg-red-50/30" : ""}`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${n.type === "new_complaint" ? "bg-red-100 text-[#B91C1C]" : "bg-blue-100 text-blue-600"}`}>
                                                                {n.type === "new_complaint" ? <PlusCircle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <p className={`text-xs font-black uppercase tracking-tight ${!n.read ? "text-gray-900" : "text-gray-500"}`}>{n.title}</p>
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase">{n.time}</span>
                                                                </div>
                                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                                                {!n.read && (
                                                                    <div className="mt-2 flex items-center gap-1.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
                                                                        <span className="text-[10px] font-black text-[#B91C1C] uppercase tracking-widest">Unread</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                                            <button
                                                onClick={() => {
                                                    if (role === "citizen") navigate("/citizen");
                                                    else if (role === "officer") navigate("/field-portal");
                                                    else navigate("/grievances");
                                                    setShowNotifs(false);
                                                }}
                                                className="text-xs font-black text-gray-500 hover:text-gray-900 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                                            >
                                                {role === "citizen" ? "Track My Complaints" : role === "officer" ? "Open Field Portal" : "View All Complaints"} <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => { if (role === "citizen") navigate("/citizen"); else navigate("/settings"); }}
                            className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-50 rounded-lg transition-all border border-transparent hover:border-gray-200"
                        >
                            <div
                                className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-black"
                                style={{ backgroundColor: roleCfg.color }}
                            >
                                {roleCfg.abbr}
                            </div>
                            <span className="hidden lg:block text-sm font-bold text-gray-800">{currentUser?.name?.split(" ")[0] ?? roleCfg.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 rotate-90" />
                        </button>

                        <div className="w-px h-5 bg-gray-200 hidden sm:block" />

                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto scroll-smooth relative bg-[#060912]">
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-40 overflow-hidden">
                        <img
                            key={bgImage || "/images/dashboard_bg.png"}
                            src={bgImage || "/images/dashboard_bg.png"}
                            alt="Dashboard Theme"
                            onError={e => (e.currentTarget.style.display = "none")}
                            className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.2]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#060912] via-transparent to-[#060912]/90" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#060912_100%)] opacity-60" />
                    </div>

                    <div className="relative z-10 p-6 lg:p-8 max-w-[1400px] mx-auto">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div className="animate-fade-in">
                                <h1 className="text-3xl font-black text-white tracking-tight">{title}</h1>
                                {subtitle && <p className="text-base text-white/50 font-medium mt-0.5">{subtitle}</p>}
                            </div>
                            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
                        </div>
                        {children}
                    </div>
                </div>

                {/* ── LIVE TOAST NOTIFICATION ────────────────────────── */}
                {showToast && lastNotif && (
                    <div className="fixed bottom-8 right-8 z-[300] animate-in slide-in-from-right-8 fade-in duration-500">
                        <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-6 flex items-start gap-4 min-w-[320px] max-w-sm">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${lastNotif.type === "new_complaint" ? "bg-red-100 text-[#B91C1C]" : "bg-blue-100 text-blue-600"
                                }`}>
                                {lastNotif.type === "new_complaint" ? <PlusCircle className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-xs font-black uppercase tracking-tight text-gray-900">{lastNotif.title}</p>
                                    <button onClick={() => setShowToast(false)} className="text-gray-300 hover:text-gray-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 leading-tight mb-2">{lastNotif.message}</p>
                                <button
                                    onClick={() => {
                                        if (role === "citizen") navigate("/citizen");
                                        else navigate("/grievances");
                                        setShowToast(false);
                                    }}
                                    className="text-[10px] font-black text-[#B91C1C] uppercase tracking-widest hover:underline flex items-center gap-1"
                                >
                                    Take Action <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
