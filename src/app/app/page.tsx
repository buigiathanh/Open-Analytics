import { Header } from "@/components/Header";
import { STATS_CONTAINER_CLASS } from "@/lib/layout";
import { SetupBanner } from "@/components/SetupBanner";
import { WebsiteGrid } from "@/components/dashboard/WebsiteGrid";
import { listSitesForUser, getRegistryUser } from "@/lib/registry-sites";
import {
  getSupabase,
  isAppServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase";
import type { Site } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  let sites: Site[] = [];
  const supabase = await getSupabase();

  if (supabase) {
    const user = await getRegistryUser(supabase);
    if (user) {
      sites = await listSitesForUser(supabase, user.id);
    }
  }

  return (
    <>
      <Header containerClass={STATS_CONTAINER_CLASS} />
      <main className={`${STATS_CONTAINER_CLASS} flex-1 py-10`}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Websites</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Each website uses <strong>your own</strong> Supabase project for analytics.
            This app only stores the connection (project ID + publishable key) so /app can read your data.
          </p>
        </div>

        <SetupBanner />

        <WebsiteGrid
          sites={sites}
          canAdd={isSupabaseConfigured() && isAppServiceRoleConfigured()}
        />
      </main>
    </>
  );
}
