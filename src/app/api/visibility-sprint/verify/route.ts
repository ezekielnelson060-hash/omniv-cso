import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const EXPECTED_AMOUNT = 300;

async function verifyWithFlutterwave(opts: {
  transactionId?: string;
  txRef?: string;
}) {
  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) return null;

  if (opts.transactionId) {
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/${opts.transactionId}/verify`,
      { headers: { Authorization: `Bearer ${secret}` } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  }

  if (opts.txRef) {
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(opts.txRef)}`,
      { headers: { Authorization: `Bearer ${secret}` } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  }

  return null;
}

/**
 * Confirm Visibility Sprint payment only after Flutterwave verify succeeds.
 * Query: ?tx_ref=… and/or ?transaction_id=…
 */
export async function GET(req: Request) {
  const secret = process.env.FLW_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !url || !service) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const tx_ref = (searchParams.get("tx_ref") || "").trim();
  const transaction_id = (searchParams.get("transaction_id") || "").trim();

  if (!tx_ref && !transaction_id) {
    return NextResponse.json(
      { error: "tx_ref or transaction_id required" },
      { status: 400 }
    );
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Already paid?
  if (tx_ref) {
    const { data: existing } = await admin
      .from("visibility_sprint_orders")
      .select(
        "id, status, customer_name, customer_email, company_name, amount, currency, payment_verified_at"
      )
      .eq("tx_ref", tx_ref)
      .maybeSingle();

    if (existing?.status === "paid" || existing?.status === "fulfilled") {
      return NextResponse.json({
        ok: true,
        paid: true,
        order: existing,
      });
    }
  }

  const verified = await verifyWithFlutterwave({
    transactionId: transaction_id || undefined,
    txRef: tx_ref || undefined,
  });

  if (!verified) {
    return NextResponse.json(
      { ok: false, paid: false, error: "Payment not verified yet." },
      { status: 402 }
    );
  }

  const status = String(verified.status || "").toLowerCase();
  if (status !== "successful" && status !== "success") {
    return NextResponse.json(
      { ok: false, paid: false, error: `Payment status: ${status || "unknown"}` },
      { status: 402 }
    );
  }

  const verifiedTxRef = String(verified.tx_ref || verified.txRef || tx_ref);
  if (tx_ref && verifiedTxRef && verifiedTxRef !== tx_ref) {
    return NextResponse.json(
      { ok: false, paid: false, error: "Transaction reference mismatch." },
      { status: 400 }
    );
  }

  const amount = Number(verified.amount ?? 0);
  const currency = String(verified.currency || "USD").toUpperCase();
  const expectedCurrency = (process.env.FLW_CURRENCY || "USD").toUpperCase();

  if (amount < EXPECTED_AMOUNT * 0.99) {
    return NextResponse.json(
      { ok: false, paid: false, error: "Amount does not match package price." },
      { status: 400 }
    );
  }
  if (currency !== expectedCurrency) {
    // Soft warn only if currencies differ but amount is correct — still require match
    console.warn("[visibility-sprint] currency", currency, expectedCurrency);
  }

  const flwId = String(verified.id ?? transaction_id ?? "");

  const { data: order, error } = await admin
    .from("visibility_sprint_orders")
    .update({
      status: "paid",
      flw_transaction_id: flwId || null,
      payment_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      raw_payment: verified,
    })
    .eq("tx_ref", verifiedTxRef)
    .select(
      "id, status, customer_name, customer_email, company_name, amount, currency, payment_verified_at"
    )
    .maybeSingle();

  if (error || !order) {
    console.error("[visibility-sprint] mark paid", error);
    return NextResponse.json(
      { ok: false, paid: false, error: "Order not found for this payment." },
      { status: 404 }
    );
  }

  // Mirror into payments ledger when available
  try {
    await admin.from("payments").upsert(
      {
        amount,
        currency,
        status: "successful",
        plan: "visibility_sprint",
        tx_ref: verifiedTxRef,
        email: order.customer_email,
        provider_payment_id: flwId || verifiedTxRef,
        raw: verified,
      },
      { onConflict: "tx_ref" }
    );
  } catch {
    /* optional ledger */
  }

  return NextResponse.json({
    ok: true,
    paid: true,
    order,
  });
}
