/**
 * Hindi legal glossary utilities for Team E.
 *
 * Public surfaces:
 * - glossary.lookup(term, lang): simple Week-2 acceptance API.
 * - lookupGlossary(input): richer Translator Agent handoff used by Maharshi.
 */

import type { PageIndexNodeId, SnapshotId, SupportedLanguage } from "@trionic/shared";
import { readFileSync } from "fs";
import { join } from "path";

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

const glossaryCache = new Map<IndicLanguage, GlossaryEntry[]>();

function readJsonFile(fileName: string): GlossaryEntry[] {
  const dataDir = join(__dirname, "..", "data");
  const filePath = join(dataDir, fileName);
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as GlossaryEntry[];
}

function loadGlossary(language: IndicLanguage): GlossaryEntry[] {
  if (glossaryCache.has(language)) {
    return glossaryCache.get(language)!;
  }

  try {
    const data = readJsonFile(`glossary.${language}.json`);
    glossaryCache.set(language, data);
    return data;
  } catch {
    console.warn(
      `[translation/glossary] No glossary file found for language "${language}". ` +
        "Running in degraded mode - no glossary constraints will be applied."
    );
    glossaryCache.set(language, []);
    return [];
  }
}

function normalizeTerm(term: string): string {
  return term.trim().toLowerCase();
}

function lookupTerm(
  term: string,
  language: SupportedLanguage
): GlossaryTermLookupResult | null {
  if (language === "en") {
    return null;
  }

  const normalizedTerm = normalizeTerm(term);
  if (!normalizedTerm) {
    return null;
  }

  const match = loadGlossary(language).find(
    (entry) => normalizeTerm(entry.term_en) === normalizedTerm
  );

  if (!match) {
    return null;
  }

  return {
    translation: match.term_indic,
    node_id: match.node_id,
  };
}

export const glossary = {
  lookup: lookupTerm,
};

/**
 * Look up glossary entries for the given citation nodes and/or terms.
 *
 * Called by the Translator Agent before the LLM translation call.
 * Never throws; returns glossary_available=false on any error.
 */
export async function lookupGlossary(
  input: GlossaryLookupInput
): Promise<GlossaryLookupResult> {
  try {
    const allEntries = loadGlossary(input.target_language);

    if (allEntries.length === 0) {
      return {
        entries: [],
        missing_node_ids: input.node_ids,
        missing_terms: input.terms ?? [],
        glossary_available: false,
      };
    }

    const matched = new Map<string, GlossaryEntry>();

    const inputNodeSet = new Set(input.node_ids);
    const matchedNodeIds = new Set<string>();

    for (const entry of allEntries) {
      if (entry.node_id && inputNodeSet.has(entry.node_id)) {
        matched.set(entry.id, entry);
        matchedNodeIds.add(entry.node_id);
      }
    }

    const matchedTerms = new Set<string>();
    if (input.terms && input.terms.length > 0) {
      const lowerTerms = input.terms.map(normalizeTerm);
      for (const entry of allEntries) {
        const idx = lowerTerms.indexOf(normalizeTerm(entry.term_en));
        if (idx >= 0) {
          matched.set(entry.id, entry);
          matchedTerms.add(input.terms[idx]);
        }
      }
    }

    if (input.domain) {
      for (const entry of allEntries) {
        if (entry.domain === input.domain && entry.status === "approved") {
          matched.set(entry.id, entry);
        }
      }
    }

    const missing_node_ids = input.node_ids.filter((id) => !matchedNodeIds.has(id));
    const missing_terms = (input.terms ?? []).filter((term) => !matchedTerms.has(term));

    return {
      entries: Array.from(matched.values()),
      missing_node_ids,
      missing_terms,
      glossary_available: true,
    };
  } catch (error) {
    console.error("[translation/glossary] lookupGlossary failed:", error);
    return {
      entries: [],
      missing_node_ids: input.node_ids,
      missing_terms: input.terms ?? [],
      glossary_available: false,
    };
  }
}
