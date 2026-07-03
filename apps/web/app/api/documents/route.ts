import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupportedLanguage, Document, DocumentType } from '@trionic/shared'

// ─── Validation helpers ─────────────────────────────────────────────────────

const ALLOWED_LANGUAGES: SupportedLanguage[] = ['en', 'hi', 'gu', 'mr', 'ta']
const ALLOWED_DOC_TYPES: DocumentType[] = [
  'rti_application',
  'legal_notice',
  'nda',
  'consumer_complaint',
  'cheque_bounce_notice',
]

const DOC_TYPE_TITLES: Record<DocumentType, string> = {
  rti_application: 'RTI Application',
  legal_notice: 'Legal Notice',
  nda: 'NDA',
  consumer_complaint: 'Consumer Complaint',
  cheque_bounce_notice: 'Cheque Bounce Notice',
}

// ─── POST /api/documents ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized', message: 'Authentication required' }, { status: 401 })
    }

    // 2. Parse and validate body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'bad_request', message: 'Invalid JSON body' }, { status: 400 })
    }

    const { doc_type, language, intake_text } = body

    if (!language || typeof language !== 'string') {
      return NextResponse.json({ error: 'bad_request', message: 'language is required and must be a string' }, { status: 400 })
    }
    if (!intake_text || typeof intake_text !== 'string' || intake_text.trim().length === 0) {
      return NextResponse.json({ error: 'bad_request', message: 'intake_text is required and must not be empty' }, { status: 400 })
    }

    if (!ALLOWED_LANGUAGES.includes(language as SupportedLanguage)) {
      return NextResponse.json({ error: 'bad_request', message: `language must be one of: ${ALLOWED_LANGUAGES.join(', ')}` }, { status: 400 })
    }

    if (doc_type !== undefined && !ALLOWED_DOC_TYPES.includes(doc_type)) {
      return NextResponse.json({ error: 'bad_request', message: `doc_type must be one of: ${ALLOWED_DOC_TYPES.join(', ')}` }, { status: 400 })
    }

    // 3. Derive a friendly title
    const title = doc_type
      ? DOC_TYPE_TITLES[doc_type as DocumentType]
      : intake_text.trim().slice(0, 30).padEnd(0) || 'Untitled Draft'

    // 4. Insert the document. doc_type is now stored verbatim
    //    (migration 0004 converted the column to TEXT with a CHECK constraint
    //    matching @trionic/shared values — no more lossy enum mapping).
    const insertRow: Record<string, unknown> = {
      owner_id: user.id,
      title,
      language,
      intake_text,
      status: 'draft',
    }
    if (doc_type) {
      insertRow.doc_type = doc_type
    }
    // If doc_type is undefined the column default ('rti_application') applies.

    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert(insertRow)
      .select('id')
      .single()

    if (insertError || !document) {
      console.error('[POST /api/documents] DB insert failed:', insertError)
      return NextResponse.json({ error: 'internal', message: 'Failed to create document record' }, { status: 500 })
    }

    return NextResponse.json({ document_id: document.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/documents] handler exception:', err)
    return NextResponse.json({ error: 'internal', message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

// ─── GET /api/documents ──────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized', message: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const doc_type = searchParams.get('doc_type')
    const language = searchParams.get('language')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const cursor = searchParams.get('cursor')

    let query = supabase
      .from('documents')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)
    if (doc_type) query = query.eq('doc_type', doc_type)
    if (language) query = query.eq('language', language)
    if (cursor) query = query.lt('created_at', cursor)

    const { data: dbDocs, error: queryError } = await query
    if (queryError) {
      console.error('[GET /api/documents] DB select failed:', queryError)
      return NextResponse.json({ error: 'internal', message: 'Failed to query documents' }, { status: 500 })
    }

    // Map DB rows to @trionic/shared Document shape (no lossy mapping — DB
    // values now match the contract verbatim post-migration 0004).
    const documents: Document[] = (dbDocs || []).map((row) => ({
      id: row.id,
      owner_id: row.owner_id,
      title: row.title,
      doc_type: row.doc_type as DocumentType,
      language: row.language as SupportedLanguage,
      status: row.status,
      current_version_id: row.current_version_id || null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    const nextCursor = dbDocs && dbDocs.length === limit ? dbDocs[dbDocs.length - 1].created_at : null

    return NextResponse.json({ documents, next_cursor: nextCursor }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/documents] handler exception:', err)
    return NextResponse.json({ error: 'internal', message: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
