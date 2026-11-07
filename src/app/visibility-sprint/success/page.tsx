"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type OrderSummary = {
  id: string;
  status: string;
  customer_name: string;
  customer_email: string;
  company_name: string;
  amount: number;
  currency: string;
};

function SuccessBody() {
  const sp = useSearchParams();
  const tx_ref = sp.get("tx_ref") || "";
  const transaction_id =
    sp.get("transaction_id") || sp.get("transactionId") || "";

  const [state, setState] = useState<
    "loading" | "paid" | "pending" | "error"
  >("loading");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [message, setMessage] = useState("Verifying payment…");

  useEffect(() => {
    if (!tx_ref && !transaction_id) {
      setState("error");
      setMessage("Missing payment reference.");
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function verify() {
      attempts += 1;
      const qs = new URLSearchParams();
      if (tx_ref) qs.set("tx_ref", tx_ref);
      if (transaction_id) qs.set("transaction_id", transaction_id);

      try {
        const res = await fetch(`/api/visibility-sprint/verify?${qs.toString()}`);
        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (res.ok && data.paid && data.order) {
          setOrder(data.order as OrderSummary);
          setState("paid");
          setMessage("Payment confirmed.");
          return;
        }

        if (attempts < 5) {
          setState("pending");
          setMessage("Waiting for payment confirmation…");
          setTimeout(verify, 2500);
          return;
        }

        setState("error");
        setMessage(
          data.error ||
            "We could not verify this payment yet. If you were charged, contact support with your email."
        );
      } catch {
        if (cancelled) return;
        if (attempts < 5) {
          setTimeout(verify, 2500);
          return;
        }
        setState("error");
        setMessage("Network error while verifying payment.");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [tx_ref, transaction_id]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {state === "loading" || state === "pending" ? (
        <>
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-omniv-gold/30" />
          <h1 className="mt-6 text-xl font-semibold text-white">{message}</h1>
          <p className="mt-2 text-[14px] text-zinc-500">
            Please wait — we only confirm orders after Flutterwave verification.
          </p>
        </>
      ) : null}

      {state === "paid" && order ? (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            ✓
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-white">
            Visibility Sprint secured
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
            Thanks, {order.customer_name}. Payment for{" "}
            <span className="text-white">{order.company_name}</span> is confirmed.
            We'll follow up at{" "}
            <span className="text-white">{order.customer_email}</span> with next
            steps and asset collection.
          </p>
          <p className="mt-4 text-[13px] text-zinc-500">
            Amount: {order.currency} {order.amount}
          </p>
          <Link
            href="/home"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
          >
            Back to Omniv
          </Link>
        </>
      ) : null}

      {state === "error" ? (
        <>
          <h1 className="text-xl font-semibold text-white">Payment not confirmed</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">{message}</p>
          <Link
            href="/visibility-sprint#get-sprint"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
          >
            Try again
          </Link>
        </>
      ) : null}
    </div>
  );
}

export default function VisibilitySprintSuccessPage() {
  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <Suspense
        fallback={
          <div className="flex min-h-dvh items-center justify-center text-sm text-zinc-500">
            Loading…
          </div>
        }
      >
        <SuccessBody />
      </Suspense>
    </div>
  );
}
