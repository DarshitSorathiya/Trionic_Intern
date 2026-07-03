# Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         Browser (Next.js client)                   │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────┐   │
│  │  Intake/   │  │   Document   │  │  Citation   │  │   i18n   │   │
│  │   Chat     │  │   Editor     │  │   Drawer    │  │  Switch  │   │
│  └────────────┘  └──────────────┘  └─────────────┘  └──────────┘   │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│                  Next.js App Router  (apps/web)                    │
│                         API routes (Team B)                        │
│   /api/intake  /api/draft  /api/export  /api/documents  /api/audit │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│            Agents (packages/agents) — Agno + LLM Router            │
│   Planner → Classifier → Drafter → Citator-gatekeeper → Reviewer   │
│                              └─→ Translator                        │
└────────────────────────────────────────────────────────────────────┘
        │                          │                       │
        ▼                          ▼                       ▼
┌────────────────┐    ┌────────────────────────┐    ┌──────────────┐
│  LLM Router    │    │  PageIndex tool        │    │  Translation │
│  (Yug Gandhi)  │    │  (Team D)              │    │  glossary    │
│  Claude/GPT/   │    │  Tree query API        │    │  (Team E)    │
│  Gemini/...    │    │  Returns node IDs+text │    │              │
└────────────────┘    └────────────────────────┘    └──────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│   Supabase Postgres  (packages/db)                                 │
│   tables: users, documents, document_versions, agent_traces,       │
│           citations, pageindex_trees, pageindex_nodes, eval_runs   │
│   RLS enforced on every table (Team B gate)                        │
└────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────┐
│   Observability                                                    │
│   Sentry (errors) · agent_traces table (LLM calls) ·               │
│   per-LLM cost/latency dashboards (Team F)                         │
└────────────────────────────────────────────────────────────────────┘
```

## Key flows

### Draft request
1. User submits intake text + language preference.
2. **Classifier** decides: is this legal? which domain? which acts?
3. **Planner** picks doc type + template + the PageIndex queries needed.
4. **PageIndex tool** returns relevant nodes (with IDs + text).
5. **Drafter** writes the draft, emitting `[CITE:<node_id>]` markers inline.
6. **Citator-gatekeeper** validates every `[CITE]` marker resolves to a real node. Rejects ungrounded spans.
7. **Reviewer** checks completeness, tone, "not legal advice" banner.
8. **Translator** (if non-English requested) translates using glossary lookups.
9. Draft persisted to `documents` + `document_versions`; trace persisted to `agent_traces`.

### Export
- Markdown → HTML → PDF (via `puppeteer` or similar in API route).
- Includes citation appendix (all `[CITE]` markers expanded to full tree paths) and "not legal advice" banner.

## Cross-package contracts

The contracts (TypeScript types) live in `packages/shared`. Notable ones:

```ts
type PageIndexNodeId = string;     // e.g. "ICA-1872/CH-VI/S-73"
type SnapshotId = string;          // e.g. "2024-12-01"
type Citation = {
  node_id: PageIndexNodeId;
  snapshot_id: SnapshotId;
  span: [number, number];          // char offsets in the draft
};
type AgentTrace = {
  agent: string;
  model: string;                   // resolved by LLM Router
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  latency_ms: number;
  cited_nodes: PageIndexNodeId[];
  status: "ok" | "rejected" | "error";
};
```

## Out of v1 (deferred)

- Case-law retrieval (vector-RAG sidecar — Week 5 stretch, otherwise v2)
- Voice intake
- Court-filing automation
- Mobile apps
- Billing / payments
