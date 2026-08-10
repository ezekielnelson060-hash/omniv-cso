import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { guessBankCode } from "@/lib/flutterwave-banks";

/**
 * Link or create a Flutterwave subaccount so ticket/tip charges split to the artist.
 * Body: { account_bank?, account_number?, business_name?, country?, existing_id? }
 */
export async function POST(req: Request) {
  try {
    const secret = process.env.FLW_SECRET_KEY;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = (await req.json()) as {
      account_bank?: string;
      account_number?: string;
      business_name?: string;
      country?: string;
      existing_id?: string;
      bank_name?: string;
      account_name?: string;
      payout_method?: string;
      payout_notes?: string;
    };

    const existing = body.existing_id?.trim();
    if (existing) {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email,
          payout_subaccount_id: existing,
          payout_bank_name: body.bank_name?.trim() || null,
          payout_account_name: body.account_name?.trim() || null,
          payout_account_number: body.account_number?.trim() || null,
          payout_method: body.payout_method?.trim() || null,
          payout_notes: body.payout_notes?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({
        ok: true,
        subaccountId: existing,
        mode: "linked",
        message:
          "You're set to get paid. New tickets and tips split to this account.",
      });
    }

    if (!secret) {
      return NextResponse.json(
        {
          error:
            "Payments aren't fully switched on yet (FLW_SECRET_KEY). Your bank details can still be saved for manual payout.",
          canSaveDetailsOnly: true,
        },
        { status: 503 }
      );
    }

    const accountNumber = body.account_number?.trim();
    let accountBank = body.account_bank?.trim() || "";
    if (!accountBank && body.bank_name) {
      accountBank = guessBankCode(body.bank_name) || "";
    }
    if (!accountNumber || !accountBank) {
      return NextResponse.json(
        {
          error:
            "Pick your bank (or enter bank code) and account number so we can open your payout lane.",
        },
        { status: 400 }
      );
    }

    const businessName =
      body.business_name?.trim() ||
      body.account_name?.trim() ||
      user.email?.split("@")[0] ||
      "Omniv artist";
    const country = (body.country || "NG").toUpperCase();
    const splitValue = Number(process.env.FLW_PLATFORM_SPLIT || "0.1");

    const flwRes = await fetch("https://api.flutterwave.com/v3/subaccounts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_bank: accountBank,
        account_number: accountNumber,
        business_name: businessName.slice(0, 100),
        business_email: user.email,
        country,
        split_type: "percentage",
        split_value: splitValue,
      }),
    });

    const flw = (await flwRes.json()) as {
      status?: string;
      message?: string;
      data?: { id?: number | string; subaccount_id?: string };
    };

    if (!flwRes.ok || flw.status !== "success" || !flw.data) {
      return NextResponse.json(
        {
          error:
            flw.message ||
            "Flutterwave could not verify that account. Check number and bank, or paste an existing subaccount ID.",
        },
        { status: 400 }
      );
    }

    const subId = String(flw.data.subaccount_id || flw.data.id || "");
    if (!subId) {
      return NextResponse.json(
        { error: "No subaccount id returned. Try linking an existing ID." },
        { status: 500 }
      );
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        payout_subaccount_id: subId,
        payout_bank_name: body.bank_name?.trim() || null,
        payout_account_name: body.account_name?.trim() || null,
        payout_account_number: accountNumber,
        payout_method: body.payout_method?.trim() || null,
        payout_notes: body.payout_notes?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) {
      return NextResponse.json(
        {
          error: `Subaccount created (${subId}) but profile save failed: ${error.message}`,
          subaccountId: subId,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      subaccountId: subId,
      mode: "created",
      message:
        "You're set to get paid. New room tickets and tips split to your account automatically.",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

/** Current payout status for Money tab / Settings. */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    const { data } = await supabase
      .from("profiles")
      .select(
        "payout_subaccount_id, payout_bank_name, payout_account_name, payout_account_number, payout_method"
      )
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      ready: Boolean(data?.payout_subaccount_id),
      subaccountId: data?.payout_subaccount_id || null,
      bankName: data?.payout_bank_name || null,
      accountName: data?.payout_account_name || null,
      accountNumber: data?.payout_account_number
        ? `••••${String(data.payout_account_number).slice(-4)}`
        : null,
      method: data?.payout_method || null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
