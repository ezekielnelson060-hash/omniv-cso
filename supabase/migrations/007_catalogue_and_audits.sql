-- Omniv catalogue + public relevance audits
-- Run in Supabase SQL Editor after prior migrations

create table if not exists public.catalogue_releases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  roster_artist_id uuid references public.roster_artists (id) on delete set null,
  title text not null,
  release_type text not null default 'single'
    check (release_type in ('single', 'ep', 'album', 'mixtape', 'live', 'other')),
  status text not null default 'draft'
    check (status in ('idea', 'draft', 'scheduled', 'released', 'archived')),
  release_date date,
  upc text,
  primary_genre text,
  cover_url text,
  spotify_url text,
  apple_url text,
  youtube_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists catalogue_releases_user_idx on public.catalogue_releases (user_id);
create index if not exists catalogue_releases_roster_idx on public.catalogue_releases (roster_artist_id);

create table if not exists public.catalogue_tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  release_id uuid references public.catalogue_releases (id) on delete cascade,
  title text not null,
  track_number int,
  isrc text,
  duration_sec int,
  explicit boolean default false,
  spotify_url text,
  youtube_url text,
  audio_path text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists catalogue_tracks_user_idx on public.catalogue_tracks (user_id);
create index if not exists catalogue_tracks_release_idx on public.catalogue_tracks (release_id);

create table if not exists public.catalogue_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  release_id uuid references public.catalogue_releases (id) on delete set null,
  track_id uuid references public.catalogue_tracks (id) on delete set null,
  kind text not null default 'other'
    check (kind in ('cover', 'audio', 'video', 'stem', 'press', 'other')),
  title text,
  storage_path text,
  public_url text,
  mime_type text,
  created_at timestamptz default now()
);

create index if not exists catalogue_assets_user_idx on public.catalogue_assets (user_id);

create table if not exists public.public_audits (
  id uuid primary key default gen_random_uuid(),
  share_slug text not null unique,
  source_url text not null,
  source_type text not null check (source_type in ('spotify', 'youtube', 'unknown')),
  artist_name text,
  headline text,
  overall_score int not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists public_audits_slug_idx on public.public_audits (share_slug);

alter table public.catalogue_releases enable row level security;
alter table public.catalogue_tracks enable row level security;
alter table public.catalogue_assets enable row level security;
alter table public.public_audits enable row level security;

drop policy if exists "catalogue_releases_own" on public.catalogue_releases;
create policy "catalogue_releases_own" on public.catalogue_releases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "catalogue_tracks_own" on public.catalogue_tracks;
create policy "catalogue_tracks_own" on public.catalogue_tracks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "catalogue_assets_own" on public.catalogue_assets;
create policy "catalogue_assets_own" on public.catalogue_assets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "public_audits_read" on public.public_audits;
create policy "public_audits_read" on public.public_audits
  for select using (true);

drop policy if exists "public_audits_insert" on public.public_audits;
create policy "public_audits_insert" on public.public_audits
  for insert with check (true);
