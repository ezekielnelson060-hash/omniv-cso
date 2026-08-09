# Outside opportunity graph — partner webhooks

Push real-world signals (gigs, syncs, collabs, playlist adds, radio, brand briefs) into the artist Agent inbox. Omniv ranks them with catalogue + fan signals so Moves stay non-generic.

## Endpoint

`POST https://omniv.media/api/agent/webhook`

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
| `actionType` | no | `OPEN_ZIKI` \| `CREATE_ROOM` \| `CREATE_TASK` \| `OPEN_CRM` \| `OPEN_CATALOGUE` \| `OPEN_SETTINGS` |
| `actionLabel` | no | Button label in Agent |
| `payload` | no | Passed through to the action |
| `externalId` | no | **Dedupes** — same id will not re-spam the inbox |

## Example payloads

### Playlist add

```json
{
  "userId": "…",
  "title": "Indie playlist add: Late Night Drive (12.4k followers)",
  "body": "Track: Bank On It. Curator accepts similar Afrobeats/alt-R&B.",
  "urgency": "today",
  "impact": "medium",
  "actionType": "OPEN_ZIKI",
  "actionLabel": "Thank + next pitch",
  "externalId": "playlist-late-night-884"
}
```

### Sync / brand brief

```json
{
  "userId": "…",
  "title": "Sync brief: sports brand · 95–110 BPM",
  "body": "Non-exclusive. Deadline Friday. Budget $2–5k.",
  "urgency": "this_week",
  "impact": "high",
  "actionType": "OPEN_ZIKI",
  "payload": { "q": "Match this brief to my catalogue BPM and draft a pitch" },
  "externalId": "sync-sports-9981"
}
```

### Gig / city pull

```json
{
  "userId": "…",
  "title": "Promoter interest: Lagos · 200–400 capacity",
  "body": "Date window next month. Soft hold on two Fridays.",
  "urgency": "this_week",
  "impact": "high",
  "actionType": "CREATE_ROOM",
  "actionLabel": "Open city room",
  "payload": { "city": "Lagos", "title": "Room · Lagos" },
  "externalId": "gig-los-2026-09"
}
```

### Distro / release signal

```json
{
  "userId": "…",
  "title": "Distro: pre-save live on lead single",
  "body": "Smart link active. First 48h push window.",
  "urgency": "now",
  "impact": "medium",
  "actionType": "OPEN_CATALOGUE",
  "externalId": "distro-presave-441"
}
```

## Notes

- Proposals land in Agent (`/notifications`) with badge + toast.
- Distro, merch, playlist, radio, and booking tools can all share this shape.
- Omniv still ranks internal Moves from catalogue + fans + platforms; webhooks add the **outside** graph.
- `GET /api/agent/webhook` returns the schema when authenticated infra is up.

## Auth

Set `AGENT_WEBHOOK_SECRET` in the deployment environment. Rotate if a partner key leaks.
