-- Payments + plan columns for Flutterwave soft launch
-- Run in Supabase SQL editor if migration runner is not wired.

alter table public.profiles
  add column if not exists plan text default 'free',
  add column if not exists plan_status text default 'none',
  add column if not exists plan_updated_at timestamptz,
  add column if not exists flw_tx_ref text,
  add column if not exists billing_status text default 'none';

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'flutterwave',
  provider_payment_id text not null,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  plan text not null,
  amount numeric,
  currency text,
  status text not null default 'successful',
  tx_ref text,
  raw jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);

create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_tx_ref_idx on public.payments (tx_ref);

alter table public.payments enable row level security;

-- Users can read their own payments; writes only via service role (webhook)
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = user_id);
