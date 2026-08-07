-- Fan gate extras, gatherings, profile avatar

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.fans
  add column if not exists would_attend boolean default false,
  add column if not exists neighbourhood text;

create table if not exists public.gatherings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  roster_artist_id uuid references public.roster_artists (id) on delete set null,
  title text not null,
  city text,
  venue text,
  starts_at timestamptz,
  capacity int default 20,
  ticket_price_cents int default 0,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'sold_out', 'done', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

create index if not exists gatherings_user_idx on public.gatherings (user_id);

create table if not exists public.gathering_rsvps (
  id uuid primary key default gen_random_uuid(),
  gathering_id uuid not null references public.gatherings (id) on delete cascade,
  fan_id uuid references public.fans (id) on delete set null,
  email text not null,
  status text not null default 'going'
    check (status in ('going', 'maybe', 'checked_in', 'no_show')),
  created_at timestamptz default now(),
  unique (gathering_id, email)
);

alter table public.gatherings enable row level security;
alter table public.gathering_rsvps enable row level security;

drop policy if exists "gatherings_own" on public.gatherings;
create policy "gatherings_own" on public.gatherings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "gathering_rsvps_own" on public.gathering_rsvps;
create policy "gathering_rsvps_own" on public.gathering_rsvps
  for all using (
    exists (
      select 1 from public.gatherings g
      where g.id = gathering_id and g.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.gatherings g
      where g.id = gathering_id and g.user_id = auth.uid()
    )
  );
