import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ saves: [], auth: false });
    }
    const { data, error } = await supabase
      .from("discovery_saves")
      .select("kind, target_type, target_slug, target_name, pub_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("saves list", error);
      return NextResponse.json({ saves: [], auth: true, error: error.message });
    }
    return NextResponse.json({
      auth: true,
      saves: (data || []).map((r) => ({
        kind: r.kind as "entity" | "publication",
        type: r.target_type,
        slug: r.target_slug,
        name: r.target_name,
        pubType: r.pub_type ?? undefined,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ saves: [], auth: false });
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
    const kind = body.kind === "publication" ? "publication" : "entity";
    const type = String(body.type || "").trim();
    const slug = String(body.slug || "").trim();
    const name = String(body.name || "").trim();
    const pubType = body.pubType ? String(body.pubType) : null;

    if (!type || !slug) {
      return NextResponse.json({ error: "type and slug required" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("discovery_saves")
      .select("id")
      .eq("user_id", user.id)
      .eq("kind", kind)
      .eq("target_type", type)
      .eq("target_slug", slug)
      .maybeSingle();

    if (existing?.id) {
      await supabase.from("discovery_saves").delete().eq("id", existing.id);
      return NextResponse.json({ saved: false });
    }

    const { error } = await supabase.from("discovery_saves").insert({
      user_id: user.id,
      kind,
      target_type: type,
      target_slug: slug,
      target_name: name || slug,
      pub_type: pubType,
    });

    if (error) {
      console.error("save insert", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
