import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ auth: false, requests: [] });
    }

    const { data, error } = await supabase
      .from("discovery_verification_requests")
      .select(
        "id, entity_id, entity_type, entity_slug, entity_name, verify_type, status, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({
        auth: true,
        requests: [],
        error: error.message,
      });
    }

    return NextResponse.json({ auth: true, requests: data || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ auth: false, requests: [] });
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
    const entityName = String(body.entityName || "").trim();
    const entityId = body.entityId ? String(body.entityId) : null;
    const entityType = body.entityType ? String(body.entityType) : null;
    const entitySlug = body.entitySlug ? String(body.entitySlug) : null;
    const verifyType =
      body.verifyType === "individual" ? "individual" : "organization";
    const notes = String(body.notes || "").trim() || null;

    if (!entityName) {
      return NextResponse.json(
        { error: "Entity name required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("discovery_verification_requests")
      .insert({
        user_id: user.id,
        entity_id: entityId,
        entity_type: entityType,
        entity_slug: entitySlug,
        entity_name: entityName,
        verify_type: verifyType,
        status: "pending",
        notes,
      })
      .select("id, status")
      .single();

    if (error) {
      console.error("verify request", error);
      return NextResponse.json(
        {
          error:
            error.message.includes("relation") || error.code === "42P01"
              ? "Run migration 035_verification_requests.sql first"
              : error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, request: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
