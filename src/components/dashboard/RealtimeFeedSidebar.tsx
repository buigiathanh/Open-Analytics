"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { channelIconUrl, countryFlagUrl, ICON_GLOBE } from "@/lib/breakdown-icons";
import { referrerHost } from "@/lib/countries";
import { DEVICE } from "@/lib/constants";
import type { LiveFeedItem } from "@/lib/analytics";

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

function sourceLabel(item: LiveFeedItem): string {
  return item.source?.trim() || referrerHost(item.referrer) || "Direct";
}

function sourceIconUrl(item: LiveFeedItem): string {
  if (item.referrer?.trim()) return channelIconUrl(item.referrer);
  return ICON_GLOBE;
}

function DeviceIcon({ device }: { device: number | null }) {
  const cls = "size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500";
  if (device === DEVICE.MOBILE) return <Smartphone className={cls} strokeWidth={1.75} />;
  if (device === DEVICE.TABLET) return <Tablet className={cls} strokeWidth={1.75} />;
  return <Monitor className={cls} strokeWidth={1.75} />;
}

interface RealtimeFeedSidebarProps {
  feed: LiveFeedItem[];
  selectedVisitorId: string | null;
  onSelectVisitor: (visitorId: string) => void;
}

export function RealtimeFeedSidebar({
  feed,
  selectedVisitorId,
  onSelectVisitor,
}: RealtimeFeedSidebarProps) {
  return (
    <aside className="flex h-full w-[350px] shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950">
      <ul className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
        {feed.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No activity in the last 5 minutes
          </li>
        ) : (
          feed.map((v) => {
            const isSelected = selectedVisitorId === v.visitor_id;
            const flagUrl = countryFlagUrl(v.country_code);
            const source = sourceLabel(v);
            const sourceIcon = sourceIconUrl(v);

            return (
              <li
                key={v.visitor_id}
                className="border-b border-zinc-200/80 dark:border-zinc-800"
              >
                <button
                  type="button"
                  onClick={() => onSelectVisitor(v.visitor_id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-3 text-left transition",
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-500/10"
                      : "hover:bg-zinc-100/70 dark:hover:bg-zinc-900/60"
                  )}
                >
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.avatar}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 rounded-full bg-zinc-200 object-cover dark:bg-zinc-800"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={flagUrl}
                      alt=""
                      width={14}
                      height={10}
                      className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-[2px] border border-white object-cover dark:border-zinc-900"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset.fallback === "1") return;
                        img.dataset.fallback = "1";
                        img.src = ICON_GLOBE;
                      }}
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {v.displayName}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        Live
                      </span>
                    </span>
                    <DeviceIcon device={v.device} />
                    <span className="min-w-0 truncate text-xs text-zinc-400 dark:text-zinc-500">
                      {v.path || "/"}
                    </span>
                  </div>

                  <span className="inline-flex max-w-[7rem] shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sourceIcon}
                      alt=""
                      width={12}
                      height={12}
                      className="size-3 shrink-0 rounded-sm object-contain"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.dataset.fallback === "1") return;
                        img.dataset.fallback = "1";
                        img.src = ICON_GLOBE;
                      }}
                    />
                    <span className="truncate">{source}</span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}
