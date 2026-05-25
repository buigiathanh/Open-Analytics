"use client";

import { useState } from "react";

interface SqlCopyBlockProps {
  label: string;
  sql: string;
  className?: string;
}

export function SqlCopyBlock({ label, sql, className = "" }: SqlCopyBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-40 overflow-auto rounded-lg border border-zinc-200 bg-zinc-900 p-2.5 text-[10px] leading-relaxed text-zinc-100 dark:border-zinc-700">
        {sql}
      </pre>
    </div>
  );
}
