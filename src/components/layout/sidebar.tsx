"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Brain,
  BarChart3,
  Sparkles,
  Rocket,
  Film,
  MessageSquare,
  Users,
  Building2,
  Settings,
  Bell,
  ChevronRight,
  FileText,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getProfile } from "@/lib/db/profile";

const nav = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { href: "/ziki", label: "Ziki AI", icon: MessageSquare },
  { href: "/artist-brain", label: "Artist Brain", icon: Brain },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/opportunities", label: "Opportunity Feed", icon: Sparkles },
  { href: "/release-simulator", label: "Release Simulator", icon: Rocket },
  { href: "/content", label: "Content Intelligence", icon: Film },
  { href: "/crm", label: "Manager CRM", icon: Users },
  { href: "/label", label: "Label Dashboard", icon: Building2 },
  { href: "/reports", label: "Reports", icon: FileText },
];

const bottom = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/help", label: "Help Centre", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "O";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

function UserChip({ onNavigate }: { onNavigate?: () => void }) {
  const [name, setName] = useState("Artist");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const p = await getProfile();
        if (p?.full_name) setName(p.full_name);
        if (p?.email) setEmail(p.email);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          if (!p?.full_name) {
            setName(
              (user.user_metadata?.full_name as string) ||
                user.email?.split("@")[0] ||
                "Artist"
            );
          }
          if (!p?.email && user.email) setEmail(user.email);
          const metaAvatar =
            (user.user_metadata?.avatar_url as string) ||
            (user.user_metadata?.picture as string) ||
            null;
          if (metaAvatar) setAvatarUrl(metaAvatar);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <Link
      href="/settings"
      onClick={onNavigate}
      className="mx-3 mb-1 mt-2 flex items-center gap-2.5 rounded-[var(--radius)] border border-omniv-border/80 bg-omniv-card/80 px-2.5 py-2 transition-colors hover:border-omniv-gold/30 hover:bg-omniv-gold/5"
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/15 ring-1 ring-omniv-gold/25">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-data text-[11px] font-semibold text-omniv-gold">
            {initials(name)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold tracking-tight text-omniv-text">
          {name}
        </p>
        <p className="truncate font-data text-[10px] text-omniv-text-muted">
          {email || "View profile"}
        </p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-omniv-text-muted" />
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <UserChip onNavigate={onNavigate} />
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        <p className="mb-2 px-2 font-data text-[10px] font-medium uppercase tracking-widest text-omniv-text-muted">
          Core
        </p>
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] transition-all duration-150",
                active
                  ? "bg-omniv-gold/10 text-omniv-gold"
                  : "text-omniv-text-secondary hover:bg-white/[0.03] hover:text-omniv-text"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active
                    ? "text-omniv-gold"
                    : "text-omniv-text-muted group-hover:text-omniv-text-secondary"
                )}
              />
              <span className="truncate">{item.label}</span>
              {active && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-omniv-gold/60" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-0.5 border-t border-omniv-border px-3 py-3">
        {bottom.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] transition-all",
                active
                  ? "bg-omniv-gold/10 text-omniv-gold"
                  : "text-omniv-text-secondary hover:bg-white/[0.03] hover:text-omniv-text"
              )}
            >
              <Icon className="h-4 w-4 text-omniv-text-muted" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-omniv-border bg-omniv-elevated/95 px-4 backdrop-blur-md md:hidden">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-omniv-border text-omniv-text-secondary hover:bg-white/5 hover:text-omniv-text"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Omniv"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-sm font-semibold tracking-tight">Omniv</span>
        </div>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-dvh w-[240px] flex-col border-r border-omniv-border bg-omniv-elevated transition-transform duration-200 ease-out",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="hidden h-14 items-center gap-2.5 border-b border-omniv-border px-4 md:flex">
          <Image
            src="/logo.svg"
            alt="Omniv"
            width={28}
            height={28}
            className="rounded-md"
          />
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-omniv-text">
              Omniv
            </p>
            <p className="font-data text-[9px] uppercase tracking-[0.14em] text-omniv-text-muted">
              Intelligence
            </p>
          </div>
        </div>
        <div className="h-14 md:hidden" />
        <NavLinks onNavigate={() => setOpen(false)} />
      </aside>
    </>
  );
}
