/**
 * packages/agents/src/orchestrator.ts
 * Owner: Malay Sheta (Agents lead — Week 2)
 *
 * runAgentChain — the master async-iterable orchestrator consumed by
 * the backend's POST /api/draft route (Team B — Prashant).
 *
 * Pipeline order:
 *   Classifier → Planner → (PageIndex retrieval) → Drafter → Citator → Reviewer → [Translator]
 *
 * Each agent step emits:
 *   { type: "step.start", agent, ts }
 *   { type: "step.done",  agent, ts, duration_ms, tokens }
 *   (or { type: "step.error", agent, ts, message } on failure)
 *
 * The final event is always:
 *   { type: "draft.final", response: DraftResponse, ts }
 *
 * Imports types exclusively from @trionic/shared — never redefines them.
 *
 * Demo gate (from a Node REPL):
 *   import { runAgentChain } from "@trionic/agents";
 *   const req = { document_id: "doc-1", intake_text: "...", target_language: "en" };
 *   for await (const evt of runAgentChain(req)) { console.log(evt); }
 */

import type {
  AgentStreamEvent,
  AgentTrace,
  Citation,
  ClassifierOutput,
  DocumentDraft,
  DocumentType,
  DraftRequest,
  DraftResponse,
  PageIndexNodeId,
  PlannerOutput,
  SupportedLanguage,
} from "@trionic/shared";

import { runClassifier } from "./classifier/index.js";
import { runDrafter } from "./drafter/index.js";
import { runCitator } from "./citator/index.js";
import { runReviewer } from "./reviewer/index.js";
import { runTranslator } from "./translator/index.js";
import { runPlannerAgent } from "./agents/planner.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

/** Emit a step.start event */
function stepStart(agent: string): AgentStreamEvent {
  return { type: "step.start", agent, ts: now() };
}

/** Emit a step.done event */
function stepDone(
  agent: string,
  durationMs: number,
  tokens: number
): AgentStreamEvent {
  return { type: "step.done", agent, ts: now(), duration_ms: durationMs, tokens };
}

/** Emit a step.error event */
function stepError(agent: string, message: string): AgentStreamEvent {
  return { type: "step.error", agent, ts: now(), message };
}

// ─── Stub helpers for agents that are not yet implemented ──────────────────────

/**
 * Builds a minimal stub ClassifierOutput so the chain can run end-to-end
 * when the real Classifier is not yet wired (W2 stub mode).
 *
 * If `doc_type` is provided on the DraftRequest, we use it to infer the domain.
 */
function stubClassifierOutput(req: DraftRequest): ClassifierOutput {
  const docTypeToDomain: Record<DocumentType, ClassifierOutput["domain"]> = {
    rti_application:      "administrative",
    legal_notice:         "civil",
    nda:                  "contract",
    consumer_complaint:   "consumer",
    cheque_bounce_notice: "criminal",
  };

  const domain = req.doc_type
    ? (docTypeToDomain[req.doc_type] ?? "other")
    : "other";

  return {
    is_legal:      true,
    domain,
    sub_domain:    req.doc_type ?? undefined,
    relevant_acts: [],
    severity:      "medium",
    confidence:    0.85,
    reasoning:
      "W2 stub: classifier not yet implemented. Domain inferred from doc_type.",
  };
}

/**
 * Builds a stub DocumentDraft so Drafter, Citator, Reviewer, Translator
 * stubs can work in the chain.
 */
function buildStubDraft(
  documentId: string,
  plan: PlannerOutput,
  language: SupportedLanguage,
  traces: AgentTrace[]
): DocumentDraft {
  return {
    id:            documentId,
    document_type: plan.document_type,
    language,
    content:
      `# ${plan.document_type.replace(/_/g, " ").toUpperCase()}\n\n` +
      `_[W2 stub — Drafter not yet called. Plan: ${plan.template_id}]_\n\n` +
      `**Applicable Acts:** ${plan.applicable_acts.join(", ")}\n\n` +
      `**Notes:** ${plan.notes}`,
    citations:  [],
    traces,
    created_at: new Date().toISOString(),
  };
}

// ─── PageIndex retrieval stub ─────────────────────────────────────────────────

/**
 * Stub PageIndex retrieval.
 *
 * In W2 the real Agno tool surface (Samarth's `packages/pageindex/src/agnoTool.ts`)
 * may not be wired yet. This stub logs the queries and returns empty results,
 * keeping the chain runnable.
 *
 * Replace with real pageindex.search() calls in W3.
 */
async function runPageIndexRetrieval(
  plan: PlannerOutput
): Promise<{ node_id: PageIndexNodeId; snippet: string }[]> {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 30 + Math.random() * 20));

  console.log(
    `[PageIndex] Retrieving ${plan.pageindex_queries.length} query/queries:`,
    plan.pageindex_queries
  );

  // Stub: return one empty result per query
  return plan.pageindex_queries.map((q, i) => ({
    node_id: `STUB-NODE-${i + 1}`,
    snippet: `[W2 stub snippet for: "${q}"]`,
  }));
}

// ─── runAgentChain ────────────────────────────────────────────────────────────

/**
 * Run the full agent chain for a draft request.
 *
 * Exported as an AsyncIterable<AgentStreamEvent> so the backend can forward
 * each event directly to the SSE stream without buffering.
 *
 * Usage (Node REPL demo):
 *   for await (const evt of runAgentChain(req)) { console.log(evt); }
 *
 * @param req - DraftRequest from POST /api/draft body.
 */
export async function* runAgentChain(
  req: DraftRequest
): AsyncIterable<AgentStreamEvent> {
  const allTraces: AgentTrace[] = [];
  const allCitations: Citation[] = [];
  const emittedNodeIds: PageIndexNodeId[] = [];
  const warnings: string[] = [];

  // Session ID derived from document_id (Team B may override with real user ID)
  const session_id = req.document_id;

  // ── 1. Classifier ──────────────────────────────────────────────────────────
  let classifierOutput: ClassifierOutput;
  {
    const t0 = Date.now();
    yield stepStart("classifier");

    try {
      const result = await runClassifier({
        intakeText: req.intake_text,
        language:   req.target_language,
        session_id,
      });
      classifierOutput = result.classification;
      allTraces.push(result.trace);
      yield stepDone("classifier", Date.now() - t0, result.trace.tokens_in + result.trace.tokens_out);
    } catch (_err) {
      // Classifier not yet implemented — fall back to stub
      warnings.push("Classifier not implemented; using stub classification.");
      classifierOutput = stubClassifierOutput(req);

      const stubTokens = 120;
      yield stepDone("classifier", Date.now() - t0, stubTokens);
    }
  }

  // ── 2. Planner ────────────────────────────────────────────────────────────
  let plan: PlannerOutput;
  {
    const t0 = Date.now();
    yield stepStart("planner");

    try {
      const result = await runPlannerAgent({
        intakeText:       req.intake_text,
        classifierOutput,
        language:         req.target_language,
        session_id,
      });
      plan = result.plan;
      allTraces.push(result.trace);
      yield stepDone("planner", Date.now() - t0, result.trace.tokens_in + result.trace.tokens_out);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      yield stepError("planner", msg);
      return; // chain aborted
    }
  }

  // ── 3. PageIndex retrieval ────────────────────────────────────────────────
  // We emit step.start/step.done for UI visibility and demo gate assertions.
  // No LLM call or AgentTrace for this step — it's a retrieval-only operation.
  const pageIndexT0 = Date.now();
  yield stepStart("pageindex");
  let pageIndexResults: { node_id: PageIndexNodeId; snippet: string }[] = [];
  try {
    pageIndexResults = await runPageIndexRetrieval(plan);
    for (const r of pageIndexResults) {
      emittedNodeIds.push(r.node_id);
      yield { type: "citation.emitted", node_id: r.node_id, ts: now() };
    }
  } catch (_err) {
    warnings.push("PageIndex retrieval failed; continuing without retrieved nodes.");
  }
  yield stepDone("pageindex", Date.now() - pageIndexT0, 0);

  // ── 4. Drafter ────────────────────────────────────────────────────────────
  let draft: DocumentDraft;
  {
    const t0 = Date.now();
    yield stepStart("drafter");

    try {
      const result = await runDrafter({
        plan,
        intakeText: req.intake_text,
        session_id,
      });
      draft = result.draft;
      allTraces.push(result.trace);

      // Stream partial draft markdown chunk
      yield {
        type:           "draft.partial",
        markdown_chunk: draft.content,
        ts:             now(),
      };

      yield stepDone("drafter", Date.now() - t0, result.trace.tokens_in + result.trace.tokens_out);
    } catch (_err) {
      // Drafter not yet implemented or failed — use stub draft
      warnings.push("Drafter not yet implemented; using stub draft.");
      draft = buildStubDraft(req.document_id, plan, req.target_language, []);

      yield {
        type:           "draft.partial",
        markdown_chunk: draft.content,
        ts:             now(),
      };

      yield stepDone("drafter", Date.now() - t0, 0);
    }
  }

  // ── 5. Citator ────────────────────────────────────────────────────────────
  {
    const t0 = Date.now();
    yield stepStart("citator");

    try {
      const result = await runCitator({ draft, session_id });
      allTraces.push(result.trace);

      if (!result.passed) {
        yield stepError(
          "citator",
          result.rejection_reason ?? "Citator rejected the draft — invalid citations."
        );
        return; // chain aborted; backend sets document status to "failed"
      }

      allCitations.push(...result.validatedCitations);
      yield stepDone("citator", Date.now() - t0, result.trace.tokens_in + result.trace.tokens_out);
    } catch (_err) {
      // Citator not yet implemented — pass through with empty citations
      warnings.push("Citator not yet implemented; skipping citation validation.");
      yield stepDone("citator", Date.now() - t0, 0);
    }
  }

  // ── 6. Reviewer ───────────────────────────────────────────────────────────
  {
    const t0 = Date.now();
    yield stepStart("reviewer");

    try {
      const result = await runReviewer({ draft, session_id });
      allTraces.push(result.trace);

      if (!result.approved) {
        yield stepError(
          "reviewer",
          result.trace.error_message ?? "Reviewer rejected the draft — quality check failed."
        );
        return; // chain aborted
      }

      yield stepDone("reviewer", Date.now() - t0, result.trace.tokens_in + result.trace.tokens_out);
    } catch (_err) {
      // Reviewer not yet implemented — pass through
      warnings.push("Reviewer not yet implemented; skipping review.");
      yield stepDone("reviewer", Date.now() - t0, 0);
    }
  }

  // ── 7. Translator (optional — only if target_language !== "en") ────────────
  let finalMarkdown = draft.content;

  if (req.target_language !== "en") {
    const t0 = Date.now();
    yield stepStart("translator");

    try {
      const result = await runTranslator({
        body_markdown: draft.content,
        target_language: req.target_language,
        citations: allCitations,
        session_id,
      });
      allTraces.push(result.trace);
      finalMarkdown = result.output.translated_markdown;
      yield stepDone("translator", Date.now() - t0, result.trace.tokens_in + result.trace.tokens_out);
    } catch (_err) {
      // Translator not yet implemented — return English draft with warning
      warnings.push(
        `Translator not yet implemented; returning English draft ` +
          `(requested: ${req.target_language}).`
      );
      yield stepDone("translator", Date.now() - t0, 0);
    }
  }

  // ── 8. Emit final response ────────────────────────────────────────────────
  const traceIds = allTraces
    .map((t) => t.timestamp)  // use timestamp as lightweight trace pointer
    .filter(Boolean);

  const response: DraftResponse = {
    document_id:   req.document_id,
    version_id:    `ver-${Date.now()}`,
    body_markdown: finalMarkdown,
    citations:     allCitations,
    trace_ids:     traceIds,
    warnings,
  };

  yield { type: "draft.final", response, ts: now() };
}
