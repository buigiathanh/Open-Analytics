import Link from "next/link";

export function LivePill({
  siteId,
  count,
}: {
  siteId: string;
  count: number;
}) {
  return (
    <Link
      href={`/app/${siteId}/realtime`}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-800 shadow-lg transition hover:border-emerald-300 hover:shadow-xl dark:border-emerald-900 dark:bg-zinc-950 dark:text-emerald-300"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      {count} visitor{count !== 1 ? "s" : ""} online
    </Link>
  );
}
