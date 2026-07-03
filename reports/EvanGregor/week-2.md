# Week 2 — Evan Gregor

**Team:** Team C — Agent Layer
**Module owned:** Reviewer agent (`packages/agents/src/reviewer/`)
**Week of:** 2026-05-26

---

## What I shipped this week

- Implemented the full Reviewer agent in `packages/agents/src/reviewer/index.ts` — three checks (banner, completeness, tone) with aggregated pass/fail logic and structured tracing.
- Built `reviewer.prompt.ts` — system and user prompts for LLM-based tone analysis via the Router (`"reviewer"` step key → Gemini).
- Wrote 20 unit tests in `reviewer.test.ts` covering all three checks, full `runReviewer()` flow, graceful Gemini-stub fallback, error propagation, and `ReviewerAgent` class delegation.
- `ReviewerResult` extends the locked `ReviewerOutput` from `@trionic/shared` (no type redefinition) and adds `trace: AgentTrace`.
- All acceptance criteria from issue #112 satisfied: banner detection, per-doc-type completeness (RTI: Address, Subject, Information Sought, Declaration), real Router call for tone, and `trace.status = "rejected"` with descriptive `error_message` on failure.
- Opened PR #140 on the `agents/reviewer-week-2` branch — merged into `main`.

---

## Demo

**Scenario 1 — Banner missing:** Pass a complete RTI draft without the disclaimer banner → Reviewer returns `approved: false`, `banner_present: false`, `trace.status: "rejected"`, `error_message: "Missing disclaimer banner"`.

**Scenario 2 — Complete RTI:** Pass a complete RTI draft (banner + all 4 sections + clean tone) → Reviewer returns `approved: true`, `banner_present: true`, `missing_required_sections: []`, `tone_issues: []`, `trace.status: "ok"`.

**Scenario 3 — Incomplete RTI:** Pass an RTI draft missing "Information Sought" and "Declaration" → Reviewer returns `approved: false`, `missing_required_sections: ["Information Sought", "Declaration"]`.

**Scenario 4 — Tone issues:** LLM flags informal/advisory language → Reviewer returns `approved: false`, `tone_issues` populated with specific flagged phrases.

All scenarios verified by the 20-test Vitest suite (0 failures).

---

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Unit tests | 20 | All passing — banner (7), completeness (4), runReviewer (7), ReviewerAgent (2) |
| TypeScript errors | 0 | `tsc --noEmit` clean against locked `@trionic/shared` contracts |
| Files modified | 3 | `index.ts`, `reviewer.prompt.ts`, `reviewer.test.ts` — all in `src/reviewer/` |
| LLM calls per review | 1 | Tone only; banner + completeness are deterministic (zero LLM cost) |
| RTI required sections | 4 | Address, Subject, Information Sought, Declaration |
| Other doc-type sections | 0 | Empty for W2 (legal_notice, nda, consumer_complaint, cheque_bounce_notice) |

---

## Blockers

- Gemini provider is still stubbed (returns mock text, not real JSON). Tone analysis gracefully falls back to no issues detected. Unblocked — Yug's responsibility to wire Gemini; our code handles both stub and real responses.
- No blockers on other teams. Citator handoff confirmed (Reviewer runs after Citator approves). Router step key `"reviewer"` is registered in `router.config.ts`.

---

## Next week

- Add integration-level test with the real Router (once Gemini is un-stubbed by Yug).
- Expand `REQUIRED_SECTIONS` for `legal_notice` and `consumer_complaint` if Planner templates are finalized.
- Coordinate with Team B (orchestrator) to confirm `trace.status = "rejected"` correctly triggers their `step.error` SSE emission.
- Prepare 60-second Demo Day walkthrough showing banner-fail and RTI-pass scenarios.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> _pending_
