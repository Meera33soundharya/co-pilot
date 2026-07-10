import React, { useState, useRef } from "react";
import { X, Upload, FileText } from "lucide-react";
import { useDocuments, type DocumentCategory } from "@/context/DocumentContext";
import { useComplaints } from "@/context/ComplaintsContext";

export function ManualUploadModal({ onClose }: { onClose: () => void }) {
    const { uploadDocument } = useDocuments();
    const { currentUser } = useComplaints();
    
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState<DocumentCategory>("Government Circulars");
    const [summary, setSummary] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categories: DocumentCategory[] = [
        "Complaint Documents", "Resolution Reports", "Government Circulars",
        "Meeting Documents", "Policy Documents", "Field Officer Reports"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        await uploadDocument(file, {
            category,
            summary: summary || "Manual upload with no summary.",
            uploader: currentUser?.name || "Admin",
            status: "approved" // Manual uploads by admin can be auto-approved
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up border border-white/20">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Manual Document Upload</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select File</label>
                        <div 
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" className="hidden" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} />
                            {file ? (
                                <div className="flex flex-col items-center justify-center gap-2 text-indigo-600 font-bold">
                                    <FileText className="w-8 h-8 mb-2" /> 
                                    {file.name}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-gray-500 font-medium">Click to browse a specific file</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Category (Topic)</label>
                        <select 
                            value={category} 
                            onChange={e => setCategory(e.target.value as DocumentCategory)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Summary / Notes</label>
                        <textarea 
                            value={summary}
                            onChange={e => setSummary(e.target.value)}
                            placeholder="Enter document details, notes, or descriptions..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none h-24 transition-all"
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors">Cancel</button>
                        <button type="submit" disabled={!file} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all">
                            <Upload className="w-4 h-4" /> Upload & Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
