
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

                        Categories: ["Roads", "Water", "Electricity", "Sanitation", "Drainage", "Waste", "Public Health", "Safety", "Parks", "Other"]
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
            reasoning: aiResponse.reasoning
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
            reasoning: `AI encountered an issue communicating with the core models, but locally identified this as ${cat} based on district protocols.`
        };
    }
}
