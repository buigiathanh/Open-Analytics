import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Connected landing column — vertical rails + horizontal dividers between blocks. */
export const sleekBlockStackClass =
  "bg-white dark:bg-zinc-950";

export const sleekBlockCardClass =
  "overflow-hidden rounded-[1.75rem] border border-zinc-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_48px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-950";

export function SleekBlockStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(sleekBlockStackClass, className)}>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">{children}</div>
    </div>
  );
}

export function SleekBlockSection({
  id,
  children,
  className,
  embedded = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Inside SleekBlockStack — flush segment, dividers come from parent divide-y. */
  embedded?: boolean;
}) {
  if (embedded) {
    return (
      <section
        id={id}
        className={cn("bg-white dark:bg-zinc-950", className)}
      >
        {children}
      </section>
    );
  }

  return (
    <section id={id} className={className}>
      <div className={sleekBlockCardClass}>{children}</div>
    </section>
  );
}

export function SleekStackHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-zinc-200 px-6 py-10 text-center sm:px-10 sm:py-12 dark:border-zinc-800">
      <p className="inline-flex rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground dark:border-zinc-700">
        {eyebrow}
      </p>
      <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl sm:leading-[1.12]">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function SleekStackSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <SleekBlockSection id={id} embedded className={className}>
      <SleekStackHeader eyebrow={eyebrow} title={title} description={description} />
      {children}
    </SleekBlockSection>
  );
}

export function SleekSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  headerClassName,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className={cn("mx-auto max-w-2xl text-center", headerClassName)}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl sm:leading-[1.12]">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

export function SleekCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
    >
      {children}
    </div>
  );
}
