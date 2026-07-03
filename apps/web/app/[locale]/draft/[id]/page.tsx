import { notFound, redirect } from "next/navigation";
import type { Document, Citation, SupportedLanguage, DocumentStatus, DocumentType } from "@trionic/shared";
import { DraftWorkspace } from "@/components/editor/draft-workspace";
import { createClient } from "@/lib/supabase/server";

function hasSubstantiveMarkdown(markdown: string): boolean {
  if (!markdown || !markdown.trim()) return false;

  // Strip citations, headings, and horizontal rules to detect heading-only skeletons.
  const stripped = markdown
    .replace(/\[CITE:[^\]]+\]/g, "")
    .replace(/^#{1,6}\s+.*$/gm, "")
    .replace(/^---\s*$/gm, "")
    .trim();

  return stripped.length >= 60;
}


/** Fetch real document from Supabase DB */
async function getRealDocument(id: string): Promise<{ document: Document; content: string; citations: Citation[] } | null> {
  try {
    const supabase = await createClient();

    // Fetch the authenticated user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      redirect("/auth/sign-in");
    }

    // Query documents
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (docError || !document) {
      return null;
    }

    // Query recent document versions (newest first). We prefer the latest
    // non-empty body to avoid rendering an accidental blank autosave as the
    // canonical draft.
    const { data: versions, error: verError } = await supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", id)
      .order("version_num", { ascending: false })
      .limit(10);

    if (verError) {
      console.error("[DraftPage] Failed to load document versions:", verError);
    }

    const latestVersion =
      versions?.find((v) => hasSubstantiveMarkdown(v.body_markdown ?? "")) ??
      versions?.[0];
    const content = latestVersion?.body_markdown ?? document.intake_text ?? "";

    // Parse citations dynamically from markdown
    const citations = Array.from(content.matchAll(/\[CITE:([^\]]+)\]/g)).map((match: any) => ({
      node_id: match[1],
      snapshot_id: "2026-05-28",
      span: [match.index!, match.index! + match[0].length] as [number, number]
    }));

    // Map DB representation to shared types
    let sharedDocType = document.doc_type;
    if (document.doc_type === 'petition') sharedDocType = 'rti_application';
    else if (document.doc_type === 'agreement') sharedDocType = 'nda';
    else if (document.doc_type === 'complaint') sharedDocType = 'consumer_complaint';
    else if (document.doc_type === 'notice') {
      if (document.title && /cheque/i.test(document.title)) {
        sharedDocType = 'cheque_bounce_notice';
      } else {
        sharedDocType = 'legal_notice';
      }
    }

    let sharedStatus = document.status;
    if (document.status === 'review') sharedStatus = 'generating';

    const mappedDocument: Document = {
      id: document.id,
      owner_id: document.owner_id,
      title: document.title,
      doc_type: sharedDocType as DocumentType,
      language: document.language as SupportedLanguage,
      status: sharedStatus as DocumentStatus,
      current_version_id: document.current_version_id || null,
      created_at: document.created_at,
      updated_at: document.updated_at,
    };

    return {
      document: mappedDocument,
      content,
      citations,
    };
  } catch (err) {
    console.error("[DraftPage] Database error occurred:", err);
    return null;
  }
}

/**
 * Draft Editor Server Component
 */
export default async function DraftPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  
  // 1. Fetch real server data
  const data = await getRealDocument(id);
  
  // 2. Handle not found gracefully
  if (!data) {
    notFound();
  }
  
  // 4. Delegate to the Client Component orchestrator
  return (
    <DraftWorkspace
      documentId={id}
      initialDocument={data.document}
      initialContent={data.content}
      initialCitations={data.citations}
    />
  );
}
