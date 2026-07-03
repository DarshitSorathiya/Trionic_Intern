# Week 1 — RTI Act PageIndex RFC

**Team:** Team D — PageIndex & Corpus
**Module owned:** RTI Act 2005 PageIndex tree RFC
**Week of:** 19-5-2026

---

## What I shipped this week

* Set up the local development environment and cloned the `trionic-ai-adalat` monorepo.
* Read and analyzed:

  * `PROJECT_BRIEF.md`
  * `CONTRIBUTING.md`
  * `docs/ARCHITECTURE.md`
  * `packages/pageindex/README.md`
* Understood the PageIndex retrieval architecture and citation-or-die validation flow.
* Took ownership of the reassigned RTI Act 2005 RFC issue after previous assignee left the cohort.
* Created feature branch:

  * `pageindex/rti-act-tree-rfc`
* Opened a draft PR for early review and implementation alignment.
* Authored and expanded the RFC for the RTI Act 2005 PageIndex tree, including:

  * proposed legal hierarchy structure
  * deterministic node ID conventions
  * node schema proposal
  * parent-child relationship rules
  * validation strategy
  * retrieval granularity considerations
  * citation resolution flow
  * retrieval-quality evaluation proposal
* Coordinated review iteration based on maintainer feedback and updated the RFC accordingly.

---

## Demo

* Draft PR demonstrating the RTI Act PageIndex RFC structure and retrieval design.
* Showed deterministic citation path examples and retrieval hierarchy for RTI sections.

---

## Metrics

| Metric                         | Value | Notes                                                                           |
| ------------------------------ | ----- | ------------------------------------------------------------------------------- |
| RFCs authored                  | 1     | RTI Act 2005 PageIndex RFC                                                      |
| Draft PRs opened               | 1     | Early review workflow followed                                                  |
| Validation strategies proposed | 4+    | Duplicate checks, hierarchy integrity, snapshot validation, citation resolution |
| Example retrieval mappings     | 4     | RTI query → expected section mappings                                           |

---

## Blockers

* Joined the internship after initial onboarding phase, so some architectural context had to be caught up independently.
* Repository is currently scaffold-stage, so some implementation contracts are still evolving.

---

## Next week

* Finalize RFC review comments and merge the RTI RFC PR.
* Begin defining concrete RTI tree node mappings from the official Act structure.
* Coordinate with Team D lead regarding validator expectations and ingestion conventions.
* Explore retrieval test fixtures for RTI section-level evaluation.
* Start preparing initial PageIndex ingestion structure for RTI sections and subsections.

---

## Mentor feedback (filled by repo manager Friday 7 PM IST)

