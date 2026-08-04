import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Terminal, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-red-500/30">
            {/* ── Background Effects ── */}
            <div className="absolute inset-0 w-full h-full">
                {/* Radial gradient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />
                {/* Subtle grid pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.03]" 
                    style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-w-3xl w-full flex flex-col items-center text-center space-y-10"
            >
                {/* ── Security Alert Badge ── */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 backdrop-blur-md"
                >
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-red-400">System Alert: Path Disconnected</span>
                </motion.div>

                {/* ── Premium 3D Illustration ── */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    className="relative w-72 h-72 sm:w-96 sm:h-96"
                >
                    <motion.div 
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <img 
                            src="/premium_404.png" 
                            alt="Disconnected System" 
                            className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(185,28,28,0.3)]"
                        />
                    </motion.div>
                </motion.div>

                {/* ── Typography ── */}
                <div className="space-y-4 max-w-xl">
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter"
                    >
                        404
                    </motion.h1>
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-2xl sm:text-3xl font-bold text-gray-200 tracking-tight"
                    >
                        Intelligence Gap Detected
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-base sm:text-lg text-gray-400 font-medium leading-relaxed"
                    >
                        The requested sector has been retracted or relocated. 
                        Please return to an authorized node to continue your operations.
                    </motion.p>
                </div>

                {/* ── Action Buttons ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-base font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-red-600 rounded-2xl text-base font-bold text-white overflow-hidden transition-all hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:shadow-[0_0_50px_rgba(220,38,38,0.5)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Home className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Return to Dashboard</span>
                    </button>
                </motion.div>

                {/* ── Terminal Footer ── */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 flex items-center gap-2 text-xs font-mono text-gray-600 uppercase"
                >
                    <Terminal className="w-3 h-3" />
                    <span>GovPilot // Process Terminated // Connection Reset</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
