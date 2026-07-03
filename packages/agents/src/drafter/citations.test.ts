/**
 * drafter/citations.test.ts
 * Owner: Jenil Sutariya
 * Module: packages/agents/src/drafter
 *
 * Unit tests for citation extraction utilities (citations.ts).
 * Pure functions — no mocks needed.
 *
 * Run: pnpm --filter @trionic/agents test src/drafter/citations.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  extractCitations,
  extractNodeIds,
  PROVISIONAL_SNAPSHOT_ID,
  CITE_MARKER_REGEX,
} from "./citations.js";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CONTENT_WITH_MARKERS = `---
**AI-generated draft — not legal advice.**
---

The right to information is available to every citizen [CITE:RTI-2005/CH-II/S-3].
The public authority must respond within 30 days [CITE:RTI-2005/CH-II/S-7].
Failure to respond attracts a penalty under Section 20 [CITE:RTI-2005/CH-V/S-20].`;

const CONTENT_NO_MARKERS = `This is a general explanation of the RTI process.
No specific legal claim is made here. Consult a legal professional.`;

const CONTENT_DUPLICATE_MARKERS = `
Claim one [CITE:ICA-1872/CH-VI/S-73].
Claim two also cites the same section [CITE:ICA-1872/CH-VI/S-73].
And a different section [CITE:ICA-1872/CH-I/S-1].`;

const CONTENT_MULTI_ACT = `
The contract is valid under Section 10 [CITE:ICA-1872/CH-II/S-10].
The consumer remedy is under Section 39 [CITE:CPA-2019/CH-IV/S-39].
The jurisdiction is under Section 34 [CITE:CPA-2019/CH-IV/S-34].`;

// ─── Tests: CITE_MARKER_REGEX constant ───────────────────────────────────────

describe("CITE_MARKER_REGEX", () => {
  it("is a RegExp", () => {
    expect(CITE_MARKER_REGEX).toBeInstanceOf(RegExp);
  });

  it("has the global flag", () => {
    expect(CITE_MARKER_REGEX.flags).toContain("g");
  });

  it("matches a well-formed [CITE:<node_id>] marker", () => {
    const regex = new RegExp(CITE_MARKER_REGEX.source, "g");
    const match = regex.exec("[CITE:RTI-2005/CH-II/S-3]");
    expect(match).not.toBeNull();
    expect(match![1]).toBe("RTI-2005/CH-II/S-3");
  });

  it("does not match an empty [CITE:] marker", () => {
    const regex = new RegExp(CITE_MARKER_REGEX.source, "g");
    const match = regex.exec("[CITE:]");
    // The regex requires at least one character inside
    expect(match).toBeNull();
  });
});

// ─── Tests: PROVISIONAL_SNAPSHOT_ID ──────────────────────────────────────────

describe("PROVISIONAL_SNAPSHOT_ID", () => {
  it("is a non-empty string", () => {
    expect(typeof PROVISIONAL_SNAPSHOT_ID).toBe("string");
    expect(PROVISIONAL_SNAPSHOT_ID.length).toBeGreaterThan(0);
  });

  it("follows the YYYY-MM-DD date format", () => {
    expect(PROVISIONAL_SNAPSHOT_ID).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ─── Tests: extractCitations() ───────────────────────────────────────────────

describe("extractCitations()", () => {
  it("returns an empty array when no markers are present", () => {
    expect(extractCitations(CONTENT_NO_MARKERS)).toHaveLength(0);
  });

  it("returns one Citation per marker occurrence (not deduplicated)", () => {
    // CONTENT_DUPLICATE_MARKERS has 2 occurrences of ICA-1872/CH-VI/S-73
    const citations = extractCitations(CONTENT_DUPLICATE_MARKERS);
    expect(citations.length).toBe(3); // 2 duplicates + 1 different
  });

  it("extracts the correct node_id for each marker", () => {
    const citations = extractCitations(CONTENT_WITH_MARKERS);
    const nodeIds = citations.map((c) => c.node_id);
    expect(nodeIds).toContain("RTI-2005/CH-II/S-3");
    expect(nodeIds).toContain("RTI-2005/CH-II/S-7");
    expect(nodeIds).toContain("RTI-2005/CH-V/S-20");
  });

  it("sets PROVISIONAL_SNAPSHOT_ID on every citation", () => {
    const citations = extractCitations(CONTENT_WITH_MARKERS);
    citations.forEach((c) => {
      expect(c.snapshot_id).toBe(PROVISIONAL_SNAPSHOT_ID);
    });
  });

  it("span[0] is >= 0 for every citation", () => {
    const citations = extractCitations(CONTENT_WITH_MARKERS);
    citations.forEach((c) => {
      expect(c.span[0]).toBeGreaterThanOrEqual(0);
    });
  });

  it("span[1] > span[0] for every citation (non-zero-length span)", () => {
    const citations = extractCitations(CONTENT_WITH_MARKERS);
    citations.forEach((c) => {
      expect(c.span[1]).toBeGreaterThan(c.span[0]);
    });
  });

  it("span[1] points to the end of the [CITE:...] token in content", () => {
    const content = "Some claim [CITE:RTI-2005/CH-II/S-3].";
    const citations = extractCitations(content);
    expect(citations).toHaveLength(1);
    // The char at span[1]-1 should be the closing ']'
    expect(content[citations[0].span[1] - 1]).toBe("]");
  });

  it("handles content with markers from multiple acts", () => {
    const citations = extractCitations(CONTENT_MULTI_ACT);
    expect(citations.length).toBe(3);
    const nodeIds = citations.map((c) => c.node_id);
    expect(nodeIds).toContain("ICA-1872/CH-II/S-10");
    expect(nodeIds).toContain("CPA-2019/CH-IV/S-39");
    expect(nodeIds).toContain("CPA-2019/CH-IV/S-34");
  });

  it("is idempotent — calling twice returns the same results", () => {
    const first = extractCitations(CONTENT_WITH_MARKERS);
    const second = extractCitations(CONTENT_WITH_MARKERS);
    expect(first).toEqual(second);
  });
});

// ─── Tests: extractNodeIds() ──────────────────────────────────────────────────

describe("extractNodeIds()", () => {
  it("returns an empty array when no markers are present", () => {
    expect(extractNodeIds(CONTENT_NO_MARKERS)).toHaveLength(0);
  });

  it("deduplicates repeated node IDs", () => {
    const ids = extractNodeIds(CONTENT_DUPLICATE_MARKERS);
    // ICA-1872/CH-VI/S-73 appears twice but should be returned once
    const count = ids.filter((id) => id === "ICA-1872/CH-VI/S-73").length;
    expect(count).toBe(1);
  });

  it("returns all distinct node IDs from content", () => {
    const ids = extractNodeIds(CONTENT_WITH_MARKERS);
    expect(ids).toContain("RTI-2005/CH-II/S-3");
    expect(ids).toContain("RTI-2005/CH-II/S-7");
    expect(ids).toContain("RTI-2005/CH-V/S-20");
  });

  it("returns an array where every element is a non-empty string", () => {
    const ids = extractNodeIds(CONTENT_WITH_MARKERS);
    ids.forEach((id) => {
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  it("result length equals number of unique markers in content", () => {
    const ids = extractNodeIds(CONTENT_DUPLICATE_MARKERS);
    // 2 unique: ICA-1872/CH-VI/S-73, ICA-1872/CH-I/S-1
    expect(ids.length).toBe(2);
  });

  it("is idempotent — calling twice returns the same set", () => {
    const first = extractNodeIds(CONTENT_WITH_MARKERS);
    const second = extractNodeIds(CONTENT_WITH_MARKERS);
    expect(new Set(first)).toEqual(new Set(second));
  });
});
