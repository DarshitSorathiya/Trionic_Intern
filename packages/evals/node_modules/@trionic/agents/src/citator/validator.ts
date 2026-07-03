import type { Citation, DocumentDraft } from "@trionic/shared";

export type ValidationResult = {
  valid: boolean;
  reason?: string;
  validatedCitations: Citation[];
};

/**
 * Perform lightweight sanity checks on citations returned by the LLM.
 * - Ensures basic shape
 * - Ensures spans are two numbers in-range for the draft content (if provided)
 * - Ensures node_id and snapshot_id are non-empty strings
 */
export function validateCitationsSanity(
  citations: unknown,
  draft?: DocumentDraft
): ValidationResult {
  if (!Array.isArray(citations)) {
    return { valid: false, reason: "validatedCitations must be an array", validatedCitations: [] };
  }

  const contentLength = draft?.content?.length ?? null;
  const validated: Citation[] = [];

  for (const c of citations as any[]) {
    if (typeof c !== "object" || c === null) {
      return { valid: false, reason: "each citation must be an object", validatedCitations: [] };
    }

    const { node_id, snapshot_id, span } = c as Citation;

    if (typeof node_id !== "string" || node_id.trim() === "") {
      return { valid: false, reason: "citation.node_id must be a non-empty string", validatedCitations: [] };
    }
    if (typeof snapshot_id !== "string" || snapshot_id.trim() === "") {
      return { valid: false, reason: "citation.snapshot_id must be a non-empty string", validatedCitations: [] };
    }
    if (!Array.isArray(span) || span.length !== 2) {
      return { valid: false, reason: "citation.span must be an array of two numbers", validatedCitations: [] };
    }

    const [start, end] = span;
    if (typeof start !== "number" || typeof end !== "number" || Number.isNaN(start) || Number.isNaN(end)) {
      return { valid: false, reason: "citation.span values must be numbers", validatedCitations: [] };
    }
    if (start < 0 || end < 0) {
      return { valid: false, reason: "citation.span must be non-negative", validatedCitations: [] };
    }
    if (end < start) {
      return { valid: false, reason: "citation.span end must be >= start", validatedCitations: [] };
    }
    if (contentLength !== null && (start > contentLength || end > contentLength)) {
      return { valid: false, reason: "citation.span out of bounds for draft content", validatedCitations: [] };
    }

    // Passed basic checks — coerce shape into Citation and collect
    validated.push({ node_id: node_id as string, snapshot_id: snapshot_id as string, span: [start, end] });
  }

  // Check duplicates of identical node+span
  const seen = new Set<string>();
  for (const c of validated) {
    const key = `${c.node_id}::${c.span[0]}::${c.span[1]}`;
    if (seen.has(key)) {
      return { valid: false, reason: "duplicate citations detected", validatedCitations: [] };
    }
    seen.add(key);
  }

  return { valid: true, validatedCitations: validated };
}
