# RFC: PageIndex Spike over Indian Contract Act, 1872

Author: Tirth Dalal
Team: Team D — PageIndex & Corpus
Status: Week-1 Spike Completed

---

## Objective

Evaluate the feasibility of building a hierarchy-aware retrieval tree over the Indian Contract Act, 1872 using a lightweight PageIndex-style ingestion pipeline.

The spike focuses on:

* authoritative corpus ingestion
* section-level hierarchy extraction
* snapshot-aware node generation
* retrieval artifact generation
* validation and benchmark reporting

This work supports citation-grounded retrieval inside Trionic Adalat.

---

## Source Corpus

Official IndiaCode source used:

https://www.indiacode.nic.in/bitstream/123456789/2187/2/A187209.pdf

Snapshot ID:
`2026-05-19`

Generated corpus files:

* `cleaned-text.md`
* `source-url.txt`

Corpus location:
`corpus/acts/contract-act/snapshot-2026-05-19/`

---

## Extraction Pipeline

The ingestion pipeline was implemented using Python.

Tooling used:

* PyMuPDF (`fitz`) for PDF extraction
* regex-based hierarchy extraction
* normalization + deduplication passes
* JSON artifact generation

Pipeline stages:

1. extract raw legal text from IndiaCode PDF
2. normalize formatting inconsistencies
3. detect legal section boundaries
4. generate snapshot-aware retrieval nodes
5. validate structural integrity
6. export inspectable artifacts

---

## Hierarchy Detection Logic

The parser identifies section boundaries using numbered legal section patterns such as:

* `1.`
* `2.`
* `10A.`

Each detected section becomes a retrieval node using the format:

`contract-act:s<section-id>`

Example:
`contract-act:s10`

Current extraction scope:

* section-level hierarchy only

Deferred work:

* clause-level parsing
* chapter/subchapter grouping
* amendment lineage tracking

---

## Generated Artifact

Generated retrieval artifact:

`packages/pageindex/artifacts/contract-act-tree.json`

Example node structure:

```json id="eg6v9n"
{
  "id": "contract-act:s10",
  "type": "section",
  "title": "What agreements are contracts",
  "snapshot_id": "2026-05-19",
  "children": []
}
```

Generated reports:

* `contract-act-metrics.json`
* `validation-report.json`

---

## Build Results

| Metric             | Value                         |
| ------------------ | ----------------------------- |
| Parsed nodes       | 270                           |
| Build latency      | ~0.01s                        |
| Peak memory usage  | ~20 MB                        |
| Duplicate IDs      | None                          |
| Empty titles       | None                          |
| Empty text nodes   | None                          |
| Estimated API cost | $0.00 (local prototype build) |

---

## Evaluation Methodology

A manual validation sample of 10 sections was performed against the official IndiaCode structure.

Validation criteria:

* correct section boundary extraction
* correct title extraction
* preservation of legal text
* preservation of section ordering
* non-empty node content

---

## Evaluation Results

| Section     | Result  | Notes                        |
| ----------- | ------- | ---------------------------- |
| Section 2   | Pass    | Definitions preserved        |
| Section 10  | Pass    | Correct hierarchy extraction |
| Section 11  | Pass    | Ordering preserved           |
| Section 23  | Partial | Formatting cleanup required  |
| Section 56  | Pass    | Full extraction successful   |
| Section 73  | Pass    | Text integrity maintained    |
| Section 124 | Pass    | Snapshot metadata preserved  |
| Section 126 | Pass    | Node structure valid         |
| Section 148 | Pass    | Extraction successful        |
| Section 151 | Pass    | Hierarchy preserved          |

Approximate parse correctness across sampled sections: ~90%.

---

## Edge Cases Observed

The IndiaCode source PDF introduced several ingestion challenges:

* duplicated TOC structures
* inconsistent newline formatting
* page-number contamination
* irregular spacing between sections
* ambiguous repealed/amended section boundaries

Initial parsing produced duplicate node IDs because TOC references were being re-parsed as legal sections. A deduplication pass was added to resolve this issue.

---

## Conclusions

The spike demonstrates that hierarchy-aware legal ingestion is viable using lightweight preprocessing and section-level extraction.

Key observations:

* hierarchy-aware retrieval is more deterministic than flat chunk extraction
* structural normalization materially improves parsing accuracy
* snapshot-aware node IDs improve citation reproducibility
* legal PDF formatting inconsistencies remain the primary ingestion bottleneck

The generated retrieval artifacts are sufficiently structured for downstream retrieval and citation-grounding workflows.

---

## Recommended Next Steps

1. extend extraction beyond section level
2. add clause/sub-clause hierarchy support
3. standardize node schema across Acts
4. benchmark retrieval quality against flat chunk-based RAG
5. integrate generated nodes into downstream PageIndex query APIs
