import { DashboardLayout } from "@/components/DashboardLayout";
import {
    Activity, Users, DollarSign,
    AlertTriangle, ShieldCheck, Zap, Layers,
    ArrowRight, RefreshCw, BarChart, Info
} from "lucide-react";
import { useState } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockData = [
    { name: 'Month 1', sentiment: 65, efficiency: 40, cost: 20 },
    { name: 'Month 2', sentiment: 62, efficiency: 45, cost: 35 },
    { name: 'Month 3', sentiment: 70, efficiency: 60, cost: 50 },
    { name: 'Month 4', sentiment: 75, efficiency: 72, cost: 65 },
    { name: 'Month 5', sentiment: 82, efficiency: 85, cost: 80 },
    { name: 'Month 6', sentiment: 88, efficiency: 92, cost: 95 },
];

export default function PolicySimulator() {
    const [policyTitle, setPolicyTitle] = useState("");
    const [isSimulating, setIsSimulating] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleSimulate = () => {
        if (!policyTitle.trim()) return;
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
            setShowResults(true);
        }, 2500);
    };

    return (
        <DashboardLayout title="Policy Impact Simulator" subtitle="Predict outcomes, resource shifts, and public sentiment using AI modeling">
            <div className="space-y-8 pb-12">

                {/* Simulation Instruction HUD */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0">
                        <Info className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-emerald-900 mb-1 italic tracking-tight uppercase">Simulation Protocol</h3>
                        <p className="text-xs text-emerald-700/60 leading-relaxed font-bold tracking-widest uppercase">1. Draft Policy Concept → 2. Calibrate Resource Load → 3. Execute Prediction Matrix</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-5 py-3 rounded-2xl border border-emerald-100/50 shadow-sm text-center">
                            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Accuracy</p>
                            <p className="text-xl font-black text-emerald-600 tracking-tighter">94.8%</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Parameters Console */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">Resource Calibration</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Budget Multiplier</label>
                                    <span className="text-[11px] font-black text-[#B91C1C]">₹5.5M - ₹12M</span>
                                </div>
                                <input type="range" className="w-full accent-[#B91C1C]" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Duration (Months)</label>
                                    <span className="text-[11px] font-black text-[#B91C1C]">12 Months</span>
                                </div>
                                <input type="range" className="w-full accent-gray-900" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Target Reach</label>
                                    <span className="text-[11px] font-black text-[#B91C1C]">45,000 People</span>
                                </div>
                                <input type="range" className="w-full accent-[#B91C1C]" />
                            </div>

                            <div className="pt-8 border-t border-gray-50">
                                <h4 className="text-[9px] font-black uppercase text-gray-400 mb-4 tracking-widest">Intelligence Layer</h4>
                                <div className="flex items-center gap-3 bg-red-50 p-4 rounded-2xl border border-red-100">
                                    <ShieldCheck className="w-5 h-5 text-red-600" />
                                    <p className="text-[10px] font-black text-red-900 uppercase tracking-tighter">Integrity Check Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simulation Input Area */}
                    <div className="lg:col-span-2 bg-[#0B1221] rounded-[3rem] p-10 shadow-3xl relative overflow-hidden text-white border border-white/5 group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                                    <Zap className="w-6 h-6 text-red-500 animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-black italic tracking-tighter leading-none">Draft Operational Policy</h2>
                            </div>

                            <div className="relative flex-1">
                                <textarea
                                    value={policyTitle}
                                    onChange={(e) => setPolicyTitle(e.target.value)}
                                    placeholder="Describe your initiative (e.g. 'Deploy 50 new LED poles in Sector 7 with automated luminance sensors')..."
                                    className="w-full h-full min-h-[220px] p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] text-xl font-bold focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] transition-all text-white placeholder-white/10 resize-none shadow-inner"
                                />
                                <div className="absolute top-6 right-6 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Real-time Ready</span>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Simulation engine utilizes deep-learning spatial clusters.</p>
                                <button
                                    onClick={handleSimulate}
                                    disabled={isSimulating || !policyTitle.trim()}
                                    className="px-10 py-5 bg-[#B91C1C] rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-red-600 transition-all shadow-2xl shadow-red-900/50 active:scale-95 disabled:opacity-50 flex items-center gap-4"
                                >
                                    {isSimulating ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Dynamics
                                        </>
                                    ) : (
                                        <>
                                            Run Predictor <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {showResults && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: "Public Sentiment", value: "+22%", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                { label: "Operational Efficiency", value: "+34%", icon: Activity, color: "text-red-400", bg: "bg-red-500/10" },
                                { label: "Est. Implementation Cost", value: "₹4.2 Cr", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
                                { label: "Risk Factor", value: "Low", icon: ShieldCheck, color: "text-gray-400", bg: "bg-gray-500/10" },
                            ].map(s => (
                                <div key={s.label} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                    <div className={`p-3 rounded-2xl ${s.bg} inline-block mb-4`}>
                                        <s.icon className={`w-5 h-5 ${s.color}`} />
                                    </div>
                                    <p className="text-3xl font-black text-gray-900">{s.value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Forecast Chart */}
                            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-black text-gray-900 flex items-center gap-3">
                                        <BarChart className="w-5 h-5 text-[#B91C1C]" />
                                        6-Month Impact Forecast
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sentiment
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500">
                                            <span className="w-2 h-2 rounded-full bg-[#B91C1C]" /> Efficiency
                                        </span>
                                    </div>
                                </div>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockData}>
                                            <defs>
                                                <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#B91C1C" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                            <YAxis hide />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="sentiment" stroke="#10B981" fillOpacity={1} fill="url(#colorSentiment)" strokeWidth={3} />
                                            <Area type="monotone" dataKey="efficiency" stroke="#B91C1C" fillOpacity={1} fill="url(#colorEfficiency)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Qualitative Insights */}
                            <div className="space-y-6">
                                <div className="bg-[#0B1221] text-white rounded-[3rem] p-10 shadow-2xl border border-white/10 group">
                                    <h3 className="text-[10px] font-black mb-8 flex items-center gap-4 text-emerald-400 uppercase tracking-[0.3em]">
                                        <Info className="w-5 h-5 animate-pulse" />
                                        Heuristic Analysis Core
                                    </h3>
                                    <div className="space-y-6">
                                        {[
                                            { title: "Sentiment Synthesis", body: "Direct correlation detected between visibility of infrastructure and public trust levels in Sector 7 clusters." },
                                            { title: "Operational Load", body: "Initial spike in maintenance bandwidth expected during first T-45 days. High-priority buffer recommended." },
                                            { title: "Governance Alignment", body: "Proposed policy retains 98.4% congruency with the 'Urban Integrity 2030' administrative roadmap." },
                                        ].map((item, i) => (
                                            <div key={i} className="border-l-2 border-emerald-500/20 pl-6 py-2 group-hover:border-emerald-500 transition-colors">
                                                <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-2">{item.title}</h4>
                                                <p className="text-xs text-white/40 leading-relaxed font-bold">{item.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all">
                                        Decrypt Full Technical Report
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Structural Vulnerabilities HUD */}
                        <div className="bg-red-950/20 border border-red-500/10 rounded-[3rem] p-10 relative overflow-hidden group">
                            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                                        <AlertTriangle className="w-8 h-8 text-rose-500 animate-[bounce_2s_infinite]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-rose-100 tracking-tight italic uppercase">Structural Roadblocks</h3>
                                        <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.3em]">Breach Probability: Moderate</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Live Vulnerability Scan</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { title: "Fiscal Volatility", desc: "Simulation indicates a 14% deviation probability in the cost grid due to supply-chain constraints in Sector 7." },
                                    { title: "Socio-Technical Friction", desc: "Potential adoption lag detected in elderly demographic clusters. Adaptive communication buffer requested." },
                                ].map((alert, i) => (
                                    <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2rem] hover:bg-white/10 hover:border-red-500/30 transition-all group/card shadow-2xl">
                                        <div className="flex items-start gap-6">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover/card:bg-red-500/20">
                                                <Layers className="w-6 h-6 text-white/20 group-hover/card:text-rose-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-2">{alert.title}</h4>
                                                <p className="text-[11px] text-white/30 leading-relaxed font-bold tracking-tight">{alert.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Instructional Protocol Guide */}
                        <div className="bg-white border border-gray-100 rounded-[3rem] p-12 shadow-sm text-center max-w-4xl mx-auto mt-12 relative overflow-hidden group">
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500/5 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                            
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-10">Simulation Protocol v2.4 Guide</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                                {[
                                    { step: "01", title: "Policy Draft", desc: "Input your initiative in clear, operational language. Specify sectors and objectives." },
                                    { step: "02", title: "Calibrate", desc: "Adjust the resource sliders to match your current budget grid and personnel bandwidth." },
                                    { step: "03", title: "Analyze", desc: "Execute the predictor and review the AI Reasoning core for potential integrity breaches." },
                                ].map((step, i) => (
                                    <div key={i} className="space-y-4">
                                        <div className="text-3xl font-black text-gray-900/5 italic tracking-tighter mb-[-20px]">{step.step}</div>
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter italic">{step.title}</h4>
                                        <p className="text-[11px] text-gray-400 font-bold leading-relaxed">{step.desc}</p>
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
