"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrafterAgent = void 0;
exports.runDrafter = runDrafter;
exports.reviseDraft = reviseDraft;
const crypto_1 = require("crypto");
const index_js_1 = require("../router/index.js");
const index_js_2 = require("../tracing/index.js");
const drafter_prompt_js_1 = require("./drafter.prompt.js");
const citations_js_1 = require("./citations.js");
const pageindex_1 = require("@trionic/pageindex");
const router_config_js_1 = require("../router/router.config.js");
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
async function runDrafter(input) {
    const { plan, intakeText, session_id } = input;
    try {
        // 1. Query PageIndex for each hint query in plan.pageindex_queries
        let livePageIndex = null;
        try {
            livePageIndex = (0, pageindex_1.getPageIndex)();
        }
        catch (error) {
            console.warn("[Drafter] Live PageIndex is not configured; using local artifacts:", error);
        }
        const searchPromises = plan.pageindex_queries.map(async (q) => {
            const explicitActs = plan.applicable_acts.filter((act) => q.toLowerCase().includes(act.toLowerCase()));
            const queryActs = explicitActs.length > 0 ? explicitActs : plan.applicable_acts;
            const scopes = queryActs
                .map((act) => (0, pageindex_1.getPageIndexActScope)(act))
                .filter((scope) => scope !== undefined);
            if (scopes.length === 0) {
                console.warn(`[Drafter] No PageIndex scope is configured for query "${q}".`);
                return [];
            }
            const scopedResults = await Promise.all(scopes.map(async (scope) => {
                try {
                    if (livePageIndex) {
                        return await livePageIndex.search({
                            query: q,
                            scope: scope.node_prefix,
                            top_k: 3,
                        });
                    }
                    const results = await (0, pageindex_1.search)(q, { act_code: scope.act_code }, 3);
                    return results.map((result) => ({
                        node_id: result.node.node_id,
                        snapshot_id: result.node.snapshot_id,
                        snippet: result.node.text.slice(0, 300),
                        score: result.relevance,
                    }));
                }
                catch (err) {
                    console.warn(`[Drafter] PageIndex search failed for query "${q}":`, err);
                    return [];
                }
            }));
            return scopedResults.flat();
        });
        const searchResults = await Promise.all(searchPromises);
        const flatResults = searchResults.flat();
        // Deduplicate retrieved nodes by node_id
        const seenNodes = new Set();
        const retrievedNodes = flatResults.filter((item) => {
            if (seenNodes.has(item.node_id)) {
                return false;
            }
            seenNodes.add(item.node_id);
            return true;
        });
        const userPrompt = (0, drafter_prompt_js_1.buildDrafterUserPrompt)(plan, intakeText, retrievedNodes);
        // 2. Dynamic maxTokens adjustment for employment_contract
        const originalMaxTokens = router_config_js_1.ROUTER_CONFIG.drafter?.preferred?.maxTokens ?? 4096;
        const originalFallbackTokens = router_config_js_1.ROUTER_CONFIG.drafter?.fallbacks?.map((fallback) => fallback.maxTokens) ?? [];
        if (plan.document_type === "employment_contract") {
            if (router_config_js_1.ROUTER_CONFIG.drafter) {
                router_config_js_1.ROUTER_CONFIG.drafter.preferred.maxTokens = 8192;
                router_config_js_1.ROUTER_CONFIG.drafter.fallbacks?.forEach((fallback) => {
                    fallback.maxTokens = 8192;
                });
            }
        }
        const isRti = plan.document_type === "rti_application";
        const systemPrompt = isRti ? drafter_prompt_js_1.RTI_DRAFTER_SYSTEM_PROMPT : drafter_prompt_js_1.DRAFTER_SYSTEM_PROMPT;
        let llmResponse;
        try {
            // Route through LLM Router — see router.config.ts "drafter" entry:
            //   DeepSeek with Groq and Gemini fallbacks, temperature: 0.3
            llmResponse = await index_js_1.router.run("drafter", systemPrompt, userPrompt);
        }
        finally {
            // Always restore original maxTokens limits to avoid polluting other runs
            if (router_config_js_1.ROUTER_CONFIG.drafter) {
                router_config_js_1.ROUTER_CONFIG.drafter.preferred.maxTokens = originalMaxTokens;
                router_config_js_1.ROUTER_CONFIG.drafter.fallbacks?.forEach((fallback, index) => {
                    fallback.maxTokens = originalFallbackTokens[index] ?? fallback.maxTokens;
                });
            }
        }
        // Extract all [CITE:<node_id>] markers from the raw LLM output
        const rawCitations = (0, citations_js_1.extractCitations)(llmResponse.text);
        const citedNodes = (0, citations_js_1.extractNodeIds)(llmResponse.text);
        // 3. Resolve real snapshot IDs asynchronously
        const citations = await Promise.all(rawCitations.map(async (citation) => {
            try {
                const res = await (0, pageindex_1.getPageIndex)().get_text({ node_id: citation.node_id });
                if (res) {
                    return {
                        ...citation,
                        snapshot_id: res.snapshot_id,
                    };
                }
            }
            catch (err) {
                console.warn(`[Drafter] Failed to resolve snapshot_id for node_id "${citation.node_id}":`, err);
            }
            return citation; // fallback
        }));
        // Assemble the DocumentDraft
        const draft = {
            id: (0, crypto_1.randomUUID)(),
            document_type: plan.document_type,
            language: "en", // Drafter always produces English; Translator handles Indic
            content: llmResponse.text,
            citations,
            traces: [], // populated below after trace is built
            created_at: new Date().toISOString(),
        };
        // Build and persist the audit trace
        const trace = (0, index_js_2.buildTrace)({
            agent: "drafter",
            llmResponse,
            cited_nodes: citedNodes,
            status: "ok",
            session_id,
        });
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000", document_id: draft.id });
        // Attach this trace to the draft so downstream agents see the full chain
        draft.traces = [trace];
        return { draft, trace };
    }
    catch (error) {
        const trace = (0, index_js_2.buildErrorTrace)("drafter", error, session_id);
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000" });
        // Re-throw with trace attached so the pipeline orchestrator can surface it
        const err = error instanceof Error ? error : new Error(String(error));
        err.trace = trace;
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
async function reviseDraft(original, revisionHint, session_id) {
    try {
        const revisionPrompt = (0, drafter_prompt_js_1.buildDrafterRevisionPrompt)(original.content, revisionHint);
        const isRti = original.document_type === "rti_application";
        const systemPrompt = isRti ? drafter_prompt_js_1.RTI_DRAFTER_SYSTEM_PROMPT : drafter_prompt_js_1.DRAFTER_SYSTEM_PROMPT;
        const llmResponse = await index_js_1.router.run("drafter", systemPrompt, revisionPrompt);
        const rawCitations = (0, citations_js_1.extractCitations)(llmResponse.text);
        const citedNodes = (0, citations_js_1.extractNodeIds)(llmResponse.text);
        // Resolve real snapshot IDs asynchronously
        const citations = await Promise.all(rawCitations.map(async (citation) => {
            try {
                const res = await (0, pageindex_1.getPageIndex)().get_text({ node_id: citation.node_id });
                if (res) {
                    return {
                        ...citation,
                        snapshot_id: res.snapshot_id,
                    };
                }
            }
            catch (err) {
                console.warn(`[Drafter] Failed to resolve snapshot_id for node_id "${citation.node_id}":`, err);
            }
            return citation;
        }));
        const draft = {
            id: (0, crypto_1.randomUUID)(), // new ID for the revised version
            document_type: original.document_type,
            language: original.language,
            content: llmResponse.text,
            citations,
            traces: [...original.traces], // carry forward all prior traces
            created_at: new Date().toISOString(),
        };
        const trace = (0, index_js_2.buildTrace)({
            agent: "drafter",
            llmResponse,
            cited_nodes: citedNodes,
            status: "ok",
            session_id,
        });
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000", document_id: original.id });
        draft.traces.push(trace);
        return { draft, trace };
    }
    catch (error) {
        const trace = (0, index_js_2.buildErrorTrace)("drafter", error, session_id);
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000", document_id: original.id });
        const err = error instanceof Error ? error : new Error(String(error));
        err.trace = trace;
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
class DrafterAgent {
    name = "drafter";
    /**
     * Run the Drafter agent to produce an initial draft.
     */
    async run(input) {
        return runDrafter(input);
    }
    /**
     * Revise an existing draft based on Reviewer feedback.
     *
     * @param original     - The draft to revise.
     * @param revisionHint - Plain-text summary of required changes.
     * @param session_id   - Optional session ID for trace linking.
     */
    async revise(original, revisionHint, session_id) {
        return reviseDraft(original, revisionHint, session_id);
    }
}
exports.DrafterAgent = DrafterAgent;
//# sourceMappingURL=drafter.agent.js.map