import { DashboardLayout } from "@/components/DashboardLayout";
import { Quote, Sparkles, MessageSquare, History, Search, RefreshCw, Share2, Heart, Languages, Lightbulb } from "lucide-react";
import { useState } from "react";

const proverbsData = [
    { text: "Knowledge is like a garden: if it is not cultivated, it cannot be harvested.", origin: "African Proverb", meaning: "Education and wisdom require constant effort and maintenance.", category: "Wisdom" },
    { text: "A smooth sea never made a skilled sailor.", origin: "English Proverb", meaning: "Difficulties and challenges are necessary to develop character and skills.", category: "Growth" },
    { text: "Great trees from little acorns grow.", origin: "Old English", meaning: "Every big project or person starts with something very small.", category: "Beginnings" },
    { text: "He who asks a question is a fool for five minutes; he who does not ask a question remains a fool forever.", origin: "Chinese Proverb", meaning: "Shame in asking is a barrier to lifelong learning.", category: "Curiosity" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", origin: "Chinese Proverb", meaning: "It's never too late to start doing something productive.", category: "Action" },
];

export default function Proverbs() {
    const [index, setIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

    const nextProverb = () => {
        setAnimating(true);
        setTimeout(() => {
            setIndex((index + 1) % proverbsData.length);
            setAnimating(false);
        }, 500);
    };

    const current = proverbsData[index];

    return (
        <DashboardLayout title="Proverbs & Wisdom" subtitle="Daily linguistic treasures & governance philosophy">
            <div className="max-w-4xl mx-auto space-y-8 pb-12">

                {/* Main Card */}
                <div className="bg-white border border-gray-100 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[60px] pointer-events-none group-hover:bg-red-500/10 transition-all duration-700" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-500/5 blur-[60px] pointer-events-none group-hover:bg-gray-500/10 transition-all duration-700" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-10 group-hover:rotate-6 transition-all duration-500">
                            <Quote className="w-8 h-8 text-[#B91C1C]" />
                        </div>

                        <div className={`transition-all duration-500 transform ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600/60 mb-6 block">{current.category}</span>
                            <h2 className="text-3xl font-black text-gray-900 leading-tight mb-8">
                                “{current.text}”
                            </h2>
                            <p className="text-sm font-bold text-gray-400 font-serif italic mb-10">— {current.origin}</p>

                            <div className="max-w-xl mx-auto p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    <span className="font-black text-gray-900 uppercase text-[9px] tracking-widest mr-2">Analysis:</span>
                                    {current.meaning}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-12">
                            <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextProverb}
                                className="flex items-center gap-3 px-8 py-4 bg-gray-900 border border-transparent rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
                            >
                                <RefreshCw className={`w-4 h-4 ${animating ? "animate-spin" : ""}`} /> New Insight
                            </button>
                            <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sub Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-50 rounded-xl">
                                <Languages className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="font-black text-gray-900">Multi-lingual Wisdom</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-6">Explore governance proverbs in over 12 native languages, including Hindi, Marathi, and Tamil.</p>
                        <button className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2 hover:gap-3 transition-all">
                            Change Language <Search className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-violet-50 rounded-xl">
                                <Lightbulb className="w-5 h-5 text-violet-600" />
                            </div>
                            <h3 className="font-black text-gray-900">AI Proverbs Generator</h3>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed mb-6">Give our model a topic, and it will generate a brand new proverb based on historical wisdom patterns.</p>
                        <button className="text-[10px] font-black uppercase tracking-widest text-violet-600 flex items-center gap-2 hover:gap-3 transition-all">
                            Try Generator <Sparkles className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* History Bar */}
                <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black flex items-center gap-2"><History className="w-5 h-5 text-gray-500" /> Recent Favorites</h3>
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">3 Saved</span>
                    </div>
                    <div className="space-y-3">
                        {proverbsData.slice(0, 2).map((p, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="p-1.5 bg-white/10 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-xs text-white/80 truncate flex-1 font-medium">{p.text}</p>
                                <ArrowRight className="w-3.5 h-3.5 text-white/20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

import { ArrowRight } from "lucide-react";
