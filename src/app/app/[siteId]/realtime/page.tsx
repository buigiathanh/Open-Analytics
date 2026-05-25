import { notFound } from "next/navigation";
import { SetupBanner } from "@/components/SetupBanner";
import { RealtimeView } from "@/components/dashboard/RealtimeView";
import { fetchRecentRealtimeEvents } from "@/lib/realtime-events";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { getSupabase } from "@/lib/supabase";
import { getSupabaseForSite } from "@/lib/supabase-project";

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
  if (!getSupabaseForSite(siteRow)) {
    return (
      <main className="px-4 py-10">
        <SetupBanner />
      </main>
    );
  }

  const events = await fetchRecentRealtimeEvents(siteRow);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <RealtimeView
        site={siteRow}
        initialEvents={events}
        mode="owner"
        shareRealtimeEnabled={siteRow.share_realtime_enabled ?? false}
      />
    </div>
  );
}
