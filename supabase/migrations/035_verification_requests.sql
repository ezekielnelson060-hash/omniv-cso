-- Verification applications (Pro feature)
-- Run in Supabase SQL editor

create table if not exists public.discovery_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_id uuid references public.discovery_entities(id) on delete set null,
  entity_type text,
  entity_slug text,
  entity_name text not null,
  verify_type text not null default 'organization',
  -- individual | organization
  status text not null default 'pending',
  -- pending | approved | rejected
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_verify_req_user
  on public.discovery_verification_requests(user_id);

alter table public.discovery_verification_requests enable row level security;

drop policy if exists "users insert own verify requests"
  on public.discovery_verification_requests;
create policy "users insert own verify requests"
  on public.discovery_verification_requests
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users read own verify requests"
  on public.discovery_verification_requests;
create policy "users read own verify requests"
  on public.discovery_verification_requests
  for select to authenticated
  using (auth.uid() = user_id);

-- Ensure verified column exists
alter table if exists public.discovery_entities
  add column if not exists verified boolean not null default false;
