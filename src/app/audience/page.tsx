"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

type AudienceData = {
  live?: boolean;
  note?: string;
  people: number;
  growthPct: number;
  weekOpened?: number;
  sources: { label: string; pct: number }[];
  interests: { label: string; w: number }[];
  actions: {
    opened: number;
    saved: number;
    followed: number;
    contacted: number;
  };
  topPublications?: {
    slug: string;
    title: string;
    heat: number;
    type: string;
  }[];
  publicationCount?: number;
};

export default function AudiencePage() {
  const [identity, setIdentity] = useState<ActiveAccount | null>(null);
  const [data, setData] = useState<AudienceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIdentity(readActiveAccount());
    return onAccountSwitch((a) => setIdentity(a));
  }, []);

  useEffect(() => {
    if (!identity) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const q = new URLSearchParams();
    if (identity.name) q.set("name", identity.name);
    if (identity.slug) q.set("slug", identity.slug);
    void fetch(`/api/discovery/audience?${q}`)
      .then((r) => r.json())
      .then((j: AudienceData) => {
        if (!cancelled) setData(j);
      })
      .catch(() => {
        if (!cancelled)
          setData({
            live: false,
            people: 0,
            growthPct: 0,
            sources: [],
            interests: [],
            actions: { opened: 0, saved: 0, followed: 0, contacted: 0 },
          });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [identity?.id, identity?.name, identity?.slug]);

  const name = identity?.name || "Your identity";
  const d = data;

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link
              href="/home"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400"
              aria-label="Back"
            >
              ←
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-[16px] font-semibold text-white">Audience</h1>
              <p className="truncate text-[12px] text-zinc-500">{name}</p>
            </div>
            <Link
              href="/promote"
              className="inline-flex h-9 items-center rounded-full bg-omniv-gold px-3.5 text-[12px] font-semibold text-black"
            >
              Promote
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-lg space-y-8 px-4 py-6 pb-28 md:max-w-2xl">
          {loading && (
            <div className="space-y-3">
              <div className="h-16 animate-pulse rounded-2xl bg-white/[0.04]" />
              <div className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
            </div>
          )}

          {!loading && d && (
            <>
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Your publishing is reaching
                </p>
                <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight text-white">
                  {d.people.toLocaleString()}
                </p>
                <p className="mt-1 text-[14px] text-zinc-400">
                  people · discovery views (30 days)
                </p>
                <p
                  className={`mt-2 text-[13px] font-medium ${
                    (d.growthPct || 0) >= 0
                      ? "text-emerald-400"
                      : "text-rose-400"
                  }`}
                >
                  {(d.growthPct || 0) >= 0 ? "+" : ""}
                  {d.growthPct}% this period
                  {typeof d.weekOpened === "number"
                    ? ` · ${d.weekOpened} this week`
                    : ""}
                </p>
                {!d.live && d.note && (
                  <p className="mt-2 text-[12px] text-zinc-600">{d.note}</p>
                )}
                {d.live && d.people === 0 && (
                  <p className="mt-2 text-[13px] text-zinc-500">
                    No discovery views yet. Share a publication or open it
                    yourself to start the graph.
                  </p>
                )}
              </section>

              <section>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Discovery
                </h2>
                <p className="mt-1 text-[13px] text-zinc-500">
                  How people find you
                </p>
                <ul className="mt-4 space-y-2.5">
                  {d.sources.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-center justify-between gap-3 text-[14px]"
                    >
                      <span className="text-zinc-300">{s.label}</span>
                      <span className="tabular-nums text-zinc-500">
                        {s.pct}%
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Interests
                </h2>
                <div className="mt-4 space-y-2.5">
                  {d.interests.map((i) => (
                    <div key={i.label}>
                      <div className="mb-1 flex justify-between text-[13px]">
                        <span className="text-zinc-300">{i.label}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-omniv-gold/80"
                          style={{ width: `${Math.max(8, i.w)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Audience actions
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {[
                    { label: "Opened your publications", n: d.actions.opened },
                    { label: "Saved", n: d.actions.saved },
                    { label: "Followed", n: d.actions.followed },
                    { label: "Contacted you", n: d.actions.contacted },
                  ].map((a) => (
                    <div
                      key={a.label}
                      className="rounded-2xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/[0.06]"
                    >
                      <p className="text-[20px] font-semibold tabular-nums text-white">
                        {a.n.toLocaleString()}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        {a.label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {d.topPublications && d.topPublications.length > 0 && (
                <section>
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Strongest pieces
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {d.topPublications.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/p/${p.slug}`}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-white/[0.06]"
                        >
                          <span className="min-w-0 truncate text-[14px] font-medium text-white">
                            {p.title}
                          </span>
                          <span className="shrink-0 text-[12px] tabular-nums text-omniv-gold">
                            heat {p.heat}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-5">
                <p className="text-[15px] font-semibold text-white">
                  People interested in your work
                </p>
                <p className="mt-1 text-[13px] text-zinc-500">
                  {d.publicationCount || 0} publications · invite more readers
                </p>
                <Link
                  href="/invites"
                  className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
                >
                  Invite to discover more →
                </Link>
              </section>
            </>
          )}

          {!loading && !identity && (
            <p className="text-center text-[14px] text-zinc-500">
              Switch to a publishing identity to see Audience.
            </p>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
