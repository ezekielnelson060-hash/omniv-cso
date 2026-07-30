-- Social profile URLs + last scan (run in SQL Editor)

alter table public.profiles
  add column if not exists social_links jsonb default '{}'::jsonb,
  add column if not exists last_scan_at timestamptz,
  add column if not exists last_scan_briefing text;
