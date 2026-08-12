"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
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
  ChevronDown,
  FileText,
  HelpCircle,
  Menu,
  X,
  Library,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getProfile } from "@/lib/db/profile";
import {
  AgentNavBadge,
  useAgentPending,
} from "@/components/notifications/agent-nav-badge";

type NavItem = { href: string; label: string; icon: typeof Users };

const primary: NavItem[] = [
  { href: "/crm", label: "Command Center", icon: Users },
  { href: "/ziki", label: "Ziki", icon: MessageSquare },
  { href: "/opportunities", label: "Moves", icon: Sparkles },
  { href: "/catalogue", label: "Catalogue", icon: Library },
];

const studio: NavItem[] = [
  { href: "/release-simulator", label: "Release", icon: Rocket },
  { href: "/content", label: "Content", icon: Film },
  { href: "/analytics", label: "Progress", icon: BarChart3 },
];

const more: NavItem[] = [
  { href: "/label", label: "Label", icon: Building2 },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/notifications", label: "Agent", icon: Bell },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const pending = useAgentPending();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await getProfile();
        const label = profile?.full_name || profile?.tip_display_name || null;
        if (!cancelled && label) setName(label);
      } catch {
        /* soft */
      }
      if (!isSupabaseConfigured()) return;
      try {
        const sb = createClient();
        const { data } = await sb.auth.getUser();
        if (!cancelled && data.user?.email) {
          setName((prev) => prev || data.user!.email!.split("@")[0] || null);
        }
      } catch {
        /* soft */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function NavLink({ item }: { item: NavItem }) {
    const active =
      pathname === item.href || pathname.startsWith(item.href + "/");
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition",
          active
            ? "bg-omniv-gold/15 text-omniv-gold"
            : "text-omniv-text-secondary hover:bg-omniv-card hover:text-omniv-text"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.href === "/notifications" && pending > 0 ? (
          <AgentNavBadge count={pending} />
        ) : active ? (
          <ChevronRight className="h-3.5 w-3.5 opacity-60" />
        ) : null}
      </Link>
    );
  }

  const panel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-3 py-4">
        <Image
          src="/logo.svg"
          alt="Omniv"
          width={28}
          height={28}
          className="rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold tracking-tight">
            Omniv
          </p>
          {name && (
            <p className="truncate text-[11px] text-omniv-text-muted">{name}</p>
          )}
        </div>
        <button
          type="button"
          className="rounded-lg p-1.5 text-omniv-text-muted md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {primary.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        <button
          type="button"
          onClick={() => setStudioOpen((v) => !v)}
          className="mt-3 flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-text-muted"
        >
          Studio
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition", studioOpen && "rotate-180")}
          />
        </button>
        {studioOpen &&
          studio.map((item) => <NavLink key={item.href} item={item} />)}

        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className="mt-3 flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-text-muted"
        >
          More
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition", moreOpen && "rotate-180")}
          />
        </button>
        {moreOpen && more.map((item) => <NavLink key={item.href} item={item} />)}
      </nav>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-3 z-40 rounded-full border border-omniv-border bg-omniv-card p-2 shadow-sm md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close overlay"
          />
          <aside className="absolute left-0 top-0 h-full w-[min(18rem,85vw)] border-r border-omniv-border bg-omniv-black shadow-xl">
            {panel}
          </aside>
        </div>
      )}

      <aside className="hidden h-dvh w-56 shrink-0 border-r border-omniv-border bg-omniv-black md:block">
        {panel}
      </aside>
    </>
  );
}
