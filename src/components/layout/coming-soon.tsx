import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  phase?: string;
}

export function ComingSoon({
  title,
  description,
  icon: Icon,
  phase = "Next phase",
}: ComingSoonProps) {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-omniv-gold/20 bg-omniv-gold/10 glow-gold">
          <Icon className="h-6 w-6 text-omniv-gold" />
        </div>
        <Badge variant="gold" className="mb-3">
          {phase}
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-omniv-text-secondary">
          {description}
        </p>
        <p className="mt-6 text-xs text-omniv-text-muted">
          Command Center and Opportunity Feed are live. This module ships in a
          following build phase.
        </p>
      </div>
    </AppShell>
  );
}
