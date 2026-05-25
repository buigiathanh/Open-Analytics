export interface Site {
  id: string;
  name: string;
  domain: string;
  site_key: string;
  user_id: string | null;
  supabase_project_id: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
  share_realtime_enabled: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: number;
  site_key: string;
  visitor_id: string;
  session_id: string;
  visit_id: string | null;
  event_type: number;
  path: string | null;
  page_title: string | null;
  hostname: string | null;
  url_query: string | null;
  referrer: string | null;
  source: string | null;
  device: number | null;
  platform: number | null;
  browser: number | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  duration_ms: number | null;
  language: string | null;
  screen: string | null;
  distinct_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  event_name: string | null;
  created_at: string;
}

export interface SiteStats {
  visitors: number;
  visits: number;
  pageviews: number;
  bounceRate: number;
  avgSessionSeconds: number;
}

export interface LiveVisitor {
  visitor_id: string;
  session_id: string;
  visit_id: string | null;
  path: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  device: number | null;
  last_seen: string;
}
