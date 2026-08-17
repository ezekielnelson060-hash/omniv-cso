-- Run once in Supabase SQL Editor to force public page content live.
-- After this, https://omniv.media/f/ziki-worldwide-t1ax should show story + track.

update public.roster_artists
set public_page = jsonb_build_object(
  'messageTop',
  'I went through the hardest part of my life, lost friends, family, and myself. That was the inspiration that drove this song.',
  'messageMiddle',
  'Listening party coming soon.',
  'messageBottom',
  '',
  'tipEnabled', true,
  'tipAmounts', jsonb_build_array(3, 5, 10, 20),
  'captureHeadline', 'Get the next drop + shows near you',
  'captureReward', 'You''re on the list. Next music and invites hit your inbox.',
  'showWouldAttend', true,
  'links', '[]'::jsonb,
  'track', jsonb_build_object(
    'title', 'Don''t leave me',
    'spotifyUrl', '',
    'downloadUrl', ''
  )
),
stage_name = 'Ezekiel Nelson'
where slug = 'ziki-worldwide-t1ax';
