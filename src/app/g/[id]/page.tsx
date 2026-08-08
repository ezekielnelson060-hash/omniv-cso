"use client";

import { Suspense } from "react";
import { LiveRoom } from "@/components/rooms/live-room";

export default function GatheringPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-omniv-black text-sm text-omniv-text-muted">
          Loading…
        </div>
      }
    >
      <LiveRoom />
    </Suspense>
  );
}
