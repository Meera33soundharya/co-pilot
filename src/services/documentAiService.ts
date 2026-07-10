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
  if (!extractedText || extractedText.trim().length < 20) {
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
      console.warn("Gemini API failed for document summarization, using local fallback:", error);
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

  if (!response.ok) return null;

  const data = await response.json();
  let textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) return null;

  // Strip markdown backticks
  if (textResponse.startsWith("```json")) {
    textResponse = textResponse.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (textResponse.startsWith("```")) {
    textResponse = textResponse.replace(/^```\n/, "").replace(/\n```$/, "");
  }

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
}

// ─────────────────────────────────────────────────────────────
// Smart Local Fallback Summarizer
// ─────────────────────────────────────────────────────────────

function localSmartSummarize(
  text: string,
  category: DocumentCategory,
  metadata: Record<string, string | undefined>
): ExecutiveSummary {
  // 1. Extract key sentences using a simple scoring algorithm
  const sentences = splitIntoSentences(text);
  const scoredSentences = scoreSentences(sentences, text);

  // 2. Extract entities from the text
  const entities = extractEntitiesFromText(text);

  // 3. Generate subject from content
  const subject = generateSubjectFromContent(text, category, entities);

  // 4. Build summary from top-scoring sentences
  const topSentences = scoredSentences.slice(0, 4).map(s => s.text);
  const summaryText = topSentences.join(" ").slice(0, 600);

  // 5. Generate highlights from entities and key phrases
  const highlights = generateHighlights(text, category, entities, metadata);

  // 6. Generate recommended actions based on content analysis
  const actions = generateActions(text, category, entities, metadata);

  return {
    subject,
    summary: summaryText || `This ${category.toLowerCase()} document contains information pertaining to ${metadata.dept || "the concerned department"}. The content has been extracted and analyzed for key data points and actionable insights.`,
    highlights: highlights.slice(0, 6),
    actions: actions.slice(0, 5),
    generatedAt: Date.now(),
    source: "local-ai",
    confidence: Math.min(85, 50 + Math.floor(text.length / 100)),
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
      if (lower.includes("recurring") || lower.includes("repeat")) {
        actions.push("Flag location for recurring issue monitoring.");
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
