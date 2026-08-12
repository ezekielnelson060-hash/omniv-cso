import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { rosterLimitForPlan } from "@/lib/roster-limits";

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
    if (!admin) {
      console.warn(
        "[roster POST] SUPABASE_SERVICE_ROLE_KEY missing — tip create may hit RLS"
      );
    }

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
      const msg = error?.message || "Could not create tip link";
      if (/orgs|recursion/i.test(msg)) {
        return NextResponse.json(
          {
            error:
              "Database policy still blocks tip links. Run migration 021_fix_rls_no_orgs_recursion.sql in Supabase SQL Editor, then try again.",
            code: "RLS_ORGS",
          },
          { status: 500 }
        );
      }
      if (/org_id|null value/i.test(msg)) {
        return NextResponse.json(
          {
            error:
              "Run migration 021_fix_rls_no_orgs_recursion.sql in Supabase (makes org_id optional for solo tip links).",
            code: "ORG_ID_REQUIRED",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: msg }, { status: 500 });
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
