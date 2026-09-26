"use client";

import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

export default function DangerSettingsPage() {
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link href="/settings" className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Danger zone</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg space-y-4 px-4 pb-28 pt-5 md:max-w-2xl">
          <div className="rounded-2xl bg-red-500/5 px-4 py-5 ring-1 ring-red-500/20">
            <p className="text-[14px] font-semibold text-red-400">
              Deactivate account
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
              Temporarily hide your personal profile and entities. You can come
              back anytime.
            </p>
            <button
              type="button"
              className="mt-4 h-11 rounded-full bg-white/[0.06] px-5 text-[13px] font-semibold text-zinc-300"
            >
              Deactivate
            </button>
          </div>

          <div className="rounded-2xl bg-red-500/5 px-4 py-5 ring-1 ring-red-500/20">
            <p className="text-[14px] font-semibold text-red-400">
              Delete account
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
              Permanently remove your personal account, owned entities, and
              publications. This cannot be undone.
            </p>
            <button
              type="button"
              className="mt-4 h-11 rounded-full bg-red-500/20 px-5 text-[13px] font-semibold text-red-400"
            >
              Delete account
            </button>
          </div>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
