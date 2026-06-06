import { query, queryOne } from "@/lib/db/pool";
import { isPostgresConfigured } from "@/lib/db/config";
import type { UrlInspectionFull } from "@/lib/google/url-inspection";

export type GscManagedLinkRow = {
  id: string;
  project_id: string;
  url: string;
  inspection: UrlInspectionFull | null;
  last_inspected_at: string | null;
  created_at: string;
};

function rowToLink(row: Record<string, unknown>): GscManagedLinkRow {
  return {
    id: String(row.id),
    project_id: String(row.project_id),
    url: String(row.url),
    inspection: (row.inspection as UrlInspectionFull | null) ?? null,
    last_inspected_at:
      row.last_inspected_at != null
        ? new Date(String(row.last_inspected_at)).toISOString()
        : null,
    created_at: new Date(String(row.created_at)).toISOString(),
  };
}

export async function listGscManagedLinks(
  projectId: string
): Promise<GscManagedLinkRow[]> {
  if (!isPostgresConfigured()) return [];
  const rows = await query(
    `select * from gsc_managed_links where project_id = $1 order by created_at desc`,
    [projectId]
  );
  return rows.map(rowToLink);
}

export async function upsertGscManagedLink(input: {
  projectId: string;
  url: string;
  inspection: UrlInspectionFull | null;
  inspectedAt: Date | null;
}): Promise<GscManagedLinkRow | null> {
  if (!isPostgresConfigured()) return null;
  const row = await queryOne(
    `insert into gsc_managed_links (project_id, url, inspection, last_inspected_at)
     values ($1, $2, $3, $4)
     on conflict (project_id, url) do update set
       inspection = excluded.inspection,
       last_inspected_at = excluded.last_inspected_at
     returning *`,
    [
      input.projectId,
      input.url,
      input.inspection ?? null,
      input.inspectedAt?.toISOString() ?? null,
    ]
  );
  return row ? rowToLink(row) : null;
}

export async function deleteGscManagedLink(
  projectId: string,
  linkId: string
): Promise<boolean> {
  if (!isPostgresConfigured()) return false;
  const row = await queryOne(
    `delete from gsc_managed_links where project_id = $1 and id = $2 returning id`,
    [projectId, linkId]
  );
  return Boolean(row);
}

export async function getGscManagedLink(
  projectId: string,
  linkId: string
): Promise<GscManagedLinkRow | null> {
  if (!isPostgresConfigured()) return null;
  const row = await queryOne(
    `select * from gsc_managed_links where project_id = $1 and id = $2`,
    [projectId, linkId]
  );
  return row ? rowToLink(row) : null;
}

export async function getGscLinksCacheByUrl(
  projectId: string,
  urls?: string[]
): Promise<Map<string, GscManagedLinkRow>> {
  const map = new Map<string, GscManagedLinkRow>();
  if (!isPostgresConfigured()) return map;

  if (urls && urls.length > 0) {
    const rows = await query(
      `select * from gsc_managed_links where project_id = $1 and url = any($2)`,
      [projectId, urls]
    );
    for (const row of rows) {
      const link = rowToLink(row);
      map.set(link.url, link);
    }
    return map;
  }

  const rows = await listGscManagedLinks(projectId);
  for (const row of rows) {
    map.set(row.url, row);
  }
  return map;
}

const CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

export function isGscInspectionCacheFresh(
  row: GscManagedLinkRow | undefined
): boolean {
  if (!row?.last_inspected_at || !row.inspection) return false;
  const age = Date.now() - new Date(row.last_inspected_at).getTime();
  return age < CACHE_MAX_AGE_MS;
}
