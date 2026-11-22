# Intern Access — Supabase, Vercel, GitHub Secrets

Quick guide to what you have access to, what you don't, and why.

---

## 1. Local development (everyone, today)

You can start the web app locally without secret credentials:

```bash
git clone https://github.com/Trionic-Interns/trionic-ai-adalat.git
cd trionic-ai-adalat
cp .env.example apps/web/.env.local
pnpm install
pnpm dev
```

The app starts without credentials, but authentication and database-backed features need a valid Supabase URL and anon key. See the [local development guide](./LOCAL_DEVELOPMENT.md) for setup details and the exact API keys used by each feature.

---

## 2. Supabase dashboard access (team-member invite)

Once you have an invite to the Trionic Supabase organization, you'll be able to:

- Browse the schema in the **Table Editor**
- Run queries in the **SQL Editor**
- Watch real-time **Logs** of requests, RLS denials, function calls
- See your migrations applied in **Database → Migrations**
- View **Auth users** (your own test signups)
- Tail **Storage** for exported files

**How to get access:**
- An invite to **adalatai@trionic.co.in**'s Trionic org is sent to your form-submitted email.
- Accept it, then sign in at https://supabase.com/dashboard.
- Choose the **Trionic Adalat** org → project `trionic-adalat-dev`.

You'll be added with `Developer` role — full read/write on the project but not org-level admin (no billing changes, no project deletion).

**Important:** the dashboard is shared with 35+ people. Be careful — running `DROP TABLE` in the SQL editor affects everyone. If you want to experiment destructively, use a personal Supabase project on your own account.

---

## 3. Vercel deploys (no login needed)

Every PR you open auto-deploys a preview to Vercel. The deploy URL appears as a GitHub check on your PR — click it to see your feature live.

```
✓ vercel — Deployment ready
  Preview: https://trionic-adalat-git-your-branch-trionic.vercel.app
```

You don't need a Vercel login to view your previews, read build logs, or debug deploys. Everything is reachable through the PR.

If you specifically need Vercel CLI access for your task (likely only DevOps), comment on your issue and tag the repo managers — we'll add you to the project as a collaborator (Vercel Hobby allows 1 slot).

---

## 4. Secret values — what you can and can't see

| Value | Where it lives | Can interns see it? | Why |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.example` + GitHub Secrets + Vercel env | ✅ yes — public | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.example` + GitHub Secrets + Vercel env | ✅ yes — public | Publishable key; database access remains subject to RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | GitHub Secrets + Vercel env (server-only) | ❌ no | Bypasses RLS — full DB access |
| `SUPABASE_DB_PASSWORD` | GitHub Secrets + Vercel env (server-only) | ❌ no | Postgres superuser |
| `DEEPSEEK_API_KEY` | GitHub Secrets + Vercel env (server-only) | ❌ no | Billable account |
| `ANTHROPIC_API_KEY` etc. | GitHub Secrets + Vercel env (server-only) | ❌ no | Billable accounts |
| Sentry DSN | GitHub Secrets + Vercel env | ❌ no (low-stakes) | Hygiene |

**The agents and Backend API routes will work in deployed preview environments** because Vercel injects these env vars at build/runtime. You only feel the absence of LLM keys if you try to run the agent chain **locally on your laptop**. For that, see the next section.

---

## 5. "I need to run agents locally" — what to do

If your task genuinely requires running real LLM calls on your laptop:

1. Open or comment on your issue.
2. Tag a repo manager (@Dhruv5353 or @Sohil2085) explaining what you need.
3. We'll either:
   - **(a)** Set up a per-intern personal access token to a constrained API endpoint (preferred), or
   - **(b)** Provision a small DeepSeek key tied to a low daily-cost cap just for you.

Don't paste keys in cohort chat. Don't paste them in a public Discord channel. Don't paste them in a public GitHub Discussion thread. The Trionic team handles that exchange directly.

---

## 6. What CI uses (GitHub Actions secrets)

The lint, typecheck, unit-test, and build checks run in GitHub Actions without API keys. Repository secrets are not needed for those checks. Only repo managers can read or set secret values.

You can see which secrets exist (names only, no values) at:
https://github.com/Trionic-Interns/trionic-ai-adalat/settings/secrets/actions

Only repo managers can read or set values.

---

## 7. Tips for not getting blocked

- **Most tasks don't need the secret keys.** Frontend, PageIndex, eval-harness-on-fixtures, glossary work, RFC writing — none require LLM keys.
- **Use the deployed preview** if you need to test agent calls end-to-end. Open a PR, the preview deploy hits the real keys via Vercel env vars, you can hit your API route from `localhost:3000` to the deployed URL if your task warrants it.
- **Mock the LLM call in tests.** Your unit tests should mock `LLMRouter.complete()` anyway — that's standard practice.
- **Ask early.** If you genuinely think you need keys, ask Monday, not Thursday.

---

## TL;DR

| You want to... | Path |
|---|---|
| Run the app locally | `cp .env.example apps/web/.env.local && pnpm install && pnpm dev` |
| See the database | Wait for Supabase invite → log in to https://supabase.com/dashboard |
| See your deploys | Open a PR — the preview URL appears as a GitHub check |
| Test with real LLMs | Use the deployed preview, or DM repo managers if your task requires local |
| Get a secret | Don't — it lives in CI + Vercel, you don't need it for most work |
