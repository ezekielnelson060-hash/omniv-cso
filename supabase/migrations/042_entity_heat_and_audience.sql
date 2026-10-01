-- Entity heat bumps (profile views) + heat_updated_at safety
alter table public.discovery_publications
  add column if not exists heat_updated_at timestamptz;

alter table public.discovery_entities
  add column if not exists heat_updated_at timestamptz;

create or replace function public.discovery_bump_entity_heat(
  p_type text,
  p_slug text,
  p_delta int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.discovery_entities
  set
    heat = greatest(0, coalesce(heat, 0) + p_delta),
    heat_updated_at = now()
  where lower(type) = lower(p_type)
    and lower(slug) = lower(p_slug);
end;
$$;

grant execute on function public.discovery_bump_entity_heat(text, text, int)
  to authenticated, service_role;

create index if not exists app_events_path_idx on public.app_events (path);
create index if not exists app_events_name_created_idx
  on public.app_events (name, created_at desc);
