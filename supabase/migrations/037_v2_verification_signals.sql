-- V2: verification ops + explorer signals

alter table public.discovery_verification_requests
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists decision_notes text,
  add column if not exists evidence jsonb default '{}'::jsonb,
  add column if not exists paid boolean not null default false,
  add column if not exists payment_ref text;

create index if not exists idx_verify_req_status
  on public.discovery_verification_requests(status, created_at desc);

create table if not exists public.discovery_verification_log (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid references public.discovery_entities(id) on delete cascade,
  entity_type text,
  entity_slug text,
  entity_name text not null,
  verify_type text not null default 'organization',
  verified_at timestamptz not null default now(),
  verified_fields text[] default array['identity','authorized_representative'],
  last_reviewed_at timestamptz not null default now(),
  request_id uuid references public.discovery_verification_requests(id) on delete set null
);

create index if not exists idx_verify_log_entity
  on public.discovery_verification_log(entity_type, entity_slug);

alter table public.discovery_verification_log enable row level security;

drop policy if exists "public read verification log"
  on public.discovery_verification_log;
create policy "public read verification log"
  on public.discovery_verification_log
  for select to anon, authenticated
  using (true);

create table if not exists public.discovery_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  kind text not null,
  publication_slug text,
  entity_type text,
  entity_slug text,
  tags text[] default '{}',
  category text,
  weight real not null default 0.1,
  created_at timestamptz not null default now()
);

create index if not exists idx_signals_user_created
  on public.discovery_signals(user_id, created_at desc);
create index if not exists idx_signals_slug_created
  on public.discovery_signals(publication_slug, created_at desc);
create index if not exists idx_signals_kind_created
  on public.discovery_signals(kind, created_at desc);

alter table public.discovery_signals enable row level security;

drop policy if exists "users insert own signals"
  on public.discovery_signals;
create policy "users insert own signals"
  on public.discovery_signals
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users read own signals"
  on public.discovery_signals;
create policy "users read own signals"
  on public.discovery_signals
  for select to authenticated
  using (auth.uid() = user_id);

alter table if exists public.discovery_publications
  add column if not exists heat_updated_at timestamptz;
