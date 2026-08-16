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

    let artists: {
      id?: string;
      stage_name?: string;
      slug?: string;
      genre?: string | null;
    }[] = [];

    const { data, error } = await supabase
      .from("roster_artists")
      .select("id, stage_name, slug, genre")
      .eq("owner_user_id", user.id)
      .order("stage_name")
      .limit(max);

    if (!error && data) {
      artists = data;
    } else {
      const admin = adminClient();
      if (admin) {
        const { data: rows } = await admin
          .from("roster_artists")
          .select("id, stage_name, slug, genre")
          .eq("owner_user_id", user.id)
          .order("stage_name")
          .limit(max);
        artists = rows || [];
      }
    }

    return NextResponse.json({
      artists,
      max,
      count: artists.length,
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
      console.error("[roster POST]", error);
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

    const updates: Record<string, unknown> = {};
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

    // Prefer service role so public_page writes aren't blocked by RLS
    const admin = adminClient();
    const db = admin || supabase;

    let q = db
      .from("roster_artists")
      .update(updates)
      .eq("owner_user_id", user.id);
    if (body.id) q = q.eq("id", body.id);
    else q = q.eq("slug", body.slug!);

    const { data, error } = await q
      .select("id, stage_name, slug, genre, public_page")
      .maybeSingle();

    if (error) {
      if (/public_page|column/i.test(error.message)) {
        return NextResponse.json(
          {
            error:
              "Run migration 024_artist_public_page.sql in Supabase SQL Editor.",
            code: "NEED_MIGRATION",
          },
          { status: 400 }
        );
      }
      if (/gate_tagline|tip_tagline|column/i.test(error.message)) {
        const onlyName: Record<string, unknown> = {};
        if (updates.stage_name) onlyName.stage_name = updates.stage_name;
        if (updates.public_page) onlyName.public_page = updates.public_page;
        if (!Object.keys(onlyName).length) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          );
        }
        let q2 = db
          .from("roster_artists")
          .update(onlyName)
          .eq("owner_user_id", user.id);
        if (body.id) q2 = q2.eq("id", body.id);
        else q2 = q2.eq("slug", body.slug!);
        const retry = await q2
          .select("id, stage_name, slug, genre, public_page")
          .maybeSingle();
        if (retry.error) {
          return NextResponse.json(
            { error: retry.error.message },
            { status: 500 }
          );
        }
        return NextResponse.json({
          artist: retry.data,
          page: mergePublicPage(
            (retry.data as { public_page?: unknown } | null)?.public_page
          ),
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Artist not found for your account" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      artist: data,
      page: mergePublicPage(
        (data as { public_page?: unknown }).public_page
      ),
    });
  } catch (e) {
    console.error("[roster PATCH]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
