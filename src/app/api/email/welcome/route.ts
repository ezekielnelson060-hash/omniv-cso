import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/account";

/**
 * POST — day-0 welcome from hello@ (notify stream).
 * Call after signup when session exists.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const name =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email.split("@")[0] ||
      "there";

    const result = await sendWelcomeEmail(user.email, name);
    if (!result.ok) {
      console.error("[email/welcome]", result.error);
      return NextResponse.json(
        { error: result.error || "Send failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: result.id,
      identity: "hello",
      stream: "notify",
    });
  } catch (e) {
    console.error("[email/welcome]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
