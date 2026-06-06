"use client";

import Link from "next/link";
import { ICON_GLOBE, referrerFaviconUrl } from "@/lib/breakdown-icons";
import type { Site } from "@/lib/types";
import {
  ProjectCardSparkline,
  type SparklinePoint,
} from "./ProjectCardSparkline";

export interface ProjectCardData {
  site: Site;
  series: SparklinePoint[];
  visitorTotal: number;
  hasTracking: boolean;
}

function siteDisplayUrl(domain: string): string {
  const d = domain.trim();
  if (/^https?:\/\//i.test(d)) {
    return d.replace(/\/$/, "");
  }
  const host = d.replace(/^www\./, "").split("/")[0];
  return `https://${host}`;
}

function domainHost(domain: string): string {
  return domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

function VerifiedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#22c55e"
        d="M12 2 4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3Z"
      />
      <path
        fill="white"
        d="m10.5 14.2-2.2-2.2 1-1 1.2 1.2 3.3-3.3 1 1-4.3 4.3Z"
      />
    </svg>
  );
}

export function ProjectCard({ data }: { data: ProjectCardData }) {
  const { site, series, visitorTotal, hasTracking } = data;
  const host = domainHost(site.domain);
  const favicon = referrerFaviconUrl(host);
  const url = siteDisplayUrl(site.domain);

  return (
    <Link
      href={`/app/${site.id}`}
      className="group block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          {hasTracking ? (
            <VerifiedIcon />
          ) : (
            <img
              src={favicon}
              alt=""
              width={24}
              height={24}
              className="size-6 rounded object-contain"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = ICON_GLOBE;
              }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-zinc-900 group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400">
            {site.name}
          </p>
          <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
            {url}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Visitors trend
          </span>
          <span className="text-sm text-zinc-500">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {visitorTotal.toLocaleString()}
            </span>{" "}
            visitors
          </span>
        </div>
        <ProjectCardSparkline points={series} />
      </div>
    </Link>
  );
}
