# Make Omniv live — keys checklist

## Already live in code
- Premium landing (industry context + product story)
- Command Center + Opportunity Feed from **your** Artist Brain (no Nova Hex)
- Ziki → **Gemini 2.5 Flash** when `GEMINI_API_KEY` is set
- Flutterwave payment init API
- Spotify OAuth start + callback routes

## 1. Gemini (Ziki) — free tier
1. https://aistudio.google.com/apikey → Create API key
2. Vercel → Environment Variables:
   - `GEMINI_API_KEY` = your key
   - `GEMINI_MODEL` = `gemini-2.5-flash` (or `gemini-2.0-flash`)
3. Redeploy
4. Open /ziki and ask something — replies should be real briefings

## 2. Flutterwave
1. https://dashboard.flutterwave.com → Settings → API Keys
2. Vercel env:
   - `FLW_SECRET_KEY`
   - `FLW_PUBLIC_KEY` (optional for client)
   - `FLW_CURRENCY` = `USD` or `NGN`
   - `NEXT_PUBLIC_APP_URL` = `https://omniv-cso.vercel.app`
3. POST `/api/billing/flutterwave` with `{ plan, email, name }` returns checkout `link`

## 3. Spotify OAuth
1. https://developer.spotify.com/dashboard → Create app
2. Redirect URI: `https://omniv-cso.vercel.app/api/oauth/spotify/callback`
3. Vercel env: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
4. Visit `/api/oauth/spotify` to start connect flow

## 4. What “real scores” means today
Scores are **computed from your Artist Brain + selected platforms** (live, per-user).
They are not Nova Hex mocks.

True streaming/social metrics need OAuth tokens stored + periodic sync — next engineering step after keys are in.
