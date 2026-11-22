"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const glossary_js_1 = require("./glossary.js");
(0, vitest_1.describe)("glossary.lookup", () => {
    (0, vitest_1.it)("returns a Hindi legal translation for a known English term", () => {
        (0, vitest_1.expect)(glossary_js_1.glossary.lookup("consideration", "hi")).toEqual({
            translation: "प्रतिफल",
            node_id: "ICA-1872/S-2",
        });
    });
    (0, vitest_1.it)("matches terms case-insensitively and trims surrounding whitespace", () => {
        (0, vitest_1.expect)(glossary_js_1.glossary.lookup("  CONSIDERATION  ", "hi")).toEqual({
            translation: "प्रतिफल",
            node_id: "ICA-1872/S-2",
        });
    });
    (0, vitest_1.it)("returns null for unknown terms", () => {
        (0, vitest_1.expect)(glossary_js_1.glossary.lookup("not-a-real-legal-term", "hi")).toBeNull();
    });
    (0, vitest_1.it)("returns null for English because the glossary is for Indic translation", () => {
        (0, vitest_1.expect)(glossary_js_1.glossary.lookup("consideration", "en")).toBeNull();
    });
});
(0, vitest_1.describe)("lookupGlossary", () => {
    (0, vitest_1.it)("keeps the translator-agent handoff working for term lookup", async () => {
        const result = await (0, glossary_js_1.lookupGlossary)({
            node_ids: [],
            target_language: "hi",
            terms: ["consideration"],
        });
        (0, vitest_1.expect)(result.glossary_available).toBe(true);
        (0, vitest_1.expect)(result.entries).toHaveLength(1);
        (0, vitest_1.expect)(result.entries[0]?.term_en).toBe("consideration");
        (0, vitest_1.expect)(result.entries[0]?.term_indic).toBe("प्रतिफल");
    });
});
//# sourceMappingURL=glossary.test.js.map