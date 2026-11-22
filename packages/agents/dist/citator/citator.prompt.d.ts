import type { DocumentDraft } from "@trionic/shared";
export declare const CITATOR_SYSTEM_PROMPT = "You are the Citator Gatekeeper. Your job is to validate every citation found in the provided document draft. Respond ONLY with strict JSON matching the schema described in the user instructions. Do not provide any additional explanatory text.";
/**
 * Build the user prompt passed to the LLM for citation validation.
 * The prompt enforces a strict JSON-only response with an example schema.
 */
export declare function buildCitatorUserPrompt(draft: DocumentDraft): string;
//# sourceMappingURL=citator.prompt.d.ts.map