"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BotPageRow } from "@/lib/bot-analytics";
import {
  botIconUrl,
  getBotDefinition,
  partitionPageBots,
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

function BotIcon({ id, size = 20 }: { id: BotId; size?: number }) {
  const label = getBotDefinition(id).label;
  return (
    <img
      src={botIconUrl(id)}
      alt={label}
      width={size}
      height={size}
      title={label}
      className="size-5 shrink-0 rounded object-contain"
      loading="lazy"
    />
  );
}

function BotOverflowBadge({ overflow }: { overflow: BotId[] }) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
  }, []);

  function show() {
    updatePosition();
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  const tooltip =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[100] min-w-[140px] rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
            style={{ top: pos.top, left: pos.left }}
          >
            <ul className="space-y-1.5">
              {overflow.map((id) => (
                <li
                  key={id}
                  className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <BotIcon id={id} />
                  <span>{getBotDefinition(id).label}</span>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <span
        ref={anchorRef}
        className="inline-flex cursor-default rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-medium tabular-nums text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        tabIndex={0}
      >
        +{overflow.length} {overflow.length === 1 ? "bot" : "bots"}
      </span>
      {tooltip}
    </>
  );
}

function BotIconsCell({ botIds }: { botIds: BotId[] }) {
  const { visible, overflow } = useMemo(
    () => partitionPageBots(botIds),
    [botIds]
  );

  if (botIds.length === 0) {
    return <span className="text-xs text-zinc-400">—</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {visible.map((id) => (
        <span key={id} className="inline-flex">
          <BotIcon id={id} />
        </span>
      ))}
      {overflow.length > 0 && <BotOverflowBadge overflow={overflow} />}
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
                <td className="px-4 py-3">
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
