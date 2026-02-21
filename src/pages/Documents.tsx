import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, FolderOpen, Download, Eye, Search, Upload, Clock, CheckCircle2, Lock } from "lucide-react";

const folders = [
    { name: "Citizen Petitions", count: 234, color: "bg-blue-50 border-blue-100 text-blue-600" },
    { name: "Official Notices", count: 89, color: "bg-amber-50 border-amber-100 text-amber-600" },
    { name: "Budget Reports", count: 45, color: "bg-emerald-50 border-emerald-100 text-emerald-600" },
    { name: "Policy Drafts", count: 67, color: "bg-purple-50 border-purple-100 text-purple-600" },
    { name: "Infrastructure Plans", count: 32, color: "bg-rose-50 border-rose-100 text-rose-600" },
    { name: "Minutes of Meetings", count: 128, color: "bg-indigo-50 border-indigo-100 text-indigo-600" },
];

const recentDocs = [
    { name: "Annual Budget Report FY2025-26.pdf", size: "4.2 MB", date: "Feb 19, 2026", type: "PDF", status: "approved", access: "public" },
    { name: "Ward 03 Infrastructure Upgrade Plan.docx", size: "1.8 MB", date: "Feb 18, 2026", type: "DOCX", status: "draft", access: "restricted" },
    { name: "Public Health Advisory - Q4 2025.pdf", size: "2.1 MB", date: "Feb 17, 2026", type: "PDF", status: "approved", access: "public" },
    { name: "Meeting Minutes - City Council Feb 15.pdf", size: "890 KB", date: "Feb 15, 2026", type: "PDF", status: "pending", access: "internal" },
    { name: "Water Supply Tender Document #WS-24-09.pdf", size: "6.7 MB", date: "Feb 14, 2026", type: "PDF", status: "approved", access: "public" },
    { name: "Emergency Response Protocol 2026.docx", size: "3.4 MB", date: "Feb 12, 2026", type: "DOCX", status: "draft", access: "restricted" },
];

const typeColor: Record<string, string> = {
    "PDF": "bg-rose-50 text-rose-600 border-rose-100",
    "DOCX": "bg-blue-50 text-blue-600 border-blue-100",
    "XLSX": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

const statusStyle: Record<string, string> = {
    "approved": "bg-emerald-50 text-emerald-700",
    "draft": "bg-gray-100 text-gray-600",
    "pending": "bg-amber-50 text-amber-700",
};

export default function Documents() {
    return (
        <DashboardLayout title="Documents" subtitle="Centralized government document management system">
            <div className="space-y-6">
                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents, reports, notices..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>
                    <button onClick={() => alert('Upload feature coming soon! This would open a file picker dialog.')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                        <Upload className="w-4 h-4" />
                        Upload Document
                    </button>
                </div>

                {/* Folder Grid */}
                <div>
                    <h2 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-amber-500" />
                        Document Folders
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {folders.map(folder => (
                            <div key={folder.name} onClick={() => alert(`Opening folder: ${folder.name} (${folder.count} files)`)} className={`group cursor-pointer p-5 rounded-2xl border-2 ${folder.color} hover:shadow-md transition-all hover:-translate-y-0.5`}>
                                <FolderOpen className="w-7 h-7 mb-3 opacity-80" />
                                <p className="text-xs font-black leading-tight mb-1">{folder.name}</p>
                                <p className="text-[10px] opacity-60 font-bold">{folder.count} files</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Documents */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Recent Documents
                        </h3>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{recentDocs.length} documents</span>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {recentDocs.map(doc => (
                            <div key={doc.name} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                <div className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border ${typeColor[doc.type] || typeColor["DOCX"]} shrink-0`}>
                                    {doc.type}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{doc.name}</p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {doc.date}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{doc.size}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${statusStyle[doc.status]}`}>
                                        {doc.status}
                                    </span>
                                    {doc.access === "restricted" ? (
                                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                                    ) : (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    )}
                                    <button onClick={() => alert(`Viewing: ${doc.name}`)} className="h-8 w-8 rounded-xl bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all">
                                        <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => alert(`Downloading: ${doc.name} (${doc.size})`)} className="h-8 w-8 rounded-xl bg-gray-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all">
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
