"use client";

import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-omniv-black">
      <Sidebar />
      <main className="min-h-dvh pt-14 md:ml-[240px] md:pt-0">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
