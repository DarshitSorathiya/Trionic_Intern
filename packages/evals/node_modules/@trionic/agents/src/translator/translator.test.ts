/**
 * translator/translator.test.ts
 * Owner: Maharshi Patel
 * Module: packages/agents/src/translator
 *
 * Unit + integration tests for the Translator agent.
 * All LLM, tracing, and glossary calls are mocked — no real API calls in CI.
 *
 * Key acceptance criteria tested (Issue #51):
 *   ✅ [CITE:<node_id>] markers MUST survive translation
 *   ✅ target_language === 'en' passes through unchanged (no LLM call)
 *   ✅ glossary_hits populated from lookup result
 *   ✅ TranslatorOutput shape matches @trionic/shared
 *   ✅ CitationDropError thrown when LLM drops a placeholder
 *   ✅ Error trace on LLM failure
 *
 * Run: pnpm --filter @trionic/agents test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock declarations (hoisted — must not reference any const defined below) ─

vi.mock("../router/index.js", () => ({
  router: {
    run: vi.fn(),
  },
}));

vi.mock("../tracing/index.js", () => ({
  buildTrace: vi.fn((input) => ({
    agent: input.agent,
    model: input.llmResponse.model,
    tokens_in: input.llmResponse.tokens_in,
    tokens_out: input.llmResponse.tokens_out,
    cost_usd: input.llmResponse.cost_usd,
    latency_ms: input.llmResponse.latency_ms,
    cited_nodes: input.cited_nodes,
    status: input.status,
    timestamp: new Date().toISOString(),
    session_id: input.session_id,
  })),
  buildErrorTrace: vi.fn((agent, error, session_id) => ({
    agent,
    model: "unknown",
    tokens_in: 0,
    tokens_out: 0,
    cost_usd: 0,
    latency_ms: 0,
    cited_nodes: [],
    status: "error",
    error_message: String(error),
    timestamp: new Date().toISOString(),
    session_id,
  })),
  persistTrace: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@trionic/translation", () => ({
  lookupGlossary: vi.fn(),
  postProcessIndicText: vi.fn(async (_lang: string, text: string) => text),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import {
  runTranslator,
  TranslatorAgent,
  stripCitations,
  validatePlaceholders,
  reinjectCitations,
  CitationDropError,
  CitationDuplicateError,
} from "./translator.agent.js";
import type { TranslatorInput } from "./index.js";
import type { TranslatorOutput } from "@trionic/shared";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * 200-word English RTI draft with [CITE:...] markers.
 * This is the demo-gate fixture: translate to Hindi, verify all markers survive.
 */
const RTI_DRAFT_EN = `---
**AI-generated draft — not legal advice.** This document was produced by Trionic Adalat to assist with drafting only. It is not a substitute for advice from a qualified legal professional. Verify all citations and facts before use.
---

## Right to Information Application

### I. Applicant Details

The applicant, [FULL NAME], residing at [ADDRESS], hereby submits this application under the Right to Information Act, 2005 [CITE:RTI-2005/S-6].

### II. Information Sought

The applicant seeks the following information from [PUBLIC AUTHORITY NAME], which is a public authority within the meaning of Section 2(h) of the RTI Act [CITE:RTI-2005/S-2]:

1. Details of all contracts awarded above Rs. 10 lakhs in the financial year 2023-24.
2. Copies of inspection reports for the period 2022-23 to 2023-24.
3. Status of pending complaints received in the last 12 months.

### III. Fee and Exemption

The prescribed application fee of Rs. 10 has been deposited. The applicant is entitled to receive the requested information within thirty days [CITE:RTI-2005/S-7]. If the information is denied, the applicant shall prefer a first appeal under Section 19(1) of the Act [CITE:RTI-2005/S-19].

### IV. Declaration

The applicant is a citizen of India and declares that the information sought is not covered under Section 8 of the RTI Act [CITE:RTI-2005/S-8].

[FULL NAME]  
Date: [DATE]`;

/** Simulated Hindi translation of the RTI draft — ALL ⟦CITE_N⟧ placeholders preserved. */
const RTI_DRAFT_HI_FROM_LLM = `---
**AI-द्वारा उत्पन्न मसौदा — यह कानूनी सलाह नहीं है।** यह दस्तावेज़ Trionic Adalat द्वारा केवल मसौदा तैयार करने में सहायता के लिए बनाया गया है। यह किसी योग्य कानूनी पेशेवर की सलाह का विकल्प नहीं है। उपयोग से पहले सभी उद्धरणों और तथ्यों की जांच करें।
---

## सूचना का अधिकार आवेदन

### I. आवेदक का विवरण

आवेदक, [FULL NAME], [ADDRESS] में निवास करते हुए, सूचना का अधिकार अधिनियम, 2005 के अंतर्गत यह आवेदन प्रस्तुत करते हैं ⟦CITE_0⟧।

### II. मांगी गई सूचना

आवेदक [PUBLIC AUTHORITY NAME] से निम्नलिखित सूचना मांगते हैं, जो RTI अधिनियम की धारा 2(h) के अर्थ में एक लोक प्राधिकारी है ⟦CITE_1⟧:

1. वित्तीय वर्ष 2023-24 में 10 लाख रुपए से अधिक के सभी अनुबंधों का विवरण।
2. 2022-23 से 2023-24 की अवधि की निरीक्षण रिपोर्टों की प्रतियां।
3. पिछले 12 महीनों में प्राप्त लंबित शिकायतों की स्थिति।

### III. शुल्क और छूट

निर्धारित आवेदन शुल्क 10 रुपए जमा किया गया है। आवेदक तीस दिनों के भीतर मांगी गई सूचना प्राप्त करने का अधिकार रखते हैं ⟦CITE_2⟧। यदि सूचना अस्वीकार की जाती है, तो आवेदक अधिनियम की धारा 19(1) के तहत प्रथम अपील करेंगे ⟦CITE_3⟧।

### IV. घोषणा

आवेदक भारत के नागरिक हैं और घोषणा करते हैं कि मांगी गई सूचना RTI अधिनियम की धारा 8 के अंतर्गत नहीं आती ⟦CITE_4⟧।

[FULL NAME]  
दिनांक: [DATE]`;

const MOCK_LLM_RESPONSE = {
  text: RTI_DRAFT_HI_FROM_LLM,
  model: "gemini-1.5-pro",
  tokens_in: 850,
  tokens_out: 920,
  cost_usd: 0.0012,
  latency_ms: 2300,
};

/** 5+ glossary hits to satisfy the demo gate (≥5 legal-term replacements). */
const MOCK_GLOSSARY_RESULT = {
  entries: [
    { id: "hi-rti-2005-public-authority", term_en: "public authority", term_indic: "लोक प्राधिकारी", language: "hi" as const, node_id: "RTI-2005/S-2", status: "approved" as const },
    { id: "hi-rti-2005-information", term_en: "information", term_indic: "सूचना", language: "hi" as const, node_id: "RTI-2005/S-2", status: "approved" as const },
    { id: "hi-rti-2005-applicant", term_en: "applicant", term_indic: "आवेदक", language: "hi" as const, node_id: "RTI-2005/S-6", status: "approved" as const },
    { id: "hi-rti-2005-appeal", term_en: "appeal", term_indic: "अपील", language: "hi" as const, node_id: "RTI-2005/S-19", status: "approved" as const },
    { id: "hi-general-notice", term_en: "notice", term_indic: "नोटिस", language: "hi" as const, status: "approved" as const },
    { id: "hi-procedure-jurisdiction", term_en: "jurisdiction", term_indic: "अधिकार-क्षेत्र", language: "hi" as const, status: "approved" as const },
  ],
  missing_node_ids: [],
  missing_terms: [],
  glossary_available: true,
};

const mockHiInput: TranslatorInput = {
  body_markdown: RTI_DRAFT_EN,
  target_language: "hi",
  citations: [],
  session_id: "test-session-translator-001",
};

const mockEnInput: TranslatorInput = {
  body_markdown: RTI_DRAFT_EN,
  target_language: "en",
  citations: [],
  session_id: "test-session-translator-002",
};

// ─── Tests: Citation utility functions ────────────────────────────────────────

describe("stripCitations()", () => {
  it("replaces all [CITE:<node_id>] markers with ⟦CITE_N⟧ placeholders", () => {
    const { cleaned, citationMap } = stripCitations(RTI_DRAFT_EN);
    expect(cleaned).not.toMatch(/\[CITE:[^\]]+\]/);
    expect(cleaned).toContain("\u27E6CITE_0\u27E7");
    expect(citationMap).toHaveLength(5); // RTI draft has 5 citations
  });

  it("records the correct node_id for each CitationSpan", () => {
    const { citationMap } = stripCitations(RTI_DRAFT_EN);
    expect(citationMap[0].node_id).toBe("RTI-2005/S-6");
    expect(citationMap[1].node_id).toBe("RTI-2005/S-2");
    expect(citationMap[2].node_id).toBe("RTI-2005/S-7");
    expect(citationMap[3].node_id).toBe("RTI-2005/S-19");
    expect(citationMap[4].node_id).toBe("RTI-2005/S-8");
  });

  it("assigns sequential indexes starting from 0", () => {
    const { citationMap } = stripCitations(RTI_DRAFT_EN);
    citationMap.forEach((span, i) => {
      expect(span.index).toBe(i);
    });
  });

  it("returns empty citationMap and unchanged text when no markers present", () => {
    const plain = "This is free prose with no legal claims.";
    const { cleaned, citationMap } = stripCitations(plain);
    expect(cleaned).toBe(plain);
    expect(citationMap).toHaveLength(0);
  });
});

describe("validatePlaceholders()", () => {
  const { citationMap } = stripCitations(RTI_DRAFT_EN);

  it("passes when all placeholders appear exactly once", () => {
    expect(() =>
      validatePlaceholders(RTI_DRAFT_HI_FROM_LLM, citationMap)
    ).not.toThrow();
  });

  it("throws CitationDropError when a placeholder is missing", () => {
    const brokenText = RTI_DRAFT_HI_FROM_LLM.replace("\u27E6CITE_2\u27E7", ""); // drop CITE_2
    expect(() => validatePlaceholders(brokenText, citationMap)).toThrowError(CitationDropError);
  });

  it("throws CitationDuplicateError when a placeholder appears twice", () => {
    const dupText = RTI_DRAFT_HI_FROM_LLM + " extra \u27E6CITE_0\u27E7"; // duplicate CITE_0
    expect(() => validatePlaceholders(dupText, citationMap)).toThrowError(CitationDuplicateError);
  });

  it("passes trivially when citationMap is empty", () => {
    expect(() => validatePlaceholders("No citations at all.", [])).not.toThrow();
  });
});

describe("reinjectCitations()", () => {
  it("[CITATION PRESERVATION TEST] all [CITE:<node_id>] markers survive the strip→translate→reinject round-trip", () => {
    // This is the key acceptance criterion from Issue #51
    const { cleaned, citationMap } = stripCitations(RTI_DRAFT_EN);

    // Simulate: LLM returns translated text with placeholders intact
    const simulatedTranslation = RTI_DRAFT_HI_FROM_LLM;

    // Validate (would throw if any placeholder dropped)
    validatePlaceholders(simulatedTranslation, citationMap);

    // Re-inject
    const { result } = reinjectCitations(simulatedTranslation, citationMap);

    // All original [CITE:...] markers must be present in final output
    const originalMarkers = RTI_DRAFT_EN.match(/\[CITE:[^\]]+\]/g) ?? [];
    expect(originalMarkers.length).toBeGreaterThan(0);

    for (const marker of originalMarkers) {
      expect(result).toContain(marker);
    }

    // No placeholders should remain
    expect(result).not.toMatch(/\u27E6CITE_\d+\u27E7/);
  });

  it("records translated_span for each re-injected citation", () => {
    const { citationMap } = stripCitations(RTI_DRAFT_EN);
    const { updatedMap } = reinjectCitations(RTI_DRAFT_HI_FROM_LLM, citationMap);

    updatedMap.forEach((span) => {
      expect(span.translated_span).toBeDefined();
      expect(span.translated_span![0]).toBeGreaterThanOrEqual(0);
      expect(span.translated_span![1]).toBeGreaterThan(span.translated_span![0]);
    });
  });
});

// ─── Tests: runTranslator() ───────────────────────────────────────────────────

describe("runTranslator()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns TranslatorOutput with correct shape for Hindi translation", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);

    const result = await runTranslator(mockHiInput);

    expect(result).toHaveProperty("output");
    expect(result).toHaveProperty("trace");
    expect(result.output.target_language).toBe("hi");
    expect(result.output.translated_markdown).toBeTruthy();
    expect(Array.isArray(result.output.glossary_hits)).toBe(true);
  });

  it("[CITE MARKERS SURVIVE] all [CITE:<node_id>] markers present in translated output", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);

    const result = await runTranslator(mockHiInput);

    // All original [CITE:...] markers from the English draft must appear in the Hindi output
    const originalMarkers = RTI_DRAFT_EN.match(/\[CITE:[^\]]+\]/g) ?? [];
    expect(originalMarkers.length).toBe(5);

    for (const marker of originalMarkers) {
      expect(result.output.translated_markdown).toContain(marker);
    }
  });

  it("[DEMO GATE] glossary_hits shows at least 5 legal-term replacements for RTI→Hindi", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);

    const result = await runTranslator(mockHiInput);

    expect(result.output.glossary_hits.length).toBeGreaterThanOrEqual(5);
    // Each hit has source and target
    result.output.glossary_hits.forEach((hit) => {
      expect(hit.source).toBeTruthy();
      expect(hit.target).toBeTruthy();
    });
  });

  it("[EN PASS-THROUGH] target_language === 'en' returns input unchanged with no LLM call", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");

    const result = await runTranslator(mockEnInput);

    expect(result.output.target_language).toBe("en");
    expect(result.output.translated_markdown).toBe(RTI_DRAFT_EN);
    expect(result.output.glossary_hits).toHaveLength(0);

    // LLM should NOT be called for English pass-through
    expect(vi.mocked(router.run)).not.toHaveBeenCalled();
    // Glossary should NOT be called for English pass-through
    expect(vi.mocked(lookupGlossary)).not.toHaveBeenCalled();
  });

  it("calls glossary.lookup before the LLM call", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    let lookupCalledBeforeRouter = false;

    vi.mocked(router.run).mockImplementation(async (..._args) => {
      // At this point, lookup should have already been called
      expect(vi.mocked(lookupGlossary)).toHaveBeenCalled();
      lookupCalledBeforeRouter = true;
      return MOCK_LLM_RESPONSE;
    });
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);

    await runTranslator(mockHiInput);
    expect(lookupCalledBeforeRouter).toBe(true);
  });

  it("glossary_hits contains source/target/node_id from lookup entries", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);

    const result = await runTranslator(mockHiInput);

    const hits = result.output.glossary_hits;
    const applicantHit = hits.find((h) => h.source === "applicant");
    expect(applicantHit).toBeDefined();
    expect(applicantHit!.target).toBe("आवेदक");
    expect(applicantHit!.node_id).toBe("RTI-2005/S-6");
  });

  it("continues in degraded mode when glossary lookup fails", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);
    vi.mocked(lookupGlossary).mockRejectedValueOnce(new Error("Glossary service down"));

    // Should NOT throw — degraded mode
    const result = await runTranslator(mockHiInput);
    expect(result.output.glossary_hits).toHaveLength(0);
    expect(result.output.translated_markdown).toContain("[CITE:RTI-2005/S-6]");
  });

  it("throws CitationDropError when LLM drops a placeholder", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);

    // Return a response with CITE_2 dropped
    const brokenLLMText = RTI_DRAFT_HI_FROM_LLM.replace("\u27E6CITE_2\u27E7", "");
    vi.mocked(router.run).mockResolvedValue({ ...MOCK_LLM_RESPONSE, text: brokenLLMText });

    await expect(runTranslator(mockHiInput)).rejects.toThrowError(CitationDropError);
  });

  it("writes an error trace and re-throws when LLM fails", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);
    vi.mocked(router.run).mockRejectedValueOnce(new Error("Gemini timeout"));

    const { buildErrorTrace, persistTrace } = await import("../tracing/index.js");

    await expect(runTranslator(mockHiInput)).rejects.toThrow("Gemini timeout");
    expect(vi.mocked(buildErrorTrace)).toHaveBeenCalledWith(
      "translator",
      expect.any(Error),
      mockHiInput.session_id
    );
    expect(vi.mocked(persistTrace)).toHaveBeenCalled();
  });

  it("trace.agent is 'translator'", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);

    const result = await runTranslator(mockHiInput);
    expect(result.trace.agent).toBe("translator");
  });

  it("trace.cited_nodes includes all node IDs from the original draft", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);

    const result = await runTranslator(mockHiInput);

    expect(result.trace.cited_nodes).toContain("RTI-2005/S-6");
    expect(result.trace.cited_nodes).toContain("RTI-2005/S-2");
    expect(result.trace.cited_nodes).toContain("RTI-2005/S-7");
    expect(result.trace.cited_nodes).toContain("RTI-2005/S-19");
    expect(result.trace.cited_nodes).toContain("RTI-2005/S-8");
  });

  it("calls postProcessIndicText after re-injection", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary, postProcessIndicText } = await import("@trionic/translation");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);

    await runTranslator(mockHiInput);
    expect(vi.mocked(postProcessIndicText)).toHaveBeenCalledWith(
      "hi",
      expect.stringContaining("[CITE:RTI-2005/S-6]")
    );
  });
});

// ─── Tests: TranslatorAgent class ─────────────────────────────────────────────

describe("TranslatorAgent class", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has name === 'translator'", () => {
    const agent = new TranslatorAgent();
    expect(agent.name).toBe("translator");
  });

  it("run() returns a valid TranslatorResult for Hindi", async () => {
    const { router } = await import("../router/index.js");
    const { lookupGlossary } = await import("@trionic/translation");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);
    vi.mocked(lookupGlossary).mockResolvedValue(MOCK_GLOSSARY_RESULT);

    const agent = new TranslatorAgent();
    const result = await agent.run(mockHiInput);

    expect(result.output.target_language).toBe("hi");
    expect(result.trace.status).toBe("ok");
    expect(result.output.translated_markdown).toContain("[CITE:RTI-2005/S-6]");
  });

  it("run() passes through English without calling LLM", async () => {
    const { router } = await import("../router/index.js");

    const agent = new TranslatorAgent();
    const result = await agent.run(mockEnInput);

    expect(result.output.translated_markdown).toBe(RTI_DRAFT_EN);
    expect(vi.mocked(router.run)).not.toHaveBeenCalled();
  });
});
