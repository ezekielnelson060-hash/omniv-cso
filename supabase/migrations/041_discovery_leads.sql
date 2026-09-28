-- Lead capture for entity contact forms (Pro)
create table if not exists public.discovery_leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  entity_id uuid null,
  entity_name text,
  entity_path text,
  name text not null,
  email text not null,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists discovery_leads_owner_created
  on public.discovery_leads (owner_id, created_at desc);

alter table public.discovery_leads enable row level security;

drop policy if exists "Owners read own leads" on public.discovery_leads;
create policy "Owners read own leads"
  on public.discovery_leads for select
  using (auth.uid() = owner_id);

drop policy if exists "Anyone can insert leads" on public.discovery_leads;
create policy "Anyone can insert leads"
  on public.discovery_leads for insert
  with check (true);
