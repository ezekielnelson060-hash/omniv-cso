"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import {
  readNetwork,
  writeNetwork,
  type NetworkSettings,
} from "@/lib/discovery/network-settings";

export default function NetworkSettingsPage() {
  const [s, setS] = useState<NetworkSettings | null>(null);

  useEffect(() => {
    setS(readNetwork());
  }, []);

  function toggleDiscoverable() {
    setS((prev) => {
      if (!prev) return prev;
      const next = { ...prev, discoverable: !prev.discoverable };
      writeNetwork(next);
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
            <h1 className="text-[17px] font-semibold text-white">Network</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg space-y-5 px-4 pb-28 pt-5">
          <Link
            href="/following"
            className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/[0.06]"
          >
            <span className="text-[14px] font-medium text-white">Following</span>
            <span className="text-zinc-600">›</span>
          </Link>

          <ul className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
            <li className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-[14px] font-medium text-white">
                  Discoverability
                </p>
                <p className="mt-0.5 text-[12px] text-zinc-500">
                  Appear in Explore and search
                </p>
              </div>
              {s && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.discoverable}
                  onClick={toggleDiscoverable}
                  className={`relative h-7 w-12 rounded-full transition ${
                    s.discoverable ? "bg-omniv-gold" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                      s.discoverable ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
              )}
            </li>
            <li className="border-t border-white/[0.05] px-4 py-3.5">
              <p className="text-[14px] font-medium text-white">
                Blocked accounts
              </p>
              <p className="mt-1 text-[13px] text-zinc-500">
                {s && s.blockedIds.length > 0
                  ? `${s.blockedIds.length} blocked`
                  : "None blocked."}
              </p>
            </li>
          </ul>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
