"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useRealtimeSocket } from "@/hooks/useRealtimeSocket";
import { REALTIME_WINDOW_MS } from "@/lib/constants";
import { getLiveFeed } from "@/lib/analytics";
import { liveFeedToGlobeVisitors } from "@/lib/live-to-globe";
import { prependAnalyticsEvent } from "@/lib/realtime-events-merge";
import {
  buildRealtimeShareUrl,
  parseRealtimeMapMode,
  parseRealtimeTheme,
  realtimeThemeFromResolved,
  realtimeUrlMatches,
  type RealtimeMapMode,
} from "@/lib/realtime-url";
import { RealtimeFeedSidebar } from "./RealtimeFeedSidebar";
import { RealtimeOverlay } from "./RealtimeOverlay";
import type { AnalyticsEvent, Site } from "@/lib/types";

const VisitorGlobe = dynamic(
  () =>
    import("@/components/dashboard/VisitorGlobe").then((m) => m.VisitorGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-zinc-100 dark:bg-[#121c2e]" />
    ),
  }
);

const RealtimeVisitorMap = dynamic(
  () =>
    import("@/components/dashboard/RealtimeVisitorMap").then(
      (m) => m.RealtimeVisitorMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-zinc-100 dark:bg-[#121c2e]" />
    ),
  }
);

interface RealtimeViewProps {
  site: Site;
  initialEvents: AnalyticsEvent[];
  /** Owner dashboard (signed in) vs public /share link. */
  mode?: "owner" | "public";
  shareRealtimeEnabled?: boolean;
}

function RealtimeViewInner({
  site,
  initialEvents,
  mode = "owner",
  shareRealtimeEnabled = false,
}: RealtimeViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setTheme, resolvedTheme } = useTheme();

  const [events, setEvents] = useState(initialEvents);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(
    null
  );
  const [isRotating, setIsRotating] = useState(true);
  const [mapViewMode, setMapViewMode] = useState<RealtimeMapMode>(() =>
    parseRealtimeMapMode(searchParams.get("map"))
  );
  const [prefsReady, setPrefsReady] = useState(false);
  const isSimpleView = searchParams.get("view") === "simple";

  useEffect(() => {
    const urlTheme = parseRealtimeTheme(searchParams.get("theme"));
    setMapViewMode(parseRealtimeMapMode(searchParams.get("map")));
    if (urlTheme) {
      setTheme(urlTheme);
    } else {
      setPrefsReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply URL prefs once on mount
  }, []);

  useEffect(() => {
    if (!resolvedTheme) return;
    const urlTheme = parseRealtimeTheme(searchParams.get("theme"));
    if (
      urlTheme &&
      realtimeThemeFromResolved(resolvedTheme) !== urlTheme
    ) {
      return;
    }
    setPrefsReady(true);
  }, [resolvedTheme, searchParams]);

  const themeMode = realtimeThemeFromResolved(resolvedTheme);

  useEffect(() => {
    if (!prefsReady || !resolvedTheme) return;
    const next = { theme: themeMode, map: mapViewMode };
    if (realtimeUrlMatches(searchParams, next)) return;
    const q = new URLSearchParams();
    q.set("theme", next.theme);
    q.set("map", next.map);
    if (isSimpleView) {
      q.set("view", "simple");
    }
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  }, [
    prefsReady,
    themeMode,
    mapViewMode,
    isSimpleView,
    pathname,
    router,
    resolvedTheme,
    searchParams,
  ]);

  const { shareUrl, embedCode } = useMemo(() => {
    const base =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
          window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "";
    const url = base
      ? buildRealtimeShareUrl(base, site.id, {
          theme: themeMode,
          map: mapViewMode,
        })
      : "";
    const embed = url
      ? `<iframe src="${url}" width="100%" height="600" style="border:0;border-radius:12px" allowfullscreen loading="lazy" title="Open Analytics Realtime"></iframe>`
      : "";
    return { shareUrl: url, embedCode: embed };
  }, [site.id, themeMode, mapViewMode]);

  const onRealtimeEvent = useCallback((event: AnalyticsEvent) => {
    setEvents((prev) => prependAnalyticsEvent(prev, event));
  }, []);

  useRealtimeSocket(site.id, onRealtimeEvent);

  const feed = useMemo(
    () => getLiveFeed(events, REALTIME_WINDOW_MS),
    [events]
  );

  const globeVisitors = useMemo(
    () => liveFeedToGlobeVisitors(feed),
    [feed]
  );

  const isGlobe = mapViewMode === "globe";

  return (
    <div className="flex h-full w-full overflow-hidden">
      {!isSimpleView && (
        <RealtimeFeedSidebar
          feed={feed}
          selectedVisitorId={selectedVisitorId}
          onSelectVisitor={setSelectedVisitorId}
        />
      )}

      <div
        className={
          isGlobe
            ? "relative flex min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-sky-50 via-zinc-50 to-zinc-100 dark:from-[#0d1424] dark:via-[#121c2e] dark:to-[#0f172a]"
            : "relative flex min-w-0 flex-1 flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950"
        }
      >
        {isGlobe && (
          <div
            className="pointer-events-none absolute inset-0 hidden opacity-40 dark:block"
            style={{
              backgroundImage: `radial-gradient(1px 1px at 20px 30px, #fff, transparent),
            radial-gradient(1px 1px at 80px 120px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 160px 80px, rgba(255,255,255,0.4), transparent)`,
              backgroundSize: "200px 200px",
            }}
            aria-hidden
          />
        )}

        <RealtimeOverlay
          site={site}
          mode={mode}
          shareRealtimeEnabled={shareRealtimeEnabled}
          liveCount={feed.length}
          mapViewMode={mapViewMode}
          onMapViewModeChange={setMapViewMode}
          isRotating={isRotating}
          onToggleRotating={() => {
            setIsRotating((r) => {
              const next = !r;
              if (next) setSelectedVisitorId(null);
              return next;
            });
          }}
          shareUrl={shareUrl}
          embedCode={embedCode}
        />

        <div className="relative min-h-0 flex-1">
          {isGlobe ? (
            <VisitorGlobe
              visitors={globeVisitors}
              variant="immersive"
              selectedVisitorId={selectedVisitorId}
              onSelectedVisitorChange={setSelectedVisitorId}
              isRotating={isRotating}
              onRotatingChange={setIsRotating}
              hidePlaybackControl
            />
          ) : (
            <RealtimeVisitorMap
              visitors={globeVisitors}
              selectedVisitorId={selectedVisitorId}
              onSelectedVisitorChange={setSelectedVisitorId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function RealtimeView(props: RealtimeViewProps) {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full animate-pulse bg-zinc-100 dark:bg-[#121c2e]" />
      }
    >
      <RealtimeViewInner {...props} />
    </Suspense>
  );
}
