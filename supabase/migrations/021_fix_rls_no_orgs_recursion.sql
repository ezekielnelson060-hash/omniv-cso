-- Break infinite recursion: orgs ↔ org_members ↔ roster_artists ↔ fans
-- Solo artists use owner_user_id on roster without requiring org dance.

alter table public.roster_artists
  alter column org_id drop not null;

alter table public.roster_artists
  add column if not exists owner_user_id uuid references auth.users (id) on delete set null;

create index if not exists roster_artists_owner_idx
  on public.roster_artists (owner_user_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'roster_artists_slug_key'
  ) then
    begin
      alter table public.roster_artists add constraint roster_artists_slug_key unique (slug);
    exception when others then
      null;
    end;
  end if;
end $$;

alter table public.fans
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table public.fans
  add column if not exists would_attend boolean default false;

create index if not exists fans_user_idx on public.fans (user_id);

drop policy if exists "orgs_member_select" on public.orgs;
drop policy if exists "orgs_owner_write" on public.orgs;
drop policy if exists "orgs_owner_select" on public.orgs;
drop policy if exists "org_members_select" on public.org_members;
drop policy if exists "org_members_owner" on public.org_members;
drop policy if exists "org_members_self" on public.org_members;
drop policy if exists "org_members_self_write" on public.org_members;
drop policy if exists "roster_member_all" on public.roster_artists;
drop policy if exists "roster_owner_all" on public.roster_artists;
drop policy if exists "fans_roster_access" on public.fans;
drop policy if exists "fans_owner_access" on public.fans;
drop policy if exists "campaigns_roster_access" on public.campaigns;
drop policy if exists "interactions_via_fan" on public.fan_interactions;

create policy "orgs_owner_select" on public.orgs
  for select using (owner_user_id = auth.uid());

create policy "orgs_owner_write" on public.orgs
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "org_members_self" on public.org_members
  for select using (user_id = auth.uid());

create policy "org_members_self_write" on public.org_members
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "roster_owner_all" on public.roster_artists
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "fans_owner_access" on public.fans
  for all using (
    user_id = auth.uid()
    or exists (
      select 1 from public.roster_artists ra
      where ra.id = fans.artist_id
        and ra.owner_user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.roster_artists ra
      where ra.id = fans.artist_id
        and ra.owner_user_id = auth.uid()
    )
  );
