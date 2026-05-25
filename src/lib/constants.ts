/** Hosted tracker + geo API (Add website setup & embed snippets). */
export const DEFAULT_TRACKER_SCRIPT_URL =
  "https://analytics.gitopen.dev/tracker.js";
export const DEFAULT_GEO_API_URL = "https://analytics.gitopen.dev/api/geo";

/** Live realtime demo on the marketing homepage (public share link). */
export const DEMO_SHARE_REALTIME_URL =
  "https://analytics.gitopen.dev/share/35db12b6-8921-4419-8bad-1c6518449ab4/realtime?theme=light&map=globe";

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
