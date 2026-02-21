import { useNavigate } from "react-router-dom";
import { Home, AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
                {/* Animated Icon Container */}
                <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <AlertCircle className="w-16 h-16 text-white" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter">404</h1>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Intelligence Gap Detected</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        The page you are looking for has been retracted, relocated, or never existed in the current governance grid.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-black text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 rounded-2xl text-sm font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        Return to Dashboard
                    </button>
                </div>

                <div className="pt-8 flex items-center justify-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">GovPilot System Security Active</span>
                </div>
            </div>
        </div>
    );
}
