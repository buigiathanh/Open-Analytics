import { EVENT_TYPE, BROWSER_LABEL, DEVICE_LABEL, PLATFORM_LABEL } from "./constants";
import {
  browserIconUrl,
  channelIconUrl,
  countryFlagUrl,
  deviceIconUrl,
  ICON_GLOBE,
  platformIconUrl,
  referrerFaviconUrl,
} from "./breakdown-icons";
import { classifyChannel } from "./channels";
import { countryName, referrerHost } from "./countries";
import { computeStats, getLiveVisitors, getVisitPageviews } from "./stats";
import { visitorAvatarUrl, visitorDisplayName } from "./visitor-identity";
import type { AnalyticsEvent, LiveVisitor, SiteStats } from "./types";

export interface MetricWithTrend {
  value: number | string;
  changePct: number | null;
  label: string;
  dot?: string;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  visitors: number;
  pageviews: number;
  /** Google Search clicks (when Search Console is connected). */
  gscClicks?: number;
}

export interface BreakdownRow {
  key: string;
  label: string;
  count: number;
  pct: number;
  icon?: string;
  iconUrl?: string;
}

export interface DashboardAnalytics {
  stats: SiteStats;
  metrics: MetricWithTrend[];
  series: TimeSeriesPoint[];
  channels: BreakdownRow[];
  referrers: BreakdownRow[];
  countries: BreakdownRow[];
  pages: BreakdownRow[];
  entryPages: BreakdownRow[];
  exitPages: BreakdownRow[];
  browsers: BreakdownRow[];
  devices: BreakdownRow[];
  platforms: BreakdownRow[];
  languages: BreakdownRow[];
  screens: BreakdownRow[];
  utmSources: BreakdownRow[];
  utmCampaigns: BreakdownRow[];
  customEvents: BreakdownRow[];
  customEventSeries: CustomEventSeriesPoint[];
  customEventRecent: CustomEventRecentItem[];
  customEventTotal: number;
  liveCount: number;
  periodDays: number;
}

export interface CustomEventSeriesPoint {
  date: string;
  label: string;
  count: number;
}

export interface CustomEventRecentItem {
  id: number;
  event_name: string;
  path: string | null;
  source: string | null;
  created_at: string;
}

export interface LiveFeedItem extends LiveVisitor {
  browser: number | null;
  source: string | null;
  referrer: string | null;
  displayName: string;
  avatar: string;
}

const DAY_MS = 86400000;

function pageviews(events: AnalyticsEvent[]) {
  return events.filter((e) => e.event_type === EVENT_TYPE.PAGEVIEW);
}

function customEvents(events: AnalyticsEvent[]) {
  return events.filter((e) => e.event_type === EVENT_TYPE.CUSTOM);
}

function uniqueVisitors(pv: AnalyticsEvent[]) {
  return new Set(pv.map((e) => e.visitor_id)).size;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function splitPeriods(events: AnalyticsEvent[], days: number) {
  const now = Date.now();
  const curStart = now - days * DAY_MS;
  const prevStart = now - days * 2 * DAY_MS;
  const current = events.filter((e) => {
    const t = new Date(e.created_at).getTime();
    return t >= curStart;
  });
  const previous = events.filter((e) => {
    const t = new Date(e.created_at).getTime();
    return t >= prevStart && t < curStart;
  });
  return { current, previous };
}

export function buildTimeSeries(
  events: AnalyticsEvent[],
  days = 7
): TimeSeriesPoint[] {
  const pv = pageviews(events);
  const buckets: TimeSeriesPoint[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayEvents = pv.filter((e) => {
      const t = new Date(e.created_at);
      return t >= d && t < next;
    });
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    buckets.push({
      date: d.toISOString().slice(0, 10),
      label: `${mm}-${dd}`,
      visitors: uniqueVisitors(dayEvents),
      pageviews: dayEvents.length,
    });
  }
  return buckets;
}

export function formatShortDayLabel(dateIso: string): string {
  const d = new Date(`${dateIso}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function buildProjectCardTrend(events: AnalyticsEvent[], days = 7) {
  const series = buildTimeSeries(events, days);
  const visitorTotal = series.reduce((sum, point) => sum + point.visitors, 0);

  return {
    series: series.map((point) => ({
      label: formatShortDayLabel(point.date),
      value: point.visitors,
    })),
    visitorTotal,
    hasTracking: events.length > 0,
  };
}

function aggregateCounts(
  items: { key: string; label: string; icon?: string; iconUrl?: string }[],
  total: number
): BreakdownRow[] {
  const map = new Map<
    string,
    { label: string; count: number; icon?: string; iconUrl?: string }
  >();
  for (const item of items) {
    const prev = map.get(item.key);
    if (prev) {
      prev.count += 1;
      if (!prev.iconUrl && item.iconUrl) prev.iconUrl = item.iconUrl;
    } else {
      map.set(item.key, {
        label: item.label,
        count: 1,
        icon: item.icon,
        iconUrl: item.iconUrl,
      });
    }
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({
      key,
      label: v.label,
      count: v.count,
      pct: total > 0 ? Math.round((v.count / total) * 1000) / 10 : 0,
      icon: v.icon,
      iconUrl: v.iconUrl,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

function pagePathLabel(e: AnalyticsEvent): string {
  const path = e.path?.trim() || "/";
  return path.length > 80 ? path.slice(0, 77) + "…" : path;
}

export function buildChannelBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  const pv = pageviews(events);
  const byVisitor = new Map<string, { label: string; iconUrl: string }>();
  for (const e of pv) {
    if (!byVisitor.has(e.visitor_id)) {
      byVisitor.set(e.visitor_id, {
        label: classifyChannel({
          utm_source: e.utm_source,
          utm_medium: e.utm_medium,
          utm_campaign: e.utm_campaign,
          referrer: e.referrer,
          source: e.source,
          gclid: e.gclid,
          fbclid: e.fbclid,
          msclkid: e.msclkid,
        }),
        iconUrl: channelIconUrl(e.referrer),
      });
    }
  }
  const items = Array.from(byVisitor.values()).map(({ label, iconUrl }) => ({
    key: label,
    label,
    iconUrl,
  }));
  return aggregateCounts(items, items.length);
}

export function buildReferrerBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  const pv = pageviews(events);
  const byVisitor = new Map<string, { label: string; iconUrl: string }>();
  for (const e of pv) {
    if (!byVisitor.has(e.visitor_id)) {
      const host = referrerHost(e.referrer);
      const label = host === "Direct" ? "Direct / None" : host;
      byVisitor.set(e.visitor_id, {
        label,
        iconUrl:
          host === "Direct" ? ICON_GLOBE : referrerFaviconUrl(host),
      });
    }
  }
  const items = Array.from(byVisitor.values()).map(({ label, iconUrl }) => ({
    key: label,
    label,
    iconUrl,
  }));
  return aggregateCounts(items, items.length);
}

export function buildCountryBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  const pv = pageviews(events);
  const byVisitor = new Map<string, string>();
  for (const e of pv) {
    if (!byVisitor.has(e.visitor_id)) {
      const code = (e.country_code || "??").toUpperCase();
      byVisitor.set(e.visitor_id, code);
    }
  }
  const items = Array.from(byVisitor.values()).map((code) => ({
    key: code,
    label: countryName(code === "??" ? null : code),
    iconUrl: countryFlagUrl(code === "??" ? null : code),
  }));
  return aggregateCounts(items, items.length);
}

export function buildPageBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  const pv = pageviews(events);
  const items = pv.map((e) => {
    const label = pagePathLabel(e);
    return { key: label, label };
  });
  return aggregateCounts(items, pv.length);
}

export function buildEntryExitBreakdown(
  events: AnalyticsEvent[],
  kind: "entry" | "exit"
): BreakdownRow[] {
  const visits = getVisitPageviews(events);
  const items: { key: string; label: string }[] = [];
  for (const vk of Object.keys(visits)) {
    const list = visits[vk];
    if (list.length === 0) continue;
    const e = kind === "entry" ? list[0] : list[list.length - 1];
    const label = pagePathLabel(e);
    items.push({ key: label, label });
  }
  return aggregateCounts(items, items.length);
}

function enumBreakdown(
  events: AnalyticsEvent[],
  pick: (e: AnalyticsEvent) => number | null,
  labels: Record<number, string>,
  iconFor: (code: number, label: string) => string
): BreakdownRow[] {
  const pv = pageviews(events);
  const byVisitor = new Map<string, number>();
  for (const e of pv) {
    if (!byVisitor.has(e.visitor_id)) {
      byVisitor.set(e.visitor_id, pick(e) ?? 0);
    }
  }
  const items = Array.from(byVisitor.values()).map((code) => {
    const label = labels[code] ?? "Unknown";
    return {
      key: String(code),
      label,
      iconUrl: iconFor(code, label),
    };
  });
  return aggregateCounts(items, items.length);
}

export function buildBrowserBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  return enumBreakdown(
    events,
    (e) => e.browser,
    BROWSER_LABEL,
    (code, label) => browserIconUrl(code, label)
  );
}

export function buildDeviceBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  return enumBreakdown(
    events,
    (e) => e.device,
    DEVICE_LABEL,
    (code) => deviceIconUrl(code)
  );
}

export function buildPlatformBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  return enumBreakdown(
    events,
    (e) => e.platform,
    PLATFORM_LABEL,
    (code) => platformIconUrl(code)
  );
}

function buildVisitorStringBreakdown(
  events: AnalyticsEvent[],
  pick: (e: AnalyticsEvent) => string | null
): BreakdownRow[] {
  const pv = pageviews(events);
  const byVisitor = new Map<string, string>();
  for (const e of pv) {
    if (!byVisitor.has(e.visitor_id)) {
      const raw = pick(e)?.trim();
      byVisitor.set(e.visitor_id, raw || "Unknown");
    }
  }
  const items = Array.from(byVisitor.values()).map((label) => ({
    key: label,
    label,
  }));
  return aggregateCounts(items, items.length);
}

export function buildLanguageBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  return buildVisitorStringBreakdown(events, (e) => e.language);
}

export function buildScreenBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  return buildVisitorStringBreakdown(events, (e) => e.screen);
}

export function buildUtmSourceBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  const pv = pageviews(events).filter((e) => e.utm_source?.trim());
  const items = pv.map((e) => {
    const label = e.utm_source!.trim();
    return { key: label, label };
  });
  return aggregateCounts(items, items.length);
}

export function buildUtmCampaignBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  const pv = pageviews(events).filter((e) => e.utm_campaign?.trim());
  const items = pv.map((e) => {
    const label = e.utm_campaign!.trim();
    return { key: label, label };
  });
  return aggregateCounts(items, items.length);
}

export function buildCustomEventBreakdown(events: AnalyticsEvent[]): BreakdownRow[] {
  const items = customEvents(events).map((e) => {
    const label = e.event_name?.trim() || "(unnamed)";
    return { key: label, label };
  });
  return aggregateCounts(items, items.length);
}

export function buildCustomEventTimeSeries(
  events: AnalyticsEvent[],
  days = 7
): CustomEventSeriesPoint[] {
  const ce = customEvents(events);
  const buckets: CustomEventSeriesPoint[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = ce.filter((e) => {
      const t = new Date(e.created_at);
      return t >= d && t < next;
    }).length;
    buckets.push({
      date: d.toISOString().slice(0, 10),
      label: formatShortDayLabel(d.toISOString().slice(0, 10)),
      count,
    });
  }
  return buckets;
}

export function buildCustomEventRecent(
  events: AnalyticsEvent[],
  limit = 25
): CustomEventRecentItem[] {
  return customEvents(events)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit)
    .map((e) => ({
      id: e.id,
      event_name: e.event_name?.trim() || "(unnamed)",
      path: e.path,
      source: e.source,
      created_at: e.created_at,
    }));
}

export function buildDashboardAnalytics(
  events: AnalyticsEvent[],
  liveWindowMs: number,
  periodDays = 7
): DashboardAnalytics {
  const days = periodDays === 30 ? 30 : 7;
  const { current, previous } = splitPeriods(events, days);
  const curStats = computeStats(current);
  const prevStats = computeStats(previous);
  const live = getLiveVisitors(events, liveWindowMs);

  const formatSession = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r > 0 ? `${m}m ${r}s` : `${m}m`;
  };

  const periodEvents = events.filter((e) => {
    const t = new Date(e.created_at).getTime();
    return t >= Date.now() - days * DAY_MS;
  });

  return {
    stats: curStats,
    periodDays: days,
    metrics: [
      {
        label: "Visitors",
        value: curStats.visitors,
        changePct: pctChange(curStats.visitors, prevStats.visitors),
        dot: "bg-zinc-900",
      },
      {
        label: "Visits",
        value: curStats.visits,
        changePct: pctChange(curStats.visits, prevStats.visits),
        dot: "bg-zinc-600",
      },
      {
        label: "Pageviews",
        value: curStats.pageviews,
        changePct: pctChange(curStats.pageviews, prevStats.pageviews),
        dot: "bg-zinc-400",
      },
      {
        label: "Bounce rate",
        value: `${curStats.bounceRate}%`,
        changePct: pctChange(curStats.bounceRate, prevStats.bounceRate),
        dot: "bg-amber-500",
      },
      {
        label: "Visit time",
        value: formatSession(curStats.avgSessionSeconds),
        changePct: pctChange(
          curStats.avgSessionSeconds,
          prevStats.avgSessionSeconds
        ),
        dot: "bg-emerald-500",
      },
    ],
    series: buildTimeSeries(periodEvents, days),
    channels: buildChannelBreakdown(current),
    referrers: buildReferrerBreakdown(current),
    countries: buildCountryBreakdown(current),
    pages: buildPageBreakdown(current),
    entryPages: buildEntryExitBreakdown(current, "entry"),
    exitPages: buildEntryExitBreakdown(current, "exit"),
    browsers: buildBrowserBreakdown(current),
    devices: buildDeviceBreakdown(current),
    platforms: buildPlatformBreakdown(current),
    languages: buildLanguageBreakdown(current),
    screens: buildScreenBreakdown(current),
    utmSources: buildUtmSourceBreakdown(current),
    utmCampaigns: buildUtmCampaignBreakdown(current),
    customEvents: buildCustomEventBreakdown(current),
    customEventSeries: buildCustomEventTimeSeries(periodEvents, days),
    customEventRecent: buildCustomEventRecent(current),
    customEventTotal: customEvents(current).length,
    liveCount: live.length,
  };
}

export function buildMinuteSeries(
  events: AnalyticsEvent[],
  minutes = 30
): { label: string; pageviews: number }[] {
  const pv = pageviews(events);
  const now = Date.now();
  const buckets: { label: string; pageviews: number }[] = [];
  for (let i = minutes - 1; i >= 0; i--) {
    const end = now - i * 60000;
    const start = end - 60000;
    const count = pv.filter((e) => {
      const t = new Date(e.created_at).getTime();
      return t >= start && t < end;
    }).length;
    const d = new Date(end);
    buckets.push({
      label: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      pageviews: count,
    });
  }
  return buckets;
}

export function getLiveFeed(
  events: AnalyticsEvent[],
  windowMs: number
): LiveFeedItem[] {
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
  return Array.from(byVisitor.values())
    .map((e) => ({
      visitor_id: e.visitor_id,
      session_id: e.session_id,
      visit_id: e.visit_id,
      path: e.path,
      country_code: e.country_code,
      latitude: e.latitude,
      longitude: e.longitude,
      device: e.device,
      last_seen: e.created_at,
      browser: e.browser,
      source: e.source,
      referrer: e.referrer,
      displayName: visitorDisplayName(e.visitor_id),
      avatar: visitorAvatarUrl(e.visitor_id),
    }))
    .sort(
      (a, b) =>
        new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
    );
}

export function liveBreakdownBy(
  feed: LiveFeedItem[],
  pick: (e: LiveFeedItem) => {
    key: string;
    label: string;
    icon?: string;
    iconUrl?: string;
  }
): BreakdownRow[] {
  const items = feed.map(pick);
  return aggregateCounts(items, items.length).slice(0, 6);
}
