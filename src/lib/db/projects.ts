import { query, queryOne } from "@/lib/db/pool";
import type { Site } from "@/lib/types";

const PUBLIC_SITE_COLUMNS =
  "id, name, domain, site_key, user_id, share_realtime_enabled, created_at";

const OWNER_SITE_COLUMNS = `${PUBLIC_SITE_COLUMNS}, api_key`;

function rowToSite(
  row: Record<string, unknown>,
  includeApiKey: boolean
): Site {
  const site: Site = {
    id: String(row.id),
    name: String(row.name),
    domain: String(row.domain),
    site_key: String(row.site_key),
    user_id: row.user_id ? String(row.user_id) : null,
    share_realtime_enabled: Boolean(row.share_realtime_enabled),
    created_at: new Date(String(row.created_at)).toISOString(),
  };
  if (includeApiKey && row.api_key != null) {
    site.api_key = String(row.api_key);
  }
  return site;
}

export async function listProjectsForUser(userId: string): Promise<Site[]> {
  const rows = await query(
    `select ${OWNER_SITE_COLUMNS} from projects where user_id = $1 order by created_at desc`,
    [userId]
  );
  return rows.map((row) => rowToSite(row, true));
}

export async function getProjectForUser(
  siteId: string,
  userId: string
): Promise<Site | null> {
  const row = await queryOne(
    `select ${OWNER_SITE_COLUMNS} from projects where id = $1 and user_id = $2`,
    [siteId, userId]
  );
  return row ? rowToSite(row, true) : null;
}

export async function getProjectForPublicShare(
  siteId: string
): Promise<Site | null> {
  const row = await queryOne(
    `select ${PUBLIC_SITE_COLUMNS} from projects where id = $1 and share_realtime_enabled = true`,
    [siteId]
  );
  return row ? rowToSite(row, false) : null;
}

export async function getProjectBySiteKey(
  siteKey: string
): Promise<Site | null> {
  const row = await queryOne(
    `select ${OWNER_SITE_COLUMNS} from projects where site_key = $1`,
    [siteKey]
  );
  return row ? rowToSite(row, true) : null;
}

export async function createProject(input: {
  name: string;
  domain: string;
  userId: string;
}): Promise<Site> {
  const row = await queryOne(
    `insert into projects (name, domain, user_id)
     values ($1, $2, $3)
     returning ${OWNER_SITE_COLUMNS}`,
    [input.name, input.domain, input.userId]
  );
  if (!row) throw new Error("Failed to create project");
  return rowToSite(row, true);
}

export async function updateProject(
  siteId: string,
  userId: string,
  input: { name: string; domain: string }
): Promise<Site | null> {
  const row = await queryOne(
    `update projects set name = $3, domain = $4
     where id = $1 and user_id = $2
     returning ${OWNER_SITE_COLUMNS}`,
    [siteId, userId, input.name, input.domain]
  );
  return row ? rowToSite(row, true) : null;
}

export async function updateProjectShare(
  siteId: string,
  userId: string,
  enabled: boolean
): Promise<{ id: string; share_realtime_enabled: boolean } | null> {
  const row = await queryOne(
    `update projects set share_realtime_enabled = $3
     where id = $1 and user_id = $2
     returning id, share_realtime_enabled`,
    [siteId, userId, enabled]
  );
  if (!row) return null;
  return {
    id: String(row.id),
    share_realtime_enabled: Boolean(row.share_realtime_enabled),
  };
}
