/**
 * drafter/drafter.agent.ts
 * Owner: Jenil Sutariya
 * Module: packages/agents/src/drafter
 *
 * Core Drafter agent logic:
 *   - runDrafter()   — initial draft generation
 *   - reviseDraft()  — revision pass driven by Reviewer feedback
 *   - DrafterAgent   — Agno-compatible class wrapper
 *
 * Pipeline position:
 *   Planner → PageIndex → [Drafter] → Citator-gatekeeper → Reviewer
 *
 * Citation-or-die rule (enforced via prompt in drafter.prompt.ts):
 *   Every legal claim in the draft MUST carry a [CITE:<node_id>] marker.
 *   Un-cited claims are BLOCKED by the Citator-gatekeeper downstream.
 *
 * Week 1 note:
 *   PageIndex tool (Team D) is not yet wired. Node IDs are derived by the LLM
 *   from plan.applicable_acts using the canonical format <ACT_CODE>/<CHAPTER>/<SECTION>.
 *   Week 2: replace with real pageindexTool.query() calls before the LLM call.
 */

import { randomUUID } from "crypto";
import type { DocumentDraft } from "@trionic/shared";
import { router } from "../router/index.js";
import { buildTrace, buildErrorTrace, persistTrace } from "../tracing/index.js";
import {
  DRAFTER_SYSTEM_PROMPT,
  RTI_DRAFTER_SYSTEM_PROMPT,
  buildDrafterUserPrompt,
  buildDrafterRevisionPrompt,
} from "./drafter.prompt.js";
import { extractCitations, extractNodeIds } from "./citations.js";
import type { DrafterInput, DrafterResult } from "./types.js";
import { getPageIndex, search as searchLocalPageIndex, type AgnoSearchResult } from "@trionic/pageindex";
import { ROUTER_CONFIG } from "../router/router.config.js";

// ─── runDrafter ───────────────────────────────────────────────────────────────

/**
 * Run the Drafter agent — produce an initial legal document draft.
 *
 * Steps:
 *   1. Build user prompt from plan + intakeText.
 *   2. Call LLM Router (Claude in Week 1) with system + user prompts.
 *   3. Extract [CITE:<node_id>] markers from LLM output → Citation[].
 *   4. Assemble DocumentDraft with content, citations, and metadata.
 *   5. Build and persist AgentTrace.
 *   6. Return { draft, trace }.
 *
 * @throws Never — errors are captured in the trace (status: "error") and
 *                 re-thrown with `.trace` attached for the pipeline to surface.
 */
export async function runDrafter(input: DrafterInput): Promise<DrafterResult> {
  const { plan, intakeText, session_id } = input;

  try {
    // 1. Query PageIndex for each hint query in plan.pageindex_queries
    let livePageIndex: ReturnType<typeof getPageIndex> | null = null;
    try {
      livePageIndex = getPageIndex();
    } catch (error) {
      console.warn("[Drafter] Live PageIndex is not configured; using local artifacts:", error);
    }

    const searchPromises = plan.pageindex_queries.map((q) =>
      (livePageIndex
        ? livePageIndex.search({ query: q, top_k: 3 })
        : searchLocalPageIndex(q, undefined, 3).then((results) =>
            results.map((result) => ({
              node_id: result.node.node_id,
              snapshot_id: result.node.snapshot_id,
              snippet: result.node.text.slice(0, 300),
              score: result.relevance,
            }))
          )
      ).catch((err: any) => {
        console.warn(`[Drafter] PageIndex search failed for query "${q}":`, err);
        return [] as AgnoSearchResult[];
      })
    );
    const searchResults = await Promise.all(searchPromises);
    const flatResults = searchResults.flat();

    // Deduplicate retrieved nodes by node_id
    const seenNodes = new Set<string>();
    const retrievedNodes = flatResults.filter((item: AgnoSearchResult) => {
      if (seenNodes.has(item.node_id)) {
        return false;
      }
      seenNodes.add(item.node_id);
      return true;
    });

    const userPrompt = buildDrafterUserPrompt(plan, intakeText, retrievedNodes);

    // 2. Dynamic maxTokens adjustment for employment_contract
    const originalMaxTokens = ROUTER_CONFIG.drafter?.preferred?.maxTokens ?? 4096;
    const originalFallbackTokens = ROUTER_CONFIG.drafter?.fallback?.maxTokens ?? 4096;

    if ((plan.document_type as string) === "employment_contract") {
      if (ROUTER_CONFIG.drafter) {
        ROUTER_CONFIG.drafter.preferred.maxTokens = 8192;
        if (ROUTER_CONFIG.drafter.fallback) {
          ROUTER_CONFIG.drafter.fallback.maxTokens = 8192;
        }
      }
    }

    const isRti = plan.document_type === "rti_application";
    const systemPrompt = isRti ? RTI_DRAFTER_SYSTEM_PROMPT : DRAFTER_SYSTEM_PROMPT;

    let llmResponse;
    try {
      // Route through LLM Router — see router.config.ts "drafter" entry:
      //   Claude 3.5 Sonnet, maxTokens: 4096, temperature: 0.3
      llmResponse = await router.run(
        "drafter",
        systemPrompt,
        userPrompt
      );
    } finally {
      // Always restore original maxTokens limits to avoid polluting other runs
      if (ROUTER_CONFIG.drafter) {
        ROUTER_CONFIG.drafter.preferred.maxTokens = originalMaxTokens;
        if (ROUTER_CONFIG.drafter.fallback) {
          ROUTER_CONFIG.drafter.fallback.maxTokens = originalFallbackTokens;
        }
      }
    }

    // Extract all [CITE:<node_id>] markers from the raw LLM output
    const rawCitations = extractCitations(llmResponse.text);
    const citedNodes = extractNodeIds(llmResponse.text);

    // 3. Resolve real snapshot IDs asynchronously
    const citations = await Promise.all(
      rawCitations.map(async (citation) => {
        try {
          const res = await getPageIndex().get_text({ node_id: citation.node_id });
          if (res) {
            return {
              ...citation,
              snapshot_id: res.snapshot_id,
            };
          }
        } catch (err) {
          console.warn(`[Drafter] Failed to resolve snapshot_id for node_id "${citation.node_id}":`, err);
        }
        return citation; // fallback
      })
    );

    // Assemble the DocumentDraft
    const draft: DocumentDraft = {
      id: randomUUID(),
      document_type: plan.document_type,
      language: "en",   // Drafter always produces English; Translator handles Indic
      content: llmResponse.text,
      citations,
      traces: [],       // populated below after trace is built
      created_at: new Date().toISOString(),
    };

    // Build and persist the audit trace
    const trace = buildTrace({
      agent: "drafter",
      llmResponse,
      cited_nodes: citedNodes,
      status: "ok",
      session_id,
    });
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000", document_id: draft.id });

    // Attach this trace to the draft so downstream agents see the full chain
    draft.traces = [trace];

    return { draft, trace };
  } catch (error) {
    const trace = buildErrorTrace("drafter", error, session_id);
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });

    // Re-throw with trace attached so the pipeline orchestrator can surface it
    const err = error instanceof Error ? error : new Error(String(error));
    (err as any).trace = trace;
    throw err;
  }
}

// ─── reviseDraft ──────────────────────────────────────────────────────────────

/**
 * Revise an existing draft based on feedback from the Reviewer agent.
 *
 * Called by the Reviewer's retry loop (max 2 revisions — see RFC-reviewer-agent.md).
 *
 * IMPORTANT: The revised draft MUST pass through the Citator-gatekeeper again
 * before the Reviewer re-runs. This is the orchestrator's responsibility.
 *
 * @param original      - The DocumentDraft the Reviewer rejected or flagged.
 * @param revisionHint  - Plain-text summary from ReviewerRevisionHint.summary.
 *                        Week 2+: import ReviewerRevisionHint type from reviewer package.
 * @param session_id    - Same session ID as the original draft (for trace linking).
 *
 * @throws Never — errors captured in trace, re-thrown with `.trace` attached.
 */
export async function reviseDraft(
  original: DocumentDraft,
  revisionHint: string,
  session_id?: string
): Promise<DrafterResult> {
  try {
    const revisionPrompt = buildDrafterRevisionPrompt(
      original.content,
      revisionHint
    );

    const isRti = original.document_type === "rti_application";
    const systemPrompt = isRti ? RTI_DRAFTER_SYSTEM_PROMPT : DRAFTER_SYSTEM_PROMPT;

    const llmResponse = await router.run(
      "drafter",
      systemPrompt,
      revisionPrompt
    );

    const rawCitations = extractCitations(llmResponse.text);
    const citedNodes = extractNodeIds(llmResponse.text);

    // Resolve real snapshot IDs asynchronously
    const citations = await Promise.all(
      rawCitations.map(async (citation) => {
        try {
          const res = await getPageIndex().get_text({ node_id: citation.node_id });
          if (res) {
            return {
              ...citation,
              snapshot_id: res.snapshot_id,
            };
          }
        } catch (err) {
          console.warn(`[Drafter] Failed to resolve snapshot_id for node_id "${citation.node_id}":`, err);
        }
        return citation;
      })
    );

    const draft: DocumentDraft = {
      id: randomUUID(),                         // new ID for the revised version
      document_type: original.document_type,
      language: original.language,
      content: llmResponse.text,
      citations,
      traces: [...original.traces],             // carry forward all prior traces
      created_at: new Date().toISOString(),
    };

    const trace = buildTrace({
      agent: "drafter",
      llmResponse,
      cited_nodes: citedNodes,
      status: "ok",
      session_id,
    });
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000", document_id: original.id });

    draft.traces.push(trace);

    return { draft, trace };
  } catch (error) {
    const trace = buildErrorTrace("drafter", error, session_id);
    await persistTrace(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000", document_id: original.id });

    const err = error instanceof Error ? error : new Error(String(error));
    (err as any).trace = trace;
    throw err;
  }
}

// ─── DrafterAgent class (Agno-compatible) ─────────────────────────────────────

/**
 * Agno framework class wrapper for the Drafter agent.
 *
 * Agno expects agents to be classes with a run() method.
 * This is a thin wrapper around the functional helpers above.
 *
 * The revise() method is the entry-point the Reviewer's retry loop calls:
 *   ```ts
 *   const revised = await drafterAgent.revise(draft, review.revision_hint!.summary);
 *   const revalidated = await citatorAgent.run({ draft: revised.draft });  // MUST re-validate
 *   ```
 */
export class DrafterAgent {
  readonly name = "drafter";

  /**
   * Run the Drafter agent to produce an initial draft.
   */
  async run(input: DrafterInput): Promise<DrafterResult> {
    return runDrafter(input);
  }

  /**
   * Revise an existing draft based on Reviewer feedback.
   *
   * @param original     - The draft to revise.
   * @param revisionHint - Plain-text summary of required changes.
   * @param session_id   - Optional session ID for trace linking.
   */
  async revise(
    original: DocumentDraft,
    revisionHint: string,
    session_id?: string
  ): Promise<DrafterResult> {
    return reviseDraft(original, revisionHint, session_id);
  }
}
