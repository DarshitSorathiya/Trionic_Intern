/**
 * apps/web/app/api/audit/[document_id]/route.ts
 *
 * Owner: Aayush Tilva (Team B — Backend)
 *
 * GET /api/audit/{document_id}
 *   Returns every agent trace for the given document, oldest → newest.
 *   PII redaction applied at read-time before data leaves the server (W4 #264).
 *   RLS policy "agent_traces: owner read" scopes to auth.uid() = user_id.
 *
 * Contract:  docs/API_CONTRACTS.md § "GET /api/audit/{document_id}"
 * Types:     @trionic/shared → AgentTrace
 * Schema:    packages/db/supabase/migrations/0001_init.sql (#163)
 *
 * W4 change: redactTraces() call added between DB fetch and JSON response.
 * Written by: packages/agents/src/tracing (Umrania Yug, Team C — #114)
 * This route is READ-ONLY — never writes to agent_traces.
 */

import { NextResponse } from 'next/server'
import type { AgentTrace } from '@trionic/shared'
import { createClient } from '@/lib/supabase/server'
import { redactTraces } from '@/lib/redaction'

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: code, message }, { status })
}

// ─── GET /api/audit/{document_id} ────────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ document_id: string }> }
) {
  const { document_id: documentId } = await params

  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return errorResponse('unauthorized', 'Authentication required', 401)
  }

  // ── Query agent traces ─────────────────────────────────────────────────────
  // RLS "agent_traces: owner read" enforces auth.uid() = user_id.
  // Ordered by created_at ASC so the audit trail reads chronologically.
  const { data: rows, error } = await supabase
    .from('agent_traces')
    .select(
      'id, document_id, user_id, agent_name, llm_provider, model_name, ' +
      'prompt_tokens, completion_tokens, cost_usd, latency_ms, ' +
      'status, error_msg, metadata, created_at'
    )
    .eq('document_id', documentId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[GET /api/audit/:document_id] query failed:', error)
    return errorResponse('internal', 'Failed to fetch audit traces', 500)
  }

  // ── Map DB columns → AgentTrace shape from @trionic/shared ────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawTraces: AgentTrace[] = ((rows as any[]) ?? []).map((t) => ({
    agent: t.agent_name,
    model: `${t.llm_provider}/${t.model_name}`,
    tokens_in: t.prompt_tokens ?? 0,
    tokens_out: t.completion_tokens ?? 0,
    cost_usd: Number(t.cost_usd ?? 0),
    latency_ms: t.latency_ms ?? 0,
    cited_nodes: (t.metadata as { cited_nodes?: string[] })?.cited_nodes ?? [],
    status: t.status as AgentTrace['status'],
    timestamp: t.created_at,
    session_id: t.document_id ?? undefined,
    error_message: t.error_msg ?? undefined,
  }))

  // ── W4: PII redaction at read-time (Hard Constraint #5) ───────────────────
  // Scrubs phone numbers, Aadhaar, emails, and names from string fields
  // before data leaves the server. Raw data stays intact in agent_traces table.
  const traces = redactTraces(rawTraces)

  return NextResponse.json({ traces }, { status: 200 })
}
