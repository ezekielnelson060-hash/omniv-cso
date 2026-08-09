-- Big Dream column used by Activate, Ziki, Opportunities, Agent
alter table public.artist_brains
  add column if not exists big_dream text;

comment on column public.artist_brains.big_dream is
  'North-star career outcome; ranks every move against this.';
