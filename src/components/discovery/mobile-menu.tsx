"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AccountSwitcher } from "@/components/discovery/account-switcher";
import { readProfile } from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

const LINKS = [
  { href: "/profile", label: "Profile" },
  { href: "/accounts", label: "All entities" },
  { href: "/activity", label: "Activity" },
  { href: "/following", label: "Following" },
  { href: "/saved", label: "Saved" },
  { href: "/analytics", label: "Analytics" },
  { href: "/pricing", label: "Upgrade to Pro" },
  { href: "/publish", label: "Publish" },
] as const;

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("You");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [active, setActive] = useState<ActiveAccount | null>(null);

  useEffect(() => {
    try {
      const p = readProfile();
      setDisplayName(p.displayName || "You");
      setAvatarUrl(p.avatarUrl || null);
      setActive(readActiveAccount());
    } catch {
      /* ignore */
    }
    return onAccountSwitch((a) => setActive(a));
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/20 text-[13px] font-semibold text-omniv-gold ring-1 ring-white/15"
        aria-label="Open menu"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          displayName.charAt(0).toUpperCase()
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] bg-black/80"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-[90] flex w-[min(100vw-40px,320px)] flex-col bg-[#0a0a0a] shadow-2xl">
            <div className="border-b border-white/[0.08] px-4 pb-4 pt-5">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-white">
                  Switch account
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              {active ? (
                <p className="mt-1 text-[12px] text-omniv-gold">
                  Publishing as {active.name}
                </p>
              ) : (
                <p className="mt-1 text-[12px] text-zinc-500">
                  On personal profile
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3">
              <AccountSwitcher onClose={() => setOpen(false)} />

              <div className="my-3 border-t border-white/[0.08]" />

              <nav className="space-y-0.5 px-1">
                {LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-[48px] items-center rounded-xl px-3 text-[15px] font-medium ${
                      item.href === "/pricing"
                        ? "text-omniv-gold"
                        : "text-white"
                    } active:bg-white/10`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-white/[0.08] px-4 py-4">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="" width={20} height={20} />
                <span className="text-[12px] text-zinc-600">Omniv</span>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
