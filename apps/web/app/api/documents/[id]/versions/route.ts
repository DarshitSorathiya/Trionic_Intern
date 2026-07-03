/**
 * apps/web/app/api/documents/[id]/versions/route.ts
 *
 * Owner: Aayush Tilva (Team B — Backend)
 *
 * GET /api/documents/{id}/versions
 *   Returns the full version history for a document, oldest → newest.
 *   RLS policy "doc_versions: owner read" scopes results to the document owner.
 *
 * Contract:  docs/API_CONTRACTS.md § "GET /api/documents/{id}/versions"
 * Types:     @trionic/shared → DocumentVersion
 * Schema:    packages/db/supabase/migrations/0001_init.sql (#163)
 */

import { NextResponse } from 'next/server'
import type { DocumentVersion } from '@trionic/shared'
import { createClient } from '@/lib/supabase/server'

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: code, message }, { status })
}

// ─── GET /api/documents/{id}/versions ────────────────────────────────────────

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params

  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return errorResponse('unauthorized', 'Authentication required', 401)
  }

  // ── Query ──────────────────────────────────────────────────────────────────
  // RLS policy "doc_versions: owner read" automatically restricts to
  // documents where owner_id = auth.uid().
  const { data: rows, error } = await supabase
    .from('document_versions')
    .select('id, document_id, version_num, body_markdown, change_note, created_by, created_at')
    .eq('document_id', documentId)
    .order('version_num', { ascending: true })

  if (error) {
    console.error('[GET /api/documents/:id/versions] query failed:', error)
    return errorResponse('internal', 'Failed to fetch versions', 500)
  }

  // Map to locked DocumentVersion type from @trionic/shared.
  // citations field is [] — fetched separately from citations table if needed.
  const versions: DocumentVersion[] = (rows ?? []).map((v) => ({
    id: v.id,
    document_id: v.document_id,
    version_num: v.version_num,
    body_markdown: v.body_markdown,
    citations: [],
    created_by: v.created_by,
    created_at: v.created_at,
  }))

  return NextResponse.json({ versions }, { status: 200 })
}
