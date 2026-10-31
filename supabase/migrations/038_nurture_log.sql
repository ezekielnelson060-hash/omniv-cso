-- Track which nurture days were sent (avoid duplicates) + soft behavioural history

create table if not exists public.discovery_nurture_log (
  user_id uuid not null references auth.users (id) on delete cascade,
  day int not null,
  sent_at timestamptz not null default now(),
  skipped boolean not null default false,
  skip_reason text,
  primary key (user_id, day)
);

create index if not exists idx_nurture_log_sent
  on public.discovery_nurture_log (sent_at desc);

alter table public.discovery_nurture_log enable row level security;

-- Service role only for writes; no public access needed
