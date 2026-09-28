"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  VERIFY_FEE_USD,
  VERIFY_FEE_LABEL,
  VERIFY_FEE_TITLE,
} from "@/lib/discovery/verify-pricing";

type VerifyRequest = {
  id: string;
  entity_id?: string | null;
  entity_type?: string | null;
  entity_slug?: string | null;
  entity_name?: string | null;
  verify_type?: string | null;
  status?: string | null;
  paid?: boolean | null;
  payment_ref?: string | null;
  created_at?: string | null;
};

type EntityOption = {
  id: string;
  name: string;
  type: string;
  slug: string;
  verified?: boolean;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/25",
  under_review: "bg-sky-500/15 text-sky-300 ring-sky-500/25",
  approved: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
  rejected: "bg-red-500/15 text-red-300 ring-red-500/25",
  cancelled: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/25",
};

export default function VerifyPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [requests, setRequests] = useState<VerifyRequest[]>([]);
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [entityId, setEntityId] = useState("");
  const [entityName, setEntityName] = useState("");
  const [verifyType, setVerifyType] = useState<"individual" | "organization">(
    "organization"
  );
  const [notes, setNotes] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/discovery/verify");
      const data = await res.json();
      setAuth(Boolean(data.auth));
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch {
      setAuth(false);
    }
    try {
      const er = await fetch("/api/discovery/entities");
      const ed = await er.json();
      if (Array.isArray(ed.entities)) {
        setEntities(
          ed.entities.map((e: Record<string, unknown>) => ({
            id: String(e.id || ""),
            name: String(e.name || ""),
            type: String(e.type || "company"),
            slug: String(e.slug || ""),
            verified: Boolean(e.verified),
          }))
        );
      }
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "success") {
      setOkMsg(
        "Payment received. Status updates after webhook — refresh in a moment."
      );
      void refresh();
    }
  }, [refresh]);

  function onPickEntity(id: string) {
    setEntityId(id);
    const e = entities.find((x) => x.id === id);
    if (e) {
      setEntityName(e.name);
      setVerifyType(
        e.type === "person" || e.type === "artist"
          ? "individual"
          : "organization"
      );
    }
  }

  async function submitApplication() {
    setLoading(true);
    setError("");
    setOkMsg("");
    try {
      const picked = entities.find((x) => x.id === entityId);
      const res = await fetch("/api/discovery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId: entityId || null,
          entityName: entityName.trim() || picked?.name,
          entityType: picked?.type || null,
          entitySlug: picked?.slug || null,
          verifyType,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not submit");
        setLoading(false);
        return;
      }
      setOkMsg(
        "Application submitted. Pay the monthly fee to enter the review queue."
      );
      setNotes("");
      await refresh();
      if (data.request?.id) {
        await startCheckout(String(data.request.id));
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(requestId?: string) {
    setPayingId(requestId || "new");
    setError("");
    try {
      const res = await fetch("/api/billing/flutterwave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "verify",
          meta: requestId
            ? {
                verification_request_id: requestId,
                request_id: requestId,
              }
            : {},
        }),
      });
      const data = await res.json();
      if (data?.link) {
        window.location.href = data.link;
        return;
      }
      setError(data?.error || "Could not start payment.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPayingId(null);
    }
  }

  return (
    <DiscoveryShell>
      <div className="mx-auto min-h-dvh w-full max-w-lg overflow-x-hidden bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5"
            >
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">
              Verification
            </h1>
          </div>
        </header>

        <main className="px-4 pb-28 pt-6">
          <p className="text-[20px] font-semibold text-white">
            Omniv Verification
          </p>
          <p className="mt-2 text-[14px] text-zinc-400">
            Apply, pay the monthly fee, then wait for review. A badge is only
            granted after approval — payment alone does not verify you.
          </p>

          {auth === false && (
            <div className="mt-8 text-center">
              <p className="text-zinc-500">Sign in to apply or check status.</p>
              <Link
                href="/signup?next=/verify"
                className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Sign in
              </Link>
            </div>
          )}

          {auth && (
            <>
              <section className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Your applications
                </p>
                {requests.length === 0 ? (
                  <p className="mt-3 text-[13px] text-zinc-500">
                    No applications yet.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {requests.map((r) => {
                      const st = (r.status || "pending").toLowerCase();
                      const style =
                        STATUS_STYLE[st] || STATUS_STYLE.pending;
                      return (
                        <li
                          key={r.id}
                          className="rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.06]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-medium text-white">
                                {r.entity_name || "Application"}
                              </p>
                              <p className="mt-0.5 text-[12px] text-zinc-500">
                                {r.verify_type || "organization"}
                                {r.created_at
                                  ? ` · ${new Date(r.created_at).toLocaleDateString()}`
                                  : ""}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ${style}`}
                            >
                              {st.replace("_", " ")}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
                            <span
                              className={
                                r.paid ? "text-emerald-400" : "text-zinc-500"
                              }
                            >
                              {r.paid ? "Paid" : "Payment pending"}
                            </span>
                            {!r.paid && st === "pending" && (
                              <button
                                type="button"
                                disabled={payingId === r.id}
                                onClick={() => void startCheckout(r.id)}
                                className="font-medium text-omniv-gold"
                              >
                                {payingId === r.id ? "Starting…" : "Pay now"}
                              </button>
                            )}
                            {st === "approved" && (
                              <span className="text-emerald-400">
                                Badge active on entity
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="mt-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  New application
                </p>
                <div className="mt-3 space-y-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.08]">
                  {entities.length > 0 && (
                    <label className="block">
                      <span className="text-[12px] text-zinc-500">
                        Identity / entity
                      </span>
                      <select
                        value={entityId}
                        onChange={(e) => onPickEntity(e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
                      >
                        <option value="">Select…</option>
                        {entities.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                            {e.verified ? " (verified)" : ""} — {e.type}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="block">
                    <span className="text-[12px] text-zinc-500">
                      Display name on application
                    </span>
                    <input
                      value={entityName}
                      onChange={(e) => setEntityName(e.target.value)}
                      placeholder="Company or person name"
                      className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600"
                    />
                  </label>
                  <div className="flex gap-2">
                    {(["individual", "organization"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setVerifyType(t)}
                        className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium capitalize ${
                          verifyType === t
                            ? "bg-omniv-gold text-black"
                            : "bg-white/[0.06] text-zinc-400"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <label className="block">
                    <span className="text-[12px] text-zinc-500">
                      Notes / evidence links (optional)
                    </span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Website, socials, registration docs…"
                      className="mt-1.5 w-full rounded-xl bg-white/[0.04] px-3.5 py-3 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600"
                    />
                  </label>
                </div>
              </section>

              <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-omniv-gold/30">
                <div className="bg-omniv-gold/10 px-5 py-5">
                  <p className="text-[13px] font-medium text-omniv-gold">
                    {VERIFY_FEE_TITLE}
                  </p>
                  <p className="mt-1 text-[32px] font-semibold tracking-tight text-white">
                    ${VERIFY_FEE_USD}
                    <span className="text-[16px] font-medium text-zinc-400">
                      /mo
                    </span>
                  </p>
                  <ul className="mt-4 space-y-2 text-[13px] text-zinc-300">
                    {[
                      "Identity / entity review",
                      "Verification badge if approved",
                      "Badge on profile and publications",
                      "Priority review (1–3 business days)",
                    ].map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-omniv-gold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-[13px] text-red-400">{error}</p>
              )}
              {okMsg && (
                <p className="mt-3 text-[13px] text-emerald-400">{okMsg}</p>
              )}

              <button
                type="button"
                disabled={loading || !entityName.trim()}
                onClick={() => void submitApplication()}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-60"
              >
                {loading
                  ? "Submitting…"
                  : `Apply & pay — ${VERIFY_FEE_LABEL}`}
              </button>

              <p className="mt-4 text-center text-[12px] text-zinc-600">
                Admins review at /admin/verification. Payment marks the
                application paid; approval grants the badge.
              </p>
            </>
          )}
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
