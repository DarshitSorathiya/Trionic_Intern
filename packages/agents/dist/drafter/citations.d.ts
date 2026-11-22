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
/**
 * Snapshot date used for all citations until real PageIndex snapshot IDs are
 * resolved via the Team D tool API (Week 2+).
 */
export declare const PROVISIONAL_SNAPSHOT_ID = "2024-12-01";
/**
 * Regex to extract [CITE:<node_id>] markers from draft content.
 *
 * Global flag is set — always reset lastIndex before use or call via extractCitations()
 * which handles this internally.
 *
 * Matches:  [CITE:RTI-2005/CH-II/S-3]
 * Group 1:  RTI-2005/CH-II/S-3
 */
export declare const CITE_MARKER_REGEX: RegExp;
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
export declare function extractCitations(content: string): Citation[];
/**
 * Extract a deduplicated list of PageIndex node IDs from draft content.
 *
 * Used to populate AgentTrace.cited_nodes for audit and eval telemetry.
 *
 * @param content - Raw Markdown draft output from the LLM.
 * @returns       - Unique list of node ID strings. Empty array if none found.
 */
export declare function extractNodeIds(content: string): PageIndexNodeId[];
/**
 * Normalize an RTI-2005 node ID to its canonical tree representation.
 * Maps shorthand style markers like "RTI-2005/S-6" to "RTI-2005/CH-II/S-6".
 *
 * @param nodeId - The node ID to normalize.
 * @returns      - The canonical node ID.
 */
export declare function normalizeRtiNodeId(nodeId: string): string;
//# sourceMappingURL=citations.d.ts.map