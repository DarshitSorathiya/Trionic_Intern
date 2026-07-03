/**
 * apps/web/app/api/documents/[id]/route.ts
 *
 * Owner: Aayush Tilva (Team B — Backend)
 *
 * PATCH /api/documents/{id}
 *   Creates a new DocumentVersion row on every edit — never overwrites.
 *   Updates documents.current_version_id to the new version.
 *   Returns the newly created DocumentVersion.
 *
 * Contract:  docs/API_CONTRACTS.md § "PATCH /api/documents/{id}"
 * Types:     @trionic/shared → DocumentVersion
 * Schema:    packages/db/supabase/migrations/0001_init.sql (#163)
 *
 *   document_versions(id, document_id, version_num, body_markdown,
 *                     change_note, created_by, created_at)
 *   Note: citations are stored in a separate `citations` table.
 */

import { NextResponse } from 'next/server'
import type { DocumentVersion } from '@trionic/shared'
import { createClient } from '@/lib/supabase/server'

// ─── Request body shape (per API_CONTRACTS.md) ───────────────────────────────

interface PatchDocumentBody {
  body_markdown: string
  title?: string
  change_note?: string
}

// ─── Error helper ─────────────────────────────────────────────────────────────

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: code, message }, { status })
}

function hasSubstantiveMarkdown(markdown: string): boolean {
  if (!markdown || !markdown.trim()) return false

  const stripped = markdown
    .replace(/\[CITE:[^\]]+\]/g, '')
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/^---\s*$/gm, '')
    .trim()

  return stripped.length >= 60
}

// ─── PATCH /api/documents/{id} ───────────────────────────────────────────────

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params

  // ── 1. Parse + validate body ───────────────────────────────────────────────
  let body: PatchDocumentBody
  try {
    body = await request.json()
  } catch {
    return errorResponse('bad_request', 'Invalid JSON body', 400)
  }

  if (!body.body_markdown || typeof body.body_markdown !== 'string') {
    return errorResponse(
      'bad_request',
      'body_markdown is required and must be a string',
      400
    )
  }

  // ── 2. Auth ────────────────────────────────────────────────────────────────
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return errorResponse('unauthorized', 'Authentication required', 401)
  }

  // ── 3. Verify document exists + ownership ─────────────────────────────────
  // RLS handles this, but we want a deterministic 404 rather than an empty row.
  // Never distinguish 403 vs 404 (security — per API_CONTRACTS.md error model).
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('id, owner_id')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    return errorResponse('not_found', 'Document not found', 404)
  }

  // ── 4/5. Compute next version + insert with retry on unique conflict ───────
  // Concurrent autosave requests can race on version_num. Retry a few times
  // when (document_id, version_num) conflicts instead of failing the request.
  let newVersion: {
    id: string
    document_id: string
    version_num: number
    body_markdown: string
    created_by: string
    created_at: string
  } | null = null

  let insertError: { code?: string; message?: string; details?: string; hint?: string } | null = null

  for (let attempt = 1; attempt <= 3; attempt++) {
    const { data: latestVersion, error: latestVersionError } = await supabase
      .from('document_versions')
      .select('version_num')
      .eq('document_id', documentId)
      .order('version_num', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestVersionError) {
      insertError = latestVersionError
      break
    }

    const nextVersionNum = (latestVersion?.version_num ?? 0) + 1

    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_num: nextVersionNum,
        body_markdown: body.body_markdown,
        change_note: body.change_note ?? null,
        created_by: user.id,
      })
      .select()
      .single()

    if (!error && data) {
      newVersion = data
      insertError = null
      break
    }

    insertError = error
    if (error?.code !== '23505') {
      break
    }
  }

  if (!newVersion) {
    console.error('[PATCH /api/documents/:id] insert failed:', insertError)

    if (insertError?.code === '23505') {
      return errorResponse('conflict', 'Concurrent save conflict. Please retry.', 409)
    }

    return errorResponse('internal', 'Failed to create document version', 500)
  }

  // ── 6. Update documents updated_at ────────────────────────────────────────
  await supabase
    .from('documents')
    .update({
      updated_at: new Date().toISOString(),
      ...(body.title ? { title: body.title } : {}),
    })
    .eq('id', documentId)

  // ── 7. Return new DocumentVersion (shape from @trionic/shared) ─────────────
  const response: DocumentVersion = {
    id: newVersion.id,
    document_id: newVersion.document_id,
    version_num: newVersion.version_num,
    body_markdown: newVersion.body_markdown,
    citations: [],   // citations live in separate table; not embedded here
    created_by: newVersion.created_by,
    created_at: newVersion.created_at,
  }

  return NextResponse.json(response, { status: 200 })
}

// ─── GET /api/documents/{id} ─────────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params
  const supabase = await createClient()

  // Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return errorResponse('unauthorized', 'Authentication required', 401)
  }

  // Fetch document
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    return errorResponse('not_found', 'Document not found', 404)
  }

  // Fetch recent versions (newest first) and prefer the latest non-empty
  // markdown body to avoid transient blank autosave versions shadowing
  // meaningful content.
  const { data: versions } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_num', { ascending: false })
    .limit(10)

  const currentVersion =
    versions?.find((v) => hasSubstantiveMarkdown(v.body_markdown ?? '')) ||
    versions?.[0] ||
    null

  let currentVersionDetails: DocumentVersion | null = null
  if (currentVersion) {
    currentVersionDetails = {
      id: currentVersion.id,
      document_id: currentVersion.document_id,
      version_num: currentVersion.version_num,
      body_markdown: currentVersion.body_markdown,
      citations: [],
      created_by: currentVersion.created_by,
      created_at: currentVersion.created_at,
    }
  }

  // Map DB representation to shared types
  let sharedDocType = document.doc_type
  if (document.doc_type === 'petition') sharedDocType = 'rti_application'
  else if (document.doc_type === 'agreement') sharedDocType = 'nda'
  else if (document.doc_type === 'complaint') sharedDocType = 'consumer_complaint'
  else if (document.doc_type === 'notice') {
    if (document.title && /cheque/i.test(document.title)) {
      sharedDocType = 'cheque_bounce_notice'
    } else {
      sharedDocType = 'legal_notice'
    }
  }

  let sharedStatus = document.status
  if (document.status === 'review') sharedStatus = 'generating'

  const mappedDocument = {
    ...document,
    doc_type: sharedDocType,
    status: sharedStatus
  }

  return NextResponse.json({
    document: mappedDocument,
    current_version: currentVersionDetails
  }, { status: 200 })
}
