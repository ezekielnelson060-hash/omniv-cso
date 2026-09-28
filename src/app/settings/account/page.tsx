"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { readProfile, writeProfile } from "@/lib/discovery/local-profile";

export default function AccountSettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = readProfile();
    setDisplayName(p.displayName || "");
  }, []);

  function save() {
    const p = readProfile();
    writeProfile({
      ...p,
      displayName: displayName.trim() || p.displayName,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

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
            <h1 className="text-[17px] font-semibold text-white">
              Personal information
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg space-y-5 px-4 pb-28 pt-5">
          <p className="text-[13px] text-zinc-500">
            Your display name is how people see you. Username is managed on its
            own page — unique across Omniv.
          </p>
          <label className="block">
            <span className="text-[12px] text-zinc-500">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-3.5 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/30"
            />
          </label>
          <label className="block">
            <span className="text-[12px] text-zinc-500">Email</span>
            <input
              type="email"
              readOnly
              placeholder="Managed via your sign-in provider"
              className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-3.5 text-[15px] text-zinc-500 outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600"
            />
          </label>
          <Link
            href="/settings/username"
            className="flex h-12 items-center justify-between rounded-xl bg-white/[0.03] px-4 text-[14px] text-white ring-1 ring-white/[0.08]"
          >
            <span>Username</span>
            <span className="text-omniv-gold">Change →</span>
          </Link>

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
