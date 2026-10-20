/**
 * Event reminders for explorers — local-first with optional server notifications.
 * Fires countdown alerts at 7d / 1d / 1h / start into the notification inbox.
 */

import {
  readNotifications,
  writeNotifications,
  type OmnivNotification,
} from "@/lib/discovery/notifications";

const KEY = "omniv_event_reminders";

export type EventReminder = {
  id: string;
  publicationSlug: string;
  publicationTitle: string;
  publicationPath?: string;
  eventAt: string; // ISO
  /** offsets in minutes before event: 0 = at start */
  offsetsMinutes: number[];
  /** which offsets already notified */
  fired: number[];
  createdAt: string;
};

export const REMINDER_PRESETS: {
  id: string;
  label: string;
  minutes: number;
}[] = [
  { id: "start", label: "When it starts", minutes: 0 },
  { id: "1h", label: "1 hour before", minutes: 60 },
  { id: "1d", label: "1 day before", minutes: 24 * 60 },
  { id: "1w", label: "1 week before", minutes: 7 * 24 * 60 },
];

export function extractEventAt(
  meta: Record<string, string> | string | null | undefined,
  publishedAt?: string | null
): string | null {
  let fields: Record<string, string> = {};
  if (typeof meta === "string") {
    try {
      const o = JSON.parse(meta);
      if (o && typeof o === "object") {
        for (const [k, v] of Object.entries(o)) {
          if (v != null && String(v).trim()) fields[k] = String(v).trim();
        }
      }
    } catch {
      /* ignore */
    }
  } else if (meta && typeof meta === "object") {
    fields = meta;
  }

  const keys = [
    "startsAt",
    "startAt",
    "starts_at",
    "startDate",
    "start_date",
    "eventDate",
    "event_date",
    "eventAt",
    "date",
    "when",
    "datetime",
  ];
  for (const k of keys) {
    if (fields[k]) {
      const t = Date.parse(fields[k]);
      if (!Number.isNaN(t)) return new Date(t).toISOString();
    }
  }
  // Combined date + time
  if (fields.date && fields.time) {
    const t = Date.parse(`${fields.date}T${fields.time}`);
    if (!Number.isNaN(t)) return new Date(t).toISOString();
  }
  if (publishedAt) {
    const t = Date.parse(publishedAt);
    // only use publishedAt if it looks like a future event (avoid past articles)
    if (!Number.isNaN(t) && t > Date.now() - 60_000) {
      return new Date(t).toISOString();
    }
  }
  return null;
}

export function formatCountdown(eventAtIso: string, now = Date.now()): string {
  const end = Date.parse(eventAtIso);
  if (Number.isNaN(end)) return "";
  const diff = end - now;
  if (diff <= 0) return "Live / started";
  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "< 1m";
}

export function formatEventWhen(eventAtIso: string): string {
  try {
    return new Date(eventAtIso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return eventAtIso;
  }
}

function readAll(): EventReminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EventReminder[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: EventReminder[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)));
}

export function listReminders(): EventReminder[] {
  return readAll().sort(
    (a, b) => Date.parse(a.eventAt) - Date.parse(b.eventAt)
  );
}

export function getReminderForSlug(slug: string): EventReminder | null {
  return readAll().find((r) => r.publicationSlug === slug) || null;
}

export function setReminder(input: {
  publicationSlug: string;
  publicationTitle: string;
  publicationPath?: string;
  eventAt: string;
  offsetsMinutes?: number[];
}): EventReminder {
  const offsets =
    input.offsetsMinutes && input.offsetsMinutes.length
      ? [...new Set(input.offsetsMinutes)].sort((a, b) => b - a)
      : [7 * 24 * 60, 24 * 60, 60, 0];

  const all = readAll().filter((r) => r.publicationSlug !== input.publicationSlug);
  const reminder: EventReminder = {
    id: `rem_${input.publicationSlug}_${Date.now()}`,
    publicationSlug: input.publicationSlug,
    publicationTitle: input.publicationTitle,
    publicationPath: input.publicationPath,
    eventAt: input.eventAt,
    offsetsMinutes: offsets,
    fired: [],
    createdAt: new Date().toISOString(),
  };
  all.unshift(reminder);
  writeAll(all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("omniv-reminders"));
  }
  return reminder;
}

export function clearReminder(slug: string) {
  writeAll(readAll().filter((r) => r.publicationSlug !== slug));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("omniv-reminders"));
  }
}

function pushLocalNotification(n: Omit<OmnivNotification, "read">) {
  const items = readNotifications();
  if (items.some((x) => x.id === n.id)) return;
  writeNotifications([{ ...n, read: false }, ...items]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("omniv-notifications"));
  }
}

async function pushServerNotification(n: {
  kind: string;
  title: string;
  body?: string;
  href?: string;
}) {
  try {
    await fetch("/api/discovery/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n),
      keepalive: true,
    });
  } catch {
    /* guest / offline */
  }
}

function labelForOffset(minutes: number): string {
  if (minutes <= 0) return "starts now";
  if (minutes < 60) return `in ${minutes} minutes`;
  if (minutes < 24 * 60) {
    const h = Math.round(minutes / 60);
    return `in ${h} hour${h === 1 ? "" : "s"}`;
  }
  const d = Math.round(minutes / (24 * 60));
  return `in ${d} day${d === 1 ? "" : "s"}`;
}

/**
 * Check all reminders and fire due countdown notifications.
 * Call on app load and on an interval.
 */
export function processDueReminders(now = Date.now()): number {
  const all = readAll();
  let firedCount = 0;
  const next: EventReminder[] = [];

  for (const r of all) {
    const eventMs = Date.parse(r.eventAt);
    if (Number.isNaN(eventMs)) {
      next.push(r);
      continue;
    }
    // Drop reminders more than 2 days after the event
    if (now - eventMs > 2 * 86_400_000) continue;

    const fired = new Set(r.fired);
    for (const offset of r.offsetsMinutes) {
      if (fired.has(offset)) continue;
      const fireAt = eventMs - offset * 60_000;
      // Fire within a 15-minute window after due (or up to 2 min early)
      if (now >= fireAt - 2 * 60_000 && now <= fireAt + 15 * 60_000) {
        const countdown = formatCountdown(r.eventAt, now);
        const id = `event_rem_${r.publicationSlug}_${offset}`;
        const title =
          offset <= 0
            ? `${r.publicationTitle} is starting`
            : `${r.publicationTitle} — ${labelForOffset(offset)}`;
        const body =
          offset <= 0
            ? "Your reminder — the event is live."
            : `Countdown: ${countdown} · ${formatEventWhen(r.eventAt)}`;
        const href = r.publicationPath || `/p/${r.publicationSlug}`;

        pushLocalNotification({
          id,
          kind: "event_reminder",
          title,
          body,
          href,
          actorName: "Reminder",
          actorType: "event",
          createdAt: new Date().toISOString(),
        });
        void pushServerNotification({
          kind: "event_reminder",
          title,
          body,
          href,
        });

        // Browser notification if permitted
        try {
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification(title, { body, tag: id });
          }
        } catch {
          /* ignore */
        }

        fired.add(offset);
        firedCount += 1;
      }
    }
    next.push({ ...r, fired: Array.from(fired) });
  }

  writeAll(next);
  if (firedCount > 0 && typeof window !== "undefined") {
    window.dispatchEvent(new Event("omniv-notifications"));
    window.dispatchEvent(new Event("omniv-reminders"));
  }
  return firedCount;
}
