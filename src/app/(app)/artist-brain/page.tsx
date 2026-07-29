"use client";

import { AppShell } from "@/components/layout/app-shell";
import { BrainView } from "@/components/artist-brain/brain-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function ArtistBrainPage() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Artist Brain</h1>
          <p className="text-sm text-omniv-text-secondary">
            Permanent memory that personalises every recommendation and Ziki
            reply
          </p>
        </div>
        <Link href="/ziki">
          <Button variant="outline" size="sm" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-omniv-gold" />
            Ask Ziki about this profile
          </Button>
        </Link>
      </div>
      <BrainView />
    </AppShell>
  );
}
