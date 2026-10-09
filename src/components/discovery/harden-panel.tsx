"use client";

import { useEffect, useState } from "react";

/**
 * One-click data hygiene for the signed-in owner:
 * sync publisher names + merge duplicate entities.
 */
export function HardenPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<{
    entities?: number;
    publications?: number;
    possibleDupeGroups?: number;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/discovery/harden");
        const data = await res.json();
        if (data.auth) {
          setInfo({
            entities: data.entities,
            publications: data.publications,
            possibleDupeGroups: data.possibleDupeGroups,
          });
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function run(action: "sync-names" | "dedupe-entities" | "full") {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/discovery/harden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Failed");
        return;
      }
      const parts: string[] = [];
      if (data.syncNames) {
        parts.push(
          `Synced names across ${data.syncNames.entities} entities`
        );
      }
      if (data.dedupe) {
        parts.push(
          `Merged ${data.dedupe.removed} duplicate entit${data.dedupe.removed === 1 ? "y" : "ies"}`
        );
      }
      setStatus(parts.join(" · ") || "Done");
      // refresh counts
      const r2 = await fetch("/api/discovery/harden");
      const d2 = await r2.json();
      if (d2.auth) {
        setInfo({
          entities: d2.entities,
          publications: d2.publications,
          possibleDupeGroups: d2.possibleDupeGroups,
        });
      }
    } catch {
      setStatus("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.08]">
      <p className="text-[15px] font-semibold text-white">Data hygiene</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
        Keep publisher names in sync and remove duplicate entities you own.
        {info ? (
          <>
            {" "}
            You have {info.entities ?? 0} entities, {info.publications ?? 0}{" "}
            publications
            {(info.possibleDupeGroups || 0) > 0
              ? `, ${info.possibleDupeGroups} possible duplicate group(s)`
              : ""}
            .
          </>
        ) : null}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => run("full")}
          className="inline-flex h-10 items-center rounded-full bg-omniv-gold px-4 text-[13px] font-semibold text-black disabled:opacity-60"
        >
          {loading ? "Working…" : "Harden now"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => run("sync-names")}
          className="inline-flex h-10 items-center rounded-full bg-white/10 px-4 text-[13px] font-medium text-white disabled:opacity-60"
        >
          Sync names only
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => run("dedupe-entities")}
          className="inline-flex h-10 items-center rounded-full bg-white/10 px-4 text-[13px] font-medium text-white disabled:opacity-60"
        >
          Merge duplicates
        </button>
      </div>
      {status && (
        <p className="mt-3 text-[13px] text-omniv-gold">{status}</p>
      )}
      <p className="mt-3 text-[11px] text-zinc-600">
        Also run SQL migration{" "}
        <code className="text-zinc-500">050_discovery_hardening.sql</code> in
        Supabase once for RLS, reports, and sync function.
      </p>
    </div>
  );
}
