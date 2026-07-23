/**
 * Document Text Extraction Service
 * ----------------------------------
 * Extracts text content from uploaded documents for AI summarization.
 * Supports: PDF (digital text layer), DOCX (XML parsing), TXT/CSV/MD (direct),
 * and JPG/PNG/WEBP (client-side OCR via Tesseract.js).
 *
 * All methods operate on the base64 `fileData` stored in DocumentRecord.
 */

import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";

// Configure PDF.js worker — use CDN to avoid bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

export interface ExtractionResult {
  text: string;
  method: "pdf" | "docx" | "plaintext" | "ocr" | "fallback";
  confidence: number;       // 0–100
  pageCount?: number;
  language?: string;
  processingTimeMs: number;
}

/**
 * Main entry point — detects file type and extracts text.
 * @param fileData  Base64 data URI or raw base64 string
 * @param fileName  Original filename (used for type detection)
 * @param fileType  Uppercase extension override (e.g. "PDF")
 */
export async function extractText(
  fileData: string,
  fileName: string,
  fileType?: string
): Promise<ExtractionResult> {
  const start = performance.now();
  const ext = (fileType || fileName.split(".").pop() || "").toUpperCase();

  try {
    let result: ExtractionResult;

    switch (ext) {
      case "PDF":
        result = await extractFromPDF(fileData, start);
        break;
      case "DOCX":
      case "DOC":
        result = await extractFromDOCX(fileData, start);
        break;
      case "TXT":
      case "CSV":
      case "MD":
      case "LOG":
      case "JSON":
      case "XML":
        result = await extractFromPlainText(fileData, start);
        break;
      case "JPG":
      case "JPEG":
      case "PNG":
      case "WEBP":
      case "BMP":
      case "TIFF":
      case "TIF":
        result = await extractFromImage(fileData, start);
        break;
      default:
        // Try plain text decode as a last resort
        result = await extractFromPlainText(fileData, start);
        result.method = "fallback";
        result.confidence = Math.min(result.confidence, 40);
    }

    // Clean up extracted text
    result.text = cleanExtractedText(result.text);
    result.processingTimeMs = Math.round(performance.now() - start);

    return result;
  } catch (error) {
    console.error("Text extraction failed:", error);
    return {
      text: "",
      method: "fallback",
      confidence: 0,
      processingTimeMs: Math.round(performance.now() - start),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// PDF Extraction (pdfjs-dist)
// ─────────────────────────────────────────────────────────────

async function extractFromPDF(
  fileData: string,
  start: number
): Promise<ExtractionResult> {
  const binary = base64ToUint8Array(fileData);
  const pdf = await pdfjsLib.getDocument({ data: binary }).promise;
  const totalPages = pdf.numPages;
  const textChunks: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str || "")
      .join(" ");
    if (pageText.trim()) {
      textChunks.push(pageText);
    }
  }

  let fullText = textChunks.join("\n\n");
  let method: "pdf" | "ocr" | "fallback" = "pdf";

  // OCR Fallback for scanned/image-only PDFs
  if (fullText.trim().length < 100) {
    console.log(`[Extraction] PDF text length too short (${fullText.trim().length} chars). Attempting OCR fallback...`);
    try {
      const Tesseract = await import("tesseract.js");
      const ocrChunks: string[] = [];
      const pagesToProcess = Math.min(totalPages, 3); // Limit to first 3 pages for speed

      for (let i = 1; i <= pagesToProcess; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2.0 scale for better OCR
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (page.render as any)({ canvasContext: context, canvas, viewport }).promise;
          const dataUrl = canvas.toDataURL("image/png");
          
          console.log(`[Extraction] OCR processing page ${i}/${pagesToProcess}...`);
          const { data } = await Tesseract.recognize(dataUrl, "eng");
          ocrChunks.push(data.text);
        }
      }
      
      const ocrText = ocrChunks.join("\n\n").trim();
      if (ocrText.length > 50) {
        fullText = ocrText;
        method = "ocr";
        console.log(`[Extraction] OCR successful. Extracted ${fullText.length} chars.`);
      } else {
        console.log("[Extraction] OCR also yielded insufficient text.");
      }
    } catch (error) {
      console.error("PDF OCR fallback failed:", error);
    }
  }

  return {
    text: fullText,
    method,
    confidence: fullText.length > 50 ? 95 : fullText.length > 0 ? 70 : 10,
    pageCount: totalPages,
    processingTimeMs: Math.round(performance.now() - start),
  };
}

// ─────────────────────────────────────────────────────────────
// DOCX Extraction (JSZip)
// ─────────────────────────────────────────────────────────────

async function extractFromDOCX(
  fileData: string,
  start: number
): Promise<ExtractionResult> {
  const binary = base64ToUint8Array(fileData);
  const zip = await JSZip.loadAsync(binary);
  const docXml = await zip.file("word/document.xml")?.async("string");

  if (!docXml) {
    return {
      text: "",
      method: "docx",
      confidence: 0,
      processingTimeMs: Math.round(performance.now() - start),
    };
  }

  // Parse XML and extract text nodes from <w:t> elements
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, "application/xml");
  const textNodes = xmlDoc.getElementsByTagNameNS(
    "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "t"
  );

  const paragraphs: string[] = [];
  let currentParagraph = "";

  // Walk through all <w:t> text nodes
  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const text = node.textContent || "";

    // Check if this is a new paragraph (parent <w:p> changed)
    const pNode = findParentWithTag(node, "w:p");
    const prevPNode = i > 0 ? findParentWithTag(textNodes[i - 1], "w:p") : null;

    if (pNode !== prevPNode && currentParagraph) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = "";
    }

    currentParagraph += text;
  }

  if (currentParagraph.trim()) {
    paragraphs.push(currentParagraph.trim());
  }

  const fullText = paragraphs.join("\n");

  return {
    text: fullText,
    method: "docx",
    confidence: fullText.length > 50 ? 93 : fullText.length > 0 ? 65 : 5,
    processingTimeMs: Math.round(performance.now() - start),
  };
}

function findParentWithTag(node: Node, tagName: string): Node | null {
  let current: Node | null = node.parentNode;
  while (current) {
    if (current.nodeName === tagName) return current;
    current = current.parentNode;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Plain Text Extraction
// ─────────────────────────────────────────────────────────────

async function extractFromPlainText(
  fileData: string,
  start: number
): Promise<ExtractionResult> {
  let text: string;

  if (fileData.startsWith("data:")) {
    // Data URI — decode base64 portion
    const base64Part = fileData.split(",")[1] || "";
    text = decodeBase64ToString(base64Part);
  } else {
    text = decodeBase64ToString(fileData);
  }

  return {
    text,
    method: "plaintext",
    confidence: text.length > 10 ? 98 : 50,
    processingTimeMs: Math.round(performance.now() - start),
  };
}

// ─────────────────────────────────────────────────────────────
// Image OCR Extraction (Tesseract.js — loaded on demand)
// ─────────────────────────────────────────────────────────────

async function extractFromImage(
  fileData: string,
  start: number
): Promise<ExtractionResult> {
  try {
    // Dynamic import to keep the main bundle small
    const Tesseract = await import("tesseract.js");

    const imageUrl = fileData.startsWith("data:") ? fileData : `data:image/png;base64,${fileData}`;

    const { data } = await Tesseract.recognize(imageUrl, "eng", {
      logger: (info: any) => {
        if (info.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
        }
      },
    });

    return {
      text: data.text,
      method: "ocr",
      confidence: Math.round(data.confidence || 0),
      language: "en",
      processingTimeMs: Math.round(performance.now() - start),
    };
  } catch (error) {
    console.error("OCR extraction failed:", error);
    return {
      text: "",
      method: "ocr",
      confidence: 0,
      processingTimeMs: Math.round(performance.now() - start),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

/** Convert a base64 data URI or raw base64 to Uint8Array */
function base64ToUint8Array(dataUriOrBase64: string): Uint8Array {
  let base64 = dataUriOrBase64;
  if (base64.startsWith("data:")) {
    base64 = base64.split(",")[1] || "";
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/** Decode base64 to UTF-8 string */
function decodeBase64ToString(base64: string): string {
  try {
    const bytes = base64ToUint8Array(base64.startsWith("data:") ? base64 : `data:;base64,${base64}`);
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    try {
      return atob(base64);
    } catch {
      return "";
    }
  }
}

/** Clean up extracted text — normalize whitespace, remove control chars */
function cleanExtractedText(text: string): string {
  if (!text) return "";
  return text
    // Remove null bytes and other control characters (keep newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normalize multiple spaces
    .replace(/[ \t]+/g, " ")
    // Normalize multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    // Trim
    .trim();
}

/**
 * Generate a simple content hash for change detection.
 * Uses a fast DJB2-style hash on the first 5000 characters of text.
 */
export function generateContentHash(text: string): string {
  const sample = text.slice(0, 5000);
  let hash = 5381;
  for (let i = 0; i < sample.length; i++) {
    hash = ((hash << 5) + hash + sample.charCodeAt(i)) & 0xffffffff;
  }
  return `hash-${(hash >>> 0).toString(36)}-${text.length}`;
}
