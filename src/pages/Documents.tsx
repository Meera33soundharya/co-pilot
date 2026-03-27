import { DashboardLayout } from "@/components/DashboardLayout";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    FileText, FolderOpen, Download, Eye, Search,
    Upload, Clock, CheckCircle2, Lock, Share2, X, AlertCircle
} from "lucide-react";

const folders = [
    { name: "Citizen Petitions",    count: 234, icon: "🗂️", color: "#B91C1C", bg: "bg-white", border: "border-red-100" },
    { name: "Official Notices",     count: 89,  icon: "📋", color: "#374151", bg: "bg-white", border: "border-gray-100" },
    { name: "Budget Reports",       count: 42,  icon: "💰", color: "#B91C1C", bg: "bg-white", border: "border-red-100" },
    { name: "Policy Drafts",        count: 67,  icon: "📝", color: "#1F2937", bg: "bg-white", border: "border-gray-100" },
    { name: "Infrastructure Plans", count: 32,  icon: "🏗️", color: "#B91C1C", bg: "bg-white", border: "border-red-100" },
    { name: "Minutes of Meetings",  count: 128, icon: "📅", color: "#111827", bg: "bg-white", border: "border-gray-100" },
];

const recentDocs = [
    { name: "Citizen Module - Technical User Guide.pdf", size: "2.4 MB", date: "Mar 27, 2026", type: "PDF",  status: "approved", access: "public", assetId: "GP-QA-99-A", dept: "District IT", summary: "Complete technical schematic and user onboarding protocols for the GovPilot citizen engagement suite. Includes API documentation and UI component library references." },
    { name: "Citizen Petition - Ward 07 Water Shortage.pdf", size: "1.2 MB", date: "Mar 27, 2026", type: "PDF",  status: "pending",  access: "public", assetId: "CIV-PET-07-2", dept: "Public Health", summary: "Formal collective grievance signed by 214 residents of Ward 07 regarding the intermittent water supply interruption. Urgent infrastructure review suggested.", aiScore: 88 },
    { name: "Annual Budget Report FY2025-26.pdf",        size: "4.2 MB", date: "Feb 19, 2026", type: "PDF",  status: "approved", access: "public", assetId: "FIN-ANN-2025", dept: "Finance Bureau", summary: "Strategic financial overview for the upcoming fiscal year. Identifies key growth nodes in infrastructure spending and AI-driven administrative efficiency benchmarks." },
    { name: "Ward 03 Infrastructure Upgrade Plan.docx",  size: "1.8 MB", date: "Feb 18, 2026", type: "DOCX", status: "draft",    access: "restricted", assetId: "INF-URB-03-9", dept: "Infrastructure", summary: "Preliminary blueprint for road expansion and smart-lighting deployment in the central commercial district of Ward 03." },
    { name: "Public Health Advisory - Q4 2025.pdf",      size: "2.1 MB", date: "Feb 17, 2026", type: "PDF",  status: "approved", access: "public", assetId: "PH-ADV-2025-Q4", dept: "Public Health", summary: "Seasonal health intelligence report. Noted successful mitigation of viral vectors in high-density wards through targeted sanitation protocols." },
    { name: "Meeting Minutes - City Council Feb 15.pdf", size: "990 KB", date: "Feb 15, 2026", type: "PDF",  status: "pending",  access: "internal", assetId: "COU-MIN-214", dept: "Executive Council", summary: "Transcribed discussion on regional development grants and the approval of the centralized Governance Portal deployment timeline.", aiScore: 92 },
    { name: "Water Supply Tender Document #WS-24-09.pdf",size: "6.7 MB", date: "Feb 14, 2026", type: "PDF",  status: "approved", access: "public", assetId: "TEN-WTR-24-09", dept: "Public Works", summary: "Legal and technical specifications for the next-generation water filtration plant. All bids must comply with the 2024 Integrity Protocol." },
    { name: "Emergency Response Protocol 2026.docx",     size: "3.4 MB", date: "Feb 12, 2026", type: "DOCX", status: "draft",    access: "restricted", assetId: "EMER-SEC-ZERO", dept: "Global Defense", summary: "Classified tactical response framework for district-scale emergencies. Standardized roles for field units, communication nodes, and citizen safe-zones." },
];

// type style mapping removed as it was unused in final UI
const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
    approved: { bg: "#F0FDF4", text: "#059669", label: "APPROVED" },
    draft:    { bg: "#F9FAFB", text: "#9CA3AF", label: "DRAFT" },
    pending:  { bg: "#FFFBEB", text: "#D97706", label: "PENDING" },
};

interface PreviewDoc {
    name: string;
    type: string;
    date: string;
    size: string;
    status: string;
    access: string;
    assetId: string;
    dept: string;
    summary: string;
    aiScore?: number;
}

export default function Documents() {
    const [localDocs, setLocalDocs] = useState(recentDocs);
    const [search, setSearch] = useState("");
    const [searchParams] = useSearchParams();
    const [previewDoc, setPreviewDoc] = useState<PreviewDoc | null>(null);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploaded, setUploaded] = useState(false);

    const filtered = localDocs.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [shareToast, setShareToast] = useState<string | null>(null);

    // Simulate reactive document registration
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const newDoc: PreviewDoc = {
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
            type: file.name.split('.').pop()?.toUpperCase() || "FILE",
            status: "pending",
            access: "restricted",
            assetId: `GP-R-${Math.floor(100 + Math.random() * 900)}`,
            dept: "Unassigned",
            summary: "Newly uploaded governance asset pending administrative classification and AI security sweep.",
            aiScore: 0
        };

        setUploaded(true);
        setTimeout(() => {
            setLocalDocs(prev => [newDoc, ...prev]);
        }, 800);
    };

    // Actually downloads a real text file with doc info
    const handleDownload = (doc: typeof recentDocs[0]) => {
        setDownloading(doc.name);
        const content = `GOVERNMENT DOCUMENT\n${'='.repeat(50)}\nName   : ${doc.name}\nType   : ${doc.type}\nSize   : ${doc.size}\nDate   : ${doc.date}\nStatus : ${doc.status.toUpperCase()}\nAccess : ${doc.access}\n${'='.repeat(50)}\n\n[This is a demonstration export generated by GovPilot.]\n[In production, this would be the actual document content.]`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = doc.name.replace(/\.(pdf|docx)$/i, '.txt');
        a.click();
        URL.revokeObjectURL(url);
        setTimeout(() => setDownloading(null), 1500);
    };

    const handleShare = (docName: string) => {
        const text = `${window.location.origin}/documents?file=${encodeURIComponent(docName)}`;
        navigator.clipboard?.writeText(text).catch(() => {});
        setShareToast(docName);
        setTimeout(() => setShareToast(null), 2000);
    };

    // 🔗 Deep-linking: auto-open preview if file is in URL
    useEffect(() => {
        const fileName = searchParams.get("file");
        if (fileName) {
            const doc = recentDocs.find(d => d.name === fileName);
            if (doc) setPreviewDoc(doc);
        }
    }, [searchParams]);

    return (
        <DashboardLayout title="Documents" subtitle="Centralized government document management system">

            {/* High-Fidelity Detailed Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setPreviewDoc(null)} />
                    <div className="relative bg-white rounded-[4rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-slide-up border border-white/20">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] pointer-events-none" />
                        
                        <div className="flex flex-col lg:flex-row h-full lg:h-[700px]">
                            {/* Inner Left: Visual Cover / Meta */}
                            <div className="lg:w-[320px] bg-gray-900 p-12 text-white flex flex-col justify-between relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 blur-[60px] pointer-events-none" />
                                <div className="space-y-10 relative z-10">
                                    <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                                        <FileText className="w-10 h-10 text-red-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black italic tracking-tighter leading-tight uppercase">{previewDoc.name.split(" - ")[0]}</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-3">Governance Asset File</p>
                                    </div>

                                    <div className="space-y-6 pt-10 border-t border-white/10">
                                        <div>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Asset Status</p>
                                            <span className="px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest"
                                                style={{ backgroundColor: `${statusStyle[previewDoc.status]?.text}20`, color: statusStyle[previewDoc.status]?.text, borderColor: `${statusStyle[previewDoc.status]?.text}30` }}>
                                                {statusStyle[previewDoc.status]?.label}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Registry Core</p>
                                            <p className="text-sm font-black italic text-red-500">{previewDoc.assetId}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3">Integrity Verification</p>
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-bold text-white/80">SHA-256 Encrypted</span>
                                    </div>
                                </div>
                            </div>

                            {/* Inner Right: Content Details */}
                            <div className="flex-1 bg-white p-12 overflow-y-auto relative">
                                <button onClick={() => setPreviewDoc(null)} className="absolute top-8 right-12 p-3 rounded-2xl hover:bg-gray-100 text-gray-300 hover:text-red-600 transition-all z-20">
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="max-w-2xl space-y-12 relative z-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">Type: {previewDoc.type}</span>
                                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">Weight: {previewDoc.size}</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 italic tracking-tight uppercase leading-relaxed">{previewDoc.name}</h3>
                                        <p className="text-gray-500 font-medium text-lg leading-relaxed">{previewDoc.summary}</p>
                                    </div>

                                    {/* Detailed Stats Grid */}
                                    <div className="grid grid-cols-2 gap-10 p-10 bg-gray-50 rounded-[3rem] border border-gray-100 relative group">
                                        <div className="absolute inset-0 bg-red-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]" />
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Division Ownership</p>
                                            <p className="font-black text-gray-900 uppercase italic">{previewDoc.dept}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Registry Date</p>
                                            <p className="font-black text-gray-900 uppercase italic">{previewDoc.date}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Access Protocol</p>
                                            <p className="font-black text-gray-900 uppercase italic">{previewDoc.access === 'public' ? 'Open Access' : 'Restricted Ops'}</p>
                                        </div>
                                        {previewDoc.aiScore && (
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">AI Priority Index</p>
                                                <p className="font-black text-[#B91C1C] text-xl italic">{previewDoc.aiScore}<span className="text-[10px] ml-1">Pts</span></p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Mission Actions</h4>
                                        <div className="flex gap-4">
                                            <button onClick={() => { handleDownload(previewDoc); setPreviewDoc(null); }} 
                                                className="flex-1 flex items-center justify-center gap-4 py-6 bg-[#B91C1C] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-red-900/40 hover:bg-black transition-all active:scale-95 group">
                                                <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Download Original Asset
                                            </button>
                                            <button onClick={() => setPreviewDoc(null)}
                                                className="px-10 py-6 bg-gray-100 text-gray-900 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95">
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Share toast */}
            {shareToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl animate-fade-in text-sm font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Link copied to clipboard!
                </div>
            )}

            {/* Upload Modal */}
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.xlsx,.png,.jpg,.mp3,.wav,.ogg"
                onChange={handleFileUpload} />
            {uploadOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setUploadOpen(false); setUploaded(false); }} />
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-black text-gray-900">Secure Upload</h2>
                            <button onClick={() => { setUploadOpen(false); setUploaded(false); }} className="p-2 rounded-2xl hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-8 space-y-5">
                            {!uploaded ? (
                                <>
                                    {/* Click area opens real file picker */}
                                    <div onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-red-300 transition-colors cursor-pointer group">
                                        <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3 group-hover:text-red-400 transition-colors" />
                                        <p className="text-sm font-bold text-gray-600">Click to select a file from your device</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX, PNG, JPG up to 50 MB</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Target Folder</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-red-200">
                                            {folders.map(f => <option key={f.name}>{f.name}</option>)}
                                        </select>
                                    </div>
                                    <button onClick={() => fileInputRef.current?.click()}
                                        className="btn-primary w-full !py-4">
                                        <Upload className="w-4 h-4" /> Upload Securely
                                    </button>
                                </>
                            ) : (
                                <div className="text-center py-6 space-y-4">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h3 className="font-black text-gray-900 text-lg">Uploaded Successfully!</h3>
                                    <p className="text-sm text-gray-500">File has been encrypted and stored securely in GovPilot.</p>
                                    <button onClick={() => { setUploadOpen(false); setUploaded(false); }} className="btn-primary w-full !py-4">Done</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Action Bar */}
                <div className="flex gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            type="text"
                            placeholder="Search strategic signals, reports, or notices..."
                            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-500/5 font-bold transition-all placeholder:text-gray-300 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setUploadOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-[#B91C1C] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-xl shadow-red-900/20 active:scale-95"
                    >
                        <Upload className="w-4 h-4" /> Secure Upload
                    </button>
                </div>

                {/* Folders */}
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#B91C1C]" />
                        Library Architecture
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {folders.map(folder => (
                            <div
                                key={folder.name}
                                className={`group cursor-pointer rounded-[2rem] border p-6 hover:shadow-2xl hover:-translate-y-2 transition-all active:scale-95 relative overflow-hidden ${folder.bg} ${folder.border}`}
                                onClick={() => setSearch(folder.name.split(" ")[0])}
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 blur-[30px] group-hover:bg-red-500/10 transition-all" />
                                <div className="mb-6 relative z-10">
                                    <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <FolderOpen className="w-5 h-5" style={{ color: "#B91C1C" }} />
                                    </div>
                                </div>
                                <p className="text-xs font-black leading-tight tracking-tight text-gray-900 mb-1 group-hover:text-[#B91C1C] transition-colors">{folder.name}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{folder.count} Signals</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Files */}
                <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[#B91C1C]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 uppercase italic">Recent Governance Signals</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Document Stream</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{recentDocs.length} TOTAL SIGNALS</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {filtered.map(doc => (
                            <div key={doc.name} className="flex items-center gap-8 px-10 py-6 hover:bg-red-50/20 transition-all group">
                                {/* Type Badge */}
                                <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 rounded-[1.5rem] bg-gray-50 border border-gray-100 group-hover:bg-[#B91C1C] transition-all">
                                    <span className="text-[10px] font-black group-hover:text-white transition-colors">{doc.type}</span>
                                    <FileText className="w-4 h-4 mt-1 text-gray-400 group-hover:text-white transition-colors" />
                                </div>

                                {/* Name + Meta - Actionable Link */}
                                <div 
                                    className="flex-1 min-w-0 cursor-pointer group/link"
                                    onClick={() => setPreviewDoc(doc)}
                                >
                                    <h4 className="text-lg font-black text-gray-900 truncate group-hover/link:text-[#B91C1C] transition-colors uppercase italic">{doc.name}</h4>
                                    <div className="flex items-center gap-6 mt-1">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <Clock className="w-3.5 h-3.5" /> {doc.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <FolderOpen className="w-3.5 h-3.5" /> {doc.size}
                                        </div>
                                    </div>
                                </div>

                                {/* Status + Access */}
                                <div className="hidden lg:flex items-center gap-6 shrink-0">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black px-4 py-1.5 rounded-xl border uppercase tracking-widest transition-all"
                                            style={{ backgroundColor: statusStyle[doc.status]?.bg, color: statusStyle[doc.status]?.text, borderColor: `${statusStyle[doc.status]?.text}20` }}>
                                            {statusStyle[doc.status]?.label}
                                        </span>
                                    </div>

                                    {doc.access === "restricted" ? (
                                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500" title="Restricted Asset">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-500" title="Public Asset">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                {/* Operational Actions */}
                                <div className="flex items-center gap-3 shrink-0">
                                    {/* Open Preview */}
                                    <button
                                        onClick={() => setPreviewDoc(doc)}
                                        className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm"
                                        title="Satellite Preview"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>

                                    {/* Operational Download */}
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        className={`p-4 rounded-2xl border transition-all shadow-sm ${downloading === doc.name ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-[#B91C1C] hover:text-white hover:border-[#B91C1C]"}`}
                                        title="Download Asset"
                                    >
                                        {downloading === doc.name ? <CheckCircle2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                                    </button>

                                    {/* Secure Share */}
                                    <button
                                        onClick={() => handleShare(doc.name)}
                                        className={`p-4 rounded-2xl border transition-all shadow-sm ${shareToast === doc.name ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-900 hover:text-white hover:border-gray-900"}`}
                                        title="Secure Mission Share"
                                    >
                                        {shareToast === doc.name ? <CheckCircle2 className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="py-24 text-center">
                                <FileText className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                                <p className="text-lg font-black text-gray-300 uppercase italic">Signal Lost — No Assets Found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
