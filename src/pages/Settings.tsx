import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { 
    User, Bell, Shield, Key, Save, Camera, 
    ChevronRight, FileBarChart2, Layers, MessageSquare, 
    GraduationCap, Zap, Star, Activity, Clock, Users,
    RefreshCw, Share2, Lightbulb, ExternalLink, CheckCircle2
} from "lucide-react";
import { useComplaints } from "@/context/ComplaintsContext";
import { useNavigate } from "react-router-dom";

const settingsSections = [
    { icon: User, label: "Profile & Identity" },
    { icon: Bell, label: "Notifications & Alerts" },
    { icon: Shield, label: "Security & Access" },
    { icon: FileBarChart2, label: "Performance Metrics" },
    { icon: Layers, label: "Task Operations" },
    { icon: MessageSquare, label: "Collaboration Tools" },
    { icon: GraduationCap, label: "Knowledge Hub" },
];

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
    const [on, setOn] = useState(defaultOn);
    return (
        <button
            onClick={() => setOn(!on)}
            className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-[#B91C1C]" : "bg-gray-200"}`}
        >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : ""}`} />
        </button>
    );
}

export default function Settings() {
    const { currentUser, complaints } = useComplaints();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("Profile & Identity");
    const [name, setName] = useState(currentUser?.name || "Administrator");
    const [email, setEmail] = useState("officer@govpilot.in");
    const [phone, setPhone] = useState("+91 98765 43210");
    const [dept, setDept] = useState(currentUser?.dept || "AI Governance");
    const [designation, setDesignation] = useState(currentUser?.role === "admin" ? "District Collector" : "Ward Supervisor");
    const [ward, setWard] = useState("Ward 03 (Sanjay Nagar)");
    const [saved, setSaved] = useState(false);
    const [action, setAction] = useState<string | null>(null);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleAction = (type: string) => {
        setAction(type);
        setTimeout(() => setAction(null), 2000);
    };

    const stats = {
        resolved: complaints.filter(c => c.status === "Resolved").length,
        avgTime: "4.2 hrs",
        satisfaction: "92%",
    };

    return (
        <DashboardLayout title="Officer Settings & Governance" subtitle="Manage your professional profile, operational metrics, and communication tools">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Nav */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-4 h-fit lg:sticky lg:top-6">
                        <div className="space-y-1">
                            {settingsSections.map(({ icon: Icon, label }) => (
                                <button
                                    key={label}
                                    onClick={() => setActiveSection(label)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-left group ${activeSection === label ? "bg-[#B91C1C] text-white shadow-xl shadow-red-900/20" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}
                                >
                                    <Icon className={`w-5 h-5 shrink-0 ${activeSection === label ? "text-white" : "text-gray-300 group-hover:text-[#B91C1C] transition-colors"}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</span>
                                    {activeSection !== label && <ChevronRight className="w-4 h-4 ml-auto opacity-20 group-hover:opacity-40" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* ──── PROFILE SECTION ──── */}
                    {activeSection === "Profile & Identity" && (
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[40px] pointer-events-none" />
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3 relative z-10">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
                                Identity & Protocol
                            </h2>

                            <div className="flex items-center gap-8 mb-10 relative z-10">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-[2rem] bg-neutral-900 flex items-center justify-center text-white text-3xl font-black shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                        {name.slice(0,2).toUpperCase()}
                                    </div>
                                    <button onClick={() => handleAction("photo")} className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl border border-gray-100 shadow-xl flex items-center justify-center hover:bg-red-50 transition-all hover:border-red-100">
                                        <Camera className="w-4 h-4 text-gray-400 group-hover:text-[#B91C1C]" />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-black text-gray-900 tracking-tight">{name}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{designation} · {dept}</p>
                                    <button onClick={() => handleAction("photo")} className="text-[10px] font-black text-[#B91C1C] uppercase tracking-widest mt-2 hover:translate-x-1 transition-transform flex items-center gap-1.5">
                                        {action === "photo" ? "Initializing..." : <>Request Credential Update <ChevronRight className="w-3 h-3" /></>}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                {[
                                    { label: "Officer Name", value: name, setter: setName },
                                    { label: "Professional Mail Node", value: email, setter: setEmail },
                                    { label: "Designation / Title", value: designation, setter: setDesignation },
                                    { label: "Department / Ward Assignment", value: ward, setter: setWard },
                                    { label: "Encrypted Contact", value: phone, setter: setPhone },
                                    { label: "Governance Division", value: dept, setter: setDept },
                                ].map(({ label, value, setter }) => (
                                    <div key={label} className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</label>
                                        <input
                                            value={value}
                                            onChange={e => setter(e.target.value)}
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:bg-white focus:border-red-100 transition-all shadow-inner"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 flex gap-4 relative z-10">
                                <button
                                    onClick={handleSave}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-[#B91C1C] text-white hover:bg-neutral-800 shadow-red-900/20"}`}
                                >
                                    <Save className="w-4 h-4" />
                                    {saved ? "Changes Committed" : "Commit Protocol"}
                                </button>
                                <button onClick={() => { setSaved(false); }} className="px-10 py-4 bg-gray-100 rounded-2xl text-[11px] font-black text-gray-900 hover:bg-gray-200 transition-all uppercase tracking-widest">
                                    Abort
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ──── NOTIFICATIONS SECTION ──── */}
                    {activeSection === "Notifications & Alerts" && (
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Notifications & Protocol Alerts
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { label: "New Grievance Alerts", desc: "Notification when a new complaint is geo-assigned to your ward", on: true },
                                    { label: "Critical Escalations", desc: "Ping when unresolved issues hit the 7-day threshold", on: true },
                                    { label: "Sentiment Spike Warnings", desc: "AI-detected trends of citizen dissatisfaction in your area", on: true },
                                    { label: "Department Memo", desc: "Administrative and internal policy updates", on: false },
                                    { label: "System Maintenance", desc: "Scheduled down-time for district security patches", on: false },
                                ].map(({ label, desc, on }) => (
                                    <div key={label} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-amber-100 transition-all group">
                                        <div className="max-w-md">
                                            <p className="text-sm font-black text-gray-900">{label}</p>
                                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
                                        </div>
                                        <Toggle defaultOn={on} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ──── SECURITY SECTION ──── */}
                    {activeSection === "Security & Access" && (
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Multi-Factor Security Protocol
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { label: "Gov-Bio 2FA Authentication", desc: "Require biometric or mobile OTP for all district logins", on: true },
                                    { label: "Forced Session Timeout", desc: "Auto-logout after 20 minutes of inactivity", on: true },
                                    { label: "Login Anomaly Detection", desc: "Alert me of login attempts from non-trusted mobile nodes", on: false },
                                ].map(({ label, desc, on }) => (
                                    <div key={label} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group">
                                        <div className="max-w-md">
                                            <p className="text-sm font-black text-gray-900">{label}</p>
                                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{desc}</p>
                                        </div>
                                        <Toggle defaultOn={on} />
                                    </div>
                                ))}
                                
                                <div className="p-8 border-2 border-dashed border-gray-100 rounded-[2rem] space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trusted Device Management</h4>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-50 text-[11px] font-bold text-gray-900">
                                        <span>District-Mobile (Samsung S23)</span>
                                        <span className="text-emerald-500 font-black">ACTIVE</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 text-[11px] font-bold text-gray-400">
                                        <span>Officer-Laptop (MacBook Pro)</span>
                                        <button className="text-red-500 hover:underline">Revoke Access</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ──── PERFORMANCE SECTION ──── */}
                    {activeSection === "Performance Metrics" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <div className="p-3 bg-emerald-50 rounded-2xl w-fit mb-4"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
                                    <h4 className="text-3xl font-black text-gray-900">{stats.resolved}</h4>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Grievances Resolved</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <div className="p-3 bg-blue-50 rounded-2xl w-fit mb-4"><Clock className="w-5 h-5 text-blue-600" /></div>
                                    <h4 className="text-3xl font-black text-gray-900">{stats.avgTime}</h4>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Avg Resolution Time</p>
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <div className="p-3 bg-amber-50 rounded-2xl w-fit mb-4"><Star className="w-5 h-5 text-amber-600" /></div>
                                    <h4 className="text-3xl font-black text-gray-900">{stats.satisfaction}</h4>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Satisfaction Score</p>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Activity className="w-4 h-4 text-[#B91C1C]" />
                                        Resolution Efficiency Trend
                                    </h2>
                                    <button className="text-[10px] font-black uppercase text-[#B91C1C] flex items-center gap-2">Download Full Report <ExternalLink className="w-3 h-3" /></button>
                                </div>
                                <div className="h-48 flex items-end gap-3 px-4">
                                    {[30, 45, 25, 60, 80, 55, 90].map((h, i) => (
                                        <div key={i} className="flex-1 bg-[#B91C1C]/10 rounded-t-xl group relative cursor-pointer" style={{ height: `${h}%` }}>
                                            <div className="absolute inset-0 bg-[#B91C1C] opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Day {i+1}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-between px-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ──── TASK OPERATIONS SECTION ──── */}
                    {activeSection === "Task Operations" && (
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 space-y-8 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                                <Layers className="w-4 h-4 text-indigo-500" />
                                Operation & Escalation Control
                            </h2>
                            
                            <div className="p-8 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                                <h4 className="text-sm font-black text-indigo-900 mb-2">Automated Escalation Protocol</h4>
                                <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">System-wide rule: Any grievance marked as High Priority which remains UNRESOLVED for more than 7 days will be automatically escalated to the District Supervisor.</p>
                                <button className="mt-4 py-3 px-6 bg-white border border-indigo-200 rounded-2xl text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-100 transition-all">Configure Escalation Rules</button>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Team Assignments</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { name: "Field Team A (West)", members: 12, load: "High" },
                                        { name: "Mobile Repair Unit", members: 4, load: "Nominal" },
                                    ].map(team => (
                                        <div key={team.name} className="p-6 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-black text-gray-900">{team.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{team.members} Members</p>
                                            </div>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${team.load === "High" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>{team.load}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-4 border-2 border-dashed border-gray-100 text-gray-400 rounded-3xl text-sm font-black uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-2">
                                    <Users className="w-4 h-4" /> Delegate To New Unit
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ──── COLLABORATION SECTION ──── */}
                    {activeSection === "Collaboration Tools" && (
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 space-y-8 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-cyan-500" />
                                Inter-Departmental Sync
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 bg-cyan-50 rounded-[2.5rem] border border-cyan-100 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-cyan-100"><Share2 className="w-8 h-8 text-cyan-500" /></div>
                                    <h4 className="text-base font-black text-cyan-900 mb-2">Private Intel Channel</h4>
                                    <p className="text-[11px] text-cyan-700 font-medium mb-6">Real-time secure chat for operational field teams and HODs.</p>
                                    <button className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#B91C1C] transition-all">Launch Comm-Unit</button>
                                </div>
                                <div className="p-8 bg-neutral-900 rounded-[2.5rem] text-white flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-6"><Users className="w-8 h-8 text-white" /></div>
                                    <h4 className="text-base font-black mb-2">District Directory</h4>
                                    <p className="text-[11px] text-white/40 font-medium mb-6">Complete list of verified officers across all 24 wards.</p>
                                    <button className="w-full py-4 bg-white text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Contact Heads</button>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Collaboration Note Sticky</h4>
                                    <span className="text-[9px] font-black text-amber-500 tracking-widest uppercase">Pinned</span>
                                </div>
                                <textarea className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-gray-500 italic placeholder:text-gray-300 resize-none h-24" placeholder="Type a note for your relief officer..." />
                            </div>
                        </div>
                    )}

                    {/* ──── KNOWLEDGE HUB SECTION ──── */}
                    {activeSection === "Knowledge Hub" && (
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                Officer Assistance & Learning
                            </h2>
                            
                            <div className="space-y-6">
                                <div onClick={() => navigate("/study-buddy")} 
                                     className="p-8 bg-gradient-to-r from-neutral-900 to-gray-800 rounded-[2.5rem] text-white flex items-center justify-between group cursor-pointer hover:scale-[1.01] transition-all">
                                    <div>
                                        <h4 className="text-lg font-black mb-2 flex items-center gap-2">Study Buddy <GraduationCap className="w-5 h-5 text-amber-400" /></h4>
                                        <p className="text-xs text-white/40 font-medium">Quick links to policy documents and past case studies.</p>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap className="w-4 h-4 text-emerald-600" />
                                            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">AI Assistance Ready</p>
                                        </div>
                                        <p className="text-[11px] font-black text-emerald-900 mb-1">Grievance-ID: GRV-8292</p>
                                        <p className="text-[10px] text-emerald-600 font-medium italic">"Based on past rains, we suggest deploying the heavy drainage vac team to Ward-06 within 2 hours."</p>
                                    </div>
                                    <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Shield className="w-4 h-4 text-red-600" />
                                            <p className="text-[10px] font-black text-red-800 uppercase tracking-widest">Policy Spotlight</p>
                                        </div>
                                        <p className="text-[11px] font-black text-red-900 mb-1">Disaster Protocol V2.1</p>
                                        <p className="text-[10px] text-red-600 font-medium leading-relaxed">Section 4.2: Handling live wire anomalies in residential parks.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
