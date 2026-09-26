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

type NavItem = { href: string; label: string; badge?: string; icon: string };

const PRIMARY: NavItem[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/explore", label: "Explore", icon: "search" },
  { href: "/notifications", label: "Notifications", icon: "bell" },
];

const NETWORK: NavItem[] = [
  { href: "/following", label: "Following", icon: "users" },
  { href: "/saved", label: "Saved", icon: "bookmark" },
  { href: "/activity", label: "Activity", icon: "activity" },
];

const PUBLISH: NavItem[] = [
  { href: "/publish", label: "New publication", icon: "plus" },
];

const MANAGE: NavItem[] = [
  { href: "/analytics", label: "Analytics", icon: "chart" },
  { href: "/promote", label: "Promote", icon: "boost" },
  { href: "/accounts", label: "Entities", icon: "entities" },
];

const MONETIZE: NavItem[] = [
  { href: "/pro", label: "Upgrade to Pro", badge: "Popular", icon: "star" },
  { href: "/verify", label: "Get Verified", icon: "check" },
];

function Icon({ name }: { name: string }) {
  const p = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    className: "shrink-0 opacity-80",
  } as const;
  switch (name) {
    case "home":
      return (
        <svg {...p}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-5.5H10V21H5a1 1 0 0 1-1-1v-9.5z" strokeLinejoin="round" />
        </svg>
      );
    case "search":
      return (
        <svg {...p}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" strokeLinecap="round" />
        </svg>
      );
    case "bell":
      return (
        <svg {...p}>
          <path d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
        </svg>
      );
    case "users":
      return (
        <svg {...p}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M3 19c1.2-3 3.5-4.5 6-4.5s4.8 1.5 6 4.5" strokeLinecap="round" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...p}>
          <path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-3.2L6 21V4.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
        </svg>
      );
    case "activity":
      return (
        <svg {...p}>
          <path d="M4 12h4l2-6 4 12 2-6h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "plus":
      return (
        <svg {...p}>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      );
    case "chart":
      return (
        <svg {...p}>
          <path d="M4 19h16M7 16V10M12 16V6M17 16v-4" strokeLinecap="round" />
        </svg>
      );
    case "boost":
      return (
        <svg {...p}>
          <path d="M13 3 4 14h7l-1 7 9-11h-7l1-7z" strokeLinejoin="round" />
        </svg>
      );
    case "entities":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "check":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12.5 2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "star":
      return (
        <svg {...p}>
          <path d="m12 3 2.4 5.4 5.8.6-4.4 3.9 1.3 5.7L12 15.8 6.9 18.6l1.3-5.7L3.8 9l5.8-.6L12 3z" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

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
    const isPro = item.label.includes("Pro");
    return (
      <Link
        href={item.href}
        onClick={close}
        className={`relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[15px] font-medium ${
          isActive
            ? "bg-white/[0.06] text-white"
            : isPro
              ? "text-omniv-gold"
              : "text-zinc-300"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-omniv-gold" />
        )}
        <Icon name={item.icon} />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="rounded-full bg-omniv-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">
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
              <div className="shrink-0 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
                <div className="mb-3 flex items-center gap-2">
                  <Image src="/logo.svg" alt="" width={22} height={22} />
                  <span className="text-[13px] font-semibold tracking-wide text-white">
                    OMNIV
                  </span>
                </div>

                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                  Publishing as
                </p>
                <button
                  type="button"
                  onClick={() => setMode(mode === "switch" ? "nav" : "switch")}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-2.5 text-left"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-omniv-gold/20">
                    {identityAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={identityAvatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-omniv-gold">
                        {identityName.charAt(0).toUpperCase()}
                      </span>
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
                  <span className="text-zinc-500">▾</span>
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
                    <Section label="">
                      {PRIMARY.map((item) => (
                        <NavLink key={item.label} item={item} />
                      ))}
                    </Section>
                    <Section label="Your network">
                      {NETWORK.map((item) => (
                        <NavLink key={item.label} item={item} />
                      ))}
                    </Section>
                    <Section label="Publish">
                      {PUBLISH.map((item) => (
                        <NavLink key={item.label} item={item} />
                      ))}
                    </Section>
                    <Section label="Manage">
                      {MANAGE.map((item) => (
                        <NavLink key={item.label} item={item} />
                      ))}
                    </Section>
                    <Section label="Monetize">
                      {MONETIZE.map((item) => (
                        <NavLink key={item.label} item={item} />
                      ))}
                    </Section>
                  </>
                )}
              </div>

              <div className="shrink-0 space-y-1 border-t border-white/[0.05] px-3 py-3">
                <Link
                  href={active?.path || "/profile"}
                  onClick={close}
                  className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-zinc-300"
                >
                  <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white/10">
                    {identityAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={identityAvatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white">
                        {identityName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={close}
                  className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-zinc-300"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="opacity-80">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" strokeLinecap="round" />
                  </svg>
                  Settings
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
        className="relative z-10 h-9 w-9 shrink-0 overflow-hidden rounded-full bg-omniv-gold/20 ring-1 ring-white/10"
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
          <span className="flex h-full w-full items-center justify-center text-[13px] font-semibold text-omniv-gold">
            {identityName.charAt(0).toUpperCase()}
          </span>
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
      {label ? (
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
          {label}
        </p>
      ) : (
        <div className="pt-1" />
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
