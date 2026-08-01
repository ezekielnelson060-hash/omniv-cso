"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ChatPanel } from "@/components/ziki/chat-panel";

/** Full-height chat surface — like a dedicated AI workspace */
export default function ZikiPage() {
  return (
    <AppShell fullBleed>
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-sm text-omniv-text-muted">
            Loading Ziki…
          </div>
        }
      >
        <ChatPanel />
      </Suspense>
    </AppShell>
  );
}
