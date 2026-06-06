import { query, queryOne } from "@/lib/db/pool";
import { isPostgresConfigured } from "@/lib/db/config";

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

function rowToGsc(row: Record<string, unknown>): GscConnectionRow {
  return {
    id: String(row.id),
    project_id: String(row.project_id),
    user_id: String(row.user_id),
    google_email: row.google_email != null ? String(row.google_email) : null,
    access_token: String(row.access_token),
    refresh_token: String(row.refresh_token),
    access_token_expires_at: new Date(
      String(row.access_token_expires_at)
    ).toISOString(),
    site_url: row.site_url != null ? String(row.site_url) : null,
    created_at: new Date(String(row.created_at)).toISOString(),
    updated_at: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getGscConnection(
  projectId: string
): Promise<GscConnectionRow | null> {
  if (!isPostgresConfigured()) return null;
  const row = await queryOne(
    `select * from google_search_console_connections where project_id = $1`,
    [projectId]
  );
  return row ? rowToGsc(row) : null;
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
  if (!isPostgresConfigured()) return null;
  const now = new Date().toISOString();
  const row = await queryOne(
    `insert into google_search_console_connections (
      project_id, user_id, google_email, access_token, refresh_token,
      access_token_expires_at, site_url, updated_at
    ) values ($1,$2,$3,$4,$5,$6,$7,$8)
    on conflict (project_id) do update set
      user_id = excluded.user_id,
      google_email = excluded.google_email,
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      access_token_expires_at = excluded.access_token_expires_at,
      site_url = coalesce(excluded.site_url, google_search_console_connections.site_url),
      updated_at = excluded.updated_at
    returning *`,
    [
      input.projectId,
      input.userId,
      input.googleEmail,
      input.accessToken,
      input.refreshToken,
      input.expiresAt.toISOString(),
      input.siteUrl ?? null,
      now,
    ]
  );
  return row ? rowToGsc(row) : null;
}

export async function updateGscTokens(
  projectId: string,
  accessToken: string,
  expiresAt: Date
): Promise<void> {
  if (!isPostgresConfigured()) return;
  await query(
    `update google_search_console_connections
     set access_token = $2, access_token_expires_at = $3, updated_at = $4
     where project_id = $1`,
    [projectId, accessToken, expiresAt.toISOString(), new Date().toISOString()]
  );
}

export async function updateGscProperty(
  projectId: string,
  siteUrl: string
): Promise<boolean> {
  if (!isPostgresConfigured()) return false;
  const row = await queryOne(
    `update google_search_console_connections
     set site_url = $2, updated_at = $3
     where project_id = $1
     returning id`,
    [projectId, siteUrl, new Date().toISOString()]
  );
  return Boolean(row);
}

export async function deleteGscConnection(projectId: string): Promise<boolean> {
  if (!isPostgresConfigured()) return false;
  const row = await queryOne(
    `delete from google_search_console_connections where project_id = $1 returning id`,
    [projectId]
  );
  return Boolean(row);
}
