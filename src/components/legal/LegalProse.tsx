import type { ReactNode } from "react";

export function LegalProse({ children }: { children: ReactNode }) {
  return (
    <article
      className={[
        "legal-prose max-w-none overflow-x-auto text-sm leading-relaxed text-muted-foreground",
        "[&_h2]:mt-8 [&_h2]:mb-2.5 [&_h2]:border-b [&_h2]:border-zinc-200 [&_h2]:pb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:dark:border-zinc-800",
        "[&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground",
        "[&_p]:mb-3 [&_p]:leading-relaxed",
        "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-4",
        "[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-4",
        "[&_li]:leading-relaxed",
        "[&_a]:font-medium [&_a]:text-emerald-600 [&_a]:underline-offset-2 hover:[&_a]:underline dark:[&_a]:text-emerald-400",
        "[&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-foreground dark:[&_code]:bg-zinc-800",
        "[&_table]:mb-3 [&_table]:w-full [&_table]:min-w-[480px] [&_table]:text-sm",
        "[&_th]:border-b [&_th]:border-zinc-200 [&_th]:bg-zinc-50 [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground dark:[&_th]:border-zinc-700 dark:[&_th]:bg-zinc-900",
        "[&_td]:border-b [&_td]:border-zinc-100 [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:align-top dark:[&_td]:border-zinc-800",
        "[&_blockquote]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500 [&_blockquote]:bg-emerald-50/40 [&_blockquote]:py-2 [&_blockquote]:pl-3 [&_blockquote]:text-sm dark:[&_blockquote]:bg-emerald-950/25",
        "[&_hr]:my-6 [&_hr]:border-zinc-200 dark:[&_hr]:border-zinc-800",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
      ].join(" ")}
    >
      {children}
    </article>
  );
}

export function LegalLead({ children }: { children: ReactNode }) {
  return (
    <p className="mb-0 text-base leading-relaxed text-muted-foreground">{children}</p>
  );
}
