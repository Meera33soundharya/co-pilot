import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import {
    Users, Search, Phone, MessageSquare, Mail,
    ChevronRight, Star, UserCheck, UserX, HelpCircle,
    Send, Copy, CheckCircle2, Filter, Download,
    TrendingUp, Zap, Radio, PlusCircle
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type SupportStatus = "Strong" | "Soft" | "Undecided" | "Opponent";

interface Voter {
    id: string;
    name: string;
    ward: string;
    phone: string;
    age: number;
    support: SupportStatus;
    lastContact: string;
    tags: string[];
}

interface Campaign {
    id: string;
    name: string;
    ward: string;
    status: "Draft" | "Active" | "Complete";
    reach: number;
    target: number;
    type: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const VOTERS: Voter[] = [
    { id: "V001", name: "Meera Sundaram", ward: "Ward 01", phone: "+91 98400 11234", age: 42, support: "Strong", lastContact: "2 days ago", tags: ["Women Leader", "Volunteer"] },
    { id: "V002", name: "Rajan Pillai", ward: "Ward 03", phone: "+91 99400 22345", age: 58, support: "Soft", lastContact: "1 week ago", tags: ["Senior", "Pensioner"] },
    { id: "V003", name: "Vijay Kumar", ward: "Ward 06", phone: "+91 94440 33456", age: 29, support: "Undecided", lastContact: "3 weeks ago", tags: ["Youth", "Student"] },
    { id: "V004", name: "Anitha Krishnan", ward: "Ward 02", phone: "+91 90000 44567", age: 35, support: "Strong", lastContact: "Yesterday", tags: ["Teacher", "Community"] },
    { id: "V005", name: "Selvakumar R", ward: "Ward 04", phone: "+91 88000 55678", age: 47, support: "Opponent", lastContact: "1 month ago", tags: ["Businessman"] },
    { id: "V006", name: "Priya Nair", ward: "Ward 07", phone: "+91 77000 66789", age: 31, support: "Soft", lastContact: "5 days ago", tags: ["Youth", "Volunteer"] },
    { id: "V007", name: "Karunakaran S", ward: "Ward 09", phone: "+91 66000 77890", age: 63, support: "Strong", lastContact: "3 days ago", tags: ["Senior", "Activist"] },
    { id: "V008", name: "Lakshmi Devi", ward: "Ward 10", phone: "+91 55000 88901", age: 38, support: "Undecided", lastContact: "2 weeks ago", tags: ["Homemaker"] },
];

const CAMPAIGNS: Campaign[] = [
    { id: "C001", name: "Ward 06 Youth Outreach", ward: "Ward 06", status: "Active", reach: 1240, target: 2000, type: "WhatsApp" },
    { id: "C002", name: "Senior Citizens Meet", ward: "Ward 03", status: "Complete", reach: 890, target: 900, type: "SMS" },
    { id: "C003", name: "Women Empowerment Rally", ward: "All Wards", status: "Draft", reach: 0, target: 5000, type: "Multi-channel" },
    { id: "C004", name: "Water Crisis Resolution Drive", ward: "Ward 04", status: "Active", reach: 560, target: 1200, type: "Door-to-Door" },
];

const SMS_TEMPLATES = [
    {
        title: "Event Invitation",
        lang: "Tamil + English",
        text: "அன்பான நண்பரே, நாளை காலை 10 மணிக்கு [VENUE] நடைபெறும் நம் சந்திப்பில் கலந்துகொள்ளுங்கள். உங்கள் வருகை எங்களுக்கு மிகவும் மதிப்பானது. - செல்வம் அவர்கள் | Dear friend, please join us tomorrow at 10 AM at [VENUE]. Your presence matters. - Selvam"
    },
    {
        title: "Complaint Resolution Update",
        lang: "Tamil",
        text: "வணக்கம்! உங்கள் புகார் [TICKET_ID] தீர்க்கப்பட்டுள்ளது. தொடர்ந்த நம்பிக்கைக்கு நன்றி. - செல்வம் மாவட்ட ஆட்சி"
    },
    {
        title: "Election Campaign",
        lang: "English",
        text: "Dear resident of [WARD], your vote on [DATE] can transform our constituency. Together we have resolved [N] complaints this year. Vote for progress. - Selvam"
    },
    {
        title: "Emergency Alert",
        lang: "Tamil + English",
        text: "அவசர அறிவிப்பு | Emergency: [ISSUE] affecting [WARD]. Our team is on-site. For help call: 1800-XXX-XXXX. Stay safe."
    },
];

const WARD_SENTIMENT = [
    { ward: "Ward 01", sentiment: 82, color: "bg-emerald-500" },
    { ward: "Ward 02", sentiment: 68, color: "bg-emerald-400" },
    { ward: "Ward 03", sentiment: 74, color: "bg-emerald-500" },
    { ward: "Ward 04", sentiment: 41, color: "bg-red-400" },
    { ward: "Ward 05", sentiment: 65, color: "bg-amber-400" },
    { ward: "Ward 06", sentiment: 38, color: "bg-red-500" },
    { ward: "Ward 07", sentiment: 79, color: "bg-emerald-500" },
    { ward: "Ward 08", sentiment: 54, color: "bg-amber-400" },
    { ward: "Ward 09", sentiment: 88, color: "bg-emerald-600" },
    { ward: "Ward 10", sentiment: 44, color: "bg-red-400" },
];

const SUPPORT_CONFIG: Record<SupportStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    Strong: { label: "Strong", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: Star },
    Soft: { label: "Soft Support", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: UserCheck },
    Undecided: { label: "Undecided", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: HelpCircle },
    Opponent: { label: "Opponent", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: UserX },
};

export default function VoterCRM() {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<SupportStatus | "All">("All");
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"contacts" | "campaigns" | "templates">("contacts");

    const filtered = VOTERS.filter(v => {
        const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.ward.toLowerCase().includes(search.toLowerCase()) ||
            v.phone.includes(search);
        const matchStatus = filterStatus === "All" || v.support === filterStatus;
        return matchSearch && matchStatus;
    });

    function copyTemplate(idx: number, text: string) {
        navigator.clipboard.writeText(text).catch(() => { });
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    }

    const strongCount = VOTERS.filter(v => v.support === "Strong").length;
    const softCount = VOTERS.filter(v => v.support === "Soft").length;
    const undecidedCount = VOTERS.filter(v => v.support === "Undecided").length;
    const opponentCount = VOTERS.filter(v => v.support === "Opponent").length;

    return (
        <DashboardLayout title="Voter CRM" subtitle="Constituency contact management, outreach campaigns & sentiment mapping">
            <div className="space-y-6">

                {/* ── Summary Stats ─────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: "Strong Supporters", value: strongCount, pct: `${Math.round(strongCount / VOTERS.length * 100)}%`, color: "text-emerald-600", bg: "bg-emerald-50", icon: Star },
                        { label: "Soft Support", value: softCount, pct: `${Math.round(softCount / VOTERS.length * 100)}%`, color: "text-blue-600", bg: "bg-blue-50", icon: UserCheck },
                        { label: "Undecided", value: undecidedCount, pct: `${Math.round(undecidedCount / VOTERS.length * 100)}%`, color: "text-amber-600", bg: "bg-amber-50", icon: HelpCircle },
                        { label: "Opposition", value: opponentCount, pct: `${Math.round(opponentCount / VOTERS.length * 100)}%`, color: "text-red-600", bg: "bg-red-50", icon: UserX },
                    ].map(kpi => {
                        const Icon = kpi.icon;
                        return (
                            <div key={kpi.label} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 ${kpi.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-5 h-5 ${kpi.color}`} />
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${kpi.bg} ${kpi.color} uppercase`}>{kpi.pct}</span>
                                </div>
                                <p className="text-4xl font-black text-gray-900 mb-1">{kpi.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{kpi.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* ── Tabs ──────────────────────────────────────────────── */}
                <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit shadow-sm">
                    {(["contacts", "campaigns", "templates"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-700"}`}>
                            {tab === "contacts" ? "Contacts" : tab === "campaigns" ? "Campaigns" : "Templates"}
                        </button>
                    ))}
                </div>

                {/* ─── CONTACTS TAB ─────────────────────────────────────── */}
                {activeTab === "contacts" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Contact List */}
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                            {/* Search + Filter */}
                            <div className="p-6 border-b border-gray-50 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input value={search} onChange={e => setSearch(e.target.value)}
                                            placeholder="Search name, ward or phone…"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-gray-200 focus:outline-none transition-all" />
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:bg-gray-50 transition-all">
                                        <Download className="w-4 h-4" /> Export
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                                    {(["All", "Strong", "Soft", "Undecided", "Opponent"] as const).map(s => (
                                        <button key={s} onClick={() => setFilterStatus(s)}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${filterStatus === s ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-400 hover:border-gray-400"}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="divide-y divide-gray-50">
                                {filtered.map(v => {
                                    const cfg = SUPPORT_CONFIG[v.support];
                                    const Icon = cfg.icon;
                                    return (
                                        <div key={v.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-all group cursor-pointer">
                                            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shrink-0 group-hover:bg-[#B91C1C] group-hover:text-white transition-all">
                                                {v.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-black text-gray-900">{v.name}</p>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-lg border uppercase flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                                                        <Icon className="w-3 h-3" /> {cfg.label}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium">{v.ward} · Age {v.age} · {v.lastContact}</p>
                                                <div className="flex gap-1 mt-1">
                                                    {v.tags.map(t => (
                                                        <span key={t} className="text-[8px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-700 transition-all">
                                                    <Phone className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-blue-100 hover:text-blue-700 transition-all">
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </button>
                                                <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{filtered.length} of {VOTERS.length} contacts shown</p>
                                <button className="flex items-center gap-2 text-[9px] font-black text-[#B91C1C] uppercase tracking-widest hover:underline">
                                    <PlusCircle className="w-4 h-4" /> Add Contact
                                </button>
                            </div>
                        </div>

                        {/* Ward Sentiment Heatmap */}
                        <div className="space-y-5">
                            <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-2xl">
                                <div className="flex items-center gap-2 mb-5">
                                    <TrendingUp className="w-4 h-4 text-white/40" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Ward Sentiment Map</h3>
                                </div>
                                <div className="space-y-3">
                                    {WARD_SENTIMENT.map(w => (
                                        <div key={w.ward}>
                                            <div className="flex justify-between mb-1 text-[9px] font-black">
                                                <span className="text-white/60">{w.ward}</span>
                                                <span className={`${w.sentiment >= 70 ? "text-emerald-400" : w.sentiment >= 50 ? "text-amber-400" : "text-red-400"}`}>
                                                    {w.sentiment}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-700 ${w.color}`} style={{ width: `${w.sentiment}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-4 text-[9px] font-black text-white/30 uppercase">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 70%+</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 50-70%</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> &lt;50%</span>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Zap className="w-4 h-4 text-[#B91C1C]" />
                                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Quick Outreach</h3>
                                </div>
                                {[
                                    { label: "SMS All Undecided", icon: MessageSquare, count: `${undecidedCount} contacts` },
                                    { label: "WhatsApp Strong Base", icon: Send, count: `${strongCount} contacts` },
                                    { label: "Email Campaign", icon: Mail, count: "All contacts" },
                                ].map(a => (
                                    <button key={a.label} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-2xl transition-all text-left group mb-1">
                                        <div className="p-2 bg-gray-50 group-hover:bg-[#B91C1C] rounded-xl transition-all">
                                            <a.icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-all" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900">{a.label}</p>
                                            <p className="text-[9px] text-gray-400 font-bold">{a.count}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── CAMPAIGNS TAB ────────────────────────────────────── */}
                {activeTab === "campaigns" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{CAMPAIGNS.length} Active Campaigns</h3>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#B91C1C] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg shadow-red-200">
                                <PlusCircle className="w-4 h-4" /> New Campaign
                            </button>
                        </div>
                        {CAMPAIGNS.map(c => (
                            <div key={c.id} className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <Radio className="w-4 h-4 text-[#B91C1C]" />
                                            <h3 className="text-sm font-black text-gray-900">{c.name}</h3>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${c.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : c.status === "Complete" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{c.ward} · {c.type}</p>
                                    </div>
                                    <button className="flex items-center gap-1.5 text-[9px] font-black text-[#B91C1C] uppercase tracking-widest hover:underline shrink-0">
                                        View Details <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase">{c.reach.toLocaleString()} reached of {c.target.toLocaleString()} target</span>
                                    <span className="text-[9px] font-black text-gray-900">{c.target > 0 ? Math.round(c.reach / c.target * 100) : 0}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-700 ${c.status === "Complete" ? "bg-blue-500" : "bg-[#B91C1C]"}`}
                                        style={{ width: `${c.target > 0 ? Math.round(c.reach / c.target * 100) : 0}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── TEMPLATES TAB ────────────────────────────────────── */}
                {activeTab === "templates" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {SMS_TEMPLATES.map((t, i) => (
                            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 mb-1">{t.title}</h3>
                                        <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">{t.lang}</span>
                                    </div>
                                    <button
                                        onClick={() => copyTemplate(i, t.text)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${copiedIdx === i ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                        {copiedIdx === i ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                    </button>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-5">
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{t.text}</p>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#B91C1C] transition-all">
                                        <Send className="w-3.5 h-3.5" /> Send Bulk SMS
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-7 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#B91C1C]/40 hover:bg-red-50/30 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-[#B91C1C]/10 flex items-center justify-center transition-all">
                                <PlusCircle className="w-6 h-6 text-gray-400 group-hover:text-[#B91C1C] transition-all" />
                            </div>
                            <p className="text-xs font-black text-gray-400 group-hover:text-[#B91C1C] uppercase tracking-widest transition-all">Create New Template</p>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
