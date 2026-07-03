# RFC: Drafter Agent

**File:** `docs/RFC-drafter-agent.md`  
**Author:** Jenil Sutariya (@jenil-sutariya) — Team C (Agents)  
**Status:** Draft → Ready for Review  
**Created:** Week 1 — May 2026  
**Issue:** [#drafter](https://github.com/Trionic-Interns/trionic-ai-adalat/issues/)  
**Reviewers:** Malay Sheta (agents lead), Hitarth Sherathia (Citator), Dhruv Lokadiya / Sohil Kareliya (repo managers)  
**Escalation:** Team lead @malaysheta · Repo managers @Dhruv5353 / @Sohil2085

---

## 1. Purpose

This document defines the design of the **Drafter agent** — the core content-generation step in the Trionic Adalat pipeline. The Drafter:

1. Receives the `PlannerOutput` (document type, applicable acts, PageIndex query hints, template ID).
2. Writes a complete legal document draft in Markdown.
3. **Emits an inline `[CITE:<node_id>]` marker immediately after every legal claim**, so the Citator-gatekeeper can validate each one.
4. Prepends the mandatory "AI-generated draft — not legal advice" banner.
5. Returns a `DocumentDraft` + `AgentTrace` for persistence.

The non-negotiable rule, repeated for emphasis:

> **Every legal claim must carry a `[CITE:<node_id>]` marker. No exceptions.  
> The Citator-gatekeeper will BLOCK any un-cited legal claim.**

---

## 2. Pipeline Placement

```
Classifier → Planner → PageIndex → [Drafter] → Citator-gatekeeper → Reviewer → Translator? → persist
```

| Stage | Responsibility |
|-------|----------------|
| **Planner** (Malay) | Decides doc type, template, PageIndex query hints, applicable acts |
| **Drafter** (this RFC) | Writes the draft with `[CITE:<node_id>]` markers on every legal claim |
| **Citator-gatekeeper** (Hitarth) | Validates every `[CITE]` marker resolves to a real PageIndex node; blocks un-grounded spans |
| **Reviewer** (Evan) | Checks completeness, tone, banner presence; may send draft back to Drafter for revision |

---

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Legal claim** | Any statement asserting a specific legal right, obligation, penalty, procedure, or section of Indian law |
| **Free prose** | Explanatory text, analogies, procedural notes without asserting specific law — does not require citation |
| **`[CITE:<node_id>]`** | Inline marker emitted by the Drafter immediately after a cited clause |
| **`node_id`** | A PageIndex node identifier. Format: `<ACT_CODE>/<CHAPTER>/<SECTION>` e.g. `ICA-1872/CH-VI/S-73` |
| **Banner** | The mandatory disclaimer: `AI-generated draft — not legal advice.` |
| **Revision** | A second (or third) Drafter call driven by Reviewer feedback, capped at 2 retries |

---

## 4. Inline Citation Marker Specification

### 4.1 Format

```
[CITE:<node_id>]
```

- Placed **immediately** (no space) after the full stop or clause it supports.
- One marker per cited clause. If two acts are cited in one sentence, emit two markers.
- Node ID format matches `PageIndexNodeId` from `packages/shared/src/types.ts`.

### 4.2 Examples

**RTI Application — Section citing:**
```markdown
Under the Right to Information Act, 2005, every citizen has the right to request information
from a public authority [CITE:RTI-2005/CH-II/S-3]. The public authority must respond within
30 days of receipt of the request [CITE:RTI-2005/CH-II/S-7].
```

**Consumer Complaint — Penalty clause:**
```markdown
The opposite party's failure to deliver the product constitutes a deficiency in service as
defined under Section 2(11) of the Consumer Protection Act, 2019 [CITE:CPA-2019/CH-I/S-2].
The complainant is entitled to seek compensation under Section 39(1)(d) [CITE:CPA-2019/CH-IV/S-39].
```

**NDA — Contract act reference:**
```markdown
This Agreement is governed by and construed in accordance with the Indian Contract Act, 1872
[CITE:ICA-1872/CH-I/S-1]. Any breach of confidentiality obligations shall render the
defaulting party liable for damages under Section 73 [CITE:ICA-1872/CH-VI/S-73].
```

**Free prose — NO citation needed:**
```markdown
This Notice is issued without prejudice to all other rights and remedies available
to the Complainant in law and equity.
```

### 4.3 Prohibited Patterns

| Pattern | Why |
|---------|-----|
| `[CITE:UNRESOLVED]` | Placeholder — Citator will block; LLM must not emit this |
| Bare legal claim without `[CITE:...]` | Citator BLOCK — treat as hallucination |
| `[CITE:]` with empty node_id | Invalid — treated as missing citation |
| Stacking: `[CITE:A][CITE:B]` | Allowed when two acts apply to the same clause |

---

## 5. Drafter → Citator-gatekeeper Handoff

The Drafter passes its output directly into `CitatorInput`. The contract:

```typescript
// What the Drafter produces:
interface DrafterResult {
  draft: DocumentDraft;   // draft.content has [CITE:<node_id>] markers inline
  trace: AgentTrace;      // trace.cited_nodes = all node IDs extracted from content
}

// DocumentDraft.citations[] is populated by the Drafter via regex extraction:
type Citation = {
  node_id: PageIndexNodeId;    // e.g. "RTI-2005/CH-II/S-3"
  snapshot_id: SnapshotId;     // currently "2024-12-01" until PageIndex resolves real snapshots
  span: [number, number];      // char offsets [start, end] of the cited clause in draft.content
};
```

The **Citator-gatekeeper** then:
1. Parses `draft.content` with the regex `/\[CITE:([^\]]+)\]/g`.
2. Validates each `node_id` against the PageIndex tree.
3. Rejects any span where the node_id doesn't resolve.

The Drafter must **never** strip or post-process `[CITE:...]` markers — pass the raw LLM output through.

---

## 6. Input / Output Types

### DrafterInput (extends the scaffold)

```typescript
export interface DrafterInput {
  /** Plan produced by the Planner agent. */
  plan: PlannerOutput;
  /** Raw intake text from the user — gives the LLM drafting context. */
  intakeText: string;
  /** Optional session ID for trace attribution and RLS scoping. */
  session_id?: string;
}
```

> **Note:** `intakeText` is added to the existing scaffold. The current stub throws unconditionally,
> so there is no breaking downstream consumer yet.

### DrafterResult

```typescript
export interface DrafterResult {
  draft: DocumentDraft;   // from @trionic/shared
  trace: AgentTrace;      // from @trionic/shared
}
```

`DocumentDraft` (from `packages/shared/src/types.ts`):
- `id` — UUID generated by Drafter.
- `document_type` — copied from `plan.document_type`.
- `language` — `"en"` in v1 (Translator handles Indic).
- `content` — full Markdown with `[CITE:...]` markers.
- `citations` — array extracted by regex from content.
- `traces` — `[trace]` (single-element for now; Reviewer appends its trace later).
- `created_at` — ISO timestamp.

### Revision Entry-Point (for Reviewer retry loop)

```typescript
// On DrafterAgent class:
async revise(
  original: DocumentDraft,
  hint: string,   // ReviewerRevisionHint.summary — plain string in Week 1
  session_id?: string
): Promise<DrafterResult>
```

---

## 7. Prompt Strategy

### System Prompt (high-level)

The system prompt enforces:
1. **Citation-or-die**: every legal claim must end with `[CITE:<node_id>]`.
2. **Banner first**: the disclaimer appears as the first paragraph.
3. **Tone**: formal, professional, third-person. No first-person guarantees, no advice.
4. **JSON output**: the LLM returns raw Markdown (not JSON) for the draft.
5. **Act codes**: only use codes supplied by the Planner (no invention).

### User Prompt

Built from `PlannerOutput`:
- Document type + template_id.
- Applicable acts + PageIndex query hints.
- User's original intake text (for context).
- Explicit reminder: "Every legal claim must have a [CITE:<act_code>/<chapter>/<section>] marker."

### Revision Prompt

Appends the Reviewer's `revision_hint.summary` to the original draft with the instruction:
"Revise the following draft to address the reviewer's feedback. Preserve all existing [CITE:...] markers unless they are factually wrong."

---

## 8. Week 1 Compromise — PageIndex Node IDs

PageIndex retrieval (Team D — Samarth Kachhadiya) is not yet wired as an Agno tool. For Week 1:

- The Planner's `plan.pageindex_queries` are injected into the user prompt as retrieval **hints**.
- The LLM is instructed to derive node IDs from the act codes in `plan.applicable_acts` using the
  canonical format: `<ACT_CODE>/<CHAPTER_PLACEHOLDER>/<SECTION>`.
- Example: for RTI Act Section 7, the LLM emits `[CITE:RTI-2005/CH-II/S-7]`.

**Week 2+**: The Drafter will call `pageindexTool.query(query)` for each query in `plan.pageindex_queries`
before the LLM call, inject real node IDs + text into the prompt context, and use those exact IDs.

---

## 9. Tracing

The `AgentTrace` emitted by the Drafter includes:
- `agent: "drafter"`
- `cited_nodes: string[]` — all unique node IDs extracted from the draft with the citation regex.
- `status: "ok" | "error"` — `"rejected"` is set by the Citator downstream, not the Drafter.

---

## 10. Testing Plan

| Test | Type | What it checks |
|------|------|----------------|
| Happy path — `runDrafter()` returns `DrafterResult` | Unit | Shape of result, no throw |
| Draft content contains `[CITE:...]` markers | Unit | Regex match on mock LLM output |
| `trace.cited_nodes` matches extracted node IDs | Unit | Citation extraction correctness |
| `trace.status === "ok"` on success | Unit | Trace building |
| LLM throws → trace has `status: "error"`, no rethrow | Unit | Error path isolation |
| `DrafterAgent.revise()` passes hint to LLM | Unit | Revision prompt construction |

All tests use `vi.mock()` for router + tracing (no real API calls).

```bash
pnpm --filter @trionic/agents test
```

---

## 11. Acceptance Criteria (Week 1)

- [ ] `docs/RFC-drafter-agent.md` merged via PR.
- [ ] `runDrafter()` no longer throws — returns a valid `DrafterResult`.
- [ ] Every `[CITE:<node_id>]` in mock output is extracted into `draft.citations[]`.
- [ ] `trace.cited_nodes` is populated with extracted node IDs.
- [ ] All vitest tests pass (no real LLM calls in CI).
- [ ] TypeScript compiles cleanly (`pnpm --filter @trionic/agents build`).
- [ ] `DrafterAgent.revise()` exposed for Reviewer's retry loop.

---

## 12. Open Questions

- [ ] **PageIndex tool API (Week 2)**: What does `pageindexTool.query()` return? Need exact shape from Samarth (Team D) before wiring.
- [ ] **Snapshot ID resolution**: Currently hardcoded to `"2024-12-01"`. Should the Drafter receive snapshot IDs from the Planner, or resolve them from PageIndex at query time?
- [ ] **Multi-language drafting**: Drafter currently outputs English only. For Week 3+ Indic drafts, should the LLM draft in the target language, or draft English and let Translator handle it? Proposal: English-first; Translator always runs after.
- [ ] **Max draft length**: Router config sets `maxTokens: 4096`. Is this sufficient for an employment contract (typically 5–8 pages)? May need to bump to 8192 for Week 4.
- [ ] **`revise()` type safety**: Week 1 accepts `hint: string`. Week 2: import `ReviewerRevisionHint` from Reviewer once it's stable.

---

## 13. Out of Scope (this RFC)

- PageIndex tree-building (Team D — `packages/pageindex`)
- Citation UI rendering (Team A — `apps/web`)
- Eval harness for citation accuracy (Team F — `packages/evals`)
- Translation of the draft (Team E — `packages/translation`)
- Citator validation logic (Hitarth — `packages/agents/src/citator`)

---

*Last updated: Week 1, May 2026 — Jenil Sutariya*  
*Next review: Week 2 sync with Hitarth (Citator handoff) and Samarth (PageIndex tool API)*
