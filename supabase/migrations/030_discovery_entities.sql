-- Omniv discovery network entities (Phase 1 publish)
-- Run in Supabase SQL editor if migrations are not auto-applied.

create table if not exists public.discovery_entities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  type text not null check (type in (
    'person', 'company', 'brand', 'product', 'project', 'event', 'opportunity'
  )),
  slug text not null,
  name text not null,
  tagline text not null default '',
  location text,
  about text not null default '',
  intents jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  links jsonb not null default '[]'::jsonb,
  heat int not null default 0,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, slug)
);

create index if not exists discovery_entities_type_idx on public.discovery_entities (type);
create index if not exists discovery_entities_heat_idx on public.discovery_entities (heat desc);
create index if not exists discovery_entities_published_idx on public.discovery_entities (published_at desc);

alter table public.discovery_entities enable row level security;

-- Public read
drop policy if exists "discovery_entities_public_read" on public.discovery_entities;
create policy "discovery_entities_public_read"
  on public.discovery_entities for select
  using (true);

-- Authenticated insert own
drop policy if exists "discovery_entities_insert_own" on public.discovery_entities;
create policy "discovery_entities_insert_own"
  on public.discovery_entities for insert
  to authenticated
  with check (auth.uid() = owner_id);

-- Owner update/delete
drop policy if exists "discovery_entities_update_own" on public.discovery_entities;
create policy "discovery_entities_update_own"
  on public.discovery_entities for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "discovery_entities_delete_own" on public.discovery_entities;
create policy "discovery_entities_delete_own"
  on public.discovery_entities for delete
  to authenticated
  using (auth.uid() = owner_id);
