-- Run on existing app Supabase projects (already deployed before share links).
alter table public.projects
  add column if not exists share_realtime_enabled boolean not null default false;
