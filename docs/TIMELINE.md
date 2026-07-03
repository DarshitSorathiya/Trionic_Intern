# Six-week timeline

Cohort: **May 10 – June 21, 2026** (Friday Demo Days mark the end of each week).

## Week 1 — Architect & scaffold

| Team | Deliverable |
|---|---|
| All | RFC (issue with `type:rfc` label) per package: scope, contracts, dependencies |
| Frontend | `pnpm create next-app apps/web`, Tailwind + shadcn/ui set up, routing skeleton |
| Backend | Supabase project provisioned, schema RFC posted |
| Agents | LLM Router skeleton with at least Claude wired up; agent interface defined |
| PageIndex | Spike: build a tree over the Indian Contract Act; report cost + latency |
| Indic | Glossary schema RFC; pick a starter Indic dataset for evals |
| Evals | Eval harness skeleton + fixture format |
| DevOps | Repo CI green; Vercel preview deploys working; Supabase env wired in |
| Repo mgrs | CODEOWNERS finalized; Citator-gatekeeper protocol RFC published |

**End-of-week demo:** every intern shows their RFC / skeleton.

## Week 2 — Module skeletons

| Team | Deliverable |
|---|---|
| Frontend | Auth pages, dashboard shell, document editor scaffold (mocked content) |
| Backend | Core schema migrated; RLS policies on `users`, `documents`, `agent_traces` |
| Agents | Mock end-to-end agent flow returns a canned RTI draft via the Router |
| PageIndex | 4–5 acts ingested as trees; query API behind the Agno tool |
| Indic | Translation pipeline scaffolded; first 50 glossary terms (English ↔ Hindi) |
| Evals | Harness running on fixture data; first dashboard cells live |
| DevOps | Cost & latency metrics flowing; Sentry hooked up |

**End-of-week demo:** end-to-end "stub draft" flows through the system.

## Week 3 — First real vertical slice

Target: **RTI Application** (Right to Information Act, 2005). English-only.

| Team | Deliverable |
|---|---|
| Frontend | Real document editor with redline, citation drawer renders real tree paths |
| Backend | Versioning works; export PDF/DOCX wired |
| Agents | Real Planner → Classifier → Drafter → Citator → Reviewer flow |
| PageIndex | RTI Act tree quality validated against ground-truth samples |
| Indic | Hindi pair ready (still hidden behind a flag) |
| Evals | First real run on RTI drafts — citation validity, completeness |
| DevOps | First production deploy to staging subdomain |

**End-of-week demo:** an English RTI draft generated end-to-end with valid citations.

## Week 4 — Breadth

| Team | Deliverable |
|---|---|
| Frontend | 5 document types selectable; per-type fields |
| Backend | Per-doc-type templates table; audit log API live |
| Agents | Citator-gatekeeper rule **turned on** in production path |
| PageIndex | 15+ acts indexed; cross-act search working |
| Indic | Glossary covers top-200 legal terms × all 4 Indic languages |
| Evals | Per-LLM A/B harness running across ≥3 providers |
| DevOps | Cost dashboards reading correctly per-LLM; alert thresholds set |

**End-of-week demo:** 5 doc types live, all English, all citation-valid.

## Week 5 — Indic + evals + polish

| Team | Deliverable |
|---|---|
| Frontend | Language switcher live; Indic rendering in editor; RTL/font fallbacks |
| Backend | PII redaction layer; share-link audit |
| Agents | Translator agent + glossary lookup integrated into draft flow |
| PageIndex | Stretch: case-law sidecar via pgvector if ahead of schedule |
| Indic | All 4 Indic round-trip; Anshul's Indic eval harness results posted |
| Evals | Hallucination + citation-relevance evals running; final dashboards |
| DevOps | Production cutover plan + rollback runbook |

**End-of-week demo:** Indic drafts (Hindi/Gujarati/Marathi/Tamil) with valid citations.

## Week 6 — Demo & handover

| Team | Deliverable |
|---|---|
| All | Bug bash Monday–Tuesday; freeze Wednesday |
| Frontend | Polish pass + a11y review |
| Backend | Final RLS audit |
| Agents | Trace export tool for evals reproducibility |
| PageIndex | Snapshot policy doc + freshness runbook |
| Indic | Indic terminology coverage report |
| Evals | Final eval summary report for handover |
| DevOps | Production runbooks committed |
| All | Final 1-page contribution writeup committed to `reports/<handle>/final.md` |

**Friday June 21 — Public Demo Day.** Internal stakeholders + invited college mentors. Certificates issued. Cohort photo. Done.
