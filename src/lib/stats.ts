import { EVENT_TYPE, SESSION_TIMEOUT_MS } from "./constants";
import type { AnalyticsEvent, LiveVisitor, SiteStats } from "./types";

/** Unique visit key; legacy rows without visit_id use session_id. */
export function visitKey(e: AnalyticsEvent): string {
  return e.visit_id || e.session_id;
}

export function computeStats(events: AnalyticsEvent[]): SiteStats {
  const pageviews = events.filter((e) => e.event_type === EVENT_TYPE.PAGEVIEW);
  const visitors = new Set(pageviews.map((e) => e.visitor_id)).size;

  const visits = groupByVisit(pageviews);
  const visitKeys = Object.keys(visits);
  const bounced = visitKeys.filter((vk) => visits[vk].length === 1).length;
  const bounceRate =
    visitKeys.length > 0
      ? Math.round((bounced / visitKeys.length) * 100)
      : 0;

  const multiPageVisits = visitKeys.filter((vk) => visits[vk].length >= 2);
  const durations = multiPageVisits.map((vk) => visitDurationMs(visits[vk]));
  const avgMs =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

  return {
    visitors,
    visits: visitKeys.length,
    pageviews: pageviews.length,
    bounceRate,
    avgSessionSeconds: Math.round(avgMs / 1000),
  };
}

function groupByVisit(
  pageviews: AnalyticsEvent[]
): Record<string, AnalyticsEvent[]> {
  const map: Record<string, AnalyticsEvent[]> = {};
  for (const e of pageviews) {
    const vk = visitKey(e);
    if (!map[vk]) map[vk] = [];
    map[vk].push(e);
  }
  for (const vk of Object.keys(map)) {
    map[vk].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }
  return map;
}

function visitDurationMs(visitPageviews: AnalyticsEvent[]): number {
  if (visitPageviews.length < 2) return 0;
  const first = new Date(visitPageviews[0].created_at).getTime();
  const last = new Date(
    visitPageviews[visitPageviews.length - 1].created_at
  ).getTime();
  return Math.min(last - first, SESSION_TIMEOUT_MS);
}

export function getVisitPageviews(
  events: AnalyticsEvent[]
): Record<string, AnalyticsEvent[]> {
  return groupByVisit(
    events.filter((e) => e.event_type === EVENT_TYPE.PAGEVIEW)
  );
}

export function getLiveVisitors(
  events: AnalyticsEvent[],
  windowMs: number
): LiveVisitor[] {
  const cutoff = Date.now() - windowMs;
  const recent = events.filter(
    (e) => new Date(e.created_at).getTime() >= cutoff
  );
  const byVisitor = new Map<string, AnalyticsEvent>();
  for (const e of recent) {
    const prev = byVisitor.get(e.visitor_id);
    if (
      !prev ||
      new Date(e.created_at).getTime() > new Date(prev.created_at).getTime()
    ) {
      byVisitor.set(e.visitor_id, e);
    }
  }
  return Array.from(byVisitor.values()).map((e) => ({
    visitor_id: e.visitor_id,
    session_id: e.session_id,
    visit_id: e.visit_id,
    path: e.path,
    country_code: e.country_code,
    latitude: e.latitude,
    longitude: e.longitude,
    device: e.device,
    last_seen: e.created_at,
  }));
}
