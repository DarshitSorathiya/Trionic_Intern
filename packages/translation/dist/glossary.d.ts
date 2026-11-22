/**
 * Hindi legal glossary utilities for Team E.
 *
 * Public surfaces:
 * - glossary.lookup(term, lang): simple Week-2 acceptance API.
 * - lookupGlossary(input): richer Translator Agent handoff used by Maharshi.
 */
import type { PageIndexNodeId, SnapshotId, SupportedLanguage } from "@trionic/shared";
export type IndicLanguage = Exclude<SupportedLanguage, "en">;
export type GlossaryStatus = "approved" | "needs_review" | "deprecated";
export interface GlossaryEntry {
    id: string;
    term_en: string;
    term_indic: string;
    language: IndicLanguage;
    node_id?: PageIndexNodeId;
    snapshot_id?: SnapshotId;
    act_code?: string;
    domain?: "contract" | "consumer" | "rti" | "employment" | "procedure" | "general";
    status: GlossaryStatus;
    notes?: string;
}
export interface GlossaryLookupInput {
    node_ids: PageIndexNodeId[];
    target_language: IndicLanguage;
    terms?: string[];
    domain?: GlossaryEntry["domain"];
}
export interface GlossaryLookupResult {
    entries: GlossaryEntry[];
    missing_node_ids: PageIndexNodeId[];
    missing_terms: string[];
    glossary_available: boolean;
}
export interface GlossaryTermLookupResult {
    translation: string;
    node_id?: PageIndexNodeId;
}
declare function lookupTerm(term: string, language: SupportedLanguage): GlossaryTermLookupResult | null;
export declare const glossary: {
    lookup: typeof lookupTerm;
};
/**
 * Look up glossary entries for the given citation nodes and/or terms.
 *
 * Called by the Translator Agent before the LLM translation call.
 * Never throws; returns glossary_available=false on any error.
 */
export declare function lookupGlossary(input: GlossaryLookupInput): Promise<GlossaryLookupResult>;
export {};
//# sourceMappingURL=glossary.d.ts.map