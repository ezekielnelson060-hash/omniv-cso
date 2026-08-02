import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

async function getPlan(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("plan, plan_status, billing_status")
    .eq("id", userId)
    .maybeSingle();
  const paid =
    data?.plan_status === "active" ||
    data?.billing_status === "active" ||
    data?.billing_status === "paid";
  if (!paid && data?.plan && data.plan !== "free") {
    // unpaid claimed plan → treat as free for limits
    return "free";
  }
  return data?.plan || "free";
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ artists: [], max: 1, count: 0 });

    const plan = await getPlan(supabase, user.id);
    const max = rosterLimitForPlan(plan);

    let { data, error } = await supabase
      .from("roster_artists")
      .select("id, stage_name, slug, genre, org_id")
      .eq("owner_user_id", user.id)
      .order("stage_name")
      .limit(max);

    if (error) {
      const fallback = await supabase
        .from("roster_artists")
        .select("id, stage_name, slug, genre, org_id")
        .order("stage_name")
        .limit(max);
      data = fallback.data;
    }

    const artists = data || [];
    return NextResponse.json({
      artists,
      max,
      count: artists.length,
      plan,
    });
  } catch (e) {
    console.error(e);
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
    const stageName = body.stageName?.trim();
    if (!stageName)
      return NextResponse.json({ error: "stageName required" }, { status: 400 });

    const plan = await getPlan(supabase, user.id);
    const max = rosterLimitForPlan(plan);

    const { count } = await supabase
      .from("roster_artists")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", user.id);

    if ((count ?? 0) >= max) {
      return NextResponse.json(
        {
          error: `Roster limit reached (${max} artists on ${plan}). Upgrade to add more.`,
          max,
          plan,
        },
        { status: 403 }
      );
    }

    let slug = body.slug?.trim() || slugify(stageName);
    const { data: existing } = await supabase
      .from("roster_artists")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    let orgId: string | null = null;
    const { data: org } = await supabase
      .from("orgs")
      .select("id")
      .eq("owner_user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (org?.id) {
      orgId = org.id;
    } else {
      const { data: created } = await supabase
        .from("orgs")
        .insert({
          name: "My Workspace",
          kind: "manager",
          owner_user_id: user.id,
        })
        .select("id")
        .single();
      orgId = created?.id ?? null;
    }

    const row: Record<string, unknown> = {
      stage_name: stageName,
      slug,
      genre: body.genre?.trim() || null,
      owner_user_id: user.id,
    };
    if (orgId) row.org_id = orgId;

    const { data: artist, error } = await supabase
      .from("roster_artists")
      .insert(row)
      .select("id, stage_name, slug, genre, org_id")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ artist, max, plan });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
