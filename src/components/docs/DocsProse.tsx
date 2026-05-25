import type { ReactNode } from "react";

export function DocsProse({ children }: { children: ReactNode }) {
  return (
    <article className="docs-prose max-w-none text-zinc-700 dark:text-zinc-300 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-zinc-900 [&_h1]:dark:text-zinc-100 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-zinc-200 [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h2]:dark:border-zinc-800 [&_h2]:dark:text-zinc-100 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-800 [&_h3]:dark:text-zinc-200 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_li]:leading-relaxed [&_a]:font-medium [&_a]:text-emerald-600 [&_a]:underline-offset-2 [&_a]:hover:underline [&_a]:dark:text-emerald-400 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-zinc-800 [&_code]:dark:bg-zinc-800 [&_code]:dark:text-zinc-200 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-zinc-200 [&_pre]:bg-zinc-50 [&_pre]:p-4 [&_pre]:text-xs [&_pre]:leading-relaxed [&_pre]:dark:border-zinc-700 [&_pre]:dark:bg-zinc-900 [&_table]:mb-4 [&_table]:w-full [&_table]:text-sm [&_th]:border-b [&_th]:border-zinc-200 [&_th]:bg-zinc-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:dark:border-zinc-700 [&_th]:dark:bg-zinc-900 [&_td]:border-b [&_td]:border-zinc-100 [&_td]:px-3 [&_td]:py-2 [&_td]:dark:border-zinc-800 [&_blockquote]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-500 [&_blockquote]:bg-emerald-50/50 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:text-sm [&_blockquote]:dark:bg-emerald-950/30 [&_hr]:my-8 [&_hr]:border-zinc-200 [&_hr]:dark:border-zinc-800">
      {children}
    </article>
  );
}

export function DocsLead({ children }: { children: ReactNode }) {
  return (
    <p className="mb-8 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
      {children}
    </p>
  );
}
