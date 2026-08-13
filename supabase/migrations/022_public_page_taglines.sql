-- Optional public copy artists can edit (Fan Gate + tip page)
alter table public.roster_artists
  add column if not exists gate_tagline text;

alter table public.roster_artists
  add column if not exists tip_tagline text;
