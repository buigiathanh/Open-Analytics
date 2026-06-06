import { query, queryOne } from "@/lib/db/pool";
import type { AnalyticsEvent } from "@/lib/types";

function rowToEvent(row: Record<string, unknown>): AnalyticsEvent {
  return {
    id: Number(row.id),
    site_key: String(row.site_key),
    visitor_id: String(row.visitor_id),
    session_id: String(row.session_id),
    visit_id: row.visit_id != null ? String(row.visit_id) : null,
    event_type: Number(row.event_type),
    path: row.path != null ? String(row.path) : null,
    page_title: row.page_title != null ? String(row.page_title) : null,
    hostname: row.hostname != null ? String(row.hostname) : null,
    url_query: row.url_query != null ? String(row.url_query) : null,
    referrer: row.referrer != null ? String(row.referrer) : null,
    source: row.source != null ? String(row.source) : null,
    device: row.device != null ? Number(row.device) : null,
    platform: row.platform != null ? Number(row.platform) : null,
    browser: row.browser != null ? Number(row.browser) : null,
    country_code: row.country_code != null ? String(row.country_code) : null,
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    duration_ms: row.duration_ms != null ? Number(row.duration_ms) : null,
    language: row.language != null ? String(row.language) : null,
    screen: row.screen != null ? String(row.screen) : null,
    distinct_id: row.distinct_id != null ? String(row.distinct_id) : null,
    utm_source: row.utm_source != null ? String(row.utm_source) : null,
    utm_medium: row.utm_medium != null ? String(row.utm_medium) : null,
    utm_campaign: row.utm_campaign != null ? String(row.utm_campaign) : null,
    utm_content: row.utm_content != null ? String(row.utm_content) : null,
    utm_term: row.utm_term != null ? String(row.utm_term) : null,
    gclid: row.gclid != null ? String(row.gclid) : null,
    fbclid: row.fbclid != null ? String(row.fbclid) : null,
    msclkid: row.msclkid != null ? String(row.msclkid) : null,
    event_name: row.event_name != null ? String(row.event_name) : null,
    created_at: new Date(String(row.created_at)).toISOString(),
  };
}

export type EventInsertPayload = Omit<AnalyticsEvent, "id" | "created_at">;

export async function insertEvent(
  payload: EventInsertPayload
): Promise<AnalyticsEvent> {
  const row = await queryOne(
    `insert into events (
      site_key, visitor_id, session_id, visit_id, event_type,
      path, page_title, hostname, url_query, referrer, source,
      device, platform, browser, country_code, latitude, longitude,
      duration_ms, language, screen, distinct_id,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      gclid, fbclid, msclkid, event_name
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
      $18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30
    ) returning *`,
    [
      payload.site_key,
      payload.visitor_id,
      payload.session_id,
      payload.visit_id,
      payload.event_type,
      payload.path,
      payload.page_title,
      payload.hostname,
      payload.url_query,
      payload.referrer,
      payload.source,
      payload.device,
      payload.platform,
      payload.browser,
      payload.country_code,
      payload.latitude,
      payload.longitude,
      payload.duration_ms,
      payload.language,
      payload.screen,
      payload.distinct_id,
      payload.utm_source,
      payload.utm_medium,
      payload.utm_campaign,
      payload.utm_content,
      payload.utm_term,
      payload.gclid,
      payload.fbclid,
      payload.msclkid,
      payload.event_name,
    ]
  );
  if (!row) throw new Error("Failed to insert event");
  return rowToEvent(row);
}

export async function fetchEventsForSite(
  siteKey: string,
  opts: { since?: string; limit?: number } = {}
): Promise<AnalyticsEvent[]> {
  const limit = Math.min(opts.limit ?? 5000, 5000);
  const params: unknown[] = [siteKey];
  let sql = `select * from events where site_key = $1`;

  if (opts.since) {
    params.push(opts.since);
    sql += ` and created_at >= $${params.length}`;
  }

  params.push(limit);
  sql += ` order by created_at desc limit $${params.length}`;

  const rows = await query(sql, params);
  return rows.map(rowToEvent);
}

export async function hasEventsForSite(siteKey: string): Promise<boolean> {
  const row = await queryOne(
    `select exists(select 1 from events where site_key = $1 limit 1) as has_events`,
    [siteKey]
  );
  return row?.has_events === true;
}
