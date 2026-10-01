-- Audience growth center: referrer source tracking and owner-safe aggregate reads.
alter table public.discovery_signals
  add column if not exists source text;

create index if not exists discovery_signals_source_idx
  on public.discovery_signals(source, created_at desc);

drop policy if exists "owners read related publication signals" on public.discovery_signals;
create policy "owners read related publication signals"
  on public.discovery_signals for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.discovery_publications p
      where p.slug = discovery_signals.publication_slug
        and p.owner_id = auth.uid()
    )
  );

drop policy if exists "owners read related publication saves" on public.discovery_saves;
create policy "owners read related publication saves"
  on public.discovery_saves for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.discovery_publications p
      where p.slug = discovery_saves.target_slug
        and p.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.discovery_entities e
      where e.slug = discovery_saves.target_slug
        and e.type = discovery_saves.target_type
        and e.owner_id = auth.uid()
    )
  );

drop policy if exists "owners read related follows" on public.discovery_follows;
create policy "owners read related follows"
  on public.discovery_follows for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.discovery_entities e
      where e.slug = discovery_follows.target_slug
        and e.type = discovery_follows.target_type
        and e.owner_id = auth.uid()
    )
  );
