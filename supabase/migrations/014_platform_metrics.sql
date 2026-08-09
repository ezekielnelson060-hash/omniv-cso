-- Platform OAuth tokens + metric snapshots (DSP hardening)
alter table public.profiles
  add column if not exists platform_connections jsonb default '{}'::jsonb;

comment on column public.profiles.platform_connections is
  'OAuth connection metadata per platform: { spotify: { connected_at, expires_at, refresh_token?, scope, external_id } }. Tokens are server-only.';

create table if not exists public.platform_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null,
  entity_type text not null default 'track',
  entity_id text not null,
  entity_url text,
  title text,
  popularity int,
  followers int,
  extra jsonb default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  unique (user_id, platform, entity_type, entity_id)
);

create index if not exists platform_metrics_user_idx
  on public.platform_metrics (user_id, fetched_at desc);

alter table public.platform_metrics enable row level security;

drop policy if exists "platform_metrics_own" on public.platform_metrics;
create policy "platform_metrics_own" on public.platform_metrics
  for select using (auth.uid() = user_id);

-- service role writes; users read own rows only
