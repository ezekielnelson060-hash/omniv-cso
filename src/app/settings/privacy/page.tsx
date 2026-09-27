"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  readPrivacy,
  writePrivacy,
  type PrivacyOpt,
  type PrivacySettings,
} from "@/lib/discovery/privacy-settings";

function Select({
  value,
  onChange,
}: {
  value: PrivacyOpt;
  onChange: (v: PrivacyOpt) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PrivacyOpt)}
      className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[13px] text-white outline-none"
    >
      <option value="everyone">Everyone</option>
      <option value="followers">Followers</option>
      <option value="nobody">Nobody</option>
    </select>
  );
}

export default function PrivacySettingsPage() {
  const [s, setS] = useState<PrivacySettings | null>(null);

  useEffect(() => {
    setS(readPrivacy());
  }, []);

  function update(patch: Partial<PrivacySettings>) {
    setS((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      writePrivacy(next);
      return next;
    });
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <Link href="/settings" className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Privacy</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-5">
          {!s ? (
            <p className="text-[13px] text-zinc-500">Loading…</p>
          ) : (
            <ul className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
              {(
                [
                  {
                    label: "Who can contact me",
                    key: "whoCanContact" as const,
                  },
                  {
                    label: "Who can follow me",
                    key: "whoCanFollow" as const,
                  },
                  {
                    label: "Publications visibility",
                    key: "publicationsVisibility" as const,
                  },
                  {
                    label: "Profile & search visibility",
                    key: "profileVisibility" as const,
                  },
                ] as const
              ).map((row, i) => (
                <li
                  key={row.key}
                  className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                    i > 0 ? "border-t border-white/[0.05]" : ""
                  }`}
                >
                  <span className="text-[14px] font-medium text-white">
                    {row.label}
                  </span>
                  <Select
                    value={s[row.key]}
                    onChange={(v) => update({ [row.key]: v })}
                  />
                </li>
              ))}
              <li className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3.5">
                <div>
                  <p className="text-[14px] font-medium text-white">
                    Appear in search
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-500">
                    Let people find you on Omniv
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.searchVisible}
                  onClick={() => update({ searchVisible: !s.searchVisible })}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    s.searchVisible ? "bg-omniv-gold" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                      s.searchVisible ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              </li>
            </ul>
          )}
          <p className="mt-4 text-[12px] text-zinc-600">
            Preferences are saved on this device.
          </p>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
