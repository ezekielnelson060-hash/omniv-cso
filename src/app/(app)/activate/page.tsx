"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ResearchConsole } from "@/components/activate/research-console";

export default function ActivatePage() {
  return (
    <AppShell>
      <div className="py-2">
        <ResearchConsole autoStart />
      </div>
    </AppShell>
  );
}
