"use client";

import Link from "next/link";
import { useState } from "react";
import { Settings } from "lucide-react";
import type { Site } from "@/lib/types";
import { EditSiteSettingsModal } from "./EditSiteSettingsModal";

interface SiteNavProps {
  site: Site;
  active: "overview" | "realtime" | "setup";
}

export function SiteNav({ site, active }: SiteNavProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const tabs = [
    { id: "overview" as const, label: "Stats", href: `/app/${site.id}` },
    { id: "realtime" as const, label: "Realtime", href: `/app/${site.id}/realtime` },
    { id: "setup" as const, label: "Code", href: `/app/${site.id}/setup` },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <Link
            href="/app"
            className="text-xs text-zinc-500 hover:text-emerald-600"
          >
            ← Websites
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{site.name}</h1>
          <p className="text-xs text-zinc-500">{site.domain}</p>
        </div>
        <div className="flex items-center gap-1">
          <nav className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active === tab.id
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Project settings"
          >
            <Settings className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <EditSiteSettingsModal
        site={site}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
