import { DashboardLayout } from "@/components/DashboardLayout";
import { Gamepad2, Trophy, Clock, Zap, Star, RefreshCw, ArrowRight, Brain, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

const gameChallenges = [
    { word: "GRIVANCE", correct: "GRIEVANCE", hint: "A formal complaint about something believed to be wrong or unfair.", category: "Gov-Term" },
    { word: "POLLICY", correct: "POLICY", hint: "A course or principle of action adopted or proposed by a government.", category: "Gov-Term" },
    { word: "INFRASTRUKTURE", correct: "INFRASTRUCTURE", hint: "The basic physical and organizational structures and facilities.", category: "Infrastructure" },
    { word: "ANNALITICS", correct: "ANALYTICS", hint: "The systematic computational analysis of data or statistics.", category: "Data" },
    { word: "GOVERNENCE", correct: "GOVERNANCE", hint: "The action or manner of governing.", category: "Core" },
];

export default function RewordGame() {
    const [index, setIndex] = useState(0);
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">("none");
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(false);

    const current = gameChallenges[index];

    useEffect(() => {
        let timer: number;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    const handleCheck = () => {
        if (input.toUpperCase() === current.correct) {
            setFeedback("correct");
            setScore(prev => prev + 10);
            setTimeout(() => {
                setIndex((index + 1) % gameChallenges.length);
                setInput("");
                setFeedback("none");
            }, 1000);
        } else {
            setFeedback("wrong");
            setTimeout(() => setFeedback("none"), 1000);
        }
    };

    return (
        <DashboardLayout title="Reword Game" subtitle="Train your governance vocabulary and precision">
            <div className="max-w-4xl mx-auto space-y-8 pb-12">

                {/* Game Header */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <Trophy className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Score</p>
                            <p className="text-xl font-black text-gray-900">{score}</p>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-rose-50 rounded-2xl">
                            <Clock className={`w-5 h-5 ${timeLeft < 10 ? "text-rose-500 animate-pulse" : "text-gray-400"}`} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Time Left</p>
                            <p className={`text-xl font-black ${timeLeft < 10 ? "text-rose-600" : "text-gray-900"}`}>{timeLeft}s</p>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-2xl">
                            <Star className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Level</p>
                            <p className="text-xl font-black text-gray-900">Expert</p>
                        </div>
                    </div>
                </div>

                {/* Main Game Card */}
                <div className="bg-[#0B1221] rounded-[3rem] p-12 shadow-2xl relative overflow-hidden text-white text-center">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[80px] pointer-events-none" />

                    {!isActive && score === 0 ? (
                        <div className="relative z-10 py-10">
                            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-600/40">
                                <Gamepad2 className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-black mb-4 tracking-tight">Governance Lexicon Training</h2>
                            <p className="text-white/40 text-sm mb-10 max-w-sm mx-auto">Correct the misspelled governance terms as fast as you can. Boost your AI co-pilot's confidence level.</p>
                            <button
                                onClick={() => { setIsActive(true); setTimeLeft(30); }}
                                className="px-10 py-5 bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                            >
                                Start Training Session
                            </button>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-2 mb-10">
                                <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/30">
                                    {current.category}
                                </span>
                            </div>

                            <h2 className="text-5xl font-black tracking-[0.15em] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                {current.word}
                            </h2>
                            <p className="text-white/40 text-xs italic mb-12">Hint: {current.hint}</p>

                            <div className="max-w-md mx-auto relative mb-8">
                                <input
                                    autoFocus
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                                    placeholder="Type correct spelling..."
                                    className={`w-full bg-white/5 border-2 rounded-2xl px-6 py-5 text-xl font-bold focus:outline-none transition-all text-center uppercase tracking-widest ${feedback === "correct" ? "border-emerald-500 bg-emerald-500/10" :
                                        feedback === "wrong" ? "border-rose-500 bg-rose-500/10" :
                                            "border-white/10 focus:border-blue-500 focus:bg-white/10"
                                        }`}
                                />
                                {feedback === "correct" && (
                                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-emerald-400 animate-bounce">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                )}
                                {feedback === "wrong" && (
                                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-rose-500 animate-shake">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={handleCheck}
                                    className="px-8 py-4 bg-white text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg"
                                >
                                    Verify Input
                                </button>
                                <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                    <Zap className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Game Stats / Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-violet-500" /> Training Impact
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 font-bold uppercase tracking-widest">Cognitive Load</span>
                                <span className="font-black text-gray-900">Moderate</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-500 rounded-full" style={{ width: '65%' }} />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 font-bold uppercase tracking-widest">Precision Score</span>
                                <span className="font-black text-gray-900">88%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '88%' }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 text-emerald-500" /> Quick Reset
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">Want to try a different category? Reset your progress and start a new training session.</p>
                        </div>
                        <button className="w-full mt-6 py-4 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                            Start New Game <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}


