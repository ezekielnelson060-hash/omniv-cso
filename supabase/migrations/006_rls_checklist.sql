-- Omniv RLS checklist + safe re-apply
-- Run in SQL Editor if CRM / fans / orgs return empty under a logged-in user

-- 1) Confirm tables exist
-- select table_name from information_schema.tables where table_schema = 'public' order by 1;

-- 2) Re-apply core policies (idempotent)

drop policy if exists "orgs_member_select" on public.orgs;
drop policy if exists "orgs_owner_write" on public.orgs;
drop policy if exists "org_members_select" on public.org_members;
drop policy if exists "roster_member_all" on public.roster_artists;
drop policy if exists "fans_roster_access" on public.fans;
drop policy if exists "campaigns_roster_access" on public.campaigns;
drop policy if exists "interactions_via_fan" on public.fan_interactions;

-- Orgs: members can read; owner can write
create policy "orgs_member_select" on public.orgs for select using (
  owner_user_id = auth.uid()
  or exists (
    select 1 from public.org_members m
    where m.org_id = orgs.id and m.user_id = auth.uid()
  )
);

create policy "orgs_owner_write" on public.orgs for all using (
  owner_user_id = auth.uid()
) with check (owner_user_id = auth.uid());

create policy "org_members_select" on public.org_members for select using (
  user_id = auth.uid()
  or exists (
    select 1 from public.orgs o
    where o.id = org_members.org_id and o.owner_user_id = auth.uid()
  )
);

create policy "roster_member_all" on public.roster_artists for all using (
  exists (
    select 1 from public.orgs o
    left join public.org_members m on m.org_id = o.id
    where o.id = roster_artists.org_id
      and (o.owner_user_id = auth.uid() or m.user_id = auth.uid())
  )
) with check (
  exists (
    select 1 from public.orgs o
    left join public.org_members m on m.org_id = o.id
    where o.id = roster_artists.org_id
      and (o.owner_user_id = auth.uid() or m.user_id = auth.uid())
  )
);

create policy "fans_roster_access" on public.fans for all using (
  exists (
    select 1 from public.roster_artists ra
    join public.orgs o on o.id = ra.org_id
    left join public.org_members m on m.org_id = o.id
    where ra.id = fans.artist_id
      and (o.owner_user_id = auth.uid() or m.user_id = auth.uid())
  )
) with check (
  exists (
    select 1 from public.roster_artists ra
    join public.orgs o on o.id = ra.org_id
    left join public.org_members m on m.org_id = o.id
    where ra.id = fans.artist_id
      and (o.owner_user_id = auth.uid() or m.user_id = auth.uid())
  )
);

create policy "campaigns_roster_access" on public.campaigns for all using (
  exists (
    select 1 from public.roster_artists ra
    join public.orgs o on o.id = ra.org_id
    left join public.org_members m on m.org_id = o.id
    where ra.id = campaigns.artist_id
      and (o.owner_user_id = auth.uid() or m.user_id = auth.uid())
  )
) with check (
  exists (
    select 1 from public.roster_artists ra
    join public.orgs o on o.id = ra.org_id
    left join public.org_members m on m.org_id = o.id
    where ra.id = campaigns.artist_id
      and (o.owner_user_id = auth.uid() or m.user_id = auth.uid())
  )
);

create policy "interactions_via_fan" on public.fan_interactions for all using (
  exists (
    select 1 from public.fans f
    join public.roster_artists ra on ra.id = f.artist_id
    join public.orgs o on o.id = ra.org_id
    left join public.org_members m on m.org_id = o.id
    where f.id = fan_interactions.fan_id
      and (o.owner_user_id = auth.uid() or m.user_id = auth.uid())
  )
) with check (
  exists (
    select 1 from public.fans f
    join public.roster_artists ra on ra.id = f.artist_id
    join public.orgs o on o.id = ra.org_id
    left join public.org_members m on m.org_id = o.id
    where f.id = fan_interactions.fan_id
      and (o.owner_user_id = auth.uid() or m.user_id = auth.uid())
  )
);

-- Note: Public fan CAPTURE uses SUPABASE_SERVICE_ROLE_KEY in /api/fans/capture
-- Service role bypasses RLS. Browser clients use anon key + auth.uid() policies above.
