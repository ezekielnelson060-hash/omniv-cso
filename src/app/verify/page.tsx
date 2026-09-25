"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  path: string;
  verified?: boolean;
};

type Req = {
  id: string;
  entity_name: string;
  status: string;
  created_at: string;
};

export default function VerifyPage() {
  const router = useRouter();
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [entityId, setEntityId] = useState("");
  const [verifyType, setVerifyType] = useState<"individual" | "organization">(
    "organization"
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [eRes, rRes] = await Promise.all([
          fetch("/api/discovery/entities"),
          fetch("/api/discovery/verify"),
        ]);
        const eData = await eRes.json();
        const rData = await rRes.json();
        if (cancelled) return;
        setAuth(Boolean(eData.auth));
        setEntities(eData.entities || []);
        setRequests(rData.requests || []);
        if (eData.entities?.[0]) setEntityId(eData.entities[0].id);
      } catch {
        if (!cancelled) setAuth(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const selected = entities.find((x) => x.id === entityId);
    try {
      const res = await fetch("/api/discovery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId: selected?.id,
          entityType: selected?.type,
          entitySlug: selected?.slug,
          entityName: selected?.name || "Entity",
          verifyType,
          notes,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/signup?next=/verify");
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

  const selected = entities.find((x) => x.id === entityId);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl">
            <div className="flex items-center gap-2">
              <Link
                href="/pricing"
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white"
              >
                ←
              </Link>
              <span className="text-[15px] font-semibold text-white">
                Get Verified
              </span>
            </div>
            <Image
              src="/logo.svg"
              alt=""
              width={24}
              height={24}
              className="opacity-80"
            />
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-6 md:max-w-2xl">
          <h1 className="text-2xl font-semibold text-white">
            Apply for verification
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
            Verified is a <span className="text-omniv-gold">Pro</span> feature.
            When billing is live, Pro unlocks the badge automatically after
            review. For launch, submit an application and we activate approved
            accounts.
          </p>

          <ul className="mt-5 space-y-2 text-[13px] text-zinc-400">
            <li className="flex gap-2">
              <span className="text-omniv-gold">✓</span> Build trust with your
              audience
            </li>
            <li className="flex gap-2">
              <span className="text-omniv-gold">✓</span> Higher visibility in
              search
            </li>
            <li className="flex gap-2">
              <span className="text-omniv-gold">✓</span> Authentic entity mark
            </li>
          </ul>

          {auth === false && (
            <div className="mt-8 text-center">
              <Link
                href="/signup?next=/verify"
                className="inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Sign in to apply
              </Link>
            </div>
          )}

          {auth && done && (
            <div className="mt-8 rounded-2xl bg-emerald-500/10 p-5 text-center ring-1 ring-emerald-500/25">
              <p className="text-[15px] font-semibold text-emerald-300">
                Request submitted
              </p>
              <p className="mt-2 text-[13px] text-zinc-400">
                We'll turn on the badge after review. Upgrade to Pro when
                payments go live.
              </p>
              <Link
                href="/pricing"
                className="mt-4 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
              >
                View Pro plans
              </Link>
            </div>
          )}

          {auth && !done && (
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              {entities.length === 0 ? (
                <p className="text-[14px] text-zinc-500">
                  Create an entity first.{" "}
                  <Link href="/accounts" className="text-omniv-gold">
                    Your entities →
                  </Link>
                </p>
              ) : (
                <div>
                  <p className="text-[12px] font-medium text-zinc-400">
                    Entity to verify
                  </p>
                  <select
                    value={entityId}
                    onChange={(e) => setEntityId(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
                  >
                    {entities.map((ent) => (
                      <option
                        key={ent.id}
                        value={ent.id}
                        className="bg-zinc-900"
                      >
                        {ent.name}
                        {ent.verified ? " (already verified)" : ""} · {ent.type}
                      </option>
                    ))}
                  </select>
                  {selected && (
                    <p className="mt-1.5 text-[11px] text-zinc-600">
                      Slug:{" "}
                      <span className="text-zinc-400">{selected.slug}</span>
                      {" · "}
                      Page:{" "}
                      <span className="text-zinc-400">{selected.path}</span>
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="text-[12px] font-medium text-zinc-400">
                  Verification type
                </p>
                <div className="mt-2 flex gap-2">
                  {(
                    [
                      { id: "individual" as const, label: "Individual" },
                      { id: "organization" as const, label: "Organization" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setVerifyType(t.id)}
                      className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium ${
                        verifyType === t.id
                          ? "bg-omniv-gold/15 text-omniv-gold ring-1 ring-omniv-gold/40"
                          : "text-zinc-400 ring-1 ring-white/10"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-[12px] text-zinc-400">
                  Anything we should know? (optional)
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Website, social proof, company registration…"
                  className="mt-1.5 w-full rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
                />
              </label>

              {error && <p className="text-[13px] text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading || entities.length === 0}
                className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black disabled:opacity-50"
              >
                {loading ? "Submitting…" : "Submit application"}
              </button>

              <Link
                href="/pricing"
                className="block text-center text-[13px] text-zinc-500 hover:text-omniv-gold"
              >
                See Pro pricing →
              </Link>
            </form>
          )}

          {requests.length > 0 && (
            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                Your requests
              </p>
              <ul className="mt-2 space-y-2">
                {requests.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5 text-[13px] ring-1 ring-white/[0.06]"
                  >
                    <span className="text-white">{r.entity_name}</span>
                    <span
                      className={
                        r.status === "approved"
                          ? "text-emerald-400"
                          : r.status === "rejected"
                            ? "text-red-400"
                            : "text-omniv-gold"
                      }
                    >
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
