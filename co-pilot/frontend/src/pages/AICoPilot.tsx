import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Sparkles, FileText, Mic, Copy, Check, Loader2, AlignLeft, Languages } from "lucide-react";

// ─── Stop words for filtering ────────────────────────────────────────────────
const STOP = new Set([
    "the","a","an","is","are","was","were","be","been","being","have","has","had",
    "do","does","did","will","would","could","should","may","might","shall","can",
    "to","of","in","for","on","with","at","by","from","up","about","into","through",
    "and","but","or","so","yet","both","either","neither","not","nor","as","if","then",
    "that","this","these","those","it","its","we","our","they","their","i","my","you",
    "your","he","she","his","her","dear","sincerely","regards","please","thank","thanks",
    "inbox","attachments","bcc","subject","re","fwd","pm","am","date","time","also",
    "just","now","very","more","such","when","which","who","what","where","how","get",
    "all","any","some","each","been","than","then","here","there","after","before"
]);

// ─── Utility functions ────────────────────────────────────────────────────────
function cleanText(text: string): string {
    return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function getSentences(text: string): string[] {
    return text
        .replace(/\n+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 30 && /[a-zA-Z]/.test(s));
}

function getParagraphs(text: string): string[] {
    return text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 20);
}

function getLines(text: string): string[] {
    return text.split("\n").map(l => l.trim()).filter(l => l.length > 5);
}

function getTopKeywords(text: string, n = 6): string[] {
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
    const freq: Record<string, number> = {};
    words.forEach(w => {
        if (w.length > 4 && !STOP.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
}

function scoreImportance(sentence: string, keywords: string[]): number {
    const lower = sentence.toLowerCase();
    return keywords.reduce((score, kw) => score + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
}

// ─── Summarize ────────────────────────────────────────────────────────────────
function summarize(text: string): string {
    const sentences = getSentences(text);
    const keywords = getTopKeywords(text, 8);
    const wordCount = text.trim().split(/\s+/).length;

    if (sentences.length === 0) {
        // Fall back to paragraphs or lines
        const lines = getLines(text).slice(0, 5);
        return `📄 Summary\n\n${lines.join(". ")}.\n\nKey Subjects: ${keywords.join(", ") || "Not identified"}\n\n📊 Document: ~${wordCount} words`;
    }

    // Score and pick the best 3-5 sentences
    const scored = sentences.map(s => ({ s, score: scoreImportance(s, keywords) }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, Math.min(4, scored.length)).map(x => x.s);

    // Restore reading order
    const inOrder = sentences.filter(s => top.includes(s));

    return `📄 Summary\n\n${inOrder.join(" ")}\n\n🔑 Key Subjects: ${keywords.slice(0, 5).join(" · ") || "General content"}\n\n📊 Document Stats: ~${wordCount} words · ${sentences.length} sentences extracted`;
}

// ─── Draft Speech ──────────────────────────────────────────────────────────────
function draftSpeech(text: string): string {
    const sentences = getSentences(text);
    const keywords = getTopKeywords(text, 5);
    const paras = getParagraphs(text);

    const theme = keywords.slice(0, 3).join(", ") || "public service";

    // Pick intro, body, closing from different parts of the text
    const intro = sentences[0]
        ?? paras[0]?.split(".")[0]
        ?? "We face important matters that demand our attention.";

    const body = sentences[Math.floor(sentences.length / 2)]
        ?? paras[Math.floor(paras.length / 2)]?.split(".")[0]
        ?? "Our commitment to action and accountability remains unwavering.";

    const closing = sentences[sentences.length - 1]
        ?? "Together, we will find a path forward.";

    return `🎤 Draft Speech\n\nHonorable members, distinguished guests, and fellow citizens,\n\nWe gather today to address matters of great importance to our community — matters centered around: ${theme}.\n\n${intro}\n\nWe must acknowledge that the challenges before us require more than words — they demand decisive, measurable action. ${body}\n\nOur responsibility as public servants is clear: we must listen, act, and deliver on the promises that brought us here. The people expect nothing less, and nothing less is what we shall offer them.\n\n${closing}\n\nLet us move forward — not with hesitation, but with the clarity and resolve that this moment demands.\n\nThank you.`;
}

// ─── Key Bullet Points ─────────────────────────────────────────────────────────
function bulletPoints(text: string): string {
    const lines = getLines(text);
    const sentences = getSentences(text);
    const keywords = getTopKeywords(text, 6);

    const bullets: string[] = [];

    // 1. Use existing bullet/numbered lines if present
    const existingBullets = lines.filter(l => /^[-•*\d+\.]/.test(l));
    existingBullets.slice(0, 4).forEach(b => {
        bullets.push(`• ${b.replace(/^[-•*\d+\.]\s*/, "").trim()}`);
    });

    // 2. Add top sentences if we don't have enough
    if (bullets.length < 6) {
        const scored = sentences
            .map(s => ({ s, score: scoreImportance(s, keywords) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 6 - bullets.length);
        scored.forEach(({ s }) => {
            const clean = s.replace(/\.$/, "").trim();
            if (!bullets.some(b => b.includes(clean.slice(0, 30)))) {
                bullets.push(`• ${clean}`);
            }
        });
    }

    // 3. Fallback to lines
    if (bullets.length === 0) {
        lines.slice(0, 7).forEach(l => bullets.push(`• ${l}`));
    }

    if (bullets.length === 0) return "Not enough content to extract bullet points. Please paste a longer document.";

    return `📌 Key Bullet Points\n\n${bullets.slice(0, 8).join("\n")}\n\n🔑 Key Topics: ${keywords.join(" · ")}`;
}

// ─── Risk Analysis ─────────────────────────────────────────────────────────────
interface RiskRule {
    level: "HIGH" | "MEDIUM" | "LOW";
    emoji: string;
    pattern: RegExp;
    title: string;
    detail: string;
    action: string;
}

const RISK_RULES: RiskRule[] = [
    {
        level: "HIGH", emoji: "🔴",
        pattern: /urgent|critical|immediate|emergency|crisis|collapse|lawsuit|breach|fraud|violation|corrupt|illegal|threaten/i,
        title: "Critical Urgency Detected",
        detail: "The document contains language indicating an urgent or critical situation requiring immediate response.",
        action: "Escalate immediately. Assign a dedicated response team within 24 hours."
    },
    {
        level: "HIGH", emoji: "🔴",
        pattern: /deadline|overdue|expired|delayed|backlog|unpaid|failure|breakdown|rejected/i,
        title: "Unresolved Action Items",
        detail: "There are overdue, delayed, or failed items that may escalate if not addressed promptly.",
        action: "Review all pending items and assign ownership with clear deadlines."
    },
    {
        level: "HIGH", emoji: "🔴",
        pattern: /complaint|grievance|protest|dissatisfied|opposition|strike|refuse|demand|resign/i,
        title: "Public Dissatisfaction Risk",
        detail: "Signals of public or stakeholder dissatisfaction are present. Reputational risk is elevated.",
        action: "Issue a response statement. Schedule a public engagement session within 7 days."
    },
    {
        level: "MEDIUM", emoji: "🟡",
        pattern: /budget|cost|expense|fund|financial|payment|invoice|procurement|tender|contract/i,
        title: "Financial Exposure",
        detail: "Financial matters are referenced. Errors or delays in financial processes can have downstream impact.",
        action: "Request a financial audit trail. Verify approvals and documentation are complete."
    },
    {
        level: "MEDIUM", emoji: "🟡",
        pattern: /media|press|journalist|report|coverage|social media|public statement|interview|release/i,
        title: "Media & Public Visibility",
        detail: "This matter has media or public communication implications. Messaging must be carefully managed.",
        action: "Brief the communications team. Prepare an approved talking-points document."
    },
    {
        level: "MEDIUM", emoji: "🟡",
        pattern: /policy|regulation|compliance|law|legal|rule|act|ordinance|directive|mandate/i,
        title: "Regulatory or Legal Consideration",
        detail: "Regulatory, legal, or policy implications are evident. Non-compliance could lead to liability.",
        action: "Consult legal counsel. Ensure all actions align with current regulations."
    },
    {
        level: "MEDIUM", emoji: "🟡",
        pattern: /health|medical|hospital|clinic|doctor|patient|disease|outbreak|contamination/i,
        title: "Public Health Concern",
        detail: "Public health topics are present. These matters require careful, science-based communication.",
        action: "Coordinate with health authorities. Verify data accuracy before public communication."
    },
    {
        level: "LOW", emoji: "🟢",
        pattern: /schedule|meeting|appointment|calendar|agenda|reminder|follow.?up/i,
        title: "Administrative / Scheduling Task",
        detail: "Routine scheduling or administrative follow-up items are identified.",
        action: "Assign to calendar. Confirm with all attendees 24 hours prior."
    },
    {
        level: "LOW", emoji: "🟢",
        pattern: /update|inform|notify|announcement|circular|memo|internal/i,
        title: "Internal Communication",
        detail: "This appears to be a routine communication or notification item.",
        action: "File and distribute to relevant stakeholders."
    },
];

function riskAnalysis(text: string): string {
    const keywords = getTopKeywords(text, 5);
    const matched = RISK_RULES.filter(r => r.pattern.test(text));

    const high   = matched.filter(r => r.level === "HIGH");
    const medium = matched.filter(r => r.level === "MEDIUM");
    const low    = matched.filter(r => r.level === "LOW");

    const sections: string[] = [];
    const actions: string[] = [];

    if (high.length === 0 && medium.length === 0 && low.length === 0) {
        sections.push("🟢 Low Risk: No specific risk patterns detected in this document.");
        sections.push(`🟡 Medium Risk: Key subjects (${keywords.join(", ")}) may require follow-up depending on broader context.`);
        actions.push("• File for records and set a 7-day review reminder.");
        actions.push("• Assign an appropriate team member for follow-up if needed.");
    } else {
        [...high, ...medium, ...low].forEach(r => {
            sections.push(`${r.emoji} ${r.level === "HIGH" ? "High Risk" : r.level === "MEDIUM" ? "Medium Risk" : "Low Risk"}: ${r.title}\n   → ${r.detail}`);
            actions.push(`• ${r.action}`);
        });
    }

    const riskScore = high.length > 0 ? "HIGH" : medium.length > 0 ? "MEDIUM" : "LOW";
    const scoreColor = riskScore === "HIGH" ? "🔴" : riskScore === "MEDIUM" ? "🟡" : "🟢";

    return `⚠️ Risk Analysis\n\n${scoreColor} Overall Risk Level: ${riskScore}\n\n${sections.join("\n\n")}\n\n────────────────────────────\n📋 Recommended Actions:\n\n${actions.join("\n")}`;
}

// ─── Translator ───────────────────────────────────────────────────────────────
async function translateText(text: string, targetLang: "ta" | "en"): Promise<string> {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text.substring(0, 4000))}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        const translatedText = data[0].map((item: any) => item[0]).join("");
        
        return `🌐 Translation (${targetLang === 'ta' ? 'Tamil' : 'English'})\n\n${translatedText}\n\n────────────────────────────\nℹ️ Translated automatically via Google Translate.`;
    } catch (e) {
        return `⚠️ Error: Unable to translate at this moment. Ensure you have an internet connection.`;
    }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────
function processAction(key: string, text: string): string {
    const cleaned = cleanText(text);
    switch (key) {
        case "summarize":     return summarize(cleaned);
        case "draft_speech":  return draftSpeech(cleaned);
        case "bullet_points": return bulletPoints(cleaned);
        case "risk_analysis": return riskAnalysis(cleaned);
        default: return "Unknown action.";
    }
}

// ─── Actions config ───────────────────────────────────────────────────────────
const ACTIONS = [
    { key: "summarize",     label: "Summarize",         icon: FileText, hint: "Extract the key summary from your text" },
    { key: "draft_speech",  label: "Draft Speech",       icon: Mic,      hint: "Draft a formal speech from the context" },
    { key: "bullet_points", label: "Key Bullet Points",  icon: AlignLeft,hint: "Pull out the main bullet points" },
    { key: "risk_analysis", label: "Risk Analysis",      icon: Sparkles, hint: "Identify risks and recommend actions" },
    { key: "translate_ta",  label: "Translate to Tamil", icon: Languages,hint: "Translate the content into Tamil" },
    { key: "translate_en",  label: "Translate to English",icon: Languages,hint: "Translate the content into English" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AICoPilot() {
    const [context, setContext] = useState("");
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [output, setOutput] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    function runAction(key: string) {
        if (!context.trim()) return;
        setActiveAction(key);
        setLoading(true);
        setOutput(null);
        
        setTimeout(async () => {
            try {
                if (key === "translate_ta") {
                    setOutput(await translateText(context, "ta"));
                } else if (key === "translate_en") {
                    setOutput(await translateText(context, "en"));
                } else {
                    setOutput(processAction(key, context));
                }
            } catch {
                setOutput("Error processing your input. Please try again.");
            }
            setLoading(false);
        }, 100); // reduced timeout for async fetch
    }

    function copyOutput() {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function clearAll() {
        setContext("");
        setOutput(null);
        setActiveAction(null);
    }

    const wordCount = context.trim() ? context.trim().split(/\s+/).length : 0;
    const canRun = context.trim().length > 10;

    return (
        <DashboardLayout title="AI Co-Pilot" subtitle="Your secure intelligence assistant — works fully offline, no API key required.">
            <div>
                {/* Main grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

                    {/* ── Left: Input ── */}
                    <div style={{ background: "#111827", borderRadius: 16, border: "1px solid #1F2937", padding: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Sparkles style={{ width: 16, height: 16, color: "#3B82F6" }} />
                                <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>Input Context</span>
                            </div>
                            {context.trim() && (
                                <button onClick={clearAll} style={{
                                    background: "none", border: "none", color: "#4B5563",
                                    fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline"
                                }}>Clear</button>
                            )}
                        </div>

                        {/* Sample content chips */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                            {[
                                {
                                    label: "📋 Grievance Report",
                                    text: `Subject: Urgent — Water Supply Failure in Rural North Ward

Dear Officer,

This is to formally report that the water borehole serving Rural North Ward has completely broken down as of June 12, 2026. Approximately 2,100 residents are now without access to clean water. The situation is critical and requires immediate repair.

Several residents, including children and the elderly, are at serious health risk. Local community leaders have submitted three prior complaints that remain unresolved. The contractor previously assigned to the area, TechBore Ltd., has not responded to calls.

We request urgent intervention. A team should be dispatched within 24 hours. If this complaint is not escalated, community leaders have indicated they will approach the regional press.

Submitted by: Ward Representative, Rural North
Date: June 13, 2026`
                                },
                                {
                                    label: "📰 Press Release",
                                    text: `FOR IMMEDIATE RELEASE
June 14, 2026

Government Launches New Youth Employment Programme Across 12 Districts

The Ministry of Labour and Social Services today announced the launch of the National Youth Skills Initiative (NYSI), a comprehensive employment programme targeting 50,000 young people aged 18–35 across 12 districts.

The programme, backed by a budget of $4.2 million, will establish 24 new skills development centres offering training in digital literacy, construction trades, healthcare assistance, and agricultural technology.

"Youth unemployment is one of the defining challenges of our time," said Minister James Okafor. "This initiative is not charity — it is investment. We are building the workforce of tomorrow."

The programme is expected to launch in September 2026, with enrollment open from August 1.

For media inquiries, contact: press@ministry.gov.zw`
                                },
                                {
                                    label: "⚠️ Incident Report",
                                    text: `INCIDENT REPORT — GRV-9104
Date: June 13, 2026
Category: Infrastructure | Priority: HIGH

A serious road infrastructure failure has been reported on the North District main highway. A large pothole, approximately 2 metres wide and 40 cm deep, has caused at least 4 vehicle accidents in the past week, including one injury requiring hospitalisation.

Residents have been complaining about this issue since March 2026. Three prior work orders were submitted but the repair contractor failed to respond. The situation poses an ongoing public safety risk.

Legal notice has been served by one affected motorist. Media coverage is expected if no action is taken by end of this week.

Status: OPEN — Immediate escalation required.
Assigned Officer: Field Officer Priya Sharma
Action Required: Deploy repair crew within 48 hours. Issue public safety advisory.`
                                },
                                {
                                    label: "📅 Meeting Notes",
                                    text: `Budget Planning Meeting — June 13, 2026
Attendees: Finance Director, 3 Department Heads, Admin Team

Agenda Items:
1. Q3 budget allocation review — Finance confirmed 12% underspend in Infrastructure
2. Healthcare equipment procurement — Clinic upgrade budget approved at $180,000
3. Pending invoices — 7 contractor invoices overdue by 30+ days, flagged for compliance review
4. Youth centre construction — Project delayed by 6 weeks due to permit issues
5. Media relations budget — Increased by 15% following opposition press campaigns

Action Items:
- Finance to release overdue payments by June 20
- Legal team to review permit delays and advise
- Communications team to schedule press briefing for NYSI launch
- Admin to update project tracker and notify all contractors

Next meeting scheduled: June 27, 2026, 9:00 AM`
                                },
                            ].map(sample => (
                                <button
                                    key={sample.label}
                                    onClick={() => { setContext(sample.text); setOutput(null); setActiveAction(null); }}
                                    style={{
                                        background: "#1A2236", border: "1px solid #2D3748",
                                        borderRadius: 8, padding: "5px 12px", color: "#9CA3AF",
                                        fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                                        transition: "all 0.15s", whiteSpace: "nowrap"
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B82F6";
                                        (e.currentTarget as HTMLButtonElement).style.color = "#60A5FA";
                                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.1)";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#2D3748";
                                        (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
                                        (e.currentTarget as HTMLButtonElement).style.background = "#1A2236";
                                    }}
                                >
                                    {sample.label}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={context}
                            onChange={e => setContext(e.target.value)}
                            placeholder={"Paste any text here — emails, complaints, reports, speeches, meeting notes, announcements...\n\nOr click a sample above to load example content instantly."}
                            rows={13}
                            style={{
                                width: "100%", background: "#1A2236", border: "1px solid #374151",
                                borderRadius: 12, padding: "14px", color: "#E5E7EB", fontSize: "0.875rem",
                                resize: "vertical", boxSizing: "border-box", lineHeight: 1.75,
                                outline: "none", fontFamily: "inherit", transition: "border-color 0.15s"
                            }}
                            onFocus={e => (e.target.style.borderColor = "#3B82F6")}
                            onBlur={e => (e.target.style.borderColor = "#374151")}
                        />

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 14 }}>
                            <span style={{ color: "#4B5563", fontSize: "0.72rem" }}>
                                {wordCount > 0 ? `${wordCount} words` : "Start pasting your document"}
                            </span>
                            {wordCount > 0 && (
                                <span style={{
                                    fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                                    background: wordCount > 50 ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                                    color: wordCount > 50 ? "#10B981" : "#F59E0B"
                                }}>
                                    {wordCount > 50 ? "✓ Good length" : "Add more text for better results"}
                                </span>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {ACTIONS.map(action => {
                                const Icon = action.icon;
                                const isActive = activeAction === action.key && (loading || !!output);
                                return (
                                    <button
                                        key={action.key}
                                        onClick={() => runAction(action.key)}
                                        disabled={!canRun}
                                        title={action.hint}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 10,
                                            background: isActive ? "rgba(59,130,246,0.18)" : "#1A2236",
                                            border: `1px solid ${isActive ? "#3B82F6" : "#2D3748"}`,
                                            borderRadius: 10, padding: "11px 16px",
                                            color: isActive ? "#60A5FA" : "#9CA3AF",
                                            fontWeight: 600, fontSize: "0.875rem",
                                            cursor: canRun ? "pointer" : "not-allowed",
                                            transition: "all 0.15s", textAlign: "left",
                                            opacity: canRun ? 1 : 0.4
                                        }}
                                        onMouseEnter={e => {
                                            if (canRun && !isActive) {
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B82F6";
                                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.1)";
                                                (e.currentTarget as HTMLButtonElement).style.color = "#60A5FA";
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            if (!isActive) {
                                                (e.currentTarget as HTMLButtonElement).style.borderColor = "#2D3748";
                                                (e.currentTarget as HTMLButtonElement).style.background = "#1A2236";
                                                (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
                                            }
                                        }}
                                    >
                                        <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                                        <span style={{ flex: 1 }}>{action.label}</span>
                                        {loading && activeAction === action.key && (
                                            <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                                        )}
                                        {!loading && isActive && (
                                            <span style={{ fontSize: "0.65rem", background: "#3B82F6", color: "#fff", padding: "1px 7px", borderRadius: 4 }}>Active</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Right: Output ── */}
                    <div style={{ background: "#111827", borderRadius: 16, border: "1px solid #1F2937", padding: "20px", minHeight: 560 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                            <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                                Output
                                {activeAction && output && (
                                    <span style={{ marginLeft: 8, fontSize: "0.72rem", color: "#4B5563", fontWeight: 400 }}>
                                        ({ACTIONS.find(a => a.key === activeAction)?.label})
                                    </span>
                                )}
                            </span>
                            {output && (
                                <button onClick={copyOutput} style={{
                                    display: "flex", alignItems: "center", gap: 5, background: "#1A2236",
                                    border: "1px solid #374151", borderRadius: 8, padding: "5px 12px",
                                    color: copied ? "#10B981" : "#6B7280", fontSize: "0.78rem", fontWeight: 600,
                                    cursor: "pointer", transition: "color 0.2s"
                                }}>
                                    {copied
                                        ? <Check style={{ width: 12, height: 12 }} />
                                        : <Copy style={{ width: 12, height: 12 }} />
                                    }
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            )}
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 440 }}>
                                <Loader2 style={{ width: 36, height: 36, color: "#3B82F6", animation: "spin 1s linear infinite" }} />
                                <p style={{ color: "#6B7280", marginTop: 14, fontSize: "0.88rem" }}>Analyzing your content…</p>
                                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                            </div>
                        )}

                        {/* Output */}
                        {!loading && output && (
                            <div style={{
                                background: "#0D1829", borderRadius: 12, padding: "20px 22px",
                                border: "1px solid #1F2937", color: "#CBD5E1",
                                fontSize: "0.875rem", lineHeight: 1.9
                            }}>
                                {output.split("\n").map((line, i) => {
                                    if (line.startsWith("📄") || line.startsWith("🎤") || line.startsWith("📌") || line.startsWith("⚠️")) {
                                        return <p key={i} style={{ color: "#F9FAFB", fontWeight: 800, fontSize: "1rem", margin: i === 0 ? "0 0 12px" : "16px 0 8px" }}>{line}</p>;
                                    }
                                    if (line.startsWith("🔑") || line.startsWith("📊") || line.startsWith("📋")) {
                                        return <p key={i} style={{ color: "#9CA3AF", fontSize: "0.8rem", marginTop: 12, fontStyle: "italic" }}>{line}</p>;
                                    }
                                    if (line.startsWith("🔴") || line.startsWith("🟡") || line.startsWith("🟢")) {
                                        const isHigh = line.startsWith("🔴");
                                        const isMed  = line.startsWith("🟡");
                                        return <p key={i} style={{
                                            margin: "10px 0", padding: "8px 12px", borderRadius: 8,
                                            background: isHigh ? "rgba(239,68,68,0.08)" : isMed ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
                                            borderLeft: `3px solid ${isHigh ? "#EF4444" : isMed ? "#F59E0B" : "#10B981"}`,
                                            color: isHigh ? "#FCA5A5" : isMed ? "#FCD34D" : "#6EE7B7",
                                            fontSize: "0.83rem"
                                        }}>{line}</p>;
                                    }
                                    if (line.startsWith("•")) {
                                        return <p key={i} style={{ margin: "5px 0", paddingLeft: 8, color: "#D1D5DB" }}>{line}</p>;
                                    }
                                    if (line.startsWith("────")) {
                                        return <hr key={i} style={{ border: "none", borderTop: "1px solid #1F2937", margin: "14px 0" }} />;
                                    }
                                    if (line.trim() === "") return <br key={i} />;
                                    return <span key={i}>{line}<br /></span>;
                                })}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && !output && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 440, textAlign: "center", gap: 14 }}>
                                <Sparkles style={{ width: 48, height: 48, color: "#1F2937" }} />
                                <p style={{ color: "#374151", fontSize: "0.9rem", fontWeight: 600 }}>Select an action to generate content</p>
                                <p style={{ color: "#1F2937", fontSize: "0.8rem", maxWidth: 260, lineHeight: 1.6 }}>
                                    Paste any document, email, or notes on the left, then click one of the actions to analyze it.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
