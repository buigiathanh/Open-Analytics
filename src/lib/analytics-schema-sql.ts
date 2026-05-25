/** Keep in sync with supabase/schema-analytics.sql (new project — run once) */

export const ANALYTICS_SCHEMA_TABLES_SQL = `create table public.events (
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
);`;

export const ANALYTICS_SCHEMA_EVENTS_SQL = `create index events_site_key_created_at_idx
  on public.events (site_key, created_at desc);

create index events_site_key_session_idx
  on public.events (site_key, session_id);

create index events_site_key_visitor_idx
  on public.events (site_key, visitor_id);

create index events_site_key_visit_idx
  on public.events (site_key, visit_id);

alter table public.events enable row level security;

create policy "events_insert_anon"
  on public.events for insert to anon
  with check (true);

create policy "events_select_anon"
  on public.events for select to anon
  using (true);`;

export const ANALYTICS_SCHEMA_FULL_SQL = `${ANALYTICS_SCHEMA_TABLES_SQL}

${ANALYTICS_SCHEMA_EVENTS_SQL}`;
