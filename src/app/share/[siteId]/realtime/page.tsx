import { notFound } from "next/navigation";
import { RealtimeView } from "@/components/dashboard/RealtimeView";
import { fetchRecentRealtimeEvents } from "@/lib/realtime-events";
import { getSiteForPublicShare } from "@/lib/registry-sites";
import { getSupabaseForSite } from "@/lib/supabase-project";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function PublicRealtimeSharePage({ params }: PageProps) {
  const { siteId } = await params;
  const site = await getSiteForPublicShare(siteId);
  if (!site || !getSupabaseForSite(site)) notFound();

  const events = await fetchRecentRealtimeEvents(site);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <RealtimeView site={site} initialEvents={events} mode="public" />
    </div>
  );
}
