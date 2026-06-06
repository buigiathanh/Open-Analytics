import { notFound } from "next/navigation";
import { SiteSidebar } from "@/components/dashboard/SiteSidebar";
import { TrackingSetupGate } from "@/components/dashboard/TrackingSetupGate";
import { APP_CONTAINER_CLASS } from "@/lib/layout";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { isPostgresConfigured } from "@/lib/db/config";
import { hasEventsForSite } from "@/lib/db/events";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function SiteDetailLayout({
  siteId,
  children,
}: {
  siteId: string;
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured() || !isPostgresConfigured()) {
    return (
      <main className={`${APP_CONTAINER_CLASS} flex-1 py-10`}>{children}</main>
    );
  }

  const user = await getRegistryUser();
  if (!user) notFound();

  const site = await getSiteForUser(siteId, user.id);
  if (!site) notFound();

  const hasTracking = await hasEventsForSite(site.site_key);

  return (
    <>
      <TrackingSetupGate site={site} hasTracking={hasTracking} />
      <div className={`${APP_CONTAINER_CLASS} flex flex-1 flex-col gap-6 py-6 lg:flex-row lg:gap-8 lg:py-8`}>
        <SiteSidebar site={site} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
