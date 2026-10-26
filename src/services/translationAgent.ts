/**
 * Tamil & English Translation Agent Service
 * Real-time Bidirectional Translation:
 * - Tamil (தமிழ்) / Tanglish -> English
 * - English -> Tamil (தமிழ்)
 *
 * Includes:
 * 1. Fast in-memory cache to eliminate repeated API calls
 * 2. Privacy-preserving entity preservation (does NOT translate numbers, IDs, phone numbers)
 * 3. Robust fallback dictionary for civic & governance terms
 */

export type TargetLanguageMode = "auto" | "ta" | "en";

export interface TranslationAgentResponse {
  translatedText: string;
  sourceLang: "ta" | "en" | "unknown";
  targetLang: "ta" | "en";
  tanglish?: string;
  grammarNote?: string;
  success: boolean;
  error?: string;
  fromCache?: boolean;
}

// ── In-Memory Translation Cache ──────────────────────────────
const translationCache = new Map<string, TranslationAgentResponse>();

/**
 * Check if string has Tamil unicode characters
 */
export function hasTamilCharacters(text: string): boolean {
  return /[\u0B80-\u0BFF]/.test(text);
}

/**
 * Check if string should NOT be translated (pure phone numbers, reference IDs, etc.)
 */
export function isPureIdentifier(text: string): boolean {
  const trimmed = text.trim();
  // Phone numbers, ticket IDs like GP-2026-XXXX, Ward numbers, numbers
  if (/^(\+?91)?[0-9\s\-()]{7,15}$/.test(trimmed)) return true;
  if (/^[A-Z0-9_\-#/]{3,20}$/i.test(trimmed) && /\d/.test(trimmed)) return true;
  return false;
}

/**
 * Execute real-time translation between Tamil and English
 */
export async function executeTranslationAgent(
  text: string,
  mode: TargetLanguageMode = "auto"
): Promise<TranslationAgentResponse> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      translatedText: "",
      sourceLang: "unknown",
      targetLang: mode === "ta" ? "ta" : "en",
      success: true,
    };
  }

  // Do not translate pure phone numbers or tracking IDs
  if (isPureIdentifier(trimmed)) {
    return {
      translatedText: trimmed,
      sourceLang: "unknown",
      targetLang: mode === "ta" ? "ta" : "en",
      success: true,
    };
  }

  const isInputTamil = hasTamilCharacters(trimmed);
  let targetLangCode: "ta" | "en";
  if (mode === "ta") targetLangCode = "ta";
  else if (mode === "en") targetLangCode = "en";
  else targetLangCode = isInputTamil ? "en" : "ta";

  const sourceLangCode = isInputTamil ? "ta" : "auto";
  const cacheKey = `${sourceLangCode}->${targetLangCode}::${trimmed}`;

  if (translationCache.has(cacheKey)) {
    const cached = translationCache.get(cacheKey)!;
    return { ...cached, fromCache: true };
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLangCode}&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Translation network status: ${response.status}`);
    }

    const data = await response.json();
    // Parse response format: [[[translatedText, originalText, ...]]]
    if (data && Array.isArray(data[0])) {
      const translated = data[0]
        .map((part: any) => (part && part[0] ? part[0] : ""))
        .join("")
        .trim();

      const detectedSource = data[2] === "ta" ? "ta" : data[2] === "en" ? "en" : (isInputTamil ? "ta" : "en");

      const result: TranslationAgentResponse = {
        translatedText: translated || trimmed,
        sourceLang: detectedSource,
        targetLang: targetLangCode,
        tanglish: targetLangCode === "ta" ? getPhoneticNote(translated) : undefined,
        success: Boolean(translated),
      };

      if (result.success) {
        translationCache.set(cacheKey, result);
      }
      return result;
    }

    throw new Error("Invalid response format");
  } catch (err: any) {
    console.warn("Translation service fallback:", err);
    const fallbackRes = getFallbackTranslation(trimmed, targetLangCode);
    if (fallbackRes.success) {
      translationCache.set(cacheKey, fallbackRes);
    }
    return fallbackRes;
  }
}

/**
 * Quick phonetic guidance if target is Tamil
 */
function getPhoneticNote(tamilText: string): string | undefined {
  const mapping: Record<string, string> = {
    "வணக்கம்": "Vanakkam",
    "நன்றி": "Nandri",
    "குடிநீர்": "Kudineer",
    "சாலை": "Saalai",
    "மின்சாரம்": "Minsaaram",
    "தெரு விளக்கு": "Theru vilakku",
  };
  for (const [key, val] of Object.entries(mapping)) {
    if (tamilText.includes(key)) return val;
  }
  return undefined;
}

/**
 * Built-in fallback dictionary for common civic & governance keywords
 */
function getFallbackTranslation(text: string, target: "ta" | "en"): TranslationAgentResponse {
  const isTamil = hasTamilCharacters(text);

  const dictionary: Record<string, { ta: string; en: string }> = {
    "water": { ta: "குடிநீர்", en: "Water" },
    "water supply": { ta: "குடிநீர் விநியோகம்", en: "Water Supply" },
    "pipe broken": { ta: "குழாய் உடைந்துள்ளது", en: "Pipe Broken" },
    "street light broken": { ta: "தெரு விளக்கு பழுதடைந்துள்ளது", en: "Street light broken" },
    "road": { ta: "சாலை", en: "Road" },
    "pothole": { ta: "சாலையில் குழி", en: "Pothole" },
    "electricity": { ta: "மின்சாரம்", en: "Electricity" },
    "street light": { ta: "தெரு விளக்கு", en: "Street Light" },
    "garbage": { ta: "குப்பை", en: "Garbage" },
    "drainage": { ta: "சாக்கடை கழிவுநீர்", en: "Drainage" },
    "hospital": { ta: "மருத்துவமனை", en: "Hospital" },
    "complaint": { ta: "புகார்", en: "Complaint" },
    "status": { ta: "நிலை", en: "Status" },
    "resolved": { ta: "தீர்க்கப்பட்டது", en: "Resolved" },
    "pending": { ta: "நிலுவையில் உள்ளது", en: "Pending" },
    "in progress": { ta: "செயல்பாட்டில் உள்ளது", en: "In Progress" },
    "assigned": { ta: "ஒதுக்கப்பட்டது", en: "Assigned" },
    "sanitation": { ta: "துப்புரவு", en: "Sanitation" },
    "public health": { ta: "பொது சுகாதாரம்", en: "Public Health" },
    "parks": { ta: "பூங்காக்கள்", en: "Parks & Recreation" },
    "urgent": { ta: "அவசரம்", en: "Urgent" },
    "emergency": { ta: "அவசரநிலை", en: "Emergency" },
  };

  const lower = text.toLowerCase().trim();
  for (const item of Object.values(dictionary)) {
    if (lower === item.en.toLowerCase() && target === "ta") {
      return {
        translatedText: item.ta,
        sourceLang: "en",
        targetLang: "ta",
        success: true
      };
    }
    if (lower === item.ta.toLowerCase() && target === "en") {
      return {
        translatedText: item.en,
        sourceLang: "ta",
        targetLang: "en",
        success: true
      };
    }
  }

  // Exact substring check
  for (const item of Object.values(dictionary)) {
    if (lower.includes(item.en.toLowerCase()) && target === "ta") {
      return {
        translatedText: item.ta,
        sourceLang: "en",
        targetLang: "ta",
        success: true
      };
    }
  }

  return {
    translatedText: text,
    sourceLang: isTamil ? "ta" : "en",
    targetLang: target,
    success: false,
    error: "Translation network timeout. Raw text retained."
  };
}
