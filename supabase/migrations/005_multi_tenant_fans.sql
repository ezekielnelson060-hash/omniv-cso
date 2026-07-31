-- Omniv multi-tenant fan ownership
-- Hierarchy: Label → Manager → Artist → Fans (isolated per artist)
-- Run in Supabase SQL Editor after 001–004

-- Organizations (label org OR solo artist workspace)
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('artist', 'manager', 'label')) default 'artist',
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz default now()
);

-- Membership: which users can access which org
create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'manager', 'artist', 'viewer')) default 'viewer',
  created_at timestamptz default now(),
  unique (org_id, user_id)
);

-- Roster artists under an org (DIY = 1 artist; manager = many; label = many)
create table if not exists public.roster_artists (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs (id) on delete cascade,
  stage_name text not null,
  slug text not null,
  genre text default '',
  owner_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz default now(),
  unique (org_id, slug)
);

create index if not exists roster_artists_org_idx on public.roster_artists (org_id);
create index if not exists roster_artists_slug_idx on public.roster_artists (slug);

-- Fans strictly isolated by roster artist
create table if not exists public.fans (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.roster_artists (id) on delete cascade,
  email text not null,
  phone_number text,
  first_name text,
  last_name text,
  city text,
  country_code text,
  ip_address text,
  is_email_subscribed boolean default true,
  is_sms_subscribed boolean default false,
  opt_in_consent boolean default false,
  acquisition_source text default 'unknown',
  engagement_score int default 10,
  fan_tier text default 'Casual'
    check (fan_tier in ('Superfan', 'Core Fan', 'Casual', 'Cold', 'Unsubscribed')),
  last_active_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (artist_id, email)
);

create index if not exists fans_artist_idx on public.fans (artist_id);
create index if not exists fans_tier_idx on public.fans (artist_id, fan_tier);
create index if not exists fans_country_idx on public.fans (artist_id, country_code);

-- Lead magnets / capture campaigns
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.roster_artists (id) on delete cascade,
  title text not null,
  type text not null check (type in ('download', 'rsvp', 'discount_code', 'newsletter', 'other')),
  destination_value text not null default '',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Interaction timeline
create table if not exists public.fan_interactions (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid not null references public.fans (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete set null,
  action_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists fan_interactions_fan_idx on public.fan_interactions (fan_id);

-- RLS
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.roster_artists enable row level security;
alter table public.fans enable row level security;
alter table public.campaigns enable row level security;
alter table public.fan_interactions enable row level security;

-- Members see their orgs
drop policy if exists "orgs_member_select" on public.orgs;
create policy "orgs_member_select" on public.orgs for select using (
  owner_user_id = auth.uid()
  or exists (
    select 1 from public.org_members m
    where m.org_id = orgs.id and m.user_id = auth.uid()
  )
);

drop policy if exists "orgs_owner_write" on public.orgs;
create policy "orgs_owner_write" on public.orgs for all using (
  owner_user_id = auth.uid()
) with check (owner_user_id = auth.uid());

drop policy if exists "org_members_select" on public.org_members;
create policy "org_members_select" on public.org_members for select using (
  user_id = auth.uid()
  or exists (
    select 1 from public.orgs o
    where o.id = org_members.org_id and o.owner_user_id = auth.uid()
  )
);

drop policy if exists "roster_member_all" on public.roster_artists;
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

-- Fans: only via roster access
drop policy if exists "fans_roster_access" on public.fans;
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

drop policy if exists "campaigns_roster_access" on public.campaigns;
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

drop policy if exists "interactions_via_fan" on public.fan_interactions;
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

-- Public insert for fan capture is handled via service role in API routes (not open RLS insert)
