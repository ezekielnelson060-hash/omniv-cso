# Partner onboarding — Distro & Playlist

Hand this to a distro, playlist tool, or curator product that will push signals into Omniv Agent.

## What you get

Every valid webhook becomes an **Agent inbox** card for the artist (`outside` badge).  
They confirm with one chip: open Catalogue, create task, open Ziki, open city room, etc.

Omniv does **not** auto-post or auto-pitch. Artist confirms.

## Auth

1. Omniv issues you `AGENT_WEBHOOK_SECRET` (or a partner-scoped secret — same header today).
2. Send on every request:

```
Authorization: Bearer <AGENT_WEBHOOK_SECRET>
```

or

```
x-omniv-webhook-secret: <AGENT_WEBHOOK_SECRET>
```

3. Endpoint:

```
POST https://omniv.media/api/agent/webhook
Content-Type: application/json
```

## Required fields

| Field | Required | Notes |
|-------|----------|--------|
| `userId` | yes | Artist’s Supabase auth user UUID (Omniv maps partner artist id → this offline) |
| `title` | yes | Short, action-oriented |
| `externalId` | **strongly recommended** | Idempotent — same id = no spam |
| `body` | no | Context for Agent + Ziki |
| `urgency` | no | `now` \| `today` \| `this_week` |
| `impact` | no | `high` \| `medium` \| `low` |
| `actionType` | no | See shapes below |
| `actionLabel` | no | Button label |
| `payload` | no | Passed to the action |

Full schema: `docs/partner-webhook.md`.

---

## Shape A — Distro: pre-save live

```json
{
  "userId": "<artist-uuid>",
  "title": "Distro: pre-save live · lead single",
  "body": "Smart link is live. First 48h window. Push owned fans + 15s platform hooks now.",
  "urgency": "now",
  "impact": "high",
  "actionType": "OPEN_CATALOGUE",
  "actionLabel": "Open catalogue · ship plan",
  "payload": { "phase": "presave", "windowHours": "48" },
  "externalId": "distro-presave-<ISRC-or-release-id>"
}
```

## Shape B — Distro: release live on DSPs

```json
{
  "userId": "<artist-uuid>",
  "title": "Distro: release live on Spotify / Apple / Boomplay",
  "body": "Track is live. Confirm DSP links in Catalogue, then run platform-native 15s hooks.",
  "urgency": "now",
  "impact": "high",
  "actionType": "OPEN_CATALOGUE",
  "actionLabel": "Paste DSP links + lock plan",
  "payload": { "phase": "live", "platforms": "spotify,apple,boomplay" },
  "externalId": "distro-live-<ISRC-or-release-id>"
}
```

## Shape C — Playlist: pitch window open

```json
{
  "userId": "<artist-uuid>",
  "title": "Playlist window: Afrobeats Late Drive · 12.4k followers",
  "body": "Curator open this week. Prefers 15–30s hook. Target unreleased or lead single.",
  "urgency": "this_week",
  "impact": "high",
  "actionType": "CREATE_TASK",
  "actionLabel": "Prep 15s hook + pitch note",
  "payload": {
    "title": "Prep 15s hook for Late Drive playlist",
    "platform": "spotify",
    "playlist": "Late Drive"
  },
  "externalId": "playlist-window-<playlist-id>-<date>"
}
```

## Shape D — Playlist: track added

```json
{
  "userId": "<artist-uuid>",
  "title": "Playlist add: Late Night Drive (12.4k)",
  "body": "Track: Bank On It. Thank curator + queue similar pitches this week.",
  "urgency": "today",
  "impact": "medium",
  "actionType": "OPEN_ZIKI",
  "actionLabel": "Thank + next pitch",
  "payload": {
    "q": "Draft a short thank-you to the Late Night Drive curator and suggest 2 similar playlists to pitch next."
  },
  "externalId": "playlist-add-<playlist-id>-<track-id>"
}
```

---

## Response

| Status | Body | Meaning |
|--------|------|---------|
| 200 | `{ "ok": true, "proposalId": "wh-…" }` | Landed in Agent |
| 200 | `{ "ok": true, "deduped": true }` | Same `externalId` already pending — not re-spammed |
| 401 | Unauthorized | Bad secret |
| 404 | user not found | Bad `userId` |
| 400 | userId and title required | Missing fields |

## Mapping partner artist → Omniv `userId`

Omniv does not invent a public artist lookup API yet. Options:

1. Artist pastes their Omniv user id in partner dashboard (Settings → copy id).
2. Partner stores mapping after OAuth/connect with Omniv (future).
3. Manual seed for pilot artists.

## Pilot checklist

- [ ] Secret issued and stored server-side only
- [ ] One test `externalId` round-trip → Agent toast + inbox card
- [ ] Confirm chip executes (Catalogue / Task / Ziki)
- [ ] Re-send same `externalId` → `deduped: true`
- [ ] Distro: presave + live events wired
- [ ] Playlist: window + add events wired

## Contact

Product docs live in-repo: `docs/partner-webhook.md`, `docs/partner-onboarding.md`.
Rotate secret if leaked.
