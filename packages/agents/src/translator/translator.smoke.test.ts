/**
 * translator/translator.smoke.test.ts
 * Owner: Maharshi Patel
 * Issue: #186 — Translator idle in W3 + glossary handoff smoke test (W3)
 *
 * W3 Smoke tests. Unlike translator.test.ts, these tests:
 *   1. Do NOT mock @trionic/translation — they call lookupGlossary() against
 *      the REAL glossary.hi.json on disk (Megh's file).
 *   2. Verify the EN pass-through path end-to-end with real module resolution.
 *   3. Verify graceful degraded mode for languages without a glossary file yet
 *      (Marathi, Gujarati — scaffold stubs expected in packages/translation/data/).
 *
 * Why a separate file from translator.test.ts?
 *   translator.test.ts mocks @trionic/translation to isolate agent logic.
 *   These smoke tests un-mock it to verify the HANDOFF between Maharshi's agent
 *   and Megh's glossary package. They exercise the real disk I/O path.
 *
 * Acceptance criteria (Issue #186):
 *   ✅ Translator `--target-language en` path is a passthrough (returns input unchanged)
 *   ✅ glossary.lookup actually returns real entries from glossary.hi.json
 *   ✅ Smoke: 200-word RTI → Hindi → all [CITE:...] present → log glossary_hits
 *   ✅ Marathi/Gujarati graceful degradation (scaffold handoff for @0604-swara / @Swar-107)
 *
 * Run: pnpm --filter @trionic/agents test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Partial mocks: LLM + tracing only — @trionic/translation is REAL ─────────

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

// NOTE: @trionic/translation is intentionally NOT mocked here.
// lookupGlossary() will read the real glossary.hi.json from disk.

// ─── Imports ──────────────────────────────────────────────────────────────────

import { runTranslator } from "./translator.agent.js";
import type { TranslatorInput } from "./index.js";
import { lookupGlossary } from "@trionic/translation";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * The canonical 200-word English RTI draft from the W3 issue.
 * 5 [CITE:...] markers — all must survive translation.
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

/**
 * Simulated Hindi LLM output — all ⟦CITE_N⟧ placeholders preserved.
 * (LLM is mocked; only glossary is real in these smoke tests.)
 */
const RTI_DRAFT_HI_FROM_LLM = `---
**AI-द्वारा उत्पन्न मसौदा — यह कानूनी सलाह नहीं है।** यह दस्तावेज़ Trionic Adalat द्वारा केवल मसौदा तैयार करने में सहायता के लिए बनाया गया है। यह किसी योग्य कानूनी पेशेवर की सलाह का विकल्प नहीं है। उपयोग से पहले सभी उद्धरणों और तथ्यों की जांच करें।
---

## सूचना का अधिकार आवेदन

### I. आवेदक का विवरण

आवेदक, [FULL NAME], [ADDRESS] में निवास करते हुए, सूचना का अधिकार अधिनियम, 2005 के अंतर्गत यह आवेदन प्रस्तुत करते हैं \u27E6CITE_0\u27E7।

### II. मांगी गई सूचना

आवेदक [PUBLIC AUTHORITY NAME] से निम्नलिखित सूचना मांगते हैं, जो RTI अधिनियम की धारा 2(h) के अर्थ में एक लोक प्राधिकारी है \u27E6CITE_1\u27E7:

1. वित्तीय वर्ष 2023-24 में 10 लाख रुपए से अधिक के सभी अनुबंधों का विवरण।
2. 2022-23 से 2023-24 की अवधि की निरीक्षण रिपोर्टों की प्रतियां।
3. पिछले 12 महीनों में प्राप्त लंबित शिकायतों की स्थिति।

### III. शुल्क और छूट

निर्धारित आवेदन शुल्क 10 रुपए जमा किया गया है। आवेदक तीस दिनों के भीतर मांगी गई सूचना प्राप्त करने का अधिकार रखते हैं \u27E6CITE_2\u27E7। यदि सूचना अस्वीकार की जाती है, तो आवेदक अधिनियम की धारा 19(1) के तहत प्रथम अपील करेंगे \u27E6CITE_3\u27E7।

### IV. घोषणा

आवेदक भारत के नागरिक हैं और घोषणा करते हैं कि मांगी गई सूचना RTI अधिनियम की धारा 8 के अंतर्गत नहीं आती \u27E6CITE_4\u27E7।

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

// ─── W3 Smoke Test Suite ──────────────────────────────────────────────────────

describe("[W3 SMOKE] Translator EN pass-through — real module path", () => {
  /**
   * Verifies the EN pass-through returns input unchanged.
   * No LLM call, no glossary call, no mocking needed for this check.
   */
  it("[AC1] target_language 'en' returns input markdown unchanged", async () => {
    const { router } = await import("../router/index.js");

    const input: TranslatorInput = {
      body_markdown: RTI_DRAFT_EN,
      target_language: "en",
      citations: [],
      session_id: "w3-smoke-en-passthrough",
    };

    const result = await runTranslator(input);

    // Output === input, byte-for-byte
    expect(result.output.translated_markdown).toBe(RTI_DRAFT_EN);
    expect(result.output.target_language).toBe("en");
    expect(result.output.glossary_hits).toHaveLength(0);

    // No LLM call must be made
    expect(vi.mocked(router.run)).not.toHaveBeenCalled();
  });

  it("[AC1] EN pass-through preserves all [CITE:...] markers without processing", async () => {
    const input: TranslatorInput = {
      body_markdown: RTI_DRAFT_EN,
      target_language: "en",
      citations: [],
      session_id: "w3-smoke-en-cite-check",
    };

    const result = await runTranslator(input);

    const originalMarkers = RTI_DRAFT_EN.match(/\[CITE:[^\]]+\]/g) ?? [];
    expect(originalMarkers).toHaveLength(5);

    for (const marker of originalMarkers) {
      expect(result.output.translated_markdown).toContain(marker);
    }
  });
});

// ─── W3 Smoke: Real Glossary Handoff (no @trionic/translation mock) ───────────

describe("[W3 SMOKE] Glossary handoff — real glossary.hi.json (Megh's file)", () => {
  /**
   * Calls lookupGlossary() directly against the real disk file.
   * Verifies the handoff between Maharshi's agent and Megh's glossary package.
   *
   * Issue #186 AC2: "Translator's glossary.lookup call to @trionic/translation
   * actually returns real entries from Megh's glossary.hi.json"
   */
  it("[AC2] lookupGlossary returns real entries for RTI-2005 node IDs from disk", async () => {
    const result = await lookupGlossary({
      node_ids: ["RTI-2005/S-6", "RTI-2005/S-2"],
      target_language: "hi",
    });

    // File loaded successfully
    expect(result.glossary_available).toBe(true);

    // At least the two RTI node-matched entries must come back
    expect(result.entries.length).toBeGreaterThanOrEqual(2);

    // Verify known real entries from glossary.hi.json
    const termMap = new Map(result.entries.map((e) => [e.term_en, e.term_indic]));

    // RTI-2005/S-6 → applicant → आवेदक
    expect(termMap.get("applicant")).toBe("आवेदक");

    // RTI-2005/S-2 → public authority → लोक प्राधिकारी
    expect(termMap.get("public authority")).toBe("लोक प्राधिकारी");

    // RTI-2005/S-2 → information → सूचना
    expect(termMap.get("information")).toBe("सूचना");

    console.log(
      `[W3 SMOKE] glossary_hits from real glossary.hi.json (${result.entries.length} entries):`,
      result.entries.map((e) => `${e.term_en} → ${e.term_indic}`)
    );
  });

  it("[AC2] lookupGlossary returns all 4 RTI node IDs that have entries in the file", async () => {
    // RTI-2005 node IDs that are in the draft
    const rtiNodeIds = [
      "RTI-2005/S-6",  // applicant
      "RTI-2005/S-2",  // public authority, information
      "RTI-2005/S-7",  // (no entry in seed file — should be in missing_node_ids)
      "RTI-2005/S-19", // appeal
      "RTI-2005/S-8",  // (no entry in seed file — should be in missing_node_ids)
    ];

    const result = await lookupGlossary({
      node_ids: rtiNodeIds,
      target_language: "hi",
    });

    expect(result.glossary_available).toBe(true);

    // We know from glossary.hi.json that S-6, S-2, S-19 have entries
    const returnedNodeIds = result.entries.map((e) => e.node_id).filter(Boolean);
    expect(returnedNodeIds).toContain("RTI-2005/S-6");
    expect(returnedNodeIds).toContain("RTI-2005/S-2");
    expect(returnedNodeIds).toContain("RTI-2005/S-19");

    // S-7 and S-8 have no entries → must be in missing_node_ids
    expect(result.missing_node_ids).toContain("RTI-2005/S-7");
    expect(result.missing_node_ids).toContain("RTI-2005/S-8");
  });

  it("[AC2] domain fallback returns approved RTI-domain entries even with no node IDs", async () => {
    const result = await lookupGlossary({
      node_ids: [],
      target_language: "hi",
      domain: "rti",
    });

    expect(result.glossary_available).toBe(true);
    // RTI domain entries exist (public authority, information, applicant, appeal)
    expect(result.entries.length).toBeGreaterThanOrEqual(4);

    const terms = result.entries.map((e) => e.term_en);
    expect(terms).toContain("public authority");
    expect(terms).toContain("applicant");
    expect(terms).toContain("information");
    expect(terms).toContain("appeal");
  });

  it("[AC2] no duplicate entries returned for node that maps to multiple terms", async () => {
    // RTI-2005/S-2 has both "public authority" and "information" pointing to it
    const result = await lookupGlossary({
      node_ids: ["RTI-2005/S-2"],
      target_language: "hi",
    });

    // Check deduplication: each entry id should appear only once
    const ids = result.entries.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ─── W3 Smoke: Full Pipeline Smoke Test (real glossary + mocked LLM) ──────────

describe("[W3 SMOKE] Full pipeline — RTI 200-word draft → Hindi (real glossary, mocked LLM)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Issue #186 AC3: "Smoke test: translate a 200-word English RTI draft →
   * Hindi → all [CITE:...] markers present in output → log glossary_hits"
   *
   * This uses the REAL glossary (reads disk) but mocks the LLM call.
   * The translator runs its full pipeline: extract node IDs → real lookup →
   * strip citations → (mocked) LLM → validate → reinject → post-process.
   */
  it("[AC3] RTI draft → Hindi: all 5 [CITE:...] markers present in output", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);

    const input: TranslatorInput = {
      body_markdown: RTI_DRAFT_EN,
      target_language: "hi",
      citations: [],
      session_id: "w3-smoke-rti-hindi",
    };

    const result = await runTranslator(input);

    // All 5 original [CITE:...] markers must be in the Hindi output
    const originalMarkers = RTI_DRAFT_EN.match(/\[CITE:[^\]]+\]/g) ?? [];
    expect(originalMarkers).toHaveLength(5);

    for (const marker of originalMarkers) {
      expect(result.output.translated_markdown).toContain(marker);
    }

    // No placeholders must remain
    expect(result.output.translated_markdown).not.toMatch(/\u27E6CITE_\d+\u27E7/);

    console.log(
      `[W3 SMOKE AC3] glossary_hits (${result.output.glossary_hits.length} entries):`,
      result.output.glossary_hits.map((h) => `${h.source} → ${h.target}`)
    );
  });

  it("[AC3] glossary_hits populated from REAL lookup — contains known RTI legal terms", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);

    const input: TranslatorInput = {
      body_markdown: RTI_DRAFT_EN,
      target_language: "hi",
      citations: [],
      session_id: "w3-smoke-glossary-hits",
    };

    const result = await runTranslator(input);

    // Real glossary returns entries for RTI-2005/S-6 and RTI-2005/S-2 and RTI-2005/S-19
    expect(result.output.glossary_hits.length).toBeGreaterThanOrEqual(3);

    const hitSources = result.output.glossary_hits.map((h) => h.source);
    expect(hitSources).toContain("applicant");
    expect(hitSources).toContain("public authority");

    // Every hit must have a non-empty source and target
    for (const hit of result.output.glossary_hits) {
      expect(hit.source).toBeTruthy();
      expect(hit.target).toBeTruthy();
    }
  });

  it("[AC3] trace.cited_nodes includes all 5 RTI node IDs from draft", async () => {
    const { router } = await import("../router/index.js");
    vi.mocked(router.run).mockResolvedValue(MOCK_LLM_RESPONSE);

    const input: TranslatorInput = {
      body_markdown: RTI_DRAFT_EN,
      target_language: "hi",
      citations: [],
      session_id: "w3-smoke-trace-nodes",
    };

    const result = await runTranslator(input);

    expect(result.trace.cited_nodes).toContain("RTI-2005/S-6");
    expect(result.trace.cited_nodes).toContain("RTI-2005/S-2");
    expect(result.trace.cited_nodes).toContain("RTI-2005/S-7");
    expect(result.trace.cited_nodes).toContain("RTI-2005/S-19");
    expect(result.trace.cited_nodes).toContain("RTI-2005/S-8");
  });
});

// ─── W3 Bonus: Marathi / Gujarati Glossary Scaffold Handoff ──────────────────

describe("[W5] Marathi/Gujarati glossary now seeded — lookups available", () => {
  /**
   * The mr/gu glossaries scaffolded in Week 3 have since been seeded by the
   * content owners (@0604-swara / @Swar-107), so lookups now report
   * glossary_available: true. Individual nodes may still be missing where the
   * glossary has not yet been filled in for that specific citation.
   */
  it("[W5] Marathi (mr) glossary is available; unseeded node reported as missing", async () => {
    const result = await lookupGlossary({
      node_ids: ["RTI-2005/S-6"],
      target_language: "mr",
    });

    // Glossary file is now populated → available.
    expect(result.glossary_available).toBe(true);
    // mr has no entry for this RTI node yet → surfaced via missing_node_ids.
    expect(result.missing_node_ids).toContain("RTI-2005/S-6");
  });

  it("[W5] Gujarati (gu) glossary is available and resolves a seeded RTI node", async () => {
    const result = await lookupGlossary({
      node_ids: ["RTI-2005/S-6"],
      target_language: "gu",
    });

    // Glossary file is now populated → available.
    expect(result.glossary_available).toBe(true);
    // gu has been seeded for this RTI node → resolved, not missing.
    expect(result.entries.length).toBeGreaterThan(0);
    expect(result.missing_node_ids).not.toContain("RTI-2005/S-6");
  });

  it("[W5] Hindi lookup still works correctly alongside Marathi/Gujarati", async () => {
    // Regression: seeding mr/gu must not corrupt the hi cache.
    const [hiResult, mrResult, guResult] = await Promise.all([
      lookupGlossary({ node_ids: ["RTI-2005/S-6"], target_language: "hi" }),
      lookupGlossary({ node_ids: ["RTI-2005/S-6"], target_language: "mr" }),
      lookupGlossary({ node_ids: ["RTI-2005/S-6"], target_language: "gu" }),
    ]);

    expect(hiResult.glossary_available).toBe(true);
    expect(hiResult.entries.some((e) => e.term_en === "applicant")).toBe(true);

    expect(mrResult.glossary_available).toBe(true);
    expect(guResult.glossary_available).toBe(true);
  });
});
