import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SEED_ENTITIES } from "@/lib/discovery/seed";

const RESERVED = new Set([
  "omniv",
  "admin",
  "settings",
  "explore",
  "home",
  "profile",
  "publish",
  "verify",
  "api",
  "support",
  "help",
  "login",
  "signup",
  "auth",
  "null",
  "undefined",
  "me",
  "you",
  "official",
]);

export function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .replace(/^@+/,
      "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 15);
}

export function validateUsername(u: string): string | null {
  if (u.length < 3) return "Must be at least 3 characters";
  if (u.length > 15) return "Must be 15 characters or fewer";
  if (!/^[a-z][a-z0-9_]*$/.test(u)) {
    return "Must start with a letter; only letters, numbers, underscore";
  }
  if (RESERVED.has(u)) return "This username is reserved";
  return null;
}

async function isTaken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  username: string,
  excludeOwnerId?: string,
  excludeEntityId?: string
): Promise<{ taken: boolean; reason?: string }> {
  if (SEED_ENTITIES.some((e) => e.slug.toLowerCase() === username)) {
    return { taken: true, reason: "Already taken" };
  }

  try {
    const { data: ents } = await supabase
      .from("discovery_entities")
      .select("id, slug, owner_id")
      .ilike("slug", username)
      .limit(10);
    for (const e of ents || []) {
      if (e.slug?.toLowerCase() !== username) continue;
      if (excludeEntityId && e.id === excludeEntityId) continue;
      if (excludeOwnerId && e.owner_id === excludeOwnerId) continue;
      return { taken: true, reason: "Already taken" };
    }
  } catch {
    /* ignore */
  }

  try {
    const { data: rows } = await supabase
      .from("omniv_usernames")
      .select("username, owner_id, entity_id, kind")
      .eq("username", username)
      .limit(1);
    if (rows?.length) {
      const r = rows[0];
      if (
        excludeOwnerId &&
        r.owner_id === excludeOwnerId &&
        (!excludeEntityId || r.entity_id === excludeEntityId || !r.entity_id)
      ) {
        return { taken: false };
      }
      if (excludeEntityId && r.entity_id === excludeEntityId) {
        return { taken: false };
      }
      return { taken: true, reason: "Already taken" };
    }
  } catch {
    /* table may not exist yet */
  }

  try {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", username)
      .limit(5);
    for (const p of profiles || []) {
      const un = (p as { username?: string }).username?.toLowerCase();
      if (un === username && p.id !== excludeOwnerId) {
        return { taken: true, reason: "Already taken" };
      }
    }
  } catch {
    /* no username column */
  }

  return { taken: false };
}

export async function GET(req: NextRequest) {
  const q = normalizeUsername(req.nextUrl.searchParams.get("q") || "");
  const entityId = req.nextUrl.searchParams.get("entityId") || undefined;

  if (!q) {
    return NextResponse.json({
      username: "",
      available: false,
      message: "Enter a username",
    });
  }

  const formatErr = validateUsername(q);
  if (formatErr) {
    return NextResponse.json({
      username: q,
      available: false,
      message: formatErr,
    });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const status = await isTaken(supabase, q, user?.id, entityId);

    if (status.taken) {
      return NextResponse.json({
        username: q,
        available: false,
        message: status.reason || "Already taken",
      });
    }

    return NextResponse.json({
      username: q,
      available: true,
      message: "Available",
    });
  } catch (e) {
    console.error("username check", e);
    return NextResponse.json({
      username: q,
      available: false,
      message: "Could not check availability",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const username = normalizeUsername(String(body.username || ""));
    const entityId = body.entityId ? String(body.entityId) : null;

    const formatErr = validateUsername(username);
    if (formatErr) {
      return NextResponse.json({ error: formatErr }, { status: 400 });
    }

    const status = await isTaken(
      supabase,
      username,
      user.id,
      entityId || undefined
    );
    if (status.taken) {
      return NextResponse.json(
        { error: status.reason || "Already taken" },
        { status: 409 }
      );
    }

    const kind = entityId ? "entity" : "person";

    try {
      if (entityId) {
        await supabase
          .from("omniv_usernames")
          .delete()
          .eq("owner_id", user.id)
          .eq("entity_id", entityId);
      } else {
        await supabase
          .from("omniv_usernames")
          .delete()
          .eq("owner_id", user.id)
          .eq("kind", "person");
      }

      const { error: upErr } = await supabase.from("omniv_usernames").upsert(
        {
          username,
          owner_id: user.id,
          kind,
          entity_id: entityId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "username" }
      );
      if (upErr?.code === "23505") {
        return NextResponse.json({ error: "Already taken" }, { status: 409 });
      }
      if (upErr) console.error("username upsert", upErr);
    } catch (e) {
      console.error("username registry", e);
    }

    if (!entityId) {
      try {
        await supabase.from("profiles").update({ username }).eq("id", user.id);
      } catch {
        /* column may not exist */
      }
    } else {
      try {
        await supabase
          .from("discovery_entities")
          .update({ slug: username })
          .eq("id", entityId)
          .eq("owner_id", user.id);
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({
      ok: true,
      username,
      kind,
      message: "Username updated",
    });
  } catch (e) {
    console.error("username post", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
