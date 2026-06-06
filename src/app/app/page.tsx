import { Header } from "@/components/Header";
import { STATS_CONTAINER_CLASS } from "@/lib/layout";
import { SetupBanner } from "@/components/SetupBanner";
import { WebsiteGrid } from "@/components/dashboard/WebsiteGrid";
import type { ProjectCardData } from "@/components/dashboard/ProjectCard";
import { buildProjectCardTrend } from "@/lib/analytics";
import { fetchEventsForSite } from "@/lib/db/events";
import { listSitesForUser, getRegistryUser } from "@/lib/registry-sites";
import { isPostgresConfigured } from "@/lib/db/config";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TREND_DAYS = 7;

async function loadProjectCards(userId: string): Promise<ProjectCardData[]> {
  const sites = await listSitesForUser(userId);
  const since = new Date();
  since.setDate(since.getDate() - TREND_DAYS);

  return Promise.all(
    sites.map(async (site) => {
      const events = await fetchEventsForSite(site.site_key, {
        since: since.toISOString(),
        limit: 5000,
      });
      const trend = buildProjectCardTrend(events, TREND_DAYS);

      return {
        site,
        series: trend.series,
        visitorTotal: trend.visitorTotal,
        hasTracking: trend.hasTracking,
      };
    })
  );
}

export default async function AppPage() {
  let projects: ProjectCardData[] = [];
  const configured = isSupabaseConfigured() && isPostgresConfigured();

  if (configured) {
    const user = await getRegistryUser();
    if (user) {
      projects = await loadProjectCards(user.id);
    }
  }

  return (
    <>
      <Header containerClass={STATS_CONTAINER_CLASS} />
      <main className={`${STATS_CONTAINER_CLASS} flex-1 py-10`}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Websites</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Add a website, embed the tracker script, and view analytics stored in
            your PostgreSQL database.
          </p>
        </div>

        <SetupBanner />

        <WebsiteGrid projects={projects} canAdd={configured} />
      </main>
    </>
  );
}
