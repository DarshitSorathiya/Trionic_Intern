# RFC — CrPC PageIndex Tree Architecture

**Author:** Aesha Kalathiya  
**Team:** Team D — PageIndex & Corpus  
**Module:** CrPC Tree  
**Status:** Draft  
**Date:** 2026-05-19

---

# 1. Overview

This RFC proposes the architecture and hierarchical structure for the Criminal Procedure Code (CrPC) PageIndex tree used in Trionic AI Adalat.

The goal of this module is to transform the Criminal Procedure Code into a structured retrieval tree that enables:
- citation-grounded legal drafting
- anti-hallucination retrieval
- node-based legal referencing
- AI-safe legal context retrieval

This tree will act as the authoritative retrieval layer for downstream AI agents.

---

# 2. Problem Statement

Traditional vector-based RAG systems lose legal hierarchy and often generate hallucinated citations.

Legal drafting systems require:
- deterministic retrieval
- hierarchical legal context
- verifiable citation paths
- stable node identifiers

The CrPC contains:
- Parts
- Chapters
- Sections
- Sub-sections
- Clauses
- Provisos

which must be represented explicitly in the retrieval tree.

Without a structured hierarchy:
- citations become unreliable
- legal references lose context
- downstream AI agents may hallucinate invalid claims

---

# 3. Goals

The CrPC PageIndex tree should support:

- hierarchical legal navigation
- node-based retrieval
- citation grounding
- snapshot versioning
- recursive traversal
- AI retrieval compatibility
- future amendment support

---

# 4. Proposed Hierarchy

The legal hierarchy will follow:

```text
Act
 └── Part
      └── Chapter
           └── Section
                └── Sub-section
                     └── Clause
                          └── Proviso

**Example**
CrPC
 └── Chapter V
      └── Section 41
           └── Clause (a)
           └── Clause (b)

**Node Structure**
Each legal node will contain:

| Field          | Description                      |
| -------------- | -------------------------------- |
| id             | Unique node UUID                 |
| parent_id      | Parent node reference            |
| node_type      | ACT / CHAPTER / SECTION / CLAUSE |
| title          | Legal heading/title              |
| section_number | Section identifier               |
| content        | Official legal text              |
| snapshot_id    | Version identifier               |
| created_at     | Timestamp                        |


**Data Source**
Authoritative legal sources only:

IndiaCode.nic.in
Official Gazette PDFs
Official Bare Acts

Non-authoritative sources are explicitly prohibited.

**Ingestion Workflow**
IndiaCode / Official PDF
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

**Database Design**

The retrieval tree will be stored in Supabase PostgreSQL.

Core table: legal_nodes

Important design requirements:

recursive parent-child references
indexed retrieval
snapshot-aware nodes
citation-safe identifiers

Indexes will be added for:
   parent_id
   section_number
   node_type

**Snapshot Versioning**

Each node will contain:
   snapshot_id
   amendment-aware version metadata

This ensures:
   historical legal consistency
   amendment-safe citations
   reproducible retrieval
