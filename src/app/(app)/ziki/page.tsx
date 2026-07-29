"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ChatPanel } from "@/components/ziki/chat-panel";

export default function ZikiPage() {
  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Ziki</h1>
        <p className="text-sm text-omniv-text-secondary">
          AI Chief Strategy Officer · Grounded in Artist Brain and live scores
        </p>
      </div>
      <ChatPanel />
    </AppShell>
  );
}
