import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Flutterwave webhook — only upgrades plan after successful charge.
 * Set FLW_SECRET_KEY + SUPABASE_SERVICE_ROLE_KEY in Vercel.
 * Dashboard webhook URL: https://omniv-cso.vercel.app/api/billing/flutterwave/webhook
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body?.event as string | undefined;
    const data = body?.data;

    if (event !== "charge.completed" && data?.status !== "successful") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const status = data?.status as string | undefined;
    if (status !== "successful") {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const email = (data?.customer?.email as string | undefined)?.toLowerCase();
    const plan = (data?.meta?.plan as string | undefined) || "starter";
    const txRef = data?.tx_ref as string | undefined;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !service || !email) {
      console.error("Webhook missing service role or email");
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false },
    });

    const validPlan = ["starter", "pro", "label"].includes(plan)
      ? plan
      : "starter";

    const { error } = await admin
      .from("profiles")
      .update({
        plan: validPlan,
        plan_status: "active",
        flw_tx_ref: txRef || null,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (error) {
      console.error("plan update failed", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true, plan: validPlan });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
