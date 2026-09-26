"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { readProfile, writeProfile } from "@/lib/discovery/local-profile";

export default function AccountSettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const p = readProfile();
      setDisplayName(p.displayName || "");
      setHandle(p.handle || "");
      setEmail((p as { email?: string }).email || "");
    } catch {
      /* ignore */
    }
  }, []);

  function save() {
    try {
      const p = readProfile();
      writeProfile({
        ...p,
        displayName: displayName.trim() || p.displayName,
        handle: handle.trim().replace(/^@/, "") || p.handle,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link href="/settings" className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Account</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg space-y-5 px-4 pb-28 pt-5 md:max-w-2xl">
          <label className="block">
            <span className="text-[12px] text-zinc-500">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-3.5 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/30"
            />
          </label>
          <label className="block">
            <span className="text-[12px] text-zinc-500">Username</span>
            <div className="mt-1.5 flex h-12 items-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] focus-within:ring-omniv-gold/30">
              <span className="pl-3.5 text-zinc-500">@</span>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="h-full flex-1 bg-transparent px-2 text-[15px] text-white outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-[12px] text-zinc-500">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Managed via your sign-in provider"
              className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-3.5 text-[15px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:ring-omniv-gold/30"
            />
          </label>

          <button
            type="button"
            onClick={save}
            className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
          >
            {saved ? "Saved" : "Save"}
          </button>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
