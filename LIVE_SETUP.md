# Make Omniv live — keys checklist

## Already live in code
- Premium landing (industry context + product story)
- Command Center + Opportunity Feed from **your** Artist Brain (no Nova Hex)
- Ziki with operating brief + manager rules
- Flutterwave payment init API
- Spotify OAuth + public popularity metrics
- Agent inbox (outside/internal filter) + partner webhooks

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
   - `NEXT_PUBLIC_APP_URL` = your production URL
3. POST `/api/billing/flutterwave` with `{ plan, email, name }` returns checkout `link`

## 3. Spotify OAuth + metrics
1. https://developer.spotify.com/dashboard → Create app
2. Redirect URI: `https://YOUR_DOMAIN/api/oauth/spotify/callback`
3. Vercel env: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
4. Visit `/api/oauth/spotify` to start connect flow
5. Catalogue releases with `spotify_url` → `POST /api/platform-metrics/refresh` or daily cron

## 4. What “real scores” means today
Scores are **computed from your Artist Brain + selected platforms + fans + catalogue + public DSP popularity** (live, per-user).
They are not demo mocks.

## 5. CRON_SECRET and AGENT_WEBHOOK_SECRET (you generate these)

These are **not** issued by Spotify or Supabase. You invent long random strings and store them only in Vercel.

```bash
# Generate once
openssl rand -hex 32
```

| Env var | Purpose |
|---------|---------|
| `CRON_SECRET` | Authorizes Vercel cron hits to `/api/cron/*` and manual curl |
| `AGENT_WEBHOOK_SECRET` | Authorizes partner `POST /api/agent/webhook` |

Vercel → Project → Settings → Environment Variables → add both → Redeploy.

**Manual DSP cron test:**

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://YOUR_DOMAIN/api/cron/platform-metrics"
```

Always set `CRON_SECRET` in production.

## 6. Partner webhooks
See `docs/partner-onboarding.md` and `docs/partner-webhook.md`.
