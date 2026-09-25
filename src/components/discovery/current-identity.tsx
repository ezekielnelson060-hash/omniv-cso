"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readProfile } from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

/** Shows which identity is active — required for context-aware screens */
export function CurrentIdentityBanner({
  action,
}: {
  action?: string;
}) {
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [personal, setPersonal] = useState("You");

  useEffect(() => {
    try {
      setPersonal(readProfile().displayName || "You");
      setActive(readActiveAccount());
    } catch {
      /* ignore */
    }
    return onAccountSwitch((a) => setActive(a));
  }, []);

  const name = active?.name || personal;
  const kind = active
    ? `${active.type}${active.verified ? " · Verified" : ""}`
    : "Personal";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3.5 py-2.5 ring-1 ring-white/[0.08]">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-zinc-600">
          {action || "Acting as"}
        </p>
        <p className="truncate text-[14px] font-semibold text-white">
          {name}
          <span className="ml-1.5 text-[12px] font-normal capitalize text-zinc-500">
            · {kind}
          </span>
        </p>
      </div>
      <Link
        href="/accounts/switch"
        className="shrink-0 text-[12px] font-medium text-omniv-gold"
      >
        Switch
      </Link>
    </div>
  );
}
