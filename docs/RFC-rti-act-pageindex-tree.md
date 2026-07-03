# RFC — RTI Act 2005 PageIndex Tree

## Purpose

Define the PageIndex tree structure, node schema, retrieval granularity, and validation strategy for the Right to Information Act, 2005.

This RFC supports the Week-3 RTI vertical slice and establishes conventions for future Act trees.

## Goals

- Build a structurally valid retrieval tree
- Support citation-grounded drafting
- Enable deterministic node resolution
- Preserve legal hierarchy
- Support snapshot versioning

## Proposed Tree Structure


The RTI Act tree will follow a strict hierarchical structure to preserve legal context and support deterministic citation resolution.

Hierarchy format:

```text
Act
 ├── Chapter
 │    ├── Section
 │    │    ├── Subsection
 │    │    ├── Clause
 │    │    └── Proviso / Explanation
```

Example hierarchy:

```text
RTI-2005
 ├── CH-I
 │    ├── S-1
 │    ├── S-2
 │    └── S-3
 │
 ├── CH-II
 │    ├── S-4
 │    ├── S-5
 │    ├── S-6
 │    │    ├── SS-1
 │    │    └── SS-2
 │    └── S-7
```

Example node IDs:

```text
RTI-2005
RTI-2005/CH-II
RTI-2005/CH-II/S-6
RTI-2005/CH-II/S-6/SS-1
```

Node IDs are deterministic and path-derived to ensure citation stability across retrieval and export systems.

## Node Schema

Each PageIndex node will contain structural, retrieval, and citation metadata.

Example schema:

```ts
type PageIndexNode = {
  node_id: string;
  parent_id?: string;

  act_name: string;
  chapter?: string;
  section?: string;
  subsection?: string;

  title: string;
  text: string;

  citation_path: string[];

  snapshot_id: string;
  source_url: string;

  children?: string[];
};
```

### Required fields

| Field | Purpose |
|---|---|
| node_id | Stable unique identifier |
| parent_id | Tree hierarchy reference |
| text | Source legal text |
| citation_path | Human-readable citation expansion |
| snapshot_id | Legal version tracking |
| source_url | Authoritative source traceability |

### Parent-child relationships

- Every non-root node must reference a valid parent node.
- Parent-child traversal must preserve the legal hierarchy of the Act.
- Child ordering should follow the official Act ordering.

### Citation metadata

Every retrievable node must expose:
- deterministic node ID
- snapshot version
- human-readable citation path

Example:

```json
{
  "node_id": "RTI-2005/CH-II/S-6/SS-1",
  "citation_path": [
    "RTI Act 2005",
    "Chapter II",
    "Section 6",
    "Subsection 1"
  ]
}
```



## Validation Strategy

The RTI tree validator should enforce structural correctness before ingestion into retrieval systems.

### Duplicate detection

Validation must reject:
- duplicate node IDs
- duplicate citation paths
- repeated child references

### Hierarchy integrity checks

Validation must ensure:
- every child node references a valid parent
- no orphan nodes exist
- traversal from any node resolves back to the Act root
- node ordering matches the official RTI Act structure

### Snapshot/version validation

Every node must include:
- snapshot_id
- source attribution

Example:

```text
snapshot_id = "2026-05-10"
```

Amendments or source updates must generate a new snapshot version instead of mutating historical nodes.

## Retrieval Considerations


The RTI tree will primarily support retrieval at:
- section level
- subsection level

Clause-level splitting should only occur where legal meaning significantly depends on clause separation.

This balances:
- retrieval precision
- citation accuracy
- manageable tree complexity

### Chunking rules

- Parent-child legal hierarchy must be preserved.
- Subsection retrieval may include parent section context during downstream prompting.
- Nodes should not merge unrelated sections into a single retrieval unit.

### Multilingual considerations

The PageIndex tree remains language-neutral and stores authoritative English source text.

Translation occurs downstream in the Translator agent pipeline while preserving:
- node IDs
- citation references
- citation paths

### Citation resolution flow

Retrieval returns:
- node_id
- node text
- citation path
- snapshot_id

The Drafter agent emits inline markers:

```text
[CITE:RTI-2005/CH-II/S-6]
```

The Citator-gatekeeper validates:
1. node existence
2. snapshot validity
3. citation-path resolution

## Eval Proposal

A lightweight retrieval-quality evaluation should complement Team F's citation-correctness framework.

### Retrieval correctness

The eval suite should test whether common RTI queries retrieve the correct legal nodes.

Example cases:

| Query | Expected Node |
|---|---|
| "How do I file an RTI request?" | Section 6 |
| "What is the response deadline?" | Section 7 |
| "Which information is exempt?" | Section 8 |
| "How can I appeal a rejection?" | Section 19 |

### Metrics

| Metric | Description |
|---|---|
| Top-1 accuracy | Correct node retrieved first |
| Top-k recall | Correct node appears in retrieval set |
| Citation resolution success | Returned node resolves to valid citation path |

### Week-3 success criteria

The RTI vertical slice is considered retrieval-ready when:
- all RTI sections are indexed into valid tree nodes
- citation paths resolve deterministically
- no orphan or duplicate nodes exist
- common RTI drafting prompts retrieve correct sections consistently