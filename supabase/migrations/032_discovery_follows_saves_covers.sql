-- Omniv discovery: follows, saves, publication covers
-- Run in Supabase SQL editor if not auto-applied.

-- Follows (explorer → publisher entity by type+slug)
create table if not exists public.discovery_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_slug text not null,
  target_name text not null default '',
  target_id text,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_slug)
);

create index if not exists discovery_follows_user_idx
  on public.discovery_follows (user_id, created_at desc);

alter table public.discovery_follows enable row level security;

drop policy if exists "discovery_follows_select_own" on public.discovery_follows;
create policy "discovery_follows_select_own"
  on public.discovery_follows for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "discovery_follows_insert_own" on public.discovery_follows;
create policy "discovery_follows_insert_own"
  on public.discovery_follows for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "discovery_follows_delete_own" on public.discovery_follows;
create policy "discovery_follows_delete_own"
  on public.discovery_follows for delete
  to authenticated
  using (auth.uid() = user_id);

-- Saves (publications or entities)
create table if not exists public.discovery_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('entity', 'publication')),
  target_type text not null,
  target_slug text not null,
  target_name text not null default '',
  pub_type text,
  created_at timestamptz not null default now(),
  unique (user_id, kind, target_type, target_slug)
);

create index if not exists discovery_saves_user_idx
  on public.discovery_saves (user_id, created_at desc);

alter table public.discovery_saves enable row level security;

drop policy if exists "discovery_saves_select_own" on public.discovery_saves;
create policy "discovery_saves_select_own"
  on public.discovery_saves for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "discovery_saves_insert_own" on public.discovery_saves;
create policy "discovery_saves_insert_own"
  on public.discovery_saves for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "discovery_saves_delete_own" on public.discovery_saves;
create policy "discovery_saves_delete_own"
  on public.discovery_saves for delete
  to authenticated
  using (auth.uid() = user_id);

-- Cover URL on publications (if table exists)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'discovery_publications'
  ) then
    alter table public.discovery_publications
      add column if not exists cover_url text;
  end if;
end $$;

-- Storage bucket for discovery covers (public read)
insert into storage.buckets (id, name, public)
values ('discovery-covers', 'discovery-covers', true)
on conflict (id) do nothing;

drop policy if exists "discovery_covers_public_read" on storage.objects;
create policy "discovery_covers_public_read"
  on storage.objects for select
  using (bucket_id = 'discovery-covers');

drop policy if exists "discovery_covers_auth_upload" on storage.objects;
create policy "discovery_covers_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'discovery-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "discovery_covers_auth_update" on storage.objects;
create policy "discovery_covers_auth_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'discovery-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "discovery_covers_auth_delete" on storage.objects;
create policy "discovery_covers_auth_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'discovery-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
