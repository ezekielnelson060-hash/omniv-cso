-- Omniv: media files for music / file publications
-- Run Statement 1, then 2, then 3 separately if needed.

-- ===== 1: column =====
alter table public.discovery_publications
  add column if not exists media_url text;

-- ===== 2: bucket =====
insert into storage.buckets (id, name, public)
values ('discovery-media', 'discovery-media', true)
on conflict (id) do nothing;

-- ===== 3: storage policies =====
drop policy if exists "discovery_media_public_read" on storage.objects;
create policy "discovery_media_public_read"
  on storage.objects for select
  using (bucket_id = 'discovery-media');

drop policy if exists "discovery_media_auth_upload" on storage.objects;
create policy "discovery_media_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'discovery-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "discovery_media_auth_update" on storage.objects;
create policy "discovery_media_auth_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'discovery-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "discovery_media_auth_delete" on storage.objects;
create policy "discovery_media_auth_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'discovery-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
