-- Omniv discovery publications (what gets published into the network)
-- Run in Supabase SQL editor.

create table if not exists public.discovery_publications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  publisher_id uuid references public.discovery_entities(id) on delete set null,
  publisher_name text not null default '',
  type text not null check (type in (
    'article', 'music', 'video', 'research', 'product',
    'event', 'announcement', 'opportunity', 'file'
  )),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body text,
  tags text[] not null default '{}',
  meta text,
  cover_url text,
  heat int not null default 10,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists discovery_publications_type_idx
  on public.discovery_publications (type);
create index if not exists discovery_publications_heat_idx
  on public.discovery_publications (heat desc);
create index if not exists discovery_publications_published_idx
  on public.discovery_publications (published_at desc);
create index if not exists discovery_publications_owner_idx
  on public.discovery_publications (owner_id);
create index if not exists discovery_publications_publisher_idx
  on public.discovery_publications (publisher_id);

alter table public.discovery_publications enable row level security;

drop policy if exists "discovery_publications_public_read" on public.discovery_publications;
create policy "discovery_publications_public_read"
  on public.discovery_publications for select
  using (true);

drop policy if exists "discovery_publications_insert_own" on public.discovery_publications;
create policy "discovery_publications_insert_own"
  on public.discovery_publications for insert
  to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "discovery_publications_update_own" on public.discovery_publications;
create policy "discovery_publications_update_own"
  on public.discovery_publications for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "discovery_publications_delete_own" on public.discovery_publications;
create policy "discovery_publications_delete_own"
  on public.discovery_publications for delete
  to authenticated
  using (auth.uid() = owner_id);
