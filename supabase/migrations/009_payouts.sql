-- Safe 009: payout fields only (manager_tasks already uses owner_id)

alter table public.profiles
  add column if not exists payout_subaccount_id text,
  add column if not exists payout_method text,
  add column if not exists payout_notes text,
  add column if not exists tip_display_name text,
  add column if not exists payout_bank_name text,
  add column if not exists payout_account_name text,
  add column if not exists payout_account_number text;

-- Only index gatherings.user_id if that column exists (from migration 008)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'gatherings'
      and column_name = 'user_id'
  ) then
    create index if not exists gatherings_user_idx2 on public.gatherings (user_id);
  end if;
end $$;
