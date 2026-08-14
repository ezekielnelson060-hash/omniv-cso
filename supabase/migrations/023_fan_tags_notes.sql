-- Pre-release fan workflow: notes + tags for segments
alter table public.fans
  add column if not exists notes text default '',
  add column if not exists tags text[] default '{}',
  add column if not exists would_attend boolean default false;

create index if not exists fans_tags_gin on public.fans using gin (tags);
create index if not exists fans_would_attend_idx on public.fans (artist_id, would_attend);
