export const GITHUB_REPO_OWNER = "buigiathanh";
export const GITHUB_REPO_NAME = "Open-Analytics";
export const GITHUB_REPO_SLUG = `${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO_SLUG}`;

export type GithubCommitWeek = {
  total: number;
  week: number;
  days: number[];
};

export type GithubRepoMeta = {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string | null;
  description: string | null;
};

export async function fetchGithubCommitActivity(): Promise<GithubCommitWeek[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_SLUG}/stats/commit_activity`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }
    );

    if (res.status === 202) return null;
    if (!res.ok) return null;

    const data = (await res.json()) as GithubCommitWeek[];
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export async function fetchGithubRepoMeta(): Promise<GithubRepoMeta | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_SLUG}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return {
      stargazers_count: data.stargazers_count ?? 0,
      forks_count: data.forks_count ?? 0,
      open_issues_count: data.open_issues_count ?? 0,
      pushed_at: data.pushed_at ?? null,
      description: data.description ?? null,
    };
  } catch {
    return null;
  }
}
