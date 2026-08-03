import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useComplaints } from "./ComplaintsContext";
import { extractText, generateContentHash } from "../services/documentTextExtractor";
import { generateDocumentSummary, type ExecutiveSummary } from "../services/documentAiService";

// Document Categories based on requirements
export type DocumentCategory = 
    | "Complaint Documents"
    | "Resolution Reports"
    | "Government Circulars"
    | "Meeting Documents"
    | "Policy Documents"
    | "Field Officer Reports";

export type DocumentStatus = "approved" | "pending" | "draft" | "rejected";

export interface DocumentVersion {
    versionId: string;
    date: string;
    uploadedBy: string;
    changes: string;
    url: string; // Base64 or object URL
}

export interface DocumentRecord {
    id: string; // Unique ID (e.g. DOC-1234)
    name: string;
    type: string; // PDF, DOCX, etc.
    size: string; // e.g. 2.4 MB
    date: string;
    uploadTimestamp: number;
    category: DocumentCategory;
    status: DocumentStatus;
    access: "public" | "restricted" | "internal";
    dept: string;
    summary: string;
    uploader: string;
    
    // Searchable metadata
    complaintId?: string;
    citizenName?: string;
    officerName?: string;
    ward?: string;

    // AI Features
    aiScore?: number;
    aiInsights?: string[];
    ocrText?: string;
    
    // AI Document Summarization Pipeline
    executiveSummary?: ExecutiveSummary;
    contentHash?: string;
    extractedText?: string;
    summaryStatus?: 'idle' | 'extracting' | 'summarizing' | 'done' | 'error';
    
    // Versions
    versions: DocumentVersion[];
    
    // The actual file contents
    fileData: string; // Base64
}

interface DocumentContextProps {
    documents: DocumentRecord[];
    // Computed array that includes both `documents` AND dynamically generated `closedDocs` from ComplaintsContext
    allDocuments: DocumentRecord[];
    
    uploadDocument: (file: File, meta: Partial<DocumentRecord>) => Promise<void>;
    deleteDocument: (id: string) => void;
    updateStatus: (id: string, status: DocumentStatus) => void;
    updateDetails: (id: string, updates: Partial<DocumentRecord>) => void;
    addVersion: (id: string, file: File, changes: string, uploader: string) => Promise<void>;
    regenerateSummary: (id: string) => Promise<void>;
}

const DocCtx = createContext<DocumentContextProps | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
    const { closedDocs, allComplaints } = useComplaints();
    const documentsRef = useRef<DocumentRecord[]>([]);
    const allDocumentsRef = useRef<DocumentRecord[]>([]);
    const [documentUpdates, setDocumentUpdates] = useState<Record<string, Partial<DocumentRecord>>>({});
    
    const defaultDocuments: DocumentRecord[] = [
        {
            id: "DOC-9001",
            name: "Streetlight_Complaint_Evidence.jpg",
            type: "JPG",
            size: "1.2 MB",
            date: "Jul 10, 2026",
            uploadTimestamp: Date.now() - 100000,
            category: "Complaint Documents",
            status: "pending",
            access: "public",
            dept: "Public Works",
            summary: "Photo evidence of broken streetlight submitted by a citizen.",
            uploader: "Citizen App",
            versions: [],
            fileData: "",
            aiScore: 88,
            aiInsights: ["Contains clear visual evidence of infrastructure damage.", "Matches complaint description."],
            ocrText: "No text detected."
        },
        {
            id: "DOC-9002",
            name: "GO_2026_Smart_City_Initiative.pdf",
            type: "PDF",
            size: "4.5 MB",
            date: "Jul 05, 2026",
            uploadTimestamp: Date.now() - 200000,
            category: "Government Circulars",
            status: "approved",
            access: "public",
            dept: "Urban Planning",
            summary: "Official government circular detailing the Q3 budget allocations for the Smart City Initiative.",
            uploader: "Admin",
            versions: [],
            fileData: "",
            aiScore: 95,
            aiInsights: ["Key financial allocations discussed.", "High priority directive from State Dept."],
            ocrText: "GOVERNMENT ORDER NO. 45...\nSubject: Smart City Initiative Q3 Budget..."
        },
        {
            id: "DOC-9003",
            name: "City_Council_Meeting_Minutes_July.docx",
            type: "DOCX",
            size: "0.8 MB",
            date: "Jul 08, 2026",
            uploadTimestamp: Date.now() - 300000,
            category: "Meeting Documents",
            status: "approved",
            access: "internal",
            dept: "Mayor's Office",
            summary: "Minutes from the monthly city council meeting, detailing public transport expansions.",
            uploader: "Secretary",
            versions: [],
            fileData: "",
            aiScore: 78,
            aiInsights: ["Public transport expansion approved.", "New transit lines discussed."],
            ocrText: "Meeting called to order at 10:00 AM..."
        },
        {
            id: "DOC-9004",
            name: "Urban_Water_Management_Policy_V2.pdf",
            type: "PDF",
            size: "3.1 MB",
            date: "Jun 20, 2026",
            uploadTimestamp: Date.now() - 400000,
            category: "Policy Documents",
            status: "approved",
            access: "public",
            dept: "Water Board",
            summary: "Updated guidelines for commercial and residential water usage and conservation targets.",
            uploader: "Water Dept Admin",
            versions: [],
            fileData: "",
            aiScore: 92,
            aiInsights: ["Outlines new water conservation targets.", "Penalties for commercial overuse defined."],
            ocrText: "URBAN WATER MANAGEMENT POLICY 2026..."
        },
        {
            id: "DOC-9005",
            name: "Field_Inspection_Report_Ward_7.pdf",
            type: "PDF",
            size: "2.5 MB",
            date: "Jul 09, 2026",
            uploadTimestamp: Date.now() - 500000,
            category: "Field Officer Reports",
            status: "pending",
            access: "restricted",
            dept: "Sanitation",
            summary: "Routine field inspection of the newly installed waste management bins in Ward 7.",
            uploader: "Officer Raj",
            versions: [],
            fileData: "",
            aiScore: 85,
            aiInsights: ["Bins installed successfully.", "Minor delays in pick-up schedule noted."],
            ocrText: "Inspection Date: July 9, 2026\nLocation: Ward 7 Commercial District..."
        }
    ];

    const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
        try {
            const saved = localStorage.getItem("copilot_documents_v1");
            let existing: DocumentRecord[] = [];
            if (saved) {
                existing = JSON.parse(saved);
                // Auto-recover any stuck 'error' states from previous bugs
                existing = existing.map(doc => 
                    doc.summaryStatus === 'error' ? { ...doc, summaryStatus: 'idle' } : doc
                );
            }
            
            // Merge defaults if they don't exist yet
            const merged = [...existing];
            defaultDocuments.forEach(defDoc => {
                if (!merged.find(d => d.id === defDoc.id)) {
                    merged.push(defDoc);
                }
            });
            
            return merged;
        } catch {
            return defaultDocuments;
        }
    });

    useEffect(() => {
        documentsRef.current = documents;
        localStorage.setItem("copilot_documents_v1", JSON.stringify(documents));
    }, [documents]);

    const allDocuments = [...documents];
    
    // Auto-extract documents from Resolved/Closed Complaints
    allComplaints.forEach(comp => {
        if (comp.status === "Resolved" || comp.status === "Closed") {
            // 1. Extract citizen evidence -> Complaint Documents
            if (comp.evidence) {
                comp.evidence.forEach((ev, i) => {
                    const assetId = `EVD-${comp.id}-${i}`;
                    if (!allDocuments.find(d => d.id === assetId)) {
                        allDocuments.push({
                            id: assetId,
                            name: `Evidence_${comp.id}_${i+1}.jpg`,
                            type: "JPG",
                            size: "1.5 MB",
                            date: new Date(comp.timestamp).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
                            uploadTimestamp: comp.timestamp,
                            category: "Complaint Documents",
                            status: "approved",
                            access: "public",
                            dept: comp.dept || "Unassigned",
                            summary: `Original evidence submitted by citizen for complaint ${comp.id}: ${comp.issue}`,
                            uploader: comp.citizen || "Citizen",
                            complaintId: comp.id,
                            versions: [],
                            fileData: ev,
                            aiInsights: ["Extracted from citizen complaint", "Visual evidence of the reported issue"],
                            ocrText: "Image evidence. No OCR data."
                        });
                    }
                });
            }
            // 2. Extract resolution proof -> Field Officer Reports
            if (comp.resolutionProof) {
                const assetId = `PRF-${comp.id}`;
                if (!allDocuments.find(d => d.id === assetId)) {
                    allDocuments.push({
                        id: assetId,
                        name: `Resolution_Proof_${comp.id}.jpg`,
                        type: "JPG",
                        size: "2.1 MB",
                        date: new Date(comp.resolutionDate || Date.now()).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
                        uploadTimestamp: comp.resolutionDate ? new Date(comp.resolutionDate).getTime() : Date.now(),
                        category: "Field Officer Reports",
                        status: "approved",
                        access: "public",
                        dept: comp.dept || "Unassigned",
                        summary: `Photographic proof of resolution for complaint ${comp.id}. Officer notes: ${comp.resolutionNotes || 'None'}`,
                        uploader: comp.officerDetails || "Field Officer",
                        complaintId: comp.id,
                        versions: [],
                        fileData: comp.resolutionProof,
                        aiInsights: ["Resolution verification image", "Confirms issue has been addressed"],
                        ocrText: "Image evidence. No OCR data."
                    });
                }
            }
        }
    });

    // Merge closedDocs from ComplaintsContext (Resolution Reports PDF)
    if (closedDocs) {
        closedDocs.forEach(cd => {
            if (!allDocuments.find(d => d.id === cd.assetId)) {
            allDocuments.push({
                id: cd.assetId,
                name: cd.name,
                type: cd.type,
                size: cd.size,
                date: cd.date,
                uploadTimestamp: new Date(cd.date).getTime(), // Approximation
                category: "Resolution Reports",
                status: cd.status as DocumentStatus || "approved",
                access: cd.access as any || "public",
                dept: cd.dept || "Cross-Department",
                summary: cd.summary || "System generated resolution report",
                uploader: cd.uploader || "System Auto-Gen",
                complaintId: cd.complaintId,
                versions: [],
                fileData: cd.resolutionProof || "",
                aiInsights: ["Auto-generated report from closed complaint", "Contains before & after validation"],
                ocrText: "Automatically generated Resolution Report for " + cd.complaintId
            });
        }
    });
}

    // Apply any dynamic updates
    const finalAllDocuments = allDocuments.map(doc => {
        const updates = documentUpdates[doc.id];
        return updates ? { ...doc, ...updates } : doc;
    });

    // Update ref for callbacks to access latest docs
    allDocumentsRef.current = finalAllDocuments;

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    // ─── State Update Helper ───────────────────────────────
    const updateDocState = useCallback((docId: string, updates: Partial<DocumentRecord>) => {
        setDocuments(prev => {
            if (prev.some(d => d.id === docId)) {
                return prev.map(d => d.id === docId ? { ...d, ...updates } : d);
            }
            return prev;
        });
        setDocumentUpdates(prev => ({ ...prev, [docId]: { ...(prev[docId] || {}), ...updates } }));
    }, []);

    // ─── AI Summarization Pipeline ───────────────────────────────
    const runSummarizationPipeline = useCallback(async (docId: string, retryCount = 0) => {
        updateDocState(docId, { summaryStatus: 'extracting' });

        try {
            const currentDoc = allDocumentsRef.current.find(d => d.id === docId);
            
            if (!currentDoc || (!currentDoc.fileData && !currentDoc.ocrText && !currentDoc.summary)) {
                updateDocState(docId, { summaryStatus: 'error' });
                return;
            }

            console.log(`[Pipeline] Extracting text for document ${docId}...`);
            let extractionText = currentDoc.extractedText || currentDoc.ocrText || currentDoc.summary || "";
            
            if (currentDoc.fileData) {
                try {
                    const extraction = await extractText(currentDoc.fileData, currentDoc.name, currentDoc.type);
                    if (extraction.text) extractionText = extraction.text;
                } catch (e) {
                    console.warn("Extraction failed, using fallback text", e);
                }
            }

            const newHash = generateContentHash(extractionText);

            if (currentDoc.contentHash === newHash && currentDoc.executiveSummary) {
                console.log(`[Pipeline] Content unchanged for ${docId}, skipping AI summary generation.`);
                updateDocState(docId, { summaryStatus: 'done' });
                return;
            }

            updateDocState(docId, {
                extractedText: extractionText,
                ocrText: extractionText || currentDoc.ocrText,
                contentHash: newHash,
                summaryStatus: 'summarizing'
            });

            console.log(`[Pipeline] Summarizing content for ${docId}...`);
            const summary = await generateDocumentSummary(
                extractionText,
                currentDoc.category,
                {
                    fileName: currentDoc.name,
                    dept: currentDoc.dept,
                    ward: currentDoc.ward,
                    date: currentDoc.date,
                    status: currentDoc.status,
                    officerName: currentDoc.officerName,
                    citizenName: currentDoc.citizenName,
                }
            );

            updateDocState(docId, {
                executiveSummary: summary,
                summary: summary.subject,
                summaryStatus: 'done'
            });
            console.log(`[Pipeline] Success for ${docId}.`);

        } catch (error) {
            console.error(`[Pipeline] Summarization failed for ${docId} (Attempt ${retryCount + 1}):`, error);
            
            if (retryCount < 2) {
                console.log(`[Pipeline] Retrying in 2 seconds...`);
                setTimeout(() => runSummarizationPipeline(docId, retryCount + 1), 2000);
            } else {
                updateDocState(docId, { summaryStatus: 'error' });
            }
        }
    }, [updateDocState]);

    const regenerateSummary = useCallback(async (id: string) => {
        updateDocState(id, {
            executiveSummary: undefined,
            contentHash: undefined,
            extractedText: undefined,
            summaryStatus: 'extracting',
        });
        await new Promise(r => setTimeout(r, 100));
        await runSummarizationPipeline(id, 0);
    }, [runSummarizationPipeline, updateDocState]);

    const uploadDocument = async (file: File, meta: Partial<DocumentRecord>) => {
        const base64 = await fileToBase64(file);
        const docId = meta.id || `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const newDoc: DocumentRecord = {
            id: docId,
            name: file.name,
            type: file.name.split('.').pop()?.toUpperCase() || "FILE",
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
            uploadTimestamp: Date.now(),
            category: meta.category || "Government Circulars",
            status: meta.status || "pending",
            access: meta.access || "restricted",
            dept: meta.dept || "Unassigned",
            summary: meta.summary || "Pending AI review.",
            uploader: meta.uploader || "Unknown",
            versions: [{
                versionId: "v1.0",
                date: new Date().toLocaleDateString("en-IN"),
                uploadedBy: meta.uploader || "Unknown",
                changes: "Initial Upload",
                url: base64
            }],
            fileData: base64,
            aiScore: Math.floor(Math.random() * 40) + 60,
            aiInsights: ["AI scanning complete", "No critical threats detected"],
            ocrText: "OCR extraction pending...",
            summaryStatus: 'idle',
            ...meta
        };

        setDocuments(prev => [newDoc, ...prev]);

        // Auto-trigger the AI summarization pipeline
        // Use setTimeout to ensure the state update has propagated
        setTimeout(() => {
            runSummarizationPipeline(docId);
        }, 100);
    };

    const deleteDocument = (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const updateStatus = (id: string, status: DocumentStatus) => {
        updateDocState(id, { status });
    };

    const updateDetails = (id: string, updates: Partial<DocumentRecord>) => {
        updateDocState(id, updates);
    };

    const addVersion = async (id: string, file: File, changes: string, uploader: string) => {
        const base64 = await fileToBase64(file);
        const currentDoc = allDocumentsRef.current.find(d => d.id === id);
        
        if (currentDoc) {
            const newVersion: DocumentVersion = {
                versionId: `v${currentDoc.versions.length + 1}.0`,
                date: new Date().toLocaleDateString("en-IN"),
                uploadedBy: uploader,
                changes,
                url: base64
            };
            updateDocState(id, {
                fileData: base64,
                versions: [newVersion, ...currentDoc.versions]
            });
        }
    };

    return (
        <DocCtx.Provider value={{
            documents, allDocuments: finalAllDocuments, uploadDocument, deleteDocument, updateStatus, updateDetails, addVersion, regenerateSummary
        }}>
            {children}
        </DocCtx.Provider>
    );
}

export function useDocuments() {
    const ctx = useContext(DocCtx);
    if (!ctx) throw new Error("useDocuments must be used within DocumentProvider");
    return ctx;
}
