-- Omniv solidification: notifications, search FTS, moderation hide
-- Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS)

-- 1) Network notifications (server-backed inbox)
create table if not exists public.discovery_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  href text,
  actor_name text,
  actor_type text,
  actor_id text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists discovery_notifications_user_created_idx
  on public.discovery_notifications (user_id, created_at desc);

create index if not exists discovery_notifications_user_unread_idx
  on public.discovery_notifications (user_id)
  where read = false;

alter table public.discovery_notifications enable row level security;

drop policy if exists "discovery_notifications_select_own" on public.discovery_notifications;
create policy "discovery_notifications_select_own"
  on public.discovery_notifications for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "discovery_notifications_update_own" on public.discovery_notifications;
create policy "discovery_notifications_update_own"
  on public.discovery_notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "discovery_notifications_insert_own" on public.discovery_notifications;
create policy "discovery_notifications_insert_own"
  on public.discovery_notifications for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 2) Full-text search on publications
alter table public.discovery_publications
  add column if not exists search_vector tsvector;

create or replace function public.discovery_publications_search_vector_update()
returns trigger
language plpgsql
as $fn$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(new.summary, '')), 'B')
    || setweight(to_tsvector('english', coalesce(new.category, '')), 'C')
    || setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'C')
    || setweight(to_tsvector('english', coalesce(new.publisher_name, '')), 'C');
  return new;
end;
$fn$;

drop trigger if exists discovery_publications_search_vector_trg on public.discovery_publications;
create trigger discovery_publications_search_vector_trg
  before insert or update of title, summary, category, tags, publisher_name
  on public.discovery_publications
  for each row
  execute function public.discovery_publications_search_vector_update();

update public.discovery_publications
set search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A')
  || setweight(to_tsvector('english', coalesce(summary, '')), 'B')
  || setweight(to_tsvector('english', coalesce(category, '')), 'C')
  || setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'C')
  || setweight(to_tsvector('english', coalesce(publisher_name, '')), 'C')
where search_vector is null;

create index if not exists discovery_publications_search_vector_idx
  on public.discovery_publications using gin (search_vector);

-- 3) Moderation: hidden flag on publications
alter table public.discovery_publications
  add column if not exists moderated_hidden boolean not null default false;

drop policy if exists "discovery_publications_public_read" on public.discovery_publications;
create policy "discovery_publications_public_read"
  on public.discovery_publications for select
  using (
    auth.uid() = owner_id
    or (
      coalesce(visibility, 'public') = 'public'
      and coalesce(status, 'published') in ('published', 'scheduled')
      and coalesce(moderated_hidden, false) = false
    )
  );

-- 4) Profiles interests (server-side interest vector)
alter table public.profiles
  add column if not exists interests text[] default '{}';
