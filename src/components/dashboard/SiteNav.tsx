import Link from "next/link";
import type { Site } from "@/lib/types";

interface SiteNavProps {
  site: Site;
  active: "overview" | "realtime" | "setup";
}

export function SiteNav({ site, active }: SiteNavProps) {
  const tabs = [
    { id: "overview" as const, label: "Stats", href: `/app/${site.id}` },
    { id: "realtime" as const, label: "Realtime", href: `/app/${site.id}/realtime` },
    { id: "setup" as const, label: "Code", href: `/app/${site.id}/setup` },
  ];

  return (
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
    </div>
  );
}
