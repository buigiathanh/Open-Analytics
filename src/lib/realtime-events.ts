import { REALTIME_WINDOW_MS } from "@/lib/constants";
import { getSupabaseForSite } from "@/lib/supabase-project";
import type { AnalyticsEvent, Site } from "@/lib/types";

export async function fetchRecentRealtimeEvents(
  site: Site
): Promise<AnalyticsEvent[]> {
  const eventsDb = getSupabaseForSite(site);
  if (!eventsDb) return [];

  const since = new Date(Date.now() - REALTIME_WINDOW_MS).toISOString();
  const { data } = await eventsDb
    .from("events")
    .select("*")
    .eq("site_key", site.site_key)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);

  return (data as AnalyticsEvent[]) ?? [];
}
