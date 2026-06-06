"use client";

import type { BotPageRow } from "@/lib/bot-analytics";
import {
  botIconUrl,
  getBotDefinition,
  type BotId,
} from "@/lib/bots";
import type { Site } from "@/lib/types";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function pageUrl(site: Site, path: string): string {
  const domain = site.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `https://${domain}${p}`;
}

function BotBadge({ id }: { id: BotId }) {
  const def = getBotDefinition(id);
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      title={def.label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={botIconUrl(id)}
        alt=""
        width={14}
        height={14}
        className="size-3.5 shrink-0 rounded-sm object-contain"
        loading="lazy"
      />
      <span className="truncate">{def.label}</span>
    </span>
  );
}

function BotIconsCell({ botIds }: { botIds: BotId[] }) {
  if (botIds.length === 0) {
    return <span className="text-xs text-zinc-400">—</span>;
  }

  return (
    <div className="flex flex-nowrap items-center gap-1.5">
      {botIds.map((id) => (
        <BotBadge key={id} id={id} />
      ))}
    </div>
  );
}

export function BotPagesTable({
  site,
  pages,
}: {
  site: Site;
  pages: BotPageRow[];
}) {
  if (pages.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        No pages crawled by bots yet
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Pages crawled
        </h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          Paths visited by bots, with last crawl time
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
              <th className="px-4 py-2.5 font-medium">Page</th>
              <th className="px-4 py-2.5 font-medium">Bots</th>
              <th className="px-4 py-2.5 font-medium text-right">Hits</th>
              <th className="px-4 py-2.5 font-medium text-right">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((row) => (
              <tr
                key={row.path}
                className="border-b border-zinc-50 last:border-0 dark:border-zinc-900"
              >
                <td className="max-w-[280px] truncate px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                  <a
                    href={pageUrl(site, row.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-600 hover:underline dark:hover:text-emerald-400"
                    title={row.path}
                  >
                    {row.path}
                  </a>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <BotIconsCell botIds={row.botIds} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                  {row.hits.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-xs text-zinc-500">
                  {formatRelativeTime(row.lastSeen)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
