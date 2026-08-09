# DSP metrics — what is live vs partner

## Public Web API (shipped foundation)
- Client credentials: track/artist **popularity** (0–100), artist **followers**
- Cron: `GET /api/cron/platform-metrics` daily 08:00
- Requires `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET`
- Catalogue releases must have `spotify_url` set

## OAuth connect (hardened)
- `/api/oauth/spotify` → callback stores `platform_connections.spotify` on profile
- Marks `platforms` + `social_links.spotify`
- Refresh token stored server-side for future user-scoped pulls

## Fill after DSP links (no wait for 08:00)

1. Env on Vercel: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `CRON_SECRET`
2. Catalogue → Add release with a real `open.spotify.com/track/...` (or artist) URL
3. Client auto-calls `POST /api/platform-metrics/refresh` (signed-in, that user only)
4. Or force full cron:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://YOUR_DOMAIN/api/cron/platform-metrics"
```

5. Opportunities subtitle should show `DSP pop N` once rows exist in `platform_metrics`

## Not available without Spotify partner (S4A)
- Daily stream time series
- Playlist add graphs
- Listener cities from DSP
- Save rate proprietary charts

Those arrive via **partner webhooks** (`/api/agent/webhook`) or licensed data (Chartmetric-class).

## Migration
Run `014_platform_metrics.sql` on Supabase before relying on the table.

## Events Ziki uses for oversight

| Event | When |
|-------|------|
| `catalogue_upload` | Audio uploaded for AI |
| `catalogue_release_add` | Release row created |
| `opp_done` / `opp_dismissed` / `opp_reopen` | Opportunity progress |
| `dsp_metrics_refresh` | User-triggered metrics pull |
| `agent_confirm` | Agent chip confirmed |
| `page_view` | App shell navigation |
| `ziki_message` | Ziki chat turn |
