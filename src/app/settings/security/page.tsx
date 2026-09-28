"use client";

import { useState } from "react";
import Link from "next/link";
import { SettingsToggle } from "@/components/discovery/settings-toggle";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

export default function SecuritySettingsPage() {
  const [twoFa, setTwoFa] = useState(false);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh overflow-x-hidden bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5"
            >
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Security</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4">
          <section className="mb-7">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Protection
            </p>
            <ul className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
              <li className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-[14px] text-zinc-200">Two-factor authentication</p>
                  <p className="mt-0.5 text-[12px] text-zinc-500">
                    Extra step when signing in
                  </p>
                </div>
                <SettingsToggle on={twoFa} onChange={setTwoFa} label="2FA" />
              </li>
            </ul>
          </section>

          <section className="mb-7">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Sessions
            </p>
            <div className="rounded-2xl bg-white/[0.03] px-4 py-4 ring-1 ring-white/[0.06]">
              <p className="text-[14px] text-zinc-300">This device</p>
              <p className="mt-1 text-[12px] text-zinc-500">Active now</p>
            </div>
          </section>
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
