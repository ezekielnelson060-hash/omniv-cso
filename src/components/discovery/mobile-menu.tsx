"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IdentitySwitcher } from "@/components/discovery/identity-switcher";
import { readProfile } from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

type NavItem = { href: string; label: string; badge?: string };

const MAIN: NavItem[] = [
  { href: "/home", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/following", label: "Following" },
  { href: "/saved", label: "Saved" },
];

const PUBLISH: NavItem[] = [
  { href: "/publications", label: "Publications" },
  { href: "/drafts", label: "Drafts" },
];

const GROW: NavItem[] = [
  { href: "/analytics", label: "Analytics" },
  { href: "/promote", label: "Promote" },
  { href: "/verify", label: "Get Verified" },
];

const MONETIZE: NavItem[] = [
  { href: "/pro", label: "Pro", badge: "New" },
  { href: "/explore?type=opportunity", label: "Opportunities" },
];

/**
 * Mobile full-height drawer — identity-first nav per production spec.
 * No duplicate Profile / All entities / Switch entity list items.
 */
export function MobileMenuButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"nav" | "switch">("nav");
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [displayName, setDisplayName] = useState("You");
  const [handle, setHandle] = useState("you");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
    if (!open) {
      setMode("nav");
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const identityName = active?.name || displayName;
  const identityType = active
    ? `${active.type}${active.verified ? " · Verified" : ""}`
    : "Personal";
  const identityHandle = active?.handle || active?.slug || handle;
  const identityAvatar = active?.avatarUrl || avatarUrl;

  function close() {
    setOpen(false);
  }

  function NavLink({ item }: { item: NavItem }) {
    const base = item.href.split("?")[0];
    const isActive =
      pathname === item.href ||
      (base !== "/home" && pathname.startsWith(base));
    return (
      <Link
        href={item.href}
        onClick={close}
        className={`relative flex min-h-[44px] items-center rounded-xl px-3 text-[15px] font-medium ${
          isActive ? "bg-white/[0.06] text-white" : "text-zinc-300"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-omniv-gold" />
        )}
        {item.label}
        {item.badge && (
          <span className="ml-auto rounded-full bg-omniv-gold/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-omniv-gold">
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  const drawer =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              aria-label="Close menu"
              onClick={close}
            />
            <aside
              className="absolute left-0 top-0 flex h-[100dvh] w-[min(100vw-40px,300px)] flex-col bg-[#080808] shadow-[12px_0_48px_rgba(0,0,0,0.65)]"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              {/* Header */}
              <div className="shrink-0 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
                <div className="mb-3 flex items-center gap-2">
                  <Image src="/logo.svg" alt="" width={22} height={22} />
                  <span className="text-[13px] font-semibold tracking-wide text-white">
                    OMNIV
                  </span>
                </div>

                {/* Current identity — opens switcher */}
                <button
                  type="button"
                  onClick={() => setMode(mode === "switch" ? "nav" : "switch")}
                  className="flex w-full items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 text-left ring-1 ring-white/[0.08]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/20 text-sm font-semibold text-omniv-gold">
                    {identityAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={identityAvatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      identityName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-[14px] font-semibold text-white">
                      {identityName}
                      {active?.verified && (
                        <span className="text-sky-400">✓</span>
                      )}
                    </p>
                    <p className="truncate text-[11px] capitalize text-zinc-500">
                      {identityType} · @{identityHandle}
                    </p>
                  </div>
                  <span className="text-zinc-500">›</span>
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
                {mode === "switch" ? (
                  <IdentitySwitcher
                    onClose={() => {
                      setMode("nav");
                    }}
                  />
                ) : (
                  <>
                    <Section label="Home">
                      {MAIN.map((item) => (
                        <NavLink key={item.label} item={item} />
                      ))}
                    </Section>
                    <Section label="Publish">
                      {PUBLISH.map((item) => (
                        <NavLink key={item.label} item={item} />
                      ))}
                    </Section>
                    <Section label="Grow">
                      {GROW.map((item) => (
                        <NavLink key={item.label} item={item} />
                      ))}
                    </Section>
                    <Section label="Monetize">
                      {MONETIZE.map((item) => (
                        <NavLink key={item.label} item={item} />
                      ))}
                    </Section>
                    <Section label="Identity">
                      <button
                        type="button"
                        onClick={() => setMode("switch")}
                        className="flex min-h-[44px] w-full items-center rounded-xl px-3 text-[15px] font-medium text-zinc-300"
                      >
                        Switch identity
                      </button>
                      <Link
                        href={active ? `${active.path}/edit` : "/accounts"}
                        onClick={close}
                        className="flex min-h-[44px] items-center rounded-xl px-3 text-[15px] font-medium text-zinc-300"
                      >
                        Manage entity
                      </Link>
                    </Section>
                  </>
                )}
              </div>

              <div className="shrink-0 space-y-2 border-t border-white/[0.06] px-3 py-3">
                <Link
                  href="/publish"
                  onClick={close}
                  className="flex h-11 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
                >
                  + Publish
                </Link>
                <Link
                  href={active?.path || "/profile"}
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-xl px-2 py-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/10 text-[11px] font-semibold text-white">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      identityName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-white">
                      {identityName}
                    </p>
                    <p className="text-[10px] capitalize text-zinc-600">{identityType}</p>
                  </div>
                </Link>
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
        {identityAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={identityAvatar}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          identityName.charAt(0).toUpperCase()
        )}
      </button>
      {drawer}
    </>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
