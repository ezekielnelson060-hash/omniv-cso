# Outside opportunity graph — partner webhooks

Push real-world signals (gigs, syncs, collabs, playlist adds, radio, brand briefs, distro) into the artist Agent inbox. Omniv ranks them with catalogue + fan + DSP signals so Moves stay non-generic.

## Endpoint

`POST https://omniv.media/api/agent/webhook`  
(or your deployed host)

Headers:
- `Authorization: Bearer <AGENT_WEBHOOK_SECRET>`
- or `x-omniv-webhook-secret: <AGENT_WEBHOOK_SECRET>`

## Body

```json
{
  "userId": "uuid-of-artist-profile",
  "title": "Sync brief: sports brand needs Afrobeat 95–110 BPM",
  "body": "Deadline Friday. Non-exclusive. Budget band $2–5k.",
  "urgency": "this_week",
  "impact": "high",
  "actionType": "OPEN_ZIKI",
  "actionLabel": "Draft pitch in Ziki",
  "payload": { "q": "Draft a pitch for this sync brief using my catalogue" },
  "externalId": "partner-sync-9981"
}
```

### Field notes

| Field | Required | Notes |
|-------|----------|--------|
| `userId` | yes | Supabase profile / auth user id |
| `title` | yes | Short, action-oriented |
| `body` | no | Context for Agent + Ziki |
| `urgency` | no | `now` \| `today` \| `this_week` |
| `impact` | no | `high` \| `medium` \| `low` |
| `actionType` | no | `OPEN_ZIKI` \| `CREATE_ROOM` \| `CREATE_TASK` \| `OPEN_CRM` \| `OPEN_CATALOGUE` \| `OPEN_SETTINGS` \| `OPEN_OPPORTUNITIES` \| `OPEN_RELEASE` |
| `actionLabel` | no | Button label in Agent |
| `payload` | no | Passed through to the action |
| `externalId` | no | **Dedupes** — same id will not re-spam the inbox |

---

## Production shapes (copy these)

### 1. Distro — pre-save live

```json
{
  "userId": "…",
  "title": "Distro: pre-save live · lead single",
  "body": "Smart link is live. First 48h window. Push owned fans + 15s platform hooks now.",
  "urgency": "now",
  "impact": "high",
  "actionType": "OPEN_CATALOGUE",
  "actionLabel": "Open catalogue · ship plan",
  "payload": {
    "phase": "presave",
    "windowHours": "48"
  },
  "externalId": "distro-presave-{ISRC_or_release_id}"
}
```

### 2. Distro — release live on DSPs

```json
{
  "userId": "…",
  "title": "Distro: release live on Spotify / Apple / Boomplay",
  "body": "Track is live. Confirm DSP links in Catalogue, then run platform-native 15s hooks + fan city rooms.",
  "urgency": "now",
  "impact": "high",
  "actionType": "OPEN_CATALOGUE",
  "actionLabel": "Paste DSP links + lock plan",
  "payload": {
    "phase": "live",
    "platforms": "spotify,apple,boomplay"
  },
  "externalId": "distro-live-{ISRC_or_release_id}"
}
```

### 3. Playlist / curator — pitch window open

```json
{
  "userId": "…",
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
  "externalId": "playlist-late-drive-{date}"
}
```

### 4. Playlist — track added

```json
{
  "userId": "…",
  "title": "Playlist add: Late Night Drive (12.4k)",
  "body": "Track: Bank On It. Thank curator + queue similar pitches this week.",
  "urgency": "today",
  "impact": "medium",
  "actionType": "OPEN_ZIKI",
  "actionLabel": "Thank + next pitch",
  "payload": {
    "q": "Draft a short thank-you to the Late Night Drive curator and suggest 2 similar playlists to pitch next."
  },
  "externalId": "playlist-add-late-night-{track_id}"
}
```

### 5. Sync / brand brief

```json
{
  "userId": "…",
  "title": "Sync brief: sports brand · 95–110 BPM",
  "body": "Non-exclusive. Deadline Friday. Budget $2–5k.",
  "urgency": "this_week",
  "impact": "high",
  "actionType": "OPEN_ZIKI",
  "actionLabel": "Draft pitch in Ziki",
  "payload": {
    "q": "Match this brief to my catalogue BPM and draft a pitch"
  },
  "externalId": "sync-sports-{brief_id}"
}
```

### 6. Gig / city pull

```json
{
  "userId": "…",
  "title": "Promoter interest: Lagos · 200–400 capacity",
  "body": "Date window next month. Soft hold on two Fridays.",
  "urgency": "this_week",
  "impact": "high",
  "actionType": "CREATE_ROOM",
  "actionLabel": "Open city room",
  "payload": {
    "city": "Lagos",
    "title": "Room · Lagos"
  },
  "externalId": "gig-los-{date}"
}
```

---

## Behaviour

- Proposals land in Agent (`/notifications`) with badge + toast.
- Confirm chips execute: `OPEN_ZIKI` → Ziki with context, `CREATE_TASK` → execution_tasks, `CREATE_ROOM` → gatherings, `OPEN_CATALOGUE` → Catalogue, etc.
- Confirm / dismiss is persisted server-side (survives device switch).
- `externalId` dedupes — re-sending the same id returns `{ ok: true, deduped: true }`.
- Omniv still ranks internal Moves from catalogue + fans + platform_metrics; webhooks add the **outside** graph.

## Auth

Set `AGENT_WEBHOOK_SECRET` in the deployment environment. Rotate if a partner key leaks.

`GET /api/agent/webhook` returns the schema.
