
import {
  createSupabaseClient,
  errorResponse,
  handleAdminEvalRun,
} from "../lib";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const supabase = await createSupabaseClient();
    return handleAdminEvalRun(supabase, body);
  } catch (error) {
    return errorResponse(
      500,
      "internal_error",
      error instanceof Error ? error.message : "Unknown error",
      process.env.NODE_ENV === "development" && error instanceof Error ? error.stack ?? null : null,
    );
  }
}
