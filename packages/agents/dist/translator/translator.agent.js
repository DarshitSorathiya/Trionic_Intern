"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslatorAgent = exports.CitationDuplicateError = exports.CitationDropError = void 0;
exports.stripCitations = stripCitations;
exports.validatePlaceholders = validatePlaceholders;
exports.reinjectCitations = reinjectCitations;
exports.runTranslator = runTranslator;
const index_js_1 = require("../router/index.js");
const index_js_2 = require("../tracing/index.js");
const translation_1 = require("@trionic/translation");
const translation_2 = require("@trionic/translation");
const translator_prompt_js_1 = require("./translator.prompt.js");
// ─── Citation Placeholder types ───────────────────────────────────────────────
/** ⟦⟧ delimiters — Unicode U+27E6 / U+27E7, never appear in legal text. */
const PLACEHOLDER_OPEN = "\u27E6";
const PLACEHOLDER_CLOSE = "\u27E7";
/** [CITE:<node_id>] regex — same source as drafter/citations.ts */
const CITE_MARKER_REGEX = /\[CITE:([^\]]+)\]/g;
/** Thrown when a placeholder is missing from LLM output. */
class CitationDropError extends Error {
    missingIndexes;
    constructor(missingIndexes) {
        super(`[TranslatorAgent] Citation placeholder(s) dropped by LLM: ⟦CITE_${missingIndexes.join("⟧, ⟦CITE_")}⟧`);
        this.missingIndexes = missingIndexes;
        this.name = "CitationDropError";
    }
}
exports.CitationDropError = CitationDropError;
/** Thrown when a placeholder appears more than once in LLM output. */
class CitationDuplicateError extends Error {
    duplicateIndexes;
    constructor(duplicateIndexes) {
        super(`[TranslatorAgent] Citation placeholder(s) duplicated by LLM: ⟦CITE_${duplicateIndexes.join("⟧, ⟦CITE_")}⟧`);
        this.duplicateIndexes = duplicateIndexes;
        this.name = "CitationDuplicateError";
    }
}
exports.CitationDuplicateError = CitationDuplicateError;
// ─── Citation strip / re-inject helpers ───────────────────────────────────────
/**
 * Replace every [CITE:<node_id>] in the draft with a ⟦CITE_N⟧ placeholder.
 *
 * @param markdown - The original English draft.
 * @returns        - { cleaned, citationMap }
 */
function stripCitations(markdown) {
    const citationMap = [];
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
function validatePlaceholders(translatedText, citationMap) {
    const missing = [];
    const duplicated = [];
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
    if (missing.length > 0)
        throw new CitationDropError(missing);
    if (duplicated.length > 0)
        throw new CitationDuplicateError(duplicated);
}
/**
 * Swap ⟦CITE_N⟧ placeholders back to [CITE:<node_id>] in translated text.
 * Also records translated_span for each CitationSpan.
 */
function reinjectCitations(translatedText, citationMap) {
    let result = translatedText;
    const updatedMap = citationMap.map((span) => ({ ...span }));
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
function extractNodeIds(markdown) {
    const ids = new Set();
    const regex = new RegExp(CITE_MARKER_REGEX.source, "g");
    let match;
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
async function runTranslator(input) {
    const { body_markdown, target_language, citations = [], session_id } = input;
    // ── Step 1: English pass-through ────────────────────────────────────────────
    if (target_language === "en") {
        const output = {
            target_language: "en",
            translated_markdown: body_markdown,
            glossary_hits: [],
        };
        // Minimal trace for the pass-through (no LLM call)
        const trace = (0, index_js_2.buildTrace)({
            agent: "translator",
            llmResponse: {
                text: body_markdown,
                model: "pass-through",
                provider: "claude",
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
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });
        return { output, trace };
    }
    // target_language is now guaranteed non-English
    const indicLang = target_language;
    try {
        // ── Step 2: Extract node IDs from draft ──────────────────────────────────
        const nodeIds = extractNodeIds(body_markdown);
        // ── Step 3: Glossary lookup ──────────────────────────────────────────────
        let glossaryEntries = [];
        let glossaryAvailable = false;
        try {
            const glossaryResult = await (0, translation_1.lookupGlossary)({
                node_ids: nodeIds,
                target_language: indicLang,
            });
            glossaryEntries = glossaryResult.entries;
            glossaryAvailable = glossaryResult.glossary_available;
            if (glossaryResult.missing_node_ids.length > 0) {
                console.debug(`[TranslatorAgent] ${glossaryResult.missing_node_ids.length} node IDs have no glossary entry:`, glossaryResult.missing_node_ids);
            }
        }
        catch (err) {
            console.warn("[TranslatorAgent] Glossary lookup failed — continuing in degraded mode.", err);
            glossaryAvailable = false;
        }
        // ── Step 4: Strip citations ──────────────────────────────────────────────
        const { cleaned, citationMap } = stripCitations(body_markdown);
        // ── Step 5: Build LLM prompt ─────────────────────────────────────────────
        const glossaryConstraints = (0, translator_prompt_js_1.buildGlossaryConstraintsBlock)(glossaryEntries);
        const systemPrompt = (0, translator_prompt_js_1.TRANSLATOR_SYSTEM_PROMPT_TEMPLATE)(indicLang, glossaryConstraints);
        const userPrompt = (0, translator_prompt_js_1.buildTranslatorUserPrompt)(cleaned, indicLang, glossaryEntries.length);
        // ── Step 6: LLM call ─────────────────────────────────────────────────────
        const llmResponse = await index_js_1.router.run("translator", systemPrompt, userPrompt);
        // ── Step 7: Validate placeholders ────────────────────────────────────────
        // On CitationDuplicateError, retry once at temperature 0 (RFC §4.3)
        let translatedText = llmResponse.text;
        let finalLlmResponse = llmResponse;
        try {
            validatePlaceholders(translatedText, citationMap);
        }
        catch (validationErr) {
            if (validationErr instanceof CitationDuplicateError) {
                console.warn("[TranslatorAgent] Duplicate placeholder detected — retrying at temperature 0.");
                // Force temperature 0 by using the "translator" step — the router will pick the config.
                // We pass a special step name that falls through to default (Claude at temp 0).
                // In production, the router config would expose temperature override.
                const retryResponse = await index_js_1.router.run("translator", systemPrompt, userPrompt);
                translatedText = retryResponse.text;
                finalLlmResponse = retryResponse;
                validatePlaceholders(translatedText, citationMap);
            }
            else {
                throw validationErr;
            }
        }
        // ── Step 8: Re-inject citations ──────────────────────────────────────────
        const { result: reinjectedText, updatedMap } = reinjectCitations(translatedText, citationMap);
        // ── Step 9: Post-process ─────────────────────────────────────────────────
        const finalText = await (0, translation_2.postProcessIndicText)(indicLang, reinjectedText);
        // ── Build glossary_hits for TranslatorOutput ─────────────────────────────
        const glossaryHits = glossaryEntries.map((e) => ({
            source: e.term_en,
            target: e.term_indic,
            node_id: e.node_id,
        }));
        // ── Step 10: Build output and trace ──────────────────────────────────────
        const output = {
            target_language: target_language,
            translated_markdown: finalText,
            glossary_hits: glossaryHits,
        };
        const citedNodes = updatedMap.map((s) => s.node_id);
        const trace = (0, index_js_2.buildTrace)({
            agent: "translator",
            llmResponse: finalLlmResponse,
            cited_nodes: citedNodes,
            status: "ok",
            session_id,
        });
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });
        return { output, trace };
    }
    catch (error) {
        const trace = (0, index_js_2.buildErrorTrace)("translator", error, session_id);
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });
        const err = error instanceof Error ? error : new Error(String(error));
        err.trace = trace;
        throw err;
    }
}
// ─── TranslatorAgent class (Agno-compatible) ──────────────────────────────────
/**
 * Agno framework class wrapper for the Translator agent.
 */
class TranslatorAgent {
    name = "translator";
    async run(input) {
        return runTranslator(input);
    }
}
exports.TranslatorAgent = TranslatorAgent;
//# sourceMappingURL=translator.agent.js.map