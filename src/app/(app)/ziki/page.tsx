"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ChatPanel } from "@/components/ziki/chat-panel";

/** Full-height chat surface — like a dedicated AI workspace */
export default function ZikiPage() {
  return (
    <AppShell fullBleed>
      <ChatPanel />
    </AppShell>
  );
}
