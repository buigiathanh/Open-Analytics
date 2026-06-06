"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useRealtimeSocket } from "@/hooks/useRealtimeSocket";
import {
  REALTIME_CHART_MINUTES,
  REALTIME_WINDOW_MS,
} from "@/lib/constants";
import {
  buildMinuteSeries,
  getLiveFeed,
  liveBreakdownBy,
} from "@/lib/analytics";
import { countryFlagUrl } from "@/lib/breakdown-icons";
import { countryName, referrerHost } from "@/lib/countries";
import { DEVICE_LABEL } from "@/lib/constants";
import { liveFeedToGlobeVisitors } from "@/lib/live-to-globe";
import {
  buildRealtimeShareUrl,
  parseRealtimeMapMode,
  parseRealtimeTheme,
  realtimeThemeFromResolved,
  realtimeUrlMatches,
  type RealtimeMapMode,
} from "@/lib/realtime-url";
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
    setEvents((prev) => [event, ...prev].slice(0, 800));
  }, []);

  useRealtimeSocket(site.site_key, onRealtimeEvent);

  useEffect(() => {
    const eventsUrl =
      mode === "public"
        ? `/api/share/${site.id}/events`
        : `/api/sites/${site.id}/events?since=${encodeURIComponent(
            new Date(Date.now() - REALTIME_WINDOW_MS).toISOString()
          )}&limit=400`;

    const poll = setInterval(async () => {
      try {
        const res = await fetch(eventsUrl, { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as { events?: AnalyticsEvent[] };
        if (data.events) setEvents(data.events);
      } catch {
        /* ignore */
      }
    }, 12000);

    return () => clearInterval(poll);
  }, [site.id, site.site_key, mode]);

  const feed = useMemo(
    () => getLiveFeed(events, REALTIME_WINDOW_MS),
    [events]
  );
  const minuteSeries = useMemo(
    () => buildMinuteSeries(events, REALTIME_CHART_MINUTES),
    [events]
  );

  const referrers = liveBreakdownBy(feed, (e) => ({
    key: e.source || referrerHost(e.referrer),
    label: e.source?.trim() || referrerHost(e.referrer) || "Direct",
  }));
  const countries = liveBreakdownBy(feed, (e) => ({
    key: e.country_code || "??",
    label: countryName(e.country_code),
    iconUrl: countryFlagUrl(e.country_code),
  }));
  const devices = liveBreakdownBy(feed, (e) => ({
    key: String(e.device ?? 0),
    label: DEVICE_LABEL[e.device ?? 0],
  }));

  const globeVisitors = useMemo(
    () => liveFeedToGlobeVisitors(feed),
    [feed]
  );

  const isGlobe = mapViewMode === "globe";
  const mapContainerClass = isSimpleView
    ? "absolute inset-x-0 top-[84px] bottom-0 lg:inset-0"
    : "absolute inset-x-0 top-[190px] bottom-[174px] lg:inset-0";

  return (
    <div
      className={
        isGlobe
          ? "relative h-full w-full overflow-hidden bg-gradient-to-b from-sky-50 via-zinc-50 to-zinc-100 dark:from-[#0d1424] dark:via-[#121c2e] dark:to-[#0f172a]"
          : "relative h-full w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950"
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
      <div className={mapContainerClass}>
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
      <RealtimeOverlay
        site={site}
        mode={mode}
        shareRealtimeEnabled={shareRealtimeEnabled}
        liveCount={feed.length}
        minuteSeries={minuteSeries}
        referrers={referrers}
        countries={countries}
        devices={devices}
        feed={feed}
        selectedVisitorId={selectedVisitorId}
        onSelectVisitor={setSelectedVisitorId}
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
        simpleView={isSimpleView}
      />
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
