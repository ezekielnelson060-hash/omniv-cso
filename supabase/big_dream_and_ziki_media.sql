-- Big Dream on artist_brains + private ziki-media bucket for demo audit trail

alter table public.artist_brains
  add column if not exists big_dream text;

-- Storage bucket (run in Supabase SQL or create via Dashboard → Storage)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ziki-media',
  'ziki-media',
  false,
  52428800,
  array[
    'audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/flac',
    'audio/mp4','audio/aac','audio/ogg','audio/webm',
    'video/mp4','video/quicktime','video/webm',
    'image/png','image/jpeg','image/webp'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Users can only read/write their own folder: {user_id}/...
drop policy if exists "ziki_media_select_own" on storage.objects;
drop policy if exists "ziki_media_insert_own" on storage.objects;
drop policy if exists "ziki_media_delete_own" on storage.objects;

create policy "ziki_media_select_own"
  on storage.objects for select to authenticated
  using (bucket_id = 'ziki-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "ziki_media_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'ziki-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "ziki_media_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'ziki-media' and (storage.foldername(name))[1] = auth.uid()::text);
