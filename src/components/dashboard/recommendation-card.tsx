"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIRecommendation } from "@/types";
import {
  ArrowRight,
  ChevronDown,
  Clock,
  Target,
  Layers,
  Link2,
  Compass,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { stashAct } from "@/lib/ziki-memory";

export function RecommendationCard({
  recommendation: r,
  index = 0,
  defaultOpen,
}: {
  recommendation: AIRecommendation;
  index?: number;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen ?? index === 0);

  function actOnThis() {
    stashAct({
      title: r.title,
      summary: r.summary,
      why: r.why,
      expectedOutcome: r.expectedOutcome,
      category: String(r.category),
    });
    router.push("/ziki");
  }

  const impactTone =
    r.impact === "High"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
      : r.impact === "Medium"
        ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
        : "bg-white/5 text-omniv-text-muted border-omniv-border";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card transition",
        open && "border-omniv-gold/30 shadow-[0_0_0_1px_rgba(212,175,55,0.08)]"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left md:p-5"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-omniv-gold/25 bg-omniv-gold/10 font-data text-xs font-semibold text-omniv-gold">
          {r.priority}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {r.category}
            </Badge>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                impactTone
              )}
            >
              {r.impact} impact
            </span>
            <span className="rounded-full border border-omniv-border px-2 py-0.5 text-[10px] text-omniv-text-muted">
              {r.difficulty}
            </span>
            <span className="ml-auto text-[11px] tabular-nums text-omniv-gold/90">
              {r.confidence}% confidence
            </span>
          </div>
          <h3 className="text-base font-semibold tracking-tight text-omniv-text">
            {r.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-omniv-text-secondary">
            {r.summary}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-omniv-text-muted">
            {r.timeWindow && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 text-omniv-gold/70" />
                {r.timeWindow}
              </span>
            )}
            {r.platforms && r.platforms.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3 w-3 text-omniv-gold/70" />
                {r.platforms.join(" · ")}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-omniv-text-muted transition",
            open && "rotate-180 text-omniv-gold"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-omniv-border/80 px-4 pb-4 pt-3 md:px-5 md:pb-5">
            <ContextRow icon={Target} label="Why this matters" body={r.why} />
            <ContextRow
              icon={Compass}
              label="Strategic frame"
              body={
                r.strategicFrame ||
                r.supportingData ||
                "Execute with focus; measure one outcome."
              }
            />
            {r.positioning && (
              <ContextRow icon={Compass} label="Positioning" body={r.positioning} />
            )}
            {r.timing && (
              <ContextRow icon={Clock} label="Timing" body={r.timing} />
            )}
            {r.platforms && r.platforms.length > 0 && (
              <ContextRow
                icon={Layers}
                label="Platforms"
                body={r.platforms.join(" · ")}
              />
            )}
            {r.connections && (
              <ContextRow icon={Link2} label="Connections" body={r.connections} />
            )}
            <ContextRow
              icon={Target}
              label="Expected outcome"
              body={r.expectedOutcome}
            />
            {r.nextActions && r.nextActions.length > 0 && (
              <div className="rounded-xl border border-omniv-border/60 bg-omniv-elevated/50 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-omniv-text-muted">
                  <ListChecks className="h-3 w-3 text-omniv-gold" />
                  Next actions
                </div>
                <ol className="space-y-1.5 text-sm text-omniv-text-secondary">
                  {r.nextActions.map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-data text-omniv-gold">{i + 1}.</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {r.alternative && (
              <ContextRow icon={Compass} label="Alternative" body={r.alternative} />
            )}
            {r.supportingData && (
              <p className="text-[11px] leading-relaxed text-omniv-text-muted">
                {r.supportingData}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="text-[11px] text-omniv-text-muted">
                Priority #{r.priority}
                {r.detectedAt ? ` · ${r.detectedAt}` : ""}
              </p>
              <Button
                size="sm"
                className="gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  actOnThis();
                }}
              >
                Execute in Ziki
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ContextRow({
  icon: Icon,
  label,
  body,
}: {
  icon: LucideIcon;
  label: string;
  body: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-omniv-gold/80" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-omniv-text-secondary">
          {body}
        </p>
      </div>
    </div>
  );
}
