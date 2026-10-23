import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createService } from "@supabase/supabase-js";
import { listLivePublications } from "@/lib/discovery/db";
import {
  rankRisingTopics,
  shouldShowRising,
  type RisingTopic,
} from "@/lib/discovery/rising-topics";

export const dynamic = "force-dynamic";

const WINDOW_HOURS = 72;

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createService(url, key, { auth: { persistSession: false } });
}

/**
 * GET /api/discovery/rising
 * Network + personal rising topics from recent signals and live publications.
 * Refreshes as activity lands — not a fixed seed list.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const since = new Date(
      Date.now() - WINDOW_HOURS * 3_600_000
    ).toISOString();

    const signalMomentum: Record<string, number> = {};
    const now = Date.now();

    // Prefer network-wide signals (service role). Fallback: current user only.
    const svc = serviceClient();
    const db = svc || supabase;

    try {
      let q = db
        .from("discovery_signals")
        .select("tags, weight, kind, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(svc ? 2000 : 500);

      // Without service role, RLS usually scopes to the signed-in user
      if (!svc && user) {
        q = q.eq("user_id", user.id);
      }

      const { data: rows } = await q;
      if (Array.isArray(rows)) {
        for (const row of rows) {
          const tags = Array.isArray(row.tags) ? row.tags : [];
          const ageHours = Math.max(
            0,
            (now - new Date(row.created_at).getTime()) / 3_600_000
          );
          // Stronger weight on last 24h
          const recency = Math.exp(-ageHours / 36);
          const w = Number(row.weight || 0) * recency;
          // Skip pure negatives for rising list
          if (w <= 0) continue;
          for (const t of tags) {
            const key = String(t).toLowerCase().trim();
            if (key.length < 3) continue;
            signalMomentum[key] = (signalMomentum[key] || 0) + w;
          }
        }
      }
    } catch {
      /* table missing or RLS — continue with publications */
    }

    const pubs = await listLivePublications(supabase, 120);
    const topics: RisingTopic[] = rankRisingTopics(
      pubs.map((p) => ({
        tags: p.tags,
        category: p.category,
        heat: p.heat,
        publishedAt: p.publishedAt,
      })),
      signalMomentum,
      8
    );

    const show = shouldShowRising(topics);

    return NextResponse.json({
      topics: show ? topics.slice(0, 6) : [],
      windowHours: WINDOW_HOURS,
      signalTopics: Object.keys(signalMomentum).length,
      publicationCount: pubs.length,
      network: Boolean(svc),
      auth: Boolean(user),
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error("rising", e);
    return NextResponse.json({
      topics: [],
      error: "failed",
    });
  }
}
