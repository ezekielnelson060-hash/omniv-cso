"use client";

import { PlanProvider } from "@/components/billing/plan-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PlanProvider>{children}</PlanProvider>;
}
