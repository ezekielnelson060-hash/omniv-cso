"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export type CrmNextStep = {
  id: string;
  priority: "P0" | "P1" | "P2";
  title: string;
  why: string;
  when: string;
  outcome: string;
  href?: string;
  zikiPrompt?: string;
  cta?: string;
};

type Props = {
  rosterCount: number;
  fanCount: number;
  openTasks: number;
  openEvents: number;
  gateSlug?: string | null;
  primaryArtistName?: string | null;
};

function buildSteps(p: Props): CrmNextStep[] {
  const steps: CrmNextStep[] = [];
  const name = p.primaryArtistName || "this artist";

  if (p.rosterCount === 0) {
    steps.push({
      id: "seed-roster",
      priority: "P0",
      title: "Seed your first roster artist",
      why: "Fan capture and CRM isolation require a roster_artists row. Without it, gate links cannot save contacts.",
      when: "Today",
      outcome: "Public gate URL + owned list ready for bio traffic",
      href: "#strategy-roster",
      cta: "Add artist below",
    });
  }

  if (p.fanCount === 0 && p.rosterCount > 0) {
    steps.push({
      id: "share-gate",
      priority: "P0",
      title: `Share the fan gate for ${name}`,
      why: "Owned contacts beat rented reach. One bio link starts the list managers actually monetize.",
      when: "This week",
      outcome: "First 25–50 emails with consent + source tags",
      href: p.gateSlug ? `/f/${p.gateSlug}` : undefined,
      zikiPrompt: `Help me write a 3-line Instagram bio CTA that drives fans to my Omniv gate for ${name}. Include why they should unlock and what they get.`,
      cta: p.gateSlug ? "Open gate" : "Set slug",
    });
  }

  if (p.fanCount > 0 && p.fanCount < 100) {
    steps.push({
      id: "grow-list",
      priority: "P1",
      title: "Push list past 100 owned fans",
      why: "Below ~100 contacts, campaign tests are noisy. Volume unlocks city clusters and superfan tiers.",
      when: "Next 14 days",
      outcome: "Segmentable list for tour / drop tests",
      zikiPrompt: `I have ${p.fanCount} owned fans for ${name}. Give a 7-day plan to grow the owned list using bio, stories, and one lead magnet — exact actions.`,
      cta: "Plan with Ziki",
    });
  }

  if (p.fanCount >= 100) {
    steps.push({
      id: "segment-act",
      priority: "P1",
      title: "Segment Superfans vs Casual",
      why: "High-intent fans deserve different offers. One broadcast to everyone burns trust.",
      when: "This week",
      outcome: "Tiered message for next drop or city show",
      zikiPrompt: `With ${p.fanCount} owned fans for ${name}, draft a superfan-only offer and a casual re-engagement message. Keep both short.`,
      cta: "Brief Ziki",
    });
  }

  if (p.openTasks === 0) {
    steps.push({
      id: "task-system",
      priority: "P1",
      title: "Log this week’s three roster tasks",
      why: "Managers lose momentum when priorities stay in chat. Tasks create a single source of truth.",
      when: "Today",
      outcome: "Visible weekly execution board",
      href: "#crm-tasks",
      cta: "Add tasks",
    });
  } else if (p.openTasks > 5) {
    steps.push({
      id: "task-trim",
      priority: "P1",
      title: `Cut open tasks from ${p.openTasks} to top 3`,
      why: "Too many open items hides the highest-impact move. Force prioritization.",
      when: "Today",
      outcome: "Clear P0/P1 board",
      zikiPrompt: `I have ${p.openTasks} open manager tasks for ${name}. Help me pick the top 3 by impact this week and what to defer.`,
      cta: "Prioritize with Ziki",
    });
  }

  if (p.openEvents === 0) {
    steps.push({
      id: "calendar",
      priority: "P2",
      title: "Put release or content dates on the calendar",
      why: "Without dates, strategy stays abstract. Calendar forces when.",
      when: "This week",
      outcome: "Shared timeline for artist + manager",
      href: "#crm-calendar",
      cta: "Add event",
    });
  }

  steps.push({
    id: "ziki-roster",
    priority: "P2",
    title: "Weekly Ziki roster review",
    why: "One briefing keeps multi-artist managers aligned on the single highest-impact move.",
    when: "Every Monday",
    outcome: "Executive clarity without another meeting",
    zikiPrompt: `Review my CRM state: ${p.rosterCount} roster artists, ${p.fanCount} owned fans, ${p.openTasks} open tasks, ${p.openEvents} open calendar items. What is the highest-impact manager move this week for ${name}?`,
    cta: "Ask Ziki",
  });

  const order = { P0: 0, P1: 1, P2: 2 };
  return steps.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 4);
}

function priorityStyles(p: CrmNextStep["priority"]) {
  if (p === "P0") return "border-omniv-gold/40 bg-omniv-gold/10 text-omniv-gold";
  if (p === "P1") return "border-omniv-border bg-omniv-elevated text-omniv-text-secondary";
  return "border-omniv-border/60 bg-transparent text-omniv-text-muted";
}

export function CrmNextSteps(props: Props) {
  const steps = buildSteps(props);

  return (
    <Card className="overflow-hidden border-omniv-gold/20 p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-omniv-border bg-gradient-to-r from-omniv-gold/10 via-transparent to-transparent px-4 py-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-omniv-gold" />
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Next steps</h3>
            <p className="text-[11px] text-omniv-text-muted">
              Highest-impact manager moves from current CRM state
            </p>
          </div>
        </div>
        <Badge variant="gold" className="gap-1">
          <Zap className="h-3 w-3" />
          Live
        </Badge>
      </div>

      <ul className="divide-y divide-omniv-border/60">
        {steps.map((s, i) => {
          const zikiHref = s.zikiPrompt
            ? `/ziki?q=${encodeURIComponent(s.zikiPrompt)}`
            : "/ziki";
          const primaryHref = s.href || zikiHref;

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
                    {String(i + 1).padStart(2, "0")}
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
                  <Link href={zikiHref}>
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
          {props.fanCount} owned fans
        </span>
        <span className="inline-flex items-center gap-1">
          <ListChecks className="h-3 w-3 text-omniv-gold" />
          {props.openTasks} open tasks
        </span>
      </div>
    </Card>
  );
}
