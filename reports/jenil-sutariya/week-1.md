# Week 1 — Jenil Sutariya

**Team:** Team C — Agent Layer
**Module owned:** Drafter agent (`packages/agents/src/drafter`)
**Week of:** 2026-05-19

---

## What I shipped this week

- Authored `docs/RFC-drafter-agent.md` — full design RFC defining the `[CITE:<node_id>]` inline citation marker format, Citator-gatekeeper handoff contract, prompt strategy, Week 1 PageIndex compromise, and open questions for Week 2.
- Implemented `packages/agents/src/drafter/types.ts` — `DrafterInput` and `DrafterResult` type definitions.
- Implemented `packages/agents/src/drafter/citations.ts` — pure citation extraction utilities: `extractCitations()`, `extractNodeIds()`, `CITE_MARKER_REGEX`, `PROVISIONAL_SNAPSHOT_ID`.
- Implemented `packages/agents/src/drafter/drafter.prompt.ts` — `DRAFTER_SYSTEM_PROMPT` (citation-or-die rules, banner requirement, tone rules), `buildDrafterUserPrompt()`, `buildDrafterRevisionPrompt()`.
- Implemented `packages/agents/src/drafter/drafter.agent.ts` — `runDrafter()`, `reviseDraft()`, `DrafterAgent` class (Agno-compatible with `run()` + `revise()` for Reviewer retry loop).
- Implemented `packages/agents/src/drafter/index.ts` — clean public barrel re-exporting all of the above.
- Wrote `packages/agents/src/drafter/citations.test.ts` — 21 unit tests for citation extraction utilities (pure, no mocks).
- Wrote `packages/agents/src/drafter/drafter.test.ts` — 24 integration tests for `runDrafter()`, `reviseDraft()`, `DrafterAgent` (mocked router + tracing).
- Added `packages/agents/tsconfig.test.json` — resolves `@trionic/shared` path alias in test files for VS Code language server.
- Built `@trionic/shared` to generate `dist/` (was missing, blocked module resolution).

---

## Demo

The Drafter agent accepts a `PlannerOutput` + user intake text and produces a complete legal document draft in Markdown. Every legal claim is automatically followed by a `[CITE:<node_id>]` marker that the Citator-gatekeeper can parse and validate.

**Example output snippet (Consumer Complaint):**

```
The said product was found to be defective upon delivery, constituting a deficiency
in service as defined under Section 2(11) of the Consumer Protection Act, 2019
[CITE:CPA-2019/CH-I/S-2].

The Complainant is entitled to seek compensation under Section 39(1)(d)
[CITE:CPA-2019/CH-IV/S-39].
```

Citation extraction (`extractCitations`) automatically resolves these markers into `Citation[]` objects with char offsets, and `trace.cited_nodes` is populated for the eval/audit pipeline.

---

## Metrics

| Metric | Value | Notes |
|---|---|---|
| Test cases written | 45 | 21 citation unit tests + 24 agent tests |
| Tests passing | 45 / 45 | `pnpm --filter @trionic/agents test src/drafter/` |
| TypeScript errors | 0 | `tsc --noEmit` clean |
| Files in drafter module | 7 | types, citations, agent, prompt, index, 2 test files |
| Citation marker format defined | `[CITE:<node_id>]` | Matches Citator-gatekeeper regex spec |
| Revision entry-point exposed | `DrafterAgent.revise()` | Ready for Reviewer retry loop |

---

## Blockers

- **PageIndex tool API (Team D — Samarth):** Week 1 uses provisional node IDs derived from act codes by the LLM. Need `pageindexTool.query()` return shape to wire real node IDs in Week 2.
- **Citator `CitatorInput` shape (Hitarth):** Need confirmation that `DrafterResult.draft` (with `content` + `citations[]`) matches what `runCitator()` expects as input.
- **Reviewer `ReviewerRevisionHint` type (Evan):** `DrafterAgent.revise()` currently accepts `string`. Will import the proper type from the reviewer package once it's stable.

---

## Next week

- Wire real `pageindexTool.query()` calls before the LLM prompt (Week 2 — blocked on Team D API shape).
- Confirm `CitatorInput` handoff with Hitarth and write an integration test through the full `Drafter → Citator` chain.
- Import `ReviewerRevisionHint` type from the Reviewer package once Evan's interface is merged.
- Add snapshot ID resolution (currently hardcoded `"2024-12-01"`).
- Explore bumping `maxTokens` from 4096 → 8192 for `employment_contract` doc type (typically longer).

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <!-- repo manager writes 1 line here -->
