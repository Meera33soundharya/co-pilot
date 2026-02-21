import { ArrowUpRight, Filter, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface StatusBadgeProps {
    status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styles: Record<string, string> = {
        "Open": "bg-blue-50 text-blue-700 border-blue-200/50",
        "In Progress": "bg-amber-50 text-amber-700 border-amber-200/50",
        "Resolved": "bg-emerald-50 text-emerald-700 border-emerald-200/50",
        "Closed": "bg-gray-100 text-gray-600 border-gray-200/50",
        "High": "bg-rose-50 text-rose-700 border-rose-200/50",
        "Medium": "bg-orange-50 text-orange-700 border-orange-200/50",
        "Low": "bg-sky-50 text-sky-700 border-sky-200/50",
    };
    const dotColors: Record<string, string> = {
        "Open": "bg-blue-500",
        "In Progress": "bg-amber-500 animate-pulse",
        "Resolved": "bg-emerald-500",
        "Closed": "bg-gray-400",
        "High": "bg-rose-500 animate-pulse",
        "Medium": "bg-orange-500",
        "Low": "bg-sky-500",
    };
    const style = styles[status] ?? styles["Open"];
    const dot = dotColors[status] ?? "bg-gray-400";
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${style}`}>
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
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-rose-100 text-rose-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
];

export function RecentGrievances() {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
                    <h2 className="text-base font-black text-gray-900 tracking-tight">Recent Citizen Grievances</h2>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">Live tracking</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate("/grievances")} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        <Filter className="w-3 h-3" /> Filter
                    </button>
                    <button
                        onClick={() => navigate("/grievances")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 rounded-xl text-[10px] font-black text-white hover:bg-blue-700 transition-all shadow-sm"
                    >
                        <Plus className="w-3 h-3" /> New Ticket
                    </button>
                    <button
                        onClick={() => navigate("/grievances")}
                        className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
                    >
                        View All <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Summary stat chips */}
            <div className="flex flex-wrap gap-3">
                {[
                    { label: "Total", value: "5,847", color: "border-gray-200 text-gray-700 bg-white" },
                    { label: "Open", value: "183", color: "border-blue-200 text-blue-700 bg-blue-50" },
                    { label: "In Progress", value: "412", color: "border-amber-200 text-amber-700 bg-amber-50" },
                    { label: "Resolved", value: "5,090", color: "border-emerald-200 text-emerald-700 bg-emerald-50" },
                ].map(s => (
                    <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${s.color} shadow-sm`}>
                        <span className="text-sm font-black">{s.value}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/60 border-b border-gray-100">
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Ticket ID</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Citizen</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Issue Description</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Ward</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Priority</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grievances.map((g, idx) => (
                                <tr
                                    key={g.id}
                                    onMouseEnter={() => setHovered(g.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    className={`border-b border-gray-50 last:border-0 transition-colors cursor-pointer ${hovered === g.id ? "bg-blue-50/30" : "hover:bg-gray-50/40"}`}
                                >
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-blue-600 tracking-tight font-mono">{g.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[9px] font-black shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                                                {g.citizen.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <span className="text-xs font-bold text-gray-900">{g.citizen}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-gray-600 line-clamp-1 max-w-[200px]">{g.issue}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{g.ward}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={g.priority} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={g.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold text-gray-400">{g.time}</span>
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
