import { notFound } from "next/navigation";
import { SetupBanner } from "@/components/SetupBanner";
import { SiteSupabaseSettings } from "@/components/dashboard/SiteSupabaseSettings";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteSupabaseSettingsPage({ params }: PageProps) {
  const { siteId } = await params;
  const registry = await getSupabase();

  if (!registry) {
    return <SetupBanner />;
  }

  const user = await getRegistryUser(registry);
  if (!user) notFound();

  const site = await getSiteForUser(registry, siteId, user.id);
  if (!site) notFound();

  return <SiteSupabaseSettings site={site} />;
}
