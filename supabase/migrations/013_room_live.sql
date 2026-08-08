-- Phase 2 live: now playing, industry guest, realtime chat

alter table public.gatherings
  add column if not exists now_playing_url text default null,
  add column if not exists now_playing_title text default null,
  add column if not exists industry_guest_name text default null,
  add column if not exists industry_guest_role text default null,
  add column if not exists industry_guest_active boolean default false;

create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  gathering_id uuid not null references public.gatherings (id) on delete cascade,
  display_name text not null,
  body text not null,
  kind text not null default 'chat'
    check (kind in ('chat', 'tip', 'system', 'reaction', 'join')),
  created_at timestamptz default now()
);

create index if not exists room_messages_gathering_idx
  on public.room_messages (gathering_id, created_at desc);

alter table public.room_messages enable row level security;

drop policy if exists "room_messages_public_read" on public.room_messages;
create policy "room_messages_public_read" on public.room_messages
  for select using (true);

-- Dashboard → Database → Replication: enable public.room_messages + public.gatherings
