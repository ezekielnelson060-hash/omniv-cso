import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

const FALLBACK_TO = process.env.CONTACT_INBOX || "hello@omniv.media";
const FROM = process.env.RESEND_FROM || "Omniv <onboarding@omniv.media>";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const entityName = String(body.entityName || "Listing").trim();
    const entityPath = String(body.entityPath || "").trim();
    const ownerId = body.ownerId ? String(body.ownerId) : null;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message required" },
        { status: 400 }
      );
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    let to = FALLBACK_TO;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (ownerId && url && service) {
      try {
        const admin = createAdmin(url, service, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await admin.auth.admin.getUserById(ownerId);
        if (!error && data?.user?.email) {
          to = data.user.email;
        } else {
          const { data: profile } = await admin
            .from("profiles")
            .select("email, contact_email")
            .eq("id", ownerId)
            .maybeSingle();
          const pe =
            (profile as { contact_email?: string; email?: string } | null)
              ?.contact_email ||
            (profile as { email?: string } | null)?.email;
          if (pe && pe.includes("@")) to = pe;
        }
      } catch (e) {
        console.error("owner email lookup", e);
      }
    }

    try {
      const origin = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
      await fetch(`${origin}/api/discovery/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          entityId: body.entityId || null,
          entityName,
          entityPath,
          ownerId: ownerId || null,
        }),
      });
    } catch {
      /* non-blocking */
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.log("[contact]", { name, email, entityName, to, message });
      return NextResponse.json({
        ok: true,
        note: "Logged (RESEND_API_KEY not set)",
        deliveredTo: to,
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        reply_to: email,
        subject: `Omniv contact: ${entityName}`,
        text: [
          `From: ${name} <${email}>`,
          `Listing: ${entityName}`,
          entityPath ? `URL: https://omniv.media${entityPath}` : "",
          "",
          message,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("resend contact", err);
      return NextResponse.json({ error: "Failed to send" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
