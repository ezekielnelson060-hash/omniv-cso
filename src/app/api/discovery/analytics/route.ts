import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Real owner analytics from discovery_signals + follows + saves + publications.
 * GET ?range=7d|30d|90d|1y&entityId=
 */
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ auth: false });
    }

    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") || "30d") as string;
    const entityId = searchParams.get("entityId");
    const days =
      range === "7d" ? 7 : range === "90d" ? 90 : range === "1y" ? 365 : 30;
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    // Owned publications (optionally scoped to entity)
    let pubQ = supabase
      .from("discovery_publications")
      .select("id, slug, title, type, heat, publisher_id, publisher_name")
      .eq("owner_id", user.id)
      .limit(200);
    if (entityId) pubQ = pubQ.eq("publisher_id", entityId);
    const { data: pubs } = await pubQ;
    const slugs = (pubs || []).map((p) => p.slug).filter(Boolean);

    // Signals on those publications (owner can read via policy)
    let views = 0;
    let opens = 0;
    let completes = 0;
    let likes = 0;
    let shares = 0;
    const sourceCounts: Record<string, number> = {};

    if (slugs.length > 0) {
      const { data: signals } = await supabase
        .from("discovery_signals")
        .select("kind, source, publication_slug, weight, created_at")
        .in("publication_slug", slugs)
        .gte("created_at", since)
        .limit(2000);

      for (const s of signals || []) {
        const k = String(s.kind || "");
        if (k === "view") views += 1;
        else if (k === "open") opens += 1;
        else if (k === "complete") completes += 1;
        else if (k === "like") likes += 1;
        else if (k === "share") shares += 1;
        const src = String(s.source || "direct");
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      }
    }

    // Follows targeting owned entities
    const { data: entities } = await supabase
      .from("discovery_entities")
      .select("id, type, slug, name")
      .eq("owner_id", user.id);

    let follows = 0;
    for (const e of entities || []) {
      if (entityId && e.id !== entityId) continue;
      const { count } = await supabase
        .from("discovery_follows")
        .select("id", { count: "exact", head: true })
        .eq("target_type", e.type)
        .eq("target_slug", e.slug)
        .gte("created_at", since);
      follows += count || 0;
    }

    // Saves of owned pubs
    let saves = 0;
    if (slugs.length > 0) {
      const { count } = await supabase
        .from("discovery_saves")
        .select("id", { count: "exact", head: true })
        .eq("kind", "publication")
        .in("target_slug", slugs)
        .gte("created_at", since);
      saves = count || 0;
    }

    const totalHeat = (pubs || []).reduce(
      (s, p) => s + Number(p.heat || 0),
      0
    );

    return NextResponse.json({
      auth: true,
      range,
      real: true,
      publications: (pubs || []).length,
      heat: totalHeat,
      metrics: {
        views: views || opens, // open is primary discovery_view equivalent
        opens,
        completes,
        likes,
        shares,
        saves,
        follows,
        qualified: saves + follows + completes + likes,
      },
      sources: sourceCounts,
      topPublications: [...(pubs || [])]
        .sort((a, b) => Number(b.heat || 0) - Number(a.heat || 0))
        .slice(0, 12)
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          type: p.type,
          heat: p.heat || 0,
        })),
    });
  } catch (e) {
    console.error("analytics", e);
    return NextResponse.json({ auth: false, error: "Server error" });
  }
}
