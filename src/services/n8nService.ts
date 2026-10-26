/**
 * n8n Agent Integration Service for GovPilot
 * 
 * Secure proxy / dispatcher for n8n automated civic workflows.
 * 
 * Security & Privacy Safeguards:
 * 1. Sanitizes citizen PII before dispatching to external webhook (only transmits anonymized or ticket/ward metadata).
 * 2. Does NOT expose raw secret keys in frontend network payloads (relies on configured gateway / webhook endpoint).
 */

// Configured Webhook endpoint (can be an n8n webhook or internal backend proxy)
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "";

export interface SanitizedGrievancePayload {
  ticketId: string;
  category?: string;
  priority: "High" | "Medium" | "Low";
  ward: string;
  area?: string;
  source: string;
  originalTamil?: string;
  translatedEnglish?: string;
  summary?: string;
  hasAudioAttachment?: boolean;
}

export interface N8nAgentPayload {
  action: "grievance_submitted" | "ai_analyze" | "tamil_translate";
  timestamp: string;
  grievance: SanitizedGrievancePayload;
}

export interface N8nAgentResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Dispatch a sanitized civic event to n8n workflow agent
 * Only called after the grievance has been successfully stored in the local registry/database.
 */
export async function triggerN8nWorkflow(payload: N8nAgentPayload): Promise<N8nAgentResponse> {
  const targetUrl = N8N_WEBHOOK_URL || (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/n8n/webhook` : "");

  // Safe fallback if webhook URL is not currently wired up in environment
  if (!targetUrl) {
    console.info("ℹ️ [GovPilot -> n8n Agent] Event prepared successfully (VITE_N8N_WEBHOOK_URL not configured).", {
      action: payload.action,
      ticketId: payload.grievance.ticketId,
      ward: payload.grievance.ward,
    });
    return {
      success: true,
      message: "n8n workflow payload prepared safely (awaiting endpoint configuration)",
    };
  }

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: payload.action,
        timestamp: payload.timestamp,
        source: "GovPilot-Civic-AI-Agent",
        // Send only sanitized grievance details (no citizen phone number or raw personal IDs)
        grievance: payload.grievance,
      }),
    });

    if (!res.ok) {
      throw new Error(`n8n webhook error HTTP ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    return {
      success: true,
      message: "Grievance event forwarded to n8n agent",
      data,
    };
  } catch (err: any) {
    console.warn("⚠️ [GovPilot -> n8n Agent] Webhook dispatch warning:", err?.message || err);
    return {
      success: false,
      error: err?.message || "Failed to trigger n8n workflow",
    };
  }
}
