import { describe, expect, it } from "vitest";

import { glossary, lookupGlossary } from "./glossary.js";

describe("glossary.lookup", () => {
  it("returns a Hindi legal translation for a known English term", () => {
    expect(glossary.lookup("consideration", "hi")).toEqual({
      translation: "प्रतिफल",
      node_id: "ICA-1872/S-2",
    });
  });

  it("matches terms case-insensitively and trims surrounding whitespace", () => {
    expect(glossary.lookup("  CONSIDERATION  ", "hi")).toEqual({
      translation: "प्रतिफल",
      node_id: "ICA-1872/S-2",
    });
  });

  it("returns null for unknown terms", () => {
    expect(glossary.lookup("not-a-real-legal-term", "hi")).toBeNull();
  });

  it("returns null for English because the glossary is for Indic translation", () => {
    expect(glossary.lookup("consideration", "en")).toBeNull();
  });
});

describe("lookupGlossary", () => {
  it("keeps the translator-agent handoff working for term lookup", async () => {
    const result = await lookupGlossary({
      node_ids: [],
      target_language: "hi",
      terms: ["consideration"],
    });

    expect(result.glossary_available).toBe(true);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]?.term_en).toBe("consideration");
    expect(result.entries[0]?.term_indic).toBe("प्रतिफल");
  });
});
