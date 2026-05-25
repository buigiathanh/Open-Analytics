import Link from "next/link";
import { ArrowUpRight, GitBranch, Star } from "lucide-react";

import { GithubCommitChart } from "@/components/landing/github-commit-chart";
import { GithubContributionGrid } from "@/components/landing/github-contribution-grid";
import { GridMarkers, OuterCornerMarkers } from "@/components/landing/grid-frame";
import { landingBody, landingCaption, landingEyebrow } from "@/components/landing/landing-typography";
import {
  fetchGithubCommitActivity,
  fetchGithubRepoMeta,
  GITHUB_REPO_NAME,
  GITHUB_REPO_OWNER,
  GITHUB_REPO_URL,
} from "@/lib/github";

export async function GithubActivity() {
  const [weeks, meta] = await Promise.all([
    fetchGithubCommitActivity(),
    fetchGithubRepoMeta(),
  ]);

  const hasCommits = weeks?.some((w) => w.total > 0) ?? false;
  const hasWeeks = Boolean(weeks?.length);

  return (
    <section id="github" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative border border-zinc-200 dark:border-zinc-800">
          <OuterCornerMarkers />

          <div className="border-b border-zinc-200 px-6 py-8 text-center sm:px-8 sm:py-10 dark:border-zinc-800">
            <p className={landingEyebrow}>Open source</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-tight">
              Commit activity on GitHub
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
              Data fetched directly from the GitHub API for{" "}
              <span className="font-mono text-foreground">{GITHUB_REPO_NAME}</span>
              — no third-party service.
            </p>
          </div>

          <div className="relative border-b border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
            <GridMarkers columns={1} rows={1} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                  <GitBranch className="size-5 text-foreground" strokeWidth={1.75} />
                </span>
                <div className="text-left">
                  <p className="font-mono text-sm font-semibold text-foreground">
                    {GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}
                  </p>
                  {meta?.description ? (
                    <p className={`mt-0.5 max-w-md ${landingBody}`}>
                      {meta.description}
                    </p>
                  ) : (
                    <p className={`mt-0.5 ${landingBody}`}>
                      Web analytics · Next.js + Supabase
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {meta ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-muted-foreground dark:border-zinc-700">
                      <Star className="size-3.5" />
                      {meta.stargazers_count}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-muted-foreground dark:border-zinc-700">
                      <GitBranch className="size-3.5" />
                      {meta.forks_count} fork
                    </span>
                  </>
                ) : null}
                <Link
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                >
                  View on GitHub
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative p-4 sm:p-6">
            <GridMarkers columns={1} rows={1} />

            {hasWeeks ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
                  <GithubContributionGrid weeks={weeks!} />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    Commits per week
                  </p>
                  <div className="h-36 sm:h-40">
                    <GithubCommitChart weeks={weeks!} />
                  </div>
                </div>

                {!hasCommits ? (
                  <p className={`text-center ${landingBody}`}>
                    No commits yet — gray cells are normal. After you push code,
                    the chart updates within ~1 hour.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
                <p className="text-sm font-medium text-foreground">
                  GitHub is computing commit stats
                </p>
                <p className={`mx-auto mt-2 max-w-md ${landingBody}`}>
                  API returned 202 (not ready yet) — common for new repos. View
                  commits on GitHub:
                </p>
                <Link
                  href={`${GITHUB_REPO_URL}/commits`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  {GITHUB_REPO_URL}/commits
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>

          <p className={`border-t border-zinc-200 px-4 py-3 text-center dark:border-zinc-800 sm:px-6 ${landingCaption}`}>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline decoration-zinc-300 underline-offset-2 hover:text-emerald-600 dark:decoration-zinc-600"
            >
              github.com/{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}
            </a>
            {" "}
            · GitHub REST API · refreshed hourly
          </p>
        </div>
      </div>
    </section>
  );
}
