-- Server-side opportunity progress (mirrors client localStorage)
alter table public.profiles
  add column if not exists opp_progress jsonb default null;

comment on column public.profiles.opp_progress is
  'Completed/dismissed opportunity ids: { completed: {id: ts}, dismissed: {id: ts} }';
