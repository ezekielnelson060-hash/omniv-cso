"use client";

import { MobileMenuButton } from "@/components/discovery/mobile-menu";

/**
 * Top-right control: on mobile opens drawer (Profile vs Entities).
 * Desktop still has full sidebar.
 */
export function ProfileAvatarLink({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={className}>
      <MobileMenuButton />
    </span>
  );
}
