-- Phase 6: paid access is time-bound and renews through successful payments.
alter table if exists public.profiles
  add column if not exists plan_expires_at timestamptz;

create index if not exists profiles_plan_expires_at_idx
  on public.profiles (plan_expires_at);

comment on column public.profiles.plan_expires_at is
  'End of the current paid entitlement window; null for free/legacy records.';
