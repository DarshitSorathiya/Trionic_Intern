# Week 1 — Aayush Tilva

**Team:** B — Backend  
**Module owned:** Versioning + Audit Log API  
**Week of:** 2026-05-19

---

## What I shipped this week

- Authored and opened RFC for the document versioning model and audit-log read API — [`docs/RFC-versioning-audit-log.md`](../../docs/RFC-versioning-audit-log.md) (PR: _link here once PR is open_)

## Demo

_RFC walk-through — see [`docs/RFC-versioning-audit-log.md`](../../docs/RFC-versioning-audit-log.md) for the full design. 60-second video to be added at Demo Day._

## Metrics

| Metric | Value | Notes |
|---|---|---|
| RFC sections completed | 10/10 | Schema, RLS, APIs, Team F contract, retention, redaction |
| Tables designed | 2 | `document_versions`, `agent_traces` |
| API routes specified | 3 | versions list, single version, audit log |

## Blockers

- Waiting on Team A (Sohil / redline editor) to confirm whether manual saves are per-keystroke or per-explicit-save — affects version granularity.
- Need Team C's write contract for `agent_traces` inserts to finalize column guarantees.

## Next week

- Open migration PR: `packages/db/migrations/0002_versioning.sql` with `document_versions` + `agent_traces` tables and RLS policies
- Implement `GET /api/documents/:id/versions` and `GET /api/audit` route handlers
- Export `AuditTraceForEvals` type to `packages/shared` and coordinate with Kirtan (Team F)

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> _repo manager writes 1 line here_
