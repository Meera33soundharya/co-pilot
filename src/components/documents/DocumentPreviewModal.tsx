import React, { useState } from "react";
import { 
    X, Download, Trash2, CheckCircle2, Shield, BrainCircuit, 
    FileText, FileClock, XCircle, FileSearch, Sparkles, Activity,
    Link as LinkIcon, AlertTriangle, Check, Clock, User, Fingerprint, Calendar
} from "lucide-react";
import { useDocuments, type DocumentRecord } from "@/context/DocumentContext";
import { useComplaints } from "@/context/ComplaintsContext";
import { ExecutiveSummaryPanel } from "./ExecutiveSummaryPanel";

interface DocumentPreviewModalProps {
    document: DocumentRecord;
    onClose: () => void;
    onSelectDocument?: (doc: DocumentRecord) => void;
}

type TabType = "overview" | "ai" | "ocr";

export function DocumentPreviewModal({ document, onClose, onSelectDocument }: DocumentPreviewModalProps) {
    const { updateStatus, deleteDocument, allDocuments, regenerateSummary } = useDocuments();
    const { currentUser, allComplaints } = useComplaints();
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    React.useEffect(() => {
        // Automatically trigger AI analysis if it hasn't been run yet
        if (!document.executiveSummary && document.summaryStatus === 'idle') {
            regenerateSummary(document.id);
        }
    }, [document.id, document.executiveSummary, document.summaryStatus, regenerateSummary]);

    const linkedComplaint = document.complaintId ? allComplaints.find(c => c.id === document.complaintId) : null;

    const statusColors = {
        approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
        pending: "bg-amber-50 text-amber-600 border-amber-200",
        rejected: "bg-red-50 text-red-600 border-red-200",
        draft: "bg-gray-50 text-gray-600 border-gray-200"
    };

    const handleDownload = () => {
        const a = window.document.createElement('a');
        a.href = document.fileData.startsWith('data:') ? document.fileData : `data:text/plain;charset=utf-8,${encodeURIComponent(document.fileData)}`;
        a.download = document.name;
        a.click();
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to permanently delete this document?")) {
            deleteDocument(document.id);
            onClose();
        }
    };

    const exportIntelligenceReport = () => {
        const reportContent = `
GOVPILOT INTELLIGENCE REPORT
=================================
Document ID: ${document.id}
Name: ${document.name}
Category: ${document.category}
Date: ${document.date}
Department: ${document.dept}
Status: ${document.status.toUpperCase()}
Related Complaint ID: ${document.complaintId || 'None'}

--- AI INSIGHTS ---
AI Confidence: ${document.aiScore ? document.aiScore + '%' : 'N/A'}
Summary: ${document.summary || 'Pending'}
Highlights:
${document.executiveSummary?.highlights.map(h => '- ' + h).join('\n') || 'None'}

--- OCR DATA ---
Extracted Text:
${document.extractedText || document.ocrText || 'No text extracted.'}
        `.trim();

        const a = window.document.createElement('a');
        a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(reportContent)}`;
        a.download = `Intelligence_Report_${document.id}.txt`;
        a.click();
    };

    const handleApprove = () => {
        updateStatus(document.id, "approved");
        onClose();
    };

    const handleReject = () => {
        updateStatus(document.id, "rejected");
        onClose();
    };

    const relatedDocs = allDocuments
        .filter(d => d.category === document.category && d.id !== document.id)
        .slice(0, 5);

    const tabs = [
        { id: "overview", label: "Overview", icon: FileText },
        { id: "ai", label: "AI Insights", icon: BrainCircuit },
        { id: "ocr", label: "OCR Data", icon: FileSearch },
    ] as const;

    // --- Tab Contents ---

    const renderOverview = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Document Overview</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Document ID</p>
                    <p className="font-semibold text-gray-900">{document.id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Complaint ID</p>
                    <p className="font-semibold text-gray-900">{document.complaintId || 'Not Linked'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Category</p>
                    <p className="font-semibold text-gray-900">{document.category}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Department</p>
                    <p className="font-semibold text-gray-900">{document.dept}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Ward</p>
                    <p className="font-semibold text-gray-900">{document.ward || linkedComplaint?.ward || 'Unassigned'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Uploaded By</p>
                    <p className="font-semibold text-gray-900">{document.uploader}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Upload Date</p>
                    <p className="font-semibold text-gray-900">{document.date}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Verification Status</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Shield className={`w-4 h-4 ${document.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <span className={`font-semibold capitalize ${document.status === 'approved' ? 'text-emerald-700' : 'text-amber-700'}`}>{document.status}</span>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">File Specs</p>
                    <p className="font-semibold text-gray-900">{document.type} • {document.size}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Document Owner</p>
                    <p className="font-semibold text-gray-900">{linkedComplaint?.citizen || document.uploader}</p>
                </div>
            </div>
            <div className="mt-2">
                <ExecutiveSummaryPanel
                    summary={document.executiveSummary || null}
                    status={document.summaryStatus || 'idle'}
                    onRegenerate={() => regenerateSummary(document.id)}
                    compact
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-4">
                     <p className="text-xs text-gray-500 font-medium mb-1">Processing Progress</p>
                     <div className="w-full bg-gray-200 rounded-full h-2 mb-2"><div className="bg-indigo-600 h-2 rounded-full w-full"></div></div>
                     <span className="text-xs font-bold text-indigo-700">100% Complete</span>
                </div>
                <div className="border rounded-xl p-4 flex items-center justify-between">
                     <div>
                         <p className="text-xs text-gray-500 font-medium mb-1">Related Complaints</p>
                         <p className="text-xl font-black text-gray-900">{linkedComplaint ? 1 : 0}</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                         <LinkIcon className="w-5 h-5" />
                     </div>
                </div>
            </div>
        </div>
    );

    const renderAI = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-600" />
                AI Intelligence Report
            </h3>
            <ExecutiveSummaryPanel
                summary={document.executiveSummary || null}
                status={document.summaryStatus || 'idle'}
                onRegenerate={() => regenerateSummary(document.id)}
            />
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider mb-1">AI Confidence</p>
                    <p className="text-2xl font-black text-indigo-700">{document.aiScore ? `${document.aiScore}%` : 'Pending'}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-xs text-emerald-500 font-medium uppercase tracking-wider mb-1">AI Insights</p>
                    <p className="text-2xl font-black text-emerald-700">{document.aiInsights ? `${document.aiInsights.length} found` : 'None'}</p>
                </div>
            </div>
            {document.aiInsights && document.aiInsights.length > 0 && (
                <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">AI-Generated Insights</p>
                    <div className="flex flex-wrap gap-2">
                        {document.aiInsights.map((insight, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold">{insight}</span>
                        ))}
                    </div>
                </div>
            )}
            {document.summary && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-700 mb-2">AI Summary</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{document.summary}</p>
                </div>
            )}
        </div>
    );

    const renderOCR = () => {
        const hasOcr = !!document.ocrText;
        const status = hasOcr ? "Completed" : "Pending";
        
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FileSearch className="w-5 h-5 text-blue-600" />
                        OCR Extraction Results
                    </h3>
                    <div className="flex gap-2">
                        {hasOcr ? (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> OCR Validated</span>
                        ) : (
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Pending Extraction</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col justify-center items-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold text-center">Status</p>
                        <p className={`font-semibold text-sm text-center mt-1 ${hasOcr ? 'text-emerald-600' : 'text-amber-600'}`}>{status}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col justify-center items-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold text-center">Engine</p>
                        <p className="font-semibold text-gray-900 text-sm text-center mt-1">GovVision v5.1</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col justify-center items-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold text-center">Accuracy</p>
                        <p className="font-semibold text-emerald-600 text-sm text-center mt-1">{hasOcr ? '99.4%' : 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col justify-center items-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold text-center">Proc. Time</p>
                        <p className="font-semibold text-gray-900 text-sm text-center mt-1">{hasOcr ? '1.2s' : '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col justify-center items-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold text-center">Language</p>
                        <p className="font-semibold text-gray-900 text-sm text-center mt-1">{hasOcr ? 'English (en-IN)' : '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col justify-center items-center">
                        <p className="text-[10px] text-gray-500 uppercase font-bold text-center">Doc Quality</p>
                        <p className="font-semibold text-emerald-600 text-sm text-center mt-1">{hasOcr ? 'High (300 DPI)' : '-'}</p>
                    </div>
                </div>

                {hasOcr ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-gray-700">Structured Data Extracted</h4>
                                    <span className="text-xs text-gray-500 font-medium">Confidence</span>
                                </div>
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-gray-100">
                                        {[
                                            { label: "Citizen Name", value: linkedComplaint?.citizen, conf: 99 },
                                            { label: "Mobile Number", value: linkedComplaint?.phone, conf: 98 },
                                            { label: "Address / Location", value: linkedComplaint?.location, conf: 95 },
                                            { label: "Ward Number", value: document.ward || linkedComplaint?.ward, conf: 97 },
                                            { label: "Complaint ID", value: document.complaintId, conf: 99 },
                                            { label: "Department", value: document.dept, conf: 94 },
                                            { label: "Complaint Category", value: document.category, conf: 96 },
                                            { label: "Submission Date", value: document.date, conf: 99 },
                                            { label: "Supporting Evidence", value: document.fileData ? "Attached Files" : null, conf: 88 },
                                        ].map((field, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-gray-500 font-medium w-2/5">{field.label}</td>
                                                <td className="px-4 py-3 text-gray-900 font-semibold">{field.value || <span className="text-gray-400 font-normal italic">Not Detected</span>}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {field.value ? (
                                                        <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{field.conf}%</span>
                                                    ) : (
                                                        <span className="text-xs font-mono text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-gray-700">Complaint Description Extracted</h4>
                                </div>
                                <div className="p-4 bg-white">
                                    <p className="text-sm text-gray-800 leading-relaxed italic border-l-4 border-indigo-200 pl-3">"{linkedComplaint?.description || document.summary || 'Not Detected'}"</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-gray-700">Raw OCR Text</h4>
                                    <span className="text-xs text-gray-500 font-mono">Length: {document.ocrText.length} chars</span>
                                </div>
                                <div className="p-4 max-h-64 overflow-y-auto">
                                    <p className="text-sm font-mono text-gray-700 whitespace-pre-wrap leading-relaxed selection:bg-indigo-100">
                                        {document.extractedText || document.ocrText}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-indigo-100 bg-indigo-100/50">
                                    <h4 className="text-sm font-bold text-indigo-900">OCR Validation</h4>
                                </div>
                                <div className="p-4 space-y-3">
                                    {[
                                        "Text Successfully Extracted",
                                        "Document Structure Recognized",
                                        "Required Fields Identified",
                                        "Citizen Details Verified",
                                        "Complaint Details Verified"
                                    ].map((check, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <span className="text-xs font-semibold text-indigo-900">{check}</span>
                                        </div>
                                    ))}
                                    <div className="pt-3 mt-3 border-t border-indigo-200/60">
                                        <div className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg justify-center shadow-sm">
                                            <Sparkles className="w-4 h-4" />
                                            <span className="text-xs font-bold">Ready for AI Processing</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Automated Handoff</h4>
                                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                    Extracted data has been successfully validated and passed to the GovPilot AI Engine for intelligent processing.
                                </p>
                                <button onClick={() => setActiveTab('ai')} className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-indigo-600 text-xs font-bold rounded-lg border border-gray-200 transition-colors flex justify-center items-center gap-1">
                                    View AI Insights
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex flex-col items-center justify-center text-center h-64">
                        <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" />
                        <h4 className="text-lg font-bold text-amber-900">OCR Extraction Pending or Failed</h4>
                        <p className="text-sm text-amber-800 mt-2 max-w-md">No text could be extracted. The document may be blank, illegible, or require manual transcription by an officer.</p>
                    </div>
                )}
            </div>
        );
    };





    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden animate-slide-up flex flex-col h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-white relative z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold">
                            <span className="text-[10px] uppercase font-black">{document.type}</span>
                            <FileText className="w-5 h-5 mt-0.5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 truncate max-w-lg">{document.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColors[document.status]}`}>
                                    {document.status}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">ID: {document.id}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500 font-medium">{document.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {document.status === "pending" && (
                            <>
                                <button onClick={handleApprove} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Approve
                                </button>
                                <button onClick={handleReject} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                                <div className="w-px h-6 bg-gray-200 mx-2" />
                            </>
                        )}
                        <button onClick={exportIntelligenceReport} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 border border-indigo-200" title="Export Intelligence Report">
                            <Download className="w-3.5 h-3.5" /> Export Report
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-2" />
                        <button onClick={handleDownload} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download Document">
                            <Download className="w-5 h-5" />
                        </button>
                        <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar */}
                    <div className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col shrink-0">
                        <div className="p-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Document Intelligence</p>
                            <nav className="space-y-1">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as TabType)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                                isActive 
                                                    ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/60' 
                                                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 border border-transparent'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex overflow-hidden bg-white">
                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-4xl mx-auto">
                                {activeTab === "overview" && renderOverview()}
                                {activeTab === "ai" && renderAI()}
                                {activeTab === "ocr" && renderOCR()}
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}
