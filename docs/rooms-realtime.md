# Rooms 2.0 — Realtime multi-device

## What ships

| Signal | Mechanism |
|--------|-----------|
| Chat lines | `room_messages` INSERT → postgres_changes |
| Now playing / industry guest | `gatherings` UPDATE → postgres_changes |
| Who is in the room | **Supabase Presence** on channel `room:{id}` |
| Listener count | Derived from presence state (not a fake counter) |
| Tips flash | Chat kind `tip` + local flash strip |

## Supabase dashboard (required once)

1. **Database → Replication** (or Publications): enable `room_messages` and `gatherings` for `supabase_realtime`.
2. Confirm migration `013_room_live.sql` applied (`room_messages` table + gathering live columns).

Without replication, clients fall back to 8s message polling; presence may still work.

## Client behaviour

- Each browser tab tracks a unique presence key.
- Display name = guest name field, else `Host` / `Listener`.
- Host updates (`PATCH /api/gatherings/[id]/live`) broadcast to all open clients.
- Event `room_presence` logged for Ziki oversight.

## Test

1. Open `/g/{id}?host=1` on device A.
2. Open `/g/{id}` on device B (same room id).
3. Count should show **2 in room · live**.
4. Host sets now playing → device B updates without refresh.
5. Send chat → both sides see the line.

## Agent

Join + tip still push Agent proposals (`source: audience`) via messages API.
