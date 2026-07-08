import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useComplaints } from "@/context/ComplaintsContext";
import {
    Eye, EyeOff, CheckCircle2, Lock, Mail,
    ArrowRight, Loader2, Shield, User, Building2,
    MessageSquare, BrainCircuit, Sparkles, ChevronRight, Mic
} from "lucide-react";
import type { CurrentUser } from "@/context/ComplaintsContext";
import SegmentedRing from "../components/SegmentedRing";

/* ── Demo accounts ───────────────────────────────────────── */
const ACCOUNTS = [
    {
        role: "admin" as const, label: "Admin", icon: Shield,
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
                    <p className="text-white font-medium text-lg ">
                        {step < 3 ? "Authenticating…" : "Access Granted"}
                    </p>
                    <p className="text-white/40 text-base font-mono">{steps[step]}</p>
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

            {/* ── LEFT — Live Holographic Ring Panel ─────────────── */}
            <div className="hidden lg:flex lg:w-[52%] shrink-0 relative flex-col justify-between p-14 bg-[#030810] overflow-hidden">

                {/* Background Image & Related Animation */}
                <div className="absolute inset-0 z-0 bg-black overflow-hidden">
                    <img src="/images/energy_hands.png" alt="Energy Hands" className="w-full h-full object-cover scale-[1.35] origin-center" />
                    
                    {/* Pink Pulsating Orb Core (Perfectly aligned with zoomed spark) */}
                    <div className="absolute top-[47.3%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-pink-600/30 rounded-full blur-[60px] animate-pulse mix-blend-screen pointer-events-none" />
                    <div className="absolute top-[47.3%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] bg-fuchsia-400/40 rounded-full blur-[30px] animate-ping pointer-events-none" style={{ animationDuration: '1s' }} />

                    {/* Pink Blinking Energy Sparks */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={`spark-${i}`}
                                className="absolute bg-pink-300 rounded-full shadow-[0_0_15px_3px_rgba(236,72,153,1)]"
                                style={{
                                    top: `calc(48% + ${(Math.random() - 0.5) * 40}%)`,
                                    left: `calc(50% + ${(Math.random() - 0.5) * 40}%)`,
                                    width: `${Math.random() * 4 + 1}px`,
                                    height: `${Math.random() * 4 + 1}px`,
                                    animation: `status-ping ${0.1 + Math.random() * 0.4}s steps(2, end) infinite alternate`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    opacity: Math.random() > 0.5 ? 0.9 : 0.1
                                }}
                            />
                        ))}
                    </div>

                    {/* Subtle Pink Lightning Flash Overlay */}
                    <div className="absolute inset-0 bg-pink-500/10 mix-blend-color-dodge animate-pulse pointer-events-none" style={{ animationDuration: '3s', animationTimingFunction: 'steps(2)' }} />
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
                        <span className="font-medium text-2xl text-gray-900">Co-Pilot</span>
                        <span className="block text-lg font-medium uppercase tracking-wide text-gray-500 mt-0.5">District Governance AI</span>
                    </div>
                </div>

                <div className="w-full max-w-[900px] space-y-6">

                    {/* Heading */}
                    <div>
                        <h2 className="text-6xl font-medium text-gray-900 ">Welcome back</h2>
                        <p className="text-gray-600 text-xl font-medium mt-1">Sign in to access your portal</p>
                    </div>

                    {/* Quick role selector */}
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {ACCOUNTS.map(acct => {
                                const Icon = acct.icon;
                                const isActive = activeRole === acct.role;
                                return (
                                    <button
                                        key={acct.role}
                                        id={`role-${acct.role}`}
                                        onClick={() => quickFill(acct)}
                                        className={`
                                            flex sm:flex-col items-center sm:justify-center p-4 rounded-2xl border-2 sm:text-center min-h-[80px] sm:min-h-[160px]
                                            transition-all duration-200 hover:scale-[1.02] active:scale-95 text-left gap-4 sm:gap-0
                                            ${isActive
                                                ? `${acct.border} ${acct.bg} shadow-md ${acct.glow}`
                                                : "border-gray-200 bg-white hover:border-gray-300"
                                            }
                                        `}
                                    >
                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 sm:mb-3 shrink-0 rounded-xl flex items-center justify-center ${isActive ? acct.bg : "bg-gray-100"} transition-colors`}>
                                            <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? acct.text : "text-gray-400"}`} />
                                        </div>
                                        <div className="flex flex-col sm:items-center justify-center w-full px-1">
                                            <p className={`text-lg sm:text-xl font-bold uppercase leading-tight w-full ${isActive ? acct.text : "text-gray-900"}`}>
                                                {acct.label}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-lg font-medium text-gray-500 text-center mt-3">
                            Tap a role to auto-fill credentials, then click Sign In
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                        <form onSubmit={handleLogin} className="space-y-5" noValidate>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="section-label ml-0.5">Official Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#C62828] transition-colors pointer-events-none" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setError(""); }}
                                        placeholder="your@email.in"
                                        className="input-field !pl-12 !text-lg text-gray-900"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="section-label ml-0.5">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#C62828] transition-colors pointer-events-none" />
                                    <input
                                        id="login-password"
                                        type={showPwd ? "text" : "password"}
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setError(""); }}
                                        placeholder="••••••••"
                                        className="input-field !pl-12 !pr-12 !text-lg text-gray-900"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C62828] transition-colors"
                                    >
                                        {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-2xl animate-fade-in">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    <p className="text-xl font-medium text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full !py-4 !text-lg mt-2"
                            >
                                {loading
                                    ? <Loader2 className="w-5 h-5 animate-spin" />
                                    : <>Sign In Securely <ArrowRight className="w-5 h-5" /></>
                                }
                            </button>
                        </form>

                        {/* Citizen public portal options */}
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                            <p className="text-lg font-medium uppercase tracking-wide text-gray-500 text-center mb-2">Citizen Services (No Account Required)</p>
                            
                            <a
                                href="/submit-complaint"
                                id="citizen-portal-link"
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-white border border-gray-200 text-gray-800 text-xl font-medium uppercase tracking-wide hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                            >
                                <MessageSquare className="w-5 h-5 text-[#B91C1C] group-hover:scale-110 transition-transform" />
                                Submit Complaint
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                            </a>

                            <a
                                href="/village-voice"
                                id="voice-portal-link"
                                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#B91C1C] text-white text-xl font-medium uppercase tracking-wide hover:bg-[#991717] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md group"
                            >
                                <Mic className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                                Speak to Register
                                <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        </div>
                    </div>

                    <p className="text-center text-lg font-medium uppercase tracking-wide text-gray-400">
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


