# Local development

## Requirements

- Node.js 20 or newer
- pnpm 9 (the repository pins `pnpm@9.0.0`)

With Corepack enabled, install the pinned package manager and dependencies:

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
pnpm install
```

## Run the web app

Next.js reads its environment file from the app directory. Create one from the
repository template:

```bash
cp .env.example apps/web/.env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The app can start without
provider or database credentials, but sign-in, database-backed pages, retrieval,
and AI drafting need the corresponding credentials below. With no Supabase
credentials, middleware skips its session check; API routes that need a user or
database still will not work.

To preview protected UI without signing in, set
`NEXT_PUBLIC_DEMO_MODE=true` in `apps/web/.env.local` and restart the server.
This only bypasses the page redirect; it does not authenticate API requests or
provide database access.

## Verify changes

Run these commands from the repository root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The unit tests and build do not require live API credentials. The package test
scripts run unit tests; they do not start the live evaluation harness.

To run the evaluation harness separately, configure the Supabase credentials
it needs in the shell that launches it, then run:

```bash
export NEXT_PUBLIC_SUPABASE_URL="your Supabase project URL"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your Supabase publishable key"
pnpm --filter @trionic/evals eval -- --dataset rti-week3
```

Available datasets are JSON files in `packages/evals/fixtures/`. The harness
checks citations against PageIndex and runs local fixture metrics; the model
name is recorded in the report, not used to make an LLM request. Supabase URL
and anon or service key are required for PageIndex. OpenAI or Gemini keys are
only needed if using vector search. The harness may also post results to the
app at `NEXT_PUBLIC_APP_URL` (default `http://localhost:3000`).

## Environment variables and API keys

Copy the template into `apps/web/.env.local` for the web app. Replace the blank
Supabase anon key with the publishable key from your Supabase project if you
need authentication or database-backed features. Never commit `.env.local` or
paste secret values into source control, chat, or issue comments.

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase auth and app data | Project URL; public configuration, not a credential. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase auth and app data | Public/publishable key. Database access remains subject to RLS policies. |
| `DEEPSEEK_API_KEY` | Default AI drafting/agent chain | Primary provider for the configured agent steps. |
| `ANTHROPIC_API_KEY` | Claude fallback provider | Optional unless you want fallback calls to work when DeepSeek is unavailable. |
| `OPENAI_API_KEY` | OpenAI provider or OpenAI embeddings | Optional; PageIndex can use it for vector search. |
| `GEMINI_API_KEY` | Gemini provider or Gemini embeddings | Optional. `GOOGLE_API_KEY` is also accepted by PageIndex for embeddings, but the agent Gemini provider expects `GEMINI_API_KEY`. |
| `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY` | Server-side PageIndex/admin operations that need elevated access | Privileged and server-only; never use either in a `NEXT_PUBLIC_` variable or browser code. Prefer the anon key when RLS is sufficient. |
| `SUPABASE_DB_PASSWORD` | Direct database administration | Not needed to run the web app. Keep it secret. |
| `SENTRY_DSN` | Error reporting | Optional. |

`NEXT_PUBLIC_APP_URL` is optional and defaults to `http://localhost:3000`.
PageIndex also accepts `SUPABASE_URL` as an alias for
`NEXT_PUBLIC_SUPABASE_URL`. The service-role key aliases above are accepted for
PageIndex; do not treat those privileged keys as interchangeable with the anon
key.

For regular frontend work, no LLM key or service-role key is needed. A valid
Supabase URL and anon key are needed for real authentication and database
features; `DEEPSEEK_API_KEY` is needed to invoke the default agent chain. Keys
are billed credentials: obtain them through the project owners and use a
server-side environment file only.
