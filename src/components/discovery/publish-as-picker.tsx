"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readProfile } from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";
import { GetVerifiedCard } from "@/components/discovery/get-verified-card";

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

      {!active ? (
        <div className="rounded-xl border border-omniv-gold/25 bg-omniv-gold/10 px-3.5 py-3">
          <p className="text-[13px] font-medium text-omniv-gold">
            Create a public page for this work
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">
            Without an identity (artist, company, brand…), profile links stay
            broken. Create one once — then publish under it.
          </p>
          <Link
            href="/accounts"
            className="mt-2.5 inline-flex h-9 items-center rounded-full bg-omniv-gold px-4 text-[12px] font-semibold text-black"
          >
            Create identity
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[12px] leading-relaxed text-zinc-500">
            This publication belongs to{" "}
            <span className="font-medium text-zinc-300">{label}</span> — independent
            of your personal profile.
          </p>
          {!active.verified ? (
            <GetVerifiedCard variant="banner" name={label} />
          ) : null}
        </div>
      )}

      {value !== label && <span className="sr-only">{value}</span>}
    </div>
  );
}
