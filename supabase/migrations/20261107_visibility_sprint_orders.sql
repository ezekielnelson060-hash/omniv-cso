-- Product Visibility Sprint orders (one-time $300 service)
create table if not exists public.visibility_sprint_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'fulfilled', 'cancelled', 'failed')),
  customer_name text not null,
  customer_email text not null,
  company_name text not null,
  website text,
  product_description text not null,
  amount numeric not null default 300,
  currency text not null default 'USD',
  tx_ref text unique,
  flw_transaction_id text,
  payment_verified_at timestamptz,
  raw_payment jsonb
);

create index if not exists visibility_sprint_orders_email_idx
  on public.visibility_sprint_orders (customer_email);

create index if not exists visibility_sprint_orders_status_idx
  on public.visibility_sprint_orders (status, created_at desc);

alter table public.visibility_sprint_orders enable row level security;

-- Service role only for writes from API; no public client access required
