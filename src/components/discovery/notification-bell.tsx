"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ensureDemoNotifications,
  unreadCount,
} from "@/lib/discovery/notifications";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const items = ensureDemoNotifications();
    setUnread(unreadCount(items));
    const onStorage = () => {
      setUnread(unreadCount(ensureDemoNotifications()));
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("omniv-notifications", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("omniv-notifications", onStorage);
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-white"
      aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path
          d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
      </svg>
      {unread > 0 && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-omniv-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
      )}
    </Link>
  );
}
