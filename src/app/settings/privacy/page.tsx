"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

type Opt = "everyone" | "followers" | "nobody";

function Select({
  value,
  onChange,
}: {
  value: Opt;
  onChange: (v: Opt) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Opt)}
      className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[13px] text-white outline-none"
    >
      <option value="everyone">Everyone</option>
      <option value="followers">Followers</option>
      <option value="nobody">Nobody</option>
    </select>
  );
}

export default function PrivacySettingsPage() {
  const [contact, setContact] = useState<Opt>("everyone");
  const [follow, setFollow] = useState<Opt>("everyone");
  const [pubs, setPubs] = useState<Opt>("everyone");
  const [profile, setProfile] = useState<Opt>("everyone");
  const [search, setSearch] = useState(true);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link href="/settings" className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Privacy</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-5 md:max-w-2xl">
          <ul className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
            {(
              [
                {
                  label: "Who can contact me",
                  value: contact,
                  set: setContact,
                },
                {
                  label: "Who can follow me",
                  value: follow,
                  set: setFollow,
                },
                {
                  label: "Publications visibility",
                  value: pubs,
                  set: setPubs,
                },
                {
                  label: "Profile visibility",
                  value: profile,
                  set: setProfile,
                },
              ] as const
            ).map((row, i) => (
              <li
                key={row.label}
                className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                  i > 0 ? "border-t border-white/[0.05]" : ""
                }`}
              >
                <span className="text-[14px] text-zinc-200">{row.label}</span>
                <Select value={row.value} onChange={row.set} />
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3.5">
              <span className="text-[14px] text-zinc-200">Search visibility</span>
              <button
                type="button"
                role="switch"
                aria-checked={search}
                onClick={() => setSearch((v) => !v)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  search ? "bg-omniv-gold" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                    search ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </li>
          </ul>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
