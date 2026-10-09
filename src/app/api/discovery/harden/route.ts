import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST { action: "sync-names" | "dedupe-entities" | "full" }
 * Owner-scoped hardening: sync publisher_name, merge duplicate entities.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "full");

    const results: Record<string, unknown> = { ok: true, action };

    if (action === "sync-names" || action === "full") {
      const { data: entities, error } = await supabase
        .from("discovery_entities")
        .select("id, name, slug, type")
        .eq("owner_id", user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      let pubsUpdated = 0;
      for (const e of entities || []) {
        // Prefer RPC if available
        const { data: rpcCount, error: rpcErr } = await supabase.rpc(
          "sync_publisher_names_for_entity",
          { p_entity_id: e.id }
        );
        if (!rpcErr && typeof rpcCount === "number") {
          pubsUpdated += rpcCount;
          continue;
        }
        const { count } = await supabase
          .from("discovery_publications")
          .update({ publisher_name: e.name })
          .eq("publisher_id", e.id)
          .eq("owner_id", user.id);
        if (typeof count === "number") pubsUpdated += count;
      }
      results.syncNames = {
        entities: (entities || []).length,
        publicationsTouched: pubsUpdated,
      };
    }

    if (action === "dedupe-entities" || action === "full") {
      const { data: entities, error } = await supabase
        .from("discovery_entities")
        .select("id, name, slug, type, verified, created_at, heat")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Group by normalized name + type
      const groups = new Map<string, typeof entities>();
      for (const e of entities || []) {
        const key = `${(e.type || "").toLowerCase()}::${(e.name || "")
          .toLowerCase()
          .trim()}`;
        const list = groups.get(key) || [];
        list.push(e);
        groups.set(key, list);
      }

      let merged = 0;
      let removed = 0;
      const keepIds: string[] = [];

      for (const [, list] of groups) {
        if (!list || list.length < 2) {
          if (list?.[0]) keepIds.push(list[0].id);
          continue;
        }
        // Keep verified first, then highest heat, then oldest
        const sorted = [...list].sort((a, b) => {
          if (a.verified !== b.verified) return a.verified ? -1 : 1;
          if ((b.heat || 0) !== (a.heat || 0))
            return (b.heat || 0) - (a.heat || 0);
          return String(a.created_at).localeCompare(String(b.created_at));
        });
        const keeper = sorted[0];
        keepIds.push(keeper.id);
        const dupes = sorted.slice(1);

        for (const d of dupes) {
          // Move publications to keeper
          await supabase
            .from("discovery_publications")
            .update({
              publisher_id: keeper.id,
              publisher_name: keeper.name,
            })
            .eq("publisher_id", d.id)
            .eq("owner_id", user.id);

          // Delete duplicate entity
          const { error: delErr } = await supabase
            .from("discovery_entities")
            .delete()
            .eq("id", d.id)
            .eq("owner_id", user.id);

          if (!delErr) {
            removed += 1;
            merged += 1;
          }
        }
      }

      results.dedupe = {
        kept: keepIds.length,
        removed,
        mergeOperations: merged,
      };
    }

    return NextResponse.json(results);
  } catch (e) {
    console.error("harden", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** GET — status / counts for current user */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ auth: false });
    }

    const { data: entities } = await supabase
      .from("discovery_entities")
      .select("id, name, slug, type")
      .eq("owner_id", user.id);

    const { count: pubCount } = await supabase
      .from("discovery_publications")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);

    // Detect possible dupes by name+type
    const names = new Map<string, number>();
    for (const e of entities || []) {
      const k = `${e.type}::${(e.name || "").toLowerCase()}`;
      names.set(k, (names.get(k) || 0) + 1);
    }
    const dupeGroups = [...names.values()].filter((n) => n > 1).length;

    return NextResponse.json({
      auth: true,
      entities: (entities || []).length,
      publications: pubCount || 0,
      possibleDupeGroups: dupeGroups,
      actions: ["sync-names", "dedupe-entities", "full"],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ auth: false });
  }
}
