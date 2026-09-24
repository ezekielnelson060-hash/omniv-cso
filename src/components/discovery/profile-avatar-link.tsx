"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readProfile } from "@/lib/discovery/local-profile";

/** Top-right avatar — primary path to personal profile */
export function ProfileAvatarLink({
  className = "",
}: {
  className?: string;
}) {
  const [initial, setInitial] = useState("·");

  useEffect(() => {
    try {
      const p = readProfile();
      setInitial((p.displayName || "E").charAt(0).toUpperCase());
    } catch {
      setInitial("E");
    }
  }, []);

  return (
    <Link
      href="/profile"
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-omniv-gold to-amber-700 text-[12px] font-semibold text-black ring-1 ring-omniv-gold/40 ${className}`}
      aria-label="Your profile"
      title="Your profile"
    >
      {initial}
    </Link>
  );
}
