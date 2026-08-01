import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Export owned fans as CSV for Mailchimp / Brevo / Klaviyo import.
 * GET /api/fans/export?artistId=...&tier=Superfan
 * Auth required (user must own roster via RLS path — uses service role after membership check).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artistId = searchParams.get("artistId");
  const tier = searchParams.get("tier");

  if (!artistId) {
    return NextResponse.json({ error: "artistId required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const cookieStore = await cookies();
  const userClient = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false },
  });

  // Verify roster access
  const { data: artist } = await admin
    .from("roster_artists")
    .select("id, org_id, stage_name")
    .eq("id", artistId)
    .maybeSingle();

  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const { data: org } = await admin
    .from("orgs")
    .select("owner_user_id")
    .eq("id", artist.org_id)
    .maybeSingle();

  const { data: member } = await admin
    .from("org_members")
    .select("id")
    .eq("org_id", artist.org_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (org?.owner_user_id !== user.id && !member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let q = admin
    .from("fans")
    .select(
      "email, first_name, last_name, city, country_code, fan_tier, engagement_score, acquisition_source, is_email_subscribed, created_at"
    )
    .eq("artist_id", artistId)
    .eq("is_email_subscribed", true)
    .order("created_at", { ascending: false })
    .limit(10000);

  if (tier) q = q.eq("fan_tier", tier);

  const { data: fans, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header =
    "email,first_name,last_name,city,country,tier,score,source,subscribed,created_at";
  const rows = (fans || []).map((f) =>
    [
      f.email,
      f.first_name || "",
      f.last_name || "",
      f.city || "",
      f.country_code || "",
      f.fan_tier || "",
      f.engagement_score ?? 0,
      f.acquisition_source || "",
      f.is_email_subscribed ? "yes" : "no",
      f.created_at || "",
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [header, ...rows].join("\n");
  const filename = `${(artist.stage_name || "fans").replace(/\s+/g, "-").toLowerCase()}-export.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
