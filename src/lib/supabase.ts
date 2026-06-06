import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import {
  isAppServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

export { isSupabaseConfigured, isAppServiceRoleConfigured } from "./supabase/config";
export { isPostgresConfigured } from "./db/config";

/** Server client for the app Supabase project (auth + site registry in /app). */
export async function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  return createServerSupabaseClient();
}
