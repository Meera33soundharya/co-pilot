import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { Clock, Users2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OfficerDashboard() {
    const { complaints } = useComplaints();
    const navigate = useNavigate();

    // Stats
    const openCount = complaints.filter(c => c.status === "Pending" || c.status === "Assigned").length;
    const inProgressCount = complaints.filter(c => c.status === "In Progress").length;
    const resolvedCount = complaints.filter(c => c.status === "Resolved").length;
    const highPriCount = complaints.filter(c => c.priority === "High" && c.status !== "Closed" && c.status !== "Resolved").length;

    // Urgent queue — priority sorted
    const urgentQueue = complaints
        .filter(c => c.status !== "Closed" && c.status !== "Resolved" && c.status !== "Rejected")
        .sort((a, b) => {
            const p: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
            return (p[b.priority] - p[a.priority]) || (b.timestamp - a.timestamp);
        }).slice(0, 5);

    // Recent grievances list
    const recentGrievances = [...complaints].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    return (
        <DashboardLayout 
            title="Officer Dashboard" 
            subtitle="Your active grievance workload and priorities."
        >
            <div className="space-y-6 max-w-5xl">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400 text-sm font-medium">Open</span>
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-white text-4xl font-bold">{openCount}</span>
                    </div>
                    
                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400 text-sm font-medium">In Progress</span>
                            <Users2 className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="text-white text-4xl font-bold">{inProgressCount}</span>
                    </div>

                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400 text-sm font-medium">Resolved</span>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-white text-4xl font-bold">{resolvedCount}</span>
                    </div>

                    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400 text-sm font-medium">High Priority</span>
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <span className="text-white text-4xl font-bold">{highPriCount}</span>
                    </div>
                </div>

                {/* Requires Immediate Attention */}
                <div className="bg-[#111827] border border-red-900/30 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <h2 className="text-red-500 text-sm font-bold">Requires Immediate Attention</h2>
                    </div>
                    <div className="divide-y divide-gray-800/50">
                        {urgentQueue.map(c => {
                            const isUrgent = c.priority === "High";
                            return (
                                <div 
                                    key={c.id} 
                                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/grievances?id=${c.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                                            isUrgent 
                                            ? "bg-red-900/40 text-red-400 border border-red-800/50" 
                                            : "bg-amber-900/40 text-amber-400 border border-amber-800/50"
                                        }`}>
                                            {isUrgent ? "Urgent" : "High"}
                                        </span>
                                        <span className="text-gray-200 text-sm font-bold">{c.issue}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                        <span>{c.ward}</span>
                                        <span>{c.time.split(',')[0]}</span>
                                    </div>
                                </div>
                            );
                        })}
                        {urgentQueue.length === 0 && (
                            <div className="px-6 py-8 text-center text-gray-500 text-sm">
                                No urgent grievances at the moment.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Grievances */}
                <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
                        <h2 className="text-white text-sm font-bold">Recent Grievances</h2>
                    </div>
                    <div className="divide-y divide-gray-800/50">
                        {recentGrievances.map(c => {
                            return (
                                <div 
                                    key={c.id} 
                                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/grievances?id=${c.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                                            c.priority === "High" 
                                            ? "bg-red-900/40 text-red-400 border border-red-800/50" 
                                            : c.priority === "Medium"
                                            ? "bg-amber-900/40 text-amber-400 border border-amber-800/50"
                                            : "bg-blue-900/40 text-blue-400 border border-blue-800/50"
                                        }`}>
                                            {c.priority}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-gray-200 text-sm font-bold">{c.issue}</span>
                                            <span className="text-gray-500 text-[10px] uppercase tracking-wider">{c.author} - {c.category}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-gray-800/50 text-gray-400 border border-gray-700">
                                            {c.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {recentGrievances.length === 0 && (
                            <div className="px-6 py-8 text-center text-gray-500 text-sm">
                                No recent grievances.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
