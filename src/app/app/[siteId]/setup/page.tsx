import { notFound } from "next/navigation";
import { STATS_CONTAINER_CLASS } from "@/lib/layout";
import { SetupBanner } from "@/components/SetupBanner";
import { SiteNav } from "@/components/dashboard/SiteNav";
import { EmbedSnippet } from "@/components/EmbedSnippet";
import { getRegistryUser, getSiteForUser } from "@/lib/registry-sites";
import { getSupabase } from "@/lib/supabase";
import type { Site } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteSetupPage({ params }: PageProps) {
  const { siteId } = await params;
  const supabase = await getSupabase();

  if (!supabase) {
    return (
      <main className={`${STATS_CONTAINER_CLASS} py-10`}>
        <SetupBanner />
      </main>
    );
  }

  const user = await getRegistryUser(supabase);
  if (!user) notFound();

  const site = await getSiteForUser(supabase, siteId, user.id);
  if (!site) notFound();

  return (
    <main className={`${STATS_CONTAINER_CLASS} flex-1 py-10`}>
      <SetupBanner />
      <SiteNav site={site} active="setup" />
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <EmbedSnippet site={site} />
      </div>
    </main>
  );
}
