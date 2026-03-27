import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "@/context/ComplaintsContext";
import {
    Eye, EyeOff, CheckCircle2, Lock, Mail,
    ArrowRight, Loader2, Shield, User, Building2,
    MessageSquare, BrainCircuit, Sparkles, ChevronRight
} from "lucide-react";
import type { CurrentUser } from "@/context/ComplaintsContext";

/* ── Demo accounts ───────────────────────────────────────── */
const ACCOUNTS = [
    {
        role: "admin" as const, label: "Administrator", icon: Shield,
        color: "#c62828ff", bg: "bg-red-50",  border: "border-red-200",
        text: "text-red-700", glow: "shadow-red-500/20",
        email: "admin@govpilot.in", password: "Admin@2026",
        user: { id: "admin_1", name: "District Admin", role: "admin" as const },
        desc: "Full system access & analytics",
    },
    {
        role: "officer" as const, label: "Field Officer", icon: Building2,
        color: "#1D4ED8", bg: "bg-blue-50", border: "border-blue-200",
        text: "text-blue-700", glow: "shadow-blue-500/20",
        email: "officer@govpilot.in", password: "Officer@2026",
        user: { id: "officer_1", name: "Rajiv Kumar", role: "officer" as const, dept: "Water Supply Department" },
        desc: "Manage & resolve complaints",
    },
    {
        role: "citizen" as const, label: "Citizen", icon: User,
        color: "#059669", bg: "bg-emerald-50", border: "border-emerald-200",
        text: "text-emerald-700", glow: "shadow-emerald-500/20",
        email: "citizen@govpilot.in", password: "Citizen@2026",
        user: { id: "citizen_amit", name: "Amit Patel", role: "citizen" as const, citizenId: "citizen_amit" },
        desc: "Submit & track your complaints",
    },
];

/* ── Animated boot overlay ───────────────────────────────── */
function BootOverlay({ onDone }: { onDone: () => void }) {
    const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
    const stableDone = useCallback(onDone, []);

    const steps = [
        "Initialising Governance Core…",
        "Establishing Secure Link…",
        "Loading Role Permissions…",
        "Access Granted — Welcome",
    ];

    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 700),
            setTimeout(() => setStep(2), 1400),
            setTimeout(() => setStep(3), 2100),
            setTimeout(() => stableDone(), 2900),
        ];
        return () => timers.forEach(clearTimeout);
    }, [stableDone]);

    return (
        <div className="fixed inset-0 z-[200] bg-[#0A0F1E] flex flex-col items-center justify-center gap-10">
            {/* Grid bg */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
                backgroundSize: "40px 40px",
            }} />
            {/* Glowing orb */}
            <div className="absolute w-[600px] h-[600px] rounded-full blur-[160px] opacity-20"
                 style={{ background: "radial-gradient(circle, #C62828, transparent)" }} />

            <div className="relative flex flex-col items-center gap-8">
                {/* Logo */}
                <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C62828] to-[#7F1D1D] flex items-center justify-center shadow-2xl shadow-red-900/50">
                        <BrainCircuit className="w-10 h-10 text-white" />
                    </div>
                    {step === 3 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-fade-in">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                    )}
                </div>

                <div className="text-center space-y-2">
                    <p className="text-white font-black text-lg tracking-tight">
                        {step < 3 ? "Authenticating…" : "Access Granted"}
                    </p>
                    <p className="text-white/40 text-xs font-mono">{steps[step]}</p>
                </div>

                {/* Progress bar */}
                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: `${(step / 3) * 100}%`,
                            background: step === 3
                                ? "linear-gradient(90deg, #059669, #10B981)"
                                : "linear-gradient(90deg, #C62828, #EF5350)",
                        }}
                    />
                </div>

                {/* Terminal lines */}
                <div className="font-mono text-[9px] text-white/20 space-y-1 text-center">
                    {steps.slice(0, step + 1).map((s, i) => (
                        <div key={i} className="animate-fade-in">
                            <span className="text-[#C62828]/60">›</span> {s}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════
    MAIN LOGIN
════════════════════════════════════════════════════════ */
export default function Login() {
    const navigate = useNavigate();
    const { login } = useComplaints();
    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd]   = useState(false);
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);
    const [booting, setBooting]   = useState(false);
    const [selected, setSelected] = useState<CurrentUser | null>(null);
    const [activeRole, setActiveRole] = useState<string | null>(null);

    const quickFill = (acct: typeof ACCOUNTS[0]) => {
        setEmail(acct.email);
        setPassword(acct.password);
        setError("");
        setActiveRole(acct.role);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email || !password) { setError("Please enter your email and password."); return; }
        const matched = ACCOUNTS.find(a => a.email === email && a.password === password);
        if (!matched) { setError("Invalid credentials — use quick access below to auto-fill."); return; }
        setLoading(true);
        setSelected(matched.user);
        setTimeout(() => { setLoading(false); setBooting(true); }, 700);
    };

    const handleDone = useCallback(() => {
        if (!selected) return;
        login(selected);
        if (selected.role === "citizen") navigate("/citizen");
        else if (selected.role === "officer") navigate("/grievances");
        else navigate("/dashboard");
    }, [selected, login, navigate]);

    return (
        <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {booting && <BootOverlay onDone={handleDone} />}

            {/* ── LEFT — Innovative Neural Panel ────────────────────── */}
            <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 bg-[#050A18] overflow-hidden">
                
                {/* 1. Deep Mesh Gradient Layer */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-red-600/20 blur-[140px] animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/15 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_50%_50%,rgba(13,20,40,0)_0%,rgba(5,10,24,1)_70%)] z-10" />
                </div>

                {/* 2. Neural Grid & Circuit Pattern */}
                <div className="absolute inset-0 z-[1] opacity-20" style={{
                    backgroundImage: `linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }} />
                <div className="absolute inset-0 z-[1] opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, #C62828 1px, transparent 0)`,
                    backgroundSize: '60px 60px'
                }} />

                {/* 3. Floating Binary Nodes (Decorative) */}
                <div className="absolute inset-0 z-[2] pointer-events-none">
                    <div className="absolute top-[20%] left-[15%] w-1 h-1 bg-red-500 rounded-full animate-ping" />
                    <div className="absolute top-[40%] right-[25%] w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                    <div className="absolute bottom-[30%] left-[40%] w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
                </div>

                {/* Top logo */}
                <div className="relative z-20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C62828] to-[#1e1e1e] flex items-center justify-center shadow-2xl border border-white/10 group cursor-pointer hover:rotate-12 transition-transform duration-500">
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-black text-xl text-white tracking-tight">Co-Pilot</span>
                        <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-0.5">District Intelligence</span>
                    </div>
                </div>

                {/* Center hero text */}
                <div className="relative z-20 space-y-10">
                    <div className="group w-fit">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#B91C1C] backdrop-blur-md shadow-xl">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            Active Neural Governance
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-[5rem] font-black text-white leading-[0.9] tracking-tighter">
                            District<br />
                            <span className="relative inline-block">
                                <span className="relative z-10" style={{
                                    background: "linear-gradient(135deg, #FF3D3D 0%, #C62828 50%, #7F1D1D 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}>Co-Pilot</span>
                                <div className="absolute -inset-x-4 -inset-y-2 bg-red-600/10 blur-2xl -z-10 rounded-full" />
                            </span>
                        </h1>
                        <p className="text-white/40 text-lg font-medium leading-relaxed max-w-md tracking-tight">
                            Synthesizing real-time district data into actionable governance insights for a frictionless constituency experience.
                        </p>
                    </div>

                    {/* Interactive Feature Stack */}
                    <div className="space-y-6 pt-4">
                        {[
                            { icon: MessageSquare, label: "Real-time AI Sentiment Analysis", color: "text-red-400" },
                            { icon: Shield,        label: "Secure Multi-Role Protocol (G-Auth)", color: "text-blue-400" },
                            { icon: Sparkles,      label: "Automated Evidence Categorisation", color: "text-amber-400" },
                        ].map(({ icon: Icon, label, color }) => (
                            <div key={label} className="group flex items-center gap-5 cursor-default">
                                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
                                    <Icon className={`w-5 h-5 ${color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                                </div>
                                <div>
                                    <span className="text-sm text-white/40 font-bold group-hover:text-white/80 transition-colors tracking-tight">{label}</span>
                                    <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-red-600 to-transparent transition-all duration-500 rounded-full mt-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="relative z-20">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/20">
                        <span>Node Status: <span className="text-emerald-500">OPTIMAL</span></span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span>Latency: <span className="text-blue-400">12ms</span></span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span>v2.0.4-LTS</span>
                    </div>
                </div>
            </div>

            {/* ── RIGHT — login form panel ───────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-14 bg-[#F4F2EE] overflow-y-auto">

                {/* Mobile logo */}
                <div className="flex lg:hidden items-center gap-3 mb-10">
                    <div className="brand-logo">
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-black text-xl text-gray-900">Co-Pilot</span>
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">District Governance AI</span>
                    </div>
                </div>

                <div className="w-full max-w-[420px] space-y-6">

                    {/* Heading */}
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Sign in to access your portal</p>
                    </div>

                    {/* Quick role selector */}
                    <div>
                        <p className="section-label mb-3">Quick Access — Select Your Role</p>
                        <div className="grid grid-cols-3 gap-3">
                            {ACCOUNTS.map(acct => {
                                const Icon = acct.icon;
                                const isActive = activeRole === acct.role;
                                return (
                                    <button
                                        key={acct.role}
                                        id={`role-${acct.role}`}
                                        onClick={() => quickFill(acct)}
                                        className={`
                                            flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center
                                            transition-all duration-200 hover:scale-[1.04] active:scale-95
                                            ${isActive
                                                ? `${acct.border} ${acct.bg} shadow-lg ${acct.glow}`
                                                : "border-gray-200 bg-white hover:border-gray-300"
                                            }
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? acct.bg : "bg-gray-100"} transition-colors`}>
                                            <Icon className={`w-4 h-4 ${isActive ? acct.text : "text-gray-400"}`} />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-tight leading-tight ${isActive ? acct.text : "text-gray-500"}`}>
                                                {acct.label}
                                            </p>
                                            <p className="text-[8px] text-gray-400 font-medium mt-0.5 leading-tight hidden sm:block">
                                                {acct.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[9px] font-medium text-gray-400 text-center mt-2">
                            Tap a role to auto-fill credentials, then click Sign In
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                        <form onSubmit={handleLogin} className="space-y-4" noValidate>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="section-label ml-0.5">Official Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#C62828] transition-colors pointer-events-none" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setError(""); }}
                                        placeholder="your@email.in"
                                        className="input-field !pl-11"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="section-label ml-0.5">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#C62828] transition-colors pointer-events-none" />
                                    <input
                                        id="login-password"
                                        type={showPwd ? "text" : "password"}
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setError(""); }}
                                        placeholder="••••••••"
                                        className="input-field !pl-11 !pr-12"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#C62828] transition-colors"
                                    >
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-2xl animate-fade-in">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    <p className="text-xs font-bold text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full !py-4 mt-2"
                            >
                                {loading
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <>Sign In Securely <ArrowRight className="w-4 h-4" /></>
                                }
                            </button>
                        </form>

                        {/* Citizen public portal link */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <a
                                href="/submit-complaint"
                                id="citizen-portal-link"
                                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 text-xs font-black uppercase tracking-widest hover:border-[#C62828]/40 hover:text-[#C62828] hover:bg-red-50/50 transition-all group"
                            >
                                <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Submit a Complaint — Public Portal
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        </div>
                    </div>

                    <p className="text-center text-[9px] font-bold uppercase tracking-widest text-gray-300">
                        Secured · District Council · 2026
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
