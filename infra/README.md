# `infra/` — CI/CD, deploys, observability

Operations and infrastructure-as-code lives here.

## Team

**Owner:** Team G — DevOps
**Sole maintainer:** Paghadar Prins

## Weekly delivery plan

| Week | Deliverable |
|---|---|
| 1 | Repo CI green; pnpm install + lint + typecheck + test wired |
| 2 | Vercel project provisioned; preview deploys on every PR; Supabase envs (dev/staging/prod) wired with secrets via Vercel project settings |
| 3 | Sentry hooked up; first observability dashboard for agent_traces |
| 4 | Per-LLM cost dashboards (reading from `agent_traces`) with daily budgets and alert thresholds |
| 5 | Production cutover plan; rollback runbook; on-call rotation doc |
| 6 | Security audit checklist run; runbooks committed; handover doc |

## Layout (to be populated)

```
infra/
├── README.md
├── vercel/                 # vercel.json, build configs
├── supabase/               # CLI configs, env templates
├── dashboards/             # Grafana / metabase / supabase studio JSON exports
├── runbooks/               # incident & on-call playbooks
└── scripts/                # deployment helpers
```

## Secrets discipline

- No secret commits anywhere — `.gitignore` covers `.env*`.
- Production secrets live in Vercel project settings + Supabase project secrets.
- A `.env.example` in each package documents what variables are needed (names only, no values).
- Paghadar maintains the master secrets manifest in `infra/secrets-manifest.md` (commits only the **names** and ownership, never values).
