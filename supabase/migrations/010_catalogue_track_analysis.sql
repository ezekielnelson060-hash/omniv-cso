-- Optional richer analysis column for catalogue_tracks
alter table public.catalogue_tracks
  add column if not exists analysis jsonb default null;

comment on column public.catalogue_tracks.analysis is 'Omniv audio passport: bpm, energy, peak/rms, analyzedAt';
