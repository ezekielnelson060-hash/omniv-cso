import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

/**
 * GET ?name=PublisherName&slug=entity-slug
 * Aggregates discovery_view events for this publisher's publications.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") || "").trim();
  const slug = (searchParams.get("slug") || "").trim();

  if (!name && !slug) {
    return NextResponse.json({ error: "name or slug required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* guest */
    }

    if (!url || !service) {
      return NextResponse.json(emptyAudience("Configure Supabase service role"));
    }

    const admin = createAdmin(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let pubQuery = admin
      .from("discovery_publications")
      .select("slug, title, heat, tags, type")
      .limit(200);

    if (name) {
      pubQuery = pubQuery.ilike("publisher_name", name);
    }
    const { data: pubsByName } = await pubQuery;
    let pubs = pubsByName || [];

    if (slug && pubs.length === 0) {
      const { data: ent } = await admin
        .from("discovery_entities")
        .select("id, name")
        .eq("slug", slug)
        .maybeSingle();
      if (ent?.id) {
        const { data: byId } = await admin
          .from("discovery_publications")
          .select("slug, title, heat, tags, type")
          .eq("publisher_id", ent.id)
          .limit(200);
        pubs = byId || [];
      }
    }

    const pubSlugs = new Set((pubs || []).map((p) => p.slug));
    const tagCounts: Record<string, number> = {};
    for (const p of pubs || []) {
      for (const t of p.tags || []) {
        const k = String(t).trim();
        if (k) tagCounts[k] = (tagCounts[k] || 0) + 1;
      }
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceIso = since.toISOString();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: events } = await admin
      .from("app_events")
      .select("name, path, meta, created_at")
      .eq("name", "discovery_view")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(2000);

    let opened = 0;
    let weekOpened = 0;
    const pathBuckets: Record<string, number> = {
      explore: 0,
      home: 0,
      direct: 0,
      share: 0,
      other: 0,
    };

    for (const ev of events || []) {
      const meta = (ev.meta || {}) as Record<string, unknown>;
      const pubSlug =
        typeof meta.publication_slug === "string"
          ? meta.publication_slug
          : null;
      const path = (ev.path || "") as string;
      const matchesPub = pubSlug && pubSlugs.has(pubSlug);
      const matchesPath =
        path.startsWith("/p/") &&
        [...pubSlugs].some((s) => path.includes(`/p/${s}`) || path.endsWith(s));
      const matchesEntity =
        slug &&
        typeof meta.entity_slug === "string" &&
        meta.entity_slug === slug;

      if (!matchesPub && !matchesPath && !matchesEntity) continue;

      opened += 1;
      if (new Date(ev.created_at).getTime() >= weekAgo.getTime()) {
        weekOpened += 1;
      }

      if (path.includes("/explore")) pathBuckets.explore += 1;
      else if (path.includes("/home")) pathBuckets.home += 1;
      else if (path.includes("/p/") || path.includes("/e/"))
        pathBuckets.direct += 1;
      else pathBuckets.other += 1;
    }

    const totalPath =
      pathBuckets.explore +
        pathBuckets.home +
        pathBuckets.direct +
        pathBuckets.share +
        pathBuckets.other || 1;

    const sources = [
      {
        label: "Omniv Explore",
        pct: Math.round((pathBuckets.explore / totalPath) * 100),
      },
      {
        label: "Home feed",
        pct: Math.round((pathBuckets.home / totalPath) * 100),
      },
      {
        label: "Direct / profile",
        pct: Math.round((pathBuckets.direct / totalPath) * 100),
      },
      {
        label: "Other",
        pct: Math.round((pathBuckets.other / totalPath) * 100),
      },
    ].filter((s) => s.pct > 0);

    const maxTag = Math.max(1, ...Object.values(tagCounts));
    const interests = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, n]) => ({
        label,
        w: Math.round((n / maxTag) * 100),
      }));

    const topPubs = [...(pubs || [])]
      .sort((a, b) => (b.heat || 0) - (a.heat || 0))
      .slice(0, 5)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        heat: p.heat || 0,
        type: p.type,
      }));

    const prevOpened = Math.max(0, opened - weekOpened);
    const growthPct =
      prevOpened > 0
        ? Math.round(
            ((weekOpened - prevOpened / 4) / Math.max(1, prevOpened / 4)) * 100
          )
        : weekOpened > 0
          ? 100
          : 0;

    return NextResponse.json({
      ok: true,
      live: true,
      people: opened,
      growthPct: Math.min(999, Math.max(-99, growthPct)),
      weekOpened,
      sources:
        sources.length > 0
          ? sources
          : [{ label: "Not enough data yet", pct: 100 }],
      interests:
        interests.length > 0
          ? interests
          : [{ label: "Publish with tags to learn interests", w: 30 }],
      actions: {
        opened,
        saved: 0,
        followed: 0,
        contacted: 0,
      },
      topPublications: topPubs,
      publicationCount: pubs?.length || 0,
      userId,
    });
  } catch (e) {
    console.error("audience", e);
    return NextResponse.json(emptyAudience("Could not load audience"));
  }
}

function emptyAudience(note?: string) {
  return {
    ok: true,
    live: false,
    note,
    people: 0,
    growthPct: 0,
    weekOpened: 0,
    sources: [{ label: "Waiting for views", pct: 100 }],
    interests: [],
    actions: { opened: 0, saved: 0, followed: 0, contacted: 0 },
    topPublications: [],
    publicationCount: 0,
  };
}
