import type { User } from "@supabase/supabase-js";

import {
  getProjectById,
  getProjectForPublicShare,
  getProjectForUser,
  listProjectsForUser,
} from "@/lib/db/projects";
import { isPostgresConfigured } from "@/lib/db/config";
import { createClient } from "@/lib/supabase/server";
import type { Site } from "@/lib/types";

export async function getRegistryUser(): Promise<User | null> {
  const registry = await createClient();
  const {
    data: { user },
  } = await registry.auth.getUser();
  return user;
}

/** Projects (registered sites) owned by the signed-in user. */
export async function listSitesForUser(userId: string): Promise<Site[]> {
  if (!isPostgresConfigured()) return [];
  return listProjectsForUser(userId);
}

/** Returns the site only if it belongs to `userId`; otherwise null. */
export async function getSiteForUser(
  siteId: string,
  userId: string
): Promise<Site | null> {
  if (!isPostgresConfigured()) return null;
  return getProjectForUser(siteId, userId);
}

/** Public realtime share page — only when share_realtime_enabled is true. */
export async function getSiteForPublicShare(
  siteId: string
): Promise<Site | null> {
  if (!isPostgresConfigured()) return null;
  return getProjectForPublicShare(siteId);
}

/** Share realtime demo preview — any valid project id (?demo=1). */
export async function getSiteForShareDemo(
  siteId: string
): Promise<Site | null> {
  if (!isPostgresConfigured()) return null;
  return getProjectById(siteId);
}
