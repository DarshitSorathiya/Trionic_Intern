"use strict";
/**
 * Hindi legal glossary utilities for Team E.
 *
 * Public surfaces:
 * - glossary.lookup(term, lang): simple Week-2 acceptance API.
 * - lookupGlossary(input): richer Translator Agent handoff used by Maharshi.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.glossary = void 0;
exports.lookupGlossary = lookupGlossary;
const fs_1 = require("fs");
const path_1 = require("path");
const glossaryCache = new Map();
function readJsonFile(fileName) {
    const dataDir = (0, path_1.join)(__dirname, "..", "data");
    const filePath = (0, path_1.join)(dataDir, fileName);
    const raw = (0, fs_1.readFileSync)(filePath, "utf-8");
    return JSON.parse(raw);
}
function loadGlossary(language) {
    if (glossaryCache.has(language)) {
        return glossaryCache.get(language);
    }
    try {
        const data = readJsonFile(`glossary.${language}.json`);
        glossaryCache.set(language, data);
        return data;
    }
    catch {
        console.warn(`[translation/glossary] No glossary file found for language "${language}". ` +
            "Running in degraded mode - no glossary constraints will be applied.");
        glossaryCache.set(language, []);
        return [];
    }
}
function normalizeTerm(term) {
    return term.trim().toLowerCase();
}
function lookupTerm(term, language) {
    if (language === "en") {
        return null;
    }
    const normalizedTerm = normalizeTerm(term);
    if (!normalizedTerm) {
        return null;
    }
    const match = loadGlossary(language).find((entry) => normalizeTerm(entry.term_en) === normalizedTerm);
    if (!match) {
        return null;
    }
    return {
        translation: match.term_indic,
        node_id: match.node_id,
    };
}
exports.glossary = {
    lookup: lookupTerm,
};
/**
 * Look up glossary entries for the given citation nodes and/or terms.
 *
 * Called by the Translator Agent before the LLM translation call.
 * Never throws; returns glossary_available=false on any error.
 */
async function lookupGlossary(input) {
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
        const matched = new Map();
        const inputNodeSet = new Set(input.node_ids);
        const matchedNodeIds = new Set();
        for (const entry of allEntries) {
            if (entry.node_id && inputNodeSet.has(entry.node_id)) {
                matched.set(entry.id, entry);
                matchedNodeIds.add(entry.node_id);
            }
        }
        const matchedTerms = new Set();
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
    }
    catch (error) {
        console.error("[translation/glossary] lookupGlossary failed:", error);
        return {
            entries: [],
            missing_node_ids: input.node_ids,
            missing_terms: input.terms ?? [],
            glossary_available: false,
        };
    }
}
//# sourceMappingURL=glossary.js.map