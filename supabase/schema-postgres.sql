-- Open Analytics — PostgreSQL (unified app + analytics database)
-- Run once, then set POSTGRES_URL in .env.
-- Auth stays on Supabase; user_id matches Supabase auth.users.id (uuid).

create extension if not exists pgcrypto;

-- Registered websites
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null,
  site_key text not null unique default encode(gen_random_bytes(12), 'hex'),
  api_key text not null unique default encode(gen_random_bytes(24), 'hex'),
  share_realtime_enabled boolean not null default false,
  user_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_created_at_idx
  on public.projects (user_id, created_at desc);

-- Analytics events (centralized — no per-site Supabase)
create table if not exists public.events (
  id bigint generated always as identity primary key,
  site_key text not null,
  visitor_id text not null,
  session_id text not null,
  visit_id text,
  event_type smallint not null default 1,
  path text,
  page_title text,
  hostname text,
  url_query text,
  referrer text,
  source text,
  device smallint default 0,
  platform smallint default 0,
  browser smallint default 0,
  country_code char(2),
  latitude double precision,
  longitude double precision,
  duration_ms integer,
  language text,
  screen text,
  distinct_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  gclid text,
  fbclid text,
  msclkid text,
  event_name text,
  created_at timestamptz not null default now()
);

create index if not exists events_site_key_created_at_idx
  on public.events (site_key, created_at desc);

create index if not exists events_site_key_session_idx
  on public.events (site_key, session_id);

create index if not exists events_site_key_visitor_idx
  on public.events (site_key, visitor_id);

create index if not exists events_site_key_visit_idx
  on public.events (site_key, visit_id);

-- Bot / crawler visits (separate from human analytics events)
create table if not exists public.bot_visits (
  id bigint generated always as identity primary key,
  site_key text not null,
  bot_id text not null default 'other',
  user_agent text not null,
  path text,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists bot_visits_site_key_created_at_idx
  on public.bot_visits (site_key, created_at desc);

create index if not exists bot_visits_site_key_bot_id_idx
  on public.bot_visits (site_key, bot_id, created_at desc);

alter table public.bot_visits add column if not exists bot_id text not null default 'other';

alter table public.bot_visits drop column if exists page_title;
alter table public.bot_visits drop column if exists hostname;
alter table public.bot_visits drop column if exists url_query;
alter table public.bot_visits drop column if exists referrer;

alter table public.bot_visits add column if not exists ip text;

-- Migration: move bot rows out of events into bot_visits (if upgrading)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'is_bot'
  ) then
    insert into public.bot_visits (site_key, bot_id, user_agent, path, created_at)
    select site_key, 'other', coalesce(user_agent, ''), path, created_at
    from public.events
    where is_bot = true;

    delete from public.events where is_bot = true;

    alter table public.events drop column is_bot;
    alter table public.events drop column user_agent;
  end if;
end $$;

drop index if exists events_site_key_bot_created_at_idx;

-- Google Search Console OAuth
create table if not exists public.google_search_console_connections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,
  user_id uuid not null,
  google_email text,
  access_token text not null,
  refresh_token text not null,
  access_token_expires_at timestamptz not null,
  site_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists google_search_console_connections_user_id_idx
  on public.google_search_console_connections (user_id);

-- Saved URLs for Search Console link management
create table if not exists public.gsc_managed_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  url text not null,
  inspection jsonb,
  last_inspected_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id, url)
);

create index if not exists gsc_managed_links_project_id_created_at_idx
  on public.gsc_managed_links (project_id, created_at desc);

-- Migration: drop Supabase columns if upgrading from schema-app.sql
alter table public.projects drop column if exists supabase_project_id;
alter table public.projects drop column if exists supabase_url;
alter table public.projects drop column if exists supabase_anon_key;

-- Migration: separate api_key from site_key (bot ingest auth)
alter table public.projects add column if not exists api_key text;

update public.projects
set api_key = encode(gen_random_bytes(24), 'hex')
where api_key is null;

alter table public.projects alter column api_key set default encode(gen_random_bytes(24), 'hex');
alter table public.projects alter column api_key set not null;

create unique index if not exists projects_api_key_idx on public.projects (api_key);
