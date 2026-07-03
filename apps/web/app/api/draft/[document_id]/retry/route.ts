import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import type { AgentStreamEvent, SupportedLanguage, DocumentType } from "@trionic/shared";
import { runAgentChainWithMemory, SupabaseStore, Memory } from "@trionic/agents";

// Ensure Node.js runtime and set maximum duration for long-running agent chains
export const runtime = "nodejs";
export const maxDuration = 300; // Allow 5 minutes since agent pipelines involve multiple sequential LLM calls

// Migration 0004 converted documents.doc_type to TEXT with a CHECK constraint
// matching @trionic/shared DocumentType. The DB now stores shared values
// verbatim — the old lossy `dbToSharedDocType` mapping helper is removed.

export async function POST(
  req: Request,
  { params }: { params: Promise<{ document_id: string }> }
) {
  const { document_id } = await params;

  // 1. Validate document_id format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!document_id || !uuidRegex.test(document_id)) {
    return NextResponse.json(
      { error: "bad_request", message: "document_id must be a valid UUID" },
      { status: 400 }
    );
  }

  // 2. Initialize Supabase Client
  let supabase;
  try {
    supabase = await createClient();
  } catch (err) {
    return NextResponse.json(
      {
        error: "internal",
        message: "Supabase client initialization failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  // 3. Authenticate the caller
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Unauthorized: active session is required" },
      { status: 401 }
    );
  }

  // 4. Rate Limiting Check: 10 calls/hour per user
  const proceed = await checkRateLimit(supabase, user.id);
  if (!proceed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Rate limit exceeded: maximum 10 generation calls per hour"
      },
      { status: 429 }
    );
  }

  // 5. Verify document exists and belongs to the authenticated user (Security check)
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("id, owner_id, title, doc_type, language, intake_text")
    .eq("id", document_id)
    .single();

  if (docError || !document) {
    console.error("Document not found or access denied:", docError);
    return NextResponse.json(
      { error: "not_found", message: "Document not found or access denied" },
      { status: 404 }
    );
  }

  if (document.owner_id !== user.id) {
    return NextResponse.json(
      { error: "unauthorized", message: "Document ownership verification failed" },
      { status: 401 }
    );
  }

  // 6. Set document status to "generating"
  const { error: generatingError } = await supabase
    .from("documents")
    .update({ status: "generating" })
    .eq("id", document_id);

  if (generatingError) {
    console.error("Failed to update status to generating:", generatingError);
    return NextResponse.json(
      { error: "internal", message: "Failed to update document status to generating" },
      { status: 500 }
    );
  }

  const encoder = new TextEncoder();

  // 7. Initialize Memory Store and Clear previous cache for clean retry
  const memoryStore = new SupabaseStore(supabase);
  const memory = new Memory(memoryStore);
  try {
    await memory.clear(document_id);
  } catch (clearErr) {
    console.warn("Memory clear failed during retry (non-fatal):", clearErr);
  }

  // doc_type is stored verbatim post-migration 0004 — no mapping needed.
  const sharedDocType = document.doc_type as DocumentType;
  const targetLanguage = document.language as SupportedLanguage;

  // 8. Run full agent chain orchestrator
  const generator: AsyncGenerator<AgentStreamEvent> = runAgentChainWithMemory(
    {
      document_id,
      intake_text: document.intake_text || "",
      target_language: targetLanguage,
      doc_type: sharedDocType,
      session_id: user.id,
    },
    {
      memoryStore,
    }
  );

  // 9. Construct the ReadableStream to pipe generator emissions as SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Graceful cancellation support
      req.signal.addEventListener("abort", async () => {
        try {
          await generator.return?.(undefined);
          await supabase
            .from("documents")
            .update({ status: "failed" })
            .eq("id", document_id);
        } catch (err) {
          console.error("Error setting document status to failed on abort:", err);
        }
      });

      try {
        for await (const event of generator) {
          if (req.signal.aborted) {
            break;
          }

          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));

          if (event.type === "draft.final") {
            // Write a new DocumentVersion record inside Supabase to persist the retry draft
            const { data: latestVersion, error: selectError } = await supabase
              .from("document_versions")
              .select("version_num")
              .eq("document_id", document_id)
              .order("version_num", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (selectError) {
              console.error("Failed to query latest version:", selectError);
              throw selectError;
            }

            const nextVersion = (latestVersion?.version_num || 0) + 1;

            // Perform concurrency protected insertion
            let insertSuccess = false;
            let currentNextVersion = nextVersion;
            let insertAttempts = 0;
            let newVersion = null;

            while (!insertSuccess && insertAttempts < 3) {
              insertAttempts++;
              const { data: insertedData, error: insertError } = await supabase
                .from("document_versions")
                .insert({
                  document_id,
                  version_num: currentNextVersion,
                  body_markdown: event.response.body_markdown,
                  created_by: user.id,
                })
                .select("id")
                .single();

              if (!insertError && insertedData) {
                newVersion = insertedData;
                insertSuccess = true;
              } else if (insertError && insertError.code === "23505") {
                console.warn(`Concurrency conflict detected on version_num ${currentNextVersion} (attempt ${insertAttempts}). Retrying version increment...`);
                const { data: latestV, error: selectRetryError } = await supabase
                  .from("document_versions")
                  .select("version_num")
                  .eq("document_id", document_id)
                  .order("version_num", { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (selectRetryError) {
                  console.error("Failed to query latest version during concurrency retry:", selectRetryError);
                  throw selectRetryError;
                }
                currentNextVersion = (latestV?.version_num || 0) + 1;
              } else {
                console.error("Failed to insert document version:", insertError);
                throw insertError || new Error("Failed to insert document version");
              }
            }

            if (!insertSuccess || !newVersion) {
              throw new Error("Failed to save retry version due to persistent concurrency conflicts.");
            }

            // Set document status to final and update current_version_id
            const { error: updateError } = await supabase.from("documents")
              .update({
                status: "final",
                current_version_id: newVersion.id,
                updated_at: new Date().toISOString()
              })
              .eq("id", document_id);

            if (updateError) {
              console.error("Failed to update document status to final:", updateError);
              throw updateError;
            }

            controller.close();
            break;
          } else if (event.type === "step.error") {
            const { error: updateError } = await supabase.from("documents")
              .update({ status: "failed" })
              .eq("id", document_id);
            if (updateError) {
              console.error("Failed to update document status to failed:", updateError);
            }

            controller.close();
            break;
          }
        }
      } catch (err) {
        console.error("Retry chain error:", err);
        const errorEvent: AgentStreamEvent = {
          type: "step.error",
          agent: "system",
          message: err instanceof Error ? err.message : String(err),
          ts: new Date().toISOString()
        };
        const data = `data: ${JSON.stringify(errorEvent)}\n\n`;
        controller.enqueue(encoder.encode(data));

        const { error: updateError } = await supabase.from("documents")
          .update({ status: "failed" })
          .eq("id", document_id);
        if (updateError) {
          console.error("Failed to update document status to failed in catch block:", updateError);
        }

        controller.close();
      }
    },
    async cancel() {
      try {
        await generator.return?.(undefined);
        await supabase
          .from("documents")
          .update({ status: "failed" })
          .eq("id", document_id);
      } catch (err) {
        console.error("Error setting document status to failed on cancel:", err);
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
