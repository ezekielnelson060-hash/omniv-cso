import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_ROSTER = 20;

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || `artist-${Date.now().toString(36)}`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ artists: [], max: MAX_ROSTER });

    const { data, error } = await supabase
      .from("roster_artists")
      .select("id, stage_name, slug, genre, org_id")
      .eq("owner_user_id", user.id)
      .order("stage_name")
      .limit(MAX_ROSTER);

    if (error) {
      // Fallback: some schemas may not filter by owner if RLS already scopes
      const { data: all } = await supabase
        .from("roster_artists")
        .select("id, stage_name, slug, genre, org_id")
        .order("stage_name")
        .limit(MAX_ROSTER);
      return NextResponse.json({
        artists: all || [],
        max: MAX_ROSTER,
        count: (all || []).length,
      });
    }

    return NextResponse.json({
      artists: data || [],
      max: MAX_ROSTER,
      count: (data || []).length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ artists: [], max: MAX_ROSTER });
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

    // Count existing
    const { count } = await supabase
      .from("roster_artists")
      .select("id", { count: "exact", head: true })
      .eq("owner_user_id", user.id);

    if ((count ?? 0) >= MAX_ROSTER) {
      return NextResponse.json(
        {
          error: `Roster limit is ${MAX_ROSTER} artists on this plan tier.`,
          max: MAX_ROSTER,
        },
        { status: 403 }
      );
    }

    let slug = body.slug?.trim() || slugify(stageName);
    // Ensure unique-ish slug
    const { data: existing } = await supabase
      .from("roster_artists")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    // Ensure org exists
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

    return NextResponse.json({ artist, max: MAX_ROSTER });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
