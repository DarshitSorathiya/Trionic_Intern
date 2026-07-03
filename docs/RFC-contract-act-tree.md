# RFC: Indian Contract Act 1872 — PageIndex Tree Design

**RFC ID:** RFC-PAGEINDEX-ICA-001  
**Author:** Mahi Pandey (`@MahiiPandey`)  
**Team:** D — PageIndex & Corpus  
**Status:** Draft  
**Created:** 2026-05-20  
**Depends on:** Tirth Dalal's spike (`packages/pageindex` scaffolding)  
**Reviewed by:** *(pending — tag @tiirth22)*

---

## 1. Summary

This RFC defines the production design for indexing the **Indian Contract Act, 1872 (ICA)** into a PageIndex tree. It specifies the node ID convention, what constitutes a leaf node, the snapshot/versioning policy, and how future amendments are handled. This is the ground truth that the Drafter and Citator-gatekeeper agents will rely on — every decision here directly affects citation integrity.

---

## 2. Context & motivation

The Citator-gatekeeper agent enforces the "citation-or-die" rule: every legal claim in a draft must resolve to a **real, live PageIndex node ID**. If the tree is malformed, mis-keyed, or silently stale after an amendment, the Citator passes bad citations and we ship hallucinations. This RFC locks the structural decisions before ingestion code is written.

**Source of truth:** [IndiaCode.nic.in — Indian Contract Act, 1872](https://www.indiacode.nic.in/handle/123456789/2187)  
Official gazette PDFs are the only acceptable input. No third-party legal databases.

---

## 3. Tree structure

The Indian Contract Act, 1872 has the following hierarchy:

```
Act
└── Part (not formally present in ICA; skip this level)
    └── Chapter  (e.g., "Chapter VI — Of the Consequences of Breach of Contract")
        └── Section  (e.g., "Section 73 — Compensation for loss or damage caused by breach")
            └── Sub-section / Proviso / Explanation  (e.g., "Section 73, Proviso 1")
```

ICA has no formal Parts. The tree is therefore **3 levels deep** in the common case and **4 levels** where sub-sections, provisos, or explanations exist.

---

## 4. Node ID convention

### 4.1 Format

```
ICA-1872/<LEVEL-CODE>/<IDENTIFIER>
```

| Level | Code prefix | Example ID |
|---|---|---|
| Act root | `ACT` | `ICA-1872` |
| Chapter | `CH-<roman>` | `ICA-1872/CH-VI` |
| Section | `S-<number>` | `ICA-1872/CH-VI/S-73` |
| Sub-section | `SS-<number>` | `ICA-1872/CH-VI/S-73/SS-1` |
| Proviso | `PROV-<number>` | `ICA-1872/CH-VI/S-73/PROV-1` |
| Explanation | `EXP-<number>` | `ICA-1872/CH-VI/S-73/EXP-1` |

### 4.2 Rules

1. **Always include the Chapter ancestor.** Even if the Drafter only needs Section 73, the citation path `ICA-1872/CH-VI/S-73` makes the Chapter explicit. This allows the tree-query API to walk up to the Chapter context when needed.
2. **Roman numerals for Chapters** (uppercase): `CH-I`, `CH-II`, … `CH-X`. This matches IndiaCode's own chapter headings.
3. **Arabic numerals for Sections and below**: `S-73`, `SS-2`, `PROV-1`, `EXP-1`.
4. **No spaces, no special characters** other than `-` and `/`.
5. **Case-sensitive**: always uppercase prefixes. The Citator does a strict string equality check.

### 4.3 Examples

| Provision | Node ID |
|---|---|
| Act root | `ICA-1872` |
| Chapter II — Of Contracts, Voidable Contracts and Void Agreements | `ICA-1872/CH-II` |
| Section 10 — What agreements are contracts | `ICA-1872/CH-II/S-10` |
| Section 73 — Compensation for loss from breach | `ICA-1872/CH-VI/S-73` |
| Section 73, Explanation | `ICA-1872/CH-VI/S-73/EXP-1` |
| Section 17, clause (1) | `ICA-1872/CH-II/S-17/SS-1` |

---

## 5. What counts as a leaf

A **leaf node** is the smallest unit the Drafter is allowed to cite. The rule is:

> A node is a leaf if it contains **self-contained legal text** that cannot be usefully subdivided further without losing standalone meaning.

In practice for ICA:

| Node type | Is it a leaf? | Rationale |
|---|---|---|
| Chapter node | **No** | A chapter heading has no standalone citable text. |
| Section (no sub-parts) | **Yes** | The entire section text is the leaf. |
| Section with sub-sections | **No** (the section itself); each sub-section is a leaf | Citing "Section 17" when only sub-section (1) applies is too broad. |
| Sub-section | **Yes** |  |
| Proviso | **Yes** | Provisos create exceptions — they must be citable independently. |
| Explanation | **Yes** | Explanations define terms — must be independently citable. |

**Implication for ingestion code:** when a Section has child nodes (sub-sections, provisos, explanations), the Section-level node stores only the preamble text (if any) before the first numbered sub-section, and each child is a separate leaf. If there is no preamble text, the Section node's `text` field is `null` and only the children are leaves.

---

## 6. Snapshot policy

### 6.1 What is a snapshot

A snapshot is a **point-in-time capture** of the ICA text as sourced from IndiaCode.nic.in. It is identified by a `SnapshotId` string in `YYYY-MM-DD` format representing the date the gazette PDF was downloaded and ingested.

### 6.2 Snapshot ID encoding

```
ICA-1872@<YYYY-MM-DD>
```

Example: `ICA-1872@2024-12-01`

Every `pageindex_nodes` row carries a `snapshot_id` FK. Every citation emitted by the Drafter carries both `node_id` and `snapshot_id`. This means a citation is always pinned to a specific text version.

### 6.3 Ingestion cadence

- **Initial snapshot**: ingested from the most recent consolidated PDF available on IndiaCode at the time of ingestion.
- **Amendment check**: once per month (manual, by the Team D lead), compare the IndiaCode page for any "Amendment Acts" added since the last snapshot.
- **No automatic scraping**. All ingestion is manual + reviewed, sourced only from IndiaCode or official gazette notifications.

---

## 7. Amendment versioning

### 7.1 Policy

When an amendment changes the text of one or more sections:

1. **Create a new snapshot** with a new `SnapshotId` (date of the amendment's gazette notification, not the download date).
2. **Duplicate only the affected nodes** into the new snapshot. Unchanged nodes share the old snapshot ID — we do not copy the entire tree.
3. **Mark superseded nodes** in `pageindex_nodes` with a `superseded_by_snapshot` column. The Citator-gatekeeper will warn (not reject) if a draft cites a superseded snapshot when a newer one exists.

### 7.2 Version chain example

```
ICA-1872/CH-II/S-10  @2024-12-01   ← original
ICA-1872/CH-II/S-10  @2025-08-15   ← after Amendment Act 2025 modifies S-10
                                      old row has superseded_by_snapshot = '2025-08-15'
```

### 7.3 Backward compatibility

Old draft documents that were generated against `@2024-12-01` remain valid — their citations resolve to the snapshot they were created against. The reviewer UI shows a "⚠ Amendment available" badge when a newer snapshot exists for a cited node.

---

## 8. Tree query API contract

This section is a **proposed interface** for Samarth Kachhadiya (Tree query API + Agno tool wrapper). Final types live in `packages/shared`.

```ts
// Lookup a single node by ID + optional snapshot
getNode(nodeId: PageIndexNodeId, snapshotId?: SnapshotId): Promise<PageIndexNode | null>

// Walk up to the parent chapter/section for context
getAncestors(nodeId: PageIndexNodeId, snapshotId: SnapshotId): Promise<PageIndexNode[]>

// Full-text search within the ICA tree (used by the Planner)
searchNodes(query: string, actPrefix: "ICA-1872", snapshotId: SnapshotId): Promise<PageIndexNode[]>

type PageIndexNode = {
  node_id: PageIndexNodeId;       // e.g. "ICA-1872/CH-VI/S-73"
  snapshot_id: SnapshotId;        // e.g. "2024-12-01"
  text: string | null;            // null if non-leaf (chapter/section preamble-less)
  is_leaf: boolean;
  parent_node_id: PageIndexNodeId | null;
  superseded_by_snapshot: SnapshotId | null;
};
```

---

## 9. Out of scope for this RFC

- Full ingestion script implementation (that's the coding deliverable, not this RFC)
- Vector embedding strategy (pgvector column will be added; strategy deferred to Samarth's API work)
- Other acts (Constitution, CrPC, etc.) — each has its own RFC

---

## 10. Open questions

| # | Question | Owner | Deadline |
|---|---|---|---|
| OQ-1 | Does IndiaCode's current PDF for ICA reflect any 2023–2025 amendments? Need to verify the gazette. | Mahi Pandey | Week 1 Friday |
| OQ-2 | Tirth's spike: does the PageIndex library need any custom splitter for ICA's proviso/explanation structure, or does the default paragraph splitter handle it? | Tirth Dalal | Week 1 Friday |
| OQ-3 | Should the Citator hard-reject a citation to a superseded snapshot, or only warn? | Dhruv Lokadiya (protocol spec author) | Week 2 Monday |

---

## 11. Checklist before this RFC is merged

- [ ] Tirth Dalal (+1 as Team D lead)
- [ ] Dhruv Lokadiya (+1 on citation protocol alignment — especially §7.3)
- [ ] Hitarth Sherathia (+1 as Citator-gatekeeper owner — verify §8 interface matches what the Citator expects)
- [ ] No open questions blocking ingestion start

---

*This document will be superseded by inline code comments once the ingestion script is merged. Keep it updated if conventions change.*