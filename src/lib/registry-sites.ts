import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Site } from "@/lib/types";

export async function getRegistryUser(
  registry: SupabaseClient
): Promise<User | null> {
  const {
    data: { user },
  } = await registry.auth.getUser();
  return user;
}

/** Projects (registered sites) owned by the signed-in user — app DB only. */
export async function listSitesForUser(
  registry: SupabaseClient,
  userId: string
): Promise<Site[]> {
  const { data, error } = await registry
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data as Site[]) ?? [];
}

/** Returns the site only if it belongs to `userId`; otherwise null. */
export async function getSiteForUser(
  registry: SupabaseClient,
  siteId: string,
  userId: string
): Promise<Site | null> {
  const { data, error } = await registry
    .from("projects")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data as Site) ?? null;
}
