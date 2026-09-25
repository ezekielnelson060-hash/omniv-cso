"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { readProfile } from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  writeActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  path: string;
  verified?: boolean;
};

const LINKS: { href: string; label: string; gold?: boolean }[] = [
  { href: "/profile", label: "Profile" },
  { href: "/accounts", label: "All entities" },
  { href: "/activity", label: "Activity" },
  { href: "/following", label: "Following" },
  { href: "/saved", label: "Saved" },
  { href: "/analytics", label: "Analytics" },
  { href: "/pricing", label: "Upgrade to Pro", gold: true },
  { href: "/publish", label: "Publish" },
];

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState("You");
  const [handle, setHandle] = useState("you");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const p = readProfile();
      setDisplayName(p.displayName || "You");
      setHandle(p.handle || "you");
      setAvatarUrl(p.avatarUrl || null);
      setActive(readActiveAccount());
    } catch {
      /* ignore */
    }
    return onAccountSwitch((a) => setActive(a));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/discovery/entities");
        const data = await res.json();
        if (cancelled) return;
        setAuth(Boolean(data.auth));
        setEntities(data.entities || []);
      } catch {
        if (!cancelled) setAuth(false);
      }
    })();
    // lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      document.body.style.overflow = prev;
    };
  }, [open]);

  function switchPersonal() {
    writeActiveAccount(null);
    setActive(null);
  }

  function switchEntity(e: EntityRow) {
    const a: ActiveAccount = {
      id: e.id,
      type: e.type,
      slug: e.slug,
      name: e.name,
      path: e.path,
    };
    writeActiveAccount(a);
    setActive(a);
  }

  const drawer =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <button
              type="button"
              className="absolute inset-0 bg-black/75"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />

            {/* Full-height left panel */}
            <aside
              className="absolute left-0 top-0 flex h-[100dvh] w-[min(100vw-48px,300px)] flex-col bg-[#0a0a0a] shadow-[8px_0_40px_rgba(0,0,0,0.6)]"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              {/* Header */}
              <div className="shrink-0 border-b border-white/10 px-4 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
                <div className="flex items-center justify-between">
                  <p className="text-[15px] font-semibold text-white">
                    Switch account
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <p className="mt-1 text-[12px] text-zinc-500">
                  {active
                    ? `Publishing as ${active.name}`
                    : "On personal profile"}
                </p>
              </div>

              {/* Scrollable body */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
                {/* Personal */}
                <button
                  type="button"
                  onClick={switchPersonal}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${
                    !active
                      ? "bg-omniv-gold/15 ring-1 ring-omniv-gold/30"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/25 text-sm font-semibold text-omniv-gold">
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
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-white">
                      {displayName}
                    </p>
                    <p className="text-[12px] text-zinc-500">
                      Personal · @{handle}
                    </p>
                  </div>
                  {!active && <span className="text-omniv-gold">✓</span>}
                </button>

                <p className="mt-4 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                  Publish as
                </p>

                {entities.map((e) => {
                  const isActive = active?.id === e.id;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => switchEntity(e)}
                      className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${
                        isActive
                          ? "bg-omniv-gold/15 ring-1 ring-omniv-gold/30"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                        {e.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-white">
                          {e.name}
                          {e.verified && (
                            <span className="ml-1 text-sky-400">✓</span>
                          )}
                        </p>
                        <p className="text-[12px] capitalize text-zinc-500">
                          {e.type}
                        </p>
                      </div>
                      {isActive && (
                        <span className="text-omniv-gold">✓</span>
                      )}
                    </button>
                  );
                })}

                {auth && entities.length === 0 && (
                  <p className="px-3 py-2 text-[12px] text-zinc-500">
                    No entities yet.
                  </p>
                )}

                {!auth && (
                  <Link
                    href="/signup?next=/accounts"
                    onClick={() => setOpen(false)}
                    className="mt-2 block px-3 py-2 text-[13px] text-omniv-gold"
                  >
                    Sign in to create entities →
                  </Link>
                )}

                {/* + Create entity */}
                <Link
                  href="/accounts"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-omniv-gold/50 text-xl text-omniv-gold">
                    +
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-omniv-gold">
                      Create entity
                    </p>
                    <p className="text-[12px] text-zinc-500">
                      Company, artist, brand…
                    </p>
                  </div>
                </Link>

                <div className="my-4 border-t border-white/10" />

                <nav className="space-y-0.5 pb-4">
                  {LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex min-h-[48px] items-center rounded-xl px-3 text-[15px] font-medium ${
                        item.gold ? "text-omniv-gold" : "text-white"
                      } active:bg-white/10`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Image src="/logo.svg" alt="" width={20} height={20} />
                  <span className="text-[12px] text-zinc-600">Omniv</span>
                </div>
              </div>
            </aside>
          </div>,
          document.body
        )
      : null;

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
      {drawer}
    </>
  );
}
