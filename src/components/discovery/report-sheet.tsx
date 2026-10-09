"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

const REASONS = [
  { id: "spam", label: "Spam" },
  { id: "harassment", label: "Harassment" },
  { id: "misinformation", label: "Misinformation" },
  { id: "impersonation", label: "Impersonation" },
  { id: "copyright", label: "Copyright" },
  { id: "illegal", label: "Illegal content" },
  { id: "other", label: "Other" },
] as const;

export function ReportSheet({
  open,
  onClose,
  targetKind,
  targetId,
  targetSlug,
  targetLabel,
}: {
  open: boolean;
  onClose: () => void;
  targetKind: "publication" | "entity" | "user";
  targetId?: string;
  targetSlug?: string;
  targetLabel?: string;
}) {
  const [reason, setReason] = useState<string>("spam");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || typeof document === "undefined") return null;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/discovery/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetKind,
          targetId,
          targetSlug,
          reason,
          details,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setError("Sign in to report");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Could not submit");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/65"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-[#121212] p-5 ring-1 ring-white/10 sm:rounded-3xl">
        <h2 className="text-[17px] font-semibold text-white">Report</h2>
        {targetLabel && (
          <p className="mt-1 text-[13px] text-zinc-500">{targetLabel}</p>
        )}

        {done ? (
          <div className="mt-6 text-center">
            <p className="text-[15px] text-white">Thanks — we received your report.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 h-11 w-full rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-2">
              {REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-[14px] ${
                    reason === r.id
                      ? "bg-omniv-gold/15 text-white ring-1 ring-omniv-gold/40"
                      : "bg-white/[0.04] text-zinc-300"
                  }`}
                >
                  {r.label}
                  {reason === r.id && <span className="text-omniv-gold">✓</span>}
                </button>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Optional details…"
              className="mt-4 w-full rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
            />
            {error && <p className="mt-2 text-[13px] text-red-400">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 flex-1 rounded-full bg-white/[0.06] text-[14px] font-medium text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void submit()}
                className="h-11 flex-1 rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Sending…" : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
