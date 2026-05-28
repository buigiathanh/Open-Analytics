"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Site } from "@/lib/types";
import { SiteSettingsSection } from "./SiteSettingsSection";

function projectIdFromSite(site: Site): string {
  return site.supabase_project_id ?? site.supabase_url ?? "";
}

export function SiteSupabaseSettings({ site }: { site: Site }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projectIdFromSite(site));
  const [publicKey, setPublicKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setError(null);

    if (!projectId.trim()) {
      setError("Supabase project ID is required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/sites/${site.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: site.name,
          domain: site.domain,
          supabaseProjectId: projectId,
          supabaseAnonKey: publicKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save settings.");
        return;
      }

      setPublicKey("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteSettingsSection
      title="Supabase"
      description="Your analytics project URL and publishable key for event storage."
    >
      <div className="max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Supabase project ID
          </label>
          <input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Reference ID or https://xxx.supabase.co"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Supabase publishable key
          </label>
          <input
            type="password"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="Leave blank to keep current key"
            autoComplete="off"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </SiteSettingsSection>
  );
}
