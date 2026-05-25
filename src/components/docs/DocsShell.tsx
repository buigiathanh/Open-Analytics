"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_NAV } from "@/lib/docs-nav";
import { STATS_CONTAINER_CLASS } from "@/lib/layout";
import { Header } from "@/components/Header";

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Header containerClass={STATS_CONTAINER_CLASS} />
      <div className={`${STATS_CONTAINER_CLASS} flex-1 py-8 lg:py-10`}>
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-white">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Documentation
          </span>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <aside className="lg:w-56 lg:shrink-0">
            <nav
              className="sticky top-6 space-y-1 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-950"
              aria-label="Documentation"
            >
              {DOCS_NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/docs" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-emerald-50 font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </>
  );
}
