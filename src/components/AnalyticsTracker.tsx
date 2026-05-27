"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { DEFAULT_TRACKER_SCRIPT_URL } from "@/lib/constants";

/** Self-tracking for the marketing site (hardcoded). */
const SITE_TRACKER = {
  siteKey: "1b7033b1c695f1278e855e09",
  scriptUrl: DEFAULT_TRACKER_SCRIPT_URL,
  endpoint: "https://open-analytics.dungbuon95.workers.dev/",
} as const;

/** Path prefixes where the marketing-site tracker must not run (dashboard). */
const TRACKER_EXCLUDE_PATHS = ["/app", "/share"];

function isTrackerExcludedPath(pathname: string): boolean {
  return TRACKER_EXCLUDE_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  if (isTrackerExcludedPath(pathname)) return null;

  return (
    <Script
      id="open-analytics-tracker"
      strategy="afterInteractive"
      src={SITE_TRACKER.scriptUrl}
      data-site-key={SITE_TRACKER.siteKey}
      data-endpoint={SITE_TRACKER.endpoint}
    />
  );
}
