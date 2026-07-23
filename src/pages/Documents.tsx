import React, { useState, useMemo, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
    FileText, FolderOpen, Download, Search, Upload, Clock, 
    CheckCircle2, Lock, Share2, AlertCircle, Shield, Grid, List, 
    UploadCloud, Trash2, XCircle, FileBarChart, PieChart, Users, Building2
} from "lucide-react";
import { useDocuments, type DocumentRecord, type DocumentCategory } from "@/context/DocumentContext";
import { useComplaints } from "@/context/ComplaintsContext";
import { DocumentPreviewModal } from "@/components/documents/DocumentPreviewModal";
import { ManualUploadModal } from "@/components/documents/ManualUploadModal";

const categories: { name: DocumentCategory; icon: React.ReactNode; color: string; countStr: string }[] = [
    { name: "Complaint Documents", icon: <AlertCircle className="w-6 h-6" />, color: "text-amber-600", countStr: "Active Issues" },
    { name: "Resolution Reports", icon: <CheckCircle2 className="w-6 h-6" />, color: "text-emerald-600", countStr: "Resolved" },
    { name: "Government Circulars", icon: <FileText className="w-6 h-6" />, color: "text-indigo-600", countStr: "Official" },
    { name: "Meeting Documents", icon: <Users className="w-6 h-6" />, color: "text-blue-600", countStr: "Minutes & Agendas" },
    { name: "Policy Documents", icon: <Building2 className="w-6 h-6" />, color: "text-purple-600", countStr: "Guidelines" },
    { name: "Field Officer Reports", icon: <FolderOpen className="w-6 h-6" />, color: "text-rose-600", countStr: "Inspections" },
];

const statusStyles = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    draft: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function Documents() {
    const { allDocuments, uploadDocument, deleteDocument, updateStatus } = useDocuments();
    const { currentUser } = useComplaints();
    
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "All">("All");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showManualUpload, setShowManualUpload] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dashboard Metrics
    const metrics = useMemo(() => {
        return {
            total: allDocuments.length,
            pending: allDocuments.filter(d => d.status === "pending").length,
            approved: allDocuments.filter(d => d.status === "approved").length,
            resolutions: allDocuments.filter(d => d.category === "Resolution Reports").length,
            circulars: allDocuments.filter(d => d.category === "Government Circulars").length,
            meetings: allDocuments.filter(d => d.category === "Meeting Documents").length,
        };
    }, [allDocuments]);

    // Filtering
    const filteredDocs = useMemo(() => {
        return allDocuments.filter(doc => {
            const matchesSearch = 
                doc.name.toLowerCase().includes(search.toLowerCase()) ||
                doc.id.toLowerCase().includes(search.toLowerCase()) ||
                doc.summary.toLowerCase().includes(search.toLowerCase()) ||
                doc.citizenName?.toLowerCase().includes(search.toLowerCase()) ||
                doc.dept.toLowerCase().includes(search.toLowerCase());
            
            const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        }).sort((a, b) => b.uploadTimestamp - a.uploadTimestamp);
    }, [allDocuments, search, selectedCategory]);

    // Drag and Drop Handlers
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    
    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) handleFiles(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(Array.from(e.target.files));
    };

    const handleFiles = async (files: File[]) => {
        for (const file of files) {
            // Automatic AI-like categorization based on filename
            let autoCategory: DocumentCategory = "Government Circulars";
            const nameLower = file.name.toLowerCase();
            
            if (nameLower.includes("complaint") || nameLower.includes("petition") || nameLower.includes("grievance")) {
                autoCategory = "Complaint Documents";
            } else if (nameLower.includes("resolution") || nameLower.includes("solved") || nameLower.includes("closed")) {
                autoCategory = "Resolution Reports";
            } else if (nameLower.includes("meeting") || nameLower.includes("agenda") || nameLower.includes("minutes")) {
                autoCategory = "Meeting Documents";
            } else if (nameLower.includes("policy") || nameLower.includes("guideline") || nameLower.includes("rule")) {
                autoCategory = "Policy Documents";
            } else if (nameLower.includes("report") || nameLower.includes("inspection") || nameLower.includes("field")) {
                autoCategory = "Field Officer Reports";
            } else if (nameLower.includes("circular") || nameLower.includes("notice") || nameLower.includes("order")) {
                autoCategory = "Government Circulars";
            }

            await uploadDocument(file, {
                category: selectedCategory === "All" ? autoCategory : selectedCategory,
                uploader: currentUser?.name || "Admin",
            });
        }
        // Small toast could be added here
    };

    return (
        <DashboardLayout title="Document Management" subtitle="Enterprise Document System & Secure Registry">
            
            {previewDoc && (
                <DocumentPreviewModal 
                    document={allDocuments.find(d => d.id === previewDoc.id) || previewDoc} 
                    onClose={() => setPreviewDoc(null)} 
                    onSelectDocument={(doc) => setPreviewDoc(doc)}
                />
            )}

            {/* Dashboard Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                    { label: "Total Documents", value: metrics.total, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Pending Verification", value: metrics.pending, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Approved Assets", value: metrics.approved, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Resolution Reports", value: metrics.resolutions, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Govt Circulars", value: metrics.circulars, color: "text-purple-600", bg: "bg-purple-50" },
                    { label: "Meeting Docs", value: metrics.meetings, color: "text-rose-600", bg: "bg-rose-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/70 backdrop-blur-xl border border-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                            <FileBarChart className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {showManualUpload && <ManualUploadModal onClose={() => setShowManualUpload(false)} />}

            {/* Upload Zones */}
            <div className="mb-8">
                {/* Drag & Drop Bulk Zone */}
                <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`w-full border-2 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileInput} />
                    <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 shadow-sm rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                        <UploadCloud className={`w-10 h-10 ${isDragging ? "text-indigo-600" : "text-indigo-500"}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Bulk Upload & Auto-Categorization</h3>
                    <p className="text-gray-500 font-medium text-lg mb-4 max-w-xl mx-auto">
                        Drag & drop multiple files here. Our AI engine will automatically scan, classify, and extract data from your documents.
                    </p>
                    <div className="flex gap-4">
                        <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">PDF</span>
                        <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">DOCX</span>
                        <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">JPG / PNG</span>
                    </div>
                </div>
            </div>

            {/* Categories & Search Bar */}
            <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 mb-6 space-y-4">
                
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    <button
                        onClick={() => setSelectedCategory("All")}
                        className={`shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                            selectedCategory === "All" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        All Assets
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                                selectedCategory === cat.name ? "bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <span className={cat.color}>{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Search & View Toggle */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, Citizen, Officer, Department, or Keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl font-medium text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div className="flex bg-gray-50 rounded-xl p-1 shrink-0">
                        <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>
                            <List className="w-5 h-5" />
                        </button>
                        <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>
                            <Grid className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Library View */}
            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm min-h-[400px]">
                
                {filteredDocs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No documents found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria or category filter.</p>
                    </div>
                )}

                {/* List View */}
                {viewMode === "list" && filteredDocs.length > 0 && (
                    <div className="divide-y divide-gray-50">
                        {filteredDocs.map(doc => (
                            <div key={doc.id} className="flex items-center p-5 hover:bg-gray-50/50 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center shrink-0 mr-5">
                                    <span className="text-[10px] font-black">{doc.type}</span>
                                    <FileText className="w-4 h-4 mt-0.5" />
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                    <h4 
                                        className="text-base font-bold text-gray-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                                        onClick={() => setPreviewDoc(doc)}
                                    >
                                        {doc.name}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs font-semibold text-gray-500">{doc.id}</span>
                                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.date}</span>
                                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1"><FolderOpen className="w-3 h-3" /> {doc.size}</span>
                                    </div>
                                </div>
                                
                                <div className="hidden md:flex flex-col items-end pr-8 shrink-0 w-48">
                                    <p className="text-sm font-bold text-gray-900 truncate">{doc.dept}</p>
                                    <p className="text-xs font-semibold text-gray-500 truncate">{doc.category}</p>
                                </div>

                                <div className="hidden lg:flex items-center justify-center shrink-0 w-32 pr-8">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${statusStyles[doc.status]}`}>
                                        {doc.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {doc.status === "pending" && currentUser?.role === "admin" && (
                                        <>
                                            <button onClick={() => updateStatus(doc.id, "approved")} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors opacity-0 group-hover:opacity-100" title="Approve">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => updateStatus(doc.id, "rejected")} className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100" title="Reject">
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => setPreviewDoc(doc)} className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="View Document">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                    {currentUser?.role === "admin" && (
                                        <button onClick={() => { if(window.confirm('Delete document?')) deleteDocument(doc.id); }} className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Grid View */}
                {viewMode === "grid" && filteredDocs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filteredDocs.map(doc => (
                            <div key={doc.id} className="bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-xl hover:shadow-indigo-900/5 transition-all group flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black">{doc.type}</span>
                                        <FileText className="w-4 h-4 mt-0.5" />
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${statusStyles[doc.status]}`}>
                                        {doc.status}
                                    </span>
                                </div>
                                <h4 
                                    className="text-lg font-bold text-gray-900 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors mb-2"
                                    onClick={() => setPreviewDoc(doc)}
                                >
                                    {doc.name}
                                </h4>
                                <div className="space-y-1 mb-4 flex-1">
                                    <p className="text-sm font-semibold text-gray-500">ID: {doc.id}</p>
                                    <p className="text-sm font-semibold text-gray-500">{doc.category}</p>
                                    <p className="text-sm font-semibold text-gray-500">{doc.dept}</p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-semibold text-gray-400">{doc.date}</span>
                                        <span className="text-xs font-semibold text-gray-400">{doc.size}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPreviewDoc(doc)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        {currentUser?.role === "admin" && (
                                            <button onClick={() => { if(window.confirm('Delete?')) deleteDocument(doc.id); }} className="p-2 bg-red-50 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
        </DashboardLayout>
    );
}
