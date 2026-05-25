import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Site } from "./types";

/** Normalize project ref or full Supabase URL → project API URL */
export function supabaseUrlFromProjectId(projectId: string): string {
  const raw = projectId.trim();
  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const u = new URL(raw);
      const host = u.hostname.replace(/\.supabase\.co$/i, "");
      return `https://${host}.supabase.co`;
    } catch {
      return "";
    }
  }

  const ref = raw.replace(/\.supabase\.co$/i, "").replace(/^\/+|\/+$/g, "");
  return `https://${ref}.supabase.co`;
}

/** Client for a user's analytics Supabase project (tracker + dashboard reads). */
export function createProjectClient(
  url: string,
  publicKey: string
): SupabaseClient {
  return createClient(url.replace(/\/$/, ""), publicKey.trim(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Verify the user's project has the events table (schema-analytics.sql). */
export async function verifyUserAnalyticsProject(
  url: string,
  publicKey: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!url || !publicKey) {
    return { ok: false, message: "Missing Project ID/URL or Publishable key." };
  }

  let client: SupabaseClient;
  try {
    client = createProjectClient(url, publicKey);
  } catch {
    return { ok: false, message: "Invalid URL or key." };
  }

  const { error } = await client.from("events").select("id").limit(1);
  if (error) {
    return {
      ok: false,
      message: `Cannot read the events table. Run the SQL from step 2 in your Supabase SQL Editor, then try again. (${error.message})`,
    };
  }

  return { ok: true };
}

/** Client for reading events from the user's analytics Supabase project. */
export function getSupabaseForSite(site: Site): SupabaseClient | null {
  if (site.supabase_url && site.supabase_anon_key) {
    return createProjectClient(site.supabase_url, site.supabase_anon_key);
  }
  return null;
}
