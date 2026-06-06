"use client";

import { useEffect, useState } from "react";
import { TrackingScriptSetup } from "./TrackingScriptSetup";

interface AddWebsiteModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2;

type CreatedProject = {
  id: string;
  site_key: string;
  name: string;
  domain: string;
};

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Website details" },
  { id: 2, label: "Tracking script" },
];

export function AddWebsiteModal({ open, onClose }: AddWebsiteModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<CreatedProject | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step === 1) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, step]);

  useEffect(() => {
    if (open) return;
    setStep(1);
    setName("");
    setDomain("");
    setError(null);
    setLoading(false);
    setCreated(null);
  }, [open]);

  if (!open) return null;

  async function handleCreate() {
    setError(null);
    if (!name.trim() || !domain.trim()) {
      setError("Fill in website name and domain.");
      return;
    }

    setLoading(true);
    try {
      const createRes = await fetch("/api/sites", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain }),
      });
      const createData = await createRes.json();
      if (createRes.status === 401) {
        setError("Please sign in to add a website.");
        return;
      }
      if (!createRes.ok) {
        setError(createData.error ?? "Could not save website.");
        return;
      }

      setCreated({
        id: createData.id,
        site_key: createData.site_key,
        name: createData.name ?? name,
        domain: createData.domain ?? domain,
      });
      setStep(2);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-website-title"
    >
      {step === 1 ? (
        <button
          type="button"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-label="Close"
          onClick={onClose}
        />
      ) : (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
      )}
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h2
            id="add-website-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Add website
          </h2>
          {step === 1 && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        <nav
          className="flex border-b border-zinc-100 px-5 py-3 dark:border-zinc-800"
          aria-label="Setup steps"
        >
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`flex flex-1 items-center gap-2 text-xs ${
                step >= s.id
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-zinc-400"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  step >= s.id
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {s.id}
              </span>
              <span className="font-medium">{s.label}</span>
              {i < STEPS.length - 1 && (
                <span className="mx-1 h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              )}
            </div>
          ))}
        </nav>

        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto p-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Website name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Blog"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Domain
                </label>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </div>
          )}

          {step === 2 && created && (
            <TrackingScriptSetup site={created} showDashboardLink />
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}
        </div>

        {step === 1 && (
          <div className="flex gap-2 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create website"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
