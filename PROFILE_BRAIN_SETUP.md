# Profiles + Artist Brain

## 1. Run SQL once (required)

Supabase dashboard → **SQL Editor** → New query → paste file:

`supabase/migrations/001_profiles_artist_brain.sql`

→ **Run**

Creates `profiles`, `artist_brains`, RLS, and auto-profile on signup.

## 2. App behaviour

- Onboarding finish → saves profile + seeds Artist Brain
- /artist-brain → loads from Supabase (mock fallback if empty)
- Settings → Profile load/save + Sign out

## 3. Test

1. Complete onboarding with your stage name
2. Open Artist Brain — should show your name
3. Settings → change name → Save
