import { DashboardLayout } from "@/components/DashboardLayout";
import {
    BookOpen, GraduationCap, Search, Sparkles, Star, History,
    FileText, ArrowRight, PlayCircle, Bookmark, AlertCircle,
    Network, X, MapPin, Droplets, Zap, Trash2,
    Trees, Scale, ShieldCheck, Building2, Users, BarChart2,
    CheckCircle2, XCircle, ChevronRight, Trophy, Brain,
    RefreshCw, Lightbulb, RotateCcw
} from "lucide-react";
import { useState } from "react";

/* ─── Quiz Questions per topic ───────────────────────────────────────── */
const TOPIC_QUIZZES: Record<number, {
    question: string;
    options: string[];
    correct: number;
    hint: string;
    explanation: string;
}[]> = {
    1: [
        { question: "What document officially defines Ward 12's boundaries?", options: ["Municipal Corporation Act", "Town Planning Scheme", "District Boundary Gazette", "Revenue Settlement Map"], correct: 2, hint: "Think official government publication.", explanation: "The District Boundary Gazette is the official document notifying ward boundaries." },
        { question: "Which body is responsible for maintaining Ward 12 boundary maps?", options: ["Collector Office", "Ward Office", "Revenue Department", "Municipality"], correct: 3, hint: "It's the local civic body.", explanation: "The Municipality maintains and updates ward boundary maps through its surveying wing." },
        { question: "Population census data for Ward 12 is updated every:", options: ["5 years", "10 years", "15 years", "2 years"], correct: 1, hint: "Standard national census cycle.", explanation: "India conducts its national census every 10 years; ward population data is derived from this." },
    ],
    4: [
        { question: "The Water Act 2024 mandates potable water supply of at least:", options: ["70 LPCD", "135 LPCD", "100 LPCD", "200 LPCD"], correct: 1, hint: "LPCD = litres per capita per day.", explanation: "The standard norm under CPHEEO and Water Act 2024 is 135 LPCD for urban areas." },
        { question: "Under Water Act 2024, the maximum permissible turbidity of drinking water is:", options: ["5 NTU", "1 NTU", "10 NTU", "15 NTU"], correct: 0, hint: "NTU = Nephelometric Turbidity Units.", explanation: "BIS standards (IS 10500) set the acceptable limit at 5 NTU for drinking water." },
        { question: "Who is the nodal authority for resolving water supply grievances under the Act?", options: ["District Collector", "Municipality Commissioner", "Water Supply Engineer", "Chief Minister Office"], correct: 2, hint: "Think technical authority.", explanation: "The Water Supply Engineer is designated the nodal officer for complaint resolution under the Act." },
    ],
    5: [
        { question: "What is the standard SLA for resolving water leakage complaints?", options: ["24 hours", "48 hours", "72 hours", "7 days"], correct: 1, hint: "Standard municipal SLA for minor repairs.", explanation: "Most municipalities set a 48-hour SLA for water leakage repair — escalation begins if unresolved." },
        { question: "First step when a water leakage complaint is received:", options: ["Assign to plumber", "Register complaint and generate ID", "Call the citizen back", "Order repair materials"], correct: 1, hint: "Without documentation, the complaint doesn't exist officially.", explanation: "All complaints must first be registered with a unique Complaint ID for tracking and accountability." },
        { question: "Water supply shortage complaints are escalated after:", options: ["24 hrs", "48 hrs", "6 hrs", "1 week"], correct: 0, hint: "Shortage affects basic needs — urgent.", explanation: "Supply shortage is classified as priority — escalation happens after 24 hrs if unresolved." },
    ],
    7: [
        { question: "SLA for streetlight restoration after a complaint is:", options: ["12 hours", "24 hours", "48 hours", "72 hours"], correct: 1, hint: "Safety-critical, needs quick fix.", explanation: "Streetlight outages are safety-critical; the SLA is 24 hours with escalation to EB thereafter." },
        { question: "Who is responsible for streetlight maintenance in a ward?", options: ["PWD", "Electricity Board", "Ward Officer", "Private Contractor"], correct: 2, hint: "Ward-level governance.", explanation: "The Ward Officer coordinates streetlight maintenance, even if the electrical work is outsourced to EB." },
        { question: "Power outage affecting more than 100 households is classified as:", options: ["Minor", "Major", "Priority-1 Emergency", "Routine"], correct: 2, hint: "Population scale matters in SLA classification.", explanation: "Incidents affecting >100 households are declared Priority-1 Emergency needing immediate escalation." },
    ],
    8: [
        { question: "Who initiates a road repair request in the field?", options: ["Citizen", "Ward Officer", "PWD Engineer", "All of the above"], correct: 3, hint: "Multiple stakeholders can flag road damage.", explanation: "Road repair can be initiated by citizens, ward officers, or PWD engineers observing the defect." },
        { question: "Pothole depth requiring emergency repair is:", options: ["5 cm", "10 cm", "15 cm", "2 cm"], correct: 0, hint: "Even shallow potholes can cause accidents.", explanation: "Standard protocol mandates emergency repair for potholes deeper than 5 cm on major roads." },
        { question: "SLA for road repair after complaint registration:", options: ["24 hours", "7 days", "30 days", "3 days"], correct: 1, hint: "Road repair involves material sourcing.", explanation: "Standard municipal SLA is 7 working days, with daily escalation alerts if not resolved." },
    ],
    9: [
        { question: "How often should municipal garbage be collected in residential areas?", options: ["Daily", "Every 2 days", "Twice weekly", "Weekly"], correct: 0, hint: "Hygiene requires frequency.", explanation: "Residential areas require daily garbage collection per municipal health rules." },
        { question: "Open defecation is addressed under:", options: ["Water Act", "Sanitation and OD-Free Mission", "Swachh Bharat Abhiyan", "Environmental Act"], correct: 2, hint: "National cleanliness campaign.", explanation: "Swachh Bharat Abhiyan (SBA) is the national mission targeting ODF status." },
        { question: "Waste collection complaint SLA is:", options: ["12 hours", "24 hours", "48 hours", "72 hours"], correct: 1, hint: "Health hazard, needs quick action.", explanation: "Waste accumulation is a health hazard; SLA is 24 hours from complaint registration." },
    ],
    11: [
        { question: "In a municipal budget, the largest share typically goes to:", options: ["Administration", "Roads & Infrastructure", "Water Supply", "Sanitation"], correct: 1, hint: "Physical infrastructure is the biggest cost.", explanation: "Roads & Infrastructure typically consume 30–40% of municipal budgets due to material and labor costs." },
        { question: "Which committee approves the annual municipal budget?", options: ["State Government", "General Council", "Finance Ministry", "Commissioner's Office"], correct: 1, hint: "Elected body has financial authority.", explanation: "The General Council (elected councillors) is the approving authority for the annual municipality budget." },
        { question: "How are budget allocations tracked during implementation?", options: ["Annual audit only", "Monthly expenditure statements", "Quarterly reports to High Court", "No formal tracking"], correct: 1, hint: "Regular tracking ensures accountability.", explanation: "Monthly expenditure statements are submitted to the Finance Department for budget tracking." },
    ],
    13: [
        { question: "The lowest unit of local governance in India is:", options: ["District", "Taluk", "Ward", "Village Panchayat"], correct: 2, hint: "Urban local body's smallest unit.", explanation: "Within Urban Local Bodies (ULBs), the Ward is the smallest administrative and governance unit." },
        { question: "73rd Constitutional Amendment strengthened:", options: ["Urban bodies", "Rural Panchayats", "State governments", "Central government"], correct: 1, hint: "Rural governance empowerment.", explanation: "The 73rd Amendment established Panchayati Raj Institutions (PRIs) and empowered rural local governments." },
        { question: "74th Constitutional Amendment is related to:", options: ["Panchayats", "Urban Local Bodies", "Forest Rights", "Land Acquisition"], correct: 1, hint: "Urban counterpart to the 73rd.", explanation: "The 74th Amendment established Municipalities and Nagar Panchayats as the 3rd tier of urban governance." },
    ],
};

// Generic quiz for topics without specific questions
const GENERIC_QUIZ = [
    { question: "Which principle underlies effective local governance?", options: ["Centralization", "Subsidiarity", "Privatization", "Bureaucratization"], correct: 1, hint: "Decisions made at the lowest competent level.", explanation: "Subsidiarity means governance should be handled by the smallest, most local competent authority." },
    { question: "A complaint not resolved within its SLA should be:", options: ["Ignored", "Escalated to next level", "Closed automatically", "Reopened by citizen"], correct: 1, hint: "SLA breach must trigger action.", explanation: "Unresolved complaints beyond their SLA must be escalated to the next administrative level." },
    { question: "Citizen grievance redressal is a right under:", options: ["RTI Act 2005", "Citizen Charter", "Both", "Neither"], correct: 2, hint: "Multiple instruments protect this right.", explanation: "Both the RTI Act 2005 and the Citizen Charter guarantee the right to grievance redressal." },
];

/* ─── Topic Library ─────────────────────────────────────────────── */
const ALL_TOPICS = [
    { id: 1,  title: "Ward 12 – Boundaries & Map",              category: "Ward Info",   icon: MapPin,       color: "text-blue-600",    bg: "bg-blue-50",    tags: "ward 12 boundary map location",           desc: "Official boundary details, key zones, and population data for Ward 12." },
    { id: 2,  title: "Ward 03 – Resource Usage Plan",           category: "Ward Info",   icon: MapPin,       color: "text-blue-600",    bg: "bg-blue-50",    tags: "ward 03 resource plan allocation",         desc: "How water, electricity, and roads are allocated in Ward 03." },
    { id: 3,  title: "Ward Office – Roles & Responsibilities",  category: "Ward Info",   icon: Building2,    color: "text-blue-600",    bg: "bg-blue-50",    tags: "ward office responsibility duties officer",  desc: "Roles and duties of ward-level officers and councillors." },
    { id: 4,  title: "Water Act 2024 – Key Provisions",         category: "Policy",      icon: Droplets,     color: "text-cyan-600",    bg: "bg-cyan-50",    tags: "water act 2024 law policy supply",          desc: "Summary of the Water Act 2024 covering supply, quality, and conservation." },
    { id: 5,  title: "Water Supply – Complaint Handling",       category: "Operations",  icon: Droplets,     color: "text-cyan-600",    bg: "bg-cyan-50",    tags: "water supply complaint leakage pipeline",   desc: "Step-by-step guide for handling water leakage and shortage complaints." },
    { id: 6,  title: "Water Conservation Guidelines",           category: "Policy",      icon: Droplets,     color: "text-cyan-600",    bg: "bg-cyan-50",    tags: "water conservation save environment",       desc: "Municipal guidelines for water conservation across all areas." },
    { id: 7,  title: "Electricity SLA Requirements",            category: "Policy",      icon: Zap,          color: "text-yellow-600",  bg: "bg-yellow-50",  tags: "electricity sla streetlight light power",   desc: "SLA timelines for electricity restoration and streetlight maintenance." },
    { id: 8,  title: "Road Repair & Maintenance Protocol",      category: "Operations",  icon: Building2,    color: "text-orange-600",  bg: "bg-orange-50",  tags: "road pothole repair pavement maintenance",  desc: "Procedures for reporting, assessing, and repairing road damage." },
    { id: 9,  title: "Sanitation & Waste Collection Rules",     category: "Operations",  icon: Trash2,       color: "text-emerald-600", bg: "bg-emerald-50", tags: "sanitation garbage waste collection toilet", desc: "Schedule, routes, and standards for waste collection management." },
    { id: 10, title: "Parks & Public Space Maintenance",        category: "Operations",  icon: Trees,        color: "text-green-600",   bg: "bg-green-50",   tags: "parks playground public maintenance green",  desc: "Guidelines for maintaining parks, playgrounds, and public spaces." },
    { id: 11, title: "Budget Allocation Plan – FY 2025-26",    category: "Finance",     icon: BarChart2,    color: "text-purple-600",  bg: "bg-purple-50",  tags: "budget allocation finance fund plan",        desc: "Annual budget breakdown across departments: roads, water, sanitation." },
    { id: 12, title: "Expenditure Tracking & Reporting",       category: "Finance",     icon: BarChart2,    color: "text-purple-600",  bg: "bg-purple-50",  tags: "budget expenditure tracking report",        desc: "How to track and audit departmental spending against the budget." },
    { id: 13, title: "Governance – Org Structure Basics",      category: "Governance",  icon: BookOpen,     color: "text-red-700",     bg: "bg-red-50",     tags: "governance organisation structure basics",   desc: "Overview of local governance hierarchy from ward to district level." },
    { id: 14, title: "Citizen Rights & Grievance Policy",      category: "Policy",      icon: Users,        color: "text-red-700",     bg: "bg-red-50",     tags: "citizen rights grievance complaint policy",  desc: "What citizens are entitled to and how complaints must be handled." },
    { id: 15, title: "SLA Requirements – All Departments",     category: "Policy",      icon: ShieldCheck,  color: "text-red-700",     bg: "bg-red-50",     tags: "sla requirements service level all dept",   desc: "Full SLA terms: timelines, escalation paths, and penalties." },
    { id: 16, title: "Legal Enforcement & Noise Violations",   category: "Legal",       icon: Scale,        color: "text-gray-700",    bg: "bg-gray-50",    tags: "enforcement noise construction legal violation", desc: "Rules on noise violations, illegal encroachments, enforcement." },
    { id: 17, title: "Crisis Management Protocols",            category: "Operations",  icon: AlertCircle,  color: "text-rose-600",    bg: "bg-rose-50",    tags: "crisis management emergency protocol disaster", desc: "Step-by-step protocols for managing civic emergencies." },
    { id: 18, title: "Digital Governance Grid – Overview",     category: "Technology",  icon: Network,      color: "text-violet-600",  bg: "bg-violet-50",  tags: "digital governance grid tech ai overview",  desc: "How digital tools and AI are used in local governance." },
    { id: 19, title: "Policy Deep-Dive: Municipal Laws",       category: "Policy",      icon: FileText,     color: "text-gray-700",    bg: "bg-gray-50",    tags: "policy municipal law deep handbook",        desc: "In-depth reference for current municipal laws and their applications." },
    { id: 20, title: "Citizen Interaction – Best Practices",   category: "Training",    icon: GraduationCap,color: "text-teal-600",    bg: "bg-teal-50",    tags: "citizen interaction communication best practice", desc: "How to communicate effectively with citizens during complaint resolution." },
    { id: 21, title: "Drainage & Flooding Management",         category: "Operations",  icon: Droplets,     color: "text-sky-600",     bg: "bg-sky-50",     tags: "drainage flood blockage rain waterlogging",  desc: "Procedures for managing drainage blockages and flooding." },
    { id: 22, title: "Ward 12 – Electricity Network Map",      category: "Ward Info",   icon: Zap,          color: "text-yellow-600",  bg: "bg-yellow-50",  tags: "ward 12 electricity network map streetlight", desc: "Electrical grid layout, streetlight positions in Ward 12." },
];

const CATEGORIES = ["All", ...Array.from(new Set(ALL_TOPICS.map(t => t.category)))];

// ── Quiz Modal ───────────────────────────────────────────────────────────────
function QuizModal({ topic, onClose }: { topic: typeof ALL_TOPICS[0]; onClose: (score: number, total: number) => void }) {
    const questions = TOPIC_QUIZZES[topic.id] ?? GENERIC_QUIZ;
    const [qIdx,       setQIdx]       = useState(0);
    const [selected,   setSelected]   = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [showHint,   setShowHint]   = useState(false);
    const [score,      setScore]      = useState(0);
    const [finished,   setFinished]   = useState(false);

    const q = questions[qIdx];
    const isLast = qIdx === questions.length - 1;

    function handleSelect(idx: number) {
        if (selected !== null) return;
        setSelected(idx);
        setShowResult(true);
        if (idx === q.correct) setScore(s => s + 1);
    }

    function handleNext() {
        if (isLast) {
            setFinished(true);
        } else {
            setQIdx(q => q + 1);
            setSelected(null);
            setShowResult(false);
            setShowHint(false);
        }
    }

    const pct = Math.round((score / questions.length) * 100);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose(score, questions.length)} />
            <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

                {/* Header */}
                <div className={`px-6 py-5 flex items-center gap-3 ${topic.bg}`}>
                    <div className={`p-2.5 rounded-2xl bg-white/60 shrink-0`}>
                        <topic.icon className={`w-5 h-5 ${topic.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-[9px] font-black uppercase tracking-widest ${topic.color} opacity-60`}>Practice Quiz</p>
                        <p className="text-sm font-black text-gray-900 truncate">{topic.title}</p>
                    </div>
                    <button onClick={() => onClose(score, questions.length)} className="p-2 rounded-xl hover:bg-white/50 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {!finished ? (
                    <div className="p-6 space-y-5">
                        {/* Progress */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#B91C1C] rounded-full transition-all"
                                    style={{ width: `${((qIdx + 1) / questions.length) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">
                                {qIdx + 1}/{questions.length}
                            </span>
                        </div>

                        {/* Question */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Brain className="w-4 h-4 text-[#B91C1C]" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Question {qIdx + 1}</span>
                            </div>
                            <p className="text-base font-black text-gray-900 leading-snug">{q.question}</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                            {q.options.map((opt, i) => {
                                let cls = "border border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-white";
                                if (showResult) {
                                    if (i === q.correct)   cls = "border-2 border-emerald-400 bg-emerald-50 text-emerald-800";
                                    else if (i === selected) cls = "border-2 border-red-300 bg-red-50 text-red-700";
                                    else                    cls = "border border-gray-100 bg-gray-50 text-gray-400 opacity-60";
                                }
                                return (
                                    <button key={i} onClick={() => handleSelect(i)}
                                        disabled={selected !== null}
                                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left text-sm font-bold transition-all ${cls} ${selected === null ? "cursor-pointer" : "cursor-default"}`}>
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black ${showResult && i === q.correct ? "bg-emerald-500 text-white" : showResult && i === selected ? "bg-red-400 text-white" : "bg-gray-200 text-gray-500"}`}>
                                            {showResult && i === q.correct ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                                             showResult && i === selected  ? <XCircle className="w-3.5 h-3.5" /> :
                                             String.fromCharCode(65 + i)}
                                        </div>
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Hint */}
                        {selected === null && (
                            <button onClick={() => setShowHint(!showHint)}
                                className="flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
                                <Lightbulb className="w-3.5 h-3.5" />
                                {showHint ? "Hide hint" : "Show hint"}
                            </button>
                        )}
                        {showHint && selected === null && (
                            <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl">
                                <p className="text-xs font-bold text-amber-700">💡 {q.hint}</p>
                            </div>
                        )}

                        {/* Explanation after answer */}
                        {showResult && (
                            <div className={`p-4 rounded-2xl border ${selected === q.correct ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selected === q.correct ? "text-emerald-600" : "text-red-600"}`}>
                                    {selected === q.correct ? "✓ Correct!" : "✗ Not quite"}
                                </p>
                                <p className={`text-xs font-medium leading-relaxed ${selected === q.correct ? "text-emerald-800" : "text-red-800"}`}>{q.explanation}</p>
                            </div>
                        )}

                        {/* Next button */}
                        {showResult && (
                            <button onClick={handleNext}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#B91C1C] hover:bg-red-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 active:scale-95">
                                {isLast ? <><Trophy className="w-4 h-4" /> See Results</> : <><ChevronRight className="w-4 h-4" /> Next Question</>}
                            </button>
                        )}
                    </div>
                ) : (
                    /* Results screen */
                    <div className="p-8 text-center space-y-6">
                        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-black border-4 ${pct >= 70 ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-amber-400 bg-amber-50 text-amber-700"}`}>
                            {pct}%
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">{pct >= 70 ? "🎉 Well Done!" : "Keep Practising!"}</h3>
                            <p className="text-sm text-gray-500 mt-1">You scored <strong>{score}</strong> out of <strong>{questions.length}</strong> questions</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[{ label: "Correct", val: score, color: "text-emerald-600 bg-emerald-50" },
                              { label: "Wrong",   val: questions.length - score, color: "text-red-600 bg-red-50" },
                              { label: "XP Earned", val: score * 100, color: "text-amber-600 bg-amber-50" }
                            ].map(({ label, val, color }) => (
                                <div key={label} className={`p-3 rounded-2xl ${color}`}>
                                    <p className="text-xl font-black">{val}{label === "XP Earned" ? "" : ""}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setQIdx(0); setSelected(null); setShowResult(false); setShowHint(false); setScore(0); setFinished(false); }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-all">
                                <RotateCcw className="w-4 h-4" /> Retry
                            </button>
                            <button onClick={() => onClose(score, questions.length)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#B91C1C] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-800 transition-all">
                                <ArrowRight className="w-4 h-4" /> Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StudyBuddy() {
    const [search,  setSearch]  = useState("");
    const [category, setCategory] = useState("All");
    const [activeQuiz, setActiveQuiz] = useState<typeof ALL_TOPICS[0] | null>(null);
    const [completedTopics, setCompletedTopics] = useState<Record<number, { score: number; total: number }>>({});
    const [totalXP, setTotalXP] = useState(12840);

    const visible = ALL_TOPICS.filter(t => {
        const q = search.trim().toLowerCase();
        const matchQ = !q || t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.includes(q);
        const matchCat = category === "All" || t.category === category;
        return matchQ && matchCat;
    });

    function handleQuizDone(topicId: number, score: number, total: number) {
        setCompletedTopics(prev => ({ ...prev, [topicId]: { score, total } }));
        setTotalXP(prev => prev + score * 100);
        setActiveQuiz(null);
    }

    const masteredCount = Object.values(completedTopics).filter(r => r.score / r.total >= 0.7).length;

    return (
        <DashboardLayout title="Study Hub" subtitle="Learn, practice, and master governance topics">
            {activeQuiz && (
                <QuizModal
                    topic={activeQuiz}
                    onClose={(score, total) => handleQuizDone(activeQuiz.id, score, total)}
                />
            )}

            <div className="space-y-6 pb-12">

                {/* ── Hero Search Bar ─────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-28 bg-red-400/5 blur-[60px]" />
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-5 border border-red-100">
                        <Sparkles className="w-3 h-3" /> Powered by Gov-Large v4
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Search any Governance Topic</h2>
                    <p className="text-sm text-gray-400 mb-6">Click a topic to read, then press <strong>Start Practice</strong> for an interactive quiz</p>

                    <div className="relative max-w-2xl mx-auto group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#B91C1C] transition-colors" />
                        <input
                            id="topic-search"
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="e.g.  water  ·  ward 12  ·  budget  ·  road  ·  SLA  ·  drainage..."
                            className="w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-medium text-gray-800 focus:outline-none focus:border-red-200 focus:bg-white transition-all placeholder:text-gray-300"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-red-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mt-5">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setCategory(cat)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                    category === cat
                                        ? "bg-[#B91C1C] text-white border-[#B91C1C] shadow"
                                        : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                                }`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Results Count ───────────────────────────────── */}
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm font-black text-gray-700">
                        {search.trim()
                            ? <>{visible.length} topic{visible.length !== 1 ? "s" : ""} matching <span className="text-[#B91C1C]">"{search}"</span></>
                            : <>{visible.length} topics available</>
                        }
                    </p>
                    <div className="flex items-center gap-2">
                        {Object.keys(completedTopics).length > 0 && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                                ✓ {Object.keys(completedTopics).length} practised today
                            </span>
                        )}
                        {search && (
                            <button onClick={() => { setSearch(""); setCategory("All"); }} className="text-xs font-bold text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                                <X className="w-3.5 h-3.5" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Topic Cards Grid ────────────────────────────── */}
                {visible.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center">
                        <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="font-bold text-gray-400">No topics found for "{search}"</p>
                        <p className="text-xs text-gray-300 mt-1">Try: water · ward · budget · road · SLA · drainage · sanitation</p>
                        <button onClick={() => { setSearch(""); setCategory("All"); }} className="mt-4 px-5 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors">
                            Show all topics
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {visible.map(topic => {
                            const done = completedTopics[topic.id];
                            const pct  = done ? Math.round((done.score / done.total) * 100) : null;
                            return (
                                <div key={topic.id}
                                    className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all group flex flex-col gap-4">

                                    {/* Icon + Category + Status */}
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-2xl ${topic.bg} shrink-0`}>
                                            <topic.icon className={`w-5 h-5 ${topic.color}`} />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${topic.bg} ${topic.color}`}>
                                                {topic.category}
                                            </span>
                                            {pct !== null && (
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${pct >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                                    {pct >= 70 ? "✓ Mastered" : `${pct}% — Retry`}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <div className="flex-1">
                                        <h3 className="text-base font-black text-gray-900 mb-1.5 leading-snug">{topic.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">{topic.desc}</p>
                                    </div>

                                    {/* Progress bar if attempted */}
                                    {pct !== null && (
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all ${pct >= 70 ? "bg-emerald-500" : "bg-amber-400"}`}
                                                style={{ width: `${pct}%` }} />
                                        </div>
                                    )}

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => setActiveQuiz(topic)}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all w-full ${
                                            pct !== null
                                                ? "bg-gray-50 text-gray-700 border border-gray-100 hover:bg-[#B91C1C] hover:text-white hover:border-[#B91C1C]"
                                                : "bg-red-50 text-[#B91C1C] hover:bg-[#B91C1C] hover:text-white"
                                        }`}
                                    >
                                        {pct !== null
                                            ? <><RefreshCw className="w-3.5 h-3.5" /> Practise Again</>
                                            : <><PlayCircle className="w-3.5 h-3.5" /> Start Practice</>
                                        }
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Progress / Level ──── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                    <div className="xl:col-span-2 space-y-4">
                        <h3 className="font-black text-gray-900 flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-300" /> Resume Learning
                        </h3>
                        {[
                            { title: "Unit 3: Crisis Management Protocols", progress: 75, last: "Yesterday" },
                            { title: "Policy: Ward 03 Resource Usage",      progress: 40, last: "2 days ago" },
                            { title: "Overview: Digital Governance Grid",   progress: 95, last: "3 days ago" },
                        ].map((u, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center gap-5 group hover:border-gray-200 transition-colors">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                                    <PlayCircle className="w-6 h-6 text-gray-300 group-hover:text-[#B91C1C] transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-black text-gray-800 truncate">{u.title}</p>
                                        <span className="text-[10px] text-gray-400 font-bold ml-3 shrink-0">{u.last}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#B91C1C] rounded-full transition-all" style={{ width: `${u.progress}%` }} />
                                        </div>
                                        <span className="text-xs font-black text-gray-500 shrink-0">{u.progress}%</span>
                                    </div>
                                </div>
                                <button className="shrink-0 px-4 py-2 bg-gray-50 hover:bg-[#B91C1C] hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                    Resume
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#0B1221] rounded-[2rem] p-7 text-white shadow-2xl">
                        <h3 className="font-black mb-5 text-sm">Expertise Level</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full border-4 border-[#B91C1C] flex items-center justify-center shrink-0">
                                <span className="text-lg font-black">L4</span>
                            </div>
                            <div>
                                <p className="font-black text-sm">Senior Analyst</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">Next: Governance Strategist</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 rounded-lg"><Star className="w-4 h-4 text-amber-400" /></div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Total XP</p>
                                    <p className="text-sm font-black">{totalXP.toLocaleString()} XP</p>
                                </div>
                            </div>
                            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                <div className="p-2 bg-cyan-500/20 rounded-lg"><Bookmark className="w-4 h-4 text-cyan-400" /></div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Policies Mastered</p>
                                    <p className="text-sm font-black">{32 + masteredCount} Policies</p>
                                </div>
                            </div>
                            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg"><Trophy className="w-4 h-4 text-emerald-400" /></div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Quizzes Completed</p>
                                    <p className="text-sm font-black">{Object.keys(completedTopics).length} Today</p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3.5 bg-[#B91C1C] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-800 transition-all">
                            Download Certificate
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
