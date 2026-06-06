import { REALTIME_WINDOW_MS } from "@/lib/constants";
import { fetchEventsForSite } from "@/lib/db/events";
import type { AnalyticsEvent, Site } from "@/lib/types";

export async function fetchRecentRealtimeEvents(
  site: Site
): Promise<AnalyticsEvent[]> {
  const since = new Date(Date.now() - REALTIME_WINDOW_MS).toISOString();
  return fetchEventsForSite(site.site_key, { since, limit: 500 });
}
