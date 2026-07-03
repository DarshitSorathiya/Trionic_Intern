# Week 1 — Yug Umrania

**Team:** Agents (Team C)
**Module owned:** Tracing / observability layer (`packages/agents/src/tracing/`)
**Week of:** 2026-05-18

---

## What I shipped this week

- RFC-2026-001: Agent Traces Schema Definition — [PR #43](https://github.com/Trionic-Interns/trionic-ai-adalat/pull/43) merged to main
  - Defined 22 schema fields for the `agent_traces` table
  - Designed nested call linking via `trace_id`, `parent_trace_id`, `root_trace_id`
  - Defined PII redaction rules for Indian context (Aadhaar, PAN, phone, email)
  - Added `citation_node_ids` field for Citation-or-die enforcement
  - Added RLS policy note for Supabase
  - Added data retention policy (90 days production / 14 days staging)
  - Added 5 open questions for Team B (partitioning, soft-deletes, insert volume)

## Demo


[RFC-2026-001 — Agent Traces Schema walkthrough](https://www.loom.com/share/6829297ca38b465f9a7d051a9490aca4)

## Metrics

| Metric | Value | Notes |
|---|---|---|
| RFC sections | 9 | Summary, Motivation, Schema, Nesting, PII, Retention, Questions, Alternatives, Review |
| Schema fields defined | 22 | Covers all required, optional, and audit fields |
| PRs opened | 1 | PR #43 — docs only, merged cleanly |
| CI issues flagged | 1 | pnpm version conflict — flagged to repo managers, fixed same day |

## Blockers

- None currently. pnpm CI conflict (version mismatch between GitHub Actions config and `package.json`) was flagged to @Dhruv5353 and @Sohil2085 and resolved same day.

## Next week

- Wire real Supabase client into `persistTrace()` in `packages/agents/src/tracing/index.ts` (currently a console.log stub)
- Pick up Week 2 issue for tracing module once created by @malaysheta
- Support Team B with any schema contract questions from RFC-2026-001

---

### Mentor feedback (filled by repo manager Friday 7 PM IST)

> <repo manager writes 1 line here>