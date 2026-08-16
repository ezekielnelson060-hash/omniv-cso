-- Thick public artist/release page config (Linktree + Substack + release hub)
alter table public.roster_artists
  add column if not exists public_page jsonb default '{}'::jsonb;

comment on column public.roster_artists.public_page is
  'Public page: messages, track, links, tip flags. See ArtistPublicPage type.';
