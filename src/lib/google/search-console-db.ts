import { createAppAdminClient } from "@/lib/supabase/admin";

export type GscConnectionRow = {
  id: string;
  project_id: string;
  user_id: string;
  google_email: string | null;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  site_url: string | null;
  created_at: string;
  updated_at: string;
};

export type GscConnectionPublic = {
  connected: boolean;
  googleEmail: string | null;
  siteUrl: string | null;
  needsProperty: boolean;
};

export async function getGscConnection(
  projectId: string
): Promise<GscConnectionRow | null> {
  const admin = createAppAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("google_search_console_connections")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error || !data) return null;
  return data as GscConnectionRow;
}

export function toPublicConnection(
  row: GscConnectionRow | null
): GscConnectionPublic {
  if (!row) {
    return {
      connected: false,
      googleEmail: null,
      siteUrl: null,
      needsProperty: false,
    };
  }
  return {
    connected: true,
    googleEmail: row.google_email,
    siteUrl: row.site_url,
    needsProperty: !row.site_url,
  };
}

export async function upsertGscConnection(input: {
  projectId: string;
  userId: string;
  googleEmail: string | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  siteUrl?: string | null;
}): Promise<GscConnectionRow | null> {
  const admin = createAppAdminClient();
  if (!admin) return null;

  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("google_search_console_connections")
    .upsert(
      {
        project_id: input.projectId,
        user_id: input.userId,
        google_email: input.googleEmail,
        access_token: input.accessToken,
        refresh_token: input.refreshToken,
        access_token_expires_at: input.expiresAt.toISOString(),
        site_url: input.siteUrl ?? null,
        updated_at: now,
      },
      { onConflict: "project_id" }
    )
    .select("*")
    .single();

  if (error || !data) return null;
  return data as GscConnectionRow;
}

export async function updateGscTokens(
  projectId: string,
  accessToken: string,
  expiresAt: Date
): Promise<void> {
  const admin = createAppAdminClient();
  if (!admin) return;

  await admin
    .from("google_search_console_connections")
    .update({
      access_token: accessToken,
      access_token_expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("project_id", projectId);
}

export async function updateGscProperty(
  projectId: string,
  siteUrl: string
): Promise<boolean> {
  const admin = createAppAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .from("google_search_console_connections")
    .update({
      site_url: siteUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("project_id", projectId);

  return !error;
}

export async function deleteGscConnection(projectId: string): Promise<boolean> {
  const admin = createAppAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .from("google_search_console_connections")
    .delete()
    .eq("project_id", projectId);

  return !error;
}
