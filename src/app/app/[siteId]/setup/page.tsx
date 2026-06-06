import { notFound } from "next/navigation";
import { SetupBanner } from "@/components/SetupBanner";
import { EmbedSnippet } from "@/components/EmbedSnippet";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { isPostgresConfigured } from "@/lib/db/config";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteSetupPage({ params }: PageProps) {
  const { siteId } = await params;

  if (!isSupabaseConfigured() || !isPostgresConfigured()) {
    return <SetupBanner />;
  }

  const user = await getRegistryUser();
  if (!user) notFound();

  const site = await getSiteForUser(siteId, user.id);
  if (!site) notFound();

  return (
    <>
      <SetupBanner />
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <EmbedSnippet site={site} />
      </div>
    </>
  );
}
