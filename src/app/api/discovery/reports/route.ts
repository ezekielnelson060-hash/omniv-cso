import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin-oriented reports queue.
 * GET — list open reports (service path: any authenticated owner for now;
 *       tighten with ADMIN_USER_IDS env when ready).
 * PATCH — update status { id, status }
 */
function isAdmin(userId: string): boolean {
  const raw = process.env.ADMIN_USER_IDS || process.env.OMNIV_ADMIN_IDS || "";
  if (!raw.trim()) {
    // No allowlist set: only service can use via service role elsewhere.
    // For bootstrap, allow if user owns at least one verified entity named Omniv.
    return false;
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(userId);
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    // Bootstrap: allow if admin env set OR user owns verified omniv entity
    let allowed = isAdmin(user.id);
    if (!allowed) {
      const { data: ents } = await supabase
        .from("discovery_entities")
        .select("id, name, slug, verified")
        .eq("owner_id", user.id)
        .limit(20);
      allowed = Boolean(
        (ents || []).some(
          (e) =>
            e.verified ||
            /omniv/i.test(e.name || "") ||
            /omniv/i.test(e.slug || "")
        )
      );
    }

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "open";

    let q = supabase
      .from("discovery_reports")
      .select(
        "id, reporter_id, target_kind, target_id, target_slug, reason, details, status, created_at, resolved_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (status !== "all") {
      q = q.eq("status", status);
    }

    const { data, error } = await q;

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          hint: "Run migration 050; reports RLS may block non-reporter select",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ auth: true, reports: data || [] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    let allowed = isAdmin(user.id);
    if (!allowed) {
      const { data: ents } = await supabase
        .from("discovery_entities")
        .select("id, name, slug, verified")
        .eq("owner_id", user.id)
        .limit(20);
      allowed = Boolean(
        (ents || []).some(
          (e) =>
            e.verified ||
            /omniv/i.test(e.name || "") ||
            /omniv/i.test(e.slug || "")
        )
      );
    }
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const id = String(body.id || "").trim();
    const status = String(body.status || "").trim();

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    if (!["open", "reviewing", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const patch: Record<string, unknown> = { status };
    if (status === "resolved" || status === "dismissed") {
      patch.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("discovery_reports")
      .update(patch)
      .eq("id", id)
      .select("id, status, resolved_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          hint: "Add admin select/update policy on discovery_reports if needed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, report: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
