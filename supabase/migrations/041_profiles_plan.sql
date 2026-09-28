-- Plan columns used by PlanProvider + Flutterwave webhook
alter table public.profiles
  add column if not exists plan text default 'free',
  add column if not exists plan_status text default 'none',
  add column if not exists billing_status text default 'none',
  add column if not exists plan_expires_at timestamptz;

comment on column public.profiles.plan is 'free | pro | business (label mapped to business)';
