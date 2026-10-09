"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Report = {
  id: string;
  target_kind: string;
  target_id: string | null;
  target_slug: string | null;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState("open");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/discovery/reports?status=${encodeURIComponent(status)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load");
        setReports([]);
        return;
      }
      setReports(Array.isArray(data.reports) ? data.reports : []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setReportStatus(id: string, next: string) {
    const res = await fetch("/api/discovery/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    if (res.ok) void load();
  }

  return (
    <div className="min-h-dvh bg-[#050505] px-4 py-8 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] text-zinc-500">Admin</p>
            <h1 className="text-[22px] font-semibold text-white">Reports</h1>
          </div>
          <Link href="/admin/verification" className="text-[13px] text-omniv-gold">
            Verification
          </Link>
        </div>

        <div className="mt-4 flex gap-2">
          {(["open", "reviewing", "resolved", "dismissed", "all"] as const).map(
            (s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`h-8 rounded-full px-3.5 text-[12px] font-semibold ${
                  status === s
                    ? "bg-omniv-gold text-black"
                    : "bg-white/[0.06] text-zinc-500"
                }`}
              >
                {s}
              </button>
            )
          )}
        </div>

        {error && (
          <p className="mt-6 rounded-xl bg-red-500/10 px-4 py-3 text-[13px] text-red-300">
            {error}
            <span className="mt-1 block text-zinc-500">
              If RLS blocks admin read, run the admin policy SQL below in
              Supabase.
            </span>
          </p>
        )}

        {loading && (
          <p className="mt-12 text-center text-[14px] text-zinc-600">Loading…</p>
        )}

        {!loading && !error && reports.length === 0 && (
          <p className="mt-12 text-center text-[14px] text-zinc-500">
            No {status === "all" ? "" : status} reports
          </p>
        )}

        <ul className="mt-6 space-y-3">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.08]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-white">
                    {r.reason} · {r.target_kind}
                  </p>
                  <p className="mt-1 text-[12px] text-zinc-500">
                    {r.target_slug || r.target_id || "—"} ·{" "}
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                  {r.details && (
                    <p className="mt-2 text-[13px] text-zinc-400">{r.details}</p>
                  )}
                </div>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-zinc-400">
                  {r.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.target_slug && r.target_kind === "publication" && (
                  <Link
                    href={`/p/${r.target_slug}`}
                    className="text-[12px] text-omniv-gold"
                  >
                    Open
                  </Link>
                )}
                {r.status === "open" && (
                  <button
                    type="button"
                    onClick={() => void setReportStatus(r.id, "reviewing")}
                    className="text-[12px] text-zinc-400 hover:text-white"
                  >
                    Review
                  </button>
                )}
                {r.status !== "resolved" && (
                  <button
                    type="button"
                    onClick={() => void setReportStatus(r.id, "resolved")}
                    className="text-[12px] text-emerald-400"
                  >
                    Resolve
                  </button>
                )}
                {r.status !== "dismissed" && (
                  <button
                    type="button"
                    onClick={() => void setReportStatus(r.id, "dismissed")}
                    className="text-[12px] text-zinc-500"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl bg-white/[0.03] p-4 text-[12px] text-zinc-600 ring-1 ring-white/[0.06]">
          <p className="font-medium text-zinc-400">Admin read policy (optional)</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[11px] text-zinc-600">
{`drop policy if exists "discovery_reports_admin_all" on public.discovery_reports;
create policy "discovery_reports_admin_all"
  on public.discovery_reports for all
  to authenticated
  using (true)
  with check (true);`}
          </pre>
          <p className="mt-2">
            Tighten later with ADMIN_USER_IDS env. For now access is granted if
            you own a verified / Omniv entity.
          </p>
        </div>
      </div>
    </div>
  );
}
