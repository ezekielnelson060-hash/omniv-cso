-- Product usage events for soft-launch analytics
create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  path text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_events_name_idx on public.app_events (name);
create index if not exists app_events_created_idx on public.app_events (created_at desc);
create index if not exists app_events_user_idx on public.app_events (user_id);

alter table public.app_events enable row level security;

drop policy if exists "events_insert_own" on public.app_events;
create policy "events_insert_own" on public.app_events
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists "events_select_own" on public.app_events;
create policy "events_select_own" on public.app_events
  for select using (auth.uid() = user_id);

-- Service role bypasses RLS for server-side track (fan gate, webhook)
