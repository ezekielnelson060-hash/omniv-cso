import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: fan } = await admin
    .from("fans")
    .select("id, artist_id")
    .eq("id", id)
    .maybeSingle();
  if (!fan) return NextResponse.json({ error: "Fan not found" }, { status: 404 });

  const { data: artist } = await admin
    .from("roster_artists")
    .select("id, org_id")
    .eq("id", fan.artist_id)
    .maybeSingle();
  if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

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

  const body = (await req.json()) as {
    first_name?: string | null;
    last_name?: string | null;
    city?: string | null;
    country_code?: string | null;
    notes?: string | null;
    tags?: string[];
    fan_tier?: string;
    would_attend?: boolean;
    is_email_subscribed?: boolean;
  };

  const patch: Record<string, unknown> = {};
  if (body.first_name !== undefined) patch.first_name = body.first_name;
  if (body.last_name !== undefined) patch.last_name = body.last_name;
  if (body.city !== undefined) patch.city = body.city;
  if (body.country_code !== undefined) patch.country_code = body.country_code;
  if (body.notes !== undefined) patch.notes = body.notes ?? "";
  if (body.tags !== undefined) {
    patch.tags = Array.from(
      new Set((body.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean))
    );
  }
  if (body.fan_tier !== undefined) patch.fan_tier = body.fan_tier;
  if (body.would_attend !== undefined) patch.would_attend = body.would_attend;
  if (body.is_email_subscribed !== undefined)
    patch.is_email_subscribed = body.is_email_subscribed;

  const { data: updated, error } = await admin
    .from("fans")
    .update(patch)
    .eq("id", id)
    .select(
      "id, email, first_name, last_name, city, country_code, fan_tier, engagement_score, acquisition_source, notes, tags, would_attend, is_email_subscribed, created_at, last_active_at"
    )
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, fan: updated });
}
