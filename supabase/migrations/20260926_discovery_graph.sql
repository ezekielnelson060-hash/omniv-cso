-- Explicit graph edges for deterministic recommendations and future AI search.
alter table if exists public.discovery_publications
  add column if not exists entity_refs jsonb not null default '[]'::jsonb,
  add column if not exists related_publication_ids text[] not null default '{}';

create index if not exists discovery_publications_entity_refs_gin_idx
  on public.discovery_publications using gin (entity_refs);
create index if not exists discovery_publications_related_ids_gin_idx
  on public.discovery_publications using gin (related_publication_ids);
