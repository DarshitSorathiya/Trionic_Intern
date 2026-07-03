import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Checks if the user has exceeded their rate limit of 10 generation calls per hour.
 * Triggers on both new drafts, retries, and iterations since all run the 'drafter' step.
 *
 * @param supabase - The authenticated Supabase client
 * @param userId - The user ID to check
 * @returns boolean - true if the user is allowed to proceed, false if rate limited
 */
export async function checkRateLimit(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Query agent_traces where user_id = userId, agent_name = 'drafter', and created_at >= oneHourAgo
  // We use head: true, count: 'exact' to be as fast/cheap as possible
  const { count, error } = await supabase
    .from("agent_traces")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("agent_name", "drafter")
    .gte("created_at", oneHourAgo);

  if (error) {
    console.error("[checkRateLimit] database error:", error);
    // Fail-open to avoid locking users out due to a db glitch
    return true;
  }

  return (count ?? 0) < 10;
}
