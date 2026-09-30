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
 * Invite to discover — not spam follow-me.
 * Only consented / public engagers. Aggregates for anonymous readers.
 */
export default function InvitesPage() {
  const [identity, setIdentity] = useState<ActiveAccount | null>(null);
  const [selected, setSelected] = useState<string[]>(["saved", "followed"]);

  useEffect(() => {
    setIdentity(readActiveAccount());
    return onAccountSwitch((a) => setIdentity(a));
  }, []);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const segments = [
    { id: "read", label: "People who read", hint: "Completed a meaningful open" },
    { id: "saved", label: "People who saved", hint: "Bookmarked your work" },
    { id: "liked", label: "People who liked", hint: "Engaged with a publication" },
    { id: "followed", label: "New followers", hint: "Followed after discovering you" },
    { id: "topics", label: "Interested in your topics", hint: "Overlap with your tags" },
  ];

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link
              href="/audience"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400"
              aria-label="Back"
            >
              ←
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-[16px] font-semibold text-white">
                Invite to discover
              </h1>
              <p className="truncate text-[12px] text-zinc-500">
                {identity?.name || "Your identity"}
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-28 md:max-w-2xl">
          <p className="text-[14px] leading-relaxed text-zinc-400">
            Invite people who already engaged with your work to explore more.
            Omniv only surfaces profiles that are public or consented — never
            private identities of anonymous readers.
          </p>

          <section>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Who to invite
            </p>
            <ul className="mt-3 space-y-2">
              {segments.map((s) => {
                const on = selected.includes(s.id);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => toggle(s.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-left ring-1 transition ${
                        on
                          ? "bg-omniv-gold/10 ring-omniv-gold/40"
                          : "bg-white/[0.03] ring-white/[0.06]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[12px] ${
                          on
                            ? "bg-omniv-gold text-black"
                            : "bg-white/[0.08] text-zinc-500"
                        }`}
                      >
                        {on ? "✓" : ""}
                      </span>
                      <span>
                        <span className="block text-[14px] font-medium text-white">
                          {s.label}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-zinc-500">
                          {s.hint}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
            <p className="text-[13px] font-medium text-white">What they receive</p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
              Omniv wants to show you more from{" "}
              <span className="text-zinc-200">
                {identity?.name || "this publisher"}
              </span>
              .
            </p>
            <p className="mt-2 text-[13px] text-zinc-500">
              A discovery invitation — not a generic “follow me.”
            </p>
          </section>

          <button
            type="button"
            disabled={selected.length === 0}
            className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black disabled:opacity-40"
            onClick={() => {
              alert(
                "Invitation queued. Delivery to consented readers ships with the notification pipeline."
              );
            }}
          >
            Invite to discover more
          </button>

          <p className="text-center text-[11px] text-zinc-600">
            Reasonable limits apply. Anonymous readers stay aggregated.
          </p>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
