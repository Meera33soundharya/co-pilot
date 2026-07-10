import React, { useState } from "react";
import {
  FileText, Sparkles, RefreshCw, CheckCircle2,
  AlertTriangle, Clock, ChevronRight, Zap, Brain
} from "lucide-react";
import type { ExecutiveSummary } from "@/services/documentAiService";

interface ExecutiveSummaryPanelProps {
  summary: ExecutiveSummary | null | undefined;
  status: "idle" | "extracting" | "summarizing" | "done" | "error";
  onRegenerate?: () => void;
  compact?: boolean;
}

export function ExecutiveSummaryPanel({
  summary,
  status,
  onRegenerate,
  compact = false,
}: ExecutiveSummaryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // ── Loading State ──
  if (status === "extracting" || status === "summarizing") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-5 py-3 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-200 animate-spin flex items-center justify-center">
              <RefreshCw className="w-3 h-3 text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-indigo-800">
              {status === "extracting" ? "Extracting Document Content..." : "Generating AI Summary..."}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-indigo-500 bg-indigo-100 px-2 py-1 rounded-full">
            Processing
          </span>
        </div>
        <div className="p-5 space-y-4">
          {/* Skeleton lines */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded-lg w-3/4 animate-shimmer" />
            <div className="h-3 bg-gray-100 rounded-lg w-full animate-shimmer" style={{ animationDelay: "0.1s" }} />
            <div className="h-3 bg-gray-100 rounded-lg w-5/6 animate-shimmer" style={{ animationDelay: "0.2s" }} />
            <div className="h-3 bg-gray-100 rounded-lg w-4/6 animate-shimmer" style={{ animationDelay: "0.3s" }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded-lg w-2/3 animate-shimmer" style={{ animationDelay: "0.4s" }} />
              <div className="h-3 bg-gray-100 rounded-lg w-full animate-shimmer" style={{ animationDelay: "0.5s" }} />
              <div className="h-3 bg-gray-100 rounded-lg w-4/5 animate-shimmer" style={{ animationDelay: "0.6s" }} />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-100 rounded-lg w-2/3 animate-shimmer" style={{ animationDelay: "0.7s" }} />
              <div className="h-3 bg-gray-100 rounded-lg w-full animate-shimmer" style={{ animationDelay: "0.8s" }} />
              <div className="h-3 bg-gray-100 rounded-lg w-3/5 animate-shimmer" style={{ animationDelay: "0.9s" }} />
            </div>
          </div>
          {/* Pipeline progress bar */}
          <div className="pt-2">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                  style={{ width: status === "extracting" ? "40%" : "75%" }}
                />
              </div>
              <span className="font-bold text-indigo-600">
                {status === "extracting" ? "Step 1/2" : "Step 2/2"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (status === "error" || (!summary && status === "done")) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">Summary Generation Failed</h4>
              <p className="text-xs text-red-700 mt-0.5">
                Unable to extract sufficient content from this document.
              </p>
            </div>
          </div>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Idle State (no summary yet) ──
  if (!summary) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-700">Executive Summary</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Click "Generate" to analyze this document with AI.
              </p>
            </div>
          </div>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Summary
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Full Summary Display ──
  const timeAgo = getTimeAgo(summary.generatedAt);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-slate-50 via-indigo-50/40 to-purple-50/30 px-5 py-3 border-b border-gray-100 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
            <FileText className="w-3.5 h-3.5 text-white" />
          </div>
          Executive Summary
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
        </h4>
        <div className="flex items-center gap-2">
          {/* Confidence indicator */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-2.5 py-1">
            <div className={`w-1.5 h-1.5 rounded-full ${summary.confidence >= 80 ? "bg-emerald-500" : summary.confidence >= 50 ? "bg-amber-500" : "bg-red-500"}`} />
            <span className="text-[10px] font-bold text-gray-600">{summary.confidence}%</span>
          </div>

          <span className="text-[10px] uppercase font-bold text-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" />
            {summary.source === "gemini" ? "Gemini AI" : "AI Engine"}
          </span>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="p-5 space-y-5 animate-fadeIn">
          {/* Subject */}
          <div>
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-indigo-400" />
              Subject
            </h5>
            <p className="text-sm font-bold text-gray-900 leading-snug">{summary.subject}</p>
          </div>

          {/* Summary */}
          <div>
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-blue-400" />
              Summary
            </h5>
            <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
          </div>

          {/* Highlights & Actions in 2-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Key Highlights */}
            <div>
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Key Highlights
              </h5>
              <ul className="space-y-2">
                {summary.highlights.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-gray-700 animate-slideInLeft"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0" />
                    <span className="leading-snug">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div>
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                Recommended Actions
              </h5>
              <ol className="space-y-2">
                {summary.actions.map((action, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-gray-700 animate-slideInLeft"
                    style={{ animationDelay: `${(idx + summary.highlights.length) * 80}ms` }}
                  >
                    <span className="mt-0.5 w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{action}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Footer: Meta & Regenerate */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Generated {timeAgo}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Based on document content only
              </span>
            </div>
            {onRegenerate && (
              <button
                onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                className="px-3 py-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
