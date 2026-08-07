-- Artist payout destination + Ziki tasks

alter table public.profiles
  add column if not exists payout_subaccount_id text,
  add column if not exists payout_method text,
  add column if not exists payout_notes text,
  add column if not exists tip_display_name text;

create index if not exists gatherings_user_idx2 on public.gatherings (user_id);

comment on column public.profiles.payout_subaccount_id is
  'Flutterwave subaccount ID (RS_...) so ticket/tip split lands with the artist';

create table if not exists public.manager_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  due_date date,
  done boolean default false,
  source text default 'manual',
  created_at timestamptz default now()
);
alter table public.manager_tasks enable row level security;
drop policy if exists "tasks_own" on public.manager_tasks;
create policy "tasks_own" on public.manager_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
