# RFC: Marathi Translation Pair for Trionic Adalat

**Author:** Swara Jariwala (`@0604-swara`)  
**Team:** E — Indic (`packages/translation`)  
**Lead:** Megh Patel (`@Meghpatel2810`)  
**Status:** Draft  
**Created:** 2026-05-19  
**Target merge:** Week 1 Friday

---

# 1. Context & Why This Matters

Trionic Adalat is a multilingual AI-powered legal drafting and research platform focused on Indian legal workflows. The platform uses PageIndex retrieval and citation-aware drafting to ensure generated legal drafts remain grounded in authoritative Indian legal texts.

This RFC covers the design and architecture of the Marathi translation pair inside the Indic translation pipeline.

The Marathi translation module is responsible for:
- translating English legal drafts into Marathi
- preserving legal terminology
- preserving PageIndex citations
- ensuring multilingual accessibility
- preventing hallucinated legal content

Legal translation is significantly more difficult than general-purpose translation because legal language is:
- highly structured
- context-sensitive
- terminology-heavy
- citation-dependent

Generic translation systems frequently mistranslate legal terminology.

Examples:
- Plaintiff
- Defendant
- Jurisdiction
- Arbitration
- Affidavit
- Consideration

Incorrect translations can:
- change legal meaning
- confuse users
- invalidate legal interpretation
- break citation reliability

The Marathi translation pair is critical because a large number of Indian users understand Marathi better than English legal terminology.

The goal is to make legal drafting accessible while preserving:
- legal precision
- terminology consistency
- citation integrity
- multilingual readability

---

# 2. Objectives

| Goal ID | Objective |
|---|---|
| G1 | Support English → Marathi legal translation |
| G2 | Preserve PageIndex citations in translated output |
| G3 | Maintain glossary consistency across translations |
| G4 | Prevent hallucinated legal content |
| G5 | Preserve legal structure and readability |
| G6 | Support multilingual legal accessibility |
| G7 | Support glossary-based terminology enforcement |
| G8 | Ensure Marathi Unicode rendering compatibility |

---

# 3. Translation Architecture

The Marathi translation layer sits after:
- drafting
- citation validation
- reviewer validation

and before:
- export
- user delivery

---

## Translation Flow

```text
User Input
    │
    ▼
Classifier Agent
    │
    ▼
Planner Agent
    │
    ▼
PageIndex Retrieval
    │
    ▼
Drafter Agent
    │
    ▼
Citator-Gatekeeper
    │
    ▼
Reviewer Agent
    │
    ▼
Translator Agent (Marathi Pair)
    │
    ▼
Final Marathi Draft
```

---

# 4. Legal Glossary Integration

The Marathi translation pair will integrate with Megh’s Legal Glossary Schema RFC.

The glossary layer will:
- standardize legal terminology
- prevent inconsistent translations
- preserve domain-specific legal meaning
- enforce approved Marathi legal equivalents

---

## Proposed Integration Flow

```text
Draft Segment
      │
      ▼
Glossary Lookup
      │
      ├── Match Found
      │       ▼
      │   Approved Marathi Term
      │
      └── No Match
              ▼
Fallback Translation Strategy
```

---

## Example Glossary Entries

| English Term | Marathi Translation |
|---|---|
| Plaintiff | फिर्यादी |
| Defendant | प्रतिवादी |
| Affidavit | प्रतिज्ञापत्र |
| Jurisdiction | अधिकार क्षेत्र |
| Petition | याचिका |
| Arbitration | मध्यस्थी |
| Legal Notice | कायदेशीर नोटीस |

---

# 5. Citation-Preserving Translation

PageIndex citations must remain unchanged during translation.

---

## Example

### Input

```text
The Plaintiff filed an affidavit before the District Court. [PageIndex:102]
```

### Output

```text
फिर्यादीने जिल्हा न्यायालयात प्रतिज्ञापत्र दाखल केले. [PageIndex:102]
```

---

## Citation Preservation Rules

- PageIndex values must never be modified
- citation ordering must remain intact
- translation must not remove references
- translated output must preserve citation mapping
- node IDs must remain unchanged

---

# 6. Fallback Strategy for Missing Legal Terms

If a legal term is unavailable in the glossary:

---

## Priority Order

1. Approved glossary term
2. Context-aware Marathi legal equivalent
3. Transliteration
4. Human-review escalation

---

## Example

| Scenario | Fallback |
|---|---|
| Unknown procedural term | transliteration |
| Ambiguous legal phrase | human review |
| Missing jurisdiction-specific term | contextual translation |

---

## Escalation Conditions

Human review should trigger when:
- translation confidence is low
- legal ambiguity is detected
- multiple interpretations exist
- citation alignment becomes uncertain

---

# 7. Hallucination Prevention

The Marathi translation layer must not:
- invent statutes
- generate unsupported claims
- alter retrieved legal meaning
- fabricate legal references

---

## Safeguards

- translation only after retrieval validation
- glossary-constrained decoding
- citation locking
- reviewer verification
- deterministic translation mode for legal sections

---

# 8. Evaluation Metrics

The Marathi translation pair should be evaluated using:

| Metric | Purpose |
|---|---|
| BLEU Score | Translation quality |
| COMET Score | Semantic preservation |
| Terminology Accuracy | Glossary consistency |
| Citation Preservation Rate | Citation integrity |
| Hallucination Rate | Unsupported content detection |
| Human Legal Review Score | Legal correctness |
| Marathi Readability Score | End-user accessibility |

---

## Acceptance Targets

| Metric | Target |
|---|---|
| Citation Preservation | 100% |
| Terminology Consistency | ≥ 95% |
| Hallucination Rate | ≤ 1% |
| Legal Review Approval | ≥ 90% |

---

# 9. Marathi Script & Frontend Rendering

Frontend systems must support proper Marathi Unicode rendering.

---

## Requirements

- UTF-8 encoding
- Devanagari-compatible fonts
- cross-browser rendering validation
- mobile readability support
- PDF export compatibility

---

## Recommended Fonts

- Noto Sans Devanagari
- Mukta
- Hind
- Poppins (fallback support)

---

## Rendering Validation

The frontend must verify:
- character alignment
- ligature rendering
- citation visibility
- export fidelity
- OCR readability for generated PDFs

---

# 10. Proposed Folder Structure

```text
packages/
└── translation/
    ├── marathi/
    │   ├── glossary.json
    │   ├── translator.ts
    │   ├── prompts.ts
    │   ├── validators.ts
    │   ├── citation-locker.ts
    │   └── README.md
```

---

# 11. Proposed Translation Pipeline

```text
English Legal Draft
        │
        ▼
PageIndex Citation Retrieval
        │
        ▼
Citation Validation
        │
        ▼
Legal Glossary Mapping
        │
        ▼
Citation Locking
        │
        ▼
Translation Layer
        │
        ▼
Citation Restoration
        │
        ▼
Marathi Legal Draft
```

---

# 12. Risks & Challenges

| Risk | Description |
|---|---|
| Legal ambiguity | Multiple valid Marathi interpretations |
| Missing glossary terms | New legal terminology may appear |
| Hallucinated output | LLM may invent unsupported text |
| Citation corruption | Formatting issues may alter references |
| Rendering issues | Marathi Unicode compatibility problems |

---

# 13. Proposed Solutions

## Glossary-First Translation

Legal terminology should always be replaced using the glossary before free-form translation begins.

---

## Citation Locking

All citations should be locked before translation and restored after translation completes.

---

## Prompt Engineering

Translation prompts must explicitly enforce:
- citation preservation
- structure preservation
- hallucination prevention
- legal terminology consistency

---

## Human Review Support

All translated drafts should remain editable in the redline editor for human review.

---

# 14. Security & Compliance

The Marathi translation layer must comply with project-wide security rules.

---

## Compliance Rules

- no legal advice generation
- no external PII leakage
- RLS-compliant storage
- audit logging enabled

---

## Translation Logging

All translation requests should log:
- timestamp
- model provider
- token usage
- latency
- cited node IDs
- request metadata

---

# 15. Future Enhancements

Future improvements may include:
- bidirectional Marathi ↔ English translation
- multilingual legal glossary expansion
- judge-specific terminology handling
- legal tone adaptation
- regional Marathi dialect support
- human-in-the-loop reviewer tooling
- Marathi legal benchmark datasets

---

# 16. Open Questions

| # | Question | Owner | Needed By |
|---|---|---|---|
| Q1 | Which provider performs best for Marathi legal translation? | Yug Gandhi | Day 3 |
| Q2 | Should glossary mappings be static JSON or database-driven? | Megh Patel | Day 2 |
| Q3 | How should mixed-language legal drafts be handled? | Maharshi Patel | Day 4 |
| Q4 | Should citations remain English-only or localized? | Dhruv Lokadiya | Day 3 |

---

# 17. Week 1 Deliverables

- [ ] RFC reviewed by Megh Patel
- [ ] Marathi translation workflow documented
- [ ] `packages/translation/marathi/` scaffolded
- [ ] Initial glossary structure created
- [ ] Draft PR opened
- [ ] Translation risks documented
- [ ] Demo Day walkthrough prepared

---

# 18. Out of Scope

The following are excluded from this RFC:

- court filing automation
- OCR ingestion
- voice translation
- legal advice generation
- case-law retrieval
- offline translation models

---

# 19. Conclusion

This RFC proposes a citation-aware Marathi legal translation workflow for Trionic Adalat.

The Marathi translation pair focuses on:
- multilingual accessibility
- legal terminology consistency
- citation integrity
- hallucination prevention
- trustworthy legal drafting

By integrating glossary-aware translation with PageIndex citation preservation, the Marathi translation pair can provide reliable and understandable legal drafting support for Marathi-speaking users while maintaining the project’s core “Citation-or-Die” principle.

---

