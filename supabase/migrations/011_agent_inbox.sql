-- Daily agent proposals stored on profile (server cron writes, client reads)
alter table public.profiles
  add column if not exists agent_inbox jsonb default null,
  add column if not exists agent_scanned_at timestamptz default null;

comment on column public.profiles.agent_inbox is 'Latest Omniv agent scan: narrative + proposals';
comment on column public.profiles.agent_scanned_at is 'Last autonomous agent scan time';
