import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Search, FileText, FileImage, FileVideo, FileAudio,
  X, Eye, Download, RotateCcw, AlertCircle, Trash, Trash2,
  Clock, CheckCircle2, Sparkles, ChevronRight,
  AlertTriangle, CheckCircle, Loader2, ExternalLink,
  FileSearch, Bot, Flag, ScrollText, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type Status   = "Uploading" | "Queued" | "Processing" | "Completed" | "Failed" | "Cancelled";
type Priority = "High" | "Medium" | "Low";
type FileType = "PDF" | "Image" | "Video" | "Audio" | "Doc";

interface LogEntry {
  time: string;
  event: string;
  level: "info" | "warn" | "error" | "success";
}

interface QueueItem {
  id: string;
  complaintId: string;
  fileName: string;
  fileSize: string;
  fileType: FileType;
  status: Status;
  progress: number;
  priority: Priority;
  aiService: string;
  retryCount?: number;
  maxRetries?: number;
  date: string;
  errorMessage?: string;
  resultSummary?: string;
  logs?: LogEntry[];
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const INITIAL_DATA: QueueItem[] = [
  {
    id: "MQ-1000", complaintId: "GRV-2026-5000", fileName: "evidence_image_1.jpg",
    fileSize: "14.5 MB · 1920×1080", fileType: "Image", status: "Uploading",
    progress: 45, priority: "High", aiService: "Vision AI", date: "25 Jul, 11:02 am",
    logs: [
      { time: "11:02:01", event: "File upload initiated", level: "info" },
      { time: "11:02:08", event: "Chunk 1/8 transferred (2 MB)", level: "info" },
      { time: "11:02:22", event: "Chunk 4/8 transferred (8 MB) — 45%", level: "info" },
    ],
  },
  {
    id: "MQ-1001", complaintId: "GRV-2026-5001", fileName: "evidence_video_1.mp4",
    fileSize: "8.3 MB · 3840×2160", fileType: "Video", status: "Queued",
    progress: 0, priority: "Medium", aiService: "Video Analyzer", date: "25 Jul, 11:03 am",
    logs: [
      { time: "11:03:14", event: "File received and queued", level: "info" },
      { time: "11:03:14", event: "Waiting for Video Analyzer worker slot", level: "info" },
    ],
  },
  {
    id: "MQ-1002", complaintId: "GRV-2026-5002", fileName: "evidence_pdf_2.pdf",
    fileSize: "1.2 MB", fileType: "PDF", status: "Completed",
    progress: 100, priority: "Low", aiService: "Doc AI", date: "25 Jul, 11:04 am",
    resultSummary: "Document contains 4 pages of financial records. OCR extracted 98.7% of text with high confidence. Key entities: 3 names, 2 dates, 1 account number. Classification: Financial Evidence.",
    logs: [
      { time: "11:04:02", event: "File upload completed", level: "success" },
      { time: "11:04:03", event: "OCR pipeline started", level: "info" },
      { time: "11:04:09", event: "OCR completed — 98.7% confidence", level: "success" },
      { time: "11:04:10", event: "Entity extraction started", level: "info" },
      { time: "11:04:14", event: "3 names, 2 dates, 1 account number found", level: "success" },
      { time: "11:04:15", event: "Classification: Financial Evidence", level: "success" },
      { time: "11:04:15", event: "Result stored — processing complete", level: "success" },
    ],
  },
  {
    id: "MQ-1003", complaintId: "GRV-2026-5003", fileName: "evidence_audio_1.mp3",
    fileSize: "1.8 MB", fileType: "Audio", status: "Failed",
    progress: 99, priority: "High", aiService: "Speech AI", date: "25 Jul, 11:07 am",
    retryCount: 0, maxRetries: 3,
    errorMessage: "Speech AI service timeout. Audio codec not supported (MP3 CBR 320kbps). Please convert to WAV/FLAC and retry.",
    logs: [
      { time: "11:07:05", event: "File upload completed", level: "success" },
      { time: "11:07:06", event: "Speech AI inference started", level: "info" },
      { time: "11:07:31", event: "WARNING: codec MP3 CBR 320kbps may be unsupported", level: "warn" },
      { time: "11:07:45", event: "TIMEOUT: Speech AI did not respond within 30s", level: "error" },
      { time: "11:07:45", event: "Job marked as FAILED", level: "error" },
    ],
  },
  {
    id: "MQ-1004", complaintId: "GRV-2026-5004", fileName: "evidence_docum_1.docx",
    fileSize: "1.4 MB", fileType: "Doc", status: "Cancelled",
    progress: 0, priority: "Medium", aiService: "Doc AI", date: "25 Jul, 11:12 am",
    logs: [
      { time: "11:12:00", event: "File queued", level: "info" },
      { time: "11:12:34", event: "Job cancelled by operator", level: "warn" },
    ],
  },
  {
    id: "MQ-1005", complaintId: "GRV-2026-5005", fileName: "evidence_image_2.png",
    fileSize: "10.3 MB · 1920×1080", fileType: "Image", status: "Processing",
    progress: 65, priority: "Low", aiService: "Vision AI", date: "25 Jul, 11:17 am",
    logs: [
      { time: "11:17:01", event: "Upload complete", level: "success" },
      { time: "11:17:02", event: "Vision AI inference started", level: "info" },
      { time: "11:17:10", event: "Object detection pass 1 complete", level: "success" },
      { time: "11:17:19", event: "Running scene classification — 65%", level: "info" },
    ],
  },
  {
    id: "MQ-1008", complaintId: "GRV-2026-5008", fileName: "evidence_audio_2.wav",
    fileSize: "4.3 MB", fileType: "Audio", status: "Failed",
    progress: 90, priority: "Low", aiService: "Speech AI", date: "25 Jul, 11:28 am",
    retryCount: 2, maxRetries: 3,
    errorMessage: "Speech-to-text model encountered memory allocation error at 90% completion. 2 retries attempted.",
    logs: [
      { time: "11:28:01", event: "Upload complete", level: "success" },
      { time: "11:28:02", event: "Speech AI inference started (attempt 1)", level: "info" },
      { time: "11:28:30", event: "ERROR: out-of-memory at 90%", level: "error" },
      { time: "11:28:31", event: "Retry 1/3 scheduled", level: "warn" },
      { time: "11:28:35", event: "Speech AI inference started (attempt 2)", level: "info" },
      { time: "11:29:01", event: "ERROR: out-of-memory at 90%", level: "error" },
      { time: "11:29:02", event: "Retry 2/3 scheduled", level: "warn" },
      { time: "11:29:06", event: "Speech AI inference started (attempt 3)", level: "info" },
      { time: "11:29:31", event: "ERROR: out-of-memory at 90%", level: "error" },
      { time: "11:29:32", event: "Max retries reached — job FAILED", level: "error" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FileIcon({ type }: { type: FileType }) {
  if (type === "Image") return <FileImage className="w-5 h-5 text-blue-500" />;
  if (type === "Video") return <FileVideo className="w-5 h-5 text-purple-500" />;
  if (type === "Audio") return <FileAudio className="w-5 h-5 text-amber-500" />;
  return <FileText className="w-5 h-5 text-gray-500" />;
}

function statusBadgeClass(status: Status): string {
  const map: Record<Status, string> = {
    Uploading:  "bg-blue-100 text-blue-700",
    Queued:     "bg-indigo-100 text-indigo-700",
    Processing: "bg-amber-100 text-amber-700",
    Completed:  "bg-green-100 text-green-700",
    Failed:     "bg-red-100 text-red-700",
    Cancelled:  "bg-gray-100 text-gray-500",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

function priorityClass(p: Priority): string {
  if (p === "High")   return "border-red-200 text-red-600 bg-red-50";
  if (p === "Medium") return "border-amber-200 text-amber-600 bg-amber-50";
  return "border-green-200 text-green-600 bg-green-50";
}

function progressBarColor(status: Status): string {
  if (status === "Failed")    return "bg-red-500";
  if (status === "Completed") return "bg-green-500";
  return "bg-blue-500";
}

function logLevelStyle(level: LogEntry["level"]) {
  if (level === "error")   return { dot: "bg-red-500",   text: "text-red-700",   row: "bg-red-50/60" };
  if (level === "warn")    return { dot: "bg-amber-400", text: "text-amber-700", row: "bg-amber-50/40" };
  if (level === "success") return { dot: "bg-green-500", text: "text-green-700", row: "" };
  return { dot: "bg-blue-400", text: "text-gray-700", row: "" };
}

// ─── Priority Picker ──────────────────────────────────────────────────────────
function PriorityPicker({ item, onChange, onClose }: {
  item: QueueItem;
  onChange: (p: Priority) => void;
  onClose: () => void;
}) {
  const options: Priority[] = ["High", "Medium", "Low"];
  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div className="absolute right-0 top-9 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-36 py-1 overflow-hidden">
        {options.map(p => (
          <button
            key={p}
            onClick={() => { onChange(p); onClose(); }}
            className={`w-full px-4 py-2 text-left text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors ${item.priority === p ? "bg-gray-100" : ""}`}
          >
            <span className={`w-2 h-2 rounded-full ${p === "High" ? "bg-red-500" : p === "Medium" ? "bg-amber-400" : "bg-green-500"}`} />
            {p}
            {item.priority === p && <CheckCircle className="w-3 h-3 ml-auto text-blue-500" />}
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Detail Side Panel ────────────────────────────────────────────────────────
type PanelTab = "details" | "logs";

function DetailPanel({ item, onClose, onReprocess }: {
  item: QueueItem;
  onClose: () => void;
  onReprocess: (id: string) => void;
}) {
  const [tab, setTab] = useState<PanelTab>("details");
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <div className="text-lg font-black text-gray-900">{item.id}</div>
            <button
              onClick={() => { onClose(); navigate(`/complaints/${item.complaintId}`); }}
              className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              {item.complaintId} <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-2">
            {item.status === "Completed" && (
              <button
                onClick={() => onReprocess(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold rounded-lg transition-colors"
                title="Reprocess"
              >
                <Bot className="w-3.5 h-3.5" /> Reprocess
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-white px-6">
          {(["details", "logs"] as PanelTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-bold capitalize border-b-2 transition-colors ${
                tab === t
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t === "logs" ? "📋 Logs" : "📄 Details"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {tab === "details" && (
            <div className="px-6 py-5 space-y-5">
              {/* File card */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <FileIcon type={item.fileType} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm truncate">{item.fileName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.fileSize}</div>
                  <div className="text-xs text-gray-400">{item.date}</div>
                </div>
              </div>

              {/* Status + progress */}
              <div className="space-y-2">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-black uppercase ${statusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                  {item.status === "Failed" && (
                    <span className="text-sm font-bold text-red-500">
                      {item.retryCount ?? 0}/{item.maxRetries ?? 3} retries
                    </span>
                  )}
                </div>
                {["Uploading","Processing","Completed","Failed"].includes(item.status) && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span className="font-bold">{item.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${progressBarColor(item.status)}`} style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* AI Service */}
              <div className="space-y-1">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">AI Service</div>
                <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                  <Sparkles className="w-4 h-4" /> {item.aiService}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Priority</div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-black border ${priorityClass(item.priority)}`}>
                  {item.priority}
                </span>
              </div>

              {/* Processing steps */}
              {item.status === "Processing" && (
                <div className="space-y-2">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Processing Steps
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "File ingested",     done: true },
                      { label: "OCR extraction",    done: true },
                      { label: "AI model inference",done: item.progress >= 60 },
                      { label: "Result compilation",done: item.progress >= 90 },
                    ].map(step => (
                      <div key={step.label} className="flex items-center gap-3 text-sm">
                        {step.done
                          ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          : <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
                        <span className={step.done ? "text-gray-700" : "text-amber-600 font-medium"}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed result */}
              {item.status === "Completed" && item.resultSummary && (
                <div className="space-y-2">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" /> AI Result Summary
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-900 leading-relaxed">
                    {item.resultSummary}
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors">
                    <Download className="w-4 h-4" /> Download Result
                  </button>
                </div>
              )}

              {/* Failed error */}
              {item.status === "Failed" && item.errorMessage && (
                <div className="space-y-2">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Error Details
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 leading-relaxed">
                    {item.errorMessage}
                  </div>
                </div>
              )}

              {/* Uploading info */}
              {item.status === "Uploading" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <div className="font-bold mb-1">Upload in progress…</div>
                  <div>{item.progress}% of {item.fileSize} transferred.</div>
                </div>
              )}

              {/* Queued info */}
              {item.status === "Queued" && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
                  <div className="font-bold mb-1">Waiting in queue</div>
                  <div>Awaiting an available {item.aiService} worker slot.</div>
                </div>
              )}
            </div>
          )}

          {tab === "logs" && (
            <div className="px-6 py-5">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Processing History</div>
              {(item.logs && item.logs.length > 0) ? (
                <div className="space-y-1 font-mono text-xs">
                  {item.logs.map((log, i) => {
                    const s = logLevelStyle(log.level);
                    return (
                      <div key={i} className={`flex items-start gap-3 px-3 py-2 rounded-lg ${s.row}`}>
                        <span className="text-gray-400 shrink-0 pt-0.5">{log.time}</span>
                        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${s.dot}`} />
                        <span className={s.text}>{log.event}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8 text-sm">No logs available yet.</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-400">
          <span>Media Queue</span>
          <ChevronRight className="w-3 h-3" />
          <span>{item.complaintId}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">{item.id}</span>
        </div>
      </div>
    </>
  );
}

// ─── Tooltip wrapper ──────────────────────────────────────────────────────────
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {label}
      </div>
    </div>
  );
}

// ─── Actions Column ───────────────────────────────────────────────────────────
interface ActionCellProps {
  item: QueueItem;
  onAction: (id: string, action: string, payload?: unknown) => void;
  onView: (item: QueueItem) => void;
  onLogs: (item: QueueItem) => void;
  onComplaint: (complaintId: string) => void;
}

function ActionCell({ item, onAction, onView, onLogs, onComplaint }: ActionCellProps) {
  const [showPriority, setShowPriority] = useState(false);
  const { id, status, retryCount, maxRetries } = item;
  const retries = retryCount ?? 0;
  const maxR    = maxRetries ?? 3;
  const maxed   = retries >= maxR;

  /** Generic icon button with tooltip */
  const B = (
    label: string,
    icon: React.ReactNode,
    colorClass: string,
    onClick: () => void,
    disabled = false,
  ) => (
    <Tip key={label} label={label}>
      <button
        disabled={disabled}
        onClick={onClick}
        className={`p-2 rounded-lg transition-colors ${
          disabled ? "text-gray-300 cursor-not-allowed" : `${colorClass} cursor-pointer`
        }`}
      >
        {icon}
      </button>
    </Tip>
  );

  const I = { s: "w-4 h-4" }; // icon size shorthand

  // Common buttons available for all/most statuses
  const ViewBtn       = B("View Details",    <Eye           className={I.s} />, "hover:bg-sky-50 text-sky-600",    () => onView(item));
  const DownloadBtn   = B("Download",        <Download      className={I.s} />, "hover:bg-blue-50 text-blue-600",  () => onAction(id, "Download", item.fileName));
  const RetryBtn      = B("Retry",           <RefreshCw     className={I.s} />, "hover:bg-blue-50 text-blue-600",  () => onAction(id, "Retry"), maxed);
  const CancelBtn     = B("Cancel",          <X             className={I.s} />, "hover:bg-red-50 text-red-500",    () => onAction(id, "Cancel"));
  const DeleteBtn     = B("Delete",          <Trash         className={I.s} />, "hover:bg-red-50 text-red-600",    () => onAction(id, "Delete"));
  const LogsBtn       = B("View Logs",       <FileText      className={I.s} />, "hover:bg-gray-100 text-gray-500", () => onLogs(item));
  const ComplaintBtn  = B("Open Complaint",  <ExternalLink  className={I.s} />, "hover:bg-indigo-50 text-indigo-500", () => onComplaint(item.complaintId));
  const ReprocessBtn  = B("Reprocess",       <Bot           className={I.s} />, "hover:bg-purple-50 text-purple-600", () => onAction(id, "Reprocess"));

  // Priority picker button (has its own dropdown state)
  const PriorityBtn = (
    <div key="priority" className="relative">
      <Tip label="Change Priority">
        <button
          onClick={() => setShowPriority(v => !v)}
          className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 cursor-pointer transition-colors"
        >
          <Flag className={I.s} />
        </button>
      </Tip>
      {showPriority && (
        <PriorityPicker
          item={item}
          onChange={p => onAction(id, "Priority", p)}
          onClose={() => setShowPriority(false)}
        />
      )}
    </div>
  );

  // Status → buttons mapping
  const map: Record<Status, React.ReactNode[]> = {
    Uploading:  [CancelBtn, LogsBtn, ComplaintBtn],
    Queued:     [PriorityBtn, CancelBtn, LogsBtn, ComplaintBtn],
    Processing: [ViewBtn, CancelBtn, LogsBtn, ComplaintBtn],
    Completed:  [ViewBtn, DownloadBtn, ReprocessBtn, LogsBtn, ComplaintBtn],
    Failed:     [RetryBtn, ViewBtn, DeleteBtn, LogsBtn, ComplaintBtn],
    Cancelled:  [RetryBtn, PriorityBtn, DeleteBtn, LogsBtn, ComplaintBtn],
  };

  return <div className="flex items-center gap-0.5">{map[status]}</div>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MediaQueue() {
  const navigate = useNavigate();
  const [items, setItems]               = useState<QueueItem[]>(INITIAL_DATA);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [typeFilter,   setTypeFilter]   = useState<"All" | FileType>("All");
  const [panelItem,    setPanelItem]    = useState<QueueItem | null>(null);
  const [panelTab,     setPanelTab]     = useState<"details" | "logs">("details");

  const openPanel = (item: QueueItem, tab: "details" | "logs" = "details") => {
    setPanelItem(item);
    setPanelTab(tab);
  };

  const handleAction = (id: string, action: string, payload?: unknown) => {
    if (action === "Download") {
      toast.success(`Downloading ${payload}...`);
      return;
    }
    
    setItems(prev => {
      if (action === "Delete") return prev.filter(i => i.id !== id);
      return prev.map(item => {
        if (item.id !== id) return item;
        if (action === "Cancel")     return { ...item, status: "Cancelled" as Status, progress: 0 };
        if (action === "Priority")   return { ...item, priority: payload as Priority };
        if (action === "Reprocess")  return { ...item, status: "Queued" as Status, progress: 0 };
        if (action === "Retry") {
          const r = item.retryCount ?? 0;
          const m = item.maxRetries ?? 3;
          if (r < m) return { ...item, status: "Queued" as Status, progress: 0, retryCount: r + 1 };
        }
        return item;
      });
    });
  };

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    return (
      (item.id.toLowerCase().includes(q) || item.fileName.toLowerCase().includes(q) || item.complaintId.toLowerCase().includes(q)) &&
      (statusFilter === "All" || item.status   === statusFilter) &&
      (typeFilter   === "All" || item.fileType === typeFilter)
    );
  });

  const kpis = [
    { label: "TOTAL",      value: items.length,                                                            icon: <FileText     className="w-4 h-4 text-blue-500" />  },
    { label: "PENDING",    value: items.filter(i => i.status === "Queued").length,                         icon: <Clock        className="w-4 h-4 text-indigo-500" /> },
    { label: "PROCESSING", value: items.filter(i => ["Processing","Uploading"].includes(i.status)).length, icon: <RotateCcw    className="w-4 h-4 text-amber-500" />  },
    { label: "COMPLETED",  value: items.filter(i => i.status === "Completed").length,                      icon: <CheckCircle2 className="w-4 h-4 text-green-500" />  },
    { label: "FAILED",     value: items.filter(i => i.status === "Failed").length,                         icon: <AlertCircle  className="w-4 h-4 text-red-500" />    },
    { label: "AVG TIME",   value: "16s",                                                                   icon: <Clock        className="w-4 h-4 text-gray-400" />   },
  ];

  return (
    <DashboardLayout
      title="Media Queue"
      subtitle="AI-powered automated ingestion, OCR, and evidence analysis pipeline."
    >
      <div className="space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-6 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2 h-24">
              <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>{k.label}</span>{k.icon}
              </div>
              <div className="text-2xl font-black text-gray-900">{k.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Queue ID, Complaint ID, or File Name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as "All" | Status)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer">
            <option value="All">All Statuses</option>
            {(["Uploading","Queued","Processing","Completed","Failed","Cancelled"] as Status[]).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as "All" | FileType)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none cursor-pointer">
            <option value="All">All Types</option>
            {(["PDF","Image","Video","Audio","Doc"] as FileType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-4 py-4 text-left whitespace-nowrap">Queue / Complaint</th>
                <th className="px-4 py-4 text-left whitespace-nowrap">File Info</th>
                <th className="px-4 py-4 text-left whitespace-nowrap">Status &amp; Progress</th>
                <th className="px-4 py-4 text-left whitespace-nowrap">Priority</th>
                <th className="px-4 py-4 text-left whitespace-nowrap">AI Service</th>
                <th className="px-4 py-4 text-left whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900 text-base">{item.id}</div>
                    <button
                      onClick={() => navigate(`/complaints/${item.complaintId}`)}
                      className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                    >
                      {item.complaintId} <ExternalLink className="w-3 h-3" />
                    </button>
                    <div className="text-gray-400 text-xs mt-0.5">{item.date}</div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 shrink-0">
                        <FileIcon type={item.fileType} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-base max-w-[220px] truncate">{item.fileName}</div>
                        <div className="text-gray-400 text-sm">{item.fileSize}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-black uppercase tracking-wide ${statusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                      {item.status === "Failed" && (
                        <span className="text-sm font-bold text-red-500">
                          {item.retryCount ?? 0}/{item.maxRetries ?? 3} retries
                        </span>
                      )}
                    </div>
                    {["Uploading","Processing","Completed","Failed"].includes(item.status) && (
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${progressBarColor(item.status)}`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-black border ${priorityClass(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-purple-600 font-bold text-base">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      {item.aiService}
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <ActionCell
                      item={item}
                      onAction={handleAction}
                      onView={i => openPanel(i, "details")}
                      onLogs={i => openPanel(i, "logs")}
                      onComplaint={cid => navigate(`/complaints/${cid}`)}
                    />
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-base">
                    No media items match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail / Logs Panel */}
      {panelItem && (
        <DetailPanel
          item={{ ...panelItem, logs: panelItem.logs }}
          onClose={() => setPanelItem(null)}
          onReprocess={id => { handleAction(id, "Reprocess"); setPanelItem(null); }}
        />
      )}
    </DashboardLayout>
  );
}
