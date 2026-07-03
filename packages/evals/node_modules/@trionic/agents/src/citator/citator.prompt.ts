import type { DocumentDraft } from "@trionic/shared";

export const CITATOR_SYSTEM_PROMPT = `You are the Citator Gatekeeper. Your job is to validate every citation found in the provided document draft. Respond ONLY with strict JSON matching the schema described in the user instructions. Do not provide any additional explanatory text.`;

/**
 * Build the user prompt passed to the LLM for citation validation.
 * The prompt enforces a strict JSON-only response with an example schema.
 */
export function buildCitatorUserPrompt(draft: DocumentDraft): string {
  const example = {
    passed: true,
    validatedCitations: [
      {
        node_id: "ICA-1872/CH-VI/S-73",
        snapshot_id: "2024-12-01",
        span: [12, 34]
      }
    ],
    rejection_reason: undefined
  };

  return (
    `Validate every citation present in the following draft. ` +
    `You must return a single JSON object (no markdown, no backticks, no commentary) with the following fields:\n\n` +
    `- passed: boolean — true if ALL citations are valid and the draft may proceed; false if any citation fails validation.\n` +
    `- validatedCitations: array of objects matching the Citation type { node_id, snapshot_id, span } — include all validated citations when passed=true.\n` +
    `- rejection_reason: optional string explaining why validation failed (required when passed=false).\n\n` +
    `Draft (metadata + content):\n` +
    JSON.stringify(draft, null, 2) +
    `\n\nExample valid output (strict JSON):\n` +
    JSON.stringify(example, null, 2) +
    `\n\nRemember: return EXACTLY one JSON object that can be parsed by JSON.parse().`
  );
}
