import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { rosterLimitForPlan } from "@/lib/roster-limits";
import { mergePublicPage, type ArtistPublicPage } from "@/lib/artist-public-page";

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || `artist-${Date.now().toString(36)}`
  );
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceClient(url, key, { auth: { persistSession: false } });
}

async function getPlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data } = await supabase
    .from("profiles")
    .select("plan, plan_status, billing_status, full_name")
    .eq("id", userId)
    .maybeSingle();
  const paid =
    data?.plan_status === "active" ||
    data?.billing_status === "active" ||
    data?.billing_status === "paid";
  if (!paid && data?.plan && data.plan !== "free") {
    return {
      plan: "free" as string,
      fullName: data?.full_name as string | null,
    };
  }
  return {
    plan: (data?.plan as string) || "free",
    fullName: (data?.full_name as string) || null,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ artists: [], max: 1, count: 0 });

    const { plan } = await getPlan(supabase, user.id);
    const max = rosterLimitForPlan(plan);
    const admin = adminClient();
    const db = admin || supabase;

    const { data } = await db
      .from("roster_artists")
      .select("id, stage_name, slug, genre, public_page")
      .eq("owner_user_id", user.id)
      .order("stage_name")
      .limit(max);

    return NextResponse.json({
      artists: data || [],
      max,
      count: (data || []).length,
      plan,
    });
  } catch (e) {
    console.error("[roster GET]", e);
    return NextResponse.json({ artists: [], max: 1, count: 0 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      stageName?: string;
      genre?: string;
      slug?: string;
    };

    const { plan, fullName } = await getPlan(supabase, user.id);
    const max = rosterLimitForPlan(plan);

    let stageName = body.stageName?.trim();
    if (!stageName || stageName === "My tip jar") {
      stageName = fullName?.trim() || "My tip jar";
    }

    const admin = adminClient();
    const db = admin || supabase;

    const { count } = await db
      .from("roster_artists")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", user.id);

    if ((count ?? 0) >= max) {
      const { data: existingList } = await db
        .from("roster_artists")
        .select("id, stage_name, slug, genre")
        .eq("owner_user_id", user.id)
        .limit(1);
      if (existingList?.[0]?.slug) {
        return NextResponse.json({
          artist: existingList[0],
          max,
          plan,
          reused: true,
        });
      }
      return NextResponse.json(
        {
          error: `Roster limit reached (${max} on ${plan}). Upgrade to add more.`,
          max,
          plan,
        },
        { status: 403 }
      );
    }

    let slug = body.slug?.trim() || slugify(stageName);
    const { data: existing } = await db
      .from("roster_artists")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const row: Record<string, unknown> = {
      stage_name: stageName,
      slug,
      genre: body.genre?.trim() || null,
      owner_user_id: user.id,
    };

    const { data: artist, error } = await db
      .from("roster_artists")
      .insert(row)
      .select("id, stage_name, slug, genre")
      .single();

    if (error || !artist) {
      return NextResponse.json(
        { error: error?.message || "Could not create" },
        { status: 500 }
      );
    }

    return NextResponse.json({ artist, max, plan });
  } catch (e) {
    console.error("[roster POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      id?: string;
      slug?: string;
      stageName?: string;
      gateTagline?: string | null;
      tipTagline?: string | null;
      publicPage?: ArtistPublicPage;
    };

    if (!body.id && !body.slug) {
      return NextResponse.json({ error: "id or slug required" }, { status: 400 });
    }

    const admin = adminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Server missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 503 }
      );
    }

    // Find the row first (by id or slug), then verify ownership
    let find = admin.from("roster_artists").select(
      "id, owner_user_id, stage_name, slug, public_page"
    );
    if (body.id) find = find.eq("id", body.id);
    else find = find.eq("slug", body.slug!);

    const { data: foundRaw } = await find.maybeSingle();
    const found = foundRaw as {
      id: string;
      owner_user_id?: string | null;
      stage_name?: string;
      slug?: string;
      public_page?: unknown;
    } | null;

    if (!found) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    // Allow if owner matches OR owner is null (claim it)
    if (found.owner_user_id && found.owner_user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (!found.owner_user_id) updates.owner_user_id = user.id;
    if (body.stageName?.trim()) updates.stage_name = body.stageName.trim();
    if (body.gateTagline !== undefined) {
      updates.gate_tagline = body.gateTagline?.trim() || null;
    }
    if (body.tipTagline !== undefined) {
      updates.tip_tagline = body.tipTagline?.trim() || null;
    }
    if (body.publicPage !== undefined) {
      updates.public_page = mergePublicPage(body.publicPage);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "nothing to update" }, { status: 400 });
    }

    const { data: updatedRaw, error } = await admin
      .from("roster_artists")
      .update(updates)
      .eq("id", found.id)
      .select("id, stage_name, slug, genre, public_page")
      .single();

    if (error) {
      console.error("[roster PATCH]", error);
      return NextResponse.json(
        {
          error: /public_page/i.test(error.message)
            ? "Run migration 024_artist_public_page.sql in Supabase"
            : error.message,
        },
        { status: 500 }
      );
    }

    const updated = updatedRaw as {
      id: string;
      stage_name?: string;
      slug?: string;
      public_page?: unknown;
    };

    const page = mergePublicPage(updated.public_page);

    return NextResponse.json({
      ok: true,
      artist: updated,
      page,
      // debug fields so UI can prove write stuck
      savedMessageTop: page.messageTop || "",
      savedTrackTitle: page.track?.title || "",
      savedSpotify: page.track?.spotifyUrl || "",
    });
  } catch (e) {
    console.error("[roster PATCH]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
