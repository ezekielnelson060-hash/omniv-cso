-- Omniv: public follower counts
-- Run Statement 1, then Statement 2 separately in Supabase SQL editor.

-- ===== STATEMENT 1 =====
create or replace function public.discovery_follower_count(
  p_type text,
  p_slug text
)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.discovery_follows
  where target_type = p_type
    and target_slug = p_slug;
$$;

-- ===== STATEMENT 2 (run after Statement 1 succeeds) =====
grant execute on function public.discovery_follower_count(text, text) to anon;
grant execute on function public.discovery_follower_count(text, text) to authenticated;
