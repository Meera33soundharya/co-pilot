/**
 * AI Document Summarization Service
 * -----------------------------------
 * Generates intelligent Executive Summaries from extracted document text.
 *
 * Pipeline:
 *   1. Receives extracted text from documentTextExtractor
 *   2. Sends ONLY the document content to Gemini API
 *   3. Falls back to a smart local NLP-style summarizer if API is unavailable
 *   4. Returns a structured ExecutiveSummary object
 *
 * Critical Rule: The prompt explicitly instructs the AI to summarize ONLY the
 * document content — never the prompt itself, UI text, or system metadata.
 */

import type { DocumentCategory } from "../context/DocumentContext";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ExecutiveSummary {
  subject: string;
  summary: string;
  highlights: string[];    // 3–6 bullet points
  actions: string[];       // 3–5 recommended actions
  generatedAt: number;     // timestamp
  source: "gemini" | "local-ai";
  confidence: number;      // 0–100
}

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyBimmkZi2w1zCVth4xPrHuqha9zDlRbviY";
const MODEL_NAME = "gemini-1.5-flash";
const PLACEHOLDER_KEY = "AIzaSyBimmkZi2w1zCVth4xPrHuqha9zDlRbviY";

// ─────────────────────────────────────────────────────────────
// Main API
// ─────────────────────────────────────────────────────────────

/**
 * Generate an Executive Summary from extracted document text.
 * @param extractedText  The raw text extracted from the document
 * @param category       The document category (for context)
 * @param metadata       Additional metadata (dept, name, ward, etc.)
 */
export async function generateDocumentSummary(
  extractedText: string,
  category: DocumentCategory,
  metadata: {
    fileName?: string;
    dept?: string;
    ward?: string;
    date?: string;
    status?: string;
    officerName?: string;
    citizenName?: string;
  } = {}
): Promise<ExecutiveSummary> {
  // Validate: must have actual document content to summarize
  // Lowered threshold to 15 to allow partial OCR data to be summarized
  if (!extractedText || extractedText.trim().length < 15) {
    console.warn(`[Document AI] Extracted text too short (${extractedText?.length || 0} chars). Using minimal summary.`);
    return createMinimalSummary(category, metadata);
  }

  // Truncate to prevent token overflow (keep first ~8000 chars)
  const truncatedText = extractedText.slice(0, 8000);

  // Try Gemini API first
  if (GEMINI_API_KEY && GEMINI_API_KEY !== PLACEHOLDER_KEY) {
    try {
      const apiResult = await callGeminiAPI(truncatedText, category, metadata);
      if (apiResult) return apiResult;
    } catch (error) {
      console.warn("[Document AI] Gemini API failed or returned invalid response. Falling back to local AI:", error);
    }
  }

  // Fallback: Smart local summarization
  return localSmartSummarize(truncatedText, category, metadata);
}

// ─────────────────────────────────────────────────────────────
// Gemini API Call
// ─────────────────────────────────────────────────────────────

async function callGeminiAPI(
  text: string,
  category: DocumentCategory,
  metadata: Record<string, string | undefined>
): Promise<ExecutiveSummary | null> {
  const prompt = `You are a government document intelligence system. Analyze ONLY the document content provided below and generate a structured Executive Summary.

CRITICAL RULES:
- Summarize ONLY the document text content below
- NEVER include information from this prompt, system instructions, or UI text
- NEVER fabricate information not present in the document
- Extract real details: names, dates, locations, departments, reference numbers
- Be professional and suitable for government administrative use

Document Category: ${category}
Document Content:
---BEGIN DOCUMENT---
${text}
---END DOCUMENT---

Return a JSON object with exactly this structure:
{
  "subject": "A clear, specific subject line derived from the document content",
  "summary": "A concise 3-5 sentence summary of the actual document content",
  "highlights": ["Point 1 from the document", "Point 2", "Point 3", "Point 4"],
  "actions": ["Recommended action 1 based on document", "Action 2", "Action 3"]
}

The highlights should contain 3-6 specific points extracted from the document.
The actions should contain 3-5 recommended next steps based on the document content.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 800,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    console.error(`[Document AI] Gemini API HTTP error: ${response.status} ${response.statusText}`);
    return null;
  }

  const data = await response.json();
  let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    console.warn("[Document AI] Gemini API returned empty or missing text response.");
    return null;
  }

  // Strip markdown backticks
  if (textResponse.startsWith("```json")) {
    textResponse = textResponse.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (textResponse.startsWith("```")) {
    textResponse = textResponse.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  try {
    const parsed = JSON.parse(textResponse);

    return {
      subject: parsed.subject || "Document Analysis",
      summary: parsed.summary || "",
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 6) : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions.slice(0, 5) : [],
      generatedAt: Date.now(),
      source: "gemini",
      confidence: 92,
    };
  } catch (parseError) {
    console.error("[Document AI] Failed to parse Gemini JSON response:", parseError);
    console.error("[Document AI] Raw response was:", textResponse);
    throw new Error("Invalid JSON response from Gemini API");
  }
}

// ─────────────────────────────────────────────────────────────
// Smart Local Fallback Summarizer
// ─────────────────────────────────────────────────────────────

function localSmartSummarize(
  text: string,
  category: DocumentCategory,
  metadata: Record<string, string | undefined>
): ExecutiveSummary {
  const contentAware = buildContentAwareSummary(text, category, metadata);

  return {
    subject: contentAware.subject,
    summary: contentAware.summary,
    highlights: contentAware.highlights.slice(0, 6),
    actions: contentAware.actions.slice(0, 5),
    generatedAt: Date.now(),
    source: "local-ai",
    confidence: Math.min(95, 60 + Math.floor(text.length / 80)),
  };
}

function buildContentAwareSummary(
  text: string,
  category: DocumentCategory,
  metadata: Record<string, string | undefined>
): { subject: string; summary: string; highlights: string[]; actions: string[] } {
  const normalized = text.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();
  const sentences = splitIntoSentences(text);
  const entities = extractEntitiesFromText(text);
  const subject = generateSubjectFromContent(text, category, entities);
  const documentType = classifyDocumentType(lower, category);

  if (documentType === "technical-requirements") {
    const objectives = extractSectionContent(text, ["system objectives", "objective", "objectives"]);
    const requirements = extractSectionContent(text, ["core functional requirements", "functional requirements", "requirements"]);
    const workflow = extractSectionContent(text, ["automation workflow", "workflow"]);
    const integration = extractSectionContent(text, ["integration requirements", "integration"]);
    const outcome = extractSectionContent(text, ["expected outcome", "outcome"]);

    return {
      subject: subject || "Technical Requirements Document",
      summary: objectives || "This document defines the requirements for a production-ready digital governance module with automation, integration, and intelligent document handling.",
      highlights: [
        requirements || "Core functional requirements are defined for the system.",
        workflow || "Automation workflow steps are outlined for the process.",
        integration || "Integration and synchronization requirements are described.",
        outcome || "Expected operational outcome is stated.",
      ].slice(0, 4),
      actions: [
        "Prioritize implementation of the core requirements first.",
        "Map each workflow step to the relevant downstream module.",
        "Validate integration points and synchronization dependencies.",
        "Review the expected outcome against the delivery plan.",
      ],
    };
  }

  if (documentType === "complaint") {
    const department = entities.departments[0] || metadata.dept || "Relevant Department";
    return {
      subject: subject || "Citizen Complaint",
      summary: `The content describes a citizen issue that requires follow-up by ${department}.`,
      highlights: [
        entities.referenceNumbers[0] ? `Reference: ${entities.referenceNumbers[0]}` : "Complaint reference is present in the document.",
        `Department: ${department}`,
        entities.locations[0] ? `Location: ${entities.locations[0]}` : "Location details are included in the content.",
      ],
      actions: [
        "Assign the case to the relevant field team.",
        "Verify the reported location and severity.",
        "Update the complaint status and notify the citizen.",
      ],
    };
  }

  if (documentType === "resolution-report") {
    return {
      subject: subject || "Resolution Report",
      summary: "The document records the resolution status, actions completed, and evidence of closure for the case or workflow.",
      highlights: [
        "Resolution outcome is described in the document.",
        "Actions taken are captured for review.",
        entities.dates[0] ? `Completion date: ${entities.dates[0]}` : "Resolution timing is referenced.",
      ],
      actions: [
        "Confirm the resolved outcome against the reported issue.",
        "Archive the supporting evidence and final status.",
        "Notify the relevant stakeholder of the closure.",
      ],
    };
  }

  if (documentType === "meeting-minutes") {
    return {
      subject: subject || "Meeting Minutes",
      summary: "The document captures decisions, attendance context, and follow-up commitments from the meeting.",
      highlights: [
        "Proceedings and decisions are summarized in the content.",
        "Action owners or commitments are described.",
        entities.dates[0] ? `Meeting date: ${entities.dates[0]}` : "Meeting timing is noted.",
      ],
      actions: [
        "Share the minutes with the relevant participants.",
        "Track the agreed follow-up actions.",
        "Record the next meeting checkpoint.",
      ],
    };
  }

  if (documentType === "policy") {
    return {
      subject: subject || "Operational Policy",
      summary: "The document outlines policy guidance, implementation expectations, or compliance requirements.",
      highlights: [
        "Policy guidance is present in the document.",
        "Implementation or compliance expectations are described.",
        entities.departments[0] ? `Department focus: ${entities.departments[0]}` : "Departmental applicability is cited in the content.",
      ],
      actions: [
        "Distribute the document to the relevant department heads.",
        "Verify that operational teams follow the new requirements.",
        "Track implementation milestones and update the record.",
      ],
    };
  }

  if (documentType === "analytics-report") {
    return {
      subject: subject || "Analytics Report",
      summary: "The document evaluates patterns, trends, or operational metrics that should inform decision-making.",
      highlights: [
        "Key metrics or trends are presented.",
        "Insights are tied to performance or operational outcomes.",
        entities.dates[0] ? `Analysis period: ${entities.dates[0]}` : "Analysis window is included in the document.",
      ],
      actions: [
        "Review the metrics and identify the top insight.",
        "Translate the findings into an operational action plan.",
        "Share the analysis with the relevant decision-makers.",
      ],
    };
  }

  if (documentType === "speech-transcript") {
    return {
      subject: subject || "Speech Transcript",
      summary: "The document contains spoken remarks, announcements, or public communication that should be interpreted as a transcript.",
      highlights: [
        "Speech content is present in the source text.",
        "Announcements or public statements are described.",
        entities.locations[0] ? `Context: ${entities.locations[0]}` : "Audience or location context is included.",
      ],
      actions: [
        "Extract the key message for public communication.",
        "Format the content for a formal announcement or briefing.",
        "Store the transcript with the relevant metadata.",
      ],
    };
  }

  if (documentType === "budget-report") {
    return {
      subject: subject || "Budget Report",
      summary: "The document outlines financial allocations, funding priorities, or budgetary implications for the initiative.",
      highlights: [
        "Financial allocations or budget categories are described.",
        "Funding priorities are highlighted in the content.",
        entities.amounts[0] ? `Amount: ${entities.amounts[0]}` : "Budget values are present in the document.",
      ],
      actions: [
        "Review the allocations against the stated goals.",
        "Confirm whether any approvals or follow-ups are required.",
        "Track spending implications for the responsible teams.",
      ],
    };
  }

  if (documentType === "project-proposal") {
    return {
      subject: subject || "Project Proposal",
      summary: "The document proposes a project idea, implementation approach, or initiative plan with expected benefits.",
      highlights: [
        "Project objective or scope is described.",
        "Implementation approach is outlined.",
        entities.departments[0] ? `Department focus: ${entities.departments[0]}` : "Responsible function is referenced.",
      ],
      actions: [
        "Review the proposal scope and expected impact.",
        "Identify the dependencies and implementation owners.",
        "Prepare the next-step approval or execution plan.",
      ],
    };
  }

  if (documentType === "government-circular") {
    return {
      subject: subject || "Government Circular",
      summary: "The document carries an official directive, notification, or advisory instruction from a government authority.",
      highlights: [
        "Official instruction or directive is present.",
        "Administrative or compliance expectations are stated.",
        entities.departments[0] ? `Issued by: ${entities.departments[0]}` : "Issuing authority is identified in the content.",
      ],
      actions: [
        "Distribute the instruction to the affected teams.",
        "Confirm implementation deadlines and compliance needs.",
        "Record the circular for future reference.",
      ],
    };
  }

  if (documentType === "inspection-report") {
    return {
      subject: subject || "Inspection Report",
      summary: "The document records findings from an inspection or field review and highlights any follow-up requirements.",
      highlights: [
        "Inspection observations are described.",
        "Compliance or service issues are noted.",
        entities.locations[0] ? `Inspection area: ${entities.locations[0]}` : "Inspection location is referenced.",
      ],
      actions: [
        "Review the inspection findings and risk level.",
        "Assign follow-up work to the responsible team.",
        "Track corrective action until closure.",
      ],
    };
  }

  if (documentType === "field-officer-report") {
    return {
      subject: subject || "Field Officer Report",
      summary: "The document reports field activity, observations, and operational status from the assigned officer.",
      highlights: [
        "Field observations are documented.",
        "Operational status or service condition is described.",
        entities.locations[0] ? `Field location: ${entities.locations[0]}` : "Field location is referenced.",
      ],
      actions: [
        "Review the officer observations and next tasks.",
        "Escalate issues that require higher-level intervention.",
        "Update the workflow with the latest field status.",
      ],
    };
  }

  if (documentType === "ai-analysis-report") {
    return {
      subject: subject || "AI Analysis Report",
      summary: "The document contains analytical findings, model insights, or AI-driven operational observations.",
      highlights: [
        "Analytical insight or evaluation is presented.",
        "Operational or decision implications are discussed.",
        entities.dates[0] ? `Analysis date: ${entities.dates[0]}` : "Analysis timing is provided.",
      ],
      actions: [
        "Review the core findings and their implications.",
        "Translate insights into an operational decision.",
        "Share the report with stakeholders who need the recommendation.",
      ],
    };
  }

  const topSentence = sentences[0] || normalized.slice(0, 240);
  return {
    subject: subject || `${category} Document`,
    summary: topSentence || `This ${category.toLowerCase()} document contains context-specific information that should be reviewed carefully.`,
    highlights: [
      entities.referenceNumbers[0] ? `Reference: ${entities.referenceNumbers[0]}` : "Document contains identifiable reference information.",
      entities.departments[0] ? `Departments involved: ${entities.departments[0]}` : "Department context is present.",
      entities.locations[0] ? `Location: ${entities.locations[0]}` : "Location details are included in the content.",
    ],
    actions: [
      "Review the document content and assign it to the appropriate workflow.",
      "Capture the key next step for teams or citizens.",
      "Store the latest summary for future reference.",
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// NLP Utilities
// ─────────────────────────────────────────────────────────────

interface ScoredSentence {
  text: string;
  score: number;
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 15 && s.length < 500);
}

function scoreSentences(sentences: string[], fullText: string): ScoredSentence[] {
  // Build word frequency map (simple TF)
  const words = fullText.toLowerCase().split(/\s+/);
  const freq: Record<string, number> = {};
  for (const w of words) {
    const clean = w.replace(/[^a-zA-Z0-9\u0B80-\u0BFF]/g, "");
    if (clean.length > 3) {
      freq[clean] = (freq[clean] || 0) + 1;
    }
  }

  // Score each sentence
  const scored = sentences.map(sentence => {
    const sWords = sentence.toLowerCase().split(/\s+/);
    let score = 0;

    for (const w of sWords) {
      const clean = w.replace(/[^a-zA-Z0-9\u0B80-\u0BFF]/g, "");
      score += freq[clean] || 0;
    }

    // Boost sentences with key indicators
    const lower = sentence.toLowerCase();
    if (lower.includes("subject") || lower.includes("regarding") || lower.includes("reference")) score *= 1.5;
    if (lower.includes("order") || lower.includes("directive") || lower.includes("resolution")) score *= 1.3;
    if (lower.includes("complaint") || lower.includes("grievance") || lower.includes("issue")) score *= 1.3;
    if (/\b(ward|district|block|zone)\s*\d+/i.test(sentence)) score *= 1.2;
    if (/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/.test(sentence)) score *= 1.2;

    // Penalize very short or very long sentences
    if (sWords.length < 5) score *= 0.5;
    if (sWords.length > 40) score *= 0.7;

    // Position bias: sentences early in the document are often more important
    const position = sentences.indexOf(sentence);
    if (position < 3) score *= 1.4;

    return { text: sentence, score };
  });

  return scored.sort((a, b) => b.score - a.score);
}

interface ExtractedEntities {
  names: string[];
  dates: string[];
  locations: string[];
  departments: string[];
  referenceNumbers: string[];
  phoneNumbers: string[];
  amounts: string[];
}

function classifyDocumentType(lower: string, category: DocumentCategory): string {
  if (/(technical requirements|requirements document|functional requirements|system objectives|automation workflow|integration requirements)/i.test(lower)) {
    return "technical-requirements";
  }
  if (/(complaint|grievance|citizen issue|citizen complaint|case id|reported issue|service issue)/i.test(lower)) {
    return "complaint";
  }
  if (/(resolution report|resolved|closure|case closed|resolution)/i.test(lower)) {
    return "resolution-report";
  }
  if (/(meeting minutes|agenda|attendees|minutes|decision|action items)/i.test(lower)) {
    return "meeting-minutes";
  }
  if (/(government circular|circular|directive|notification|official order)/i.test(lower)) {
    return "government-circular";
  }
  if (/(policy|guideline|directive|regulation|compliance)/i.test(lower)) {
    return "policy";
  }
  if (/(inspection report|inspection|field review|compliance check)/i.test(lower)) {
    return "inspection-report";
  }
  if (/(field officer report|field officer|field visit|field activity)/i.test(lower)) {
    return "field-officer-report";
  }
  if (/(speech transcript|transcript|speech|announcement|public address)/i.test(lower)) {
    return "speech-transcript";
  }
  if (/(budget report|budget|allocation|funding)/i.test(lower)) {
    return "budget-report";
  }
  if (/(project proposal|proposal|initiative plan|implementation plan)/i.test(lower)) {
    return "project-proposal";
  }
  if (/(analytics report|analytics|trend|metrics|dashboard)/i.test(lower)) {
    return "analytics-report";
  }
  if (/(ai analysis|ai analysis report|model insights|analysis report)/i.test(lower)) {
    return "ai-analysis-report";
  }

  if (category === "Complaint Documents") return "complaint";
  if (category === "Resolution Reports") return "resolution-report";
  if (category === "Government Circulars") return "government-circular";
  if (category === "Meeting Documents") return "meeting-minutes";
  if (category === "Policy Documents") return "policy";
  if (category === "Field Officer Reports") return "field-officer-report";

  return "generic";
}

function extractSectionContent(text: string, keywords: string[]): string | null {
  const normalized = text.replace(/\s+/g, " ").trim();
  const lower = normalized.toLowerCase();

  for (const keyword of keywords) {
    const index = lower.indexOf(keyword);
    if (index >= 0) {
      const start = Math.max(0, index);
      const end = Math.min(normalized.length, start + 260);
      const slice = normalized.slice(start, end).trim();
      return slice.replace(/\s+/g, " ");
    }
  }

  return null;
}

function extractEntitiesFromText(text: string): ExtractedEntities {
  const entities: ExtractedEntities = {
    names: [],
    dates: [],
    locations: [],
    departments: [],
    referenceNumbers: [],
    phoneNumbers: [],
    amounts: [],
  };

  // Dates (multiple formats)
  const datePatterns = [
    /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
    /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi,
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi,
  ];
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) entities.dates.push(...matches.slice(0, 5));
  }

  // Phone numbers
  const phoneMatch = text.match(/(?:\+91|91)?[\s-]?[6-9]\d{9}/g);
  if (phoneMatch) entities.phoneNumbers.push(...phoneMatch.slice(0, 3));

  // Reference numbers / IDs
  const refMatch = text.match(/(?:Ref|ID|No|Number|Complaint|Case)[.:\s#]*[\s]?[A-Z0-9\-\/]{3,15}/gi);
  if (refMatch) entities.referenceNumbers.push(...refMatch.slice(0, 5));

  // Ward/Location patterns
  const wardMatch = text.match(/(?:Ward|Zone|Block|District|Area|Division)\s*(?:No\.?\s*)?\d+/gi);
  if (wardMatch) entities.locations.push(...wardMatch.slice(0, 5));

  // Department patterns
  const deptKeywords = [
    "Public Works", "Water Supply", "Sanitation", "Health", "Education",
    "Revenue", "Transport", "Urban Planning", "Electricity", "Fire",
    "Police", "Municipal", "Engineering", "Drainage", "Roads",
    "Administration", "Finance", "IT", "Legal", "Parks",
  ];
  for (const dept of deptKeywords) {
    if (text.toLowerCase().includes(dept.toLowerCase())) {
      entities.departments.push(dept);
    }
  }

  // Money amounts
  const amountMatch = text.match(/(?:Rs\.?|₹|INR)\s*[\d,]+(?:\.\d{1,2})?/gi);
  if (amountMatch) entities.amounts.push(...amountMatch.slice(0, 5));

  // Capitalized names (simple heuristic — two consecutive capitalized words)
  const nameMatch = text.match(/\b(?:Mr|Mrs|Ms|Dr|Shri|Smt|Thiru|Selvi)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
  if (nameMatch) entities.names.push(...nameMatch.slice(0, 5));

  return entities;
}

function generateSubjectFromContent(
  text: string,
  category: DocumentCategory,
  entities: ExtractedEntities
): string {
  // Try to find a "Subject:" line in the document
  const subjectMatch = text.match(/(?:Subject|Re|Regarding|Sub)[:\s]+(.{10,120})/i);
  if (subjectMatch) {
    return subjectMatch[1].trim().replace(/\n.*/, "");
  }

  // Try to use the first meaningful sentence
  const firstSentence = text
    .split(/[.\n]/)
    .map(s => s.trim())
    .find(s => s.length > 15 && s.length < 150);

  if (firstSentence) {
    return firstSentence.slice(0, 120);
  }

  // Construct from entities
  const dept = entities.departments[0] || "General";
  const location = entities.locations[0] || "";

  const categorySubjects: Record<string, string> = {
    "Complaint Documents": `Citizen Grievance — ${dept}${location ? ` (${location})` : ""}`,
    "Resolution Reports": `Resolution Report — ${dept} Department`,
    "Government Circulars": `Official Circular — ${dept} Department`,
    "Meeting Documents": `Meeting Minutes — ${dept} Committee`,
    "Policy Documents": `Policy Document — ${dept} Guidelines`,
    "Field Officer Reports": `Field Inspection Report — ${dept}${location ? `, ${location}` : ""}`,
  };

  return categorySubjects[category] || `Document Analysis — ${dept}`;
}

function generateHighlights(
  text: string,
  category: DocumentCategory,
  entities: ExtractedEntities,
  metadata: Record<string, string | undefined>
): string[] {
  const highlights: string[] = [];
  const lower = text.toLowerCase();

  // Always include found entities as highlights
  if (entities.referenceNumbers.length > 0) {
    highlights.push(`Reference: ${entities.referenceNumbers[0]}`);
  }

  if (entities.departments.length > 0) {
    highlights.push(`Departments Involved: ${[...new Set(entities.departments)].join(", ")}`);
  }

  if (entities.locations.length > 0) {
    highlights.push(`Location: ${entities.locations.join(", ")}`);
  }

  if (entities.dates.length > 0) {
    highlights.push(`Key Date(s): ${entities.dates.slice(0, 3).join(", ")}`);
  }

  if (entities.names.length > 0) {
    highlights.push(`Personnel: ${entities.names.slice(0, 3).join(", ")}`);
  }

  if (entities.amounts.length > 0) {
    highlights.push(`Financial: ${entities.amounts.slice(0, 2).join(", ")}`);
  }

  // Category-specific content detection
  if (category === "Complaint Documents") {
    if (lower.includes("urgent") || lower.includes("emergency")) highlights.push("Priority: URGENT — Immediate attention required");
    if (metadata.status) highlights.push(`Current Status: ${metadata.status.toUpperCase()}`);
  } else if (category === "Resolution Reports") {
    if (lower.includes("resolved") || lower.includes("completed")) highlights.push("Status: Issue has been resolved and verified");
    if (lower.includes("pending")) highlights.push("Status: Partial resolution — follow-up required");
  } else if (category === "Government Circulars") {
    if (lower.includes("effective") || lower.includes("implementation")) highlights.push("Implementation directive identified in document");
    if (lower.includes("compliance") || lower.includes("mandatory")) highlights.push("Mandatory compliance requirement noted");
  } else if (category === "Meeting Documents") {
    // Count action items
    const actionItemCount = (lower.match(/action\s*item|task|assigned\s*to|responsible/gi) || []).length;
    if (actionItemCount > 0) highlights.push(`Action Items Identified: ~${actionItemCount} tasks`);
    const decisionCount = (lower.match(/decided|approved|resolved|agreed/gi) || []).length;
    if (decisionCount > 0) highlights.push(`Key Decisions: ${decisionCount} decisions recorded`);
  } else if (category === "Policy Documents") {
    if (lower.includes("guideline") || lower.includes("standard")) highlights.push("Contains operational guidelines and standards");
    if (lower.includes("amendment") || lower.includes("revision")) highlights.push("Document contains amendments to existing policy");
  }

  // Ensure we have at least 3 highlights
  if (highlights.length < 3) {
    const sentences = splitIntoSentences(text);
    const scored = scoreSentences(sentences, text);
    for (const s of scored) {
      if (highlights.length >= 3) break;
      if (s.text.length < 120) {
        highlights.push(s.text);
      }
    }
  }

  return [...new Set(highlights)].slice(0, 6);
}

function generateActions(
  text: string,
  category: DocumentCategory,
  entities: ExtractedEntities,
  metadata: Record<string, string | undefined>
): string[] {
  const actions: string[] = [];
  const lower = text.toLowerCase();

  // Category-specific actions derived from content analysis
  switch (category) {
    case "Complaint Documents":
      if (lower.includes("water") || lower.includes("leak") || lower.includes("pipe")) {
        actions.push("Dispatch Water Board inspection team to the reported location.");
      }
      if (lower.includes("road") || lower.includes("pothole") || lower.includes("damage")) {
        actions.push("Schedule Public Works road assessment within 48 hours.");
      }
      if (lower.includes("electric") || lower.includes("power") || lower.includes("street light")) {
        actions.push("Coordinate with Electricity Board for immediate repair.");
      }
      actions.push("Assign field officer for on-site verification of complaint.");
      actions.push("Update complaint tracking status and notify the citizen.");
      if (entities.names.length > 0) {
        actions.push(`Follow up with ${entities.names[0]} for additional details if required.`);
      }
      break;

    case "Resolution Reports":
      actions.push("Verify resolution quality through citizen feedback.");
      actions.push("Close the complaint ticket in the grievance management system.");
      actions.push("Archive documentation for future audit reference.");
      if (lower.includes("audit") || lower.includes("review")) {
        actions.push("Prepare corresponding files for external audit.");
      }
      break;

    case "Government Circulars":
      actions.push("Distribute to all department heads and section officers.");
      actions.push("Update internal policy and SOP manuals accordingly.");
      if (entities.dates.length > 0) {
        actions.push(`Ensure compliance before the effective date: ${entities.dates[0]}.`);
      }
      actions.push("Schedule departmental briefing to communicate changes.");
      if (lower.includes("budget") || lower.includes("fund") || entities.amounts.length > 0) {
        actions.push("Coordinate with Finance department for budget alignment.");
      }
      break;

    case "Meeting Documents":
      actions.push("Circulate approved minutes to all meeting participants.");
      actions.push("Track action items and assign owners in the task management system.");
      if (entities.dates.length > 1) {
        actions.push(`Schedule follow-up meeting by ${entities.dates[entities.dates.length - 1]}.`);
      } else {
        actions.push("Schedule follow-up review within 14 working days.");
      }
      actions.push("Update project dashboards with latest decisions.");
      break;

    case "Policy Documents":
      actions.push("Conduct training sessions for affected department staff.");
      actions.push("Audit current operations for compliance with updated policy.");
      actions.push("Publish a citizen-facing summary on the public portal.");
      if (entities.departments.length > 1) {
        actions.push(`Coordinate implementation across: ${entities.departments.join(", ")}.`);
      }
      break;

    case "Field Officer Reports":
      actions.push("Cross-reference field findings with the original complaint data.");
      actions.push("Approve or escalate based on inspection severity assessment.");
      if (entities.amounts.length > 0) {
        actions.push(`Review budget allocation of ${entities.amounts[0]} for repair work.`);
      }
      actions.push("Update the central inspection database with latest findings.");
      break;

    default:
      actions.push("Review document content and assign to the appropriate department.");
      actions.push("Tag and index for searchability in the document registry.");
      actions.push("Notify relevant stakeholders of document availability.");
  }

  return actions.slice(0, 5);
}

// ─────────────────────────────────────────────────────────────
// Minimal Summary for Empty/Unreadable Documents
// ─────────────────────────────────────────────────────────────

function createMinimalSummary(
  category: DocumentCategory,
  metadata: Record<string, string | undefined>
): ExecutiveSummary {
  return {
    subject: `${category} — Pending Content Extraction`,
    summary: `This document has been uploaded to the ${category} category but its content could not be fully extracted for summarization. This may occur for image-only documents, encrypted files, or very short documents. Manual review is recommended.`,
    highlights: [
      `Category: ${category}`,
      `Department: ${metadata.dept || "Unassigned"}`,
      "Content extraction yielded insufficient text for AI analysis.",
    ],
    actions: [
      "Manually review the uploaded document content.",
      "Re-upload a higher quality or text-based version if possible.",
      "Assign to an officer for manual data entry.",
    ],
    generatedAt: Date.now(),
    source: "local-ai",
    confidence: 15,
  };
}
