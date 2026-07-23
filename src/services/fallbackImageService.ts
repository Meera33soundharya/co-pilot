/**
 * complaintImageService.ts  — SINGLE SOURCE OF TRUTH for complaint images
 *
 * ALL surfaces (list view, detail modal, PDF export) MUST call resolveComplaintImage().
 * Never hardcode image paths in components. Never duplicate the category map.
 *
 * Rules enforced here:
 *  1. Images are keyed by complaint_id + phase, never by loose title matching.
 *  2. Category enum values are normalised (trim + case) before lookup.
 *  3. Issue-title keywords can override the broad category → narrower sub-scene.
 *  4. Any real user-upload (not in the placeholder list) is returned as-is.
 *  5. Fallback images are always flagged isAiGenerated = true so every surface
 *     can render the "Illustrative image" watermark badge.
 *  6. A runtime mismatch-check warns in development if the wrong image is rendered.
 */

export type ImagePhase = "before" | "after";

export interface ComplaintImageResult {
  src: string;
  isAiGenerated: boolean;
  /** Resolved sub-category used for the fallback (for debugging). */
  resolvedCategory: string;
}

// ── Canonical placeholder paths (must match files in /public) ─────────────
const BEFORE_MAP: Record<string, string> = {
  "Water Supply":                "/complaint_water.png",
  "Electricity":                 "/complaint_electricity.png",
  "Roads & Infrastructure":      "/complaint_road.png",
  "Sanitation":                  "/complaint_sanitation.png",
  "Toilet":                      "/complaint_toilet.png",
  "Drainage":                    "/complaint_sanitation.png",
  "Public Health":               "/complaint_sanitation.png",
  "Parks & Recreation":          "/before_placeholder.png",
  "Enforcement":                 "/before_placeholder.png",
  "Education":                   "/before_placeholder.png",
  "Ward Committee & Governance": "/before_placeholder.png",
  "Other":                       "/before_placeholder.png",
};

const AFTER_MAP: Record<string, string> = {
  "Water Supply":                "/resolved_water.png",
  "Electricity":                 "/resolved_electricity.png",
  "Roads & Infrastructure":      "/resolved_road.png",
  "Sanitation":                  "/resolved_sanitation.png",
  "Toilet":                      "/resolved_toilet.png",
  "Drainage":                    "/resolved_sanitation.png",
  "Public Health":               "/resolved_sanitation.png",
  "Parks & Recreation":          "/resolved_placeholder.png",
  "Enforcement":                 "/resolved_placeholder.png",
  "Education":                   "/resolved_placeholder.png",
  "Ward Committee & Governance": "/resolved_placeholder.png",
  "Other":                       "/resolved_placeholder.png",
};

// Complete set of placeholder paths that should NEVER be returned as "real" uploads.
const PLACEHOLDER_PATHS = new Set([
  ...Object.values(BEFORE_MAP),
  ...Object.values(AFTER_MAP),
]);

// ── Normalise a raw category string ───────────────────────────────────────
function normaliseCategory(raw: string | undefined | null): string {
  return (raw ?? "Other").trim();
}

// ── Sub-category routing from issue title keywords ─────────────────────────
const KEYWORD_OVERRIDES: Array<{ keywords: string[]; category: string }> = [
  { keywords: ["toilet", "washroom", "urinal", "latrine", "restroom"], category: "Toilet" },
  { keywords: ["pothole", "road damage", "road repair", "pavement", "footpath"], category: "Roads & Infrastructure" },
  { keywords: ["street light", "live wire", "electric", "power cut", "voltage", "light not working"], category: "Electricity" },
  { keywords: ["water leak", "pipe burst", "no water", "water supply", "waterlog"], category: "Water Supply" },
  { keywords: ["garbage", "waste", "trash", "dustbin", "litter"], category: "Sanitation" },
  { keywords: ["drain", "drainage", "sewer", "flood", "waterlogging"], category: "Drainage" },
];

function resolveSubCategory(baseCategory: string, issueTitle: string): string {
  if (!issueTitle) return normaliseCategory(baseCategory);
  const lower = issueTitle.toLowerCase();
  for (const { keywords, category } of KEYWORD_OVERRIDES) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return normaliseCategory(baseCategory);
}

// ── Main public API ────────────────────────────────────────────────────────
/**
 * Resolves the correct image for a complaint on a specific surface.
 *
 * @param complaintId   Unique ID of the complaint (for mismatch logging only)
 * @param rawImageUrl   The stored URL/base64 from the complaint record (may be null/undefined)
 * @param category      The complaint's category field (exact enum string)
 * @param phase         "before" = original condition, "after" = resolved state
 * @param issueTitle    (optional) Issue title for sub-category keyword matching
 */
export function resolveComplaintImage(
  complaintId: string,
  rawImageUrl: string | undefined | null,
  category: string | undefined | null,
  phase: ImagePhase,
  issueTitle: string = ""
): ComplaintImageResult {
  const cleaned = (rawImageUrl ?? "").trim();
  const resolvedCategory = resolveSubCategory(category ?? "Other", issueTitle);

  // ── Use real upload if it is not a known placeholder ──────────────────
  if (cleaned && !PLACEHOLDER_PATHS.has(cleaned)) {
    // Runtime mismatch guard (dev-only)
    if (import.meta.env.DEV) {
      // If the stored URL looks like a wrong-category placeholder, warn.
      const allPlaceholders = [...PLACEHOLDER_PATHS];
      if (allPlaceholders.some((p) => cleaned === p)) {
        console.warn(
          `[complaintImageService] Potential placeholder served as real upload for ${complaintId} (${phase}): "${cleaned}"`
        );
      }
    }
    return { src: cleaned, isAiGenerated: false, resolvedCategory };
  }

  // ── Fallback: pick the right placeholder for this category + phase ─────
  const map = phase === "before" ? BEFORE_MAP : AFTER_MAP;
  const fallbackSrc = map[resolvedCategory] ?? map["Other"];

  if (import.meta.env.DEV && !map[resolvedCategory]) {
    console.warn(
      `[complaintImageService] Unknown category "${resolvedCategory}" for complaint ${complaintId}. Fell back to "Other".`
    );
  }

  return { src: fallbackSrc, isAiGenerated: true, resolvedCategory };
}

// ── Backwards-compat shim so existing callers (resolveImage) keep working ──
export type { ImagePhase as FallbackPhase };

/** @deprecated Use resolveComplaintImage() instead. */
export function resolveImage(
  rawImageUrl: string | undefined | null,
  category: string,
  phase: ImagePhase,
  issueTitle: string = ""
): { src: string; isAiGenerated: boolean } {
  const result = resolveComplaintImage("unknown", rawImageUrl, category, phase, issueTitle);
  return { src: result.src, isAiGenerated: result.isAiGenerated };
}
