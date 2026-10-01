-- Publisher controls: public/private visibility for owned publications.
alter table public.discovery_publications
  add column if not exists visibility text not null default 'public';

alter table public.discovery_publications
  drop constraint if exists discovery_publications_visibility_check;

alter table public.discovery_publications
  add constraint discovery_publications_visibility_check
  check (visibility in ('public', 'private'));

create index if not exists discovery_publications_visibility_idx
  on public.discovery_publications (visibility, published_at desc);

alter table public.discovery_publications enable row level security;

drop policy if exists "discovery_publications_public_read" on public.discovery_publications;
create policy "discovery_publications_public_read"
  on public.discovery_publications for select
  using (visibility = 'public' or auth.uid() = owner_id);
