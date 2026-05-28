"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Site } from "@/lib/types";

type NavItem = {
  id: string;
  label: string;
  href: string;
  match?: (pathname: string) => boolean;
};

function isActive(pathname: string, item: NavItem): boolean {
  if (item.match) return item.match(pathname);
  return pathname === item.href;
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item);
  return (
    <Link
      href={item.href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
      }`}
    >
      {item.label}
    </Link>
  );
}

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <NavLink item={item} pathname={pathname} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteSidebar({ site }: { site: Site }) {
  const pathname = usePathname();
  const base = `/app/${site.id}`;

  const analytics: NavItem[] = [
    {
      id: "overview",
      label: "Stats",
      href: base,
      match: (p) => p === base,
    },
    {
      id: "realtime",
      label: "Realtime",
      href: `${base}/realtime`,
      match: (p) => p.startsWith(`${base}/realtime`),
    },
    {
      id: "search-console",
      label: "Search Console",
      href: `${base}/search-console`,
      match: (p) => p.startsWith(`${base}/search-console`),
    },
    {
      id: "similarweb",
      label: "Similarweb",
      href: `${base}/similarweb`,
      match: (p) => p.startsWith(`${base}/similarweb`),
    },
  ];

  const setup: NavItem[] = [
    {
      id: "setup",
      label: "Tracking code",
      href: `${base}/setup`,
      match: (p) => p.startsWith(`${base}/setup`),
    },
  ];

  const settings: NavItem[] = [
    {
      id: "general",
      label: "General",
      href: `${base}/settings/general`,
      match: (p) => p.startsWith(`${base}/settings/general`),
    },
    {
      id: "supabase",
      label: "Supabase",
      href: `${base}/settings/supabase`,
      match: (p) => p.startsWith(`${base}/settings/supabase`),
    },
    {
      id: "sharing",
      label: "Sharing",
      href: `${base}/settings/sharing`,
      match: (p) => p.startsWith(`${base}/settings/sharing`),
    },
  ];

  const groups = [
    { title: "Analytics", items: analytics },
    { title: "Setup", items: setup },
    { title: "Settings", items: settings },
  ];

  return (
    <aside className="w-full shrink-0 lg:w-52">
      <div className="mb-5 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <Link
          href="/app"
          className="text-xs text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          ← Websites
        </Link>
        <h1 className="mt-2 text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {site.name}
        </h1>
        <p className="mt-0.5 truncate text-xs text-zinc-500">{site.domain}</p>
      </div>

      <nav className="hidden space-y-6 lg:block">
        {groups.map((g) => (
          <NavGroup
            key={g.title}
            title={g.title}
            items={g.items}
            pathname={pathname}
          />
        ))}
      </nav>

      <nav className="flex gap-1 overflow-x-auto pb-1 lg:hidden">
        {groups.flatMap((g) => g.items).map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
