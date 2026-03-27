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
    | "Resolved"
    | "Closed";

export type Role = "admin" | "officer" | "citizen";

export interface AuditEntry {
    time: string;
    actor: string;
    action: string;
    note?: string; // Officer comments / details
    image?: string; // Proof of work
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

    // 🆕 New Actionable Modules
    evidence?: string[];      // URLs to photos/videos
    location?: string;        // Text location
    coords?: { lat: number; lng: number }; // Map pin
    notifPref?: "SMS" | "Email" | "None";
    sentiment?: number;       // 0 to 100 scoring
    rating?: number;          // 1-5 stars citizen feedback
    resolutionProof?: string; // Base64 or URL of "after" photo

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
    { category: "Water Supply", words: ["water", "leak", "pipe", "tap", "supply", "bore"] },
    { category: "Electricity", words: ["light", "power", "electric", "voltage", "street light", "current"] },
    { category: "Roads & Infrastructure", words: ["road", "pothole", "footpath", "pavement", "crack", "construction"] },
    { category: "Sanitation", words: ["garbage", "waste", "dustbin", "trash", "toilet", "hygiene", "drain", "sewage"] },
    { category: "Drainage", words: ["drain", "flood", "waterlog", "clog", "overflow", "stormwater"] },
    { category: "Public Health", words: ["health", "hospital", "clinic", "mosquito", "disease", "stray", "animal"] },
    { category: "Parks & Recreation", words: ["park", "garden", "swing", "bench", "tree", "playground"] },
    { category: "Enforcement", words: ["noise", "illegal", "encroach", "vendor", "traffic", "parking", "hawker"] },
    { category: "Education", words: ["school", "teacher", "class", "student", "college", "education"] },
    { category: "Ward Committee & Governance", words: ["committee", "politician", "meeting", "ward member", "mla", "official visit", "councillor", "liason"] },
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
let _nextId = 8300;
export function generateId(): string {
    return `GRV-${_nextId++}`;
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

// ── Initial demo data ──────────────────────────────────────────
const now = Date.now();
const H = 3600000;
const D = 86400000;

function entry(actor: string, action: string, minsAgo = 0): AuditEntry {
    return { time: minsAgo === 0 ? "Just now" : `${minsAgo} min ago`, actor, action };
}

export const initialComplaints: Complaint[] = [
    {
        id: "GRV-8296", citizen: "Online Citizen", phone: "+91 90000 12345",
        ward: "Ward 02", citizenId: "citizen_amit",
        category: "Water Supply", issue: "No water supply for 2 days – Sector 4",
        description: "The water supply has been completely cut off for 2 days in Sector 4. Residents are buying water at high cost. Urgent repair needed.",
        priority: "High", status: "New", assignedTo: "", dept: "Water Supply Department",
        time: "Just now", timestamp: now - 1 * 60000, notified: false,
        audit: [
            entry("Citizen", "Complaint submitted via Online Portal", 1),
            entry("System", "Auto-categorized as Water Supply", 0),
        ],
    },
    {

        id: "GRV-8295", citizen: "Meera Soundarya", phone: "+91 63821 54321",
        ward: "Ward 05", citizenId: "citizen_meera",
        category: "Electricity", issue: "Live wire dangling on street near Park West",
        description: "Extremely dangerous live wire hanging low after last night's wind. Needs immediate isolation before anyone gets hurt.",
        priority: "High", status: "New", assignedTo: "", dept: "Electricity Board",
        time: "Just now", timestamp: now - 5 * 60000, notified: false,
        audit: [
            entry("System", "Complaint submitted via mobile app", 5),
            entry("System", "Auto-categorized as Electricity (CRITICAL)", 4),
        ],
    },
    {
        id: "GRV-8294", citizen: "Amit Patel", phone: "+91 98765 43210",
        ward: "Ward 03", citizenId: "citizen_amit",
        category: "Water Supply", issue: "Severe water leakage – Block C, Sector 7",
        description: "Water is leaking from the main pipeline near Block C and flooding the road, making it dangerous for pedestrians and vehicles.",
        priority: "High", status: "In Progress", assignedTo: "Rajiv Kumar (Water Dept)", dept: "Water Supply Department",
        time: "2 hours ago", timestamp: now - 2 * H, notified: false,
        audit: [
            entry("System", "Complaint submitted by citizen", 120),
            entry("System", "Auto-categorized as Water Supply", 119),
            entry("Admin", "Assigned to Water Supply Department", 115),
            entry("Rajiv Kumar", "Started working on the complaint", 60),
        ],
    },
    {
        id: "GRV-8293", citizen: "Sunita Rao", phone: "+91 87654 32109",
        ward: "Ward 12", citizenId: "citizen_sunita",
        category: "Electricity", issue: "Street light not working near DAV School",
        description: "Three consecutive street lights have been non-functional for 5 days, creating serious safety issues for students at night.",
        priority: "Medium", status: "Assigned", assignedTo: "Electricity Board", dept: "Electricity Board",
        time: "4 hours ago", timestamp: now - 4 * H, notified: false,
        audit: [
            entry("System", "Complaint submitted by citizen", 240),
            entry("System", "Auto-categorized as Electricity", 239),
            entry("Admin", "Assigned to Electricity Board", 235),
        ],
    },
    {
        id: "GRV-8292", citizen: "Vikram Singh", phone: "+91 76543 21098",
        ward: "Ward 06", citizenId: "citizen_vikram",
        category: "Roads & Infrastructure", issue: "Broken road causing accidents on Main Road",
        description: "A large pothole formed due to recent rain. Two accidents have already occurred. Urgent road repair is needed immediately.",
        priority: "High", status: "New", assignedTo: "", dept: "Roads & PWD",
        time: "5 hours ago", timestamp: now - 5 * H, notified: false,
        audit: [
            entry("System", "Complaint submitted by citizen", 300),
            entry("System", "Auto-categorized as Roads & Infrastructure", 299),
        ],
    },
    {
        id: "GRV-8291", citizen: "Ananya Iyer", phone: "+91 65432 10987",
        ward: "Ward 09", citizenId: "citizen_ananya",
        category: "Sanitation", issue: "Garbage not collected for 3 days",
        description: "No garbage collection truck has visited our area for 3 days. Waste is piling up near the main entrance gate.",
        priority: "Medium", status: "Resolved", assignedTo: "Sanitation Department", dept: "Sanitation Department",
        time: "1 day ago", timestamp: now - 1 * D, notified: true,
        audit: [
            entry("System", "Complaint submitted", 1440),
            entry("System", "Auto-categorized as Sanitation", 1438),
            entry("Admin", "Assigned to Sanitation Dept", 1430),
            entry("Officer", "Started work", 1200),
            entry("Officer", "Garbage cleared. Resolved.", 720),
            entry("System", "Citizen notified via SMS", 719),
        ],
    },
    {
        id: "GRV-8290", citizen: "Karan Mehta", phone: "+91 54321 09876",
        ward: "Ward 03", citizenId: "citizen_karan",
        category: "Drainage", issue: "Drain blocked after heavy rain",
        description: "The drainage outlet near the park is completely blocked, causing waterlogging inside 4 residential houses.",
        priority: "High", status: "In Progress", assignedTo: "Drainage & Sewerage", dept: "Drainage & Sewerage",
        time: "1 day ago", timestamp: now - 1 * D, notified: false,
        audit: [
            entry("System", "Complaint submitted", 1440),
            entry("System", "Auto-categorized as Drainage", 1439),
            entry("Admin", "Assigned to Drainage & Sewerage", 1430),
            entry("Officer", "Work in progress — clearing blockage", 800),
        ],
    },
    {
        id: "GRV-8289", citizen: "Priya Sharma", phone: "+91 43210 98765",
        ward: "Ward 07", citizenId: "citizen_priya",
        category: "Parks & Recreation", issue: "Broken swings in community park",
        description: "The swing and slide in the community park are broken and sharp-edged. Children risk injury when using them.",
        priority: "Low", status: "Categorized", assignedTo: "", dept: "Parks Department",
        time: "2 days ago", timestamp: now - 2 * D, notified: false,
        audit: [
            entry("System", "Complaint submitted", 2880),
            entry("System", "Auto-categorized as Parks & Recreation", 2879),
        ],
    },
    {
        id: "GRV-8288", citizen: "Rajesh Sharma", phone: "+91 32109 87654",
        ward: "Ward 11", citizenId: "citizen_rajesh",
        category: "Enforcement", issue: "Loud construction work after 10 PM",
        description: "Construction work continues past 10 PM every night, violating municipal noise regulations and disturbing residents.",
        priority: "Medium", status: "Closed", assignedTo: "Municipal Enforcement", dept: "Municipal Enforcement",
        time: "3 days ago", timestamp: now - 3 * D, notified: true,
        audit: [
            entry("System", "Complaint submitted", 4320),
            entry("System", "Auto-categorized", 4319),
            entry("Admin", "Assigned to Enforcement", 4300),
            entry("Officer", "Warning issued to builder", 3000),
            entry("Officer", "Marked resolved", 2500),
            entry("Admin", "Complaint closed", 2400),
        ],
    },
    {
        id: "GRV-8287", citizen: "Deepika Nair", phone: "+91 21098 76543",
        ward: "Ward 04", citizenId: "citizen_deepika",
        category: "Roads & Infrastructure", issue: "Deep pothole damaging vehicles near temple",
        description: "A deep pothole near the temple entrance has damaged 3 vehicles this week. Urgent repair and warning signs needed.",
        priority: "High", status: "In Progress", assignedTo: "Roads & PWD", dept: "Roads & PWD",
        time: "3 days ago", timestamp: now - 3 * D, notified: false,
        audit: [
            entry("System", "Complaint submitted", 4320),
            entry("System", "Auto-categorized as Roads", 4319),
            entry("Admin", "Assigned to Roads & PWD", 4300),
            entry("Officer", "Inspection done. Repair scheduled.", 2000),
        ],
    },
    {
        id: "GRV-8286", citizen: "Mohammed Ali", phone: "+91 10987 65432",
        ward: "Ward 02", citizenId: "citizen_ali",
        category: "Sanitation", issue: "Public toilet dirty near Ward Office",
        description: "The public toilet near the ward office has not been cleaned for over a week. Condition is extremely unhygienic.",
        priority: "Medium", status: "New", assignedTo: "", dept: "Sanitation Department",
        time: "4 days ago", timestamp: now - 4 * D, notified: false,
        audit: [
            entry("System", "Complaint submitted", 5760),
            entry("System", "Auto-categorized as Sanitation", 5759),
        ],
    },
    {
        id: "GRV-8285", citizen: "Suresh Babu", phone: "+91 09876 54321",
        ward: "Ward 08", citizenId: "citizen_suresh",
        category: "Enforcement", issue: "Footpath blocked by vendor stall near market",
        description: "A vendor has set up a permanent stall blocking the footpath near the main market, preventing pedestrian movement.",
        priority: "Low", status: "Resolved", assignedTo: "Municipal Enforcement", dept: "Municipal Enforcement",
        time: "5 days ago", timestamp: now - 5 * D, notified: true,
        audit: [
            entry("System", "Complaint submitted", 7200),
            entry("System", "Auto-categorized", 7199),
            entry("Admin", "Assigned to Enforcement", 7180),
            entry("Officer", "Vendor relocated. Resolved.", 6000),
            entry("System", "Citizen notified", 5999),
        ],
    },
];
