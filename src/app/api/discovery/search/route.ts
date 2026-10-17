import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchDiscovery } from "@/lib/discovery/search";
import { listLivePublications } from "@/lib/discovery/db";
import { SEED_ENTITIES } from "@/lib/discovery/seed";

/**
 * Discovery search API.
 * Prefer Postgres FTS when search_vector is available; fall back to in-memory scoring.
 * GET ?q=&type=&limit=
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const type = (searchParams.get("type") || "").trim().toLowerCase();
    const limit = Math.min(40, Math.max(1, Number(searchParams.get("limit") || 24)));

    if (!q) {
      return NextResponse.json({ results: [], source: "empty" });
    }

    let supabase = null as Awaited<ReturnType<typeof createClient>> | null;
    try {
      supabase = await createClient();
    } catch {
      supabase = null;
    }

    if (supabase) {
      try {
        const safeQ = q.replace(/[^\w\s-]/g, " ").trim();
        if (safeQ) {
          let query = supabase
            .from("discovery_publications")
            .select(
              "id, slug, title, summary, type, category, tags, heat, publisher_name, publisher_id, cover_url, media_url, published_at, status, visibility"
            )
            .eq("status", "published")
            .eq("visibility", "public")
            .textSearch("search_vector", safeQ, {
              type: "websearch",
              config: "english",
            })
            .order("heat", { ascending: false })
            .limit(limit);

          if (type && type !== "all") {
            query = query.eq("type", type);
          }

          const { data, error } = await query;

          if (!error && data && data.length > 0) {
            const pubResults = data.map((row, i) => ({
              kind: "publication" as const,
              score: Math.max(1, 40 - i),
              typeLabel: String(row.type || "article"),
              item: {
                id: row.id,
                slug: row.slug,
                title: row.title,
                summary: row.summary || "",
                type: row.type,
                category: row.category || "",
                tags: Array.isArray(row.tags) ? row.tags : [],
                heat: Number(row.heat || 0),
                publisherName: row.publisher_name || "",
                publisherId: row.publisher_id || "",
                coverUrl: row.cover_url || undefined,
                mediaUrl: row.media_url || undefined,
                publishedAt: row.published_at || undefined,
              },
            }));

            const { data: ents } = await supabase
              .from("discovery_entities")
              .select("id, slug, name, type, tagline, about, tags, heat, location")
              .or(
                `name.ilike.%${q.replace(/%/g, "").slice(0, 80)}%,tagline.ilike.%${q.replace(/%/g, "").slice(0, 80)}%`
              )
              .limit(12);

            const entityResults = (ents || []).map((e, i) => ({
              kind: "entity" as const,
              score: Math.max(1, 30 - i),
              typeLabel: String(e.type || "person"),
              item: {
                id: e.id,
                slug: e.slug,
                name: e.name,
                type: e.type,
                tagline: e.tagline || "",
                about: e.about || "",
                tags: Array.isArray(e.tags) ? e.tags : [],
                heat: Number(e.heat || 0),
                location: e.location || undefined,
              },
            }));

            const combined = [...pubResults, ...entityResults]
              .sort((a, b) => b.score - a.score)
              .slice(0, limit);

            return NextResponse.json({
              results: combined,
              source: "fts",
              count: combined.length,
            });
          }
        }
      } catch (e) {
        console.warn("search FTS fallback", e);
      }
    }

    const pubs = await listLivePublications(supabase, 200);
    const filtered =
      type && type !== "all" ? pubs.filter((p) => p.type === type) : pubs;
    const results = searchDiscovery(q, filtered, SEED_ENTITIES as never[], limit, {
      type: type || undefined,
    });

    return NextResponse.json({
      results,
      source: "memory",
      count: results.length,
    });
  } catch (e) {
    console.error("search", e);
    return NextResponse.json({ results: [], error: "Server error" }, { status: 500 });
  }
}
