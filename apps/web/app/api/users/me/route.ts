import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@trionic/shared";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    try {
      const { data: profile, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!dbError && profile) {
        return NextResponse.json(profile);
      }

      console.warn(
        "Could not find user profile in DB, falling back to auth metadata:",
        dbError?.message
      );
    } catch (dbQueryException) {
      console.warn(
        "Users table query threw an exception, falling back to auth metadata:",
        dbQueryException
      );
    }

    const fallbackUser: User = {
      id: user.id,
      email: user.email ?? "",
      display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || null,
      default_language: (user.user_metadata?.default_language || "en") as User["default_language"],
      onboarded_at: user.user_metadata?.onboarded_at || null,
      created_at: user.created_at,
    };

    return NextResponse.json(fallbackUser);
  } catch (error) {
    console.error("GET /api/users/me server error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, default_language, onboarded } = body;

    const updateData: Record<string, unknown> = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (default_language !== undefined) updateData.default_language = default_language;
    if (onboarded === true) updateData.onboarded_at = new Date().toISOString();

    let profileUpdated = false;
    let updatedProfile = null;

    try {
      const { data, error: dbError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();

      if (!dbError && data) {
        updatedProfile = data;
        profileUpdated = true;
      } else {
        console.warn("Database users table update unsuccessful:", dbError?.message);
      }
    } catch (dbUpdateException) {
      console.warn("Database users table update threw an exception:", dbUpdateException);
    }

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: {
        ...updateData,
      },
    });

    if (authUpdateError) {
      console.warn("Failed to update auth user metadata:", authUpdateError.message);
    }

    if (profileUpdated && updatedProfile) {
      return NextResponse.json(updatedProfile);
    }

    const fallbackUser: User = {
      id: user.id,
      email: user.email ?? "",
      display_name: display_name !== undefined ? display_name : (user.user_metadata?.display_name || null),
      default_language: default_language !== undefined ? default_language : (user.user_metadata?.default_language || "en"),
      onboarded_at: onboarded === true ? new Date().toISOString() : (user.user_metadata?.onboarded_at || null),
      created_at: user.created_at,
    };

    return NextResponse.json(fallbackUser);
  } catch (error) {
    console.error("PATCH /api/users/me server error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/me
 *
 * Owner: Aayush Tilva (Team B — Backend) — Week 4 inter-team handoff
 * Called by: @sarvakmakani's "Delete my account" flow (W4 frontend task)
 *
 * Soft-delete: sets deleted_at to now() on the users row.
 * Hard delete and data erasure runs as a scheduled job after 30-day grace period.
 * The user's Supabase Auth session is NOT revoked here — the frontend should
 * call supabase.auth.signOut() immediately after this responds with 200.
 *
 * Requires: confirmation body { confirm: true } to prevent accidental calls.
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    // ── Auth ────────────────────────────────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // ── Require explicit confirmation to guard against accidental calls ──────
    let body: { confirm?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // empty body is treated as no confirmation
    }

    if (body.confirm !== true) {
      return NextResponse.json(
        { error: "bad_request", message: 'Body must include { "confirm": true }' },
        { status: 400 }
      );
    }

    // ── Soft-delete: stamp deleted_at on the users row ───────────────────────
    const deletedAt = new Date().toISOString();
    const { error: dbError } = await supabase
      .from("users")
      .update({ deleted_at: deletedAt })
      .eq("id", user.id);

    if (dbError) {
      console.error("DELETE /api/users/me DB update failed:", dbError.message);
      // Fall through to auth-level note even if DB update fails
    }

    // ── Annotate auth metadata so middleware can gate this account ───────────
    await supabase.auth.updateUser({
      data: { deleted_at: deletedAt, deletion_grace_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
    });

    return NextResponse.json(
      {
        message: "Account scheduled for deletion",
        deleted_at: deletedAt,
        grace_period_days: 30,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/users/me server error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
