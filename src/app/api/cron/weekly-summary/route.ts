import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWeeklySummaryEmail } from "@/lib/email/engagement";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Monday weekly digest for publishers with activity in the last 7 days.
 * Auth: Authorization: Bearer CRON_SECRET
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY missing", sent: 0 },
      { status: 503 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json({ error: "Supabase missing", sent: 0 }, { status: 503 });
  }

  const supabase = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();

  // Publishers who published in the last week
  const { data: recentPubs } = await supabase
    .from("discovery_publications")
    .select("owner_id, title, slug")
    .eq("status", "published")
    .gte("published_at", since)
    .limit(500);

  const ownerIds = new Set<string>();
  const pubCount = new Map<string, number>();
  const topTitle = new Map<string, string>();
  for (const p of recentPubs || []) {
    if (!p.owner_id) continue;
    ownerIds.add(p.owner_id as string);
    pubCount.set(
      p.owner_id as string,
      (pubCount.get(p.owner_id as string) || 0) + 1
    );
    if (!topTitle.has(p.owner_id as string) && p.title) {
      topTitle.set(p.owner_id as string, p.title as string);
    }
  }

  // Also include owners who received likes this week
  try {
    const { data: likes } = await supabase
      .from("discovery_likes")
      .select("publication_slug")
      .gte("created_at", since)
      .limit(800);
    const slugs = [...new Set((likes || []).map((l) => l.publication_slug as string))];
    if (slugs.length) {
      const { data: likedPubs } = await supabase
        .from("discovery_publications")
        .select("owner_id, slug")
        .in("slug", slugs.slice(0, 200));
      for (const p of likedPubs || []) {
        if (p.owner_id) ownerIds.add(p.owner_id as string);
      }
    }
  } catch {
    /* soft */
  }

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const ownerId of ownerIds) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", ownerId)
        .maybeSingle();

      if (!profile?.email) {
        skipped += 1;
        continue;
      }

      // Approximate likes on their pubs this week
      let likes = 0;
      try {
        const { data: ownSlugs } = await supabase
          .from("discovery_publications")
          .select("slug")
          .eq("owner_id", ownerId)
          .limit(50);
        const slugs = (ownSlugs || []).map((s) => s.slug as string);
        if (slugs.length) {
          const { count } = await supabase
            .from("discovery_likes")
            .select("id", { count: "exact", head: true })
            .in("publication_slug", slugs)
            .gte("created_at", since);
          likes = count || 0;
        }
      } catch {
        /* soft */
      }

      // Follows of their entities this week (best-effort)
      let newFollowers = 0;
      try {
        const { data: ents } = await supabase
          .from("discovery_entities")
          .select("slug, id")
          .eq("owner_id", ownerId)
          .limit(20);
        const entitySlugs = (ents || []).map((e) => e.slug as string).filter(Boolean);
        if (entitySlugs.length) {
          const { count } = await supabase
            .from("discovery_follows")
            .select("id", { count: "exact", head: true })
            .in("target_slug", entitySlugs)
            .gte("created_at", since);
          newFollowers = count || 0;
        }
      } catch {
        /* soft */
      }

      const result = await sendWeeklySummaryEmail({
        to: profile.email as string,
        recipientName: (profile.full_name as string) || undefined,
        stats: {
          newFollowers,
          likes,
          publicationsPublished: pubCount.get(ownerId) || 0,
          topTitle: topTitle.get(ownerId),
        },
      });

      if (result.ok) sent += 1;
      else skipped += 1;
    } catch (e) {
      errors.push(String(e).slice(0, 120));
    }
  }

  return NextResponse.json({
    ok: true,
    sequence: "weekly-summary",
    candidates: ownerIds.size,
    sent,
    skipped,
    errors: errors.slice(0, 5),
  });
}
