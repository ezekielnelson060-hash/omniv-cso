-- Owner-scoped entity management (public still readable for Explore)
alter table public.discovery_entities enable row level security;

drop policy if exists "owners manage entities" on public.discovery_entities;
create policy "owners manage entities"
  on public.discovery_entities
  for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Keep public read for discovery profiles (Explore). List API still filters by owner_id.
drop policy if exists "public read published entities" on public.discovery_entities;
create policy "public read published entities"
  on public.discovery_entities
  for select
  to anon, authenticated
  using (true);
