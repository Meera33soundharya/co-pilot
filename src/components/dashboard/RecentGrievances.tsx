import { ArrowUpRight, Filter, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewGrievanceModal } from "@/components/NewGrievanceModal";

interface StatusBadgeProps {
    status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styles: Record<string, string> = {
        "Open": "bg-gray-50 text-gray-700 border-gray-200/50",
        "In Progress": "bg-amber-50 text-amber-700 border-amber-200/50",
        "Resolved": "bg-emerald-50 text-emerald-700 border-emerald-200/50",
        "Closed": "bg-gray-100 text-gray-600 border-gray-200/50",
        "High": "bg-red-50 text-red-700 border-red-200/50",
        "Medium": "bg-orange-50 text-orange-700 border-orange-200/50",
        "Low": "bg-gray-50 text-gray-700 border-gray-200/50",
    };
    const dotColors: Record<string, string> = {
        "Open": "bg-gray-400",
        "In Progress": "bg-amber-500 animate-pulse",
        "Resolved": "bg-emerald-500",
        "Closed": "bg-gray-400",
        "High": "bg-[#B91C1C] animate-pulse",
        "Medium": "bg-orange-500",
        "Low": "bg-gray-400",
    };
    const style = styles[status] ?? styles["Open"];
    const dot = dotColors[status] ?? "bg-gray-400";
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${style}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {status}
        </span>
    );
}

const grievances = [
    { id: "GRV-8294", citizen: "Amit Patel", issue: "Severe water leakage - Block C", ward: "Ward 03", priority: "High", status: "In Progress", time: "2h ago", dept: "Water" },
    { id: "GRV-8293", citizen: "Sunita Rao", issue: "Street light failure near school", ward: "Ward 12", priority: "Medium", status: "Open", time: "4h ago", dept: "Electricity" },
    { id: "GRV-8292", citizen: "Vikram Singh", issue: "Pavement damage on Main Road", ward: "Ward 06", priority: "High", status: "Open", time: "5h ago", dept: "Roads" },
    { id: "GRV-8291", citizen: "Ananya Iyer", issue: "Garbage collection missed - 3 days", ward: "Ward 09", priority: "Medium", status: "Resolved", time: "1d ago", dept: "Sanitation" },
    { id: "GRV-8290", citizen: "Karan Johar", issue: "Drainage blockage after rain", ward: "Ward 03", priority: "High", status: "In Progress", time: "1d ago", dept: "Sanitation" },
];

const avatarColors = [
    "bg-red-50 text-red-700 border border-red-100",
    "bg-gray-100 text-gray-700 border border-gray-200",
    "bg-[#B91C1C] text-white",
    "bg-gray-900 text-white",
    "bg-red-100 text-red-800 border border-red-200",
];

export function RecentGrievances() {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="space-y-4">
            <NewGrievanceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-1 rounded-full bg-[#B91C1C]" />
                    <h2 className="text-base font-bold text-gray-950 tracking-tight">Recent Activity</h2>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B91C1C] bg-red-50 px-3 py-1 rounded-xl">Live Feed</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/grievances")} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 group">
                        <Filter className="w-4 h-4 text-gray-400 group-hover:text-red-700 transition-colors" />
                        Filter
                    </button>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2 bg-[#B91C1C] rounded-xl text-xs font-black uppercase tracking-widest text-white hover:opacity-90 transition-all shadow-lg shadow-red-500/20 active:scale-95 group"
                    >
                        <Plus className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform" />
                        Add New
                    </button>
                    <button
                        onClick={() => navigate("/grievances")}
                        className="flex items-center gap-2 text-xs font-black text-[#B91C1C] uppercase tracking-widest hover:text-red-800 transition-all hover:gap-3 group ml-2"
                    >
                        View All <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Summary stat chips */}
            <div className="flex flex-wrap gap-4 mb-6">
                {[
                    { label: "Total Volume", value: "5,847", color: "border-gray-200 text-gray-950 bg-white" },
                    { label: "Critical Open", value: "183", color: "border-red-100 text-red-700 bg-red-50/50" },
                    { label: "Processing", value: "412", color: "border-amber-100 text-amber-700 bg-amber-50/50" },
                    { label: "Success Rate", value: "87%", color: "border-emerald-100 text-emerald-700 bg-emerald-50/50" },
                ].map(s => (
                    <div key={s.label} className={`flex flex-col gap-0.5 px-5 py-3 rounded-2xl border ${s.color} shadow-sm min-w-[120px] transition-transform hover:-translate-y-0.5`}>
                        <span className="text-xl font-black tracking-tighter">{s.value}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 overflow-hidden whitespace-nowrap">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">ID</th>
                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Citizen</th>
                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Problem</th>
                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Area</th>
                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Priority</th>
                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-gray-400 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grievances.map((g, idx) => (
                                <tr
                                    key={g.id}
                                    onMouseEnter={() => setHovered(g.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    className={`border-b border-gray-50 last:border-0 transition-all cursor-pointer ${hovered === g.id ? "bg-red-50/30" : "hover:bg-gray-50/30"}`}
                                >
                                    <td className="px-6 py-5">
                                        <span className="text-[10px] font-black text-red-700 tracking-wider font-mono bg-red-50 px-2 py-1 rounded-lg border border-red-100/50">{g.id}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-sm ${avatarColors[idx % avatarColors.length]}`}>
                                                {g.citizen.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <span className="text-sm font-bold text-gray-950">{g.citizen}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm text-gray-600 line-clamp-1 max-w-[280px] leading-relaxed">{g.issue}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">{g.ward}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={g.priority} />
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={g.status} />
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-xs font-semibold text-gray-400 tabular-nums">{g.time}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
