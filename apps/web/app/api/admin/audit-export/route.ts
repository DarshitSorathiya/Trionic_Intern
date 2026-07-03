/**
 * apps/web/app/api/admin/audit-export/route.ts
 *
 * Owner: Aayush Tilva (Team B — Backend) — Week 4, Issue #264
 *
 * GET /api/admin/audit-export?from=<ISO>&to=<ISO>
 *   Admin-only CSV export of agent_traces for compliance review.
 *   Requires users.role = 'admin' — checked after Supabase auth.
 *   Returns a downloadable CSV file with Content-Disposition: attachment.
 *
 * Query params:
 *   from  — ISO-8601 datetime (inclusive lower bound on created_at)
 *   to    — ISO-8601 datetime (inclusive upper bound on created_at)
 *
 * Security:
 *   - Auth: Supabase session required
 *   - Role: users.role = 'admin' hard-checked (not just RLS)
 *   - PII: redactTraces() applied before CSV serialisation
 *   - RLS: "agent_traces: admin read all" policy on Supabase also enforces this
 *
 * Used by: @Sunny2307 (Admin → Audit page, W4 frontend task)
 */

import { NextResponse } from 'next/server'
import type { AgentTrace } from '@trionic/shared'
import { createClient } from '@/lib/supabase/server'
import { redactTraces } from '@/lib/redaction'

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: code, message }, { status })
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────

const CSV_HEADERS = [
  'id',
  'document_id',
  'agent',
  'model',
  'tokens_in',
  'tokens_out',
  'cost_usd',
  'latency_ms',
  'cited_nodes',
  'status',
  'error_message',
  'timestamp',
]

/** Escapes a single CSV cell (quotes if it contains comma, newline, or quote) */
function csvCell(value: unknown): string {
  const str = value == null ? '' : String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** Converts an array of AgentTrace + metadata to a CSV string */
function tracesToCsv(
  rows: Array<AgentTrace & { id: string; document_id: string }>
): string {
  const lines: string[] = [CSV_HEADERS.join(',')]

  for (const t of rows) {
    lines.push(
      [
        t.id,
        t.document_id,
        t.agent,
        t.model,
        t.tokens_in,
        t.tokens_out,
        t.cost_usd,
        t.latency_ms,
        csvCell(t.cited_nodes.join(';')),
        t.status,
        csvCell(t.error_message ?? ''),
        t.timestamp,
      ]
        .map(csvCell)
        .join(',')
    )
  }

  return lines.join('\r\n')
}

// ─── GET /api/admin/audit-export ─────────────────────────────────────────────

export async function GET(request: Request) {
  const supabase = await createClient()

  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return errorResponse('unauthorized', 'Authentication required', 401)
  }

  // ── 2. Admin role check ────────────────────────────────────────────────────
  // Supabase RLS also enforces "agent_traces: admin read all", but we check
  // here for a clean 403 error message rather than an empty result set.
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    return errorResponse('forbidden', 'Admin access required', 403)
  }

  // ── 3. Parse date range params ─────────────────────────────────────────────
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return errorResponse('bad_request', 'Both "from" and "to" ISO datetime params are required', 400)
  }

  const fromDate = new Date(from)
  const toDate = new Date(to)

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return errorResponse('bad_request', '"from" and "to" must be valid ISO-8601 datetimes', 400)
  }

  if (fromDate > toDate) {
    return errorResponse('bad_request', '"from" must be before "to"', 400)
  }

  // ── 4. Query agent_traces in date range ────────────────────────────────────
  const { data: rows, error: queryError } = await supabase
    .from('agent_traces')
    .select(
      'id, document_id, agent_name, llm_provider, model_name, ' +
      'prompt_tokens, completion_tokens, cost_usd, latency_ms, ' +
      'status, error_msg, metadata, created_at'
    )
    .gte('created_at', fromDate.toISOString())
    .lte('created_at', toDate.toISOString())
    .order('created_at', { ascending: true })

  if (queryError) {
    console.error('[GET /api/admin/audit-export] query failed:', queryError)
    return errorResponse('internal', 'Failed to export audit traces', 500)
  }

  // ── 5. Map to AgentTrace + preserve id/document_id for CSV ────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawTraces = ((rows as any[]) ?? []).map((t) => ({
    id: t.id as string,
    document_id: (t.document_id ?? '') as string,
    agent: t.agent_name as string,
    model: `${t.llm_provider}/${t.model_name}`,
    tokens_in: t.prompt_tokens ?? 0,
    tokens_out: t.completion_tokens ?? 0,
    cost_usd: Number(t.cost_usd ?? 0),
    latency_ms: t.latency_ms ?? 0,
    cited_nodes: (t.metadata as { cited_nodes?: string[] })?.cited_nodes ?? [],
    status: t.status as AgentTrace['status'],
    timestamp: t.created_at as string,
    session_id: (t.document_id ?? undefined) as string | undefined,
    error_message: (t.error_msg ?? undefined) as string | undefined,
  }))

  // ── 6. Redact PII before serialisation ─────────────────────────────────────
  const redacted = redactTraces(rawTraces) as typeof rawTraces

  // ── 7. Merge id/document_id back (redactTraces only touches AgentTrace keys) ─
  const exportRows = redacted.map((t, i) => ({
    ...t,
    id: rawTraces[i].id,
    document_id: rawTraces[i].document_id,
  }))

  // ── 8. Serialise to CSV and return as downloadable file ────────────────────
  const csv = tracesToCsv(exportRows)
  const filename = `audit-export-${from.slice(0, 10)}-to-${to.slice(0, 10)}.csv`

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
