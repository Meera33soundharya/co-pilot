import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Eye, EyeOff, CheckCircle2, Lock, Mail } from "lucide-react";

/* ── Countdown Overlay ─────────────────────────────────────────── */
function CountdownOverlay({ onDone }: { onDone: () => void }) {
    const [phase, setPhase] = useState<"1" | "2" | "ready" | "done">("1");
    const [telemetry, setTelemetry] = useState<string[]>([]);

    useEffect(() => {
        const logs = [
            "[SYSTEM] Initializing Neural Core v4.2...",
            "[SECURE] Handshake protocol: SUCCESS",
            "[XAI] Weight verification: 99.8% match",
            "[VAULT] Hardware signature verified.",
            "[NETWORK] Syncing with Gov-Intra node-04..."
        ];

        logs.forEach((log, i) => {
            setTimeout(() => setTelemetry(prev => [...prev.slice(-4), log]), i * 400);
        });

        const t1 = setTimeout(() => setPhase("2"), 900);
        const t2 = setTimeout(() => setPhase("ready"), 1800);
        const t3 = setTimeout(() => {
            setPhase("done");
            onDone();
        }, 2800);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onDone]);

    const phaseConfig = {
        "1": { label: "1", sub: "Initializing...", color: "#3B82F6", glow: "rgba(59,130,246,0.4)" },
        "2": { label: "2", sub: "Loading Intelligence...", color: "#8B5CF6", glow: "rgba(139,92,246,0.4)" },
        "ready": { label: "Ready", sub: "Welcome to GovCo-Pilot", color: "#10B981", glow: "rgba(16,185,129,0.4)" },
        "done": { label: "Ready", sub: "Welcome to GovCo-Pilot", color: "#10B981", glow: "rgba(16,185,129,0.4)" },
    };

    const cfg = phaseConfig[phase];

    return (
        <div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
            style={{ background: "linear-gradient(135deg, #060D1A 0%, #0B1221 50%, #091628 100%)" }}
        >
            {/* Grid mesh */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(59,130,246,0.07) 1px, transparent 0)",
                backgroundSize: "36px 36px",
            }} />

            {/* Scanline */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="animate-scanline absolute left-0 right-0 h-[2px] opacity-20"
                    style={{ background: "linear-gradient(90deg, transparent, #3B82F6, transparent)" }} />
            </div>

            {/* Number / Ready */}
            <div key={phase} className="relative flex flex-col items-center gap-6" style={{ animation: "countBlast 0.45s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                {/* Glow ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 rounded-full blur-[80px] transition-all duration-500"
                        style={{ backgroundColor: cfg.glow }} />
                </div>

                {/* Circle */}
                <div
                    className="relative w-44 h-44 rounded-full border-4 flex items-center justify-center transition-all duration-300"
                    style={{
                        borderColor: cfg.color,
                        boxShadow: `0 0 60px ${cfg.glow}, inset 0 0 40px ${cfg.glow}`,
                        background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`
                    }}
                >
                    {phase === "ready" || phase === "done" ? (
                        <CheckCircle2 className="w-20 h-20" style={{ color: cfg.color }} />
                    ) : (
                        <span className="text-8xl font-black text-white" style={{ textShadow: `0 0 30px ${cfg.color}` }}>
                            {cfg.label}
                        </span>
                    )}

                    {/* Spinning ring */}
                    <div
                        className="absolute inset-[-8px] rounded-full border-t-2 border-r-2 border-transparent"
                        style={{ borderTopColor: cfg.color, borderRightColor: cfg.color, animation: "spin 1s linear infinite" }}
                    />
                </div>

                {/* Subtext */}
                <div className="text-center space-y-1">
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-white/40">{cfg.sub}</p>
                    {/* Dots progress */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                        {["1", "2", "ready"].map((p) => (
                            <div key={p} className="w-2 h-2 rounded-full transition-all duration-300"
                                style={{
                                    backgroundColor: (phase === p || (phase === "done" && p === "ready")) || (phase === "2" && p === "1") || (phase === "ready" && (p === "1" || p === "2")) || (phase === "done")
                                        ? cfg.color : "rgba(255,255,255,0.1)"
                                }}
                            />
                        ))}
                    </div>
                </div>
                {/* Telemetry Feed Overlay */}
                <div className="mt-8 font-mono text-[9px] text-[#D4AF37]/50 space-y-1 h-20 overflow-hidden">
                    {telemetry.map((t, idx) => (
                        <div key={idx} className="animate-fade-in flex gap-2">
                            <span className="opacity-40">{new Date().toLocaleTimeString()}</span>
                            <span>{t}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom brand */}
            <div className="absolute bottom-10 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                    GovCo-Pilot · AI Governance Intelligence
                </span>
            </div>

            <style>{`
                @keyframes countBlast {
                    from { opacity: 0; transform: scale(0.4); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

/* ── Login Page ────────────────────────────────────────────────── */
const demoCredentials = { email: "admin@govpilot.in", password: "GovAdmin@2026" };


export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [counting, setCounting] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }
        if (email !== demoCredentials.email || password !== demoCredentials.password) {
            setError("Invalid credentials. Use the demo credentials below.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setCounting(true);
        }, 800);
    };

    const fillDemo = () => {
        setEmail(demoCredentials.email);
        setPassword(demoCredentials.password);
        setError("");
    };

    return (
        <>
            {counting && <CountdownOverlay onDone={() => navigate("/dashboard")} />}

            <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #060D1A 0%, #0B1221 50%, #091628 100%)" }}>
                {/* Visual Flair */}
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

                {/* Grid mesh */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, rgba(59,130,246,0.06) 1px, transparent 0)",
                    backgroundSize: "36px 36px"
                }} />

                <div className="w-full max-w-md relative z-10">
                    {/* Brand Header */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/40 mb-6 group cursor-pointer active:scale-95 transition-transform">
                            <BrainCircuit className="w-9 h-9 text-white group-hover:rotate-12 transition-transform" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Secure Access</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] mt-2">Intelligence Authentication</p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-2xl shadow-2xl space-y-8">
                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email */}
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                                    Administrative Email
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="admin@govpilot.in"
                                        className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/10 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">
                                    Intelligence Key
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        id="login-password"
                                        type={showPwd ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/10 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(v => !v)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                                    >
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="px-5 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-shake">
                                    <p className="text-xs font-bold text-rose-400">{error}</p>
                                </div>
                            )}

                            {/* Sign In Button */}
                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-2xl text-[11px] font-black text-white uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-600/40 disabled:opacity-60 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Verifying Authorization...
                                    </>
                                ) : (
                                    "Initialize Core Connection"
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 py-2">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10">Credential Vault</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        {/* Demo Credential Card */}
                        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-3xl space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                                    Demo Access
                                </p>
                                <button
                                    id="fill-demo-btn"
                                    type="button"
                                    onClick={fillDemo}
                                    className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-white transition-all px-4 py-2 bg-blue-500/10 rounded-xl hover:bg-blue-600 border border-blue-500/20 hover:border-blue-400 shadow-lg"
                                >
                                    Auto-fill
                                </button>
                            </div>
                            <div className="space-y-2 font-mono">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">Email</span>
                                    <span className="text-[11px] text-white/80 font-bold">{demoCredentials.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-white/20 uppercase font-black tracking-widest">Key</span>
                                    <span className="text-[11px] text-white/80 font-bold">{demoCredentials.password}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-2 text-center text-[9px] font-black uppercase tracking-[0.3em] text-white/10">
                            GovCo-Pilot v4.2 · Secure Intelligence Platform
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
