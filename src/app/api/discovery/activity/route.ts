import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET — activity on the current user's publications & entities
 * (follows, saves, likes) so owners see what happened to them.
 */
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ auth: false, items: [] });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 40), 100);

    const { data: pubs } = await supabase
      .from("discovery_publications")
      .select("id, slug, title, type")
      .eq("owner_id", user.id)
      .limit(200);

    const { data: entities } = await supabase
      .from("discovery_entities")
      .select("id, slug, name, type")
      .eq("owner_id", user.id)
      .limit(100);

    const pubSlugs = new Set((pubs || []).map((p) => p.slug));
    const pubBySlug = new Map((pubs || []).map((p) => [p.slug, p]));
    const entityKeys = new Set(
      (entities || []).map((e) => `${e.type}:${e.slug}`)
    );
    const entityByKey = new Map(
      (entities || []).map((e) => [`${e.type}:${e.slug}`, e])
    );

    type Item = {
      id: string;
      kind: "follow" | "save" | "like";
      title: string;
      body?: string;
      href?: string;
      createdAt: string;
    };
    const items: Item[] = [];

    // Follows on owned entities
    if ((entities || []).length > 0) {
      const { data: follows } = await supabase
        .from("discovery_follows")
        .select("id, target_type, target_slug, user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(80);

      for (const f of follows || []) {
        const key = `${f.target_type}:${f.target_slug}`;
        if (!entityKeys.has(key)) continue;
        if (f.user_id === user.id) continue;
        const ent = entityByKey.get(key);
        items.push({
          id: `follow-${f.id}`,
          kind: "follow",
          title: "New follower",
          body: ent ? `Someone followed ${ent.name}` : "Someone followed you",
          href: ent ? `/e/${ent.type}/${ent.slug}` : undefined,
          createdAt: f.created_at,
        });
      }
    }

    // Saves on owned publications
    if (pubSlugs.size > 0) {
      const { data: saves } = await supabase
        .from("discovery_saves")
        .select(
          "id, kind, target_type, target_slug, target_name, user_id, created_at"
        )
        .eq("kind", "publication")
        .order("created_at", { ascending: false })
        .limit(80);

      for (const s of saves || []) {
        if (!pubSlugs.has(s.target_slug)) continue;
        if (s.user_id === user.id) continue;
        const pub = pubBySlug.get(s.target_slug);
        items.push({
          id: `save-${s.id}`,
          kind: "save",
          title: "Saved",
          body: pub
            ? `Someone saved “${pub.title}”`
            : `Someone saved ${s.target_name || s.target_slug}`,
          href: `/p/${s.target_slug}`,
          createdAt: s.created_at,
        });
      }
    }

    // Likes via signals if available
    try {
      const { data: likes } = await supabase
        .from("discovery_signals")
        .select("id, event, publication_slug, user_id, created_at")
        .eq("event", "like")
        .order("created_at", { ascending: false })
        .limit(80);

      for (const l of likes || []) {
        const slug = l.publication_slug as string | null;
        if (!slug || !pubSlugs.has(slug)) continue;
        if (l.user_id === user.id) continue;
        const pub = pubBySlug.get(slug);
        items.push({
          id: `like-${l.id}`,
          kind: "like",
          title: "Liked",
          body: pub
            ? `Someone liked “${pub.title}”`
            : `Someone liked a publication`,
          href: `/p/${slug}`,
          createdAt: l.created_at,
        });
      }
    } catch {
      /* signals table optional */
    }

    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      auth: true,
      items: items.slice(0, limit),
      real: true,
    });
  } catch (e) {
    console.error("activity", e);
    return NextResponse.json({ auth: false, items: [] });
  }
}
