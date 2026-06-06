import { notFound } from "next/navigation";
import { SetupBanner } from "@/components/SetupBanner";
import { RealtimeView } from "@/components/dashboard/RealtimeView";
import {
  getDemoRealtimeBotVisits,
  getDemoRealtimeEvents,
} from "@/lib/realtime-demo-data";
import {
  fetchRecentRealtimeBotVisits,
  fetchRecentRealtimeEvents,
} from "@/lib/realtime-events";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { isPostgresConfigured } from "@/lib/db/config";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ demo?: string }>;
}

export default async function RealtimePage({ params, searchParams }: PageProps) {
  const { siteId } = await params;
  const { demo: demoParam } = await searchParams;
  const isDemo = demoParam === "1";

  if (!isSupabaseConfigured() || !isPostgresConfigured()) {
    return (
      <main className="px-4 py-10">
        <SetupBanner />
      </main>
    );
  }

  const user = await getRegistryUser();
  if (!user) notFound();

  const siteRow = await getSiteForUser(siteId, user.id);
  if (!siteRow) notFound();

  const events = isDemo
    ? getDemoRealtimeEvents(siteRow.site_key)
    : await fetchRecentRealtimeEvents(siteRow);
  const botVisits = isDemo
    ? getDemoRealtimeBotVisits(siteRow.site_key)
    : await fetchRecentRealtimeBotVisits(siteRow);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <RealtimeView
        site={siteRow}
        initialEvents={events}
        initialBotVisits={botVisits}
        mode="owner"
        demoMode={isDemo}
        shareRealtimeEnabled={siteRow.share_realtime_enabled ?? false}
      />
    </div>
  );
}
