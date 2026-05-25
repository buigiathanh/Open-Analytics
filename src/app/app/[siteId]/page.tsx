import { notFound } from "next/navigation";
import { STATS_CONTAINER_CLASS } from "@/lib/layout";
import { SetupBanner } from "@/components/SetupBanner";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { getSupabase } from "@/lib/supabase";
import { getSupabaseForSite } from "@/lib/supabase-project";
import { buildDashboardAnalytics } from "@/lib/analytics";
import { ONLINE_WINDOW_MS } from "@/lib/constants";
import type { AnalyticsEvent, Site } from "@/lib/types";
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

  const registry = await getSupabase();
  if (!registry) {
    return (
      <main className={`${STATS_CONTAINER_CLASS} py-10`}>
        <SetupBanner />
      </main>
    );
  }

  const user = await getRegistryUser(registry);
  if (!user) notFound();

  const siteRow = await getSiteForUser(registry, siteId, user.id);
  if (!siteRow) notFound();
  const eventsDb = getSupabaseForSite(siteRow);
  if (!eventsDb) {
    return (
      <main className={`${STATS_CONTAINER_CLASS} py-10`}>
        <SetupBanner />
      </main>
    );
  }

  const fetchDays = Math.max(periodDays * 2, 60);
  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - fetchDays);

  const { data: events } = await eventsDb
    .from("events")
    .select("*")
    .eq("site_key", siteRow.site_key)
    .gte("created_at", rangeStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(5000);

  const eventList = (events as AnalyticsEvent[]) ?? [];
  const analytics = buildDashboardAnalytics(
    eventList,
    ONLINE_WINDOW_MS,
    periodDays
  );

  return (
    <main className={`${STATS_CONTAINER_CLASS} flex-1 py-8`}>
      <SetupBanner />
      <SiteDashboard site={siteRow} analytics={analytics} />
    </main>
  );
}
