"use client";

import { useState } from "react";
import type { Site } from "@/lib/types";

interface EmbedSnippetProps {
  site: Site;
}

export function EmbedSnippet({ site }: EmbedSnippetProps) {
  const [copied, setCopied] = useState(false);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const supabaseUrl =
    site.supabase_url ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "YOUR_SUPABASE_URL";
  const supabaseKey =
    site.supabase_anon_key ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "YOUR_SUPABASE_ANON_KEY";

  const snippet = `<!-- Open Analytics -->
<script
  src="${appUrl}/tracker.js"
  data-site-key="${site.site_key}"
  data-supabase-url="${supabaseUrl}"
  data-supabase-key="${supabaseKey}"
  data-geo-url="${appUrl}/api/geo"
></script>`;

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tracking embed code
        </h3>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed dark:border-zinc-700 dark:bg-zinc-900">
        {snippet}
      </pre>
      <p className="text-xs text-zinc-500">
        Site key:{" "}
        <code className="text-zinc-700 dark:text-zinc-300">{site.site_key}</code>
      </p>
    </div>
  );
}
