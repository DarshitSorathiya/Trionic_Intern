import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import type { DraftRequest, AgentStreamEvent } from "@trionic/shared";
import { runAgentChainWithMemory, SupabaseStore } from "@trionic/agents";

// Ensure Node.js runtime and set maximum duration for long-running agent chains
export const runtime = "nodejs";
export const maxDuration = 300; // Allow 5 minutes since agent pipelines involve multiple sequential LLM calls

/**
 * Validates the DraftRequest request body.
 */
function validateDraftRequest(body: unknown): { error?: string; validatedData?: DraftRequest } {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object" };
  }

  const req = body as Record<string, unknown>;

  // Validate document_id
  if (!req.document_id || typeof req.document_id !== "string") {
    return { error: "Missing or invalid document_id" };
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(req.document_id)) {
    return { error: "document_id must be a valid UUID" };
  }

  // Validate intake_text
  if (!req.intake_text || typeof req.intake_text !== "string") {
    return { error: "Missing or invalid intake_text" };
  }
  if (req.intake_text.trim().length === 0) {
    return { error: "intake_text cannot be empty" };
  }

  // Validate target_language
  if (!req.target_language || typeof req.target_language !== "string") {
    return { error: "Missing or invalid target_language" };
  }
  const allowedLanguages = ["en", "hi", "gu", "mr", "ta"];
  if (!allowedLanguages.includes(req.target_language)) {
    return { error: `target_language must be one of: ${allowedLanguages.join(", ")}` };
  }

  // Validate doc_type (optional)
  if (req.doc_type !== undefined) {
    if (typeof req.doc_type !== "string") {
      return { error: "doc_type must be a string" };
    }
    const allowedDocTypes = ["rti_application", "legal_notice", "nda", "consumer_complaint", "cheque_bounce_notice"];
    if (!allowedDocTypes.includes(req.doc_type)) {
      return { error: `doc_type must be one of: ${allowedDocTypes.join(", ")}` };
    }
  }

  // Validate user_context (optional)
  if (req.user_context !== undefined) {
    if (typeof req.user_context !== "object" || req.user_context === null) {
      return { error: "user_context must be a JSON object" };
    }
    for (const [key, value] of Object.entries(req.user_context)) {
      if (typeof key !== "string" || typeof value !== "string") {
        return { error: "user_context keys and values must be strings" };
      }
    }
  }

  return { validatedData: body as DraftRequest };
}

/**
 * POST /api/draft
 * 
 * Generation Endpoint: Wires the agent chain orchestrator to the SSE stream.
 * Resolves authentication, parses user instructions, retrieves or initializes
 * conversation memory, executes classifier -> planner -> pageindex -> drafter -> citator -> reviewer -> translator,
 * and streams AgentStreamEvent frames to the client in real-time.
 */
export async function POST(req: Request) {
  // 1. Initialize Supabase Route Handler client (unified on @supabase/ssr).
  let supabase: Awaited<ReturnType<typeof createClient>>;
  try {
    supabase = await createClient();
  } catch (err) {
    return NextResponse.json(
      {
        error: "internal",
        message: "Supabase client initialization failed",
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  }

  // 2. Authenticate the caller. Use getUser() — it verifies the JWT against
  //    Supabase Auth (server-trusted), unlike getSession() which only reads the cookie.
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Supabase getUser error:", authError);
    return NextResponse.json(
      { error: "unauthorized", message: "Failed to verify user", details: authError.message },
      { status: 401 }
    );
  }
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Unauthorized: active session is required" },
      { status: 401 }
    );
  }
  // 2.5. Rate Limiting Check: 10 calls/hour per user
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

  // 3. Parse and validate the incoming DraftRequest JSON body
  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch (err) {
    return NextResponse.json(
      { 
        error: "bad_request", 
        message: "Invalid request payload: valid JSON body is required", 
        details: err instanceof Error ? err.message : String(err) 
      },
      { status: 400 }
    );
  }

  const validation = validateDraftRequest(bodyJson);
  if (validation.error || !validation.validatedData) {
    return NextResponse.json(
      { error: "bad_request", message: validation.error || "Validation failed" },
      { status: 400 }
    );
  }

  const draftReq = validation.validatedData;

  // 3.5. Verify document exists and belongs to the authenticated user (Security check)
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("id, owner_id")
    .eq("id", draftReq.document_id)
    .single();

  if (docError || !document) {
    console.error("Document not found or access denied:", docError);
    return NextResponse.json(
      { error: "not_found", message: "Document not found or access denied" },
      { status: 404 }
    );
  }
  const encoder = new TextEncoder();

  // 4. Determine base URL (needed since API is called server-side from another route in some architectures)

  console.log('[API/DRAFT] Initializing SupabaseStore');
  const memoryStore = new SupabaseStore(supabase);

  console.log('[API/DRAFT] Calling runAgentChainWithMemory');
  // 5. Initialize Malay's memory-aware agent chain generator
  const generator: AsyncGenerator<AgentStreamEvent> = runAgentChainWithMemory(
    {
      document_id: draftReq.document_id,
      intake_text: draftReq.intake_text,
      target_language: draftReq.target_language,
      doc_type: draftReq.doc_type,
      session_id: user.id, // Feed authenticated user id as the session identifier
    },
    {
      memoryStore,
    }
  );

  console.log('[API/DRAFT] Creating ReadableStream');

  // 6. Construct the ReadableStream to pipe generator emissions as Server-Sent Events (SSE)
  const stream = new ReadableStream({
    async start(controller) {
      // Graceful cancellation support: Abort agent chain mid-flight if client disconnects
      req.signal.addEventListener("abort", async () => {
        try {
          await generator.return?.(undefined);
          await supabase
            .from("documents")
            .update({ status: "failed" })
            .eq("id", draftReq.document_id);
        } catch (err) {
          console.error("Error setting document status to failed on abort:", err);
        }
      });

      try {
        console.log('[API/DRAFT] Stream started, entering for await loop');
        
        // Pad the stream to force Next.js/Vercel to flush headers and start streaming
        controller.enqueue(encoder.encode(`: ${' '.repeat(2048)}\n\n`));

        // Iterate over the generator's async iterable stream
        for await (const event of generator) {
          console.log('[API/DRAFT] Received event type:', event.type);
          // Break immediately if request is already aborted
          if (req.signal.aborted) {
            break;
          }

          // Format each event as a standard SSE frame
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));

          // Handle pipeline milestones / terminations
          if (event.type === "draft.final") {
            // Write a new DocumentVersion record inside Supabase to persist the draft
            // A. Fetch current maximum version number for the document (monotonically increasing)
            const { data: latestVersion, error: selectError } = await supabase
              .from("document_versions")
              .select("version_num")
              .eq("document_id", draftReq.document_id)
              .order("version_num", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (selectError) {
              console.error("Failed to query latest version:", selectError);
              throw selectError;
            }

            const nextVersion = (latestVersion?.version_num || 0) + 1;

            // B. Perform concurrency protected insertion (retry up to 3 times on unique constraint violation)
            let insertSuccess = false;
            let currentNextVersion = nextVersion;
            let insertAttempts = 0;
            let newVersion = null;

            while (!insertSuccess && insertAttempts < 3) {
              insertAttempts++;
              const { data: insertedData, error: insertError } = await supabase
                .from("document_versions")
                .insert({
                  document_id: draftReq.document_id,
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
                // Unique key violation: concurrent edit inserted a version first.
                // Fetch the latest version number again and increment it.
                console.warn(`Concurrency conflict detected on version_num ${currentNextVersion} (attempt ${insertAttempts}). Retrying version increment...`);
                const { data: latestV, error: selectRetryError } = await supabase
                  .from("document_versions")
                  .select("version_num")
                  .eq("document_id", draftReq.document_id)
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
              throw new Error("Failed to save draft version due to persistent concurrency conflicts.");
            }

            // C. Set document status to final and update current_version_id
            const { error: updateError } = await supabase.from("documents")
              .update({ 
                status: "final",
                updated_at: new Date().toISOString()
              })
              .eq("id", draftReq.document_id);

            if (updateError) {
              console.error("Failed to update document status to final:", updateError);
              throw updateError;
            }

            // D. Close connection
            controller.close();
            break;
          } else if (event.type === "step.error") {
            // Pipeline failed (e.g., Citator rejection). Mark status as failed and close stream.
            const { error: updateError } = await supabase.from("documents")
              .update({ status: "failed" })
              .eq("id", draftReq.document_id);
            if (updateError) {
              console.error("Failed to update document status to failed:", updateError);
            }

            controller.close();
            break;
          }
        }
      } catch (err) {
        // Enqueue system-level step.error fallback in case of unexpected exceptions
        console.error("Agent chain error:", err);
        const errorEvent: AgentStreamEvent = {
          type: "step.error",
          agent: "system", 
          message: err instanceof Error ? err.message : String(err),
          ts: new Date().toISOString()
        };
        const data = `data: ${JSON.stringify(errorEvent)}\n\n`;
        controller.enqueue(encoder.encode(data));

        // Mark document as failed in the database
        const { error: updateError } = await supabase.from("documents")
          .update({ status: "failed" })
          .eq("id", draftReq.document_id);
        if (updateError) {
          console.error("Failed to update document status to failed in catch block:", updateError);
        }
          
        controller.close();
      }
    },
    async cancel() {
      try {
        // Abort agent pipeline if client breaks the stream reader explicitly
        await generator.return?.(undefined);
        await supabase
          .from("documents")
          .update({ status: "failed" })
          .eq("id", draftReq.document_id);
      } catch (err) {
        console.error("Error setting document status to failed on cancel:", err);
      }
    }
  });

  // Return standard text/event-stream headers to keep stream connection active
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Prevent buffering in Vercel/Nginx proxies
    },
  });
}
