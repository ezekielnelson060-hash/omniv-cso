"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Sparkles,
  MessageSquare,
  Library,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentPending } from "@/components/notifications/agent-nav-badge";

const tabs = [
  { href: "/crm", label: "Home", icon: Users },
  { href: "/opportunities", label: "Moves", icon: Sparkles },
  { href: "/ziki", label: "Ziki", icon: MessageSquare },
  { href: "/catalogue", label: "Music", icon: Library },
  { href: "/analytics", label: "Progress", icon: BarChart3 },
] as const;

/**
 * Native-app bottom tabs (mobile only).
 * Competitors feel like apps because primary nav is thumb-reachable, not hamburger-only.
 */
export function MobileTabBar() {
  const path = usePathname() || "";
  const pending = useAgentPending();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-omniv-border bg-omniv-elevated/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Primary"
    >
      <div className="flex h-14 items-stretch justify-around px-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            path === href || (href !== "/crm" && path.startsWith(href));
          const showDot = href === "/opportunities" && pending > 0;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition",
                active
                  ? "text-omniv-gold"
                  : "text-omniv-text-muted hover:text-omniv-text-secondary"
              )}
            >
              <span className="relative">
                <Icon
                  className={cn("h-[22px] w-[22px]", active && "stroke-[2.25]")}
                />
                {showDot && (
                  <span className="absolute -right-1 -top-0.5 h-1.5 w-1.5 rounded-full bg-omniv-gold" />
                )}
              </span>
              <span className="truncate">{label}</span>
              {active && (
                <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-omniv-gold/80" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
