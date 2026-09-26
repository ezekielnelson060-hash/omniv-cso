-- Production article engine on the existing discovery publication table.
alter table if exists public.discovery_publications
  add column if not exists author_profile_id uuid references auth.users(id) on delete set null,
  add column if not exists subtitle text,
  add column if not exists excerpt text,
  add column if not exists content jsonb,
  add column if not exists category_id text,
  add column if not exists reading_time int,
  add column if not exists status text not null default 'published',
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists canonical_url text,
  add column if not exists sources jsonb not null default '[]'::jsonb,
  add column if not exists what_this_means text,
  add column if not exists question_nobody_asks text;

update public.discovery_publications
set status = 'published'
where status is null;

alter table public.discovery_publications
  drop constraint if exists discovery_publications_status_check;
alter table public.discovery_publications
  add constraint discovery_publications_status_check
  check (status in ('draft', 'published', 'archived'));

create index if not exists discovery_publications_status_published_idx
  on public.discovery_publications (status, published_at desc);

-- Drafts and archived articles must never be visible through the public policy.
drop policy if exists "discovery_publications_public_read" on public.discovery_publications;
create policy "discovery_publications_public_read"
  on public.discovery_publications for select
  using (status = 'published' or auth.uid() = owner_id);
