"use client";

import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

export default function BillingSettingsPage() {
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link href="/settings" className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Billing</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg space-y-4 px-4 pb-28 pt-5 md:max-w-2xl">
          <div className="rounded-2xl bg-white/[0.03] px-4 py-5 ring-1 ring-white/[0.06]">
            <p className="text-[12px] text-zinc-500">Current plan</p>
            <p className="mt-1 text-[18px] font-semibold text-white">Free</p>
            <Link
              href="/pro"
              className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
            >
              Upgrade to Pro
            </Link>
          </div>

          <ul className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
            <li className="px-4 py-3.5">
              <p className="text-[14px] font-medium text-white">Payment methods</p>
              <p className="mt-1 text-[13px] text-zinc-500">
                Added at checkout via Flutterwave.
              </p>
            </li>
            <li className="border-t border-white/[0.05] px-4 py-3.5">
              <p className="text-[14px] font-medium text-white">Invoices</p>
              <p className="mt-1 text-[13px] text-zinc-500">No invoices yet.</p>
            </li>
          </ul>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
