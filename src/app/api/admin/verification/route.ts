import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createService } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createService(url, key, { auth: { persistSession: false } });
}

function isAdmin(email: string | undefined | null) {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email || !isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const svc = service();
    if (!svc) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    let q = svc
      .from("discovery_verification_requests")
      .select(
        "id, user_id, entity_id, entity_type, entity_slug, entity_name, verify_type, status, notes, paid, payment_ref, evidence, decision_notes, reviewed_at, created_at, updated_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (status !== "all") {
      q = q.eq("status", status);
    }

    const { data, error } = await q;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ requests: data || [] });
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
    if (!user?.email || !isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const svc = service();
    if (!svc) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const id = String(body.id || "").trim();
    const action = String(body.action || "").trim();
    const decisionNotes = body.decisionNotes
      ? String(body.decisionNotes).trim()
      : null;

    if (!id || !["approve", "reject", "more_info"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const status =
      action === "approve"
        ? "approved"
        : action === "reject"
          ? "rejected"
          : "more_info";

    const { data: row, error: fetchErr } = await svc
      .from("discovery_verification_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !row) {
      return NextResponse.json(
        { error: fetchErr?.message || "Not found" },
        { status: 404 }
      );
    }

    const { error: updErr } = await svc
      .from("discovery_verification_requests")
      .update({
        status,
        decision_notes: decisionNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    if (action === "approve") {
      if (row.entity_id) {
        await svc
          .from("discovery_entities")
          .update({ verified: true })
          .eq("id", row.entity_id);
      } else if (row.entity_type && row.entity_slug) {
        await svc
          .from("discovery_entities")
          .update({ verified: true })
          .eq("type", row.entity_type)
          .eq("slug", row.entity_slug);
      }

      await svc.from("discovery_verification_log").insert({
        entity_id: row.entity_id,
        entity_type: row.entity_type,
        entity_slug: row.entity_slug,
        entity_name: row.entity_name,
        verify_type: row.verify_type || "organization",
        verified_fields: [
          "organization_identity",
          "authorized_representative",
          "official_contact",
        ],
        request_id: row.id,
        last_reviewed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true, status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
