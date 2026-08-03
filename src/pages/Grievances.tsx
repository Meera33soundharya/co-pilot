import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Status, Priority } from "@/store/complaintsStore";

export default function Grievances() {
    const { complaints, updateStatus } = useComplaints();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"All" | "open" | "in progress" | "resolved" | "closed">("All");

    const selectedId = searchParams.get("id");
    const selectedGrievance = selectedId ? complaints.find(c => c.id === selectedId) : null;

    const getStatusFilter = (f: string): Status[] => {
        if (f === "open") return ["Pending", "Assigned"];
        if (f === "in progress") return ["In Progress"];
        if (f === "resolved") return ["Resolved"];
        if (f === "closed") return ["Closed", "Rejected"];
        return [];
    };

    const filtered = complaints.filter(c => {
        if (search && !c.issue.toLowerCase().includes(search.toLowerCase()) && 
            !c.citizen.toLowerCase().includes(search.toLowerCase()) &&
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
                                        <p className="text-xs text-gray-500 mt-1">{c.citizen} · {c.category} · {c.ward}</p>
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

                {/* Detail Modal */}
                {selectedGrievance && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => navigate("/grievances")} />
                        <div className="relative w-full max-w-lg h-full overflow-y-auto bg-[#111827] border border-gray-800 shadow-2xl p-6 rounded-2xl animate-slide-left">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                                <div>
                                    <p className="text-xs font-black uppercase text-blue-500 mb-1">Grievance Details</p>
                                    <h2 className="text-lg font-bold text-white">{selectedGrievance.issue}</h2>
                                </div>
                                <button onClick={() => navigate("/grievances")} className="p-2 text-gray-400 hover:text-white">✕</button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-800/30 rounded-xl space-y-3 text-sm">
                                    <p><strong className="text-gray-400">ID:</strong> <span className="text-white">{selectedGrievance.id}</span></p>
                                    <p><strong className="text-gray-400">Citizen:</strong> <span className="text-white">{selectedGrievance.citizen} ({selectedGrievance.phone})</span></p>
                                    <p><strong className="text-gray-400">Ward:</strong> <span className="text-white">{selectedGrievance.ward}</span></p>
                                    <p><strong className="text-gray-400">Category:</strong> <span className="text-white">{selectedGrievance.category}</span></p>
                                    <p><strong className="text-gray-400">Dept:</strong> <span className="text-white">{selectedGrievance.dept}</span></p>
                                    <p><strong className="text-gray-400">AI Est. Time:</strong> <span className="text-white">{selectedGrievance.estimatedTime || "N/A"}</span></p>
                                    <p><strong className="text-gray-400">AI Suggested Officer:</strong> <span className="text-white">{selectedGrievance.suggestedOfficer || "N/A"}</span></p>
                                </div>

                                {selectedGrievance.description && (
                                    <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl">
                                        <p className="text-xs font-bold text-blue-400 mb-2">Description</p>
                                        <p className="text-sm text-gray-300">{selectedGrievance.description}</p>
                                    </div>
                                )}

                                {/* Admin Actions */}
                                <div className="pt-6 border-t border-gray-800">
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-4">Actions</p>
                                    {selectedGrievance.status === "Pending" && (
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => { updateStatus(selectedGrievance.id, "Accepted", "Accepted by admin"); navigate("/grievances"); }}
                                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl transition-colors"
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                onClick={() => { updateStatus(selectedGrievance.id, "Rejected", "Rejected by admin"); navigate("/grievances"); }}
                                                className="flex-1 py-3 bg-red-900/50 hover:bg-red-800 text-red-300 text-xs font-bold uppercase rounded-xl transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {selectedGrievance.status === "Accepted" && (
                                        <div className="space-y-3">
                                            <select 
                                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm"
                                                onChange={(e) => {
                                                    // In a real app we'd dispatch assigning the officer
                                                    updateStatus(selectedGrievance.id, "Assigned", `Assigned to ${e.target.value}`);
                                                    navigate("/grievances");
                                                }}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select Officer to Assign...</option>
                                                <option value="Field Officer A">Field Officer A</option>
                                                <option value="Field Officer B">Field Officer B</option>
                                            </select>
                                        </div>
                                    )}
                                    {(selectedGrievance.status === "Resolved") && (
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => { updateStatus(selectedGrievance.id, "Closed", "Verified and Closed"); navigate("/grievances"); }}
                                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-xl transition-colors"
                                            >
                                                Verify & Close
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
