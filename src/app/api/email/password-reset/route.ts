import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPasswordResetEmail } from "@/lib/email/account";

/**
 * POST { email } — trigger Supabase recovery + optional branded Resend notice.
 * Uses security@ on notify stream when RESEND is configured.
 *
 * With Supabase custom SMTP (Resend), the real recovery link is emailed from
 * accounts@ or security@ on notify.omniv.media.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "https://omniv.media";

    const redirectTo = `${origin}/reset-password`;

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    // Always return ok to avoid email enumeration
    if (error) {
      console.error("[password-reset] supabase", error.message);
    }

    // Optional second branded notice (does not contain the secure token).
    // Prefer relying on Supabase SMTP once notify.omniv.media is verified.
    if (process.env.RESEND_PASSWORD_RESET_BRANDED === "1" && process.env.RESEND_API_KEY) {
      await sendPasswordResetEmail(email, redirectTo);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[password-reset]", e);
    return NextResponse.json({ ok: true });
  }
}
