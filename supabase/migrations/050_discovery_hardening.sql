-- Omniv discovery hardening (2026-10-09)
-- Run in Supabase SQL editor if migrations are not auto-applied.

-- 1) Ensure visibility + status + media columns exist
alter table public.discovery_publications
  add column if not exists visibility text not null default 'public';
alter table public.discovery_publications
  add column if not exists status text not null default 'published';
alter table public.discovery_publications
  add column if not exists media_url text;

-- 1b) Expand status check to allow scheduled (drop any existing check on status)
do $fix$
declare
  cname text;
begin
  for cname in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'discovery_publications'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%status%'
  loop
    execute format('alter table public.discovery_publications drop constraint if exists %I', cname);
  end loop;
end
$fix$;

alter table public.discovery_publications
  add constraint discovery_publications_status_check
  check (status in ('draft', 'published', 'archived', 'scheduled'));

-- 2) Private publications: public can only read public+published/scheduled (or own)
alter table public.discovery_publications enable row level security;

drop policy if exists "discovery_publications_public_read" on public.discovery_publications;
create policy "discovery_publications_public_read"
  on public.discovery_publications for select
  using (
    auth.uid() = owner_id
    or (
      coalesce(visibility, 'public') = 'public'
      and coalesce(status, 'published') in ('published', 'scheduled')
    )
  );

-- 3) Entity media columns
alter table public.discovery_entities
  add column if not exists avatar_url text;
alter table public.discovery_entities
  add column if not exists cover_url text;
alter table public.discovery_entities
  add column if not exists verified boolean not null default false;

-- 4) Sync denormalized publisher_name (owner or service_role only)
create or replace function public.sync_publisher_names_for_entity(p_entity_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $fn$
declare
  n text;
  owner uuid;
  updated int := 0;
begin
  select name, owner_id into n, owner
  from public.discovery_entities
  where id = p_entity_id;

  if n is null then
    return 0;
  end if;

  -- Allow service_role always; authenticated only if they own the entity
  if auth.role() is distinct from 'service_role'
     and auth.uid() is distinct from owner then
    raise exception 'not authorized to sync this entity';
  end if;

  update public.discovery_publications
    set publisher_name = n, updated_at = now()
    where publisher_id = p_entity_id
      and publisher_name is distinct from n;
  get diagnostics updated = row_count;
  return updated;
end;
$fn$;

revoke all on function public.sync_publisher_names_for_entity(uuid) from public;
grant execute on function public.sync_publisher_names_for_entity(uuid) to authenticated;
grant execute on function public.sync_publisher_names_for_entity(uuid) to service_role;

-- 5) Content reports
create table if not exists public.discovery_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  target_kind text not null check (target_kind in ('publication', 'entity', 'user')),
  target_id text,
  target_slug text,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists discovery_reports_status_idx
  on public.discovery_reports (status, created_at desc);

alter table public.discovery_reports enable row level security;

drop policy if exists "discovery_reports_insert_auth" on public.discovery_reports;
create policy "discovery_reports_insert_auth"
  on public.discovery_reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

drop policy if exists "discovery_reports_select_own" on public.discovery_reports;
create policy "discovery_reports_select_own"
  on public.discovery_reports for select
  to authenticated
  using (auth.uid() = reporter_id);

-- 6) Performance indexes
create index if not exists discovery_publications_publisher_name_idx
  on public.discovery_publications (publisher_name);
create index if not exists discovery_entities_owner_idx
  on public.discovery_entities (owner_id);
create index if not exists discovery_entities_slug_idx
  on public.discovery_entities (slug);

-- 7) Signals source column (if table exists)
do $sig$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'discovery_signals'
  ) then
    alter table public.discovery_signals
      add column if not exists source text;
  end if;
end
$sig$;
