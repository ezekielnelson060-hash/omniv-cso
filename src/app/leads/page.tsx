"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { usePlan } from "@/components/billing/plan-provider";

type Lead = {
  id: string;
  name: string;
  email: string;
  message?: string | null;
  entityName?: string | null;
  entityPath?: string | null;
  createdAt?: string;
};

export default function LeadsPage() {
  const { can, require } = usePlan();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/leads");
        const data = await res.json();
        if (cancelled) return;
        setAuth(Boolean(data.auth));
        setLeads(Array.isArray(data.leads) ? data.leads : []);
      } catch {
        if (!cancelled) setAuth(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function exportCsv() {
    if (!can("lead_capture")) {
      require("lead_capture");
      return;
    }
    const rows = [
      ["Name", "Email", "Entity", "Message", "Date"],
      ...leads.map((l) => [
        l.name,
        l.email,
        l.entityName || "",
        (l.message || "").replace(/\n/g, " "),
        l.createdAt || "",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `omniv-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
            <h1 className="text-[17px] font-semibold text-white">Leads</h1>
            {leads.length > 0 && (
              <button
                type="button"
                onClick={exportCsv}
                className="text-[13px] font-medium text-omniv-gold"
              >
                Export CSV
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4">
          {!ready && <p className="text-[13px] text-zinc-500">Loading…</p>}
          {ready && auth === false && (
            <div className="text-center">
              <p className="text-zinc-500">Sign in to see leads.</p>
              <Link
                href="/signup?next=/leads"
                className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Sign in
              </Link>
            </div>
          )}
          {ready && auth && !can("lead_capture") && (
            <div className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/[0.08]">
              <p className="text-[15px] font-semibold text-white">
                Lead capture is a Pro feature
              </p>
              <p className="mt-2 text-[13px] text-zinc-500">
                Contacts from your entity pages land here when you are on Pro.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
              >
                Upgrade to Pro
              </Link>
            </div>
          )}
          {ready && auth && can("lead_capture") && leads.length === 0 && (
            <p className="text-[14px] text-zinc-500">
              No leads yet. When someone contacts you from an entity page, they
              show up here.
            </p>
          )}
          {ready && auth && can("lead_capture") && leads.length > 0 && (
            <ul className="space-y-3">
              {leads.map((l) => (
                <li
                  key={l.id}
                  className="rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-white">
                        {l.name}
                      </p>
                      <a
                        href={`mailto:${l.email}`}
                        className="text-[13px] text-omniv-gold"
                      >
                        {l.email}
                      </a>
                    </div>
                    {l.createdAt && (
                      <span className="shrink-0 text-[11px] text-zinc-600">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {l.entityName && (
                    <p className="mt-1 text-[12px] text-zinc-500">
                      via {l.entityName}
                    </p>
                  )}
                  {l.message && (
                    <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                      {l.message}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
