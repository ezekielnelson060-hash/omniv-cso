import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Real owner analytics from discovery_signals + follows + saves + publications + video events.
 * GET ?range=7d|30d|90d|1y&entityId=
 * Returns aggregate metrics, per-publication breakdown, daily series, and video funnel.
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

    let pubQ = supabase
      .from("discovery_publications")
      .select("id, slug, title, type, heat, publisher_id, publisher_name, published_at")
      .eq("owner_id", user.id)
      .limit(200);
    if (entityId) pubQ = pubQ.eq("publisher_id", entityId);
    const { data: pubs } = await pubQ;
    const slugs = (pubs || []).map((p) => p.slug).filter(Boolean);

    let views = 0;
    let opens = 0;
    let completes = 0;
    let likes = 0;
    let shares = 0;
    let videoPlays = 0;
    let videoCompletes = 0;
    let videoProgress25 = 0;
    let videoProgress50 = 0;
    let videoProgress75 = 0;
    let videoProgress90 = 0;
    const sourceCounts: Record<string, number> = {};
    const bySlug: Record<
      string,
      {
        views: number;
        opens: number;
        completes: number;
        likes: number;
        shares: number;
        videoPlays: number;
        videoCompletes: number;
      }
    > = {};
    const dayBucket: Record<
      string,
      { views: number; opens: number; saves: number; plays: number }
    > = {};

    function ensureSlug(slug: string) {
      if (!bySlug[slug]) {
        bySlug[slug] = {
          views: 0,
          opens: 0,
          completes: 0,
          likes: 0,
          shares: 0,
          videoPlays: 0,
          videoCompletes: 0,
        };
      }
      return bySlug[slug];
    }

    function dayKey(iso: string) {
      try {
        return new Date(iso).toISOString().slice(0, 10);
      } catch {
        return "unknown";
      }
    }

    function ensureDay(d: string) {
      if (!dayBucket[d]) {
        dayBucket[d] = { views: 0, opens: 0, saves: 0, plays: 0 };
      }
      return dayBucket[d];
    }

    if (slugs.length > 0) {
      const { data: signals } = await supabase
        .from("discovery_signals")
        .select("kind, source, publication_slug, weight, created_at")
        .in("publication_slug", slugs)
        .gte("created_at", since)
        .limit(5000);

      for (const s of signals || []) {
        const k = String(s.kind || "");
        const slug = String(s.publication_slug || "");
        const row = slug ? ensureSlug(slug) : null;
        const day = ensureDay(dayKey(String(s.created_at || "")));

        if (k === "view") {
          views += 1;
          if (row) row.views += 1;
          day.views += 1;
        } else if (k === "open") {
          opens += 1;
          if (row) row.opens += 1;
          day.opens += 1;
        } else if (k === "complete") {
          completes += 1;
          if (row) row.completes += 1;
        } else if (k === "like") {
          likes += 1;
          if (row) row.likes += 1;
        } else if (k === "share") {
          shares += 1;
          if (row) row.shares += 1;
        } else if (k === "save") {
          day.saves += 1;
        }
        const src = String(s.source || "direct");
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      }

      try {
        const { data: events } = await supabase
          .from("app_events")
          .select("name, meta, created_at")
          .in("name", ["video_play", "video_complete", "video_progress"])
          .gte("created_at", since)
          .limit(5000);

        for (const ev of events || []) {
          const meta = (ev.meta || {}) as Record<string, unknown>;
          const slug = String(meta.publication_slug || "");
          if (!slug || !slugs.includes(slug)) continue;
          const row = ensureSlug(slug);
          const day = ensureDay(dayKey(String(ev.created_at || "")));
          if (ev.name === "video_play") {
            videoPlays += 1;
            row.videoPlays += 1;
            day.plays += 1;
          }
          if (ev.name === "video_complete") {
            videoCompletes += 1;
            row.videoCompletes += 1;
          }
          if (ev.name === "video_progress") {
            const pct = Number(meta.percent || meta.pct || 0);
            if (pct >= 90) videoProgress90 += 1;
            else if (pct >= 75) videoProgress75 += 1;
            else if (pct >= 50) videoProgress50 += 1;
            else if (pct >= 25) videoProgress25 += 1;
          }
        }
      } catch {
        /* app_events may not be readable by owners yet */
      }
    }

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

    const byPublication = (pubs || [])
      .map((p) => {
        const stats = bySlug[p.slug] || {
          views: 0,
          opens: 0,
          completes: 0,
          likes: 0,
          shares: 0,
          videoPlays: 0,
          videoCompletes: 0,
        };
        const engagement =
          stats.opens +
          stats.completes +
          stats.likes +
          stats.shares +
          stats.videoPlays +
          stats.videoCompletes;
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          type: p.type,
          heat: p.heat || 0,
          publishedAt: p.published_at || null,
          ...stats,
          engagement,
          completionRate:
            stats.videoPlays > 0
              ? Math.round((stats.videoCompletes / stats.videoPlays) * 100)
              : stats.opens > 0
                ? Math.round((stats.completes / stats.opens) * 100)
                : 0,
        };
      })
      .sort((a, b) => b.engagement - a.engagement || b.heat - a.heat);

    const series = Object.entries(dayBucket)
      .filter(([d]) => d !== "unknown")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    const funnel = {
      views: views || opens,
      opens,
      saves,
      follows,
      videoPlays,
      videoProgress25,
      videoProgress50,
      videoProgress75,
      videoProgress90,
      videoCompletes,
      completes,
    };

    return NextResponse.json({
      auth: true,
      range,
      real: true,
      publications: (pubs || []).length,
      heat: totalHeat,
      metrics: {
        views: views || opens,
        opens,
        completes,
        likes,
        shares,
        saves,
        follows,
        videoPlays,
        videoCompletes,
        qualified: saves + follows + completes + likes + videoCompletes,
      },
      funnel,
      series,
      sources: sourceCounts,
      byPublication: byPublication.slice(0, 25),
      topPublications: byPublication.slice(0, 12).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        type: p.type,
        heat: p.heat,
        opens: p.opens,
        videoPlays: p.videoPlays,
        videoCompletes: p.videoCompletes,
        completionRate: p.completionRate,
      })),
    });
  } catch (e) {
    console.error("analytics", e);
    return NextResponse.json({ auth: false, error: "Server error" });
  }
}
