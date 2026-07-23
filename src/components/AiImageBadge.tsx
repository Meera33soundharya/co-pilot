/**
 * AiImageBadge.tsx
 *
 * Renders a clearly visible "Illustrative image — no photo submitted" badge.
 * Must be shown on every AI-generated fallback image, in both the web UI and PDF.
 *
 * Usage:
 *   <AiImageBadge />                  — small compact badge (default)
 *   <AiImageBadge variant="banner" /> — full-width banner for PDF/print
 */

import React from "react";

interface AiImageBadgeProps {
    variant?: "badge" | "banner";
    className?: string;
}

export function AiImageBadge({ variant = "badge", className = "" }: AiImageBadgeProps) {
    if (variant === "banner") {
        return (
            <div
                className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-amber-50 border border-amber-200 rounded-b-xl ${className}`}
                style={{ borderTop: "1.5px dashed #F59E0B" }}
            >
                <span style={{ fontSize: 13 }}>⚠️</span>
                <span
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#92400E",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                    }}
                >
                    Illustrative image — no photo submitted
                </span>
            </div>
        );
    }

    // Default: compact top-left or top-right corner badge
    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${className}`}
            style={{
                background: "#FEF3C7",
                border: "1px solid #F59E0B",
                fontFamily: "Inter, sans-serif",
                fontSize: 10,
                fontWeight: 800,
                color: "#92400E",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
            }}
        >
            <span>⚠</span>
            <span>Illustrative</span>
        </div>
    );
}

/**
 * Wraps an image with the AI badge overlay when isAiGenerated is true.
 * Applies an orange-dashed border to distinguish it from real photos.
 */
interface AiImageWrapperProps {
    src: string;
    alt: string;
    isAiGenerated: boolean;
    className?: string;
    imgClassName?: string;
}

export function AiImageWrapper({
    src,
    alt,
    isAiGenerated,
    className = "",
    imgClassName = "w-full h-full object-cover",
}: AiImageWrapperProps) {
    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={
                isAiGenerated
                    ? { border: "2px dashed #F59E0B", borderRadius: 12 }
                    : {}
            }
        >
            <img src={src} alt={alt} className={imgClassName} />
            {isAiGenerated && (
                <>
                    {/* Semi-transparent amber overlay tint */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "rgba(251,191,36,0.04)" }}
                    />
                    {/* Corner badge */}
                    <div className="absolute top-2 right-2 z-10">
                        <AiImageBadge />
                    </div>
                </>
            )}
        </div>
    );
}
