# Week 1 — Maharshi Patel

**Team:** Team C — Agents
**Module owned:** Translator Agent (`packages/agents` — translator handoff with Team E)
**Week of:** 2026-05-12 → 2026-05-19

---

## What I shipped this week

- **RFC-2026-002: Translator Agent Design** — [`docs/rfcs/RFC-translator-agent.md`](../../docs/rfcs/RFC-translator-agent.md)
  - Commits: [`daf8749`](https://github.com/Trionic-Interns/trionic-ai-adalat/commit/daf8749) (initial RFC), [`e12e645`](https://github.com/Trionic-Interns/trionic-ai-adalat/commit/e12e645) (approval table fix)
  - Designed the **Strip → Placeholder → Translate → Re-inject** strategy for `[CITE:<node_id>]` citation marker preservation using Unicode `⟦CITE_N⟧` placeholders (U+27E6/U+27E7) — guarantees markers survive LLM translation deterministically, with validation that catches any drop or duplication before the output reaches the Citator-gatekeeper
  - Defined the `GlossaryEntry` interface and `lookupGlossary(nodeIds, targetLang)` contract with Team E, including a graceful fallback when the glossary is unavailable (agent continues in fallback mode rather than blocking the user)
  - Defined `CitationSpan` and `CitationMap` TypeScript types capturing both original and translated character offsets per citation
  - Defined `postProcess(lang: SupportedLanguage, text: string)` handoff interface for Team E's per-language post-processors (Devanagari numeral formatting, Marathi gender agreement, Tamil grantha usage, etc.)
  - Specified the full 10-step agent flow including LLM Router call (model resolved by Yug's Router, not hardcoded), `agent_traces` row write (hard requirement from `PROJECT_BRIEF.md §10`), and `TranslationResult` output type
  - Documented the `TRANSLATION_GLOSSARY_STUB=true` env-var pattern so Week 2 implementation can begin without waiting for Team E's live glossary
  - Raised 5 open questions with correct owners tagged (Q1–Q5: GlossaryEntry snapshot field, async postProcess, CitationDropError retry policy, citation format `@snapshot_id` suffix, numeral normalisation inside `[CITE:...]`)
  - RFC submitted for review to: @malaysheta (Team C lead), Megh Patel (Team E lead), Hitarth Sherathia (Citator-gatekeeper owner)

## Demo

<!-- Loom link to be added before Friday 5 PM IST -->

Walk-through plan (60 s):
1. Open [`RFC-translator-agent.md`](../../docs/rfcs/RFC-translator-agent.md) — show the 10-step agent flow diagram
2. Highlight the placeholder strategy (§4): why the LLM never sees `[CITE:...]` raw
3. Show the `CitationSpan` type and the validation step that catches drops/duplicates
4. Show the `lookupGlossary` interface + glossary stub pattern for Week 2

## Metrics

| Metric | Value | Notes |
|---|---|---|
| RFC sections completed | 9 / 9 | Summary, motivation, glossary handoff, citation preservation, post-processing, agent flow, open questions, rejected alternatives, approval table |
| Design decisions documented | 3 | Glossary handoff contract, citation placeholder strategy, per-language post-processing handoff |
| Open questions raised | 5 | Q1–Q5 tagged to correct owners; all are pre-Week 2 blockers |
| Alternatives considered and documented | 3 | Raw LLM instruction, agent-owned post-processing, monolithic multi-language prompt |
| Commits merged to `main` | 2 | `daf8749`, `e12e645` |

## Blockers

- **[BLOCKS Week 2 impl]** Hitarth Sherathia — confirm whether citation format will be `[CITE:<node_id>]` or `[CITE:<node_id>@<snapshot_id>]` (RFC Q4). This changes the `CitationSpan` type and the regex used in the strip step.
- **[BLOCKS Week 2 impl]** Megh Patel (Team E) — confirm `GlossaryEntry` field names, especially whether `snapshot_id` lives on the entry or is assumed latest (RFC Q1).
- **[PENDING]** @malaysheta — RFC review + approval needed before I self-merge branch `agents/translator-agent-rfc`.

## Next week

- Implement `TranslatorAgent` skeleton in `packages/agents/src/translator.ts` (using the RFC as the spec, unblocked by stub)
- Wire up `lookupGlossary` mock via `TRANSLATION_GLOSSARY_STUB=true`; make the full 10-step flow runnable in a test harness
- Write unit tests for the Strip → Placeholder → Re-inject logic: cover citation drop, citation duplication, empty-citation-map, and same-node-cited-twice edge cases
- Sync with Megh Patel to agree on `GlossaryEntry` shape (targeting Mon/Tue)
- Confirm citation format with Hitarth; update `CitationSpan` type accordingly

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>
