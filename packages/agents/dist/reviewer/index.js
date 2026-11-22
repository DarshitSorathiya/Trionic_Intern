"use strict";
/**
 * reviewer/index.ts
 * Owner: Evan Gregor
 * Module: packages/agents/src/reviewer
 *
 * The Reviewer agent is the last automated editorial step in the English
 * drafting pipeline. It runs AFTER the Citator-gatekeeper has approved
 * all citations. It performs three checks:
 *
 *   1. Banner check   — deterministic: exact-string match for disclaimer
 *   2. Completeness   — LLM-scored: semantic section detection via Router
 *   3. Tone check     — LLM-based: is the language formal, professional, non-advisory?
 *
 * Returns ReviewerOutput (from @trionic/shared) + AgentTrace.
 *
 * See: docs/RFC-reviewer-agent.md, Issue #112, Issue #185, Issue #277
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewerAgent = exports.REQUIRED_SECTIONS = exports.LEGAL_DISCLAIMER_BANNER = void 0;
exports.requiredSections = requiredSections;
exports.checkBanner = checkBanner;
exports.checkCompleteness = checkCompleteness;
exports.checkCompletenessLLM = checkCompletenessLLM;
exports.runReviewer = runReviewer;
const translation_1 = require("@trionic/translation");
const index_js_1 = require("../router/index.js");
const index_js_2 = require("../tracing/index.js");
const reviewer_prompt_js_1 = require("./reviewer.prompt.js");
// ─── Constants ────────────────────────────────────────────────────────────────
/**
 * The canonical "not legal advice" disclaimer banner.
 * Must appear in the first 2,000 characters of every draft.
 */
exports.LEGAL_DISCLAIMER_BANNER = `---\n**AI-generated draft — not legal advice.** This document was produced by ` +
    `Trionic Adalat to assist with drafting only. It is not a substitute for advice ` +
    `from a qualified legal professional. Verify all citations and facts before use.\n---`;
/**
 * Exact-string to match in the first 2,000 characters.
 * Week 3: tightened from regex to exact match per AC5 (#185).
 */
const BANNER_EXACT = "AI-generated draft \u2014 not legal advice";
/**
 * Per-doc-type required sections.
 * Week 4 (#277): all 5 doc types now have required sections.
 * Exported for sharing with Sohil's editor.
 */
exports.REQUIRED_SECTIONS = {
    rti_application: ["Address", "Subject", "Information Sought", "Declaration", "Date and Signature"],
    legal_notice: ["Parties", "Cause of Action", "Demand and Relief", "Timeline", "Governing Law"],
    nda: ["Parties", "Definitions", "Confidential Information", "Obligations", "Term and Termination", "Governing Law", "Signatures"],
    consumer_complaint: ["Complainant Details", "Opposite Party", "Facts of Transaction", "Deficiency of Service", "Relief Sought", "Jurisdiction"],
    cheque_bounce_notice: ["Drawer Details", "Payee Details", "Cheque Details", "Dishonour Details", "Demand for Payment", "Legal Warning"],
};
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Returns the list of required section names for a given document type.
 * AC1 (#277): Reviewer.requiredSections(doc_type) → correct list per type.
 */
function requiredSections(docType) {
    return exports.REQUIRED_SECTIONS[docType] ?? [];
}
// ─── Check functions ──────────────────────────────────────────────────────────
/**
 * Banner check with multilingual support.
 * Returns true if the canonical banner lead-in appears in the first 2,000 chars.
 * Week 3: tightened from regex to exact match per AC5 (#185).
 * Week 4 (#277): added glossary lookup for translated banners (AC3).
 */
function checkBanner(draftMarkdown, language) {
    const head = draftMarkdown.slice(0, 2000);
    if (head.includes(BANNER_EXACT)) {
        return true;
    }
    if (language !== "en") {
        const lookupResult = translation_1.glossary.lookup(BANNER_EXACT, language);
        if (lookupResult && lookupResult.translation) {
            return head.includes(lookupResult.translation);
        }
    }
    return false;
}
/**
 * Deterministic completeness check (fallback).
 * Returns the list of MISSING required section names using simple string matching.
 * Used as fallback when LLM scoring is unavailable.
 */
function checkCompleteness(draftMarkdown, docType) {
    const required = exports.REQUIRED_SECTIONS[docType] ?? [];
    const lower = draftMarkdown.toLowerCase();
    return required.filter((section) => !lower.includes(section.toLowerCase()));
}
/**
 * LLM-scored completeness check.
 * Calls the Router to semantically match required section headings or equivalents.
 * Falls back to deterministic checkCompleteness() on LLM failure.
 * AC2 (#185): "use the LLM to score" semantic equivalents.
 */
async function checkCompletenessLLM(draftMarkdown, docType) {
    const required = exports.REQUIRED_SECTIONS[docType] ?? [];
    if (required.length === 0)
        return { missing: [] };
    try {
        const userPrompt = (0, reviewer_prompt_js_1.buildSectionScoringUserPrompt)(draftMarkdown, required);
        const llmResponse = await index_js_1.router.run("reviewer", reviewer_prompt_js_1.REVIEWER_SECTION_SYSTEM_PROMPT, userPrompt);
        const parsed = JSON.parse(llmResponse.text);
        if (parsed.sections && typeof parsed.sections === "object") {
            const missing = required.filter((section) => parsed.sections[section] !== "found");
            return { missing, llmResponse };
        }
    }
    catch {
        // LLM call failed or returned invalid JSON — fall back to deterministic
    }
    // Deterministic fallback
    const lower = draftMarkdown.toLowerCase();
    const missing = required.filter((s) => !lower.includes(s.toLowerCase()));
    return { missing };
}
// ─── Agent ────────────────────────────────────────────────────────────────────
/**
 * Run the Reviewer agent on a citator-approved draft.
 *
 * Steps:
 *   1. checkBanner()          — deterministic exact-string match
 *   2. checkCompletenessLLM() — LLM-scored semantic section detection
 *   3. Tone analysis          — LLM call via Router ("reviewer" step)
 *   4. Aggregate → ReviewerResult
 *   5. Build and persist AgentTrace
 *
 * @throws On infrastructure errors (both LLM calls fail). Business failures
 *         (banner missing, sections missing, tone issues) are returned as
 *         approved: false, trace.status: "rejected".
 */
async function runReviewer(input) {
    const { draft, session_id } = input;
    try {
        // 1. Banner check (deterministic exact-string or translated string)
        const banner_present = checkBanner(draft.content, draft.language);
        // 2. Completeness check (LLM-scored with deterministic fallback)
        const completenessResult = await checkCompletenessLLM(draft.content, draft.document_type);
        const missing_required_sections = completenessResult.missing;
        // 3. Tone check (LLM call via Router)
        const userPrompt = (0, reviewer_prompt_js_1.buildToneUserPrompt)(draft.content, draft.document_type);
        const toneLlmResponse = await index_js_1.router.run("reviewer", reviewer_prompt_js_1.REVIEWER_TONE_SYSTEM_PROMPT, userPrompt);
        // Parse tone issues from LLM response — graceful fallback on invalid JSON
        let tone_issues = [];
        try {
            const parsed = JSON.parse(toneLlmResponse.text);
            if (Array.isArray(parsed.tone_issues)) {
                tone_issues = parsed.tone_issues.filter((issue) => typeof issue === "string" && issue.length > 0);
            }
        }
        catch {
            // LLM returned non-JSON — no tone issues flagged
        }
        // 4. Aggregate
        const approved = banner_present &&
            missing_required_sections.length === 0 &&
            tone_issues.length === 0;
        const traceStatus = approved ? "ok" : "rejected";
        let error_message;
        if (!approved) {
            const reasons = [];
            if (!banner_present) {
                reasons.push("Missing disclaimer banner");
            }
            if (missing_required_sections.length > 0) {
                reasons.push(`Missing required sections: ${missing_required_sections.join(", ")}`);
            }
            if (tone_issues.length > 0) {
                reasons.push(`Tone issues flagged: ${tone_issues.join("; ")}`);
            }
            error_message = reasons.join(" | ");
        }
        // Build feedback and rejection_reason per docs/agents-package.md spec
        const feedback = approved
            ? "Draft approved — all checks passed."
            : error_message;
        const rejection_reason = approved ? undefined : error_message;
        // 5. Build and persist trace — use the tone LLM response for tracing
        //    (completeness LLM response is optional and may not exist on fallback)
        const trace = (0, index_js_2.buildTrace)({
            agent: "reviewer",
            llmResponse: toneLlmResponse,
            cited_nodes: [], // Reviewer does not emit citations
            status: traceStatus,
            session_id,
            error_message,
        });
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000", document_id: draft.id });
        return {
            approved,
            banner_present,
            missing_required_sections,
            tone_issues,
            feedback,
            rejection_reason,
            trace,
        };
    }
    catch (error) {
        const trace = (0, index_js_2.buildErrorTrace)("reviewer", error, session_id);
        await (0, index_js_2.persistTrace)(trace, { user_id: session_id || "00000000-0000-0000-0000-000000000000", document_id: draft.id });
        const err = error instanceof Error ? error : new Error(String(error));
        err.trace = trace;
        throw err;
    }
}
class ReviewerAgent {
    name = "reviewer";
    /** Returns the list of required section names for a given document type. */
    requiredSections(docType) {
        return requiredSections(docType);
    }
    async run(input) {
        return runReviewer(input);
    }
}
exports.ReviewerAgent = ReviewerAgent;
//# sourceMappingURL=index.js.map