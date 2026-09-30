"use client";

import { FirstAccountNudge } from "@/components/discovery/first-account-nudge";
import { GetVerifiedCard } from "@/components/discovery/verified-badge";

/** Profile growth strip: first-account nudge + Get Verified. */
export function ProfileGrowthStrip() {
  return (
    <>
      <FirstAccountNudge />
      <div className="mt-5">
        <GetVerifiedCard compact />
      </div>
    </>
  );
}
