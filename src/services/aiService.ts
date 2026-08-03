
/**
 * AI Service for GovPilot
 * Automatically categorizes and routes complaints using real-time LLM analysis.
 */

import type { Category } from "../store/complaintsStore";
import { CATEGORY_DEPT, autoCategory } from "../store/complaintsStore";

// Restricted API Key from District Governance
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBimmkZi2w1zCVth4xPrHuqha9zDlRbviY";
const MODEL_NAME = "gemini-1.5-flash"; // High-speed, high-reasoning model

export interface AIResult {
    category: Category;
    priority: "High" | "Medium" | "Low";
    dept: string;
    summary: string;
    actionPlan: string[];
    reasoning: string;
    estimatedTime: string;
    suggestedOfficer: string;
}

export async function analyzeComplaint(issue: string, description: string): Promise<AIResult> {
    console.log(`🧠 GovPilot Intelligence: Analyzing complaint via ${MODEL_NAME}...`);
    
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

                        Categories: ["Water Supply", "Electricity", "Roads & Infrastructure", "Sanitation", "Drainage", "Public Health", "Parks & Recreation", "Enforcement", "Education", "Ward Committee & Governance", "Other"]
                        Priorities: ["High", "Medium", "Low"]

                        Required JSON format:
                        {
                            "category": "String matching one of the categories",
                            "priority": "String matching one of the priorities",
                            "summary": "Short 1-sentence summary",
                            "actionPlan": ["Step 1", "Step 2", "Step 3"],
                            "reasoning": "A 2-sentence explanation of why you chose this category and priority. Be specific about keywords found.",
                            "estimatedTime": "Estimated resolution time (e.g., '24 Hours', '3 Days', '1 Week')",
                            "suggestedOfficer": "Suggested officer role to handle this (e.g., 'Junior Engineer', 'Sanitation Inspector')"
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
            throw new Error(`Gemini API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);
        
        const cat = aiResponse.category as Category;
        const dept = CATEGORY_DEPT[cat] || "General Administration";

        return {
            category: cat,
            priority: aiResponse.priority as any,
            dept: dept,
            summary: aiResponse.summary,
            actionPlan: aiResponse.actionPlan,
            reasoning: aiResponse.reasoning,
            estimatedTime: aiResponse.estimatedTime || "24 Hours",
            suggestedOfficer: aiResponse.suggestedOfficer || "Field Officer"
        };

    } catch (error) {
        console.error("AI Service Error:", error);
        
        // Fallback to local heuristic if API fails
        const text = (`${issue} ${description}`).toLowerCase();
        const cat = autoCategory(text);
        const dept = CATEGORY_DEPT[cat];
        
        return {
            category: cat,
            priority: text.includes("danger") || text.includes("urgent") ? "High" : "Medium",
            dept: dept,
            summary: "AI fallback (Offline Mode): Auto-categorized based on departmental keywords.",
            actionPlan: [`Forward to ${dept} Unit`, "Initial assessment by field team"],
            reasoning: `AI encountered an issue communicating with the core models, but locally identified this as ${cat} based on district protocols.`,
            estimatedTime: "24 Hours",
            suggestedOfficer: "Field Officer"
        };
    }
}

/**
 * extractEntities — Stub for compatibility with older components.
 * Extracts basic named entities from text using simple heuristics.
 */
export interface ExtractedEntities {
    citizen?: string;
    name?: string;
    phone?: string;
    ward?: string;
    location?: string;
    issue?: string;
}

export function extractEntities(text: string, confidenceThreshold?: number): ExtractedEntities {
    const phoneMatch = text.match(/(\+91[\s-]?\d{5}[\s-]?\d{5}|\d{10})/);
    const wardMatch = text.match(/ward\s*(\d+)/i);
    return {
        phone: phoneMatch?.[0],
        ward: wardMatch ? `Ward ${wardMatch[1]}` : undefined,
        issue: text.length > 10 ? text.substring(0, 100) : undefined,
    };
}

