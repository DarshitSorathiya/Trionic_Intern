/**
 * reviewer/reviewer.test.ts
 * Owner: Evan Gregor
 * Module: packages/agents/src/reviewer
 *
 * Unit tests for the Reviewer agent (W3 — Issue #185):
 *   - checkBanner()          — exact-string banner matching
 *   - checkCompleteness()    — deterministic fallback
 *   - checkCompletenessLLM() — LLM-scored semantic section detection
 *   - requiredSections()     — public API for required sections list
 *   - runReviewer()          — full agent flow with 2 mocked LLM calls
 *   - ReviewerAgent          — class wrapper delegation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { DocumentDraft } from "@trionic/shared";

// ─── Mocks (hoisted by vitest before any imports) ─────────────────────────────

// Mock router to avoid network calls
vi.mock("../router/index.js", () => ({
  router: {
    run: vi.fn(),
  },
}));

// Mock tracing to capture traces without real persistence
vi.mock("../tracing/index.js", () => ({
  buildTrace: vi.fn((input) => ({
    agent: input.agent,
    model: input.llmResponse?.model ?? "unknown",
    tokens_in: input.llmResponse?.tokens_in ?? 0,
    tokens_out: input.llmResponse?.tokens_out ?? 0,
    cost_usd: input.llmResponse?.cost_usd ?? 0,
    latency_ms: input.llmResponse?.latency_ms ?? 0,
    cited_nodes: input.cited_nodes ?? [],
    status: input.status,
    timestamp: new Date().toISOString(),
    session_id: input.session_id,
    error_message: input.error_message,
  })),
  buildErrorTrace: vi.fn((agent, error) => ({
    agent,
    model: "unknown",
    tokens_in: 0,
    tokens_out: 0,
    cost_usd: 0,
    latency_ms: 0,
    cited_nodes: [],
    status: "error",
    error_message: error instanceof Error ? error.message : String(error),
    timestamp: new Date().toISOString(),
  })),
  persistTrace: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@trionic/translation", () => ({
  glossary: {
    lookup: vi.fn(),
  },
}));

// Import after mocks are hoisted
import {
  checkBanner,
  checkCompleteness,
  checkCompletenessLLM,
  requiredSections,
  runReviewer,
  ReviewerAgent,
  REQUIRED_SECTIONS,
} from "./index.js";

const { router } = await import("../router/index.js");

// ─── Test fixtures ────────────────────────────────────────────────────────────

const BANNER =
  `---\n**AI-generated draft \u2014 not legal advice.** This document was produced by ` +
  `Trionic Adalat to assist with drafting only. It is not a substitute for advice ` +
  `from a qualified legal professional. Verify all citations and facts before use.\n---`;

const COMPLETE_RTI_BODY = `# Application under the Right to Information Act, 2005

## Address

To,
The Public Information Officer
Municipal Corporation Office
Ahmedabad, Gujarat

## Subject

Request for information regarding municipal budget allocation for ward 42.

## Information Sought

1. Total budget allocated to ward 42 for financial year 2025-2026.
2. Details of infrastructure projects approved under this budget. [CITE:RTI-2005/S-6]

## Declaration

I, the undersigned, declare that I am a citizen of India and the information sought
does not fall within the restrictions set out in Section 8 of the RTI Act, 2005. [CITE:RTI-2005/S-8]

## Date and Signature

Date: 2026-06-01
Signature: _______________________
Name: Applicant Name`;

const COMPLETE_RTI_DRAFT = BANNER + "\n\n" + COMPLETE_RTI_BODY;

const INCOMPLETE_RTI_DRAFT =
  BANNER +
  "\n\n" +
  `# RTI Application

## Address

To, The Public Information Officer

## Subject

Request for information regarding ward records.`;

const NO_BANNER_RTI_DRAFT = COMPLETE_RTI_BODY;

/** Helper to create a DocumentDraft fixture. */
function makeDraft(
  content: string,
  docType: DocumentDraft["document_type"] = "rti_application"
): DocumentDraft {
  return {
    id: "test-draft-id",
    document_type: docType,
    language: "en",
    content,
    citations: [],
    traces: [],
    created_at: new Date().toISOString(),
  };
}

/** Mock LLM response: tone is clean. */
const MOCK_LLM_TONE_PASS = {
  text: JSON.stringify({ tone_issues: [] }),
  model: "gemini-1.5-pro",
  provider: "gemini",
  tokens_in: 100,
  tokens_out: 20,
  cost_usd: 0.001,
  latency_ms: 500,
  fallback_used: false,
};

/** Mock LLM response: tone issues detected. */
const MOCK_LLM_TONE_FAIL = {
  text: JSON.stringify({
    tone_issues: [
      "Informal greeting: 'Hey' is not appropriate for a legal document",
      "Guarantee: 'You will definitely win this case' is a prohibited guarantee of outcome",
    ],
  }),
  model: "gemini-1.5-pro",
  provider: "gemini",
  tokens_in: 100,
  tokens_out: 40,
  cost_usd: 0.002,
  latency_ms: 600,
  fallback_used: false,
};

/** Mock LLM response: all sections found. */
const MOCK_LLM_SECTIONS_ALL_FOUND = {
  text: JSON.stringify({
    sections: {
      "Address": "found",
      "Subject": "found",
      "Information Sought": "found",
      "Declaration": "found",
      "Date and Signature": "found",
    },
  }),
  model: "gemini-1.5-pro",
  provider: "gemini",
  tokens_in: 200,
  tokens_out: 50,
  cost_usd: 0.002,
  latency_ms: 400,
  fallback_used: false,
};

/** Mock LLM response: some sections missing. */
const MOCK_LLM_SECTIONS_PARTIAL = {
  text: JSON.stringify({
    sections: {
      "Address": "found",
      "Subject": "found",
      "Information Sought": "missing",
      "Declaration": "missing",
      "Date and Signature": "missing",
    },
  }),
  model: "gemini-1.5-pro",
  provider: "gemini",
  tokens_in: 200,
  tokens_out: 50,
  cost_usd: 0.002,
  latency_ms: 400,
  fallback_used: false,
};

/** Mock LLM response: semantic equivalents detected. */
const MOCK_LLM_SECTIONS_SEMANTIC = {
  text: JSON.stringify({
    sections: {
      "Address": "found",
      "Subject": "found",
      "Information Sought": "found", // e.g. matched "Details Requested"
      "Declaration": "found",
      "Date and Signature": "found",
    },
  }),
  model: "gemini-1.5-pro",
  provider: "gemini",
  tokens_in: 200,
  tokens_out: 50,
  cost_usd: 0.002,
  latency_ms: 400,
  fallback_used: false,
};

/** Mock LLM response: invalid JSON (forces deterministic fallback). */
const MOCK_LLM_INVALID_JSON = {
  text: `[GEMINI STUB] Mock response for prompt: "Check sections..."`,
  model: "gemini-1.5-pro",
  provider: "gemini",
  tokens_in: 0,
  tokens_out: 0,
  cost_usd: 0,
  latency_ms: 50,
  fallback_used: false,
};

// ─── Reset mocks between tests ───────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── requiredSections() ───────────────────────────────────────────────────────

describe("requiredSections()", () => {
  it("returns 5 sections for rti_application including Date and Signature", () => {
    const sections = requiredSections("rti_application");
    expect(sections).toEqual([
      "Address",
      "Subject",
      "Information Sought",
      "Declaration",
      "Date and Signature",
    ]);
    expect(sections).toHaveLength(5);
  });

  it("returns correct arrays for non-RTI doc types", () => {
    expect(requiredSections("legal_notice")).toEqual(["Parties", "Cause of Action", "Demand and Relief", "Timeline", "Governing Law"]);
    expect(requiredSections("nda")).toEqual(["Parties", "Definitions", "Confidential Information", "Obligations", "Term and Termination", "Governing Law", "Signatures"]);
    expect(requiredSections("consumer_complaint")).toEqual(["Complainant Details", "Opposite Party", "Facts of Transaction", "Deficiency of Service", "Relief Sought", "Jurisdiction"]);
    expect(requiredSections("cheque_bounce_notice")).toEqual(["Drawer Details", "Payee Details", "Cheque Details", "Dishonour Details", "Demand for Payment", "Legal Warning"]);
  });
});

// ─── checkBanner() — exact-string match ───────────────────────────────────────

describe("checkBanner()", () => {
  it("returns true when exact banner text is present", () => {
    expect(checkBanner(COMPLETE_RTI_DRAFT, "en")).toBe(true);
  });

  it("returns false when banner is missing", () => {
    expect(checkBanner(NO_BANNER_RTI_DRAFT, "en")).toBe(false);
  });

  it("returns false for a hyphen instead of em-dash (exact-string enforcement)", () => {
    const draft = "**AI-generated draft - not legal advice.** Some text here...";
    expect(checkBanner(draft, "en")).toBe(false);
  });

  it("returns false for en-dash instead of em-dash (exact-string enforcement)", () => {
    const draft = "**AI-generated draft \u2013 not legal advice.** Some text here...";
    expect(checkBanner(draft, "en")).toBe(false);
  });

  it("returns false when banner is past the 2000 char limit", () => {
    const padding = "x".repeat(2000);
    const draft = padding + "\n" + BANNER;
    expect(checkBanner(draft, "en")).toBe(false);
  });

  it("returns true when translated banner is found via glossary lookup", async () => {
    const { glossary } = await import("@trionic/translation");
    vi.mocked(glossary.lookup).mockReturnValue({ translation: "एआई-जनरेटेड ड्राफ्ट — कानूनी सलाह नहीं" });
    const draft = "**एआई-जनरेटेड ड्राफ्ट — कानूनी सलाह नहीं** Some text here...";
    expect(checkBanner(draft, "hi")).toBe(true);
  });
  
  it("returns true when english banner is present even if language is hi and glossary does not match", async () => {
    const { glossary } = await import("@trionic/translation");
    vi.mocked(glossary.lookup).mockReturnValue(null);
    expect(checkBanner(COMPLETE_RTI_DRAFT, "hi")).toBe(true);
  });

  it("returns false for lowercase (exact-string is case-sensitive)", () => {
    const draft = "**ai-generated draft \u2014 not legal advice.** Some text...";
    expect(checkBanner(draft, "en")).toBe(false);
  });

  it("returns true when banner appears within 2000 chars but not at start", () => {
    const prefix = "Some introductory text.\n\n";
    const draft = prefix + BANNER + "\n\n" + COMPLETE_RTI_BODY;
    expect(checkBanner(draft, "en")).toBe(true);
  });
});

// ─── checkCompleteness() — deterministic fallback ─────────────────────────────

describe("checkCompleteness()", () => {
  it("returns empty array for a complete RTI draft", () => {
    expect(checkCompleteness(COMPLETE_RTI_BODY, "rti_application")).toEqual([]);
  });

  it("returns missing sections for an incomplete RTI draft", () => {
    const missing = checkCompleteness(INCOMPLETE_RTI_DRAFT, "rti_application");
    expect(missing).toContain("Information Sought");
    expect(missing).toContain("Declaration");
    expect(missing).toContain("Date and Signature");
    expect(missing).not.toContain("Address");
    expect(missing).not.toContain("Subject");
  });

  it("returns missing sections for non-RTI doc types", () => {
    expect(checkCompleteness("Any content", "legal_notice")).toEqual(["Parties", "Cause of Action", "Demand and Relief", "Timeline", "Governing Law"]);
    expect(checkCompleteness("Any content", "nda")).toEqual(["Parties", "Definitions", "Confidential Information", "Obligations", "Term and Termination", "Governing Law", "Signatures"]);
  });
});

// ─── checkCompletenessLLM() — LLM-scored section detection ────────────────────

describe("checkCompletenessLLM()", () => {
  it("returns empty missing array when LLM finds all sections", async () => {
    (router.run as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_LLM_SECTIONS_ALL_FOUND);

    const result = await checkCompletenessLLM(COMPLETE_RTI_DRAFT, "rti_application");
    expect(result.missing).toEqual([]);
    expect(result.llmResponse).toBeDefined();
  });

  it("returns missing sections when LLM reports them", async () => {
    (router.run as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_LLM_SECTIONS_PARTIAL);

    const result = await checkCompletenessLLM(INCOMPLETE_RTI_DRAFT, "rti_application");
    expect(result.missing).toContain("Information Sought");
    expect(result.missing).toContain("Declaration");
    expect(result.missing).toContain("Date and Signature");
    expect(result.missing).not.toContain("Address");
    expect(result.missing).not.toContain("Subject");
  });

  it("handles semantic equivalents (LLM marks as found)", async () => {
    (router.run as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_LLM_SECTIONS_SEMANTIC);

    // Draft uses non-standard headings but LLM detects semantic equivalents
    const semanticDraft = BANNER + "\n\n" +
      "## Recipient Details\n\nTo, Officer\n\n" +
      "## Topic\n\nRe: Budget inquiry\n\n" +
      "## Details Requested\n\n1. Budget data\n\n" +
      "## Sworn Statement\n\nI declare...\n\n" +
      "## Signed On\n\nDate: 2026-06-01\n";

    const result = await checkCompletenessLLM(semanticDraft, "rti_application");
    expect(result.missing).toEqual([]);
  });

  it("falls back to deterministic check on invalid JSON", async () => {
    (router.run as ReturnType<typeof vi.fn>).mockResolvedValueOnce(MOCK_LLM_INVALID_JSON);

    const result = await checkCompletenessLLM(COMPLETE_RTI_DRAFT, "rti_application");
    // Deterministic fallback: all sections are present in COMPLETE_RTI_BODY
    expect(result.missing).toEqual([]);
    expect(result.llmResponse).toBeUndefined();
  });

  it("falls back to deterministic check on LLM error", async () => {
    (router.run as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Network error"));

    const result = await checkCompletenessLLM(COMPLETE_RTI_DRAFT, "rti_application");
    expect(result.missing).toEqual([]);
    expect(result.llmResponse).toBeUndefined();
  });

  it("makes LLM call for non-RTI doc types because they now have required sections", async () => {
    (router.run as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ text: JSON.stringify({ sections: { "Parties": "missing", "Cause of Action": "missing", "Demand and Relief": "missing", "Timeline": "missing", "Governing Law": "missing" } }) });
    const result = await checkCompletenessLLM("Any content", "legal_notice");
    expect(result.missing.length).toBeGreaterThan(0);
    expect(router.run).toHaveBeenCalled();
  });
});

// ─── runReviewer() ────────────────────────────────────────────────────────────

describe("runReviewer()", () => {
  it("returns approved=true for a complete RTI draft with clean tone", async () => {
    // First call: completeness scoring, Second call: tone
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(MOCK_LLM_SECTIONS_ALL_FOUND)
      .mockResolvedValueOnce(MOCK_LLM_TONE_PASS);

    const result = await runReviewer({
      draft: makeDraft(COMPLETE_RTI_DRAFT),
      session_id: "test-session",
    });

    expect(result.approved).toBe(true);
    expect(result.banner_present).toBe(true);
    expect(result.missing_required_sections).toEqual([]);
    expect(result.tone_issues).toEqual([]);
    expect(result.feedback).toBe("Draft approved \u2014 all checks passed.");
    expect(result.rejection_reason).toBeUndefined();
    expect(result.trace.status).toBe("ok");
    expect(result.trace.agent).toBe("reviewer");
  });

  it("returns approved=false when banner is missing", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(MOCK_LLM_SECTIONS_ALL_FOUND)
      .mockResolvedValueOnce(MOCK_LLM_TONE_PASS);

    const result = await runReviewer({
      draft: makeDraft(NO_BANNER_RTI_DRAFT),
    });

    expect(result.approved).toBe(false);
    expect(result.banner_present).toBe(false);
    expect(result.rejection_reason).toContain("Missing disclaimer banner");
    expect(result.feedback).toContain("Missing disclaimer banner");
    expect(result.trace.status).toBe("rejected");
    expect(result.trace.error_message).toContain("Missing disclaimer banner");
  });

  it("returns approved=false with missing sections", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(MOCK_LLM_SECTIONS_PARTIAL)
      .mockResolvedValueOnce(MOCK_LLM_TONE_PASS);

    const result = await runReviewer({
      draft: makeDraft(INCOMPLETE_RTI_DRAFT),
    });

    expect(result.approved).toBe(false);
    expect(result.missing_required_sections.length).toBeGreaterThan(0);
    expect(result.missing_required_sections).toContain("Information Sought");
    expect(result.trace.status).toBe("rejected");
    expect(result.trace.error_message).toContain("Missing required sections");
  });

  it("returns approved=false when both banner missing AND sections missing (AC4)", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(MOCK_LLM_SECTIONS_PARTIAL)
      .mockResolvedValueOnce(MOCK_LLM_TONE_PASS);

    const result = await runReviewer({
      draft: makeDraft(INCOMPLETE_RTI_DRAFT.replace(BANNER, "")),
    });

    expect(result.approved).toBe(false);
    expect(result.banner_present).toBe(false);
    expect(result.missing_required_sections.length).toBeGreaterThan(0);
    expect(result.trace.error_message).toContain("Missing disclaimer banner");
    expect(result.trace.error_message).toContain("Missing required sections");
  });

  it("returns approved=false when LLM detects tone issues", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(MOCK_LLM_SECTIONS_ALL_FOUND)
      .mockResolvedValueOnce(MOCK_LLM_TONE_FAIL);

    const result = await runReviewer({
      draft: makeDraft(COMPLETE_RTI_DRAFT),
    });

    expect(result.approved).toBe(false);
    expect(result.tone_issues.length).toBe(2);
    expect(result.tone_issues[0]).toContain("Informal");
    expect(result.trace.status).toBe("rejected");
    expect(result.trace.error_message).toContain("Tone issues flagged");
  });

  it("makes 2 router.run calls (completeness + tone)", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(MOCK_LLM_SECTIONS_ALL_FOUND)
      .mockResolvedValueOnce(MOCK_LLM_TONE_PASS);

    await runReviewer({ draft: makeDraft(COMPLETE_RTI_DRAFT) });

    expect(router.run).toHaveBeenCalledTimes(2);
    expect(router.run).toHaveBeenNthCalledWith(
      1,
      "reviewer",
      expect.any(String),
      expect.any(String)
    );
    expect(router.run).toHaveBeenNthCalledWith(
      2,
      "reviewer",
      expect.any(String),
      expect.any(String)
    );
  });

  it("throws and emits error trace when tone LLM call fails entirely", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(MOCK_LLM_SECTIONS_ALL_FOUND)
      .mockRejectedValueOnce(new Error("Network error"));

    await expect(
      runReviewer({ draft: makeDraft(COMPLETE_RTI_DRAFT) })
    ).rejects.toThrow("Network error");
  });

  // 5 unit tests per doc type with a "missing one required section" case
  it("fails when a legal_notice is missing 'Demand and Relief'", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ text: JSON.stringify({ sections: { "Parties": "found", "Cause of Action": "found", "Demand and Relief": "missing", "Timeline": "found", "Governing Law": "found" } }) })
      .mockResolvedValueOnce(MOCK_LLM_TONE_PASS);

    const result = await runReviewer({ draft: makeDraft(BANNER + "\n\n# Legal Notice...", "legal_notice") });
    expect(result.approved).toBe(false);
    expect(result.missing_required_sections).toContain("Demand and Relief");
  });

  it("fails when an nda is missing 'Confidential Information'", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ text: JSON.stringify({ sections: { "Parties": "found", "Definitions": "found", "Confidential Information": "missing", "Obligations": "found", "Term and Termination": "found", "Governing Law": "found", "Signatures": "found" } }) })
      .mockResolvedValueOnce(MOCK_LLM_TONE_PASS);

    const result = await runReviewer({ draft: makeDraft(BANNER + "\n\n# NDA...", "nda") });
    expect(result.approved).toBe(false);
    expect(result.missing_required_sections).toContain("Confidential Information");
  });

  it("fails when a consumer_complaint is missing 'Relief Sought'", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ text: JSON.stringify({ sections: { "Complainant Details": "found", "Opposite Party": "found", "Facts of Transaction": "found", "Deficiency of Service": "found", "Relief Sought": "missing", "Jurisdiction": "found" } }) })
      .mockResolvedValueOnce(MOCK_LLM_TONE_PASS);

    const result = await runReviewer({ draft: makeDraft(BANNER + "\n\n# Consumer Complaint...", "consumer_complaint") });
    expect(result.approved).toBe(false);
    expect(result.missing_required_sections).toContain("Relief Sought");
  });

  it("fails when a cheque_bounce_notice is missing 'Dishonour Details'", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ text: JSON.stringify({ sections: { "Drawer Details": "found", "Payee Details": "found", "Cheque Details": "found", "Dishonour Details": "missing", "Demand for Payment": "found", "Legal Warning": "found" } }) })
      .mockResolvedValueOnce(MOCK_LLM_TONE_PASS);

    const result = await runReviewer({ draft: makeDraft(BANNER + "\n\n# Cheque Bounce Notice...", "cheque_bounce_notice") });
    expect(result.approved).toBe(false);
    expect(result.missing_required_sections).toContain("Dishonour Details");
  });
});

// ─── ReviewerAgent class ──────────────────────────────────────────────────────

describe("ReviewerAgent", () => {
  it("has name 'reviewer'", () => {
    const agent = new ReviewerAgent();
    expect(agent.name).toBe("reviewer");
  });

  it("requiredSections('rti_application') returns 5 items (AC1)", () => {
    const agent = new ReviewerAgent();
    const sections = agent.requiredSections("rti_application");
    expect(sections).toHaveLength(5);
    expect(sections).toContain("Date and Signature");
  });

  it("delegates run() to runReviewer()", async () => {
    (router.run as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(MOCK_LLM_SECTIONS_ALL_FOUND)
      .mockResolvedValueOnce(MOCK_LLM_TONE_PASS);

    const agent = new ReviewerAgent();
    const result = await agent.run({
      draft: makeDraft(COMPLETE_RTI_DRAFT),
    });

    expect(result.approved).toBe(true);
    expect(result.trace.agent).toBe("reviewer");
  });
});
