import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import type { AnnouncementType } from "@/context/ComplaintsContext";
import {
    Megaphone, Plus, X, Calendar, MapPin, Bell,
    CheckCircle2, AlertTriangle, Info, ChevronRight,
    Search, Filter, Loader2, Send
} from "lucide-react";

const TYPE_CFG: Record<AnnouncementType, { color: string; bg: string; border: string; icon: any; label: string }> = {
    Alert: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle, label: "Alert" },
    Resolution: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2, label: "Resolved" },
    Event: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Calendar, label: "Event" },
    General: { color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", icon: Info, label: "Info" },
};

export default function Announcements() {
    const { currentUser, announcements, postAnnouncement } = useComplaints();
    const role = currentUser?.role ?? "admin";
    const isAdmin = role === "admin";

    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<AnnouncementType | "All">("All");
    const [expanded, setExpanded] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [posting, setPosting] = useState(false);
    const [newAnn, setNewAnn] = useState({ title: "", body: "", type: "General" as AnnouncementType, ward: "All Wards" });

    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            setExpanded(id);
            // Also scroll to it if possible
            const el = document.getElementById(`ann-${id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [searchParams]);

    const filtered = announcements
        .filter(a => filter === "All" || a.type === filter)
        .filter(a =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.body.toLowerCase().includes(search.toLowerCase()) ||
            a.ward.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    function handlePost() {
        if (!newAnn.title || !newAnn.body) return;
        setPosting(true);
        setTimeout(() => {
            postAnnouncement({ title: newAnn.title, body: newAnn.body, type: newAnn.type, ward: newAnn.ward });
            setNewAnn({ title: "", body: "", type: "General", ward: "All Wards" });
            setShowForm(false);
            setPosting(false);
        }, 1000);
    }

    return (
        <DashboardLayout
            title="Announcements"
            subtitle={isAdmin ? "Post and manage official ward announcements" : "Stay updated with official government notices"}
            actions={isAdmin ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#B91C1C] text-white rounded-2xl text-xs font-black hover:bg-red-800 transition-all shadow-lg shadow-red-200"
                >
                    <Plus className="w-4 h-4" /> New Announcement
                </button>
            ) : undefined}
        >
            <div className="space-y-6">

                {/* Post Announcement Modal (Admin only) */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg space-y-5 z-10" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-red-50 rounded-xl"><Megaphone className="w-5 h-5 text-[#B91C1C]" /></div>
                                    <h3 className="text-lg font-black text-gray-900">New Announcement</h3>
                                </div>
                                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Title *</label>
                                <input type="text" value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Water Supply Disruption — Ward 5"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#B91C1C]/30 focus:bg-white transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Type</label>
                                    <select value={newAnn.type} onChange={e => setNewAnn(p => ({ ...p, type: e.target.value as AnnouncementType }))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#B91C1C]/30 transition-all">
                                        {(["General", "Alert", "Resolution", "Event"] as AnnouncementType[]).map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ward</label>
                                    <select value={newAnn.ward} onChange={e => setNewAnn(p => ({ ...p, ward: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#B91C1C]/30 transition-all cursor-pointer">
                                        <option value="All Wards">All Wards</option>
                                        {["Ward 01", "Ward 02", "Ward 03", "Ward 04", "Ward 05", "Ward 06", "Ward 07", "Ward 08", "Ward 09", "Ward 10", "Ward 11", "Ward 12"].map(w => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Message *</label>
                                <textarea rows={4} value={newAnn.body} onChange={e => setNewAnn(p => ({ ...p, body: e.target.value }))}
                                    placeholder="Write the full announcement body here..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#B91C1C]/30 focus:bg-white transition-all resize-none" />
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={posting || !newAnn.title || !newAnn.body}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#B91C1C] text-white rounded-2xl text-sm font-black hover:bg-red-800 transition-all shadow-lg shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {posting ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : <><Send className="w-4 h-4" /> Post Announcement</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* Search + Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search announcements, wards..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#B91C1C]/30 text-gray-700 placeholder:text-gray-300 shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        {(["All", "Alert", "Resolution", "Event", "General"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter === f
                                        ? "bg-[#B91C1C] text-white shadow-lg shadow-red-200"
                                        : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"
                                    }`}
                            >{f}</button>
                        ))}
                    </div>
                </div>

                {/* Pinned alert */}
                {filtered.filter(a => a.pinned).length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-2xl">
                        <Bell className="w-3.5 h-3.5 text-[#B91C1C]" />
                        <span className="text-xs font-black text-[#B91C1C] uppercase tracking-widest">
                            {filtered.filter(a => a.pinned).length} Pinned Alert{filtered.filter(a => a.pinned).length > 1 ? "s" : ""}
                        </span>
                    </div>
                )}

                {/* Announcement Cards */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
                        <Megaphone className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-sm font-black text-gray-400">No announcements found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(ann => {
                            const cfg = TYPE_CFG[ann.type];
                            const Icon = cfg.icon;
                            const isOpen = expanded === ann.id;
                            return (
                                <div key={ann.id}
                                    id={`ann-${ann.id}`}
                                    className={`bg-white rounded-3xl border shadow-sm transition-all overflow-hidden ${ann.pinned ? "border-red-200 ring-1 ring-red-100" : "border-gray-100"} ${isOpen ? "shadow-xl" : "hover:shadow-md"}`}>
                                    <div
                                        onClick={() => setExpanded(isOpen ? null : ann.id)}
                                        className="p-6 flex items-start gap-4 cursor-pointer group"
                                    >
                                        <div className={`w-11 h-11 rounded-2xl ${cfg.bg} ${cfg.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                                            <Icon className={`w-5 h-5 ${cfg.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                {ann.pinned && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#B91C1C] text-white rounded-full">📌 Pinned</span>
                                                )}
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                    {cfg.label}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {ann.ward}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {ann.date}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-black text-gray-900 group-hover:text-[#B91C1C] transition-colors">{ann.title}</h4>
                                            {!isOpen && (
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{ann.body}</p>
                                            )}
                                        </div>
                                        <ChevronRight className={`w-5 h-5 text-gray-300 shrink-0 mt-1 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                    </div>

                                    {isOpen && (
                                        <div className="px-6 pb-6 pt-0">
                                            <div className="ml-15 pl-4 border-l-2 border-gray-100">
                                                <p className="text-sm text-gray-700 leading-relaxed mb-4">{ann.body}</p>
                                                <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[8px] font-black text-gray-500">
                                                        {ann.postedBy.charAt(0)}
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        Posted by {ann.postedBy} · {ann.date}
                                                    </span>
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
        </DashboardLayout>
    );
}
