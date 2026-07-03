# Week 1 — Aesha Kalathiya

**Team:** Team D — PageIndex & Corpus  
**Module owned:** CrPC Tree  
**Week of:** 2026-05-19

---

## What I shipped this week

* Designed the initial architecture for the CrPC PageIndex tree system.
* Researched the Criminal Procedure Code (CrPC) structure including chapters, sections, sub-sections, and clauses.
* Studied PageIndex-based retrieval architecture for citation-grounded legal AI systems.
* Planned a scalable Supabase PostgreSQL schema for hierarchical legal retrieval nodes.
* Designed recursive parent-child relationships for legal tree traversal.
* Created the proposed folder structure for the `packages/pageindex` module.
* Defined ingestion workflow for transforming official IndiaCode legal text into structured JSON trees.
* Designed citation-ready node architecture using unique node IDs and snapshot versioning.
* Planned retrieval functions including:
  - `getNodeBySection()`
  - `getFullPath()`
  - recursive tree traversal
* Researched anti-hallucination retrieval workflows using node-based citation grounding.

---

## Demo

Successfully designed the initial implementation workflow for the CrPC PageIndex retrieval system.

Planned workflow:

```text
IndiaCode / Official Bare Act
        ↓
Raw Legal Text Extraction
        ↓
Hierarchy Parsing
        ↓
JSON Tree Generation
        ↓
Supabase Storage
        ↓
PageIndex Retrieval
        ↓
AI Citation Grounding

Designed the legal hierarchy structure:
Act
 └── Chapter
      └── Section
           └── Sub-section
                └── Clause

Metrics
| Metric                      | Value          | Notes                          |
| --------------------------- | -------------- | ------------------------------ |
| Legal hierarchy researched  | CrPC structure | Chapters, sections, clauses    |
| Database schema draft       | Completed      | Supabase PostgreSQL            |
| Retrieval architecture      | Designed       | Citation-grounded retrieval    |
| Folder structure            | Completed      | Modular PageIndex architecture |
| Ingestion workflow          | Planned        | IndiaCode → JSON → Supabase    |
| Retrieval functions planned | 4              | Tree traversal APIs            |

Blockers
Official IndiaCode legal documents contain inconsistent formatting and nested structures.
CrPC hierarchy extraction requires careful handling of clauses and sub-sections.
Snapshot-aware citation versioning design requires alignment with overall PageIndex architecture.
Need validation strategy for ensuring accurate node-based citation mapping.

Next week
Implement Supabase PostgreSQL schema for legal retrieval nodes.
Create TypeScript interfaces for the PageIndex tree structure.
Build example seed data for:
    CrPC
    Chapter V
    Section 41
Implement recursive retrieval functions.
Begin ingestion pipeline for structured legal text parsing.
Start integration testing for citation-grounded retrieval workflows.

Mentor feedback (filled by repo manager Friday 7 PM IST)
> Good Week-1 architectural progress. The CrPC hierarchy planning, retrieval design, and citation-grounded workflow structure are well thought out and aligned with the PageIndex module requirements.
