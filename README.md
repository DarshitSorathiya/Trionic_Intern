# Trionic Adalat

A multilingual, agentic AI assistant for **Indian legal drafting and research** — grounded in authoritative legal texts via PageIndex, with mandatory citations on every output.

> **Status:** Internal — Trionic Summer Internship 2026 cohort. Not yet public.

## Quick links

- **[Intern onboarding](./docs/ONBOARDING.md)** ← **start here if you just joined**
- **[Intern access — Supabase / Vercel / secrets](./docs/INTERN_ACCESS.md)** — what you can see, what you can't, why
- **[Project brief](./PROJECT_BRIEF.md)** — scope, goals, team ownership, hard constraints
- **[Contributing](./CONTRIBUTING.md)** — PR rules, weekly cadence, demo days
- **[Timeline](./docs/TIMELINE.md)** — six-week milestones
- **[Architecture](./docs/ARCHITECTURE.md)** — system diagram + module map
- **[UI flow](./docs/UI_FLOW.md)** — every screen, every state (Week-2 baseline)
- **[API contracts](./docs/API_CONTRACTS.md)** — every route, every request/response shape
- **[Shared types](./packages/shared/src/types.ts)** — locked TypeScript contracts
- **[Weekly reports](./reports/)** — per-intern progress logs

## Repo layout

```
trionic-ai-adalat/
├── apps/web/                # Next.js 15 (App Router) — user-facing app
├── packages/
│   ├── agents/              # Agno-based agents + LLM router
│   ├── pageindex/           # Tree builder + Agno tool wrapper
│   ├── translation/         # Indic translators + legal glossary
│   ├── db/                  # Supabase schema, migrations, RLS, TS types
│   ├── evals/               # Eval harness + dashboards
│   └── shared/              # Types, constants, utilities
├── corpus/                  # Source legal texts (read-only, snapshot-versioned)
├── docs/                    # RFCs, architecture, runbooks
├── infra/                   # CI/CD, deploy configs
└── reports/                 # Per-intern weekly progress reports
```

## Team ownership at a glance

| Team | Lead | Owns |
|---|---|---|
| Frontend | Sohil Kareliya | `apps/web` |
| Backend | Om Patel | `packages/db` + API routes |
| Agents | Malay Sheta | `packages/agents` |
| PageIndex & Corpus | Tirth Dalal | `packages/pageindex`, `corpus/` |
| Indic | Megh Patel | `packages/translation` |
| Evals & Telemetry | Kirtan Patel | `packages/evals` |
| DevOps | Paghadar Prins | `infra/`, CI/CD |
| Repo managers | Dhruv Lokadiya, Sohil Kareliya | cross-cutting |

Full per-intern module map: [`PROJECT_BRIEF.md` § 9](./PROJECT_BRIEF.md#9-team--module-ownership-final).

## How to get started (Week 1)

1. Accept the org invite to `Trionic-Interns`.
2. Read [`PROJECT_BRIEF.md`](./PROJECT_BRIEF.md) end-to-end.
3. Find your Week-1 issue assigned to you. Comment "ack" by EOD Monday.
4. Create your weekly reports folder: `reports/<your-github-handle>/` and add `week-1.md` from [the template](./reports/_template/week-N.md).
5. Show up for Friday Demo Day @ 5 PM IST.

## License

Internal — © Trionic Technologies LLP, 2026. All rights reserved.
