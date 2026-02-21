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

                {/* Simulation Input Area */}
                <div className="bg-[#0B1221] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px]" />

                    <div className="relative z-10 max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-500/20">
                            <Zap className="w-3 h-3" /> Predictive Model Engine v2.4
                        </div>

                        <h2 className="text-4xl font-black mb-6 tracking-tight">What policy should we test?</h2>
                        <div className="relative group">
                            <textarea
                                value={policyTitle}
                                onChange={(e) => setPolicyTitle(e.target.value)}
                                placeholder="e.g. 'Implement 24/7 solar-powered street lighting in Ward 12' or 'Dynamic waste collection routing system'..."
                                className="w-full h-32 p-6 bg-white/5 border-2 border-white/10 rounded-3xl text-lg font-bold focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-white placeholder-white/20 resize-none"
                            />
                            <button
                                onClick={handleSimulate}
                                disabled={isSimulating || !policyTitle.trim()}
                                className="absolute bottom-4 right-4 px-8 py-4 bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-3"
                            >
                                {isSimulating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" /> Simulating...
                                    </>
                                ) : (
                                    <>
                                        Run Simulation <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {showResults && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: "Public Sentiment", value: "+22%", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                                { label: "Operational Efficiency", value: "+34%", icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
                                { label: "Est. Implementation Cost", value: "₹4.2 Cr", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-500/10" },
                                { label: "Risk Factor", value: "Low", icon: ShieldCheck, color: "text-cyan-400", bg: "bg-cyan-500/10" },
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
                                        <BarChart className="w-5 h-5 text-blue-500" />
                                        6-Month Impact Forecast
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sentiment
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500">
                                            <span className="w-2 h-2 rounded-full bg-blue-500" /> Efficiency
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
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                            <YAxis hide />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="sentiment" stroke="#10B981" fillOpacity={1} fill="url(#colorSentiment)" strokeWidth={3} />
                                            <Area type="monotone" dataKey="efficiency" stroke="#3B82F6" fillOpacity={1} fill="url(#colorEfficiency)" strokeWidth={3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Qualitative Insights */}
                            <div className="space-y-6">
                                <div className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-xl">
                                    <h3 className="font-black mb-6 flex items-center gap-3 text-[#D4AF37]">
                                        <Info className="w-5 h-5" />
                                        AI Reasoning
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            { title: "Sentiment boost", body: "Direct correlation detected between visibility of infrastructure and public trust levels in Ward 12." },
                                            { title: "Resource Load", body: "Initial spike in maintenance requests expected during first 45 days. Buffer required." },
                                            { title: "Political Alignment", body: "Policy adheres 94% with 'Smarter Cities 2030' initiative guidelines." },
                                        ].map((item, i) => (
                                            <div key={i} className="border-l-2 border-[#D4AF37]/30 pl-4 py-1">
                                                <h4 className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest mb-1">{item.title}</h4>
                                                <p className="text-xs text-white/60 leading-relaxed">{item.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                        Full Technical Report
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Potential Roadblocks */}
                        <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-8">
                            <h3 className="text-rose-900 font-black text-lg mb-6 flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                Identified Vulnerabilities
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: "Budget Variance", desc: "Model indicates 12% probability of cost overrun due to current supply chain volatility for solar components." },
                                    { title: "Social Friction", desc: "Digital divide may cause initial confusion among senior citizens regarding dynamic control systems." },
                                ].map((alert, i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm flex gap-4">
                                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Layers className="w-5 h-5 text-rose-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-gray-900 mb-1">{alert.title}</h4>
                                            <p className="text-xs text-gray-500 leading-relaxed">{alert.desc}</p>
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
