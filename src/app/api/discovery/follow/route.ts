import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ follows: [], auth: false });
    }
    const { data, error } = await supabase
      .from("discovery_follows")
      .select("target_type, target_slug, target_name, target_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("follows list", error);
      return NextResponse.json({ follows: [], auth: true, error: error.message });
    }
    return NextResponse.json({
      auth: true,
      follows: (data || []).map((r) => ({
        type: r.target_type,
        slug: r.target_slug,
        name: r.target_name,
        id: r.target_id ?? undefined,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ follows: [], auth: false });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const type = String(body.type || "").trim();
    const slug = String(body.slug || "").trim();
    const name = String(body.name || "").trim();
    const id = body.id ? String(body.id) : null;

    if (!type || !slug) {
      return NextResponse.json({ error: "type and slug required" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("discovery_follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("target_type", type)
      .eq("target_slug", slug)
      .maybeSingle();

    if (existing?.id) {
      await supabase.from("discovery_follows").delete().eq("id", existing.id);
      return NextResponse.json({ following: false });
    }

    const { error } = await supabase.from("discovery_follows").insert({
      user_id: user.id,
      target_type: type,
      target_slug: slug,
      target_name: name || slug,
      target_id: id,
    });

    if (error) {
      console.error("follow insert", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ following: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
