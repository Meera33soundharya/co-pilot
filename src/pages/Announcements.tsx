import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import type { AnnouncementType } from "@/context/ComplaintsContext";
import {
    Megaphone, Plus, X, Calendar, MapPin, Bell,
    CheckCircle2, AlertTriangle, Info, ChevronDown,
    Search, Filter, Loader2, Send, Trash2, Zap,
    Radio, Users, TrendingUp,
    RotateCcw
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const TYPE_CFG: Record<AnnouncementType, {
    color: string; bg: string; border: string; icon: any;
    labelKey: string; gradient: string;
}> = {
    Alert: {
        color: "text-red-600", bg: "bg-red-50", border: "border-red-200",
        icon: AlertTriangle, labelKey: "announcements.type.Alert",
        gradient: "from-red-500 to-rose-600",
    },
    Resolution: {
        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
        icon: CheckCircle2, labelKey: "announcements.type.Resolution",
        gradient: "from-emerald-500 to-teal-600",
    },
    Event: {
        color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200",
        icon: Calendar, labelKey: "announcements.type.Event",
        gradient: "from-blue-500 to-indigo-600",
    },
    General: {
        color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200",
        icon: Info, labelKey: "announcements.type.General",
        gradient: "from-gray-500 to-slate-600",
    },
};

const AUTO_TYPE_KEYWORDS: { type: AnnouncementType; words: string[] }[] = [
    { type: "Alert", words: ["issue", "disruption", "warning", "delay", "urgent", "broken", "leak", "cut", "no water", "danger", "alert"] },
    { type: "Resolution", words: ["completed", "resolved", "fixed", "restored", "successful", "done", "repair"] },
    { type: "Event", words: ["camp", "drive", "meeting", "celebration", "festival", "visit", "held", "schedule"] },
];

function autoType(text: string): AnnouncementType {
    const lower = text.toLowerCase();
    for (const { type, words } of AUTO_TYPE_KEYWORDS) {
        if (words.some(w => lower.includes(w))) return type;
    }
    return "General";
}

// Safe getter � prevents crash when language key is missing
function safeText(obj: any, lang: "en" | "ta"): string {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return (obj[lang] ?? obj.en ?? obj.ta ?? "") || "";
}

export default function Announcements() {
    const { currentUser, announcements, postAnnouncement, deleteAnnouncement, resetAnnouncements } = useComplaints();
    const { t, language } = useLanguage();
    const role = currentUser?.role ?? "admin";
    const canManage = role === "admin" || role === "officer";

    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<AnnouncementType | "All">("All");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [posting, setPosting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [newAnn, setNewAnn] = useState({ title: "", body: "", type: "General" as AnnouncementType, ward: "All Wards" });
    const [manualType, setManualType] = useState(false);

    useEffect(() => {
        if (!manualType && (newAnn.title || newAnn.body)) {
            const suggested = autoType(`${newAnn.title} ${newAnn.body}`);
            if (suggested !== newAnn.type) setNewAnn(p => ({ ...p, type: suggested }));
        }
    }, [newAnn.title, newAnn.body, manualType, newAnn.type]);

    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            setExpanded(id);
            setTimeout(() => {
                const el = document.getElementById(`ann-${id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 200);
        }
    }, [searchParams]);

    const filtered = announcements
        .filter(a => filter === "All" || a.type === filter)
        .filter(a => {
            const title = safeText(a.title, language).toLowerCase();
            const body = safeText(a.body, language).toLowerCase();
            const ward = (a.ward ?? "").toLowerCase();
            const q = search.toLowerCase();
            return title.includes(q) || body.includes(q) || ward.includes(q);
        })
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    const pinnedCount = filtered.filter(a => a.pinned).length;
    const countByType = (type: AnnouncementType) => announcements.filter(a => a.type === type).length;

    function handlePost() {
        if (!newAnn.title || !newAnn.body) return;
        setPosting(true);
        setTimeout(() => {
            postAnnouncement({
                title: { en: newAnn.title, ta: newAnn.title },
                body: { en: newAnn.body, ta: newAnn.body },
                type: newAnn.type,
                ward: newAnn.ward
            });
            setNewAnn({ title: "", body: "", type: "General", ward: "All Wards" });
            setManualType(false);
            setShowForm(false);
            setPosting(false);
        }, 800);
    }

    return (
        <DashboardLayout
            title={t("announcements.title", "Announcements")}
            subtitle={canManage
                ? t("announcements.postAndManage", "Post and manage official ward announcements")
                : t("announcements.stayUpdated", "Stay updated with official government notices")}
            actions={canManage ? (
                <div className="flex items-center gap-3">
                    <button
                        onClick={resetAnnouncements}
                        title="Restore original 5 seed announcements"
                        className="flex items-center gap-2 px-3.5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-2xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                        Restore Defaults
                    </button>
                    {announcements.length > 0 && (
                        <button
                            onClick={() => announcements.forEach(a => deleteAnnouncement(a.id))}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white text-red-500 border border-red-100 rounded-2xl text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t("announcements.deleteAll", "Clear All")}
                        </button>
                    )}
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B91C1C] to-rose-600 text-white rounded-2xl text-sm font-bold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-200 hover:-translate-y-0.5 duration-200"
                    >
                        <Plus className="w-4 h-4" />
                        {t("announcements.new", "New Announcement")}
                    </button>
                </div>
            ) : undefined}
        >
            <div className="space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Total", value: announcements.length, icon: Megaphone, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100" },
                        { label: "Alerts", value: countByType("Alert"), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
                        { label: "Resolved", value: countByType("Resolution"), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                        { label: "Events", value: countByType("Event"), icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
                    ].map(stat => (
                        <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-4 flex items-center gap-3`}>
                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
                                <p className={`text-xs font-bold ${stat.color} uppercase tracking-wider mt-0.5`}>{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live pinned banner */}
                {pinnedCount > 0 && (
                    <div className="relative overflow-hidden bg-gradient-to-r from-[#B91C1C] to-rose-600 text-white rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-lg shadow-red-200">
                        <div className="absolute inset-0 bg-white/5" />
                        <Radio className="w-4 h-4 animate-pulse relative" />
                        <span className="text-sm font-black uppercase tracking-widest relative">Live</span>
                        <div className="w-px h-5 bg-white/30" />
                        <span className="relative text-sm font-bold">
                            {pinnedCount} pinned {pinnedCount > 1 ? "alerts" : "alert"} active
                        </span>
                        <Bell className="w-4 h-4 ml-auto animate-bounce relative" />
                    </div>
                )}

                {/* Search + Filter */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder={t("announcements.searchPlaceholder", "Search announcements, wards...")}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C]/30 text-gray-700 placeholder:text-gray-300 shadow-sm transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        {(["All", "Alert", "Resolution", "Event", "General"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all duration-200 ${filter === f
                                    ? "bg-gradient-to-r from-[#B91C1C] to-rose-600 text-white shadow-md shadow-red-200 scale-105"
                                    : "bg-white border border-gray-100 text-gray-400 hover:text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {f === "All" ? t("common.all", "All") : t(`announcements.type.${f}`, f)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cards */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Megaphone className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-base font-black text-gray-300 uppercase tracking-widest">
                            {search ? "No results found" : t("announcements.noAnnouncements", "No announcements yet")}
                        </p>
                        {canManage && !search && (
                            <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                                <button
                                    onClick={resetAnnouncements}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition-all"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 text-gray-500" /> Restore 5 Defaults
                                </button>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B91C1C] to-rose-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-100 hover:-translate-y-0.5 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> Post First Announcement
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((ann, idx) => {
                            const cfg = TYPE_CFG[ann.type] ?? TYPE_CFG.General;
                            const Icon = cfg.icon;
                            const isOpen = expanded === ann.id;
                            const title = safeText(ann.title, language);
                            const body = safeText(ann.body, language);

                            return (
                                <div
                                    key={ann.id}
                                    id={`ann-${ann.id}`}
                                    style={{ animationDelay: `${idx * 40}ms` }}
                                    className={`group bg-white rounded-3xl border transition-all duration-300 overflow-hidden
                                        ${ann.pinned ? "border-red-200 ring-1 ring-red-100 shadow-md shadow-red-50" : "border-gray-100 shadow-sm"}
                                        ${isOpen ? "shadow-xl border-gray-200" : "hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5"}
                                    `}
                                >
                                    {/* Gradient accent bar */}
                                    <div className={`h-1 w-full bg-gradient-to-r ${cfg.gradient}`} />

                                    <div onClick={() => setExpanded(isOpen ? null : ann.id)} className="p-5 flex items-start gap-4 cursor-pointer">
                                        {/* Gradient icon */}
                                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                {ann.pinned && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-gradient-to-r from-[#B91C1C] to-rose-600 text-white rounded-full">
                                                        ?? Pinned
                                                    </span>
                                                )}
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                    {t(cfg.labelKey, ann.type)}
                                                </span>
                                                <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {ann.ward}
                                                </span>
                                                <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {ann.date}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-black text-gray-900 group-hover:text-[#B91C1C] transition-colors leading-tight">
                                                {title}
                                            </h4>
                                            {!isOpen && body && (
                                                <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">{body}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {canManage && (
                                                <button
                                                    onClick={e => { e.stopPropagation(); setDeleteConfirm(ann.id); }}
                                                    className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <div className={`p-2 rounded-xl transition-all duration-300 ${isOpen ? "rotate-180 bg-gray-50" : ""}`}>
                                                <ChevronDown className="w-4 h-4 text-gray-300" />
                                            </div>
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="px-5 pb-5 pt-0">
                                            <div className="ml-[60px] border-l-2 border-gray-100 pl-4">
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium mb-4">{body}</p>
                                                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                                                    <div className="w-7 h-7 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500">
                                                        {(ann.postedBy || "A").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-gray-600">{ann.postedBy}</p>
                                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{ann.date}</p>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-1.5">
                                                        <Users className="w-3 h-3 text-gray-300" />
                                                        <span className="text-xs text-gray-300 font-medium">{ann.ward}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm z-10" onClick={e => e.stopPropagation()}>
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 text-center mb-1">Delete Announcement?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6 font-medium">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-gray-50 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all">Cancel</button>
                            <button onClick={() => { deleteAnnouncement(deleteConfirm!); setDeleteConfirm(null); }} className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl text-sm font-bold shadow-md shadow-red-200 hover:from-red-600 hover:to-rose-700 transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-[#B91C1C] to-rose-600 px-7 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Megaphone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white">{t("announcements.new", "New Announcement")}</h3>
                                    <p className="text-xs text-red-200 font-medium">Broadcasts instantly to all portals</p>
                                </div>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-7 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t("announcements.newTitle", "Title")} <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    value={newAnn.title}
                                    onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))}
                                    placeholder={t("announcements.newTitlePlaceholder", "e.g. Water Supply Disruption � Ward 5")}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C]/30 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t("announcements.newType", "Type")}</label>
                                    <div className="relative">
                                        <select
                                            value={newAnn.type}
                                            onChange={e => { setNewAnn(p => ({ ...p, type: e.target.value as AnnouncementType })); setManualType(true); }}
                                            className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 transition-all cursor-pointer pr-8"
                                        >
                                            {(["General", "Alert", "Resolution", "Event"] as AnnouncementType[]).map(type => (
                                                <option key={type} value={type}>{t(`announcements.type.${type}`, type)}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                    {!manualType && (newAnn.title || newAnn.body) && (
                                        <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                            <Zap className="w-2.5 h-2.5 text-amber-400" /> Auto-detected
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t("announcements.newWard", "Ward")}</label>
                                    <div className="relative">
                                        <select
                                            value={newAnn.ward}
                                            onChange={e => setNewAnn(p => ({ ...p, ward: e.target.value }))}
                                            className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 transition-all cursor-pointer pr-8"
                                        >
                                            <option value="All Wards">All Wards</option>
                                            {["Ward 01","Ward 02","Ward 03","Ward 04","Ward 05","Ward 06","Ward 07","Ward 08","Ward 09","Ward 10","Ward 11","Ward 12"].map(w => (
                                                <option key={w} value={w}>{w}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t("announcements.newMessage", "Message")} <span className="text-red-400">*</span></label>
                                <textarea
                                    rows={4}
                                    value={newAnn.body}
                                    onChange={e => setNewAnn(p => ({ ...p, body: e.target.value }))}
                                    placeholder={t("announcements.newMessagePlaceholder", "Write the full announcement here...")}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B91C1C]/20 focus:border-[#B91C1C]/30 focus:bg-white transition-all resize-none"
                                />
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>Broadcasts to citizen portal, officer portal and notifications</span>
                                </div>
                            </div>

                            {newAnn.type && (
                                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${TYPE_CFG[newAnn.type].bg} ${TYPE_CFG[newAnn.type].border}`}>
                                    {(() => { const Ic = TYPE_CFG[newAnn.type].icon; return <Ic className={`w-3.5 h-3.5 ${TYPE_CFG[newAnn.type].color}`} />; })()}
                                    <span className={`text-xs font-black uppercase tracking-wider ${TYPE_CFG[newAnn.type].color}`}>
                                        Tagged as: {newAnn.type}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={handlePost}
                                disabled={posting || !newAnn.title || !newAnn.body}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#B91C1C] to-rose-600 text-white rounded-2xl text-sm font-black hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 duration-200"
                            >
                                {posting
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("announcements.postingBtn", "Broadcasting...")}</>
                                    : <><Send className="w-4 h-4" /> {t("announcements.postBtn", "Post Announcement")}</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
