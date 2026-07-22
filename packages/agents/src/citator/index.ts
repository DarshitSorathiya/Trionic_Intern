/**
 * citator/index.ts
 * Owner: Hitarth Sherathia
 * Module: packages/agents/src/citator
 *
 * The Citator-Gatekeeper agent — the most critical agent in the pipeline.
 *
 * Validates every [CITE:<node_id>] marker in the Drafter's output against
 * the live PageIndex tree via pageindex.get_text(node_id).
 *
 * Rules (non-negotiable):
 *   1. Every [CITE:<node_id>] is validated via pageindex.get_text(node_id).
 *      A 404 (NodeNotFoundError) is a rejection — no exceptions.
 *   2. A draft with NO [CITE:...] markers is ALSO a rejection.
 *      A legal claim without citation has no place in this system.
 *   3. On any rejection: approved = false, rejected_spans is populated,
 *      and the chain emits step.error → document status becomes "failed".
 *
 * --strict flag:
 *   When strict = true (default, production): both rules above apply.
 *   When strict = false (dev/test only): skips the "no citations" rejection
 *   so devs can run the chain without a fully cited draft during local testing.
 */

import type { AgentTrace, Citation, CitatorVerdict, DocumentDraft, PageIndexNodeId } from "@trionic/shared";

// ─── Input / Output shapes ────────────────────────────────────────────────────

export interface CitatorOptions {
  /**
   * When true (default), a draft with no [CITE:...] markers is rejected.
   * Set to false only for dev testing — never disable in production.
   */
  strict?: boolean;
}

export interface CitatorInput {
  /** The draft to validate citations for. */
  draft: DocumentDraft;
  /** Optional session ID for trace attribution. */
  session_id?: string;
  /** Citator behaviour options. */
  options?: CitatorOptions;
}

export interface CitatorResult {
  /** Whether all citations passed validation. */
  approved: boolean;
  /** Backwards-compatibility alias for approved. */
  passed: boolean;
  /** Validated citations returned when the draft is approved. */
  validatedCitations: Citation[];
  /**
   * Full CitatorVerdict — this is the canonical output shape from @trionic/shared.
   * approved: false → chain aborts, document status = "failed".
   * approved: true  → resolved_citations is populated, chain continues.
   */
  verdict: CitatorVerdict;
  /** Convenience alias: same as verdict.resolved_citations. */
  resolved_citations: Citation[];
  /** Convenience alias: spans that failed (node not found or no citation). */
  rejected_spans: [number, number][];
  /** Human-readable reason for rejection when approved === false. */
  rejection_reason?: string;
  /** Audit trace for this agent call. */
  trace: AgentTrace;
}

// ─── Imports ──────────────────────────────────────────────────────────────────

import { buildTrace, buildErrorTrace, persistTrace } from "../tracing/index.js";
import { extractCitations } from "../drafter/citations.js";
import { pageindex, NodeNotFoundError } from "./pageindex.js";
import { emitAgentStreamEvent } from "./events.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCAL_LLM_RESPONSE = {
  text: "",
  model: "citator-local",
  provider: "claude" as const,
  tokens_in: 0,
  tokens_out: 0,
  cost_usd: 0,
  latency_ms: 0,
  fallback_used: false,
};

// ─── Agent ────────────────────────────────────────────────────────────────────

/**
 * Validate every [CITE:<node_id>] marker in the draft content against PageIndex.
 *
 * Returns a CitatorResult with `approved: true` only when:
 *   - At least one [CITE:...] marker exists (or strict = false)
 *   - Every marker resolves to a real node in PageIndex
 *
 * On any failure, returns `approved: false` with `rejected_spans` populated
 * so the chain can emit step.error and set document status to "failed".
 */
export async function runCitator(input: CitatorInput): Promise<CitatorResult> {
  const { draft, session_id } = input;
  const strict = input.options?.strict ?? true; // strict mode is the default

  const citations = extractCitations(draft.content);

  // ── Rule 2: no citations = rejection (in strict mode) ──────────────────────
  if (strict && citations.length === 0) {
    const rejection_reason =
      "Draft contains no [CITE:...] markers. Every legal claim must be cited.";

    const trace = buildTrace({
      agent: "citator",
      llmResponse: LOCAL_LLM_RESPONSE,
      cited_nodes: [],
      status: "rejected",
      session_id,
    });
    await persistTrace(trace, {
      user_id: session_id || "00000000-0000-0000-0000-000000000000",
      document_id: draft.id,
    });

    const verdict: CitatorVerdict = {
      approved: false,
      rejected_spans: [
        {
          span: [0, draft.content.length],
          reason: "no_citation",
          message: rejection_reason,
        },
      ],
      resolved_citations: [],
    };

    return {
      approved: false,
      passed: false,
      validatedCitations: [],
      verdict,
      resolved_citations: [],
      rejected_spans: [[0, draft.content.length]],
      rejection_reason,
      trace,
    };
  }

  // ── Rule 1: validate each marker against PageIndex ─────────────────────────
  const rejectedSpansFull: CitatorVerdict["rejected_spans"] = [];
  const resolvedCitations: Citation[] = [];

  for (const citation of citations) {
    try {
      const node = await pageindex.get_text(citation.node_id);
      const resolved: Citation = {
        node_id: citation.node_id,
        snapshot_id: node.snapshot_id,
        span: citation.span,
      };
      resolvedCitations.push(resolved);
      emitAgentStreamEvent({
        type: "citation.emitted",
        node_id: citation.node_id,
        span: citation.span,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof NodeNotFoundError) {
        // This is a rejection — the node does not exist in PageIndex (404)
        rejectedSpansFull.push({
          span: citation.span,
          reason: "invalid_node",
          message: `PageIndex node not found: ${citation.node_id}`,
        });
      } else {
        // Unexpected error — propagate with trace attached
        const trace = buildErrorTrace("citator", error, session_id);
        await persistTrace(trace, {
          user_id: session_id || "00000000-0000-0000-0000-000000000000",
          document_id: draft.id,
        });
        const err = error instanceof Error ? error : new Error(String(error));
        (err as any).trace = trace;
        throw err;
      }
    }
  }

  const approved = rejectedSpansFull.length === 0;
  const traceStatus: AgentTrace["status"] = approved ? "ok" : "rejected";

  const trace = buildTrace({
    agent: "citator",
    llmResponse: LOCAL_LLM_RESPONSE,
    cited_nodes: resolvedCitations.map((c) => c.node_id),
    status: traceStatus,
    session_id,
  });
  await persistTrace(trace, {
    user_id: session_id || "00000000-0000-0000-0000-000000000000",
    document_id: draft.id,
  });

  const verdict: CitatorVerdict = {
    approved,
    rejected_spans: rejectedSpansFull,
    resolved_citations: resolvedCitations,
  };

  const rejectedSpansTuples = rejectedSpansFull.map(
    (s): [number, number] => s.span
  );
  const rejectionReason = approved
    ? undefined
    : rejectedSpansFull.map((span) => span.message).join("; ");

  return {
    approved,
    passed: approved,
    validatedCitations: resolvedCitations,
    verdict,
    resolved_citations: resolvedCitations,
    rejected_spans: rejectedSpansTuples,
    rejection_reason: rejectionReason,
    trace,
  };
}

// ─── Class API (for dependency injection / testing) ───────────────────────────

export class CitatorGatekeeperAgent {
  readonly name = "citator";
  private readonly options: CitatorOptions;

  constructor(options: CitatorOptions = {}) {
    this.options = options;
  }

  async run(input: CitatorInput): Promise<CitatorResult> {
    return runCitator({ ...input, options: { ...this.options, ...input.options } });
  }
}
