import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  aggregateFanCities,
  buildMarketDemandReport,
} from "@/lib/strategy/market-demand";

export const runtime = "nodejs";

/**
 * GET /api/demand/market
 * Market Demand Score from owned Fan Gate data for the signed-in artist's roster.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: artists, error: artistErr } = await supabase
      .from("roster_artists")
      .select("id, stage_name, slug")
      .or(`owner_user_id.eq.${user.id},user_id.eq.${user.id}`);

    if (artistErr) {
      console.warn("[demand/market] roster", artistErr.message);
    }

    let artistIds = (artists || []).map((a) => a.id as string);

    if (artistIds.length === 0) {
      const { data: alt } = await supabase
        .from("roster_artists")
        .select("id")
        .eq("owner_user_id", user.id);
      artistIds = (alt || []).map((a) => a.id as string);
    }

    let fanRows: { city?: string | null; would_attend?: boolean | null }[] =
      [];

    if (artistIds.length > 0) {
      const { data: fans, error: fanErr } = await supabase
        .from("fans")
        .select("city, would_attend")
        .in("artist_id", artistIds)
        .limit(5000);
      if (fanErr) {
        console.warn("[demand/market] fans", fanErr.message);
      } else {
        fanRows = fans || [];
      }
    } else {
      const { data: fans } = await supabase
        .from("fans")
        .select("city, would_attend")
        .limit(5000);
      fanRows = fans || [];
    }

    const cities = aggregateFanCities(fanRows);
    const report = buildMarketDemandReport(cities);

    return NextResponse.json({
      ok: true,
      report,
      artistCount: artistIds.length,
      artists: (artists || []).map((a) => ({
        id: a.id,
        name: a.stage_name,
        slug: a.slug,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Demand scan failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
