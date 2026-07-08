import React, { useState } from "react";
import { Sparkles, FileText, Mic } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AICoPilot() {
  const [inputContext, setInputContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAction(action: string) {
    if (!inputContext) return;
    setLoading(true);
    setOutput("");
    
    // Simulate AI response
    setTimeout(() => {
      if (action === 'summarize') {
        const lines = inputContext.split('\n').filter(l => l.trim().length > 0);
        const title = lines[0] || "Provided Document";
        setOutput(`**Executive Summary**\n\n**Subject:** ${title}\n\n**Key Takeaways:**\n• The document outlines several critical operational points that require immediate attention.\n• Key focus is placed on addressing the grievances and issues raised in the context.\n• Immediate action is recommended to resolve pending items and improve overall efficiency.\n\n**Action Items:**\n1. Review the specific data points mentioned.\n2. Prioritize the oldest pending tasks.\n3. Implement a structured timeline for resolution.`);
      } else {
        const lines = inputContext.split('\n').filter(l => l.trim().length > 0);
        const title = lines[0] || "recent matters";
        setOutput(`**Draft Speech**\n\nLadies and Gentlemen,\n\nToday I stand before you to address the pressing matters regarding: ${title}.\n\nWe have reviewed the context thoroughly and are committed to taking swift, decisive action on the issues that have been brought to our attention. The challenges we face require our united effort and dedication.\n\nWe hear your concerns loud and clear, and we are working tirelessly to ensure that they are addressed promptly and effectively.\n\nThank you for your patience and continued cooperation.`);
      }
      setLoading(false);
    }, 1500);
  }

  return (
    <DashboardLayout 
      title="AI Co-Pilot" 
      subtitle="Your secure intelligence assistant for drafting, summarization, and analysis."
    >
      <div className="h-[calc(100vh-14rem)] min-h-[500px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          
          {/* Input Context Panel */}
          <div className="bg-[#0B1120] border border-[#1E293B] rounded-2xl p-6 flex flex-col h-full shadow-lg">
            <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
              <Sparkles className="w-5 h-5 text-blue-400" /> Input Context
            </div>
            
            <textarea 
              value={inputContext}
              onChange={e => setInputContext(e.target.value)}
              placeholder="Paste documents, notes, or provide context here..."
              className="flex-1 w-full bg-white border border-gray-300 rounded-xl p-4 text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none mb-6 custom-scrollbar shadow-sm"
            />
            
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button 
                onClick={() => handleAction('summarize')}
                disabled={loading}
                className="flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl border border-[#1E293B] bg-[#1E293B]/30 hover:bg-[#1E293B] text-gray-300 hover:text-white transition-colors text-lg font-medium"
              >
                <FileText className="w-4 h-4" /> Summarize
              </button>
              <button 
                onClick={() => handleAction('draft')}
                disabled={loading}
                className="flex-1 flex justify-center items-center gap-2 px-4 py-3 rounded-xl border border-[#1E293B] bg-[#1E293B]/30 hover:bg-[#1E293B] text-gray-300 hover:text-white transition-colors text-lg font-medium"
              >
                <Mic className="w-4 h-4" /> Draft Speech
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-[#0B1120] border border-[#1E293B] rounded-2xl p-6 flex flex-col h-full shadow-lg">
            <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
              Output
            </div>
            
            <div className="flex-1 w-full bg-white border border-gray-300 rounded-xl p-4 flex items-center justify-center overflow-y-auto custom-scrollbar shadow-sm">
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <Sparkles className="w-8 h-8 animate-spin" />
                  <span className="text-lg">Processing...</span>
                </div>
              ) : output ? (
                <div className="w-full h-full text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {output}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Sparkles className="w-8 h-8 opacity-50" />
                  <span className="text-lg">Select an action to generate content</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
