import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** App Supabase with service role — server only; bypasses RLS to save site rows after auth check. */
export function createAppAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  return createClient(url.replace(/\/$/, ""), serviceRoleKey.trim(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
