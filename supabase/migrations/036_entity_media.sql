-- Entity profile media (avatar + cover)
-- Run in Supabase SQL editor

alter table if exists public.discovery_entities
  add column if not exists avatar_url text,
  add column if not exists cover_url text;

-- Ensure verified exists
alter table if exists public.discovery_entities
  add column if not exists verified boolean not null default false;
