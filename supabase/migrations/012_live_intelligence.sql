-- Live layer room modes + intelligence layer hooks
alter table public.gatherings
  add column if not exists room_type text not null default 'standard'
    check (room_type in ('standard', 'drop_party', 'co_dj', 'a_r')),
  add column if not exists base_price_cents int default null,
  add column if not exists price_floor_cents int default null,
  add column if not exists price_ceiling_cents int default null,
  add column if not exists demand_score numeric default 0,
  add column if not exists host_notes text default null;

comment on column public.gatherings.room_type is 'standard | drop_party | co_dj | a_r (Live A&R)';
comment on column public.gatherings.demand_score is '0-100 velocity signal for dynamic pricing';

create table if not exists public.press_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  opportunity text,
  body_md text not null,
  created_at timestamptz default now()
);

create index if not exists press_kits_user_idx on public.press_kits (user_id);
alter table public.press_kits enable row level security;
drop policy if exists "press_kits_own" on public.press_kits;
create policy "press_kits_own" on public.press_kits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
