import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Flutterwave Transfer (auto payout).
 * Requires verified Flutterwave business + FLW_SECRET_KEY +
 * artist bank fields on profiles + ADMIN_USER_IDS for admin-triggered pays.
 */
export async function POST(req: Request) {
  try {
    const secret = process.env.FLW_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "FLW_SECRET_KEY not configured" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      amount: number;
      currency?: string;
      narration?: string;
      userId?: string;
    };

    const amount = Number(body.amount);
    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Amount too low" },
        { status: 400 }
      );
    }

    const targetId = body.userId || user.id;
    const adminIds = (process.env.ADMIN_USER_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (targetId !== user.id && !adminIds.includes(user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "payout_bank_code, payout_account_number, payout_account_name, full_name, email"
      )
      .eq("id", targetId)
      .maybeSingle();

    if (
      !profile?.payout_bank_code ||
      !profile?.payout_account_number ||
      !profile?.payout_account_name
    ) {
      return NextResponse.json(
        { error: "Save bank details in Settings before auto payout" },
        { status: 400 }
      );
    }

    const currency = body.currency || process.env.FLW_PAYOUT_CURRENCY || "NGN";
    const payload = {
      account_bank: profile.payout_bank_code,
      account_number: profile.payout_account_number,
      amount,
      narration: body.narration || "Omniv earnings payout",
      currency,
      reference: `omniv-payout-${targetId.slice(0, 8)}-${Date.now()}`,
      beneficiary_name: profile.payout_account_name,
    };

    const res = await fetch("https://api.flutterwave.com/v3/transfers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      console.error("[payout-transfer]", data);
      return NextResponse.json(
        { error: data.message || "Transfer failed", detail: data },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      transfer: data.data,
      reference: payload.reference,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Transfer error" }, { status: 500 });
  }
}
