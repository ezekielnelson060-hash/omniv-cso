-- Heat velocity helper for likes/saves
create or replace function public.discovery_bump_heat(p_slug text, p_delta int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.discovery_publications
  set
    heat = greatest(0, coalesce(heat, 0) + p_delta),
    heat_updated_at = now()
  where slug = p_slug;
end;
$$;

grant execute on function public.discovery_bump_heat(text, int) to authenticated;
grant execute on function public.discovery_bump_heat(text, int) to service_role;
