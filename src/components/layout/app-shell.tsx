"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
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
            ? "pt-14 md:pt-0"
            : "px-4 pb-16 pt-[4.5rem] sm:px-6 md:px-8 md:pt-8"
        )}
      >
        {fullBleed ? (
          <div className="h-[calc(100dvh-3.5rem)] md:h-dvh">{children}</div>
        ) : (
          <div className="mx-auto max-w-6xl">{children}</div>
        )}
      </main>
    </div>
  );
}
