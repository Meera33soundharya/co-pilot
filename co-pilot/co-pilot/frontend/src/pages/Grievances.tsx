import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Status, Priority } from "@/store/complaintsStore";

export default function Grievances() {
    const { complaints } = useComplaints();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"All" | "open" | "in progress" | "resolved" | "closed">("All");

    const getStatusFilter = (f: string): Status[] => {
        if (f === "open") return ["Pending", "Assigned"];
        if (f === "in progress") return ["In Progress"];
        if (f === "resolved") return ["Resolved"];
        if (f === "closed") return ["Closed", "Rejected"];
        return [];
    };

    const filtered = complaints.filter(c => {
        if (search && !c.issue.toLowerCase().includes(search.toLowerCase()) && 
            !c.author.toLowerCase().includes(search.toLowerCase()) &&
            !c.ward.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        if (filter !== "All") {
            const allowedStatuses = getStatusFilter(filter);
            if (!allowedStatuses.includes(c.status)) return false;
        }
        return true;
    }).sort((a, b) => b.timestamp - a.timestamp);

    const getPriStyle = (p: Priority) => {
        if (p === "High") return "bg-red-900/30 text-red-400 border border-red-800/50";
        if (p === "Medium") return "bg-amber-900/30 text-amber-400 border border-amber-800/50";
        return "bg-blue-900/30 text-blue-400 border border-blue-800/50";
    };

    const getStatusStyle = (s: Status) => {
        if (s === "Pending" || s === "Assigned") return "bg-blue-900/30 text-blue-400 border border-blue-800/50";
        if (s === "In Progress") return "bg-amber-900/30 text-amber-400 border border-amber-800/50";
        if (s === "Resolved") return "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50";
        return "bg-gray-800/50 text-gray-400 border border-gray-700/50";
    };

    const fmtDate = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <DashboardLayout title="Manage Grievances" subtitle="Review, update, and resolve public complaints.">
            <div className="space-y-6 max-w-6xl pb-12">
                
                {/* Top Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search by title, name, area..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-[#111827] border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-gray-600 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {["All", "open", "in progress", "resolved", "closed"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-2 rounded-lg text-[11px] font-medium uppercase tracking-wider transition-colors ${
                                    filter === f 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-transparent border border-gray-700 text-gray-400 hover:bg-gray-800"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="divide-y divide-gray-800/50">
                        {filtered.map((c, idx) => (
                            <div 
                                key={c.id} 
                                className="p-6 flex items-center justify-between hover:bg-gray-800/40 cursor-pointer transition-colors group"
                                onClick={() => navigate(`/grievances?id=${c.id}`)}
                            >
                                <div className="flex items-start gap-6">
                                    <span className="text-gray-500 text-xs font-mono mt-0.5">#{filtered.length - idx}</span>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{c.issue}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{c.author} · {c.category} · {c.ward}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                                        c.priority === "High" ? "bg-red-900/30 text-red-500 border border-red-800" :
                                        c.priority === "Medium" ? "bg-amber-900/30 text-amber-500 border border-amber-800" :
                                        "bg-blue-900/30 text-blue-500 border border-blue-800"
                                    }`}>
                                        {c.priority === "High" ? "Urgent" : c.priority}
                                    </span>
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                                        c.status === "Pending" || c.status === "Assigned" ? "bg-blue-900/30 text-blue-500 border border-blue-800" :
                                        c.status === "In Progress" ? "bg-amber-900/30 text-amber-500 border border-amber-800" :
                                        "bg-emerald-900/30 text-emerald-500 border border-emerald-800"
                                    }`}>
                                        {c.status === "Pending" ? "Open" : c.status}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium w-12 text-right">{fmtDate(c.timestamp)}</span>
                                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="p-12 text-center text-gray-500 text-sm font-medium">
                                No grievances found matching your filters.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
