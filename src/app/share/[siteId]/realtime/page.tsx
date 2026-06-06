import { notFound } from "next/navigation";
import { RealtimeView } from "@/components/dashboard/RealtimeView";
import {
  getDemoRealtimeBotVisits,
  getDemoRealtimeEvents,
} from "@/lib/realtime-demo-data";
import {
  fetchRecentRealtimeBotVisits,
  fetchRecentRealtimeEvents,
} from "@/lib/realtime-events";
import {
  getSiteForPublicShare,
  getSiteForShareDemo,
} from "@/lib/registry-sites";
import { isPostgresConfigured } from "@/lib/db/config";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ demo?: string }>;
}

export default async function PublicRealtimeSharePage({
  params,
  searchParams,
}: PageProps) {
  const { siteId } = await params;
  const { demo: demoParam } = await searchParams;
  const isDemo = demoParam === "1";

  if (!isPostgresConfigured()) notFound();

  const site = isDemo
    ? await getSiteForShareDemo(siteId)
    : await getSiteForPublicShare(siteId);
  if (!site) notFound();

  const events = isDemo
    ? getDemoRealtimeEvents(site.site_key)
    : await fetchRecentRealtimeEvents(site);
  const botVisits = isDemo
    ? getDemoRealtimeBotVisits(site.site_key)
    : await fetchRecentRealtimeBotVisits(site);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <RealtimeView
        site={site}
        initialEvents={events}
        initialBotVisits={botVisits}
        mode="public"
        demoMode={isDemo}
      />
    </div>
  );
}
