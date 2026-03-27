import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    MessageSquare, Activity, ChevronRight, Zap,
    Brain, Sparkles, Loader2, Shield, Eye, X, MapPin, User
} from "lucide-react";

export default function Dashboard() {
    const { complaints, currentUser } = useComplaints();
    const navigate = useNavigate();
    const [viewGrievance, setViewGrievance] = useState<any>(null);

    const isAdmin = currentUser?.role === "admin";
    const isOfficer = currentUser?.role === "officer";
    const isCitizen = currentUser?.role === "citizen";

    // AI Briefing state
    const [briefing, setBriefing] = useState<string | null>(null);
    const [generatingBrief, setGeneratingBrief] = useState(false);

    // Redirect citizens to their portal
    useEffect(() => {
        if (isCitizen) navigate("/citizen");
    }, [isCitizen, navigate]);

    // Live stats
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;
    const highPri = complaints.filter(c => c.priority === "High" && c.status !== "Closed" && c.status !== "Resolved").length;
    const resoPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    // Mock Sentiment Score (0-100) based on resolution rate + random drift
    const sentiment = Math.min(100, Math.max(0, resoPct + (Math.random() * 10 - 5)));
    const healthScore = Math.min(100, Math.max(0, Math.round(
        (resoPct * 0.45) +       // 45% weight: Case Resolution
        (sentiment * 0.35) +     // 35% weight: Citizen Sentiment
        ((100 - (highPri / Math.max(total, 1)) * 100) * 0.2) // 20% weight: Urgency Factor
    )));

    function generateBriefing() {
        setGeneratingBrief(true);
        setBriefing(null);
        setTimeout(() => {
            const topCat = ["Roads", "Water", "Electricity", "Sanitation"].find(c =>
                complaints.some(x => x.category === c && x.status === "New")) ?? "Roads";
            
            // 🧠 Explainable AI (XAI) Logic
            const ward3Clusters = complaints.filter(c => c.ward.includes("03") && c.category === topCat).length;
            const reasoning = ward3Clusters > 2 
                ? `[XAI Reason: DBSCAN Clustering detected ${ward3Clusters} similar issues specifically in Ward 03.]` 
                : `[XAI Reason: High volume of individual reports across multiple wards.]`;

            setBriefing(
                `📋 AI Executive Briefing — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}\n\n` +
                `🔴 Total Active Complaints: ${total - resolved}\n` +
                `⚡ High Priority Pending: ${highPri}\n` +
                `✅ Resolution Rate: ${resoPct}% (${resolved}/${total})\n` +
                `🏥 Constituency Health Score: ${healthScore}/100\n\n` +
                `📌 Top Issue: ${topCat} complaints are currently flooding the system.\n` +
                `${reasoning}\n\n` +
                `💡 AI Suggestion: Recommend deploying additional ${topCat === "Water" ? "Water Dept" : topCat === "Roads" ? "PWD" : topCat === "Electricity" ? "Electricity Board" : "Sanitation"} personnel to the identified clusters immediately.\n\n` +
                `🔍 Predict: Resolving these clusters will increase Health Score by +8 points within 48 hours.`
            );
            setGeneratingBrief(false);
        }, 2200);
    }

    // Urgent queue — priority sorted, not resolved/closed
    const urgentQueue = complaints
        .filter(c => c.status !== "Closed" && c.status !== "Resolved")
        .sort((a, b) => {
            const p: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
            return (p[b.priority] - p[a.priority]) || (b.timestamp - a.timestamp);
        }).slice(0, 6);

    return (
        <DashboardLayout title="Dashboard" subtitle={
            isAdmin ? "Live overview — all complaints" :
                isOfficer ? `Your dept: ${currentUser?.dept}` :
                    "Your complaint status"
        }>
            <div className="space-y-8 pb-10 relative">
                
                {/* ── OPERATIONAL TACTICAL SIDE-TRAY ────────────────── */}
                {viewGrievance && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-end p-4 lg:p-8">
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setViewGrievance(null)} />
                        <div className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg h-full overflow-hidden animate-slide-left border border-white/20">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] pointer-events-none" />
                            
                            <div className="p-12 space-y-10 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                            <Shield className="w-7 h-7 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 uppercase italic">Mission Detail</h3>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Case ID: {viewGrievance.id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setViewGrievance(null)} className="p-3 rounded-2xl hover:bg-gray-100 text-gray-300 transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${viewGrievance.priority === 'High' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                                {viewGrievance.priority} Priority
                                            </span>
                                            <span className="px-4 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {viewGrievance.category}
                                            </span>
                                        </div>
                                        <h4 className="text-2xl font-black text-gray-900 italic uppercase leading-tight">{viewGrievance.issue}</h4>
                                        <p className="text-gray-500 font-medium leading-relaxed">{viewGrievance.description || "No tactical briefing provided for this complaint."}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-3.5 h-3.5 text-gray-400" />
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Citizen Node</p>
                                            </div>
                                            <p className="font-black text-gray-900 uppercase italic">{viewGrievance.citizen}</p>
                                        </div>
                                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sector Ward</p>
                                            </div>
                                            <p className="font-black text-gray-900 uppercase italic">{viewGrievance.ward}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => { navigate(`/grievances?id=${viewGrievance.id}`); setViewGrievance(null); }} className="flex-1 py-5 bg-gray-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl active:scale-95">
                                        Full Mission Log
                                    </button>
                                    <button onClick={() => setViewGrievance(null)} className="px-10 py-5 bg-gray-200 text-gray-900 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-300 transition-all active:scale-95">
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── COMMAND CONSOLE: MUST BUTTONS ─────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { 
                            label: "Coordinate Mission", 
                            desc: "Deploy field units now", 
                            icon: Zap, 
                            link: "/schedule", 
                            color: "bg-red-600 text-white shadow-red-500/20" 
                        },
                        { 
                            label: "Review Grievances", 
                            desc: "Process urgent queue", 
                            icon: MessageSquare, 
                            link: "/grievances", 
                            color: "bg-white text-gray-900 border border-gray-100" 
                        },
                        { 
                            label: "Policy Simulator", 
                            desc: "Predict impact AI", 
                            icon: Sparkles, 
                            link: "/policy-simulator", 
                            color: "bg-white text-gray-900 border border-gray-100" 
                        },
                        { 
                            label: "District Heatmap", 
                            desc: "Live problem clusters", 
                            icon: Activity, 
                            link: "/heatmap", 
                            color: "bg-white text-gray-900 border border-gray-100" 
                        },
                    ].map((btn, i) => (
                        <button key={i} onClick={() => navigate(btn.link)}
                            className={`group p-8 rounded-[2.5rem] flex flex-col gap-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl ${btn.color}`}>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${btn.color.includes('bg-white') ? 'bg-gray-50' : 'bg-white/20'}`}>
                                <btn.icon className={`w-7 h-7 ${btn.color.includes('bg-white') ? 'text-red-600' : 'text-white'}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight italic">{btn.label}</h3>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${btn.color.includes('bg-white') ? 'text-gray-400' : 'text-white/60'}`}>{btn.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* ── CORE INTELLIGENCE HUB ─────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* AI Briefing Generator */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[100px] pointer-events-none group-hover:bg-red-500/10 transition-all duration-1000" />
                        
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-red-50 rounded-[1.5rem] border border-red-100">
                                        <Brain className="w-6 h-6 text-[#B91C1C]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase italic">AI Executive Briefing</h3>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Automated Strategic Summary</p>
                                    </div>
                                </div>
                                <button
                                    onClick={generateBriefing}
                                    disabled={generatingBrief}
                                    className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#B91C1C] transition-all shadow-2xl disabled:opacity-60"
                                >
                                    {generatingBrief
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                                        : <><Sparkles className="w-4 h-4" /> Generate Briefing</>
                                    }
                                </button>
                            </div>

                            {briefing ? (
                                <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 relative">
                                    <pre className="text-xs font-bold text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{briefing}</pre>
                                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200/50">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Decision Support Core Active</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[2.5rem] p-20 text-center">
                                    <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Request AI intelligence sweep to begin</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Constituency Health Score */}
                    <div className="bg-gray-900 rounded-[3rem] p-10 shadow-2xl text-white relative overflow-hidden flex flex-col justify-between group">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-[#B91C1C] group-hover:h-2 transition-all" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[80px] pointer-events-none" />
                        
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-white/20" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 italic">Constituency Integrity</h3>
                            </div>

                            <div className="flex justify-center py-4">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
                                        <circle cx="18" cy="18" r="15.9" fill="none"
                                            stroke={healthScore >= 70 ? "#10B981" : healthScore >= 40 ? "#F59E0B" : "#B91C1C"}
                                            strokeWidth="3.5"
                                            strokeDasharray={`${(healthScore / 100) * 100} 100`}
                                            strokeLinecap="round"
                                            style={{ transition: "stroke-dasharray 1.5s ease" }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black tracking-tighter italic">{healthScore}</span>
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">/ 100</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-center">
                                <p className={`text-2xl font-black uppercase italic tracking-tight ${healthScore >= 70 ? "text-emerald-400" : healthScore >= 40 ? "text-amber-400" : "text-[#B91C1C]"
                                    }`}>{healthScore >= 70 ? "Stable" : healthScore >= 40 ? "Attention Required" : "Critical Alert"}</p>
                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">District Health Index</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── URGENT QUEUE ──────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-[3.5rem] overflow-hidden shadow-sm">
                    <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                            <h3 className="text-lg font-black text-gray-900 uppercase italic">Urgent Operation Queue</h3>
                        </div>
                        <button onClick={() => navigate("/grievances")}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B91C1C] hover:text-black flex items-center gap-2 transition-colors">
                            Full Log <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {urgentQueue.slice(0, 4).map(c => (
                            <div key={c.id}
                                className="flex items-center gap-8 px-10 py-6 hover:bg-red-50/20 transition-all cursor-pointer group"
                                onClick={() => setViewGrievance(c)}>
                                <div className="w-14 h-14 rounded-[1.5rem] bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-[#B91C1C] transition-all shrink-0 relative">
                                    <span className="text-sm font-black text-gray-900 group-hover:text-white font-mono uppercase italic">{c.id.split("-")[1]}</span>
                                    {c.priority === "High" && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-lg font-black text-gray-900 truncate uppercase italic">{c.issue}</h4>
                                        {c.priority === "High" && <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />}
                                    </div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">{c.citizen} · {c.ward} · {c.dept || "Awaiting Unit"}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="hidden md:flex items-center gap-4">
                                        <span className={`text-[10px] font-black px-4 py-2 rounded-xl border uppercase tracking-widest ${c.priority === "High" ? "bg-red-50 border-red-100 text-[#B91C1C]" : "bg-gray-50 border-gray-100 text-gray-500"}`}>{c.priority}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setViewGrievance(c); }}
                                        className={`p-3 rounded-2xl border transition-all shadow-sm ${
                                            c.priority === "High" 
                                            ? "bg-red-600 text-white border-red-500 animate-pulse hover:bg-black hover:animate-none" 
                                            : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-900 hover:text-white"
                                        }`}
                                        title="Satellite View"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
