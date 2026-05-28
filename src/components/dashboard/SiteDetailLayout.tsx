import { notFound } from "next/navigation";
import { SiteSidebar } from "@/components/dashboard/SiteSidebar";
import { APP_CONTAINER_CLASS } from "@/lib/layout";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { getSupabase } from "@/lib/supabase";

export async function SiteDetailLayout({
  siteId,
  children,
}: {
  siteId: string;
  children: React.ReactNode;
}) {
  const registry = await getSupabase();
  if (!registry) {
    return (
      <main className={`${APP_CONTAINER_CLASS} flex-1 py-10`}>{children}</main>
    );
  }

  const user = await getRegistryUser(registry);
  if (!user) notFound();

  const site = await getSiteForUser(registry, siteId, user.id);
  if (!site) notFound();

  return (
    <div className={`${APP_CONTAINER_CLASS} flex flex-1 flex-col gap-6 py-6 lg:flex-row lg:gap-8 lg:py-8`}>
      <SiteSidebar site={site} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
