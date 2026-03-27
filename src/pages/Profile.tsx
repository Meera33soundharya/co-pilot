import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { useNavigate } from "react-router-dom";
import {
    User, Phone, Mail, MapPin, Shield, Building2,
    Edit3, Save, X, CheckCircle2, Camera, LogOut,
    Bell, Lock, Globe, Star, FileText, Clock,
    ChevronRight, Eye, EyeOff, Settings, Sparkles, Award
} from "lucide-react";

// ── Avatar Initials helper ─────────────────────────────────────────────
function Avatar({ name, size = "lg" }: { name: string; size?: "sm" | "md" | "lg" | "xl" }) {
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const sizeMap = {
        sm: "w-9 h-9 text-xs",
        md: "w-12 h-12 text-sm",
        lg: "w-20 h-20 text-xl",
        xl: "w-28 h-28 text-3xl",
    };
    return (
        <div className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-[#B91C1C] to-red-800 flex items-center justify-center text-white font-black shadow-xl shadow-red-200 shrink-0`}>
            {initials}
        </div>
    );
}

// ── Role Badge ─────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
    const cfg: Record<string, { color: string; bg: string; icon: any; label: string }> = {
        admin:   { color: "text-red-700",     bg: "bg-red-50 border-red-100",     icon: Shield,    label: "Administrator" },
        officer: { color: "text-blue-700",    bg: "bg-blue-50 border-blue-100",   icon: Building2, label: "Field Officer"  },
        citizen: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", icon: User,  label: "Citizen"        },
    };
    const c = cfg[role] ?? cfg.citizen;
    const Icon = c.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${c.bg} ${c.color}`}>
            <Icon className="w-3.5 h-3.5" /> {c.label}
        </span>
    );
}

// ── Stat Card ──────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function Profile() {
    const { currentUser, logout, complaints } = useComplaints();
    const navigate = useNavigate();

    const isAdmin   = currentUser?.role === "admin";
    const isOfficer = currentUser?.role === "officer";
    const isCitizen = currentUser?.role === "citizen";

    // Editable profile form state
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name:     currentUser?.name     ?? "Guest User",
        email:    isAdmin   ? "admin@govpilot.in"   : isOfficer ? "officer@govpilot.in" : "citizen@govpilot.in",
        phone:    "+91 98765 43210",
        location: isOfficer ? `${currentUser?.dept ?? "Department HQ"}` : "Ward 12, Tamil Nadu",
        bio:      isAdmin   ? "District-level administrator with oversight across all wards and departments."
                : isOfficer ? "Field officer responsible for complaint resolution and field inspections."
                : "Active citizen reporting ward issues for a better community.",
    });
    const [notifSettings, setNotifSettings] = useState({
        sms: true, email: false, inApp: true, urgent: true,
    });
    const [showPwdPanel, setShowPwdPanel] = useState(false);
    const [showPwd,      setShowPwd]      = useState(false);
    const [toast,        setToast]        = useState<string | null>(null);

    // Stats from store
    const myComplaints = isCitizen && currentUser?.citizenId
        ? complaints.filter(c => c.citizenId === currentUser.citizenId)
        : isOfficer && currentUser?.dept
        ? complaints.filter(c => c.dept === currentUser.dept)
        : complaints;

    const stats = {
        total:     myComplaints.length,
        resolved:  myComplaints.filter(c => c.status === "Resolved" || c.status === "Closed").length,
        pending:   myComplaints.filter(c => c.status !== "Resolved" && c.status !== "Closed").length,
        highPri:   myComplaints.filter(c => c.priority === "High").length,
    };

    function doSave() {
        setEditing(false);
        setToast("✅ Profile saved successfully");
        setTimeout(() => setToast(null), 2500);
    }

    function doLogout() {
        logout();
        navigate("/login");
    }

    function toast_(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    }

    return (
        <DashboardLayout title="My Profile" subtitle="Manage your account, preferences, and settings">

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white px-6 py-3.5 rounded-2xl text-sm font-bold shadow-2xl flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    {toast}
                </div>
            )}

            <div className="space-y-6 pb-10">

                {/* ── Profile Hero Card ─────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                    {/* Cover */}
                    <div className="h-28 bg-gradient-to-r from-[#B91C1C] via-red-700 to-red-900 relative">
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
                            backgroundSize: "24px 24px",
                        }} />
                        {/* AI Badge */}
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" /> AI Co-Pilot
                        </div>
                    </div>

                    <div className="px-8 pb-8">
                        {/* Avatar row */}
                        <div className="flex items-end justify-between -mt-12 mb-6">
                            <div className="relative">
                                <Avatar name={form.name} size="xl" />
                                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-all">
                                    <Camera className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                {!editing ? (
                                    <button onClick={() => setEditing(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black text-gray-700 hover:bg-gray-100 transition-all">
                                        <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => setEditing(false)}
                                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-50 transition-all">
                                            <X className="w-3.5 h-3.5" /> Cancel
                                        </button>
                                        <button onClick={doSave}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-[#B91C1C] text-white rounded-2xl text-xs font-black hover:bg-red-800 transition-all shadow-lg shadow-red-200">
                                            <Save className="w-3.5 h-3.5" /> Save Changes
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Name & Role */}
                        {!editing ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-2xl font-black text-gray-900">{form.name}</h2>
                                    <RoleBadge role={currentUser?.role ?? "citizen"} />
                                    {(isAdmin || isOfficer) && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-black rounded-xl uppercase tracking-widest">
                                            <Award className="w-3 h-3" /> Verified Official
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xl">{form.bio}</p>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {[
                                        { icon: Mail,   val: form.email },
                                        { icon: Phone,  val: form.phone },
                                        { icon: MapPin, val: form.location },
                                    ].map(({ icon: Icon, val }) => (
                                        <div key={val} className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                            <Icon className="w-3.5 h-3.5 text-gray-400" /> {val}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Edit Form */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {[
                                    { label: "Full Name",    key: "name",     icon: User,   type: "text" },
                                    { label: "Email",        key: "email",    icon: Mail,   type: "email" },
                                    { label: "Phone",        key: "phone",    icon: Phone,  type: "tel" },
                                    { label: "Location",     key: "location", icon: MapPin, type: "text" },
                                ].map(({ label, key, icon: Icon, type }) => (
                                    <div key={key}>
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block flex items-center gap-1.5">
                                            <Icon className="w-3 h-3" /> {label}
                                        </label>
                                        <input
                                            type={type}
                                            value={form[key as keyof typeof form]}
                                            onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 focus:outline-none focus:border-[#B91C1C]/30 focus:bg-white transition-all"
                                        />
                                    </div>
                                ))}
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Bio</label>
                                    <textarea
                                        value={form.bio}
                                        onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 focus:outline-none focus:border-[#B91C1C]/30 focus:bg-white transition-all resize-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Stats ──────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={FileText}    label={isCitizen ? "My Complaints" : isOfficer ? "In My Dept" : "Total"}   value={stats.total}    color="bg-blue-50 text-blue-600" />
                    <StatCard icon={CheckCircle2} label="Resolved"  value={stats.resolved}  color="bg-emerald-50 text-emerald-600" />
                    <StatCard icon={Clock}        label="Pending"   value={stats.pending}   color="bg-amber-50 text-amber-600" />
                    <StatCard icon={Star}         label="High Priority" value={stats.highPri} color="bg-red-50 text-red-600" />
                </div>

                {/* ── Two-column layout ──────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Notification Preferences */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-7 shadow-sm space-y-5">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <h3 className="font-black text-gray-900">Notification Preferences</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { key: "sms",    label: "SMS Alerts",          desc: "Receive updates via SMS on your phone",     icon: Phone },
                                { key: "email",  label: "Email Digests",        desc: "Daily / weekly summary via email",          icon: Mail  },
                                { key: "inApp",  label: "In-App Notifications", desc: "Popup alerts while using the platform",     icon: Bell  },
                                { key: "urgent", label: "Urgent Only",          desc: "Only high-priority & escalated complaints", icon: Star  },
                            ].map(({ key, label, desc, icon: Icon }) => (
                                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                                            <Icon className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-800">{label}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setNotifSettings(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                                        className={`w-12 h-6 rounded-full flex items-center transition-all px-1 ${notifSettings[key as keyof typeof notifSettings] ? "bg-[#B91C1C] justify-end" : "bg-gray-200 justify-start"}`}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="space-y-4">
                        {/* Security */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" />
                                <h4 className="font-black text-gray-900 text-sm">Security</h4>
                            </div>

                            <button onClick={() => setShowPwdPanel(!showPwdPanel)}
                                className="w-full flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 transition-all">
                                <span className="text-xs font-black text-gray-700">Change Password</span>
                                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showPwdPanel ? "rotate-90" : ""}`} />
                            </button>

                            {showPwdPanel && (
                                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    {["Current Password", "New Password", "Confirm New"].map(lbl => (
                                        <div key={lbl}>
                                            <label className="text-[9px] font-black uppercase text-gray-400 mb-1 block">{lbl}</label>
                                            <div className="relative">
                                                <input type={showPwd ? "text" : "password"}
                                                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#B91C1C]/30" />
                                                <button onClick={() => setShowPwd(!showPwd)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600">
                                                    {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => { setShowPwdPanel(false); toast_("✅ Password updated"); }}
                                        className="w-full py-2.5 bg-[#B91C1C] text-white rounded-xl text-xs font-black hover:bg-red-800 transition-all">
                                        Update Password
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                                <Settings className="w-4 h-4 text-gray-400" />
                                <h4 className="font-black text-gray-900 text-sm">Quick Links</h4>
                            </div>
                            {[
                                { icon: FileText, label: "My Complaints",  path: isCitizen ? "/citizen" : "/grievances" },
                                { icon: Globe,    label: "Dashboard",      path: "/dashboard" },
                                { icon: Settings, label: "App Settings",   path: "/settings" },
                            ].map(({ icon: Icon, label, path }) => (
                                <button key={path} onClick={() => navigate(path)}
                                    className="w-full flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 transition-all">
                                    <div className="flex items-center gap-2.5">
                                        <Icon className="w-4 h-4 text-gray-500" />
                                        <span className="text-xs font-black text-gray-700">{label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </button>
                            ))}
                        </div>

                        {/* Logout */}
                        <button onClick={doLogout}
                            className="w-full flex items-center justify-center gap-2.5 py-4 bg-red-50 border border-red-100 text-[#B91C1C] rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-[#B91C1C] hover:text-white transition-all shadow-sm">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
