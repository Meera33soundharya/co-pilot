import React, { useState } from "react";
import { Sparkles, FileText, Mic } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AICoPilot() {
  const [inputContext, setInputContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  function buildContentAwareSummary(context: string) {
    const lines = context.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const title = lines[0] || "Provided Document";
    const lower = context.toLowerCase();

    const bulletPoints = lines.filter(l => l.match(/^[-*•\d]\.?\s/));
    let extractedPoints = "";
    
    if (bulletPoints.length > 0) {
      extractedPoints = bulletPoints.slice(0, 5).map(b => `• ${b.replace(/^[-*•\d]\.?\s*/, '')}`).join('\n');
    } else {
      const contentLines = lines.slice(1, 4);
      if (contentLines.length > 0) {
        extractedPoints = contentLines.map(l => `• ${l.length > 120 ? l.substring(0, 117) + '...' : l}`).join('\n');
      } else {
        extractedPoints = "• No significant details found to extract.";
      }
    }

    let category = "General Analysis";
    if (/(technical|requirements|system|workflow|integration|code|fix|bug)/i.test(lower)) category = "Technical Specifications";
    else if (/(complaint|grievance|citizen|issue|ward)/i.test(lower)) category = "Citizen Grievance";
    else if (/(meeting|agenda|decision|action items)/i.test(lower)) category = "Meeting Minutes";
    else if (/(policy|guideline|regulation|compliance)/i.test(lower)) category = "Policy Guidance";
    else if (/(report|kpi|finding|recommendation|performance)/i.test(lower)) category = "Operational Report";

    return `**Executive Summary**\n\n**Subject:** ${title}\n\n**Document Classification:** ${category}\n\n**Important Points Extracted:**\n${extractedPoints}\n\n**Recommended Action Items:**\n1. Review the extracted points for operational impact.\n2. Assign actionable items to the relevant department.\n3. Track completion in the master dashboard.`;
  }

  async function handleAction(action: string) {
    if (!inputContext) return;
    setLoading(true);
    setOutput("");

    setTimeout(() => {
      if (action === 'summarize') {
        setOutput(buildContentAwareSummary(inputContext));
      } else {
        const lines = inputContext.split('\n').filter((line) => line.trim().length > 0);
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
            
            <div className="flex-1 w-full bg-white border border-gray-300 rounded-xl p-6 overflow-y-auto custom-scrollbar shadow-sm">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-500">
                  <Sparkles className="w-8 h-8 animate-spin" />
                  <span className="text-lg">Processing your request...</span>
                </div>
              ) : output ? (
                <div className="w-full text-lg text-gray-800 whitespace-pre-wrap leading-relaxed space-y-4">
                  {output.split('\n\n').map((paragraph, i) => (
                    <p key={i}>
                      {paragraph.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong>;
                        }
                        return <span key={j}>{part}</span>;
                      })}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                  <Sparkles className="w-8 h-8 opacity-50" />
                  <span className="text-lg text-center max-w-sm">Select an action on the left to generate content based on your context.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
