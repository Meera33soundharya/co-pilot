// ─────────────────────────────────────────────────────────────
//  Complaints Store — single source of truth
// ─────────────────────────────────────────────────────────────

export type Priority = "High" | "Medium" | "Low";
export type Category =
    | "Water Supply"
    | "Electricity"
    | "Roads & Infrastructure"
    | "Sanitation"
    | "Public Health"
    | "Parks & Recreation"
    | "Drainage"
    | "Enforcement"
    | "Education"
    | "Ward Committee & Governance"
    | "Other";

// Full workflow status
export type Status =
    | "New"
    | "Categorized"
    | "Assigned"
    | "In Progress"
    | "Pending Verification"
    | "Resolved"
    | "Closed";

export type Role = "admin" | "officer" | "citizen";

export interface AuditEntry {
    time: string;
    actor: string;
    action: string;
    note?: string;
    image?: string;
}

export interface Complaint {
    id: string;
    // Citizen info
    citizen: string;
    phone: string;
    ward: string;
    citizenId: string;

    // Problem info
    category: Category;
    issue: string;
    description: string;
    priority: Priority;

    // 🆕 Tamil Voice Fields
    originalComplaintTamil?: string;    // Original Tamil speech text
    translatedEnglish?: string; // AI-translated English version
    aiSummary?: string;          // Short AI-generated summary
    landmark?: string;           // Spoken landmark
    area?: string;               // Spoken area name

    // 🆕 Actionable Modules
    evidence?: string[];
    location?: string;
    coords?: { lat: number; lng: number };
    notifPref?: "SMS" | "Email" | "None";
    sentiment?: number;
    rating?: number;
    source?: "voice" | "web";

    // 🆕 Resolution Evidence
    resolutionProof?: string;
    resolutionNotes?: string;
    supportingDocs?: string[];
    adminRemarks?: string;
    resolutionDate?: number;
    officerDetails?: string;

    // Workflow
    status: Status;
    assignedTo: string;
    dept: string;

    // Meta
    time: string;
    timestamp: number;
    audit: AuditEntry[];
    notified: boolean;
}

// ── Auto-categorize from keywords ──────────────────────────────
const CATEGORY_KEYWORDS: { category: Category; words: string[] }[] = [
    { category: "Water Supply", words: ["water", "leak", "pipe", "tap", "supply", "bore", "தண்ணீர்", "குழாய்", "கசிவு"] },
    { category: "Electricity", words: ["light", "power", "electric", "voltage", "street light", "current", "மின்சாரம்", "விளக்கு", "கம்பி"] },
    { category: "Roads & Infrastructure", words: ["road", "pothole", "footpath", "pavement", "crack", "construction", "சாலை", "குழி", "பாதை"] },
    { category: "Sanitation", words: ["garbage", "waste", "dustbin", "trash", "toilet", "hygiene", "drain", "sewage", "குப்பை", "கழிவு", "துர்நாற்றம்"] },
    { category: "Drainage", words: ["drain", "flood", "waterlog", "clog", "overflow", "stormwater", "வடிகால்", "வெள்ளம்", "நீர்த்தேக்கம்"] },
    { category: "Public Health", words: ["health", "hospital", "clinic", "mosquito", "disease", "stray", "animal", "மருத்துவமனை", "கொசு", "நோய்"] },
    { category: "Parks & Recreation", words: ["park", "garden", "swing", "bench", "tree", "playground", "பூங்கா", "மரம்", "விளையாட்டு"] },
    { category: "Enforcement", words: ["noise", "illegal", "encroach", "vendor", "traffic", "parking", "hawker", "சத்தம்", "ஆக்கிரமிப்பு"] },
    { category: "Education", words: ["school", "teacher", "class", "student", "college", "education", "பள்ளி", "ஆசிரியர்", "மாணவர்"] },
    { category: "Ward Committee & Governance", words: ["committee", "politician", "meeting", "ward member", "mla", "councillor", "வார்டு", "கவுன்சிலர்"] },
];

export function autoCategory(text: string): Category {
    const lower = text.toLowerCase();
    for (const { category, words } of CATEGORY_KEYWORDS) {
        if (words.some(w => lower.includes(w))) return category;
    }
    return "Other";
}

// ── Category → default dept ────────────────────────────────────
export const CATEGORY_DEPT: Record<Category, string> = {
    "Water Supply": "Water Supply Department",
    "Electricity": "Electricity Board",
    "Roads & Infrastructure": "Roads & PWD",
    "Sanitation": "Sanitation Department",
    "Public Health": "Public Health",
    "Parks & Recreation": "Parks Department",
    "Drainage": "Drainage & Sewerage",
    "Enforcement": "Municipal Enforcement",
    "Education": "Education Department",
    "Ward Committee & Governance": "Governance & Ward Committee",
    "Other": "General Administration",
};

// ── Helpers ────────────────────────────────────────────────────
let _nextId = 9;
export function generateId(): string {
    return `#${String(_nextId++).padStart(3, '0')}`;
}

export function timeAgo(ms: number): string {
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
}

// ── Initial Tamil Voice Complaint Data ──────────────────────────
const now = Date.now();
const H = 3600000;
const D = 86400000;

function entry(actor: string, action: string, minsAgo = 0): AuditEntry {
    return { time: minsAgo === 0 ? "Just now" : `${minsAgo} min ago`, actor, action };
}

export const initialComplaints: Complaint[] = [
    {
        id: "#001",
        citizen: "ராமு",
        phone: "+91 98421 11234",
        ward: "வார்டு 12",
        citizenId: "citizen_ramu_001",
        category: "Water Supply",
        issue: "எங்க தெருவுல இரண்டு நாளா தண்ணீர் வரல.",
        description: "எங்க தெருவுல இரண்டு நாளா தண்ணீர் வரல.",
        originalComplaintTamil: "எங்க தெருவுல இரண்டு நாளா தண்ணீர் வரல.",
        area: "அண்ணா நகர்",
        priority: "High",
        status: "New",
        assignedTo: "",
        dept: "Water Supply Department",
        source: "voice",
        time: "Just now",
        timestamp: now - 5 * 60000,
        notified: false,
        audit: [entry("System", "குரல் புகார் பதிவு செய்யப்பட்டது", 5)],
    },
    {
        id: "#002",
        citizen: "சரஸ்வதி",
        phone: "+91 94423 55678",
        ward: "வார்டு 7",
        citizenId: "citizen_saraswathi_002",
        category: "Sanitation",
        issue: "சாலை முழுக்க குப்பை குவிஞ்சிருக்கு.",
        description: "சாலை முழுக்க குப்பை குவிஞ்சிருக்கு.",
        originalComplaintTamil: "சாலை முழுக்க குப்பை குவிஞ்சிருக்கு.",
        area: "தியாகராஜ நகர்",
        priority: "High",
        status: "Assigned",
        assignedTo: "Sanitation Department",
        dept: "Sanitation Department",
        source: "voice",
        time: "45 min ago",
        timestamp: now - 45 * 60000,
        notified: false,
        audit: [entry("System", "குரல் புகார் பதிவு செய்யப்பட்டது", 45)],
    },
    {
        id: "#003",
        citizen: "முருகன்",
        phone: "+91 97890 22345",
        ward: "வார்டு 3",
        citizenId: "citizen_murugan_003",
        category: "Electricity",
        issue: "தெருவிளக்கு மூன்று நாளா எரியல.",
        description: "தெருவிளக்கு மூன்று நாளா எரியல.",
        originalComplaintTamil: "தெருவிளக்கு மூன்று நாளா எரியல.",
        area: "கே.கே. நகர்",
        priority: "Medium",
        status: "In Progress",
        assignedTo: "Electricity Board",
        dept: "Electricity Board",
        source: "voice",
        time: "2 hours ago",
        timestamp: now - 2 * H,
        notified: false,
        audit: [entry("System", "குரல் புகார் பதிவு செய்யப்பட்டது", 120)],
    },
    {
        id: "#004",
        citizen: "லட்சுமி",
        phone: "+91 98765 44321",
        ward: "வார்டு 5",
        citizenId: "citizen_lakshmi_004",
        category: "Drainage",
        issue: "சாக்கடை நிரம்பி தண்ணீர் வெளியே வருகிறது.",
        description: "சாக்கடை நிரம்பி தண்ணீர் வெளியே வருகிறது.",
        originalComplaintTamil: "சாக்கடை நிரம்பி தண்ணீர் வெளியே வருகிறது.",
        area: "வேளச்சேரி",
        priority: "High",
        status: "New",
        assignedTo: "",
        dept: "Drainage & Sewerage",
        source: "voice",
        time: "3 hours ago",
        timestamp: now - 3 * H,
        notified: false,
        audit: [entry("System", "குரல் புகார் பதிவு செய்யப்பட்டது", 180)],
    },
    {
        id: "#005",
        citizen: "கார்த்திக்",
        phone: "+91 99001 33456",
        ward: "வார்டு 9",
        citizenId: "citizen_karthik_005",
        category: "Roads & Infrastructure",
        issue: "ரோடு முழுக்க பள்ளம்.",
        description: "ரோடு முழுக்க பள்ளம்.",
        originalComplaintTamil: "ரோடு முழுக்க பள்ளம்.",
        area: "பாண்டி பஜார்",
        priority: "Medium",
        status: "Assigned",
        assignedTo: "Roads & PWD",
        dept: "Roads & PWD",
        source: "voice",
        time: "1 day ago",
        timestamp: now - 1 * D,
        notified: false,
        audit: [entry("System", "குரல் புகார் பதிவு செய்யப்பட்டது", 1440)],
    },
    {
        id: "#006",
        citizen: "தேவி",
        phone: "+91 91234 77890",
        ward: "வார்டு 2",
        citizenId: "citizen_devi_006",
        category: "Drainage",
        issue: "மழைநீர் வீட்டுக்குள் வருகிறது.",
        description: "மழைநீர் வீட்டுக்குள் வருகிறது.",
        originalComplaintTamil: "மழைநீர் வீட்டுக்குள் வருகிறது.",
        area: "மாம்பலம்",
        priority: "High",
        status: "In Progress",
        assignedTo: "Drainage & Sewerage",
        dept: "Drainage & Sewerage",
        source: "voice",
        time: "1 day ago",
        timestamp: now - 1 * D - 2 * H,
        notified: true,
        audit: [entry("System", "குரல் புகார் பதிவு செய்யப்பட்டது", 1560)],
    },
    {
        id: "#007",
        citizen: "வேலு",
        phone: "+91 98321 66543",
        ward: "வார்டு 15",
        citizenId: "citizen_velu_007",
        category: "Water Supply",
        issue: "குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாகிறது.",
        description: "குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாகிறது.",
        originalComplaintTamil: "குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாகிறது.",
        area: "கோடம்பாக்கம்",
        priority: "High",
        status: "Resolved",
        assignedTo: "Water Supply Department",
        dept: "Water Supply Department",
        source: "voice",
        time: "2 days ago",
        timestamp: now - 2 * D,
        notified: true,
        audit: [entry("System", "குரல் புகார் பதிவு செய்யப்பட்டது", 2880)],
    },
    {
        id: "#008",
        citizen: "அனிதா",
        phone: "+91 93456 88901",
        ward: "வார்டு 6",
        citizenId: "citizen_anitha_008",
        category: "Electricity",
        issue: "மின்கம்பி கீழே தொங்குது.",
        description: "மின்கம்பி கீழே தொங்குது.",
        originalComplaintTamil: "மின்கம்பி கீழே தொங்குது.",
        area: "அடையாறு",
        priority: "High",
        status: "New",
        assignedTo: "",
        dept: "Electricity Board",
        source: "voice",
        time: "Just now",
        timestamp: now - 2 * 60000,
        notified: false,
        audit: [entry("System", "குரல் புகார் பதிவு செய்யப்பட்டது", 2)],
    },
    {
        id: "#009",
        citizen: "பாலு",
        phone: "+91 93456 77901",
        ward: "வார்டு 10",
        citizenId: "citizen_balu_009",
        category: "Sanitation",
        issue: "பொது கழிப்பிடம் சுத்தம் இல்லை.",
        description: "பொது கழிப்பிடம் சுத்தம் இல்லை.",
        originalComplaintTamil: "பொது கழிப்பிடம் சுத்தம் இல்லை.",
        area: "மைலாப்பூர்",
        priority: "Medium",
        status: "New",
        assignedTo: "",
        dept: "Sanitation Department",
        source: "voice",
        time: "1 hour ago",
        timestamp: now - 1 * H,
        notified: false,
        audit: [entry("System", "குரல் புகார் பதிவு செய்யப்பட்டது", 60)],
    },
    {
        id: "#010",
        citizen: "கவிதா",
        phone: "+91 93456 55901",
        ward: "வார்டு 11",
        citizenId: "citizen_kavitha_010",
        category: "Sanitation",
        issue: "குப்பை வண்டி ஒரு வாரமா வரல.",
        description: "குப்பை வண்டி ஒரு வாரமா வரல.",
        originalComplaintTamil: "குப்பை வண்டி ஒரு வாரமா வரல.",
        area: "சைதாப்பேட்டை",
        priority: "Low",
        status: "New",
        assignedTo: "",
        dept: "Sanitation Department",
        source: "voice",
        time: "4 hours ago",
        timestamp: now - 4 * H,
        notified: false,
        audit: [entry("System", "குரல் புகார் பதிவு செய்யப்பட்டது", 240)],
    }
];
