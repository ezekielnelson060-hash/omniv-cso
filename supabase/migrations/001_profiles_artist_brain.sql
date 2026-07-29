-- Omniv: profiles + artist_brain
-- Run in Supabase → SQL Editor → New query → Run

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text check (role in ('artist', 'manager', 'label')) default 'artist',
  platforms text[] default '{}',
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.artist_brains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade unique,
  name text not null default '',
  stage_name text,
  genre text[] default '{}',
  sub_genre text[] default '{}',
  music_style text default '',
  brand_voice text default '',
  visual_identity text default '',
  target_audience text default '',
  career_stage text default 'emerging',
  strengths text[] default '{}',
  weaknesses text[] default '{}',
  goals text[] default '{}',
  past_releases jsonb default '[]'::jsonb,
  content_style text default '',
  competitors text[] default '{}',
  notes text default '',
  last_updated date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists artist_brains_user_id_idx on public.artist_brains (user_id);

alter table public.profiles enable row level security;
alter table public.artist_brains enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "brain_select_own" on public.artist_brains;
create policy "brain_select_own" on public.artist_brains
  for select using (auth.uid() = user_id);

drop policy if exists "brain_insert_own" on public.artist_brains;
create policy "brain_insert_own" on public.artist_brains
  for insert with check (auth.uid() = user_id);

drop policy if exists "brain_update_own" on public.artist_brains;
create policy "brain_update_own" on public.artist_brains
  for update using (auth.uid() = user_id);

drop policy if exists "brain_delete_own" on public.artist_brains;
create policy "brain_delete_own" on public.artist_brains
  for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
