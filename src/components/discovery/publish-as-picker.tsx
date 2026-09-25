"use client";

import { useEffect } from "react";
import { AccountSwitcher } from "@/components/discovery/account-switcher";
import {
  readActiveAccount,
  onAccountSwitch,
} from "@/lib/discovery/active-account";

/** Binds the global active account into the Create form. */
export function PublishAsPicker({
  value,
  onChange,
  onEntityId,
}: {
  value: string;
  onChange: (name: string) => void;
  onEntityId?: (id: string | null) => void;
}) {
  useEffect(() => {
    const a = readActiveAccount();
    if (a) {
      onChange(a.name);
      onEntityId?.(a.id);
    }
    return onAccountSwitch((next) => {
      if (next) {
        onChange(next.name);
        onEntityId?.(next.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      <AccountSwitcher
        onPicked={(a) => {
          onChange(a.name);
          onEntityId?.(a.id);
        }}
      />
      {value ? (
        <p className="text-[12px] leading-relaxed text-zinc-500">
          Your publication will appear on the{" "}
          <span className="font-medium text-zinc-300">{value}</span> profile.
        </p>
      ) : (
        <p className="text-[12px] text-zinc-600">
          Switch account above — everything you publish stays under that profile.
        </p>
      )}
    </div>
  );
}
