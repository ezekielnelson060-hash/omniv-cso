import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ leads: [], auth: false }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("discovery_leads")
      .select(
        "id, name, email, message, entity_id, entity_name, entity_path, created_at"
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({
        leads: [],
        auth: true,
        error: error.message,
      });
    }

    return NextResponse.json({
      auth: true,
      leads: (data || []).map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        message: r.message,
        entityId: r.entity_id,
        entityName: r.entity_name,
        entityPath: r.entity_path,
        createdAt: r.created_at,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const entityId = body.entityId ? String(body.entityId) : null;
    const entityName = String(body.entityName || "Listing").trim();
    const entityPath = String(body.entityPath || "").trim();
    const ownerId = body.ownerId ? String(body.ownerId) : null;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email required" },
        { status: 400 }
      );
    }

    let resolvedOwner = ownerId;
    if (!resolvedOwner && entityId) {
      const { data: ent } = await supabase
        .from("discovery_entities")
        .select("owner_id")
        .eq("id", entityId)
        .maybeSingle();
      resolvedOwner = ent?.owner_id || null;
    }
    if (!resolvedOwner && entityPath) {
      const parts = entityPath.split("/").filter(Boolean);
      if (parts[0] === "e" && parts.length >= 3) {
        const type = parts[1];
        const slug = parts[2];
        const { data: ent } = await supabase
          .from("discovery_entities")
          .select("owner_id")
          .eq("type", type)
          .eq("slug", slug)
          .maybeSingle();
        resolvedOwner = ent?.owner_id || null;
      }
    }

    if (!resolvedOwner) {
      return NextResponse.json({ ok: true, stored: false });
    }

    const { error } = await supabase.from("discovery_leads").insert({
      owner_id: resolvedOwner,
      entity_id: entityId,
      entity_name: entityName,
      entity_path: entityPath || null,
      name,
      email,
      message: message || null,
    });

    if (error) {
      console.error("lead insert", error);
      return NextResponse.json({
        ok: true,
        stored: false,
        error: error.message,
      });
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
