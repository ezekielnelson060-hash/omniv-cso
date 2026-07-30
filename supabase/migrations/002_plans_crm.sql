-- Run in Supabase SQL Editor after 001

alter table public.profiles
  add column if not exists plan text default 'free'
    check (plan in ('free', 'starter', 'pro', 'label')),
  add column if not exists plan_status text default 'none',
  add column if not exists flw_tx_ref text,
  add column if not exists label_name text;

create table if not exists public.managed_artists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  genre text default '',
  stage text default 'emerging',
  monthly_listeners int default 0,
  score int default 40,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.manager_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  artist_id uuid references public.managed_artists (id) on delete set null,
  title text not null,
  done boolean default false,
  due_date date,
  priority text default 'medium',
  created_at timestamptz default now()
);

create table if not exists public.manager_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  artist_id uuid references public.managed_artists (id) on delete set null,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.manager_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  event_date date not null,
  done boolean default false,
  created_at timestamptz default now()
);

alter table public.managed_artists enable row level security;
alter table public.manager_tasks enable row level security;
alter table public.manager_notes enable row level security;
alter table public.manager_events enable row level security;

drop policy if exists "ma_all_own" on public.managed_artists;
create policy "ma_all_own" on public.managed_artists for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "mt_all_own" on public.manager_tasks;
create policy "mt_all_own" on public.manager_tasks for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "mn_all_own" on public.manager_notes;
create policy "mn_all_own" on public.manager_notes for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "me_all_own" on public.manager_events;
create policy "me_all_own" on public.manager_events for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
