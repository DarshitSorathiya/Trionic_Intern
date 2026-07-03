# RFC: Constitution of India — PageIndex Tree Design

**Author:** Darshit Sorathiya  
**Team:** PageIndex  
**Status:** Draft  
**Created:** 2026-05-20  
**Related issue:** PageIndex / Constitution tree RFC

---

## 1. Summary

This RFC proposes the tree structure for indexing the **Constitution of India** inside the Adalat PageIndex system. It defines the node hierarchy, node ID format, snapshot strategy, and notes structural quirks that must be handled to keep citations accurate and hallucination-free.

---

## 2. Source Document

| Property | Value |
|---|---|
| Authoritative source | Ministry of Law & Justice — [legislative.gov.in](https://legislative.gov.in/constitution-of-india) |
| Corpus path | `corpus/constitution/COI-<snapshot_date>.pdf` |
| Snapshot format | `YYYY-MM-DD` (e.g. `2024-12-01`) |
| Language | English (primary); Hindi version deferred to v2 |

The Constitution text used must be the **Ministry of Law official PDF**, not IndiaCode or any third-party reprint, to ensure article numbering is authoritative.

---

## 3. Document Structure Overview

The Constitution of India has a fixed but non-trivial hierarchy:

```
Constitution of India
├── Preamble                          (standalone, no Part)
├── Part I   — The Union and its Territory           (Arts. 1–4)
├── Part II  — Citizenship                           (Arts. 5–11)
├── Part III — Fundamental Rights                    (Arts. 12–35)
├── Part IV  — Directive Principles                  (Arts. 36–51)
├── Part IVA — Fundamental Duties                    (Art. 51A)   ← inserted by 42nd Amendment
├── Part V   — The Union                             (Arts. 52–151)
│   ├── Chapter I — The Executive
│   ├── Chapter II — Parliament
│   │   ├── General (Arts. 79–88)
│   │   ├── Officers of Parliament (Arts. 89–98)
│   │   ├── Conduct of Business (Arts. 99–100)
│   │   ├── Disqualifications (Arts. 101–104)
│   │   ├── Powers/Privileges (Arts. 105–106)
│   │   └── Legislative Procedure (Arts. 107–116)
│   ├── Chapter III — Legislative Powers of the President
│   ├── Chapter IV — The Union Judiciary
│   └── Chapter V — Comptroller and Auditor-General
├── Part VI  — The States                            (Arts. 152–237)
│   └── [Chapters I–IX, mirroring Part V structure]
├── Part VII — [Repealed by 7th Amendment]           ← QUIRK: tombstone node needed
├── Part VIII — Union Territories                    (Arts. 239–242)
├── Part IX  — Panchayats                            (Arts. 243–243O) ← inserted 73rd Amend.
├── Part IXA — Municipalities                        (Arts. 243P–243ZG) ← 74th Amend.
├── Part IXB — Co-operative Societies                (Arts. 243ZH–243ZT) ← 97th Amend.
├── Part X   — Scheduled & Tribal Areas              (Arts. 244–244A)
├── Part XI  — Relations between Union and States    (Arts. 245–263)
├── Part XII — Finance, Property, Contracts, Suits   (Arts. 264–300A)
├── Part XIII — Trade, Commerce and Intercourse      (Arts. 301–307)
├── Part XIV — Services Under the Union and States   (Arts. 308–323)
├── Part XIVA — Tribunals                            (Arts. 323A–323B) ← 42nd Amend.
├── Part XV  — Elections                             (Arts. 324–329A)
├── Part XVI — Special Provisions                    (Arts. 330–342A)
├── Part XVII — Official Language                    (Arts. 343–351)
├── Part XVIII — Emergency Provisions                (Arts. 352–360)
├── Part XIX — Miscellaneous                         (Arts. 361–367)
├── Part XX  — Amendment of the Constitution         (Art. 368)
├── Part XXI — Temporary/Transitional Provisions     (Arts. 369–392)
├── Part XXII — Short Title, Commencement, etc.      (Arts. 393–395)
└── Schedules
    ├── First Schedule  — States and Union Territories
    ├── Second Schedule — Salaries, Allowances, Privileges
    ├── Third Schedule  — Forms of Oaths/Affirmations
    ├── Fourth Schedule — Allocation of Seats in Rajya Sabha
    ├── Fifth Schedule  — Administration of Scheduled Areas/Tribes
    ├── Sixth Schedule  — Administration of Tribal Areas (NE)
    ├── Seventh Schedule — Union/State/Concurrent Lists
    ├── Eighth Schedule — Languages
    ├── Ninth Schedule  — Validation of Laws [Art. 31B]
    ├── Tenth Schedule  — Anti-Defection [Art. 102/191] ← 52nd Amend.
    ├── Eleventh Schedule — Panchayat subjects [Art. 243G] ← 73rd Amend.
    └── Twelfth Schedule — Municipality subjects [Art. 243W] ← 74th Amend.
```

---

## 4. Proposed Node ID Format

```
COI/<snapshot_id>/<part>/<chapter?>/<article>/<clause?>/<sub-clause?>
```

### Examples

| Level | Node ID | Human label |
|---|---|---|
| Document root | `COI/2024-12-01` | Constitution of India |
| Preamble | `COI/2024-12-01/PREAMBLE` | Preamble |
| Part | `COI/2024-12-01/PT-III` | Part III — Fundamental Rights |
| Chapter within Part | `COI/2024-12-01/PT-V/CH-II` | Part V, Chapter II — Parliament |
| Article | `COI/2024-12-01/PT-III/A-19` | Article 19 |
| Clause | `COI/2024-12-01/PT-III/A-19/CL-1` | Article 19(1) |
| Sub-clause | `COI/2024-12-01/PT-III/A-19/CL-1/SC-a` | Article 19(1)(a) |
| Schedule | `COI/2024-12-01/SCH-7` | Seventh Schedule |
| Schedule List | `COI/2024-12-01/SCH-7/LIST-I` | Union List |
| Schedule Entry | `COI/2024-12-01/SCH-7/LIST-I/E-1` | Entry 1 |

**Rules:**
- Segment separator: `/` (forward slash)
- Parts use Roman numerals suffixed with letter variants where they exist: `PT-IVA`, `PT-IXA`, `PT-XIVA`
- Chapters use `CH-<Roman>` within their Part scope
- Articles use `A-<number>` with suffix letter if present (e.g. `A-21A`, `A-31B`)
- Schedules use `SCH-<ordinal-digit>` (e.g. `SCH-7`, `SCH-11`)
- Snapshot is always the second segment, making every ID snapshot-pinned

This matches the project's `PageIndexNodeId = string` type in `packages/shared`.

---

## 5. Tree Depth and Granularity Strategy

| Level | Depth | Index as node? | Notes |
|---|---|---|---|
| Document root | 0 | Yes | Summary = full preamble text |
| Part | 1 | Yes | Summary = scope of the Part |
| Chapter (where exists) | 2 | Yes | Only Parts that have explicit chapter headings |
| Article | 2 or 3 | Yes | Core granularity unit for citations |
| Clause (numbered) | 3 or 4 | Yes | If article has sub-structure |
| Sub-clause (lettered) | 4 or 5 | Yes for rights/lists; skip for boilerplate | Avoid over-indexing procedural boilerplate |
| Explanation / Proviso | leaf | No — fold into parent clause | Too fine; add to parent node text |
| Schedule entry | variable | Yes | Each Schedule as node; Lists within Seventh Schedule as children |

The Drafter's `[CITE]` markers will resolve to **Article** level at minimum. Clause-level nodes are indexed so citations can be hyper-precise when needed (e.g., citing Art. 19(1)(a) specifically).

---

## 6. Structural Quirks and How to Handle Them

### 6.1 Repealed / Omitted Articles

Many articles have been **omitted** by amendments (e.g. Arts. 19(f), 31, 31A-31D area has complex history; Art. 37 is not enforceable). The official text retains the article heading with "Omitted" as content.

**Decision:** Index omitted articles as **tombstone nodes** with `status: "omitted"` in metadata. The Citator must treat citations to tombstone nodes as warnings, not hard errors. The Drafter should be instructed never to cite a tombstone as authority.

### 6.2 Part VII — Repealed Entirely

Part VII (States in Part B of the First Schedule) was deleted by the 7th Constitutional Amendment Act, 1956. The official text shows a blank or a note.

**Decision:** Create a single tombstone node `COI/.../PT-VII` with `status: "repealed"` and no children.

### 6.3 Amendments Embedded In-line vs. Separate

The Constitution PDF from legislative.gov.in embeds **amendment text inline** — the text already reflects all amendments up to the snapshot date. Amendment Acts themselves (e.g. the 42nd, 44th, 73rd Amendment Acts) are **separate acts** in the corpus and will get their own tree under a different root (e.g. `CAA-42/...`).

**Decision:** COI tree reflects the **consolidated text only**. Amendment Acts are **not** re-indexed inside the COI tree. Cross-references between the COI tree and amendment act trees are handled by the Citator, not the tree builder.

### 6.4 Parts with Letter Suffixes (IVA, IXA, IXB, XIVA)

These were inserted by amendment and their numbering is non-standard. They must be treated as **first-class Parts**, not sub-nodes of the preceding Part.

**Decision:** Encode them as `PT-IVA`, `PT-IXA`, `PT-IXB`, `PT-XIVA` at the same tree depth as other Parts.

### 6.5 Articles with Letter Suffixes

Articles like 21A (Right to Education, 86th Amendment), 31A, 31B, 31C, 31D, 243A–243O, 329A follow similar logic.

**Decision:** Use `A-21A`, `A-31B` etc. No special treatment needed beyond consistent naming.

### 6.6 Seventh Schedule — Three Lists

The Seventh Schedule contains three lists (Union, State, Concurrent) each with numbered entries. These are among the most-cited schedule items.

**Decision:** Index at three levels: `SCH-7` → `LIST-I / LIST-II / LIST-III` → `E-<n>`. Entry text is often a single line, so no further children needed.

### 6.7 Ninth Schedule — Dynamic Additions

The Ninth Schedule grows as Parliament adds laws to shield them from judicial review. The snapshot date ensures a fixed list.

**Decision:** Index each law entry in the Ninth Schedule by position number `E-<n>`. Citator should warn if an `E-<n>` reference exceeds the count in the snapshot.

### 6.8 Preamble Has No Part / Article Number

**Decision:** Top-level node `COI/<snapshot>/PREAMBLE`. No children; the Preamble is short enough to be a single leaf node with full text.

---

## 7. Node Schema (TypeScript, extends shared types)

```typescript
// packages/pageindex/src/types/constitution.ts

import type { PageIndexNodeId, SnapshotId } from "@adalat/shared";

export type ConstitutionNodeStatus = "active" | "omitted" | "repealed";

export interface ConstitutionNode {
  node_id: PageIndexNodeId;           // e.g. "COI/2024-12-01/PT-III/A-19/CL-1"
  snapshot_id: SnapshotId;
  title: string;                      // e.g. "Article 19 — Protection of certain rights"
  level: "document" | "part" | "chapter" | "article" | "clause" | "sub-clause" | "schedule" | "list" | "entry";
  status: ConstitutionNodeStatus;     // "active" | "omitted" | "repealed"
  text: string;                       // full text of this node (no children text)
  summary: string;                    // LLM-generated, ≤ 3 sentences
  start_page: number;                 // 1-indexed page in source PDF
  end_page: number;
  children?: ConstitutionNode[];
  amendment_note?: string;            // e.g. "Inserted by Constitution (42nd Amendment) Act, 1976"
}
```

---

## 8. PageIndex Tree Generation Plan

### Step 1 — Source ingestion
- Download official PDF from `legislative.gov.in`, store at `corpus/constitution/COI-2024-12-01.pdf`
- Run `run_pageindex.py --pdf_path ...` with `--model claude-sonnet-4-20250514` (via LLM Router)
- PageIndex auto-generates a raw tree from PDF headings

### Step 2 — Structural normalization
- Post-process the raw PageIndex output to apply our ID scheme (§4 above)
- Flag tombstone nodes (omitted articles, repealed parts)
- Validate that article count matches the official count (395 articles, with gaps for omissions)

### Step 3 — Summary generation
- For each node, generate a `summary` (≤ 3 sentences) via the LLM Router
- Summaries stored in `pageindex_nodes` table (Team B schema)

### Step 4 — Validation & eval
- Cross-check node IDs against a hand-curated list of 50 landmark articles
- Run eval suite (Team F) on 20 sample queries; target ≥ 95% citation accuracy

---

## 9. Database Mapping

The generated tree will be stored in:

```sql
-- packages/db schema (Team B owns migrations)
pageindex_trees (id, corpus_id, snapshot_id, doc_type, root_node_id, created_at)
pageindex_nodes (id, tree_id, node_id, parent_node_id, title, level, status, text, summary, start_page, end_page, amendment_note)
```

`node_id` values from this RFC map directly to the `Citation.node_id` field in `packages/shared`.

---

## 10. Out of Scope (v1)

- Hindi / regional language text of the Constitution (v2, Indic team)
- Full-text of amendment Acts as separate trees (v2, separate RFC)
- Case-law linking (v2, vector-RAG sidecar)
- Historical snapshots before 2024 (v2)

---

## 11. Open Questions

| # | Question | Owner | Due |
|---|---|---|---|
| 1 | Should Explanations and Provisos within Articles be indexed as separate child nodes or folded into the Article text? | Darshit + Tirth Dalal | Week 2 |
| 2 | What is the exact article count in the 2024-12-01 snapshot (accounting for omissions)? | Darshit | Week 1 |
| 3 | Does the LLM Router expose `claude-sonnet-4-20250514` for tree generation, or do we default to GPT-4o? | Yug Gandhi (LLM Router) | Week 1 |
| 4 | Confirm DB schema for `amendment_note` field with Team B (Om Patel) | Darshit + Om Patel | Week 2 |

---

## 12. References

- Constitution of India (official): https://legislative.gov.in/constitution-of-india
- IndiaCode: https://www.indiacode.nic.in
- PageIndex framework: https://pageindex.ai/blog/pageindex-intro
- Project architecture: `docs/ARCHITECTURE.md`
- Shared types: `packages/shared/src/types.ts`
