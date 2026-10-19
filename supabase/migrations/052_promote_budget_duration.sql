-- Align discovery_promotions checks with app UI (promote-config + PROMOTION_CONFIG).
-- Old: duration in (3,7,14), budget >= 10
-- New: duration 1–30, budget >= 5

do $$
begin
  -- Drop any existing check constraints on duration / budget (names vary)
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.discovery_promotions'::regclass
      and conname = 'discovery_promotions_duration_days_check'
  ) then
    alter table public.discovery_promotions
      drop constraint discovery_promotions_duration_days_check;
  end if;

  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.discovery_promotions'::regclass
      and conname = 'discovery_promotions_budget_check'
  ) then
    alter table public.discovery_promotions
      drop constraint discovery_promotions_budget_check;
  end if;
end $$;

alter table public.discovery_promotions
  add constraint discovery_promotions_duration_days_check
  check (duration_days >= 1 and duration_days <= 30);

alter table public.discovery_promotions
  add constraint discovery_promotions_budget_check
  check (budget >= 5 and budget <= 500);

comment on constraint discovery_promotions_budget_check on public.discovery_promotions is
  'Min $5 matches $5/day × 1 day UI option; max $500.';
