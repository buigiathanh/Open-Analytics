import { notFound } from "next/navigation";
import { SetupBanner } from "@/components/SetupBanner";
import { BotSetupGate } from "@/components/dashboard/BotSetupGate";
import { BotView } from "@/components/dashboard/BotView";
import { getDemoBotAnalytics } from "@/lib/bot-demo-data";
import { buildBotDashboardAnalytics } from "@/lib/bot-analytics";
import {
  fetchBotVisitsForSite,
  hasBotVisitsForSite,
} from "@/lib/db/bot-visits";
import { isPostgresConfigured } from "@/lib/db/config";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ days?: string; demo?: string }>;
}

export default async function BotsPage({ params, searchParams }: PageProps) {
  const { siteId } = await params;
  const { days: daysParam, demo: demoParam } = await searchParams;
  const periodDays = daysParam === "30" ? 30 : 7;
  const isDemo = demoParam === "1";

  if (!isSupabaseConfigured() || !isPostgresConfigured()) {
    return <SetupBanner />;
  }

  const user = await getRegistryUser();
  if (!user) notFound();

  const siteRow = await getSiteForUser(siteId, user.id);
  if (!siteRow) notFound();

  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - periodDays);

  const eventList = await fetchBotVisitsForSite(siteRow.site_key, {
    since: rangeStart.toISOString(),
    limit: 5000,
  });

  const hasBotTracking = await hasBotVisitsForSite(siteRow.site_key);

  const analytics = isDemo
    ? getDemoBotAnalytics(siteRow.site_key, periodDays)
    : buildBotDashboardAnalytics(eventList, periodDays);

  return (
    <>
      <SetupBanner />
      {!isDemo && (
        <BotSetupGate site={siteRow} hasBotTracking={hasBotTracking} />
      )}
      <BotView site={siteRow} analytics={analytics} isDemo={isDemo} />
    </>
  );
}
