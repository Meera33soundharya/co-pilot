import React from "react";
import { Brain, Activity, ShieldCheck, Zap, Sparkles, Target, Clock, MessageSquare, Cpu, Layers } from "lucide-react";

export default function AIStatsPanel() {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Intro Card */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl p-8 group">
        {/* Abstract neural visual background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[2rem]">
          <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(200,29,37,0.15)_0%,transparent_50%)] animate-pulse-slow" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] opacity-30" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C81D25] to-[#800F15] shadow-lg shadow-[#C81D25]/30 border border-white/20">
              <Brain className="w-7 h-7 text-white" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">AI Workspace</h2>
              <p className="text-sm font-medium text-white/60">GovPilot Intelligence Core v4.2</p>
            </div>
          </div>

          <p className="text-base text-white/70 leading-relaxed font-medium mb-8">
            Advanced neural analysis for incoming complaints, automated summarization, and strategic action plan generation tailored for municipal workflows.
          </p>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80">
              <Sparkles className="w-3.5 h-3.5 text-[#C81D25]" /> Semantic Search
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C81D25]" /> XAI Certified
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/80">
              <Activity className="w-3.5 h-3.5 text-[#C81D25]" /> Live Processing
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Stat 1 */}
        <div className="rounded-[1.5rem] border border-white/5 bg-white/5 backdrop-blur-xl p-5 hover:bg-white/10 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
              +12% <Zap className="w-3 h-3" />
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-1">12,408</div>
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Processed</div>
        </div>

        {/* Stat 2 */}
        <div className="rounded-[1.5rem] border border-white/5 bg-white/5 backdrop-blur-xl p-5 hover:bg-white/10 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight mb-1">99.2%</div>
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Accuracy</div>
        </div>

        {/* Stat 3 */}
        <div className="col-span-2 rounded-[1.5rem] border border-white/5 bg-white/5 backdrop-blur-xl p-5 hover:bg-white/10 transition-colors duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-br from-[#C81D25]/20 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <Clock className="w-6 h-6 text-white/60" />
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight">1.2s</div>
              <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Avg Response Time</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* System Status */}
      <div className="mt-auto rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-sm font-bold text-emerald-400">Core Systems Online</span>
         </div>
         <Cpu className="w-4 h-4 text-emerald-400/50" />
      </div>

    </div>
  );
}
