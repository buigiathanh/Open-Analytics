import {
  DEFAULT_GEO_API_URL,
  DEFAULT_TRACKER_SCRIPT_URL,
} from "@/lib/constants";

export function buildTrackerSnippet(opts: {
  siteKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  trackerScriptUrl?: string;
  geoApiUrl?: string;
}): string {
  const trackerUrl = opts.trackerScriptUrl ?? DEFAULT_TRACKER_SCRIPT_URL;
  const geoUrl = opts.geoApiUrl ?? DEFAULT_GEO_API_URL;

  return `<!-- Open Analytics -->
<script
  src="${trackerUrl}"
  data-site-key="${opts.siteKey}"
  data-supabase-url="${opts.supabaseUrl}"
  data-supabase-key="${opts.supabaseAnonKey}"
  data-geo-url="${geoUrl}"
></script>`;
}
