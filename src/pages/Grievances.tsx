import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/dashboard/RecentGrievances";
import { useState } from "react";
import { Search, Filter, Plus, ArrowUpRight, Clock, MessageSquare } from "lucide-react";

const grievances = [
    { id: "GRV-8294", citizen: "Amit Patel", issue: "Severe water leakage - Block C, Sector 7", ward: "Ward 03", priority: "High", status: "In Progress", time: "2h ago", dept: "Water Supply" },
    { id: "GRV-8293", citizen: "Sunita Rao", issue: "Street light failure near DAV School", ward: "Ward 12", priority: "Medium", status: "Open", time: "4h ago", dept: "Electricity" },
    { id: "GRV-8292", citizen: "Vikram Singh", issue: "Pavement damage causing accidents on Main Road", ward: "Ward 06", priority: "High", status: "Open", time: "5h ago", dept: "Roads" },
    { id: "GRV-8291", citizen: "Ananya Iyer", issue: "Garbage collection missed for 3 consecutive days", ward: "Ward 09", priority: "Medium", status: "Resolved", time: "1d ago", dept: "Sanitation" },
    { id: "GRV-8290", citizen: "Karan Mehta", issue: "Drainage blockage after heavy rain", ward: "Ward 03", priority: "High", status: "In Progress", time: "1d ago", dept: "Drainage" },
    { id: "GRV-8289", citizen: "Priya Sharma", issue: "Broken playground equipment in community park", ward: "Ward 07", priority: "Low", status: "Open", time: "2d ago", dept: "Parks" },
    { id: "GRV-8288", citizen: "Rajesh Sharma", issue: "Noisy construction violating night hours", ward: "Ward 11", priority: "Medium", status: "Closed", time: "3d ago", dept: "Enforcement" },
    { id: "GRV-8287", citizen: "Deepika Nair", issue: "Pothole causing damage to vehicles by temple road", ward: "Ward 04", priority: "High", status: "In Progress", time: "3d ago", dept: "Roads" },
    { id: "GRV-8286", citizen: "Mohammed Ali", issue: "Public toilet not cleaned in Ward Office Area", ward: "Ward 02", priority: "Medium", status: "Open", time: "4d ago", dept: "Sanitation" },
    { id: "GRV-8285", citizen: "Suresh Babu", issue: "Illegal encroachment on footpath near market", ward: "Ward 08", priority: "Low", status: "Resolved", time: "5d ago", dept: "Enforcement" },
];

const filterStatuses = ["All", "Open", "In Progress", "Resolved", "Closed"];
const filterPriorities = ["All", "High", "Medium", "Low"];

export default function Grievances() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");

    const filtered = grievances.filter(g => {
        const matchSearch = g.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.citizen.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "All" || g.status === statusFilter;
        const matchPriority = priorityFilter === "All" || g.priority === priorityFilter;
        return matchSearch && matchStatus && matchPriority;
    });

    return (
        <DashboardLayout title="Grievances" subtitle="Citizen complaint tracking & resolution management">
            <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total", value: "2,847", color: "bg-blue-50 text-blue-700 border-blue-100" },
                        { label: "Open", value: "412", color: "bg-amber-50 text-amber-700 border-amber-100" },
                        { label: "In Progress", value: "183", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
                        { label: "Resolved", value: "2,252", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                    ].map(s => (
                        <div key={s.label} className={`flex items-center justify-between p-4 rounded-2xl border ${s.color}`}>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{s.label}</p>
                                <p className="text-2xl font-black mt-0.5">{s.value}</p>
                            </div>
                            <MessageSquare className="w-6 h-6 opacity-30" />
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            type="text"
                            placeholder="Search by ID, citizen name or issue..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                            {filterStatuses.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                            {filterPriorities.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPriorityFilter(p)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${priorityFilter === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => alert('New grievance form coming soon!')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
                            <Plus className="w-3.5 h-3.5" />
                            New
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/70">
                                <tr>
                                    {["Ticket ID", "Citizen", "Issue", "Ward", "Department", "Priority", "Status", "Time", ""].map(h => (
                                        <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 border-b border-gray-100 whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((g) => (
                                    <tr key={g.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4 text-xs font-black text-blue-600">{g.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-[9px] font-black text-white">
                                                    {g.citizen.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-xs font-bold text-gray-900 whitespace-nowrap">{g.citizen}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-600 max-w-[220px] truncate">{g.issue}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{g.ward}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 whitespace-nowrap">{g.dept}</td>
                                        <td className="px-6 py-4"><StatusBadge status={g.priority} /></td>
                                        <td className="px-6 py-4"><StatusBadge status={g.status} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold whitespace-nowrap">
                                                <Clock className="w-3 h-3" />
                                                {g.time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => alert(`Opening grievance ${g.id}: ${g.issue}\nCitizen: ${g.citizen}\nWard: ${g.ward}\nStatus: ${g.status}`)} className="h-8 w-8 rounded-xl bg-gray-50 hover:bg-blue-100 flex items-center justify-center transition-all group-hover:bg-blue-600 group-hover:text-white border border-gray-100">
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Showing {filtered.length} of {grievances.length} records
                        </p>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, "..."].map((p, i) => (
                                <button key={i} className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${p === 1 ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white text-gray-400 border border-gray-100 hover:border-blue-200"}`}>{p}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
