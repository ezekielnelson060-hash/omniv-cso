import { NextResponse } from "next/server";
import { createClient as createService } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createService(url, key);
}

export async function GET() {
  try {
    const svc = service();
    if (!svc) {
      return NextResponse.json({ audits: [], cities: [] });
    }

    const { data: audits } = await svc
      .from("public_audits")
      .select(
        "id, share_slug, source_type, artist_name, headline, overall_score, created_at"
      )
      .order("overall_score", { ascending: false })
      .limit(40);

    const { data: fans } = await svc
      .from("fans")
      .select("city, would_attend")
      .not("city", "is", null)
      .limit(5000);

    const map = new Map<string, { fans: number; ready: number }>();
    for (const f of fans || []) {
      const city = String(f.city || "").trim();
      if (!city) continue;
      const cur = map.get(city) || { fans: 0, ready: 0 };
      cur.fans += 1;
      if (f.would_attend) cur.ready += 1;
      map.set(city, cur);
    }
    const cities = [...map.entries()]
      .map(([city, v]) => ({ city, ...v }))
      .sort((a, b) => b.ready - a.ready || b.fans - a.fans)
      .slice(0, 25);

    return NextResponse.json({
      audits: audits || [],
      cities,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Failed",
        audits: [],
        cities: [],
      },
      { status: 500 }
    );
  }
}
