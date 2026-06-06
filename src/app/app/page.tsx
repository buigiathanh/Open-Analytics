import { Header } from "@/components/Header";
import { STATS_CONTAINER_CLASS } from "@/lib/layout";
import { SetupBanner } from "@/components/SetupBanner";
import { WebsiteGrid } from "@/components/dashboard/WebsiteGrid";
import { listSitesForUser, getRegistryUser } from "@/lib/registry-sites";
import { isPostgresConfigured } from "@/lib/db/config";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Site } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  let sites: Site[] = [];
  const configured = isSupabaseConfigured() && isPostgresConfigured();

  if (configured) {
    const user = await getRegistryUser();
    if (user) {
      sites = await listSitesForUser(user.id);
    }
  }

  return (
    <>
      <Header containerClass={STATS_CONTAINER_CLASS} />
      <main className={`${STATS_CONTAINER_CLASS} flex-1 py-10`}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Websites</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Add a website, embed the tracker script, and view analytics stored in your PostgreSQL database.
          </p>
        </div>

        <SetupBanner />

        <WebsiteGrid sites={sites} canAdd={configured} />
      </main>
    </>
  );
}
