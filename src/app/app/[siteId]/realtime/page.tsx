import { notFound } from "next/navigation";
import { SetupBanner } from "@/components/SetupBanner";
import { RealtimeView } from "@/components/dashboard/RealtimeView";
import { REALTIME_WINDOW_MS } from "@/lib/constants";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { getSupabase } from "@/lib/supabase";
import { getSupabaseForSite } from "@/lib/supabase-project";
import type { AnalyticsEvent, Site } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function RealtimePage({ params }: PageProps) {
  const { siteId } = await params;
  const registry = await getSupabase();

  if (!registry) {
    return (
      <main className="px-4 py-10">
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
      <main className="px-4 py-10">
        <SetupBanner />
      </main>
    );
  }

  const since = new Date(Date.now() - REALTIME_WINDOW_MS).toISOString();
  const { data: events } = await eventsDb
    .from("events")
    .select("*")
    .eq("site_key", siteRow.site_key)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <RealtimeView
        site={siteRow}
        initialEvents={(events as AnalyticsEvent[]) ?? []}
      />
    </div>
  );
}
