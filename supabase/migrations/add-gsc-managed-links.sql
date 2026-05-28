-- Saved URLs for Search Console link management (server-only via service role)
create table public.gsc_managed_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  url text not null,
  inspection jsonb,
  last_inspected_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id, url)
);

create index gsc_managed_links_project_id_created_at_idx
  on public.gsc_managed_links (project_id, created_at desc);

alter table public.gsc_managed_links enable row level security;
