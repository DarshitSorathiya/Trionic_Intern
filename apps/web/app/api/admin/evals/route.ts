import { NextResponse } from "next/server";
import {
  buildEvalRuns,
  createSupabaseClient,
  errorResponse,
  handleAdminEvals,
  warnIfBudgetExceeded,
} from "./lib";
import type { TraceRow } from "./lib";

export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    return handleAdminEvals(supabase);
  } catch (error) {
    return errorResponse(
      500,
      "internal_error",
      error instanceof Error ? error.message : "Unknown error",
      process.env.NODE_ENV === "development" && error instanceof Error ? error.stack ?? null : null,
    );
  }
}

// No inline mock traces — using real `agent_traces` table only.
