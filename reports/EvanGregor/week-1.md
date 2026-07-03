# Week 1 — Evan Gregor

**Team:** Team C — Agent Layer
**Module owned:** Reviewer agent (`packages/agents/src/reviewer/`)
**Week of:** 2026-05-19

---

## What I shipped this week

- Authored `docs/RFC-reviewer-agent.md` — full design spec covering all three checks (completeness, tone, banner), TypeScript contracts, retry/rejection policy, orchestrator integration, and a week-by-week rollout plan.
- Opened the Week-1 RFC PR for issue #15.
- Designed the three-check architecture:
  - **Banner check** — deterministic, no LLM, auto-patch on first failure
  - **Completeness check** — LLM + structured JSON schema against `DocTypeTemplate`
  - **Tone check** — LLM + rubric (formal/professional, non-advisory)
- Defined TypeScript contracts for `ReviewerInput`, `ReviewerResult`, `AgentTrace` metadata, and `ReviewerRevisionHint` (proposed for `packages/shared`).
- Documented the orchestrator retry loop (Reviewer → Drafter revision → Citator re-run → Reviewer) to enforce the Citation-or-die constraint.

---

## Demo

Successfully architected the Reviewer agent pipeline, which acts as the final quality gate before translation and export. 

Key design artifacts produced in the RFC:

* **The Banner Check:** A deterministic fallback mechanism ensuring the 'not legal advice' disclaimer is always present.
* **The Completeness Check:** An LLM-driven schema strategy to validate the draft against Planner templates.
* **The Tone Check:** A strict rubric blocking advisory, informal, or threatening language.

The design securely delegates all citation validation to the Citator-gatekeeper to uphold the strict 'Citation-or-die' constraint, while establishing a maximum 2-retry loop with the Drafter for tone and completeness fixes.

---

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Doc types in RFC | 5 | RTI, legal notice, NDA, consumer complaint, employment contract |
| Alternatives documented | 6 | With reject reasoning in RFC |
| Open questions | 6 | Tagged to Dhruv, Malay, Hitarth, Kaushal, Yug, Maharshi |
| LLM calls on banner path | 0 | Deterministic by design |

---

## Blockers

- Citator-gatekeeper RFC (`docs/RFC-citator-gatekeeper.md`) not yet published — need to confirm the exact handoff fields (`draft_markdown`, `cited_nodes[]`) with Hitarth Sherathia before Week 2 implementation starts.
- LLM Router skeleton (Yug Gandhi) not yet available — Week 2 Reviewer skeleton will mock the router until it's wired.
- Exact `LEGAL_DISCLAIMER_BANNER` string needs sign-off from Dhruv/Sohil before it can be committed to `packages/shared`.

---

## Next week

- Address review comments on the RFC PR from Malay / Hitarth.
- Implement `reviewerAgent` skeleton in `packages/agents/src/reviewer/`:
  - `checkBanner()` as a pure function with unit tests and golden-file fixtures (pass/fail strings).
  - Mock LLM calls returning fixture `CompletenessReport` and `ToneReport`.
  - Wire into mock pipeline end-to-end.
- Submit a types PR to `packages/shared` with `ReviewerInput`, `ReviewerResult`, and related interfaces — pending repo-manager review.
- Sync with Hitarth on Citator handoff fields once his RFC is posted.
- Sync with Yug on `reviewer.completeness` / `reviewer.tone` routing keys for LLM Router config.

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)
> Excellent Week-1 progress. The Reviewer agent architecture, retry-loop design, and deterministic banner validation are very well structured and show strong systems-thinking aligned with the Citation-or-die workflow requirements.

