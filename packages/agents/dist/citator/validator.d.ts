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
export declare function validateCitationsSanity(citations: unknown, draft?: DocumentDraft): ValidationResult;
//# sourceMappingURL=validator.d.ts.map