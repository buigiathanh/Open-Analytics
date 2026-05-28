-- Open Analytics — App Supabase (management dashboard)
-- Run once on a new project, then set NEXT_PUBLIC_SUPABASE_URL + keys in .env.

-- Registered websites (site_key is unique, auto-generated)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null,
  site_key text not null unique default encode(gen_random_bytes(12), 'hex'),
  supabase_project_id text,
  supabase_url text,
  supabase_anon_key text,
  share_realtime_enabled boolean not null default false,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index projects_user_id_created_at_idx
  on public.projects (user_id, created_at desc);

-- OAuth profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'user_name'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    provider = excluded.provider,
    updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.projects enable row level security;

create policy "projects_select_own"
  on public.projects for select to authenticated
  using (user_id = auth.uid());

create policy "projects_insert_own"
  on public.projects for insert to authenticated
  with check (user_id = auth.uid());

create policy "projects_update_own"
  on public.projects for update to authenticated
  using (user_id = auth.uid());

create policy "projects_delete_own"
  on public.projects for delete to authenticated
  using (user_id = auth.uid());

-- Google Search Console OAuth (server-only via service role; see migrations/)
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
