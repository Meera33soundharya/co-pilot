import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
    Users, Building2, Search,
    Phone, MapPin,
    ChevronRight, Star
} from "lucide-react";

const OFFICERS = [
    { id: "OF-001", name: "Mr. Rajesh Kumar",   dept: "Water Supply Department",   ward: "Ward 1–3",  resolved: 42, pending: 3,  rating: 4.8, status: "Active"   },
    { id: "OF-002", name: "Ms. Priya Sharma",   dept: "Roads & PWD",               ward: "Ward 4–6",  resolved: 38, pending: 5,  rating: 4.6, status: "Active"   },
    { id: "OF-003", name: "Mr. Suresh Naidu",   dept: "Electricity Board",         ward: "Ward 7–9",  resolved: 29, pending: 7,  rating: 4.3, status: "Active"   },
    { id: "OF-004", name: "Ms. Anitha Rao",     dept: "Sanitation Department",     ward: "Ward 10–12",resolved: 55, pending: 2,  rating: 4.9, status: "Active"   },
    { id: "OF-005", name: "Mr. Vikram Singh",   dept: "Public Health",             ward: "Ward 5–7",  resolved: 17, pending: 9,  rating: 3.9, status: "On Leave" },
    { id: "OF-006", name: "Ms. Rekha Jain",     dept: "Drainage & Sewerage",       ward: "Ward 2–4",  resolved: 33, pending: 4,  rating: 4.5, status: "Active"   },
];

const CITIZENS = [
    { id: "CT-001", name: "Meera Soundarya",   ward: "Ward 5",  complaints: 3, resolved: 2, phone: "+91 99887 12345" },
    { id: "CT-002", name: "Ravi Shankar",       ward: "Ward 7",  complaints: 1, resolved: 1, phone: "+91 98765 43210" },
    { id: "CT-003", name: "Kavitha Devi",       ward: "Ward 3",  complaints: 5, resolved: 3, phone: "+91 88001 22334" },
    { id: "CT-004", name: "Arun Kumar",         ward: "Ward 11", complaints: 2, resolved: 2, phone: "+91 77665 55443" },
    { id: "CT-005", name: "Sunita Reddy",       ward: "Ward 2",  complaints: 4, resolved: 1, phone: "+91 99001 87654" },
    { id: "CT-006", name: "Mohammed Farooq",    ward: "Ward 9",  complaints: 1, resolved: 0, phone: "+91 91234 56789" },
    { id: "CT-007", name: "Lakshmi Narayan",    ward: "Ward 6",  complaints: 3, resolved: 3, phone: "+91 80123 45678" },
    { id: "CT-008", name: "Preethi Menon",      ward: "Ward 1",  complaints: 2, resolved: 1, phone: "+91 70011 22334" },
];

export default function PeopleManagement() {
    const [tab, setTab] = useState<"officers" | "citizens">("officers");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string | null>(null);

    const filteredOfficers = OFFICERS.filter(o =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.dept.toLowerCase().includes(search.toLowerCase()) ||
        o.ward.toLowerCase().includes(search.toLowerCase())
    );
    const filteredCitizens = CITIZENS.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.ward.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOfficer = OFFICERS.find(o => o.id === selected);
    const selectedCitizen = CITIZENS.find(c => c.id === selected);

    return (
        <DashboardLayout
            title="People Management"
            subtitle="Manage officers and citizens across all wards"
        >
            <div className="space-y-6">

                {/* Tabs */}
                <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit shadow-sm">
                    {(["officers", "citizens"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setSearch(""); setSelected(null); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all capitalize ${
                                tab === t
                                    ? "bg-[#B91C1C] text-white shadow-lg shadow-red-200"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {t === "officers" ? <Building2 className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                            {t}
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                                tab === t ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                            }`}>
                                {t === "officers" ? OFFICERS.length : CITIZENS.length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={tab === "officers" ? "Search officers, departments, wards..." : "Search citizens, wards..."}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-[#B91C1C]/30 text-gray-700 placeholder:text-gray-300 shadow-sm"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* List */}
                    <div className="lg:col-span-2 space-y-3">
                        {tab === "officers" && (
                            filteredOfficers.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
                                    <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-sm font-black text-gray-400">No officers found</p>
                                </div>
                            ) : filteredOfficers.map(o => (
                                <div
                                    key={o.id}
                                    onClick={() => setSelected(selected === o.id ? null : o.id)}
                                    className={`bg-white rounded-3xl border shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
                                        selected === o.id ? "border-[#B91C1C] ring-1 ring-red-100" : "border-gray-100"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 font-black text-lg shrink-0">
                                            {o.name.split(" ").pop()?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h4 className="text-sm font-black text-gray-900">{o.name}</h4>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                                    o.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                                }`}>{o.status}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold flex-wrap">
                                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{o.dept}</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{o.ward}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                <span className="text-xs font-black text-gray-700">{o.rating}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-400">{o.resolved} resolved</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${selected === o.id ? "rotate-90" : ""}`} />
                                    </div>
                                </div>
                            ))
                        )}

                        {tab === "citizens" && (
                            filteredCitizens.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
                                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-sm font-black text-gray-400">No citizens found</p>
                                </div>
                            ) : filteredCitizens.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => setSelected(selected === c.id ? null : c.id)}
                                    className={`bg-white rounded-3xl border shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
                                        selected === c.id ? "border-[#B91C1C] ring-1 ring-red-100" : "border-gray-100"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-black text-lg shrink-0">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-black text-gray-900 mb-1">{c.name}</h4>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold flex-wrap">
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.ward}</span>
                                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className="text-xs font-black text-gray-700">{c.complaints} complaints</span>
                                            <span className="text-[10px] text-emerald-600">{c.resolved} resolved</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${selected === c.id ? "rotate-90" : ""}`} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Detail Panel */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm flex flex-col min-h-64">
                        {(selectedOfficer && tab === "officers") ? (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-black text-2xl mx-auto mb-3">
                                        {selectedOfficer.name.split(" ").pop()?.charAt(0)}
                                    </div>
                                    <h3 className="text-base font-black text-gray-900">{selectedOfficer.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-medium mt-1">{selectedOfficer.dept}</p>
                                    <span className={`mt-2 inline-block text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                                        selectedOfficer.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                    }`}>{selectedOfficer.status}</span>
                                </div>
                                <div className="space-y-3 flex-1">
                                    {[
                                        { label: "Assigned Ward(s)", value: selectedOfficer.ward },
                                        { label: "Total Resolved", value: String(selectedOfficer.resolved), color: "text-emerald-600" },
                                        { label: "Currently Pending", value: String(selectedOfficer.pending), color: "text-amber-600" },
                                    ].map(item => (
                                        <div key={item.label} className="flex justify-between items-center py-3 border-b border-gray-50">
                                            <span className="text-xs font-bold text-gray-500">{item.label}</span>
                                            <span className={`text-sm font-black ${item.color ?? "text-gray-900"}`}>{item.value}</span>
                                        </div>
                                    ))}
                                    <div className="py-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-500">Citizen Rating</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                <span className="text-sm font-black text-gray-900">{selectedOfficer.rating}</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(selectedOfficer.rating / 5) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (selectedCitizen && tab === "citizens") ? (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-black text-2xl mx-auto mb-3">
                                        {selectedCitizen.name.charAt(0)}
                                    </div>
                                    <h3 className="text-base font-black text-gray-900">{selectedCitizen.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-medium mt-1">{selectedCitizen.ward}</p>
                                </div>
                                <div className="space-y-3 flex-1">
                                    {[
                                        { label: "Phone", value: selectedCitizen.phone },
                                        { label: "Total Complaints", value: String(selectedCitizen.complaints) },
                                        { label: "Resolved",         value: String(selectedCitizen.resolved),   color: "text-emerald-600" },
                                        { label: "Pending",          value: String(selectedCitizen.complaints - selectedCitizen.resolved), color: "text-amber-600" },
                                    ].map(item => (
                                        <div key={item.label} className="flex justify-between items-center py-3 border-b border-gray-50">
                                            <span className="text-xs font-bold text-gray-500">{item.label}</span>
                                            <span className={`text-sm font-black ${item.color ?? "text-gray-900"}`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="p-4 bg-gray-50 rounded-3xl mb-4">
                                    {tab === "officers" ? <Building2 className="w-8 h-8 text-gray-200" /> : <Users className="w-8 h-8 text-gray-200" />}
                                </div>
                                <p className="text-sm font-black text-gray-400 mb-2">
                                    Select a{tab === "officers" ? "n Officer" : " Citizen"}
                                </p>
                                <p className="text-xs text-gray-300">Click any row to view details</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Row (Officers) */}
                {tab === "officers" && (
                    <div className="bg-gray-900 rounded-3xl p-7 shadow-2xl text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 blur-[60px] pointer-events-none" />
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-5">Department Performance Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                                {OFFICERS.map(o => (
                                    <div key={o.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-7 h-7 bg-white/10 rounded-xl flex items-center justify-center text-xs font-black">
                                                {o.name.split(" ").pop()?.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-white truncate">{o.name.split(" ").pop()}</p>
                                                <p className="text-[8px] text-white/30 truncate">{o.dept.split(" ")[0]}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-lg font-black text-white">{o.resolved}</p>
                                                <p className="text-[8px] text-white/30">resolved</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                <span className="text-xs font-black text-white">{o.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
