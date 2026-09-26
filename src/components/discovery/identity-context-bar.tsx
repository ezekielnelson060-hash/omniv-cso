"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readProfile } from "@/lib/discovery/local-profile";
import { onAccountSwitch, readActiveAccount, type ActiveAccount } from "@/lib/discovery/active-account";

export function IdentityContextBar() {
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [personal, setPersonal] = useState("You");

  useEffect(() => {
    setPersonal(readProfile().displayName || "You");
    setActive(readActiveAccount());
    return onAccountSwitch(setActive);
  }, []);

  const name = active?.name || personal;
  const type = active ? `${active.type}${active.verified ? " · Verified" : ""}` : "Personal";
  return (
    <div className="border-b border-white/[0.06] bg-[#080808] px-4 py-2.5 lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-omniv-gold shadow-[0_0_10px_rgba(212,175,55,0.7)]" />
          <span className="truncate text-[12px] text-zinc-500">Current identity:</span>
          <span className="truncate text-[12px] font-semibold text-white">{name}</span>
          <span className="shrink-0 text-[11px] capitalize text-zinc-600">· {type}</span>
        </div>
        <Link href="/accounts/switch" className="shrink-0 text-[11px] font-medium text-omniv-gold">Switch</Link>
      </div>
    </div>
  );
}
