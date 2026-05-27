import {
  DEFAULT_TRACKER_ENDPOINT,
  DEFAULT_TRACKER_SCRIPT_URL,
  withTrackerVersion,
} from "@/lib/constants";

export function buildTrackerSnippet(opts: {
  siteKey: string;
  endpoint?: string;
  trackerScriptUrl?: string;
}): string {
  const trackerUrl = withTrackerVersion(
    opts.trackerScriptUrl ?? DEFAULT_TRACKER_SCRIPT_URL
  );
  const endpoint = opts.endpoint ?? DEFAULT_TRACKER_ENDPOINT;

  return `<!-- Open Analytics -->
<script
  src="${trackerUrl}"
  data-site-key="${opts.siteKey}"
  data-endpoint="${endpoint}"
></script>`;
}
