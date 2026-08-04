import { supabase } from "@/integrations/supabase/client";

// Real Supabase Auth-backed admin session helpers.
// All admin checks happen server-side via RLS policies using has_role('admin').

export async function checkAdminSession(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return !!data && !error;
}

export async function destroyAdminSession(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSessionAge(): Promise<number> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return 0;
  // approximate using token issued_at if available
  const issuedAt = (session as any).user?.last_sign_in_at;
  if (!issuedAt) return 0;
  return Date.now() - new Date(issuedAt).getTime();
}
