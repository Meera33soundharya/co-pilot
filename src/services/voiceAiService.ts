/**
 * Voice AI Service — GovPilot
 * Uses OpenAI Whisper (speech-to-text) + GPT-4o (entity extraction).
 * Falls back to local regex extraction when no API key is set.
 */

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

// ── Whisper Transcription ─────────────────────────────────────────────────

/**
 * Transcribe an audio Blob using OpenAI Whisper.
 * Supports Tamil (ta) and English (en).
 */
export async function transcribeAudio(
  audioBlob: Blob,
  lang: "ta" | "en" = "ta"
): Promise<string> {
  if (!OPENAI_KEY) {
    throw new Error("VITE_OPENAI_API_KEY not set — using browser STT");
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-1");
  formData.append("language", lang === "ta" ? "ta" : "en");
  formData.append("response_format", "json");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Whisper error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return (data.text || "").trim();
}

// ── GPT-4o Entity Extraction ───────────────────────────────────────────────

/**
 * Extract structured entities from a raw voice transcript using GPT-4o.
 * Works for both Tamil and English transcripts.
 */
export async function extractEntitiesGPT(
  transcript: string,
  field: "name" | "issue" | "ward" | "phone" | "confirm"
): Promise<string> {
  if (!OPENAI_KEY) {
    return extractEntitiesLocal(transcript, field);
  }

  const prompts: Record<string, string> = {
    name: `Extract only the person's name from this text. Return just the name, nothing else. If unclear, return the text as-is.\nText: "${transcript}"`,
    issue: `The user is filing a civic complaint in Tamil or English. Extract the core complaint/issue from this text. Return a clean 1-sentence summary in the same language.\nText: "${transcript}"`,
    ward: `Extract the ward number or area/locality name from this text. Return just the ward/area, nothing else. Examples: "Ward 5", "Anna Nagar", "வார்டு 3".\nText: "${transcript}"`,
    phone: `Extract the 10-digit Indian mobile phone number from this text. Return only the digits, no spaces or dashes. If not found, return empty string.\nText: "${transcript}"`,
    confirm: `The user was asked to confirm (Yes/No). Does this text mean YES or NO? Consider Tamil: ஆம்/சரி/ஓகே = YES, இல்லை/இல்ல = NO. Return exactly "YES" or "NO".\nText: "${transcript}"`,
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a Tamil/English bilingual entity extractor for a civic grievance portal. Be precise and return only what is asked.",
          },
          { role: "user", content: prompts[field] },
        ],
        temperature: 0,
        max_tokens: 100,
      }),
    });

    if (!res.ok) throw new Error(`GPT error: ${res.status}`);
    const data = await res.json();
    return (data.choices?.[0]?.message?.content || "").trim();
  } catch (e) {
    console.warn("GPT-4o extraction failed, using local fallback:", e);
    return extractEntitiesLocal(transcript, field);
  }
}

// ── Local Fallback Extraction ─────────────────────────────────────────────

export function extractEntitiesLocal(
  text: string,
  field: "name" | "issue" | "ward" | "phone" | "confirm"
): string {
  const t = text.trim();

  if (field === "phone") {
    const m = t.match(/(?:\+91|91)?\s*([6-9]\d{9})/);
    return m ? m[1] : "";
  }

  if (field === "ward") {
    const m =
      t.match(/(?:ward|வார்டு|வார்ட்|area|பகுதி)[^\d]*(\d+)/i) ||
      t.match(/(\d+)\s*(?:ward|வார்டு)/i);
    if (m) return `Ward ${m[1]}`;
    const areas = ["anna nagar", "t nagar", "velachery", "adyar", "tambaram", "porur", "sholinganallur", "chrompet"];
    for (const area of areas) {
      if (t.toLowerCase().includes(area)) return area.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return t;
  }

  if (field === "name") {
    const enMatch =
      t.match(/(?:my name is|i am|this is|name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i) ||
      t.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[\s,]/);
    const taMatch = t.match(/(?:என் பெயர்|பெயர்|நான்)\s+([^\s,]+)/);
    if (enMatch) return enMatch[1].trim();
    if (taMatch) return taMatch[1].trim();
    return t.split(/\s+/).slice(0, 2).join(" ");
  }

  if (field === "confirm") {
    const lower = t.toLowerCase();
    const yesWords = ["yes", "ஆம்", "ஆம", "சரி", "ok", "okay", "ஓகே", "யெஸ்", "submit", "confirm", "correct"];
    const noWords = ["no", "இல்லை", "இல்ல", "nope", "cancel", "மீண்டும்", "retry", "again"];
    if (yesWords.some((w) => lower.includes(w))) return "YES";
    if (noWords.some((w) => lower.includes(w))) return "NO";
    return "YES";
  }

  return t.replace(/\s+/g, " ").trim();
}
