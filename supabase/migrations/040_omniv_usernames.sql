-- Global unique usernames (person + entity) — X-style namespace
create table if not exists public.omniv_usernames (
  username text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('person', 'entity')),
  entity_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists omniv_usernames_owner_idx
  on public.omniv_usernames (owner_id);
create index if not exists omniv_usernames_entity_idx
  on public.omniv_usernames (entity_id);

alter table public.omniv_usernames enable row level security;

drop policy if exists "usernames_select_all" on public.omniv_usernames;
create policy "usernames_select_all" on public.omniv_usernames
  for select using (true);

drop policy if exists "usernames_insert_own" on public.omniv_usernames;
create policy "usernames_insert_own" on public.omniv_usernames
  for insert with check (auth.uid() = owner_id);

drop policy if exists "usernames_update_own" on public.omniv_usernames;
create policy "usernames_update_own" on public.omniv_usernames
  for update using (auth.uid() = owner_id);

drop policy if exists "usernames_delete_own" on public.omniv_usernames;
create policy "usernames_delete_own" on public.omniv_usernames
  for delete using (auth.uid() = owner_id);

-- Optional profiles.username for personal handle
alter table public.profiles
  add column if not exists username text;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;
