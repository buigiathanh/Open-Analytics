-- Pending bot-tracking verification tokens (shared across server workers)
create table if not exists public.bot_verify_challenges (
  site_key text primary key,
  token text not null,
  expires_at timestamptz not null,
  completed_at timestamptz
);

create index if not exists bot_verify_challenges_expires_at_idx
  on public.bot_verify_challenges (expires_at);
