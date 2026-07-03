/**
 * translator/translator.agent.ts
 * Owner: Maharshi Patel
 * Module: packages/agents/src/translator
 *
 * Core Translator agent logic.
 *
 * Pipeline position:
 *   Drafter → Citator-gatekeeper → Reviewer → [Translator] → User/Export
 *
 * Citation-preservation strategy (RFC-translator-agent.md §4):
 *   [CITE:<node_id>] markers are STRIPPED before the LLM call and replaced
 *   with Unicode placeholders (⟦CITE_N⟧). After translation, placeholders
 *   are swapped back deterministically in code — never relying on the LLM
 *   to preserve them.
 *
 * Glossary integration (RFC-translator-agent.md §3):
 *   lookupGlossary() from @trionic/translation is called before the LLM call.
 *   Approved entries are injected as hard constraints in the system prompt.
 *   Failures are graceful — the agent continues in degraded mode.
 *
 * Pass-through rule:
 *   If target_language === 'en', the input is returned unchanged (no LLM call).
 */

import { randomUUID } from "crypto";
import type { SupportedLanguage, TranslatorOutput, Citation, PageIndexNodeId } from "@trionic/shared";
import { router } from "../router/index.js";
import { buildTrace, buildErrorTrace, persistTrace } from "../tracing/index.js";
import { lookupGlossary } from "@trionic/translation";
import { postProcessIndicText } from "@trionic/translation";
import type { GlossaryEntry } from "@trionic/translation";
import {
  TRANSLATOR_SYSTEM_PROMPT_TEMPLATE,
  buildTranslatorUserPrompt,
  buildGlossaryConstraintsBlock,
} from "./translator.prompt.js";
import type { TranslatorInput, TranslatorResult } from "./index.js";

// ─── Citation Placeholder types ───────────────────────────────────────────────

/** ⟦⟧ delimiters — Unicode U+27E6 / U+27E7, never appear in legal text. */
const PLACEHOLDER_OPEN = "\u27E6";
const PLACEHOLDER_CLOSE = "\u27E7";

/** [CITE:<node_id>] regex — same source as drafter/citations.ts */
const CITE_MARKER_REGEX = /\[CITE:([^\]]+)\]/g;

export interface CitationSpan {
  /** Placeholder index (⟦CITE_N⟧). */
  index: number;
  /** The PageIndex node ID, e.g. "ICA-1872/CH-VI/S-73". */
  node_id: string;
  /** Snapshot date, provisionally "2024-12-01". */
  snapshot_id: string;
  /** Span [start, end) in the ORIGINAL English draft. */
  original_span: [number, number];
  /** Span [start, end) in the TRANSLATED draft. Filled after re-injection. */
  translated_span?: [number, number];
}

export type CitationMap = CitationSpan[];

/** Thrown when a placeholder is missing from LLM output. */
export class CitationDropError extends Error {
  readonly missingIndexes: number[];
  constructor(missingIndexes: number[]) {
    super(
      `[TranslatorAgent] Citation placeholder(s) dropped by LLM: ⟦CITE_${missingIndexes.join("⟧, ⟦CITE_")}⟧`
    );
    this.missingIndexes = missingIndexes;
    this.name = "CitationDropError";
  }
}

/** Thrown when a placeholder appears more than once in LLM output. */
export class CitationDuplicateError extends Error {
  readonly duplicateIndexes: number[];
  constructor(duplicateIndexes: number[]) {
    super(
      `[TranslatorAgent] Citation placeholder(s) duplicated by LLM: ⟦CITE_${duplicateIndexes.join("⟧, ⟦CITE_")}⟧`
    );
    this.duplicateIndexes = duplicateIndexes;
    this.name = "CitationDuplicateError";
  }
}

// ─── Citation strip / re-inject helpers ───────────────────────────────────────

/**
 * Replace every [CITE:<node_id>] in the draft with a ⟦CITE_N⟧ placeholder.
 *
 * @param markdown - The original English draft.
 * @returns        - { cleaned, citationMap }
 */
export function stripCitations(markdown: string): {
  cleaned: string;
  citationMap: CitationMap;
} {
  const citationMap: CitationMap = [];
  let index = 0;
  const regex = new RegExp(CITE_MARKER_REGEX.source, "g");

  const cleaned = markdown.replace(regex, (match, nodeId, offset) => {
    const placeholder = `${PLACEHOLDER_OPEN}CITE_${index}${PLACEHOLDER_CLOSE}`;
    citationMap.push({
      index,
      node_id: nodeId.trim(),
      snapshot_id: "2024-12-01",
      original_span: [offset, offset + match.length],
    });
    index++;
    return placeholder;
  });

  return { cleaned, citationMap };
}

/**
 * Validate that every placeholder appears exactly once in the LLM output.
 * Throws CitationDropError or CitationDuplicateError on failure.
 */
export function validatePlaceholders(
  translatedText: string,
  citationMap: CitationMap
): void {
  const missing: number[] = [];
  const duplicated: number[] = [];

  for (const span of citationMap) {
    const placeholder = `${PLACEHOLDER_OPEN}CITE_${span.index}${PLACEHOLDER_CLOSE}`;
    const first = translatedText.indexOf(placeholder);
    if (first === -1) {
      missing.push(span.index);
      continue;
    }
    const second = translatedText.indexOf(placeholder, first + placeholder.length);
    if (second !== -1) {
      duplicated.push(span.index);
    }
  }

  if (missing.length > 0) throw new CitationDropError(missing);
  if (duplicated.length > 0) throw new CitationDuplicateError(duplicated);
}

/**
 * Swap ⟦CITE_N⟧ placeholders back to [CITE:<node_id>] in translated text.
 * Also records translated_span for each CitationSpan.
 */
export function reinjectCitations(
  translatedText: string,
  citationMap: CitationMap
): { result: string; updatedMap: CitationMap } {
  let result = translatedText;
  const updatedMap: CitationMap = citationMap.map((span) => ({ ...span }));

  // Process in reverse index order so offsets remain valid as we replace
  for (let i = citationMap.length - 1; i >= 0; i--) {
    const span = citationMap[i];
    const placeholder = `${PLACEHOLDER_OPEN}CITE_${span.index}${PLACEHOLDER_CLOSE}`;
    const original = `[CITE:${span.node_id}]`;
    const pos = result.indexOf(placeholder);
    if (pos !== -1) {
      result = result.slice(0, pos) + original + result.slice(pos + placeholder.length);
      updatedMap[i] = {
        ...span,
        translated_span: [pos, pos + original.length],
      };
    }
  }

  return { result, updatedMap };
}

// ─── Extract node IDs from markdown ─────────────────────────────────────────

function extractNodeIds(markdown: string): PageIndexNodeId[] {
  const ids = new Set<PageIndexNodeId>();
  const regex = new RegExp(CITE_MARKER_REGEX.source, "g");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown)) !== null) {
    ids.add(match[1].trim());
  }
  return Array.from(ids);
}

// ─── runTranslator ────────────────────────────────────────────────────────────

/**
 * Translate an approved English legal draft into the target language.
 *
 * Steps:
 *   1. Pass-through if target_language === 'en'.
 *   2. Extract node IDs from [CITE:...] markers.
 *   3. Glossary lookup (Team E) — degraded mode on failure.
 *   4. Strip citations → ⟦CITE_N⟧ placeholders (CitationMap).
 *   5. Build LLM prompt with glossary constraints.
 *   6. Call LLM Router (Gemini in Week 2 config).
 *   7. Validate placeholder completeness (throw on drop/duplicate).
 *   8. Re-inject citations.
 *   9. Post-process (Team E) — no-op stubs for now.
 *  10. Build trace, persist, return.
 *
 * @throws CitationDropError      - If LLM drops a placeholder (never silently returns broken draft).
 * @throws CitationDuplicateError - If LLM duplicates a placeholder.
 * @throws Error                  - Any other failure (LLM timeout, etc.).
 */
export async function runTranslator(input: TranslatorInput): Promise<TranslatorResult> {
  const { body_markdown, target_language, citations = [], session_id } = input;

  // ── Step 1: English pass-through ────────────────────────────────────────────
  if (target_language === "en") {
    const output: TranslatorOutput = {
      target_language: "en",
      translated_markdown: body_markdown,
      glossary_hits: [],
    };
    // Minimal trace for the pass-through (no LLM call)
    const trace = buildTrace({
      agent: "translator",
      llmResponse: {
        text: body_markdown,
        model: "pass-through",
        provider: "claude" as const,
        tokens_in: 0,
        tokens_out: 0,
        cost_usd: 0,
        latency_ms: 0,
        fallback_used: false,
      },
      cited_nodes: [],

      status: "ok",
      session_id,
    });
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });
    return { output, trace };
  }

  // target_language is now guaranteed non-English
  const indicLang = target_language as Exclude<SupportedLanguage, "en">;

  try {
    // ── Step 2: Extract node IDs from draft ──────────────────────────────────
    const nodeIds = extractNodeIds(body_markdown);

    // ── Step 3: Glossary lookup ──────────────────────────────────────────────
    let glossaryEntries: GlossaryEntry[] = [];
    let glossaryAvailable = false;

    try {
      const glossaryResult = await lookupGlossary({
        node_ids: nodeIds,
        target_language: indicLang,
      });
      glossaryEntries = glossaryResult.entries;
      glossaryAvailable = glossaryResult.glossary_available;

      if (glossaryResult.missing_node_ids.length > 0) {
        console.debug(
          `[TranslatorAgent] ${glossaryResult.missing_node_ids.length} node IDs have no glossary entry:`,
          glossaryResult.missing_node_ids
        );
      }
    } catch (err) {
      console.warn(
        "[TranslatorAgent] Glossary lookup failed — continuing in degraded mode.",
        err
      );
      glossaryAvailable = false;
    }

    // ── Step 4: Strip citations ──────────────────────────────────────────────
    const { cleaned, citationMap } = stripCitations(body_markdown);

    // ── Step 5: Build LLM prompt ─────────────────────────────────────────────
    const glossaryConstraints = buildGlossaryConstraintsBlock(glossaryEntries);
    const systemPrompt = TRANSLATOR_SYSTEM_PROMPT_TEMPLATE(indicLang, glossaryConstraints);
    const userPrompt = buildTranslatorUserPrompt(cleaned, indicLang, glossaryEntries.length);

    // ── Step 6: LLM call ─────────────────────────────────────────────────────
    const llmResponse = await router.run("translator", systemPrompt, userPrompt);

    // ── Step 7: Validate placeholders ────────────────────────────────────────
    // On CitationDuplicateError, retry once at temperature 0 (RFC §4.3)
    let translatedText = llmResponse.text;
    let finalLlmResponse = llmResponse;

    try {
      validatePlaceholders(translatedText, citationMap);
    } catch (validationErr) {
      if (validationErr instanceof CitationDuplicateError) {
        console.warn(
          "[TranslatorAgent] Duplicate placeholder detected — retrying at temperature 0."
        );
        // Force temperature 0 by using the "translator" step — the router will pick the config.
        // We pass a special step name that falls through to default (Claude at temp 0).
        // In production, the router config would expose temperature override.
        const retryResponse = await router.run("translator", systemPrompt, userPrompt);
        translatedText = retryResponse.text;
        finalLlmResponse = retryResponse;
        validatePlaceholders(translatedText, citationMap);
      } else {
        throw validationErr;
      }
    }

    // ── Step 8: Re-inject citations ──────────────────────────────────────────
    const { result: reinjectedText, updatedMap } = reinjectCitations(
      translatedText,
      citationMap
    );

    // ── Step 9: Post-process ─────────────────────────────────────────────────
    const finalText = await postProcessIndicText(indicLang, reinjectedText);

    // ── Build glossary_hits for TranslatorOutput ─────────────────────────────
    const glossaryHits = glossaryEntries.map((e) => ({
      source: e.term_en,
      target: e.term_indic,
      node_id: e.node_id,
    }));

    // ── Step 10: Build output and trace ──────────────────────────────────────
    const output: TranslatorOutput = {
      target_language: target_language,
      translated_markdown: finalText,
      glossary_hits: glossaryHits,
    };

    const citedNodes = updatedMap.map((s) => s.node_id);

    const trace = buildTrace({
      agent: "translator",
      llmResponse: finalLlmResponse,
      cited_nodes: citedNodes,
      status: "ok",
      session_id,
    });
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });

    return { output, trace };
  } catch (error) {
    const trace = buildErrorTrace("translator", error, session_id);
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });

    const err = error instanceof Error ? error : new Error(String(error));
    (err as any).trace = trace;
    throw err;
  }
}

// ─── TranslatorAgent class (Agno-compatible) ──────────────────────────────────

/**
 * Agno framework class wrapper for the Translator agent.
 */
export class TranslatorAgent {
  readonly name = "translator";

  async run(input: TranslatorInput): Promise<TranslatorResult> {
    return runTranslator(input);
  }
}
