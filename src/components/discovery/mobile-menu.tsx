"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { readProfile } from "@/lib/discovery/local-profile";

const LINKS = [
  { href: "/profile", label: "Profile", hint: "You — personal identity" },
  { href: "/accounts", label: "Entities", hint: "Companies, artists, brands" },
  { href: "/following", label: "Following", hint: null },
  { href: "/saved", label: "Saved", hint: null },
  { href: "/activity", label: "Activity", hint: null },
  { href: "/pricing", label: "Pro", hint: "Verified & analytics" },
  { href: "/publish", label: "Publish", hint: null },
] as const;

/** X-style menu for mobile — differentiates Profile vs Entities */
export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("You");
  const [handle, setHandle] = useState("you");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const p = readProfile();
      setDisplayName(p.displayName || "You");
      setHandle(p.handle || "you");
      setAvatarUrl(p.avatarUrl || null);
    } catch {
      /* ignore */
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/20 text-[13px] font-semibold text-omniv-gold ring-1 ring-white/10"
        aria-label="Menu"
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
            className="fixed inset-0 z-[60] bg-black/60"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-[70] flex w-[min(100%,300px)] flex-col bg-[#0a0a0a] shadow-2xl ring-1 ring-white/10">
            <div className="border-b border-white/[0.06] px-4 pb-4 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/20 text-lg font-semibold text-omniv-gold">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-white">
                    {displayName}
                  </p>
                  <p className="text-[13px] text-zinc-500">@{handle}</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
                Profile = you. Entities = who you publish as.
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col rounded-xl px-3 py-3 transition active:bg-white/5"
                >
                  <span className="text-[15px] font-medium text-white">
                    {item.label}
                  </span>
                  {item.hint && (
                    <span className="text-[12px] text-zinc-500">{item.hint}</span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="border-t border-white/[0.06] px-4 py-4">
              <div className="flex items-center gap-2">
                <Image src="/logo.svg" alt="" width={20} height={20} />
                <span className="text-[12px] text-zinc-600">Omniv</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
