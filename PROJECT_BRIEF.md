# Trionic Adalat — Project Brief

**Trionic Summer Internship 2026 cohort · May 10 – June 21, 2026 · Remote**

---

## 1. One-line description

A multilingual, agentic AI assistant for **Indian legal drafting and research** — grounded in authoritative legal texts via PageIndex, with mandatory citations on every output.

## 2. Why we're building this

Most Indians navigating routine legal situations (filing an RTI, sending a legal notice, drafting an NDA, lodging a consumer complaint, contesting a notice) face two problems: legal vocabulary they don't speak, and a language barrier on top of it. Generic LLM tools hallucinate sections and cases confidently. We're building a **drafting aid** (not advice) that is structurally incapable of fabricating citations and that meets the user in their own language.

## 3. Audience

- Indian citizens and small businesses preparing routine legal documents
- College-going professionals drafting basic contracts and notices
- Anyone who reads better in Hindi / Gujarati / Marathi / Tamil than in English legalese

**We are NOT** a substitute for a lawyer. Every output carries an "AI-generated draft — not legal advice" banner and a citation appendix.

## 4. Goals — what "done" looks like by June 21, 2026

| # | Goal | Measurable target |
|---|---|---|
| G1 | Live deployed web app | Reachable at a Trionic subdomain, sign-in works |
| G2 | Document drafting | **5 document types** end-to-end: RTI application, legal notice, NDA, consumer complaint, employment contract |
| G3 | Multilingual support | **5 language pairs**: English baseline + Hindi, Gujarati, Marathi, Tamil round-trip |
| G4 | Grounded retrieval | **15+ Indian acts** indexed via PageIndex (IPC, CrPC, Constitution, Indian Contract Act, Consumer Protection Act 2019, IT Act, RTI Act, etc.) |
| G5 | Citation integrity | **100% citation validity** — every legal claim resolves to a real PageIndex node. Reviewer agent rejects un-grounded claims. |
| G6 | Multi-LLM | LLM Router routes per step across **≥3 model providers** (Claude, Gemini, GPT, configurable) |
| G7 | Audit & export | Every draft exports to PDF/DOCX with a citation appendix and a full audit trail of agent steps |
| G8 | Eval dashboard | Internal dashboard showing citation validity, hallucination rate, per-LLM cost/latency |

## 5. Non-goals (explicitly out of scope for v1)

- **Case-law retrieval** (defer to v2 — corpus is unbounded and ages poorly in 6 weeks)
- **Court-filing automation** (regulatory and liability exposure)
- **Positioning as legal advice** (this is a drafting tool — wording matters everywhere in the UI)
- **Mobile apps** (responsive web only)
- **Billing / payments** (post-internship)
- **Real-time voice intake** (text-first; voice is a Week-5 stretch if anyone is ahead)
- **Public launch** (closed beta only; release decision after Week 6)

## 6. Product flow

```
User signs in
    │
    ▼
Intake (text in any supported language)
    │
    ▼   Classifier agent
"Is this a legal issue? Which domain? Which acts apply?"
    │
    ▼   Planner agent
"Which doc type? Which template? What sections do we need from PageIndex?"
    │
    ▼   PageIndex retrieval  →  returns tree node IDs + text
    │
    ▼   Drafter agent  (must cite a node for every legal claim)
    │
    ▼   Citator-gatekeeper agent  (REJECTS any span without a valid node ID)
    │
    ▼   Reviewer agent  (completeness + tone)
    │
    ▼   Translator agent  (if user requested Indic output)
    │
    ▼
Redline editor — user edits, sees citation path on hover, accepts/rejects
    │
    ▼
Export → PDF/DOCX with citation appendix + audit trail
```

## 7. Tech stack (locked)

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui |
| Auth + DB + Storage | Supabase (Postgres + RLS + pgvector + Auth + Storage) |
| Agent framework | **Agno** (using Trionic's multi-LLM PR) |
| Retrieval | **PageIndex** trees over authoritative acts, persisted in Postgres |
| LLM providers | Claude (Anthropic), Gemini (Google), GPT (OpenAI) — routed per-step |
| Translation | Indic language pairs routed through the LLM router with glossary lookup |
| Deploy | Vercel (web) + Supabase Cloud + GitHub Actions for CI |
| Observability | Sentry + custom traces table |

## 8. Repo architecture (monorepo, pnpm workspaces)

See [`README.md`](./README.md#repo-layout) and [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

Each `packages/*` has a clear OWNER and TEAM noted in its README. PRs touching another package should request review from that package's team.

## 9. Team & module ownership (final)

### Team A — Frontend (`apps/web`)

| Intern | Module owned |
|---|---|
| **Sohil Kareliya** (lead) | Document editor + redline UI |
| Veer Bhalodia | Chat / intake surface |
| Tirth Gondaliya | Citation drawer + tree-path links |
| Sarvak Makani | Auth + onboarding flows |
| Tulsi Dhameliya | Dashboard + history |
| Vraj Mevawala | i18n shell + language switcher |

### Team B — Backend (`apps/web/app/api`, `packages/db`)

| Intern | Module owned |
|---|---|
| **Om Patel** (lead) | Supabase schema + RLS policies |
| Harsh Korat | Document storage + PDF/DOCX export API |
| Prashant Gangani | Agent invocation API + streaming |
| Aayush Tilva | Versioning + audit log API |

### Team C — Agent Layer (`packages/agents`)

| Intern | Module owned |
|---|---|
| **Malay Sheta** (lead) | Planner agent |
| Jenil Sutariya | Drafter agent |
| Hitarth Sherathia | **Citator-gatekeeper agent** (the critical anti-hallucination layer) |
| Kathan Purohit | Classifier agent |
| Evan Gregor | Reviewer agent |
| Maharshi Patel | Translator agent (handoff with Team E) |
| Yug Gandhi | LLM Router (multi-LLM) |
| Umrania Yug | Tracing / observability layer |

### Team D — PageIndex & Corpus (`packages/pageindex`, `corpus/`)

| Intern | Module owned |
|---|---|
| **Tirth Dalal** (lead) | PageIndex tree validator + IPC ingestion |
| Darshit Sorathiya | Constitution + Article-level tree |
| Mahi Pandey | Indian Contract Act tree |
| Aesha Kalathiya | CrPC tree |
| Khushi Dadhaniya | Consumer Protection Act 2019 + IT Act |
| Samarth Kachhadiya | Tree query API + Agno tool wrapper |

### Team E — Indic (`packages/translation`)

| Intern | Module owned |
|---|---|
| **Megh Patel** (lead) | Hindi pair + glossary infrastructure |
| Patel Swar | Gujarati pair |
| Swara Jariwala | Marathi pair |
| Anshul Jangid | Tamil pair + Indic eval harness |

### Team F — Evals & Telemetry (`packages/evals`)

| Intern | Module owned |
|---|---|
| **Kirtan Patel** (lead) | Citation-correctness eval framework |
| Thummar Ayush | Cost & latency dashboards per-LLM |
| Kaushal Vora | Hallucination & completeness eval |

### Team G — DevOps (`infra/`)

| Intern | Module owned |
|---|---|
| Paghadar Prins (sole owner) | CI/CD + Vercel + Supabase envs + observability + cost dashboards |

### Repo Managers

| Intern | Responsibility |
|---|---|
| **Dhruv Lokadiya** | Full-time PM + Citator-gatekeeper protocol spec author |
| **Sohil Kareliya** | FSD-side co-PM (also leads Team A) |

## 10. Hard constraints

1. **Citation-or-die**: the Citator-gatekeeper agent rejects any draft span containing a legal claim without a valid PageIndex node ID. Enforced in code, not in prompts.
2. **Authoritative sources only**: corpus is sourced from IndiaCode.nic.in, the official Constitution of India, gazette PDFs. No scraping commercial databases.
3. **Snapshot versioning**: every citation carries the snapshot date of the act it came from. Amendments → new tree version → new snapshot ID.
4. **"Not legal advice" banner**: present on every draft page, every PDF/DOCX export, every shared link.
5. **No PII leaves Supabase**: user inputs that contain personal info are flagged and never sent to model providers in eval/log replay without redaction.
6. **RLS on every table**: no Supabase table goes live without a tested RLS policy. Team B's gate.
7. **Audit trail**: every agent call is persisted with `(timestamp, user, agent_name, model, tokens, cost, cited_node_ids, latency)`. Non-negotiable.

## 11. How we work

| Cadence | Activity |
|---|---|
| **Daily** | Async standup — 3 bullets: yesterday, today, blockers |
| **Mon–Thu** | Build. PR review SLA: 24h within team, 48h cross-team |
| **Friday 5 PM IST** | **Demo Day** — every intern (all 33+) shows for **60 seconds**. Recorded |
| **Friday 6 PM IST** | Each intern commits their `reports/<github-handle>/week-N.md` |
| **Friday 7 PM IST** | Repo managers post a one-line written feedback under each entry |

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for PR conventions and branch-protection rules.

## 12. Six-week milestones

See [`docs/TIMELINE.md`](./docs/TIMELINE.md) for the full timeline.

| Week | Theme |
|---|---|
| 1 | Architect & scaffold |
| 2 | Module skeletons |
| 3 | First real vertical slice (RTI, English) |
| 4 | Breadth (5 doc types, Citator-gatekeeper on) |
| 5 | Indic + evals + polish |
| 6 | Demo & handover |

## 13. What every intern walks out with (Week 6 deliverables)

1. Commits & merged PRs under their GitHub handle on `trionic-ai-adalat`
2. Six weekly reports at `reports/<github-handle>/week-N.md` with demos and metrics
3. A signed-off final 1-page contribution writeup
4. A named module / agent / feature attributable to them
5. Demo Day video segment
6. Mentor feedback embedded in each weekly report
7. Trionic Internship Certificate
