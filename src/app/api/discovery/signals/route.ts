import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const WEIGHTS: Record<string, number> = {
  view: 0.05,
  open: 0.35,
  like: 0.55,
  save: 1.0,
  follow: 1.2,
  share: 0.9,
  search: 0.7,
  complete: 0.85,
  contact: 1.1,
  skip: -0.25,
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, auth: false }, { status: 401 });
    }

    const body = await req.json();
    const kind = String(body.kind || "").trim();
    if (!kind || !(kind in WEIGHTS)) {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }

    const tags = Array.isArray(body.tags)
      ? body.tags
          .map((t: unknown) => String(t).toLowerCase().trim())
          .filter(Boolean)
          .slice(0, 12)
      : [];

    const { error } = await supabase.from("discovery_signals").insert({
      user_id: user.id,
      kind,
      publication_slug: body.publicationSlug
        ? String(body.publicationSlug)
        : null,
      entity_type: body.entityType ? String(body.entityType) : null,
      entity_slug: body.entitySlug ? String(body.entitySlug) : null,
      tags,
      category: body.category ? String(body.category) : null,
      source: body.source ? String(body.source).slice(0, 120) : "direct",
      weight: WEIGHTS[kind],
    });

    if (error) {
      return NextResponse.json({
        ok: false,
        error: error.message,
        hint: "Run migration 037_v2_verification_signals.sql",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ auth: false, weights: {} });
    }

    const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const { data, error } = await supabase
      .from("discovery_signals")
      .select("tags, weight, kind, created_at, publication_slug, source")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !data) {
      return NextResponse.json({
        auth: true,
        weights: {},
        error: error?.message,
      });
    }

    const weights: Record<string, number> = {};
    const topicMomentum: Record<string, number> = {};
    const publicationMomentum: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};
    const now = Date.now();
    for (const row of data) {
      const tags = Array.isArray(row.tags) ? row.tags : [];
      const ageHours = Math.max(
        0,
        (now - new Date(row.created_at).getTime()) / 3_600_000
      );
      const recency = Math.exp(-ageHours / 72);
      const contribution = Number(row.weight || 0) * recency;
      const source = String(row.source || "direct");
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      for (const t of tags) {
        const key = String(t).toLowerCase();
        if (!key) continue;
        weights[key] = Math.max(
          -2,
          Math.min(5, (weights[key] || 0) + Number(row.weight || 0))
        );
        topicMomentum[key] = (topicMomentum[key] || 0) + contribution;
      }
      if (row.publication_slug) {
        const slug = String(row.publication_slug);
        publicationMomentum[slug] =
          (publicationMomentum[slug] || 0) + contribution;
      }
    }

    const normalize = (values: Record<string, number>) => {
      const max = Math.max(1, ...Object.values(values).map((v) => Math.abs(v)));
      return Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          Math.max(0, Math.min(1, value / max)),
        ])
      );
    };

    return NextResponse.json({
      auth: true,
      weights,
      topicMomentum: normalize(topicMomentum),
      publicationMomentum: normalize(publicationMomentum),
      sources: sourceCounts,
      count: data.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ auth: false, weights: {} });
  }
}
