import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { IterateRequest, AgentStreamEvent } from "@trionic/shared";
// Ignore module import if agents package is not compiled yet in monorepo bootstrap
import { runIterationChain, SupabaseStore } from "@trionic/agents";

// Ensure Node.js runtime and set maximum duration
export const runtime = "nodejs";
export const maxDuration = 120; // 2 minutes — iterations are faster than full chain

/**
 * Validates the IterateRequest body.
 */
function validateIterateRequest(body: unknown): { error?: string; validatedData?: IterateRequest } {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object" };
  }

  const req = body as Record<string, unknown>;

  // Validate instruction
  if (!req.instruction || typeof req.instruction !== "string") {
    return { error: "Missing or invalid instruction" };
  }
  if (req.instruction.trim().length === 0) {
    return { error: "instruction cannot be empty" };
  }
  if (req.instruction.length > 2000) {
    return { error: "instruction must be 2000 characters or fewer" };
  }

  return { validatedData: body as IterateRequest };
}

/**
 * POST /api/draft/[document_id]/iterate
 *
 * Iteration Endpoint: Re-runs only Drafter → Citator → Reviewer → [Translator]
 * using the existing ConversationState from a prior full chain run.
 *
 * Memory loads the existing draft's state (Classifier output, Planner output,
 * retrieved nodes); only Drafter + Reviewer + maybe Translator re-run.
 *
 * Each iteration creates a new DocumentVersion row with change_note = instruction.
 *
 * ~3-5× faster than POST /api/draft since Classifier + retrieval skip.
 */
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

  // 2. Initialize Supabase Route Handler client
  let supabase: Awaited<ReturnType<typeof createClient>>;
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
  const { data: { user }, error: sessionError } = await supabase.auth.getUser();
  if (sessionError) {
    console.error("Supabase getUser error:", sessionError);
    return NextResponse.json(
      { error: "unauthorized", message: "Failed to get session", details: sessionError.message },
      { status: 401 }
    );
  }
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Unauthorized session: active session is required" },
      { status: 401 }
    );
  }

  // 4. Parse and validate the IterateRequest body
  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch (err) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: "Invalid request payload: valid JSON body is required",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 400 }
    );
  }

  const validation = validateIterateRequest(bodyJson);
  if (validation.error || !validation.validatedData) {
    return NextResponse.json(
      { error: "bad_request", message: validation.error || "Validation failed" },
      { status: 400 }
    );
  }

  const iterateReq = validation.validatedData;

  // 5. Verify document exists and belongs to the authenticated user
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("id, owner_id, language")
    .eq("id", document_id)
    .single();

  if (docError || !document) {
    console.error("Document not found or access denied:", docError);
    return NextResponse.json(
      { error: "not_found", message: "Document not found or access denied" },
      { status: 404 }
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

  // 7. Initialize memory store and iteration chain
  const memoryStore = new SupabaseStore(supabase);

  const generator: AsyncGenerator<AgentStreamEvent> = runIterationChain(
    {
      document_id,
      instruction: iterateReq.instruction,
      target_language: document.language || "en",
      session_id: user.id,
    },
    {
      memoryStore,
    }
  );

  // 8. Construct the ReadableStream to pipe generator emissions as SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Graceful cancellation support
      req.signal.addEventListener("abort", () => {
        generator.return?.(undefined).catch(() => {});
      });

      try {
        for await (const event of generator) {
          if (req.signal.aborted) {
            break;
          }

          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));

          if (event.type === "draft.final") {
            // Write a new DocumentVersion row with change_note = instruction
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

            // Insert with concurrency retry (up to 3 attempts)
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
                  change_note: iterateReq.instruction,
                  created_by: user.id,
                })
                .select("id")
                .single();

              if (!insertError && insertedData) {
                newVersion = insertedData;
                insertSuccess = true;
              } else if (insertError && insertError.code === "23505") {
                // Unique key violation — retry with incremented version
                console.warn(`Concurrency conflict on version_num ${currentNextVersion} (attempt ${insertAttempts}). Retrying...`);
                const { data: latestV, error: selectRetryError } = await supabase
                  .from("document_versions")
                  .select("version_num")
                  .eq("document_id", document_id)
                  .order("version_num", { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (selectRetryError) {
                  console.error("Failed to query latest version during retry:", selectRetryError);
                  throw selectRetryError;
                }
                currentNextVersion = (latestV?.version_num || 0) + 1;
              } else {
                console.error("Failed to insert document version:", insertError);
                throw insertError || new Error("Failed to insert document version");
              }
            }

            if (!insertSuccess || !newVersion) {
              throw new Error("Failed to save iteration version due to persistent concurrency conflicts.");
            }

            // Update document status to final
            const { error: updateError } = await supabase
              .from("documents")
              .update({
                status: "final",
                updated_at: new Date().toISOString(),
              })
              .eq("id", document_id);

            if (updateError) {
              console.error("Failed to update document status to final:", updateError);
              throw updateError;
            }

            controller.close();
            break;
          } else if (event.type === "step.error") {
            // Pipeline failed — mark status as failed
            const { error: updateError } = await supabase
              .from("documents")
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
        // System-level error fallback
        console.error("Iteration chain error:", err);
        const errorEvent: AgentStreamEvent = {
          type: "step.error",
          agent: "system",
          message: err instanceof Error ? err.message : String(err),
          ts: new Date().toISOString(),
        };
        const data = `data: ${JSON.stringify(errorEvent)}\n\n`;
        controller.enqueue(encoder.encode(data));

        // Mark document as failed
        const { error: updateError } = await supabase
          .from("documents")
          .update({ status: "failed" })
          .eq("id", document_id);
        if (updateError) {
          console.error("Failed to update document status to failed in catch:", updateError);
        }

        controller.close();
      }
    },
    cancel() {
      generator.return?.(undefined).catch(() => {});
    },
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
