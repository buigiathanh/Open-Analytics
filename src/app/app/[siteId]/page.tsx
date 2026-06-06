import { notFound } from "next/navigation";
import { SetupBanner } from "@/components/SetupBanner";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { isPostgresConfigured } from "@/lib/db/config";
import { isSupabaseConfigured } from "@/lib/supabase";
import { buildDashboardAnalytics } from "@/lib/analytics";
import { ONLINE_WINDOW_MS } from "@/lib/constants";
import { fetchEventsForSite } from "@/lib/db/events";
import {
  getGscDailySeries,
  isGscReadyForProject,
  mergeGscIntoTimeSeries,
} from "@/lib/google/search-console-overview";
import { SiteDashboard } from "./SiteDashboard";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ days?: string }>;
}

export default async function SitePage({ params, searchParams }: PageProps) {
  const { siteId } = await params;
  const { days: daysParam } = await searchParams;
  const periodDays = daysParam === "30" ? 30 : 7;

  if (!isSupabaseConfigured() || !isPostgresConfigured()) {
    return <SetupBanner />;
  }

  const user = await getRegistryUser();
  if (!user) notFound();

  const siteRow = await getSiteForUser(siteId, user.id);
  if (!siteRow) notFound();

  const fetchDays = Math.max(periodDays * 2, 60);
  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - fetchDays);

  const eventList = await fetchEventsForSite(siteRow.site_key, {
    since: rangeStart.toISOString(),
    limit: 5000,
  });

  const analytics = buildDashboardAnalytics(
    eventList,
    ONLINE_WINDOW_MS,
    periodDays
  );

  let series = analytics.series;
  if (await isGscReadyForProject(siteId)) {
    const gscDaily = await getGscDailySeries(siteId, periodDays);
    series = mergeGscIntoTimeSeries(series, gscDaily);
  }
  const showSearchConsole = series.some((p) => p.gscClicks != null);

  return (
    <>
      <SetupBanner />
      <SiteDashboard
        site={siteRow}
        analytics={{ ...analytics, series }}
        showSearchConsole={showSearchConsole}
      />
    </>
  );
}
