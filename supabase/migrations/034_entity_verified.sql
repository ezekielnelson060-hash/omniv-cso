-- Pro verification badge (display only until billing)
-- Run in Supabase SQL editor

alter table if exists public.discovery_entities
  add column if not exists verified boolean not null default false;

comment on column public.discovery_entities.verified is
  'Omniv Verified Publisher — Pro feature';
