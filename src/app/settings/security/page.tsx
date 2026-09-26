"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

export default function SecuritySettingsPage() {
  const [twoFa, setTwoFa] = useState(false);

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link href="/settings" className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Security</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-5 md:max-w-2xl">
          <ul className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
            <li className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-[14px] font-medium text-white">
                  Two-factor authentication
                </p>
                <p className="mt-0.5 text-[12px] text-zinc-500">
                  Extra layer for money and identity actions
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={twoFa}
                onClick={() => setTwoFa((v) => !v)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  twoFa ? "bg-omniv-gold" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                    twoFa ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </li>
            <li className="border-t border-white/[0.05] px-4 py-3.5">
              <p className="text-[14px] font-medium text-white">Active sessions</p>
              <p className="mt-1 text-[13px] text-zinc-500">
                This device · Current session
              </p>
            </li>
            <li className="border-t border-white/[0.05] px-4 py-3.5">
              <p className="text-[14px] font-medium text-white">
                Connected accounts
              </p>
              <p className="mt-1 text-[13px] text-zinc-500">
                Manage OAuth providers from your auth provider dashboard.
              </p>
            </li>
            <li className="border-t border-white/[0.05] px-4 py-3.5">
              <p className="text-[14px] font-medium text-white">
                Password & security
              </p>
              <p className="mt-1 text-[13px] text-zinc-500">
                Password changes are handled by your sign-in method.
              </p>
            </li>
          </ul>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
