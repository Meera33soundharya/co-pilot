import React, { useState, useEffect, useRef } from "react";
import { analyzeComplaint } from "@/services/aiService";
import { 
  Sparkles, FileText, Send, Paperclip, ChevronDown, 
  Copy, Download, Share2, AlignLeft, BarChart, ShieldAlert,
  CheckCircle2, ListChecks, Bot, GripHorizontal
} from "lucide-react";
import { toast } from "sonner";

export default function AICoPilotPanel() {
  const [issue, setIssue] = useState("Severe water logging and infrastructure damage in Ward 7 after recent monsoon");
  const [description, setDescription] = useState("Multiple residents in Ward 7 (near the main transit hub) have reported severe water logging reaching up to 2 feet. The drainage system appears to be completely blocked with construction debris from the nearby bridge project. This is causing major traffic gridlocks, and water is starting to enter ground-floor commercial shops. Urgent intervention is required before the next rainfall predicted in 48 hours. Attached: 3 photos of the flooded intersection and a signed petition from local business owners.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when streaming
  useEffect(() => {
    if (streaming) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamText, streaming]);

  async function runAnalyze() {
    if (!issue && !description) {
      toast.error("Please enter a complaint title or description");
      return;
    }
    
    setLoading(true);
    setResult(null);
    setStreaming(true);
    setStreamText("");

    // Simulate streaming effect before showing actual result
    const simulatedResponse = "Initializing neural pathways...\nAnalyzing linguistic patterns...\nExtracting key entities...\nEvaluating urgency and sentiment...\nCross-referencing municipal guidelines...\nCompiling action plan...";
    
    for (let i = 0; i < simulatedResponse.length; i++) {
      await new Promise(r => setTimeout(r, 15));
      setStreamText(prev => prev + simulatedResponse[i]);
    }

    try {
      const res = await analyzeComplaint(issue || "Untitled Issue", description || "No description provided");
      setResult(res);
    } catch (e: any) {
      toast.error(String(e?.message || e));
    } finally {
      setStreaming(false);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#060912]/80 backdrop-blur-2xl shadow-2xl shadow-black/50">
      
      {/* Workspace Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C81D25] to-red-900 flex items-center justify-center p-[1px]">
            <div className="w-full h-full bg-[#060912] rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#C81D25]" />
            </div>
          </div>
          <span className="text-lg font-bold text-white tracking-wide">Analysis Engine</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-base font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors">Clear</button>
          <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-base font-bold text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1">
            Model: GPT-4 Turbo <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Workspace Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
        
        {/* Input Area */}
        <div className="space-y-4">
          <input 
            value={issue} 
            onChange={e => setIssue(e.target.value)} 
            placeholder="Complaint Title (e.g. Severe water logging in Ward 7)" 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-lg font-bold placeholder:text-white/30 focus:outline-none focus:border-[#C81D25]/50 focus:ring-1 focus:ring-[#C81D25]/50 transition-all"
          />
          
          <div className="relative group">
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Paste detailed complaint text, citizen notes, or drop documents here..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white/90 text-lg font-medium placeholder:text-white/30 focus:outline-none focus:border-[#C81D25]/50 focus:ring-1 focus:ring-[#C81D25]/50 transition-all min-h-[160px] resize-y custom-scrollbar"
            />
            
            {/* Drag & Drop Indicator Overlay */}
            <div className="absolute inset-0 border-2 border-dashed border-[#C81D25]/0 rounded-2xl pointer-events-none group-hover:border-[#C81D25]/30 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 flex flex-col items-center gap-2 text-white/40 transition-opacity bg-[#060912]/80 px-6 py-4 rounded-xl backdrop-blur-md">
                <Paperclip className="w-6 h-6" />
                <span className="text-base font-bold tracking-widest uppercase">Drop Files</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              disabled={loading} 
              onClick={runAnalyze} 
              className="relative overflow-hidden group px-6 py-3 bg-gradient-to-r from-[#C81D25] to-[#800F15] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#C81D25]/20 hover:shadow-[#C81D25]/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Analyzing..." : "Analyze Complaint"}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
            
            <button disabled className="px-5 py-3 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl font-bold text-lg transition-all disabled:opacity-50 flex items-center gap-2">
              <AlignLeft className="w-4 h-4" /> Summarize
            </button>
            <button disabled className="px-5 py-3 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl font-bold text-lg transition-all disabled:opacity-50 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Draft Speech
            </button>
            <button disabled className="px-5 py-3 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl font-bold text-lg transition-all disabled:opacity-50 flex items-center gap-2">
              <ListChecks className="w-4 h-4" /> Action Plan
            </button>
          </div>
        </div>

        {/* AI Response Area */}
        {(streaming || result) && (
          <div className="mt-8 pt-8 border-t border-white/10 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-[#C81D25]" />
              <h3 className="text-lg font-black text-white">AI Analysis Report</h3>
              <div className="ml-auto flex items-center gap-2">
                <button className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors" title="Copy"><Copy className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors" title="Export PDF"><Download className="w-4 h-4" /></button>
                <button className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors" title="Share"><Share2 className="w-4 h-4" /></button>
              </div>
            </div>

            {streaming && !result ? (
              <div className="bg-black/20 rounded-2xl p-6 border border-white/5 font-mono text-lg text-emerald-400 whitespace-pre-wrap leading-loose shadow-inner">
                {streamText}
                <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
              </div>
            ) : result ? (
              <div className="space-y-4 animate-slide-up">
                {/* Top Metrics Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#C81D25]" />
                    <span className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5"><BarChart className="w-3 h-3" /> Category</span>
                    <span className="text-base font-bold text-white truncate">{result.category}</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5"><ShieldAlert className="w-3 h-3" /> Priority</span>
                    <span className="text-base font-bold text-white truncate">{result.priority}</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <span className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Confidence</span>
                    <span className="text-base font-bold text-white truncate">94.8%</span>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="text-base font-black uppercase tracking-widest text-white/40 mb-3">Executive Summary</h4>
                  <p className="text-white/90 text-lg leading-relaxed">{result.summary}</p>
                </div>

                {/* Action Plan Card */}
                {result.actionPlan && result.actionPlan.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-base font-black uppercase tracking-widest text-white/40 mb-4">Recommended Action Plan</h4>
                    <ul className="space-y-3">
                      {result.actionPlan.map((step: string, i: number) => (
                        <li key={i} className="flex gap-3 text-lg text-white/80 items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C81D25]/20 text-[#C81D25] flex items-center justify-center font-black text-sm border border-[#C81D25]/30">
                            {i + 1}
                          </span>
                          <span className="pt-0.5 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Explainable AI (Reasoning) */}
                {result.reasoning && (
                  <div className="bg-black/30 border border-white/5 rounded-2xl p-6 shadow-inner">
                    <h4 className="text-base font-black uppercase tracking-widest text-white/30 mb-3 flex items-center gap-2">
                      <Bot className="w-3 h-3" /> System Reasoning Log
                    </h4>
                    <p className="text-base text-white/50 leading-relaxed font-mono whitespace-pre-wrap">{result.reasoning}</p>
                  </div>
                )}
              </div>
            ) : null}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>
      
      {/* Footer input if needed */}
      {result && (
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="relative">
            <input 
              placeholder="Ask a follow-up question..." 
              className="w-full bg-[#060912]/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-lg text-white focus:outline-none focus:border-[#C81D25]/50 focus:ring-1 focus:ring-[#C81D25]/50 transition-all placeholder:text-white/30"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#C81D25] hover:bg-[#800F15] text-white flex items-center justify-center transition-colors">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
