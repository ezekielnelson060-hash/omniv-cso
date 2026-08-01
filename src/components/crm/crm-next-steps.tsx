"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  buildScoredSteps,
  type GateMetricsInput,
} from "@/lib/crm-priority";
import { zikiHref } from "@/lib/ziki-prompts";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Link2,
  ListChecks,
  MessageSquare,
  Target,
  Users,
  Zap,
} from "lucide-react";

export type CrmNextStepsProps = GateMetricsInput;

function priorityStyles(p: "P0" | "P1" | "P2") {
  if (p === "P0") return "border-omniv-gold/40 bg-omniv-gold/10 text-omniv-gold";
  if (p === "P1")
    return "border-omniv-border bg-omniv-elevated text-omniv-text-secondary";
  return "border-omniv-border/60 bg-transparent text-omniv-text-muted";
}

export function CrmNextSteps(props: CrmNextStepsProps) {
  const steps = buildScoredSteps(props);

  return (
    <Card className="overflow-hidden border-omniv-gold/20 p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-omniv-border bg-gradient-to-r from-omniv-gold/10 via-transparent to-transparent px-4 py-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-omniv-gold" />
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Next steps</h3>
            <p className="text-[11px] text-omniv-text-muted">
              Ranked by impact from roster, gate, and task state
            </p>
          </div>
        </div>
        <Badge variant="gold" className="gap-1">
          <Zap className="h-3 w-3" />
          Scored
        </Badge>
      </div>

      <ul className="divide-y divide-omniv-border/60">
        {steps.map((s, i) => {
          const zikiLink = s.zikiPrompt ? zikiHref(s.zikiPrompt) : "/ziki";
          const primaryHref = s.href || zikiLink;

          return (
            <li
              key={s.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 font-data text-[10px] font-semibold uppercase tracking-wider",
                      priorityStyles(s.priority)
                    )}
                  >
                    {s.priority}
                  </span>
                  <span className="font-data text-[10px] text-omniv-text-muted">
                    {String(i + 1).padStart(2, "0")} · impact {s.impact}
                  </span>
                </div>
                <p className="text-sm font-medium text-omniv-text">{s.title}</p>
                <p className="text-xs leading-relaxed text-omniv-text-secondary">
                  <span className="font-medium text-omniv-text-muted">Why · </span>
                  {s.why}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-omniv-text-muted">
                  <span>
                    <span className="text-omniv-gold/80">When</span> {s.when}
                  </span>
                  <span>
                    <span className="text-omniv-gold/80">Outcome</span>{" "}
                    {s.outcome}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {s.zikiPrompt && (
                  <Link href={zikiLink}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Ziki
                    </Button>
                  </Link>
                )}
                <Link href={primaryHref}>
                  <Button size="sm" className="gap-1.5">
                    {s.cta || "Act"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-3 border-t border-omniv-border bg-omniv-elevated/30 px-4 py-2.5 text-[10px] text-omniv-text-muted">
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3 text-omniv-gold" />
          {props.rosterCount} roster
        </span>
        <span className="inline-flex items-center gap-1">
          <Link2 className="h-3 w-3 text-omniv-gold" />
          {props.fanCount} owned · +{props.fans7d}/7d
        </span>
        <span className="inline-flex items-center gap-1">
          <ListChecks className="h-3 w-3 text-omniv-gold" />
          {props.openTasks} open tasks
        </span>
      </div>
    </Card>
  );
}
