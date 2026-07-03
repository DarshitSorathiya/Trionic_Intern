/**
 * drafter/citations.ts
 * Owner: Jenil Sutariya
 * Module: packages/agents/src/drafter
 *
 * Citation extraction utilities.
 *
 * Responsible for:
 *   - Parsing [CITE:<node_id>] markers from raw LLM draft output.
 *   - Building Citation[] objects (with char-offset spans) for DocumentDraft.citations.
 *   - Extracting a deduplicated list of node IDs for AgentTrace.cited_nodes.
 *
 * These are pure functions (no I/O, no LLM calls) — easy to unit test in isolation.
 *
 * Citation-or-die rule (RFC §4):
 *   The marker format is  [CITE:<node_id>]  placed immediately after the cited clause.
 *   node_id format: <ACT_CODE>/<CHAPTER_OR_PART>/<SECTION>
 *   Example:        RTI-2005/CH-II/S-7
 */

import type { Citation, PageIndexNodeId } from "@trionic/shared";

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Snapshot date used for all citations until real PageIndex snapshot IDs are
 * resolved via the Team D tool API (Week 2+).
 */
export const PROVISIONAL_SNAPSHOT_ID = "2024-12-01";

/**
 * Regex to extract [CITE:<node_id>] markers from draft content.
 *
 * Global flag is set — always reset lastIndex before use or call via extractCitations()
 * which handles this internally.
 *
 * Matches:  [CITE:RTI-2005/CH-II/S-3]
 * Group 1:  RTI-2005/CH-II/S-3
 */
export const CITE_MARKER_REGEX = /\[CITE:([^\]]+)\]/g;

// ─── Citation Extraction ──────────────────────────────────────────────────────

/**
 * Extract all [CITE:<node_id>] markers from draft Markdown content.
 *
 * Builds a Citation[] array with:
 *   - node_id  — the PageIndex node identifier
 *   - snapshot_id — provisional "2024-12-01" until Team D wires real IDs
 *   - span     — char offsets [start, end] of the clause the citation covers
 *
 * Span heuristic: walk back up to 300 chars from the marker to find the nearest
 * sentence / paragraph boundary (". ", ".\n", "\n\n"). The span covers from that
 * boundary to the end of the [CITE:...] token.
 *
 * @param content - Raw Markdown draft output from the LLM.
 * @returns       - Array of Citation objects. Empty array if no markers found.
 */
export function extractCitations(content: string): Citation[] {
  const citations: Citation[] = [];
  const regex = new RegExp(CITE_MARKER_REGEX.source, "g"); // fresh instance, no shared state
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const rawNodeId = match[1].trim();
    const nodeId: PageIndexNodeId = normalizeRtiNodeId(rawNodeId);
    const markerEnd = match.index + match[0].length;

    // Heuristic: span starts at the nearest sentence/clause boundary before the marker.
    const lookBackStart = Math.max(0, match.index - 300);
    const lookBackText = content.slice(lookBackStart, match.index);
    const lastBoundary = Math.max(
      lookBackText.lastIndexOf(". "),
      lookBackText.lastIndexOf(".\n"),
      lookBackText.lastIndexOf("\n\n")
    );
    const spanStart =
      lastBoundary >= 0 ? lookBackStart + lastBoundary + 2 : lookBackStart;

    citations.push({
      node_id: nodeId,
      snapshot_id: PROVISIONAL_SNAPSHOT_ID,
      span: [spanStart, markerEnd],
    });
  }

  return citations;
}

/**
 * Extract a deduplicated list of PageIndex node IDs from draft content.
 *
 * Used to populate AgentTrace.cited_nodes for audit and eval telemetry.
 *
 * @param content - Raw Markdown draft output from the LLM.
 * @returns       - Unique list of node ID strings. Empty array if none found.
 */
export function extractNodeIds(content: string): PageIndexNodeId[] {
  const ids = new Set<PageIndexNodeId>();
  const regex = new RegExp(CITE_MARKER_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    ids.add(normalizeRtiNodeId(match[1]));
  }

  return Array.from(ids);
}

/**
 * Normalize an RTI-2005 node ID to its canonical tree representation.
 * Maps shorthand style markers like "RTI-2005/S-6" to "RTI-2005/CH-II/S-6".
 *
 * @param nodeId - The node ID to normalize.
 * @returns      - The canonical node ID.
 */
export function normalizeRtiNodeId(nodeId: string): string {
  const trimmed = nodeId.trim();
  const match = trimmed.match(/^RTI-2005\/S-(\d+)$/i);
  if (match) {
    const secNum = parseInt(match[1], 10);
    let ch = "";
    if (secNum >= 1 && secNum <= 2) ch = "CH-I";
    else if (secNum >= 3 && secNum <= 11) ch = "CH-II";
    else if (secNum >= 12 && secNum <= 14) ch = "CH-III";
    else if (secNum >= 15 && secNum <= 17) ch = "CH-IV";
    else if (secNum >= 18 && secNum <= 20) ch = "CH-V";
    else if (secNum >= 21 && secNum <= 31) ch = "CH-VI";

    if (ch) {
      return `RTI-2005/${ch}/S-${secNum}`;
    }
  }
  return trimmed;
}
