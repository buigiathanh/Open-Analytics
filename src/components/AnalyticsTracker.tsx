"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  DEFAULT_TRACKER_SCRIPT_URL,
} from "@/lib/constants";

/** Self-tracking for the marketing site (hardcoded). */
const SITE_TRACKER = {
  siteKey: "1b7033b1c695f1278e855e09",
  supabaseUrl: "https://ikmhedkpkmlvwzvpallv.supabase.co",
  supabaseKey: "sb_publishable_bb14p_yxKsod25f6qHLDMQ_x9XguqDD",
  scriptUrl: DEFAULT_TRACKER_SCRIPT_URL,
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
      data-supabase-url={SITE_TRACKER.supabaseUrl}
      data-supabase-key={SITE_TRACKER.supabaseKey}
    />
  );
}
