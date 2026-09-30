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

/**
 * Audience — growth center for the active publishing identity.
 * Aggregate + consented only — never expose anonymous reader names.
 */
export default function AudiencePage() {
  const [identity, setIdentity] = useState<ActiveAccount | null>(null);

  useEffect(() => {
    setIdentity(readActiveAccount());
    return onAccountSwitch((a) => setIdentity(a));
  }, []);

  const name = identity?.name || "Your identity";

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
            <p className="mt-2 text-4xl font-semibold tabular-nums text-white">—</p>
            <p className="mt-1 text-[13px] text-zinc-500">
              People who discovered this identity on Omniv
            </p>
          </section>

          <section className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Discovery sources
            </p>
            <ul className="mt-4 space-y-3 text-[14px]">
              {[
                { label: "Omniv Explore", pct: "—" },
                { label: "Search engines", pct: "—" },
                { label: "Direct", pct: "—" },
                { label: "Shared links", pct: "—" },
                { label: "Other", pct: "—" },
              ].map((s) => (
                <li key={s.label} className="flex items-center justify-between">
                  <span className="text-zinc-300">{s.label}</span>
                  <span className="tabular-nums text-zinc-500">{s.pct}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] text-zinc-600">
              Source breakdown fills as your publications gain traffic.
            </p>
          </section>

          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Interests in your audience
            </p>
            <p className="mt-2 text-[13px] text-zinc-500">
              Topics people engage with across your publications.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Technology", "AI", "Business", "Research"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/[0.05] px-3 py-1.5 text-[12px] text-zinc-400 ring-1 ring-white/[0.06]"
                >
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Audience actions
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Opened", value: "—" },
                { label: "Saved", value: "—" },
                { label: "Followed", value: "—" },
                { label: "Contacted", value: "—" },
              ].map((a) => (
                <li
                  key={a.label}
                  className="rounded-xl bg-white/[0.03] px-3 py-3 text-center ring-1 ring-white/[0.05]"
                >
                  <p className="text-[20px] font-semibold tabular-nums text-white">
                    {a.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{a.label}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-omniv-gold/10 p-5 ring-1 ring-omniv-gold/25">
            <p className="text-[15px] font-semibold text-white">
              People interested in your work
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
              When readers save, follow, or explore your entity, you can invite
              them to discover more — without exposing anonymous reader
              identities.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/invites"
                className="inline-flex h-10 items-center rounded-full bg-omniv-gold px-4 text-[13px] font-semibold text-black"
              >
                Invite to discover
              </Link>
              <Link
                href="/promote"
                className="inline-flex h-10 items-center rounded-full bg-white/[0.08] px-4 text-[13px] font-medium text-white"
              >
                Promote a publication
              </Link>
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
