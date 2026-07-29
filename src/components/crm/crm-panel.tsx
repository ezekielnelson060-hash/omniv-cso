"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  formatListeners,
  mockMeetings,
  mockNotes,
  mockRoster,
  mockTasks,
} from "@/data/crm";
import { cn, scoreColor } from "@/lib/utils";
import { Users, CheckSquare, StickyNote, Calendar } from "lucide-react";

export function CrmPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">Roster</p>
          <p className="mt-1 text-2xl font-semibold">{mockRoster.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">Open tasks</p>
          <p className="mt-1 text-2xl font-semibold">
            {mockTasks.filter((t) => t.status !== "done").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">Notes</p>
          <p className="mt-1 text-2xl font-semibold">{mockNotes.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">Meetings</p>
          <p className="mt-1 text-2xl font-semibold">{mockMeetings.length}</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Roster</h3>
        </div>
        <div className="space-y-2">
          {mockRoster.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated/50 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-omniv-text">{a.name}</p>
                <p className="text-[11px] text-omniv-text-muted">
                  {a.genre} · {a.stage} · {formatListeners(a.monthlyListeners)}
                </p>
              </div>
              <span className={cn("text-sm font-semibold", scoreColor(a.score))}>
                {a.score}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-omniv-gold" />
            <h3 className="text-sm font-medium">Tasks</h3>
          </div>
          <ul className="space-y-2">
            {mockTasks.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <span className="text-omniv-text-secondary">{t.title}</span>
                <Badge variant={t.priority === "high" ? "gold" : "outline"}>
                  {t.status}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-omniv-gold" />
            <h3 className="text-sm font-medium">Notes</h3>
          </div>
          <ul className="space-y-3">
            {mockNotes.map((n) => (
              <li key={n.id} className="text-xs leading-relaxed text-omniv-text-secondary">
                {n.body}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-2 border-t border-omniv-border pt-3 text-xs text-omniv-text-muted">
            <Calendar className="h-3.5 w-3.5" />
            {mockMeetings.length} meetings this week
          </div>
        </Card>
      </div>
    </div>
  );
}
