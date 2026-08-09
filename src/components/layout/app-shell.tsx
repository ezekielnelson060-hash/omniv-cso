"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { AgentLiveSignals } from "@/components/notifications/agent-toast";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  fullBleed,
}: {
  children: ReactNode;
  /** Edge-to-edge main (Ziki full chat) */
  fullBleed?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-omniv-black text-omniv-text">
      <Sidebar />
      <main
        className={cn(
          "md:pl-[240px]",
          fullBleed
            ? "pt-12 md:pt-0"
            : "px-3 pb-12 pt-14 sm:px-4 md:px-6 md:pt-5"
        )}
      >
        {fullBleed ? (
          <div className="h-[calc(100dvh-3rem)] md:h-dvh">{children}</div>
        ) : (
          <div className="mx-auto max-w-6xl">{children}</div>
        )}
      </main>
      <AgentLiveSignals />
    </div>
  );
}
