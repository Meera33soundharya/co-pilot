import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useComplaints } from "@/context/ComplaintsContext";
import { 
    Search, Filter, Download, FileText, 
    Calendar, MapPin, Building2, User, ChevronDown, Eye, X, Shield, Clock, AlertTriangle, CheckCircle2, MessageCircle, ImageIcon
} from "lucide-react";

// Category → default "before" placeholder image
const CATEGORY_IMAGE: Record<string, string> = {
    "Water Supply":              "/complaint_water.png",
    "Electricity":               "/complaint_electricity.png",
    "Roads & Infrastructure":    "/complaint_road.png",
    "Sanitation":                "/complaint_sanitation.png",
    "Drainage":                  "/complaint_sanitation.png",
    "Public Health":             "/complaint_sanitation.png",
    "Parks & Recreation":        "/before_placeholder.png",
    "Enforcement":               "/before_placeholder.png",
    "Education":                 "/before_placeholder.png",
    "Ward Committee & Governance": "/before_placeholder.png",
    "Other":                     "/before_placeholder.png",
};

function downloadPDF(doc: any, complaint: any) {
    const beforeImg = (complaint?.evidence?.[0]) || CATEGORY_IMAGE[complaint?.category] || "/before_placeholder.png";
    const afterImg  = complaint?.resolutionProof || "/after_placeholder.png";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${doc.name}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#fff; color:#111; padding:40px; }
    .header { display:flex; align-items:center; justify-content:space-between; border-bottom:3px solid #B91C1C; padding-bottom:20px; margin-bottom:30px; }
    .brand { font-size:28px; font-weight:900; color:#B91C1C; letter-spacing:-1px; }
    .brand span { color:#111; }
    .meta { font-size:12px; color:#999; text-align:right; }
    h1 { font-size:20px; font-weight:800; margin-bottom:4px; }
    .badge { display:inline-block; background:#dcfce7; color:#166534; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:800; letter-spacing:1px; text-transform:uppercase; }
    .grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin:24px 0; }
    .card { background:#f8f8f8; border:1px solid #eee; border-radius:12px; padding:16px; }
    .card .label { font-size:10px; font-weight:800; text-transform:uppercase; color:#999; letter-spacing:1px; margin-bottom:4px; }
    .card .value { font-size:15px; font-weight:700; color:#111; }
    .section { margin:28px 0; }
    .section h2 { font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:#999; border-bottom:1px solid #eee; padding-bottom:8px; margin-bottom:16px; }
    .desc-box { background:#f8f8f8; border:1px solid #eee; border-radius:12px; padding:20px; }
    .desc-box h3 { font-size:17px; font-weight:800; margin-bottom:8px; }
    .desc-box p { font-size:14px; color:#555; line-height:1.6; }
    .notes-box { background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:18px; margin-bottom:12px; }
    .notes-box .lbl { font-size:10px; font-weight:800; text-transform:uppercase; color:#2563eb; letter-spacing:1px; margin-bottom:6px; }
    .notes-box p { font-size:13px; color:#1e3a8a; line-height:1.6; }
    .photos { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px; }
    .photo-card { border-radius:12px; overflow:hidden; border:2px solid #eee; }
    .photo-card.after { border-color:#bbf7d0; }
    .photo-label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px; padding:8px 14px; background:#f8f8f8; color:#555; }
    .photo-card.after .photo-label { background:#f0fdf4; color:#166534; }
    .photo-card img { width:100%; height:200px; object-fit:cover; display:block; }
    .footer { margin-top:40px; border-top:1px solid #eee; padding-top:16px; display:flex; justify-content:space-between; font-size:11px; color:#aaa; }
    .stamp { text-align:right; }
    .stamp .verified { font-size:13px; font-weight:900; color:#166534; text-transform:uppercase; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Gov<span>Pilot</span></div>
      <div style="font-size:11px;color:#999;margin-top:4px;text-transform:uppercase;letter-spacing:1px;">AI Governance Co-Pilot — Grievance Resolution Report</div>
    </div>
    <div class="meta">
      <div style="font-size:14px;font-weight:800;color:#111;">${doc.name}</div>
      <div>Generated: ${doc.date}</div>
      <div>Asset ID: ${doc.assetId}</div>
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
    <h1>${complaint?.issue || "Complaint"}</h1>
    <span class="badge">✓ Resolved</span>
  </div>

  <div class="grid4">
    <div class="card"><div class="label">Complaint ID</div><div class="value">${complaint?.id || doc.complaintId}</div></div>
    <div class="card"><div class="label">Category</div><div class="value">${complaint?.category || "—"}</div></div>
    <div class="card"><div class="label">Department</div><div class="value">${complaint?.dept || doc.dept}</div></div>
    <div class="card" style="background:#f0fdf4;border-color:#bbf7d0;"><div class="label" style="color:#166534;">Status</div><div class="value" style="color:#166534;">${complaint?.status || "Resolved"}</div></div>
  </div>

  <div class="grid4" style="margin-top:0;">
    <div class="card"><div class="label">Citizen</div><div class="value">${complaint?.citizen || "—"}</div></div>
    <div class="card"><div class="label">Ward</div><div class="value">${complaint?.ward || "—"}</div></div>
    <div class="card"><div class="label">Officer</div><div class="value">${complaint?.assignedTo || "Field Officer"}</div></div>
    <div class="card"><div class="label">Resolution Date</div><div class="value">${doc.date}</div></div>
  </div>

  <div class="section">
    <h2>Issue Description</h2>
    <div class="desc-box">
      <h3>${complaint?.issue || "—"}</h3>
      <p>${complaint?.description || "No description provided."}</p>
    </div>
  </div>

  <div class="section">
    <h2>Resolution Information</h2>
    <div class="notes-box">
      <div class="lbl">Resolution Notes</div>
      <p>${complaint?.resolutionNotes || doc.summary || "Complaint resolved by field officer."}</p>
    </div>
    ${complaint?.adminRemarks ? `<div class="notes-box" style="background:#faf5ff;border-color:#e9d5ff;"><div class="lbl" style="color:#7c3aed;">Admin Remarks</div><p style="color:#3b0764;">${complaint.adminRemarks}</p></div>` : ""}
    <div class="photos">
      <div class="photo-card">
        <div class="photo-label">📷 Before — Original Issue</div>
        <img src="${beforeImg}" alt="Before"/>
      </div>
      <div class="photo-card after">
        <div class="photo-label">✅ After — Resolution Proof</div>
        <img src="${afterImg}" alt="After"/>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>This report was auto-generated by GovPilot AI Governance Co-Pilot.<br/>For queries, contact your local Municipal Administration.</div>
    <div class="stamp"><div class="verified">✓ Verified & Closed</div><div style="margin-top:4px;">Document ID: ${doc.assetId}</div></div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, "_blank");
    if (win) {
        win.onload = () => {
            setTimeout(() => {
                win.print();
                URL.revokeObjectURL(url);
            }, 800);
        };
    }
}

export default function ResolutionReports() {
    const { closedDocs, allComplaints, currentUser } = useComplaints();
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("All");
    const [selectedDoc, setSelectedDoc] = useState<any>(null);

    const filteredDocs = closedDocs.filter(doc => {
        const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                            doc.complaintId.toLowerCase().includes(search.toLowerCase()) ||
                            doc.assetId.toLowerCase().includes(search.toLowerCase());
        const matchDept = deptFilter === "All" || doc.dept === deptFilter;
        return matchSearch && matchDept;
    });

    const uniqueDepts = Array.from(new Set(closedDocs.map(d => d.dept)));

    return (
        <DashboardLayout 
            title="Resolution Reports" 
            subtitle="Permanent record of all verified and closed complaint resolutions."
        >
            <div className="space-y-6">
                
                {/* ── Header Controls ── */}
                <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex-1 max-w-md relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#B91C1C] transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search by ID, Name, or Asset ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select 
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                className="appearance-none pl-10 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
                            >
                                <option value="All">All Departments</option>
                                {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* ── Reports Grid ── */}
                {filteredDocs.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center shadow-sm">
                        <FileText className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <h4 className="text-2xl font-black text-gray-400 uppercase tracking-widest">No reports found</h4>
                        <p className="text-gray-500 mt-2 font-medium">Try adjusting your search or filter criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredDocs.map((doc, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between">
                                {/* Hover Gradient */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 text-[#B91C1C]">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 border border-gray-200">
                                            {doc.size}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 group-hover:text-[#B91C1C] transition-colors">{doc.name}</h3>
                                    
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            Generated on {doc.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            {doc.dept}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                            <Search className="w-4 h-4 text-gray-400" />
                                            Complaint ID: {doc.complaintId}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-6 line-clamp-3 text-sm text-gray-600 font-medium">
                                        {doc.summary}
                                    </div>
                                </div>

                                <div className="relative z-10 flex items-center gap-3">
                                    <button 
                                        className="flex-1 py-3.5 bg-[#B91C1C] hover:bg-red-800 text-white text-sm font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                                        onClick={() => setSelectedDoc(doc)}
                                    >
                                        <Eye className="w-4 h-4" /> View Details
                                    </button>
                                    <button 
                                        className="w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0"
                                        onClick={() => {
                                            const c = allComplaints.find(c => c.id === doc.complaintId);
                                            downloadPDF(doc, c);
                                        }}
                                        title="Download PDF"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── View Details Modal ── */}
            {selectedDoc && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDoc(null)} />
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 text-[#B91C1C] rounded-2xl flex items-center justify-center">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{selectedDoc.name}</h3>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Resolution Report • {selectedDoc.date}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedDoc(null)}
                                className="w-10 h-10 bg-white border border-gray-200 text-gray-500 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-8">
                            {(() => {
                                const complaint = allComplaints.find(c => c.id === selectedDoc.complaintId);
                                if (!complaint) return <div className="text-center text-gray-500 py-10">Complaint details not found.</div>;
                                
                                return (
                                    <div className="space-y-8">
                                        
                                        {/* Meta Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Complaint ID</p>
                                                <p className="text-lg font-bold text-gray-900">{complaint.id}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Department</p>
                                                <p className="text-lg font-bold text-gray-900">{complaint.dept}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-xs font-black text-gray-400 uppercase mb-1">Category</p>
                                                <p className="text-lg font-bold text-gray-900">{complaint.category}</p>
                                            </div>
                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <p className="text-xs font-black text-emerald-600 uppercase mb-1">Status</p>
                                                <p className="text-lg font-bold text-emerald-700">{complaint.status}</p>
                                            </div>
                                        </div>

                                        {/* Issue Details */}
                                        <div>
                                            <h4 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-50 pb-2">Issue Description</h4>
                                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                                                <h5 className="text-2xl font-black text-gray-900">{complaint.issue}</h5>
                                                <p className="text-lg text-gray-600">{complaint.description}</p>
                                            </div>
                                        </div>

                                        {/* Resolution Details */}
                                        <div>
                                            <h4 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-50 pb-2">Resolution Information</h4>
                                            
                                            {/* Notes & Remarks */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                                    <p className="text-sm font-black text-blue-600 uppercase mb-2">Resolution Notes</p>
                                                    <p className="text-blue-900 font-medium">{complaint.resolutionNotes || selectedDoc.summary}</p>
                                                </div>
                                                
                                                {complaint.adminRemarks ? (
                                                    <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100">
                                                        <p className="text-sm font-black text-purple-600 uppercase mb-2">Admin Remarks</p>
                                                        <p className="text-purple-900 font-medium">{complaint.adminRemarks}</p>
                                                    </div>
                                                ) : (
                                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                                                        <div>
                                                            <p className="text-sm font-black text-gray-400 uppercase mb-1">Officer</p>
                                                            <p className="font-bold text-gray-700">{complaint.assignedTo || "Field Officer"}</p>
                                                        </div>
                                                        <div className="w-px h-10 bg-gray-200 mx-2"/>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-400 uppercase mb-1">Ward</p>
                                                            <p className="font-bold text-gray-700">{complaint.ward}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Before / After image comparison */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* BEFORE */}
                                                <div className="rounded-2xl overflow-hidden border border-gray-200 relative">
                                                    <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-black uppercase rounded-lg tracking-widest">
                                                        Before
                                                    </div>
                                                    <div className="w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                                                        {complaint.evidence && complaint.evidence.length > 0 ? (
                                                            <img 
                                                                src={complaint.evidence[0]} 
                                                                alt="Before" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <img 
                                                                src={CATEGORY_IMAGE[complaint.category] || "/before_placeholder.png"} 
                                                                alt="Before (default)" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* AFTER */}
                                                <div className="rounded-2xl overflow-hidden border border-emerald-200 relative">
                                                    <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-emerald-600/80 backdrop-blur-sm text-white text-xs font-black uppercase rounded-lg tracking-widest">
                                                        After
                                                    </div>
                                                    <div className="w-full aspect-video bg-emerald-50 flex items-center justify-center overflow-hidden">
                                                        <img 
                                                            src={complaint.resolutionProof || "/after_placeholder.png"} 
                                                            alt="After Resolution" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                        {/* Attachments */}
                                        {complaint.supportingDocs && complaint.supportingDocs.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-50 pb-2">Supporting Documents</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {complaint.supportingDocs.map((doc, idx) => {
                                                        const name = new URLSearchParams(doc.split('#')[1] || "").get("name") || `Document_${idx+1}`;
                                                        return (
                                                            <a key={idx} href={doc.split('#')[0]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                                                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                                                    <FileText className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-700">{name}</span>
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                );
                            })()}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedDoc(null)}
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    const c = allComplaints.find(c => c.id === selectedDoc.complaintId);
                                    downloadPDF(selectedDoc, c);
                                }}
                                className="px-6 py-3 bg-[#B91C1C] text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-red-800 transition-colors flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
