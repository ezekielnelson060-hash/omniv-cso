import { NextResponse } from "next/server";

const TO = process.env.CONTACT_INBOX || "hello@omniv.media";
const FROM = process.env.RESEND_FROM || "Omniv <onboarding@omniv.media>";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const entityName = String(body.entityName || "Listing").trim();
    const entityPath = String(body.entityPath || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message required" },
        { status: 400 }
      );
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.log("[contact]", { name, email, entityName, message });
      return NextResponse.json({
        ok: true,
        note: "Logged (RESEND_API_KEY not set)",
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
        to: [TO],
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
