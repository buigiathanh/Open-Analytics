import { createAppAdminClient } from "@/lib/supabase/admin";
import type { UrlInspectionFull } from "@/lib/google/url-inspection";

export type GscManagedLinkRow = {
  id: string;
  project_id: string;
  url: string;
  inspection: UrlInspectionFull | null;
  last_inspected_at: string | null;
  created_at: string;
};

export async function listGscManagedLinks(
  projectId: string
): Promise<GscManagedLinkRow[]> {
  const admin = createAppAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("gsc_managed_links")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as GscManagedLinkRow[];
}

export async function upsertGscManagedLink(input: {
  projectId: string;
  url: string;
  inspection: UrlInspectionFull | null;
  inspectedAt: Date | null;
}): Promise<GscManagedLinkRow | null> {
  const admin = createAppAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("gsc_managed_links")
    .upsert(
      {
        project_id: input.projectId,
        url: input.url,
        inspection: input.inspection,
        last_inspected_at: input.inspectedAt?.toISOString() ?? null,
      },
      { onConflict: "project_id,url" }
    )
    .select("*")
    .single();

  if (error || !data) return null;
  return data as GscManagedLinkRow;
}

export async function deleteGscManagedLink(
  projectId: string,
  linkId: string
): Promise<boolean> {
  const admin = createAppAdminClient();
  if (!admin) return false;

  const { error } = await admin
    .from("gsc_managed_links")
    .delete()
    .eq("project_id", projectId)
    .eq("id", linkId);

  return !error;
}

export async function getGscManagedLink(
  projectId: string,
  linkId: string
): Promise<GscManagedLinkRow | null> {
  const admin = createAppAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("gsc_managed_links")
    .select("*")
    .eq("project_id", projectId)
    .eq("id", linkId)
    .maybeSingle();

  if (error || !data) return null;
  return data as GscManagedLinkRow;
}

/** URL → cached inspection row */
export async function getGscLinksCacheByUrl(
  projectId: string,
  urls?: string[]
): Promise<Map<string, GscManagedLinkRow>> {
  const admin = createAppAdminClient();
  const map = new Map<string, GscManagedLinkRow>();
  if (!admin) return map;

  if (urls && urls.length > 0) {
    const { data, error } = await admin
      .from("gsc_managed_links")
      .select("*")
      .eq("project_id", projectId)
      .in("url", urls);
    if (error || !data) return map;
    for (const row of data as GscManagedLinkRow[]) {
      map.set(row.url, row);
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
