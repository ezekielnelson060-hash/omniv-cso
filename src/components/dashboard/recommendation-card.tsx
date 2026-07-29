"use client";

import type { AIRecommendation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Clock, Target, Lightbulb } from "lucide-react";

interface Props {
  recommendation: AIRecommendation;
  index?: number;
  expanded?: boolean;
}

export function RecommendationCard({
  recommendation: r,
  index = 0,
  expanded = true,
}: Props) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card p-5 transition-all duration-300",
        "hover:border-omniv-gold/25 hover:shadow-[0_8px_40px_-12px_rgba(212,175,55,0.12)]",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="absolute left-0 top-0 h-full w-0.5 bg-omniv-gold opacity-70" />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="gold">{r.category}</Badge>
        <Badge
          variant={
            r.impact === "High"
              ? "success"
              : r.impact === "Medium"
                ? "warning"
                : "outline"
          }
        >
          {r.impact} impact
        </Badge>
        <Badge variant="outline">{r.difficulty}</Badge>
        <span className="ml-auto flex items-center gap-1 text-xs text-omniv-text-muted">
          <Target className="h-3 w-3 text-omniv-gold" />
          {r.confidence}% confidence
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold tracking-tight text-omniv-text">
        {r.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-omniv-text-secondary">
        {r.summary}
      </p>

      {expanded && (
        <div className="mt-4 grid gap-3 rounded-[var(--radius)] border border-omniv-border/60 bg-omniv-elevated/50 p-3.5 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
              Why this matters
            </p>
            <p className="mt-1 text-xs leading-relaxed text-omniv-text-secondary">
              {r.why}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
              Expected outcome
            </p>
            <p className="mt-1 text-xs leading-relaxed text-omniv-text-secondary">
              {r.expectedOutcome}
            </p>
          </div>
          {r.supportingData && (
            <div className="sm:col-span-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
                Supporting data
              </p>
              <p className="mt-1 text-xs leading-relaxed text-omniv-text-secondary">
                {r.supportingData}
              </p>
            </div>
          )}
          {r.alternative && (
            <div className="flex gap-2 sm:col-span-2">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-omniv-gold" />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
                  Alternative strategy
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-omniv-text-secondary">
                  {r.alternative}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 text-xs text-omniv-text-muted">
          <span>Priority #{r.priority}</span>
          {r.timeWindow && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-omniv-gold/80" />
              {r.timeWindow}
            </span>
          )}
          {r.detectedAt && <span>Detected {r.detectedAt}</span>}
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-omniv-gold">
          Act on this
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </article>
  );
}
