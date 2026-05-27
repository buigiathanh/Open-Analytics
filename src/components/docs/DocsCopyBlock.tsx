"use client";

import { useState } from "react";

interface DocsCopyBlockProps {
  code: string;
}

export function DocsCopyBlock({ code }: DocsCopyBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="not-prose mb-4">
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mb-0 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed dark:border-zinc-700 dark:bg-zinc-900">
        {code}
      </pre>
    </div>
  );
}
