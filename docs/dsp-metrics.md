# DSP metrics — what is live vs partner

## Public Web API (shipped foundation)
- Client credentials: track/artist **popularity** (0–100), artist **followers**
- Cron: `GET /api/cron/platform-metrics` daily
- Requires `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET`
- Catalogue releases must have `spotify_url` set

## OAuth connect (hardened)
- `/api/oauth/spotify` → callback stores `platform_connections.spotify` on profile
- Marks `platforms` + `social_links.spotify`
- Refresh token stored server-side for future user-scoped pulls

## Not available without Spotify partner (S4A)
- Daily stream time series
- Playlist add graphs
- Listener cities from DSP
- Save rate proprietary charts

Those arrive via **partner webhooks** (`/api/agent/webhook`) or licensed data (Chartmetric-class).

## Migration
Run `014_platform_metrics.sql` on Supabase before relying on the table.
