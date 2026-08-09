# Outside opportunity graph — partner webhooks

Push real-world signals (gigs, syncs, collabs, playlist adds) into the artist Agent inbox.

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

## Notes

- `externalId` dedupes so the same opportunity is not spammed.
- Proposals land in Agent (`/notifications`) with badge + toast.
- Distro, merch, and playlist tools can all share this shape.
