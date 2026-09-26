-- Day-one monetization: promotions, entity-scoped verification, and explicit opportunity metadata.
alter table if exists public.discovery_publications
  add column if not exists opportunity_type text;

create table if not exists public.discovery_promotions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  publisher_id uuid references public.discovery_entities(id) on delete set null,
  target_type text not null check (target_type in ('publication', 'entity', 'product', 'event', 'opportunity')),
  target_id uuid,
  target_slug text,
  target_title text not null default '',
  audience text[] not null default '{}',
  location text,
  interests text[] not null default '{}',
  duration_days int not null check (duration_days in (3, 7, 14)),
  budget numeric not null check (budget >= 10 and budget <= 500),
  status text not null default 'draft' check (status in ('draft', 'pending_payment', 'paid', 'active', 'completed', 'cancelled')),
  payment_id uuid references public.payments(id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists discovery_promotions_owner_idx on public.discovery_promotions(owner_id, created_at desc);
create index if not exists discovery_promotions_status_idx on public.discovery_promotions(status, starts_at);
alter table public.discovery_promotions enable row level security;
drop policy if exists "promotions_select_own" on public.discovery_promotions;
create policy "promotions_select_own" on public.discovery_promotions for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "promotions_insert_own" on public.discovery_promotions;
create policy "promotions_insert_own" on public.discovery_promotions for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "promotions_update_own" on public.discovery_promotions;
create policy "promotions_update_own" on public.discovery_promotions for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

comment on table public.discovery_promotions is 'Native promotion campaigns; payment confirmation is handled server-side by Flutterwave webhook.';
comment on column public.discovery_entities.verified is 'Entity-specific verified publisher status. Never implies guaranteed reach.';
