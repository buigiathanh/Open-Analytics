import type { GlobeVisitor } from "@/lib/visitor-globe-data";

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function VisitorMapName({
  visitor,
  className,
  nameClassName,
  badgeClassName,
}: {
  visitor: GlobeVisitor;
  className?: string;
  nameClassName?: string;
  badgeClassName?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-1", className)}>
      <span className={cn("truncate", nameClassName)}>{visitor.displayName}</span>
      {visitor.isBot ? (
        <span
          className={cn(
            "shrink-0 rounded bg-violet-500/15 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300",
            badgeClassName
          )}
        >
          Bot
        </span>
      ) : null}
    </span>
  );
}
