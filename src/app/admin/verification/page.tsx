"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Req = {
  id: string;
  entity_name: string;
  entity_type?: string;
  entity_slug?: string;
  verify_type?: string;
  status: string;
  notes?: string;
  paid?: boolean;
  decision_notes?: string;
  created_at: string;
  reviewed_at?: string;
};

export default function AdminVerificationPage() {
  const [status, setStatus] = useState("pending");
  const [requests, setRequests] = useState<Req[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Req | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/verification?status=${status}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load");
        setRequests([]);
        return;
      }
      setRequests(data.requests || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject" | "more_info") {
    setBusy(id + action);
    try {
      const res = await fetch("/api/admin/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, decisionNotes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action failed");
        return;
      }
      setSelected(null);
      setDecisionNotes("");
      await load();
    } catch {
      setError("Network error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <header className="border-b border-white/[0.06] px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-omniv-gold">
              Admin
            </p>
            <h1 className="text-[20px] font-semibold text-white">
              Verification queue
            </h1>
          </div>
          <Link href="/home" className="text-[13px] text-zinc-500 hover:text-white">
            ← App
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {["pending", "more_info", "approved", "rejected", "all"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium capitalize ${
                status === s
                  ? "bg-omniv-gold text-black"
                  : "bg-white/[0.04] text-zinc-400"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-8 text-[14px] text-zinc-500">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="mt-8 text-[14px] text-zinc-500">
            No applications in this filter.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {requests.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[16px] font-semibold text-white">
                      {r.entity_name}
                    </p>
                    <p className="mt-1 text-[12px] text-zinc-500">
                      {r.verify_type || "organization"}
                      {r.entity_type ? ` · ${r.entity_type}` : ""}
                      {r.entity_slug
                        ? ` · /e/${r.entity_type}/${r.entity_slug}`
                        : ""}
                    </p>
                    <p className="mt-1 text-[12px] text-zinc-600">
                      {new Date(r.created_at).toLocaleString()}
                      {r.paid ? " · Paid" : " · Unpaid"}
                    </p>
                  </div>
                  <span
                    className={`text-[12px] font-medium ${
                      r.status === "approved"
                        ? "text-emerald-400"
                        : r.status === "rejected"
                          ? "text-rose-400"
                          : "text-amber-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                {r.notes && (
                  <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-3 text-[12px] text-zinc-400">
                    {r.notes}
                  </pre>
                )}
                {(r.status === "pending" || r.status === "more_info") && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="rounded-full bg-white/[0.06] px-4 py-2 text-[12px] text-white"
                    >
                      Review
                    </button>
                    <button
                      type="button"
                      disabled={busy === r.id + "approve"}
                      onClick={() => act(r.id, "approve")}
                      className="rounded-full bg-emerald-500/20 px-4 py-2 text-[12px] font-medium text-emerald-300 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy === r.id + "reject"}
                      onClick={() => act(r.id, "reject")}
                      className="rounded-full bg-rose-500/15 px-4 py-2 text-[12px] font-medium text-rose-300 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={busy === r.id + "more_info"}
                      onClick={() => act(r.id, "more_info")}
                      className="rounded-full bg-amber-500/15 px-4 py-2 text-[12px] font-medium text-amber-300 disabled:opacity-50"
                    >
                      Request more info
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#121212] p-5 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[16px] font-semibold text-white">
              {selected.entity_name}
            </p>
            <p className="mt-1 text-[13px] text-zinc-500">
              Decision notes (optional)
            </p>
            <textarea
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl bg-white/[0.04] px-3 py-2 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
              placeholder="Visible to admin log…"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => act(selected.id, "approve")}
                className="flex-1 rounded-full bg-emerald-500 py-2.5 text-[13px] font-semibold text-black"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => act(selected.id, "reject")}
                className="flex-1 rounded-full bg-rose-500/80 py-2.5 text-[13px] font-semibold text-white"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
