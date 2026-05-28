import { notFound } from "next/navigation";
import { SetupBanner } from "@/components/SetupBanner";
import { SiteGeneralSettings } from "@/components/dashboard/SiteGeneralSettings";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteGeneralSettingsPage({ params }: PageProps) {
  const { siteId } = await params;
  const registry = await getSupabase();

  if (!registry) {
    return <SetupBanner />;
  }

  const user = await getRegistryUser(registry);
  if (!user) notFound();

  const site = await getSiteForUser(registry, siteId, user.id);
  if (!site) notFound();

  return <SiteGeneralSettings site={site} />;
}
