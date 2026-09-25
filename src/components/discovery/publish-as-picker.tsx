"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readProfile } from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

/**
 * Binds global active identity into Create form.
 * null active = personal profile name, no entity id.
 * entity active = that entity as publisher.
 */
export function PublishAsPicker({
  value,
  onChange,
  onEntityId,
}: {
  value: string;
  onChange: (name: string) => void;
  onEntityId?: (id: string | null) => void;
}) {
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [personalName, setPersonalName] = useState("You");

  function apply(a: ActiveAccount | null, personal: string) {
    if (a) {
      onChange(a.name);
      onEntityId?.(a.id);
    } else {
      onChange(personal);
      onEntityId?.(null);
    }
  }

  useEffect(() => {
    const p = readProfile();
    const name = p.displayName || "You";
    setPersonalName(name);
    const a = readActiveAccount();
    setActive(a);
    apply(a, name);
    return onAccountSwitch((next) => {
      setActive(next);
      apply(next, name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = active?.name || personalName;
  const kind = active
    ? `${active.type}${active.verified ? " · Verified" : ""}`
    : "Personal";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/[0.08]">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-zinc-600">
            Publishing as
          </p>
          <p className="truncate text-[15px] font-semibold text-white">
            {label}
          </p>
          <p className="text-[12px] capitalize text-zinc-500">{kind}</p>
        </div>
        <Link
          href="/accounts/switch"
          className="shrink-0 rounded-full bg-omniv-gold/15 px-3 py-1.5 text-[12px] font-semibold text-omniv-gold"
        >
          Switch
        </Link>
      </div>
      <p className="text-[12px] leading-relaxed text-zinc-500">
        This publication belongs to{" "}
        <span className="font-medium text-zinc-300">{label}</span>
        {active
          ? " — independent of your personal profile."
          : " — your personal identity."}
      </p>
      {/* keep controlled value in sync for parent form */}
      {value !== label && (
        <span className="sr-only">{value}</span>
      )}
    </div>
  );
}
