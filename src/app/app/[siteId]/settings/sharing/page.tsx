import { notFound } from "next/navigation";
import { SetupBanner } from "@/components/SetupBanner";
import { SiteSharingSettings } from "@/components/dashboard/SiteSharingSettings";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { isPostgresConfigured } from "@/lib/db/config";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteSharingSettingsPage({ params }: PageProps) {
  const { siteId } = await params;

  if (!isSupabaseConfigured() || !isPostgresConfigured()) {
    return <SetupBanner />;
  }

  const user = await getRegistryUser();
  if (!user) notFound();

  const site = await getSiteForUser(siteId, user.id);
  if (!site) notFound();

  return <SiteSharingSettings site={site} />;
}
