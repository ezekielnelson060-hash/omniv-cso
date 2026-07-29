"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  HelpCircle,
  BookOpen,
  Route,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

const faqs = [
  {
    q: "What is Omniv?",
    a: "Omniv is an AI Chief Strategy Officer for independent artists, managers, and labels. Every screen answers one question: what is the highest-impact move to make next?",
  },
  {
    q: "Who is Ziki?",
    a: "Ziki is the executive AI layer — briefings, recommendations, and chat — grounded in Artist Brain memory, not a generic chatbot.",
  },
  {
    q: "How does billing work?",
    a: "Subscriptions run through Flutterwave (already connected). Plans: Starter, Pro, Label. Manage payment methods from Settings → Billing.",
  },
  {
    q: "What is Artist Brain?",
    a: "Permanent, editable memory of style, voice, audience, goals, strengths and weaknesses. Ziki uses it on every recommendation.",
  },
  {
    q: "Can managers run multiple artists?",
    a: "Yes. Manager CRM and Label Dashboard support roster, tasks, notes, meetings, and portfolio comparison.",
  },
];

const tour = [
  { step: "1", title: "Command Center", body: "Read scores and the top 3 executive moves." },
  { step: "2", title: "Opportunity Feed", body: "Ranked actions with confidence, impact, and why." },
  { step: "3", title: "Artist Brain", body: "Lock brand voice so Ziki stays on-strategy." },
  { step: "4", title: "Release Simulator", body: "Upload unreleased work for a full launch plan." },
  { step: "5", title: "Content Intelligence", body: "Analyse, predict viral, generate studio copy." },
];

export function HelpPanel() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="p-5">
          <BookOpen className="mb-2 h-5 w-5 text-omniv-gold" />
          <h3 className="text-sm font-medium text-omniv-text">Product tour</h3>
          <p className="mt-1 text-xs text-omniv-text-secondary">
            Five steps to understand what Omniv does immediately.
          </p>
        </Card>
        <Card className="p-5">
          <Route className="mb-2 h-5 w-5 text-omniv-gold" />
          <h3 className="text-sm font-medium text-omniv-text">Walkthroughs</h3>
          <p className="mt-1 text-xs text-omniv-text-secondary">
            Guided flows for first release, content audit, and CRM setup.
          </p>
        </Card>
        <Card className="p-5">
          <MessageCircle className="mb-2 h-5 w-5 text-omniv-gold" />
          <h3 className="text-sm font-medium text-omniv-text">Ask Ziki</h3>
          <p className="mt-1 text-xs text-omniv-text-secondary">
            Open Ziki chat for strategy questions — not support tickets.
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-medium text-omniv-text">
          Guided tour
        </h2>
        <ol className="space-y-3">
          {tour.map((t) => (
            <li key={t.step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15 text-xs font-semibold text-omniv-gold">
                {t.step}
              </span>
              <div>
                <p className="text-sm font-medium text-omniv-text">{t.title}</p>
                <p className="text-xs text-omniv-text-muted">{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-omniv-gold" />
          <h2 className="text-sm font-medium text-omniv-text">FAQ</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className="rounded-[var(--radius-lg)] border border-omniv-border bg-omniv-card"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm text-omniv-text">{f.q}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-omniv-text-muted transition-transform",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              {open === i && (
                <p className="border-t border-omniv-border px-4 py-3 text-xs leading-relaxed text-omniv-text-secondary">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="border-omniv-gold/20 bg-omniv-gold/5 p-5">
        <Badge variant="gold">Tooltip tip</Badge>
        <p className="mt-2 text-sm text-omniv-text-secondary">
          Hover score cards and opportunity confidence badges for short
          explainers. Empty states always point to the single next action.
        </p>
      </Card>
    </div>
  );
}
