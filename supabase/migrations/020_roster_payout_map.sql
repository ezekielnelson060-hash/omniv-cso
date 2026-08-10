-- Per-roster-artist payout drafts (labels). Soft column; app works if missing.
alter table public.profiles
  add column if not exists roster_payout_map jsonb default '{}'::jsonb;

comment on column public.profiles.roster_payout_map is
  'Map of roster_artist_id -> bank/payout draft for label multi-artist payouts';
