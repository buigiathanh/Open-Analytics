/** Hosted tracker script URL (Add website setup & embed snippets). */
export const TRACKER_SCRIPT_VERSION = "1.0.7";

const TRACKER_SCRIPT_BASE_URL = "https://analytics.gitopen.dev/tracker.js";

/** Append ?v=… for cache busting when you redeploy tracker.js. */
export function withTrackerVersion(url: string): string {
  if (/[?&]v=/.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${TRACKER_SCRIPT_VERSION}`;
}

export const DEFAULT_TRACKER_SCRIPT_URL = withTrackerVersion(TRACKER_SCRIPT_BASE_URL);

/** Event ingest API URL for tracker embed (data-endpoint). */
export const DEFAULT_TRACKER_ENDPOINT =
  process.env.NEXT_PUBLIC_TRACKER_ENDPOINT?.replace(/\/$/, "") ||
  `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3001"}/api/events`;

/** Bot visit ingest API URL (middleware / server-side tracking). */
export const DEFAULT_BOT_TRACKER_ENDPOINT =
  process.env.NEXT_PUBLIC_BOT_TRACKER_ENDPOINT?.replace(/\/$/, "") ||
  `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3001"}/api/bot-visits`;

/** Header sent with bot visit ingest requests (value = project api_key). */
export const SITE_API_KEY_HEADER = "x-api-key";

const BOT_MIDDLEWARE_HELPER_BASE =
  process.env.NEXT_PUBLIC_BOT_MIDDLEWARE_HELPER_URL?.replace(/\/$/, "") ||
  `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3001"}/bot-middleware.mjs`;

/** Edge-importable helper for Next.js middleware snippets. */
export const DEFAULT_BOT_MIDDLEWARE_HELPER_URL = BOT_MIDDLEWARE_HELPER_BASE;

/** Live realtime demo on the marketing homepage (public share link). */
export const DEMO_SHARE_REALTIME_URL =
  "https://analytics.gitopen.dev/share/35db12b6-8921-4419-8bad-1c6518449ab4/realtime?demo=1&theme=light&map=2d";

/** Numeric enums — must match public/tracker.js */

export const EVENT_TYPE = {
  PAGEVIEW: 1,
  PAGE_LEAVE: 2,
  CUSTOM: 10,
} as const;

export const DEVICE = {
  UNKNOWN: 0,
  DESKTOP: 1,
  MOBILE: 2,
  TABLET: 3,
  TV: 4,
} as const;

export const DEVICE_LABEL: Record<number, string> = {
  0: "Unknown",
  1: "Desktop",
  2: "Mobile",
  3: "Tablet",
  4: "TV",
};

export const PLATFORM = {
  UNKNOWN: 0,
  WINDOWS: 1,
  MAC: 2,
  LINUX: 3,
  IOS: 4,
  ANDROID: 5,
  CHROMEOS: 6,
} as const;

export const PLATFORM_LABEL: Record<number, string> = {
  0: "Unknown",
  1: "Windows",
  2: "macOS",
  3: "Linux",
  4: "iOS",
  5: "Android",
  6: "Chrome OS",
};

export const BROWSER = {
  UNKNOWN: 0,
  CHROME: 1,
  FIREFOX: 2,
  SAFARI: 3,
  EDGE: 4,
  OPERA: 5,
  SAMSUNG: 6,
} as const;

export const BROWSER_LABEL: Record<number, string> = {
  0: "Unknown",
  1: "Chrome",
  2: "Firefox",
  3: "Safari",
  4: "Edge",
  5: "Opera",
  6: "Samsung Internet",
};

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
export const ONLINE_WINDOW_MS = 2 * 60 * 1000;
/** Realtime page: live visitors + chart window */
export const REALTIME_WINDOW_MS = 5 * 60 * 1000;
export const REALTIME_CHART_MINUTES = 5;
