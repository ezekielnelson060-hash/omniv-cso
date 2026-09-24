-- Public follower counts without exposing who follows whom.
-- Run in Supabase SQL editor.

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

grant execute on function public.discovery_follower_count(text, text) to anon, authenticated;

-- Allow reading only aggregate path via function; keep row policies as-is.
