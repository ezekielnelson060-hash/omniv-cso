"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ArtistBrain } from "@/types";
import { Compass } from "lucide-react";

export function BrainJourney({
  brain,
  dream,
}: {
  brain: ArtistBrain;
  dream: string;
}) {
  const hasDream =
    Boolean(brain.bigDream?.trim() || brain.goals?.[0]) &&
    dream !== "Name the career image you refuse to dilute.";
  const genres = brain.genre?.filter((g) => g !== "TBD") || [];

  return (
    <>
      <p className="mt-3 text-xs leading-relaxed text-omniv-text-muted">
        {brain.bigDream?.trim()
          ? `Held image for ${brain.stageName || brain.name || "this project"} (${brain.careerStage || "emerging"}): we measure every opportunity, score, and Ziki plan against what you wrote. Edit only when the strategy actually changes.`
          : "Write the career picture you refuse to dilute. Until it is specific, Command Center and Opportunities stay soft."}
      </p>

      <Card className="mt-4 p-5">
        <div className="flex items-center gap-2 text-omniv-text">
          <Compass className="h-4 w-4 text-omniv-gold" />
          <h2 className="text-sm font-semibold tracking-tight">
            How Omniv walks you there
          </h2>
        </div>
        <p className="mt-2 text-[11px] text-omniv-text-muted">
          Live path for{" "}
          <span className="font-medium text-omniv-text">
            {brain.stageName || brain.name || "this project"}
          </span>
          {" · "}
          {brain.careerStage || "emerging"}
          {genres.length ? ` · ${genres.join(" / ")}` : ""}
        </p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-omniv-text-secondary">
          <li>
            <span className="font-medium text-omniv-text">This week.</span>{" "}
            {hasDream
              ? `Command Center ranks one move that serves “${dream.slice(0, 72)}${dream.length > 72 ? "…" : ""}”.`
              : "Set the Big Dream first — then we can rank a real priority."}
          </li>
          <li>
            <span className="font-medium text-omniv-text">Style signal.</span>{" "}
            {brain.musicStyle?.trim()
              ? `Posts and Ziki advice lock to “${brain.musicStyle.trim().slice(0, 80)}”.`
              : "Fill Music Style so opportunities stop sounding generic."}
          </li>
          <li>
            <span className="font-medium text-omniv-text">Progress.</span> Mark
            opportunities done when you execute. Ranking and Ziki update — we do
            not keep pushing finished work as #1.
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard">
            <Button size="sm">Open Command Center</Button>
          </Link>
          <Link href="/opportunities">
            <Button size="sm" variant="outline">
              See ranked moves
            </Button>
          </Link>
        </div>
      </Card>
    </>
  );
}
