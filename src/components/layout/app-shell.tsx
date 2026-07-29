"use client";

import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-omniv-black">
      <Sidebar />
      <main className="ml-[240px] min-h-dvh">
        <div className="mx-auto max-w-[1400px] px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
