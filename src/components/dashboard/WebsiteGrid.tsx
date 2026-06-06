"use client";

import { useState } from "react";
import type { ProjectCardData } from "./ProjectCard";
import { ProjectCard } from "./ProjectCard";
import { AddWebsiteModal } from "./AddWebsiteModal";

function AddProjectCard({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/80 p-5 text-zinc-500 transition hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900/30 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400"
    >
      <span className="flex size-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-2xl font-light text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
        +
      </span>
      <span className="mt-3 text-sm font-medium">Add website</span>
    </button>
  );
}

export function WebsiteGrid({
  projects,
  canAdd,
}: {
  projects: ProjectCardData[];
  canAdd: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AddProjectCard
          onClick={() => setModalOpen(true)}
          disabled={!canAdd}
        />
        {projects.map((project) => (
          <ProjectCard key={project.site.id} data={project} />
        ))}
      </div>

      {!canAdd && (
        <p className="mt-4 text-sm text-zinc-500">
          Configure Supabase and PostgreSQL in <code className="text-xs">.env</code>{" "}
          to add websites.
        </p>
      )}

      <AddWebsiteModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
