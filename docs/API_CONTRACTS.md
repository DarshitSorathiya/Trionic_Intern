# API Contracts — Trionic Adalat (Week 2 baseline)

> **Owner of this document:** Repo managers. Every type referenced here is defined in [`packages/shared/src/types.ts`](../packages/shared/src/types.ts) and is the single source of truth.
>
> **Rule:** Routes are versionless in v1 (`/api/...`). When we need to break something, we add a new route, deprecate the old, never silently change the contract.

This is the one-page contract sheet every team builds against in Week 2:

- **Frontend (Team A)** consumes these routes.
- **Backend (Team B)** owns the route implementations (in `apps/web/app/api/.../route.ts`).
- **Agents (Team C)** produces shapes that the Backend serialises into these responses.
- **Evals (Team F)** reads `agent_traces` written via these routes.

All requests/responses are JSON unless noted. All authenticated routes require a valid Supabase session cookie. RLS enforces row-level access — clients can only see/touch their own data.

---

## Auth

Auth is handled client-side via Supabase Auth's JS SDK (sign-up, sign-in, password reset). The Backend's job is **only** to expose the authenticated user, not to handle the credentials themselves.

### `GET /api/users/me`

Returns the current authenticated user.

```ts
// 200 OK
type Response = User;  // from @trionic/shared

// 401 Unauthorized — no session
type ErrorResponse = { error: "unauthorized" };
```

### `PATCH /api/users/me`

Update display name, default language, onboarding flag.

```ts
type Request = Partial<Pick<User, "display_name" | "default_language">> & {
  onboarded?: boolean;  // sets onboarded_at = now() when true
};

// 200 OK
type Response = User;
```

---

## Documents

### `GET /api/documents`

List the current user's documents. RLS scopes to `owner_id = auth.uid()`.

```ts
type Query = {
  status?: DocumentStatus;
  doc_type?: DocumentType;
  language?: SupportedLanguage;
  limit?: number;     // default 50
  cursor?: string;    // pagination
};

// 200 OK
type Response = {
  documents: Document[];
  next_cursor: string | null;
};
```

### `POST /api/documents`

Create an empty draft. Called by the `/new` intake page **before** `/api/draft` so the agent chain can persist its output against a real `document_id`.

```ts
type Request = {
  doc_type?: DocumentType;          // optional — Classifier may infer/override
  language: SupportedLanguage;
  intake_text: string;              // saved as the seed for the first version
};

// 201 Created
type Response = {
  document_id: string;
};
```

### `GET /api/documents/{id}`

Return one document + its current version body.

```ts
// 200 OK
type Response = {
  document: Document;
  current_version: DocumentVersion;
};

// 404 Not Found — or RLS blocked (do not distinguish — security)
```

### `PATCH /api/documents/{id}`

User edit. Creates a new `DocumentVersion` (we never overwrite).

```ts
type Request = {
  body_markdown: string;            // full new body
  citations?: Citation[];           // optional — frontend may include if it tracks them
  title?: string;
};

// 200 OK
type Response = DocumentVersion;    // the newly created version
```

### `GET /api/documents/{id}/versions`

Version history for one document.

```ts
// 200 OK
type Response = { versions: DocumentVersion[] };
```

### `POST /api/documents/{id}/archive` · `POST /api/documents/{id}/restore`

```ts
// 200 OK
type Response = Document;
```

---

## Generation (the core agent flow)

### `POST /api/draft`

**Server-Sent Events stream.** The frontend opens the connection, posts the request body, then consumes `AgentStreamEvent` frames until it sees a `draft.final` event (or `step.error`).

```ts
type Request = DraftRequest;

// 200 OK, Content-Type: text/event-stream
// Stream of AgentStreamEvent (see @trionic/shared)
//
// Example timeline:
//   {"type":"step.start","agent":"classifier","ts":"..."}
//   {"type":"step.done","agent":"classifier","ts":"...","duration_ms":1234,"tokens":820}
//   {"type":"step.start","agent":"planner","ts":"..."}
//   ...
//   {"type":"citation.emitted","node_id":"RTI-2005/S-6","ts":"..."}
//   {"type":"draft.partial","markdown_chunk":"...","ts":"..."}
//   {"type":"draft.final","response":{...DraftResponse},"ts":"..."}
```

If the Citator-gatekeeper rejects the draft, the stream ends with a `step.error` event from `"citator"` and the document's status is set to `failed`. The frontend should offer a "Regenerate" CTA.

**Cancellation:** the client closes the EventSource → server aborts mid-flight → no charge for unfinished steps.

### `POST /api/draft/{document_id}/translate`

Re-run only the Translator agent on the latest version, into a new target language. Same SSE pattern as `/api/draft` but only emits `translator` step events.

```ts
type Request = {
  target_language: SupportedLanguage;
};
```

---

## Export

### `POST /api/documents/{id}/export?format=pdf|docx`

Returns a signed Supabase Storage URL (TTL ~5 min). The file is rendered server-side from the latest `DocumentVersion`.

```ts
type Query = { format: ExportFormat };

type Request = {
  include_appendix?: boolean;       // default true — citation appendix
  include_audit_trail?: boolean;    // default false
};

// 200 OK
type Response = ExportResult;
```

---

## Sharing

### `POST /api/documents/{id}/share`

Create a share link. Owned by Dharmik (Backend).

```ts
type Request = {
  visibility: "private" | "link-only" | "public";
  expires_in_hours?: number;        // default 168 (1 week); max 720 (30 days)
  passcode?: string;                // optional, hashed server-side
};

// 200 OK
type Response = {
  share_url: string;
  expires_at: string;
};
```

### `GET /api/share/{token}`

Public route, no auth. Returns the (read-only) document if the share is valid + (optional) passcode matches.

---

## Audit log

### `GET /api/audit/{document_id}`

List every agent call that produced this document. RLS scopes to the document's owner.

```ts
// 200 OK
type Response = { traces: AgentTrace[] };
```

---

## Evals (internal — Team F)

### `GET /api/admin/evals`

Latest eval run results across all metrics. Backed by `EvalRunResult`. Frontend renders a dashboard. Restricted to a `role = 'admin'` claim on the user.

```ts
// 200 OK
type Response = {
  runs: EvalRunResult[];
};
```

### `POST /api/admin/evals/run`

Trigger an eval run from a saved fixture. Returns immediately with a `run_id`; results land in `eval_runs` table when done.

```ts
type Request = {
  dataset_id: string;
  models: string[];                 // e.g. ["claude-3-5-sonnet", "gpt-4o", "gemini-1.5-pro"]
};

// 202 Accepted
type Response = { run_id: string };
```

---

## Error model (all routes)

Non-2xx responses always return:

```ts
type ErrorResponse = {
  error: string;        // machine-readable code
  message?: string;     // human-friendly
  details?: unknown;    // optional debug payload (omitted in prod)
};
```

Common codes:

| HTTP | `error` code | When |
|---|---|---|
| 400 | `bad_request` | Invalid body / query params |
| 401 | `unauthorized` | No or invalid session |
| 403 | `forbidden` | RLS denied; never reveal whether the row exists |
| 404 | `not_found` | Resource absent (or RLS) |
| 409 | `conflict` | Optimistic concurrency on edit |
| 429 | `rate_limited` | Per-user rate limit hit (Dharmik's middleware) |
| 5xx | `internal` | Server bug; reported to Sentry; no details to client |

---

## Inter-team contract: how agents talk to backend

The Backend's `POST /api/draft` handler imports `runAgentChain` from `@trionic/agents` and forwards the agent's `AgentStreamEvent` emissions straight to the SSE stream. **Team C does not write API code. Team B does not write agent logic.** The contract is `AgentStreamEvent` — that's the boundary.

```
Frontend  ──POST /api/draft──▶  Backend  ──runAgentChain()──▶  Agents
                                   ▲                              │
                                   │      AgentStreamEvent[]      │
                                   └──────────────────────────────┘
                                   ▼
                              SSE stream
                                   ▼
                               Frontend
```

Every agent call **must** write a row to `agent_traces` via the Tracing layer (Umrania's module). The Backend reads from there for `/api/audit/{id}`. Team F reads from there for evals.

---

## Inter-team contract: how agents talk to PageIndex

Agents call PageIndex through the Agno tool surface defined in `packages/pageindex/src/agnoTool.ts` (Samarth's). Functions:

```ts
pageindex.search({ query, scope, top_k }): Promise<{ node_id, snippet }[]>
pageindex.descend({ node_id }): Promise<{ children: TreeNode[] }>
pageindex.get_text({ node_id }): Promise<{ text: string; snapshot_id: SnapshotId }>
```

The shape of these is locked. Team D owns the implementation; Team C owns the calls.

---

## What's NOT in Week-2 scope

- Webhooks for external integrations
- Real-time collaborative editing endpoints
- OAuth providers
- Magic-link auth
- File uploads beyond the export bucket
- Public REST API for third-party developers

If you need any of these for your task, talk to the repo managers first — likely out of scope.
