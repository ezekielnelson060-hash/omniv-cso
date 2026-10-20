"use client";

import { useEffect } from "react";
import { processDueReminders } from "@/lib/discovery/event-reminders";

/**
 * Mount once in the app shell. Checks event reminders and pushes countdown
 * notifications into the inbox (and browser notifications when allowed).
 */
export function EventReminderWatcher() {
  useEffect(() => {
    processDueReminders();
    const id = window.setInterval(() => {
      processDueReminders();
    }, 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") processDueReminders();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
