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

const DEMO = {
  people: 18421,
  growthPct: 28,
  sources: [
    { label: "Omniv Explore", pct: 41 },
    { label: "Google", pct: 24 },
    { label: "Direct", pct: 17 },
    { label: "Shared links", pct: 11 },
    { label: "Other", pct: 7 },
  ],
  interests: [
    { label: "AI", w: 92 },
    { label: "Technology", w: 78 },
    { label: "Infrastructure", w: 64 },
    { label: "Africa", w: 52 },
    { label: "Business", w: 40 },
  ],
  actions: {
    opened: 2184,
    saved: 684,
    followed: 327,
    contacted: 91,
  },
};

export default function AudiencePage() {
  const [identity, setIdentity] = useState<ActiveAccount | null>(null);

  useEffect(() => {
    setIdentity(readActiveAccount());
    return onAccountSwitch((a) => setIdentity(a));
  }, []);

  const name = identity?.name || "Your identity";
  const d = DEMO;

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
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Your publishing is reaching
            </p>
            <p className="mt-2 text-4xl font-semibold tabular-nums text-white">
              {d.people.toLocaleString()}
            </p>
            <p className="mt-1 text-[13px] text-zinc-500">
              people
              <span className="ml-2 text-emerald-400">
                +{d.growthPct}% this month
              </span>
            </p>
          </section>

          <section className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Discovery
            </p>
            <p className="mt-1 text-[13px] text-zinc-400">How people find you</p>
            <ul className="mt-4 space-y-3">
              {d.sources.map((s) => (
                <li key={s.label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[13px] text-zinc-300">
                    {s.label}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-omniv-gold"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-[12px] tabular-nums text-zinc-500">
                    {s.pct}%
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Interests
            </p>
            <ul className="mt-4 space-y-2.5">
              {d.interests.map((i) => (
                <li key={i.label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[13px] text-zinc-300">
                    {i.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-omniv-gold/80 to-omniv-gold"
                      style={{ width: `${i.w}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Audience actions
            </p>
            <ul className="mt-4 space-y-2.5 text-[14px] text-zinc-300">
              <li>
                <span className="font-semibold tabular-nums text-white">
                  {d.actions.opened.toLocaleString()}
                </span>{" "}
                opened your publications
              </li>
              <li>
                <span className="font-semibold tabular-nums text-white">
                  {d.actions.saved.toLocaleString()}
                </span>{" "}
                saved
              </li>
              <li>
                <span className="font-semibold tabular-nums text-white">
                  {d.actions.followed.toLocaleString()}
                </span>{" "}
                followed
              </li>
              <li>
                <span className="font-semibold tabular-nums text-white">
                  {d.actions.contacted.toLocaleString()}
                </span>{" "}
                contacted you
              </li>
            </ul>
          </section>

          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              People interested in your work
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { n: d.actions.followed, label: "new followers" },
                { n: d.actions.saved, label: "savers" },
                { n: d.actions.contacted, label: "contacts" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-xl bg-white/[0.03] px-3 py-3 text-center ring-1 ring-white/[0.06]"
                >
                  <p className="text-[18px] font-semibold tabular-nums text-white">
                    {c.n.toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{c.label}</p>
                </div>
              ))}
            </div>
            <Link
              href="/invites"
              className="mt-4 flex h-11 items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
            >
              Invite to discover more →
            </Link>
          </section>

          <p className="text-center text-[11px] text-zinc-600">
            Aggregate insights only. Individual readers stay private.
          </p>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
