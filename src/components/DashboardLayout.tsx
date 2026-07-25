import type { ReactNode } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard, MessageSquare, Settings,
    Calendar, X, Menu, Search, Bell, LogOut,
    ChevronRight, Shield, FolderOpen, Layers, Zap, FileBarChart2, Volume2,
    User, Building2, PlusCircle, Activity, ArrowRight, BarChart2, Megaphone,
    Map, Users2, Mic
} from "lucide-react";
import AdminSlide from "./AdminSlide";
import { useState, useEffect } from "react";
import { useComplaints } from "@/context/ComplaintsContext";

interface DashboardLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    bgImage?: string;
    actions?: ReactNode;
    isDark?: boolean;
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
            { icon: FileBarChart2, label: "Reports", path: "/reports" },
            { icon: FolderOpen, label: "Resolution Reports", path: "/resolution-reports" },
        ]
    },
    {
        group: "Comms & AI", items: [
            { icon: Megaphone, label: "Announcements", path: "/announcements" },
            { icon: Volume2, label: "Speech AI", path: "/speech-ai" },
            { icon: Calendar, label: "Meetings", path: "/meetings" },
            { icon: Megaphone, label: "Media Queue", path: "/media-queue" },
            { icon: Zap, label: "AI Co-Pilot", path: "/ai-copilot" },
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
            { icon: FolderOpen, label: "Resolution Reports", path: "/resolution-reports" },
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
            { icon: MessageSquare, label: "Track Complaint", path: "/citizen#track-complaint" },
            { icon: Megaphone, label: "Announcements", path: "/announcements" },
            { icon: User, label: "My Profile", path: "/profile" },
        ]
    },
];

export default function DashboardLayout({ children, title, subtitle, bgImage, actions, isDark = false }: DashboardLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout, complaints, notifications, readNotification } = useComplaints();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [adminSlideOpen, setAdminSlideOpen] = useState(false);
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
    const newCount = complaints.filter(c => c.status === "New" && c.source !== "voice").length;
    const assignedCount = complaints.filter(c => c.status === "Assigned" && (role === "admin" || c.dept === currentUser?.dept)).length;

    const roleCfg = {
        admin: { color: "#B91C1C", label: "Administrator", abbr: "AD" },
        officer: { color: "#2563EB", label: "Field Officer", abbr: "OF" },
        citizen: { color: "#059669", label: "Citizen", abbr: currentUser?.name?.slice(0, 2).toUpperCase() ?? "CT" },
    }[role] || { color: "#6B7280", label: "Observer", abbr: "OB" };

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="flex h-screen overflow-hidden" style={{ backgroundColor: isDark ? "#0A0F1C" : "#F9FAFB", fontFamily: "'Inter', sans-serif" }}>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ──────────────────────────────────────────── */}
            <aside
                className={`fixed lg:relative inset-y-0 left-0 z-[130] lg:z-[5] flex flex-col w-[520px] border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
                style={{ backgroundColor: "#FFFFFF", isolation: "isolate" }}
            >

                {/* Brand */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center relative shadow-lg shadow-red-900/10" style={{ backgroundColor: "#B91C1C" }}>
                            <Shield className="w-6 h-6 text-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                        </div>
                        <div>
                            <span className="font-black text-2xl text-gray-900 block leading-none tracking-tight">GovPilot</span>
                            <span className="text-[11px] font-bold uppercase tracking-widest leading-none block mt-1.5 flex items-center gap-1.5" style={{ color: roleCfg.color }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" /> {roleCfg.label}
                            </span>
                        </div>
                    </div>
                    <button className="lg:hidden text-gray-400 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Role strip */}
                <div className="mx-4 mt-4 px-5 py-3.5 rounded-2xl border flex items-center gap-3 text-xl font-bold" style={{
                    borderColor: `${roleCfg.color}30`,
                    backgroundColor: `${roleCfg.color}08`,
                    color: roleCfg.color,
                }}>
                    {role === "admin" && <Shield className="w-5 h-5 shrink-0" />}
                    {role === "officer" && <Building2 className="w-5 h-5 shrink-0" />}
                    {role === "citizen" && <User className="w-5 h-5 shrink-0" />}
                    <span className="truncate text-xl font-black">{currentUser?.name ?? roleCfg.label}</span>
                </div>

                {/* Live new complaints banner */}
                {(role === "admin" || role === "officer") && newCount > 0 && (
                    <button
                        onClick={() => navigate(role === "officer" ? "/field-portal?status=New" : "/grievances?status=New")}
                        className="mx-3 mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-bold uppercase tracking-wide text-red-700 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors group"
                    >
                        <span className="live-dot w-2.5 h-2.5 shrink-0" />
                        {newCount} New Complaint{newCount > 1 ? "s" : ""}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-red-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                )}

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
                    {navGroups.map(({ group, items }) => (
                        <div key={group}>
                            <p className="px-4 mb-2 text-[11px] font-black uppercase tracking-[0.15em] text-gray-400">{group}</p>
                            <div className="space-y-1">
                                {items.map(({ icon: Icon, label, path, badge }) => {
                                    const isAssignedComplaints = label === "Assigned Complaints";
                                    const isComplaints = label === "Complaints";
                                    const liveCnt = badge === "new" ? newCount : isAssignedComplaints ? assignedCount : badge === "live" ? newCount : 0;
                                    const navTo = isAssignedComplaints
                                        ? `${path}?status=Assigned`
                                        : isComplaints && newCount > 0 ? `${path}?status=New` : path;
                                    const isActiveCustom = isAssignedComplaints
                                        ? location.pathname === path && location.search.includes("status=Assigned")
                                        : location.pathname === path || (isComplaints && location.pathname === "/grievances");
                                    return (
                                        <NavLink
                                            key={label}
                                            to={navTo}
                                            onClick={() => setSidebarOpen(false)}
                                            className={() =>
                                                `flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-150 group ${
                                                    isActiveCustom
                                                        ? "text-white shadow-lg shadow-red-900/20"
                                                        : "text-gray-600 hover:bg-red-50/70 hover:text-[#B91C1C]"
                                                }`
                                            }
                                            style={() => isActiveCustom ? { backgroundColor: "#B91C1C" } : {}}
                                        >
                                            {() => (
                                                <>
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                                            isActiveCustom
                                                                ? "bg-white/20"
                                                                : "bg-gray-100 group-hover:bg-red-100"
                                                        }`}>
                                                            <Icon className={`w-5 h-5 ${isActiveCustom ? "text-white" : "text-gray-500 group-hover:text-[#B91C1C]"}`} />
                                                        </div>
                                                        <span className={`text-[20px] font-bold whitespace-nowrap tracking-tight ${isActiveCustom ? "text-white" : ""}`}>{label}</span>
                                                    </div>
                                                    {liveCnt > 0 && (
                                                        <span className={`text-sm font-black px-2.5 py-1 rounded-xl ml-auto ${
                                                            isActiveCustom ? "bg-white/25 text-white" : isAssignedComplaints ? "bg-blue-50 text-blue-700" : "bg-red-50 text-[#B91C1C]"
                                                        }`}>
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

                <div className="px-4 py-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100"
                    >
                        <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-black text-white shrink-0"
                            style={{ backgroundColor: roleCfg.color }}
                        >
                            {roleCfg.abbr}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="text-[18px] font-black text-gray-900 truncate leading-tight">{currentUser?.name ?? roleCfg.label}</p>
                            <p className="text-[13px] font-semibold text-gray-400 capitalize mt-0.5 uppercase tracking-wide">{role}</p>
                        </div>
                        <LogOut className="w-4 h-4 text-gray-300 group-hover:text-[#B91C1C] transition-colors" />
                    </button>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-1.5 text-gray-900 hover:bg-gray-50 rounded-lg" onClick={() => setSidebarOpen(true)}>
                            <Menu className="w-5 h-5" />
                        </button>

                        {role === 'admin' && (
                            <button title="Admin Menu" onClick={() => setAdminSlideOpen(true)} className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-50">
                                <Layers className="w-5 h-5 text-gray-400" />
                                <span className="text-lg text-gray-600">Admin</span>
                            </button>
                        )}

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
                                    className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-lg w-64 focus:outline-none focus:border-[#B91C1C]/30 focus:ring-2 focus:ring-[#B91C1C]/10 font-medium text-gray-700 placeholder:text-gray-400 transition-all"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                                <User className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-base font-bold text-emerald-700">Citizen Portal</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden sm:block text-lg font-bold text-gray-900 tabular-nums">{time}</span>
                        <div className="w-px h-5 bg-gray-300 hidden sm:block" />

                        {/* Notification bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifs(!showNotifs)}
                                className={`p-2.5 rounded-xl border transition-all ${showNotifs ? "bg-red-50 border-red-200 text-[#B91C1C]" : "bg-white/50 border-gray-100 text-gray-900 hover:bg-white"
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
                                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                                <Bell className="w-4 h-4 text-[#B91C1C]" /> Notifications
                                            </h3>
                                            {unreadCount > 0 && (
                                                <span className="text-base font-bold bg-red-100 text-[#B91C1C] px-2.5 py-0.5 rounded-full uppercase">{unreadCount} New</span>
                                            )}
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-12 text-center">
                                                    <Bell className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">No notifications</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-50">
                                                    {notifications.map(n => (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => {
                                                                readNotification(n.id);
                                                                navigate(`/dashboard?notificationId=${n.id}`);
                                                                setShowNotifs(false);
                                                            }}
                                                            className={`p-5 hover:bg-gray-50 transition-all cursor-pointer group flex gap-4 ${!n.read ? "bg-red-50/30" : ""}`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${n.type === "new_complaint" ? "bg-red-100 text-[#B91C1C]" : "bg-blue-100 text-blue-600"}`}>
                                                                {n.type === "new_complaint" ? <PlusCircle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <p className={`text-base font-bold uppercase  ${!n.read ? "text-gray-900" : "text-gray-500"}`}>{n.title}</p>
                                                                    <span className="text-sm font-bold text-gray-400 uppercase">{n.time}</span>
                                                                </div>
                                                                <p className="text-base text-gray-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                                                {!n.read && (
                                                                    <div className="mt-2 flex items-center gap-1.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
                                                                        <span className="text-sm font-bold text-[#B91C1C] uppercase tracking-wide">Unread</span>
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
                                                className="text-base font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wide flex items-center justify-center gap-2 mx-auto"
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
                            className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200"
                        >
                            <div
                                className="w-7 h-7 rounded-full text-white flex items-center justify-center text-sm font-bold"
                                style={{ backgroundColor: roleCfg.color }}
                            >
                                {roleCfg.abbr}
                            </div>
                            <span className="hidden lg:block text-lg font-bold text-gray-900">{currentUser?.name?.split(" ")[0] ?? roleCfg.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600 rotate-90" />
                        </button>

                        <div className="w-px h-5 bg-gray-300 hidden sm:block" />

                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-900 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Admin left slide */}
                <AdminSlide open={adminSlideOpen} onClose={() => setAdminSlideOpen(false)} navGroups={navGroups} />

                {/* Page Content */}
                <div className={`flex-1 overflow-y-auto scroll-smooth relative ${isDark ? "bg-[#0A0F1C]" : "bg-[#F9FAFB]"}`}>
                    {/* Theme Background Image - fixed to main content only */}
                    {isDark && (
                        <div className="fixed top-0 left-[520px] right-0 bottom-0 z-0 pointer-events-none opacity-40 overflow-hidden">
                            <img
                                key={bgImage || "/images/ai_hands_bg.png"}
                                src={bgImage || "/images/ai_hands_bg.png"}
                                alt="Dashboard Theme"
                                onError={e => (e.currentTarget.style.display = "none")}
                                className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.2]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1C] via-transparent to-[#0A0F1C]/90" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#0A0F1C_100%)] opacity-60" />
                        </div>
                    )}

                    <div className="relative z-10 p-6 lg:p-10 max-w-[2200px] mx-auto">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div className="animate-fade-in">
                                <h1 className={`text-3xl font-bold tracking-wide ${isDark ? "text-white drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "text-gray-900"}`}>{title}</h1>
                                {subtitle && <p className={`text-base font-medium mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>{subtitle}</p>}
                            </div>
                            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
                        </div>
                        {children}
                    </div>
                </div>

                {/* ── LIVE TOAST NOTIFICATION ────────────────────────── */}
                {showToast && lastNotif && (
                    <div className="fixed bottom-8 right-8 z-[300] animate-in slide-in-from-right-8 fade-in duration-500">
                        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(37,99,235,0.2)] border border-blue-100 p-4 w-[320px] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                            <div className="flex gap-3 relative z-10">
                                <div className="p-2.5 bg-blue-50 rounded-xl h-fit border border-blue-100 shrink-0">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-base font-bold uppercase text-gray-900">{lastNotif.title}</p>
                                        <button onClick={() => setShowToast(false)} className="text-gray-300 hover:text-gray-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-base text-gray-500 line-clamp-2 leading-relaxed mb-2">{lastNotif.message}</p>
                                    <button
                                        onClick={() => {
                                            if (role === "citizen") navigate("/citizen");
                                            else navigate("/grievances");
                                            setShowToast(false);
                                        }}
                                        className="text-sm font-bold text-blue-600 uppercase tracking-wide hover:underline flex items-center gap-1"
                                    >
                                        Take Action <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

