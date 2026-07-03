// Server component — runs on every request to any /admin/* page.
// Gates the entire admin section with a DB-backed role check BEFORE any
// child page renders. Replaces the prior client-only AdminLayout check
// (which still exists for sidebar UX but is no longer the security boundary).
//
// Why DB-backed instead of JWT-claim-based:
//   The previous check trusted user_metadata.role which is client-writable
//   via supabase.auth.updateUser({ data: { role: 'admin' } }) — trivial
//   privilege escalation. public.users.role is RLS-protected against
//   self-escalation (see packages/db/supabase/migrations/0001_init.sql:66).

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminGateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect(`/${locale}/auth/sign-in?next=/admin`);
  }

  const { data: profile, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (roleError || !profile || profile.role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  return <>{children}</>;
}
