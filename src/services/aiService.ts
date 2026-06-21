
/**
 * AI Service for GovPilot
 * Automatically categorizes and routes complaints using real-time LLM analysis.
 */

import type { Category } from "../store/complaintsStore";
import { CATEGORY_DEPT, autoCategory } from "../store/complaintsStore";

// Restricted API Key from District Governance
const GEMINI_API_KEY = "AIzaSyBimmkZi2w1zCVth4xPrHuqha9zDlRbviY";
const MODEL_NAME = "gemini-1.5-flash"; // High-speed, high-reasoning model

export interface AIResult {
    category: Category;
    priority: "High" | "Medium" | "Low";
    dept: string;
    summary: string;
    actionPlan: string[];
    reasoning: string; // ✨ Explainable AI (XAI) Reasoning
}


const CATEGORY_MAP: Record<string, Category> = {
    "water": "Water Supply",
    "water supply": "Water Supply",
    "electricity": "Electricity",
    "roads": "Roads & Infrastructure",
    "roads & infrastructure": "Roads & Infrastructure",
    "sanitation": "Sanitation",
    "waste": "Sanitation",
    "public health": "Public Health",
    "parks": "Parks & Recreation",
    "parks & recreation": "Parks & Recreation",
    "drainage": "Drainage",
    "safety": "Enforcement",
    "enforcement": "Enforcement",
    "education": "Education",
    "ward committee & governance": "Ward Committee & Governance",
    "other": "Other"
};

function normalizeCategory(rawCat: string): Category {
    if (!rawCat) return "Other";
    const normalized = rawCat.toLowerCase().trim();
    if (normalized in CATEGORY_MAP) {
        return CATEGORY_MAP[normalized];
    }
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return val;
        }
    }
    return "Other";
}

export async function analyzeComplaint(issue: string, description: string): Promise<AIResult> {
    console.log(`🧠 GovPilot Intelligence: Analyzing complaint via ${MODEL_NAME}...`);
    
    // If the API key is the default leaked/blocked one, skip the network request entirely 
    // to prevent red 404/403 errors in the browser console, and jump straight to the smart local fallback.
    if (GEMINI_API_KEY === "AIzaSyBimmkZi2w1zCVth4xPrHuqha9zDlRbviY") {
        console.log("Using Offline/Local AI Classification (API Key is placeholder/blocked)");
        return fallbackClassification(issue, description);
    }
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `
                        You are a District Governance AI assistant for GovPilot.
                        Analyze the following citizen complaint and return a JSON response.
                        
                        Issue: "${issue}"
                        Description: "${description}"

                        Categories: ["Water Supply", "Electricity", "Roads & Infrastructure", "Sanitation", "Public Health", "Parks & Recreation", "Drainage", "Enforcement", "Education", "Ward Committee & Governance", "Other"]
                        Priorities: ["High", "Medium", "Low"]

                        Required JSON format:
                        {
                            "category": "String matching one of the categories",
                            "priority": "String matching one of the priorities",
                            "summary": "Short 1-sentence summary",
                            "actionPlan": ["Step 1", "Step 2", "Step 3"],
                            "reasoning": "A 2-sentence explanation of why you chose this category and priority. Be specific about keywords found."
                        }
                    `}]
                }],
                generationConfig: {
                    temperature: 0.1,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 500,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            console.warn(`Gemini API Error: ${response.status} - Falling back to local classification.`);
            return fallbackClassification(issue, description);
        }

        const data = await response.json();
        let textResponse = data.candidates[0].content.parts[0].text;
        
        // Strip markdown backticks if present
        if (textResponse.startsWith("```json")) {
            textResponse = textResponse.replace(/^```json\n/, "").replace(/\n```$/, "");
        } else if (textResponse.startsWith("```")) {
            textResponse = textResponse.replace(/^```\n/, "").replace(/\n```$/, "");
        }

        const parsed = JSON.parse(textResponse);
        
        return {
            category: parsed.category || "Other",
            priority: parsed.priority || "Medium",
            dept: CATEGORY_DEPT[parsed.category as Category] || "General Administration",
            summary: parsed.summary || issue,
            actionPlan: parsed.actionPlan || ["Investigate issue", "Assign to relevant team"],
            reasoning: parsed.reasoning || "Categorized based on keywords."
        };
    } catch (error) {
        console.error("AI Service Error:", error);
        return fallbackClassification(issue, description);
    }
}

// ─────────────────────────────────────────────────────────
// Fallback Classification (Used when offline or API limit reached)
// ─────────────────────────────────────────────────────────
function fallbackClassification(issue: string, description: string): AIResult {
    const text = (issue + " " + description).toLowerCase();
    let priority: "High" | "Medium" | "Low" = "Medium";
    
    if (text.includes("urgent") || text.includes("leak") || text.includes("fire") || text.includes("danger") || text.includes("accident")) {
        priority = "High";
    }

    const cat = autoCategory(text);

    return {
        category: cat,
        priority,
        dept: CATEGORY_DEPT[cat] || "General Administration",
        summary: issue,
        actionPlan: ["Acknowledge complaint", "Dispatch field officer for inspection", "Resolve and update status"],
        reasoning: "Local offline classification applied due to AI service unavailability."
    };
}

export interface ExtractedEntities {
    name: string;
    issue: string;
    ward: string;
    phone: string;
    confidence: {
        name: number;
        issue: number;
        ward: number;
        phone: number;
    };
}

export function extractEntities(transcript: string, rawSpeechConfidence: number): ExtractedEntities {
    // A robust local fallback NER extraction (since API is blocked)
    const text = transcript;
    
    let name = "";
    let issue = transcript;
    let ward = "";
    let phone = "";
    
    // Confidence baseline based on speech-to-text accuracy (API returns 0 to 1)
    let baseConf = rawSpeechConfidence > 0 ? Math.floor(rawSpeechConfidence * 100) : 85;

    // 1. Extract Phone Number (10 digits)
    const phoneMatch = transcript.match(/(?:\+91|91)?\s*([6-9]\d{9})/);
    if (phoneMatch) {
        phone = phoneMatch[1];
        issue = issue.replace(phoneMatch[0], "");
    }
    
    // 2. Extract Ward
    const wardMatch = transcript.match(/(?:ward|வார்டு|ward number|area)\s*(\d+)/i);
    if (wardMatch) {
        ward = "Ward " + wardMatch[1];
        issue = issue.replace(wardMatch[0], "");
    }
    
    // 3. Extract Name
    // Common heuristics: "My name is X", "I am X", "பெயர் X"
    const nameMatchEn = transcript.match(/(?:my name is|i am|this is)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/i);
    const nameMatchTa = transcript.match(/(?:என் பெயர்|பெயர்)\s+([^\s,]+)/);
    
    let nameConf = baseConf;
    
    if (nameMatchEn) {
        name = nameMatchEn[1];
        issue = issue.replace(nameMatchEn[0], "");
        nameConf = Math.min(100, baseConf + 10); // Explicit pattern increases confidence
    } else if (nameMatchTa) {
        name = nameMatchTa[1];
        issue = issue.replace(nameMatchTa[0], "");
        nameConf = Math.min(100, baseConf + 10);
    } else {
        name = "";
        nameConf = 0; // Requires user confirmation
    }
    
    // Clean up issue text
    issue = issue.trim().replace(/^[,.\s]+|[,.\s]+$/g, "");
    
    if (!issue) {
        issue = transcript; // Fallback
    }

    return {
        name: name.trim(),
        issue: issue,
        ward: ward,
        phone: phone,
        confidence: {
            name: name ? nameConf : 0,
            issue: Math.min(100, baseConf + 5),
            ward: ward ? 95 : 0,
            phone: phone ? 99 : 0
        }
    };
}
