-- Google Search Console OAuth tokens (server-only via service role)
create table public.google_search_console_connections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  google_email text,
  access_token text not null,
  refresh_token text not null,
  access_token_expires_at timestamptz not null,
  site_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index google_search_console_connections_user_id_idx
  on public.google_search_console_connections (user_id);

alter table public.google_search_console_connections enable row level security;

-- No policies: only service role reads/writes tokens from API routes.
