/**
 * GovPilot — Agentic Tamil Voice Service
 *
 * - AI always speaks in Tamil (ta-IN)
 * - Automatically selects a Tamil TTS voice from browser
 * - Smart silence detection (stops listening when citizen pauses)
 * - Long timeouts: Name=60s, Complaint=180s, Area=120s, Ward=120s
 * - Gemini AI classifies collected fields into structured complaint
 */

import type { Category } from "@/store/complaintsStore";
import { CATEGORY_DEPT } from "@/store/complaintsStore";

// ── Gemini API ─────────────────────────────────────────────────────────────
const GEMINI_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_GOOGLE_API_KEY ||
  "";

const GEMINI_URL = GEMINI_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`
  : "";

// ── Types ──────────────────────────────────────────────────────────────────

export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface CollectedFields {
  name: string;
  complaint: string;
  area: string;
  ward: string;
}

export interface ClassifiedData {
  category: Category;
  dept: string;
  priority: "High" | "Medium" | "Low";
  severity: Severity;
  landmark: string;
  estimatedTime: string;
  suggestedOfficer: string;
}

// ── Tamil Voice Selection ──────────────────────────────────────────────────

let _cachedTamilVoice: SpeechSynthesisVoice | null = null;

function getTamilVoice(): SpeechSynthesisVoice | null {
  if (_cachedTamilVoice) return _cachedTamilVoice;
  const voices = window.speechSynthesis.getVoices();
  // Prefer exact ta-IN, then any Tamil voice
  _cachedTamilVoice =
    voices.find(v => v.lang === "ta-IN") ||
    voices.find(v => v.lang.startsWith("ta")) ||
    null;
  return _cachedTamilVoice;
}

// Pre-load voices (browser loads them async)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => { _cachedTamilVoice = null; };
}

// ── TTS — Tamil Only ───────────────────────────────────────────────────────

export function speakText(text: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (!window.speechSynthesis) return resolve();
      window.speechSynthesis.cancel();

      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ta-IN";
      utt.rate = 0.88;
      utt.pitch = 1.05;
      utt.volume = 1;

      // Use Tamil voice if available
      const tamilVoice = getTamilVoice();
      if (tamilVoice) utt.voice = tamilVoice;

      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      utt.onend = finish;
      utt.onerror = finish;

      // Safety fallback: estimate read time + buffer
      const estimatedMs = Math.max(3000, text.length * 110);
      setTimeout(finish, estimatedMs);

      window.speechSynthesis.speak(utt);
    } catch {
      resolve();
    }
  });
}

// ── STT — Smart Silence Detection ────────────────────────────────────────

export interface ListenOptions {
  maxMs?: number;          // Hard timeout (default 60000 = 1 min)
  silenceAfterMs?: number; // Stop if silent after speech (default 2500ms)
  onInterim?: (text: string) => void; // Live transcript callback
}

export function listenForSpeech(opts: ListenOptions = {}): Promise<string> {
  const {
    maxMs = 60_000,
    silenceAfterMs = 2500,
    onInterim,
  } = opts;

  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const SR =
          (window as unknown as { SpeechRecognition: any }).SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

        if (!SR) return resolve("");

        const rec = new SR();
        rec.lang = "ta-IN";
        rec.interimResults = true;
        rec.continuous = true;
        rec.maxAlternatives = 1;

        let finalTranscript = "";
        let interimTranscript = "";
        let speechStarted = false;
        let silenceTimer: ReturnType<typeof setTimeout> | null = null;
        let done = false;

        const finish = (result: string) => {
          if (done) return;
          done = true;
          if (silenceTimer) clearTimeout(silenceTimer);
          try { rec.stop(); } catch { /* ignore */ }
          resolve(result.trim());
        };

        const resetSilenceTimer = () => {
          if (silenceTimer) clearTimeout(silenceTimer);
          silenceTimer = setTimeout(() => {
            // Enough silence after speech — user is done
            finish(finalTranscript || interimTranscript);
          }, silenceAfterMs);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rec.onresult = (e: any) => {
          speechStarted = true;
          interimTranscript = "";

          for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript;
            if (e.results[i].isFinal) {
              finalTranscript += t + " ";
            } else {
              interimTranscript += t;
            }
          }

          const live = (finalTranscript + interimTranscript).trim();
          onInterim?.(live);
          resetSilenceTimer();
        };

        rec.onspeechend = () => {
          if (speechStarted) resetSilenceTimer();
        };

        rec.onerror = () => finish(finalTranscript || interimTranscript);
        rec.onend = () => {
          // If recognition ended before we got a result, restart if not done
          if (!done && speechStarted) {
            finish(finalTranscript || interimTranscript);
          } else if (!done) {
            // No speech at all yet — restart recognition
            try { rec.start(); } catch { finish(""); }
          }
        };

        rec.start();

        // Hard timeout
        setTimeout(() => finish(finalTranscript || interimTranscript), maxMs);

      } catch {
        resolve("");
      }
    }, 400); // brief delay so TTS finishes before mic opens
  });
}

// ── Ward / Don't-know Detection ───────────────────────────────────────────

const DONT_KNOW_WORDS = [
  "தெரியாது", "தெரியவில்லை", "தெரியல", "don't know", "dont know",
  "theriyathu", "theriyala", "teriyathu", "தெரியல்ல", "வேண்டாம்",
  "இல்ல", "இல்லை", "தெரியலை",
];

export function isDontKnow(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return DONT_KNOW_WORDS.some(w => lower.includes(w));
}

// ── Confirmation Detection ────────────────────────────────────────────────

const YES_WORDS = [
  "ஆமா", "ஆம்", "சரி", "yes", "correct", "ok", "okay", "ஓகே",
  "சரியான", "ஆமாம்", "ஆமாங்க", "right", "அது சரி", "சரிதான்",
];

export function isConfirmation(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return YES_WORDS.some(w => lower.includes(w));
}

// ── Gemini Classification ─────────────────────────────────────────────────

const CATEGORIES = [
  "Water Supply", "Electricity", "Roads & Infrastructure",
  "Sanitation", "Drainage", "Public Health",
  "Parks & Recreation", "Enforcement", "Education",
  "Ward Committee & Governance", "Other",
];

function buildClassificationPrompt(fields: CollectedFields): string {
  return `You are an intelligent civic grievance classifier for rural Tamil Nadu, India.
Analyze the following citizen complaint and extract structured data.

CATEGORIES: ${CATEGORIES.join(", ")}
PRIORITIES: High (danger/emergency/public risk), Medium (daily inconvenience), Low (cosmetic/minor)

COLLECTED DATA:
Citizen Name: ${fields.name}
Complaint: ${fields.complaint}
Area/Street: ${fields.area}
Ward/Landmark: ${fields.ward}

Return ONLY this JSON (no markdown, no explanation):
{
  "category": "one of the CATEGORIES above",
  "priority": "High|Medium|Low",
  "severity": "Critical|High|Medium|Low",
  "landmark": "specific place name if mentioned, else empty string",
  "summary": "one sentence Tamil complaint summary for the officer",
  "estimatedTime": "Estimated resolution time (e.g., '24 Hours', '3 Days')",
  "suggestedOfficer": "Suggested officer role to handle this"
}`;
}

export async function classifyComplaint(fields: CollectedFields): Promise<ClassifiedData & { summary: string }> {
  const fallback = {
    category: "Other" as Category,
    dept: CATEGORY_DEPT["Other"] || "General Administration",
    priority: "Medium" as const,
    severity: "Medium" as Severity,
    landmark: fields.area,
    summary: `${fields.name} அவர்களின் புகார்: ${fields.complaint} (${fields.area})`,
    estimatedTime: "24 Hours",
    suggestedOfficer: "Field Officer"
  };

  if (!GEMINI_URL) return fallback;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildClassificationPrompt(fields) }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.95,
          maxOutputTokens: 300,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = JSON.parse(raw);

    const category = (parsed.category as Category) || "Other";
    return {
      category,
      dept: CATEGORY_DEPT[category] || "General Administration",
      priority: parsed.priority || "Medium",
      severity: parsed.severity || "Medium",
      landmark: parsed.landmark || "",
      summary: parsed.summary || fallback.summary,
      estimatedTime: parsed.estimatedTime || "24 Hours",
      suggestedOfficer: parsed.suggestedOfficer || "Field Officer",
    };
  } catch (err) {
    console.error("[AgentVoice] Gemini error:", err);
    return fallback;
  }
}

// ── Tamil Prompts ──────────────────────────────────────────────────────────

export const PROMPTS = {
  welcome:
    "வணக்கம்! நான் உங்கள் அரசு புகார் உதவியாளர். உங்கள் பிரச்சனையை பதிவு செய்ய நான் உங்களுக்கு உதவுவேன். கவலைப்படாதீர்கள், நான் தமிழிலேயே பேசுவேன்.",

  ask_name:
    "முதலில், உங்கள் பெயர் என்ன என்று சொல்லுங்கள்.",

  name_timeout:
    "மன்னிக்கவும். உங்கள் பெயர் சொல்லவில்லை. மீண்டும் ஒரு முறை உங்கள் பெயரை சொல்லுங்கள்.",

  ask_complaint:
    "சரி. இப்போது நீங்கள் என்ன பிரச்சனை அனுபவிக்கிறீர்கள் என்று விரிவாக சொல்லுங்கள். நான் கவனமாக கேட்கிறேன்.",

  complaint_timeout:
    "சரியாக கேட்கவில்லை. உங்கள் பிரச்சனை என்ன என்று மீண்டும் சொல்லுங்கள்.",

  ask_area:
    "இந்த பிரச்சனை எந்த தெரு அல்லது ஊரில் உள்ளது என்று சொல்லுங்கள்.",

  area_timeout:
    "மன்னிக்கவும். எந்த பகுதியில் பிரச்சனை இருக்கிறது என்று மீண்டும் சொல்லுங்கள்.",

  ask_ward:
    "உங்கள் வார்டு எண் என்ன?",

  ask_ward_landmark:
    "பரவாயில்லை. அருகிலுள்ள பள்ளி, கோவில், பேருந்து நிறுத்தம் அல்லது முக்கியமான இடத்தின் பெயரை சொல்லுங்கள்.",

  ward_timeout:
    "வார்டு எண் தெரியவில்லையா? அருகிலுள்ள முக்கியமான இடத்தின் பெயரை சொல்லுங்கள்.",

  processing:
    "நன்றி. உங்கள் தகவல்களை பரிசீலிக்கிறேன். கொஞ்சம் நேரம் காத்திருங்கள்.",

  buildSummary: (fields: CollectedFields) =>
    `நான் சேகரித்த தகவல்கள்: பெயர் ${fields.name}. புகார்: ${fields.complaint}. பகுதி: ${fields.area}. இடம்: ${fields.ward}. இந்த தகவல்கள் சரியா என்று சொல்லுங்கள்.`,

  ask_confirm:
    "மேலே சொன்ன தகவல்கள் சரியா? சரி என்று சொன்னால் புகாரை பதிவு செய்வேன்.",

  success: (id: string) =>
    `உங்கள் புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது. உங்கள் புகார் எண் ${id}. விரைவில் அதிகாரி உங்களை தொடர்பு கொள்வார்கள். நன்றி!`,

  retry:
    "மன்னிக்கவும், சரியாக கேட்கவில்லை. மீண்டும் ஒரு முறை சொல்லுங்கள்.",

  error:
    "மன்னிக்கவும், ஒரு பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
};
