"use client";

import { useState } from "react";
import Link from "next/link";
import { ICON_GLOBE, referrerFaviconUrl } from "@/lib/breakdown-icons";
import type { Site } from "@/lib/types";
import { AddWebsiteModal } from "./AddWebsiteModal";

function domainHost(domain: string): string {
  return domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
}

function SiteCard({ site }: { site: Site }) {
  const host = domainHost(site.domain);
  const favicon = referrerFaviconUrl(host);

  return (
    <Link
      href={`/app/${site.id}`}
      className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-emerald-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-500/40"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900">
        <img
          src={favicon}
          alt=""
          width={28}
          height={28}
          className="size-7 rounded object-contain"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = ICON_GLOBE;
          }}
        />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold text-zinc-800 group-hover:text-emerald-600 dark:text-zinc-200 dark:group-hover:text-emerald-400">
          {site.name}
        </p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {host}
        </p>
      </div>
    </Link>
  );
}

function AddSiteCard({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50/80 px-3 py-2.5 text-left text-zinc-500 transition hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900/30 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-xl font-light text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        +
      </span>
      <span className="text-sm font-medium">Add website</span>
    </button>
  );
}

export function WebsiteGrid({
  sites,
  canAdd,
}: {
  sites: Site[];
  canAdd: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <AddSiteCard
          onClick={() => setModalOpen(true)}
          disabled={!canAdd}
        />
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>

      {!canAdd && (
        <p className="mt-4 text-sm text-zinc-500">
          Configure Supabase in <code className="text-xs">.env.local</code> to add
          websites. Connect each site to your own Supabase project for analytics data.
        </p>
      )}

      <AddWebsiteModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
