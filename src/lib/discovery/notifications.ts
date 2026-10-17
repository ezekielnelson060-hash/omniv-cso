/** Omniv network notifications — server-backed with local fallback */

export type NotificationKind =
  | "followed_you"
  | "followed_entity"
  | "liked_publication"
  | "saved_publication"
  | "mentioned"
  | "contacted"
  | "discovered"
  | "trending"
  | "published_by_following"
  | "verification"
  | "featured"
  | "opportunity_response"
  | "analytics_milestone";

export type OmnivNotification = {
  id: string;
  kind: NotificationKind | string;
  title: string;
  body?: string;
  href?: string;
  actorName?: string;
  actorType?: string;
  read: boolean;
  createdAt: string;
};

const KEY = "omniv_notifications";
const READ_KEY = "omniv_notifications_seen_at";

export function readNotifications(): OmnivNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OmnivNotification[]) : [];
  } catch {
    return [];
  }
}

export function writeNotifications(items: OmnivNotification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 100)));
}

export function unreadCount(items: OmnivNotification[]): number {
  return items.filter((n) => !n.read).length;
}

export function markAllRead(items: OmnivNotification[]): OmnivNotification[] {
  const next = items.map((n) => ({ ...n, read: true }));
  writeNotifications(next);
  if (typeof window !== "undefined") {
    localStorage.setItem(READ_KEY, new Date().toISOString());
  }
  return next;
}

export function markRead(
  items: OmnivNotification[],
  id: string
): OmnivNotification[] {
  const next = items.map((n) => (n.id === id ? { ...n, read: true } : n));
  writeNotifications(next);
  return next;
}

export async function fetchServerNotifications(): Promise<{
  auth: boolean;
  notifications: OmnivNotification[];
  unread: number;
} | null> {
  try {
    const res = await fetch("/api/discovery/notifications?limit=50");
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.auth) return { auth: false, notifications: [], unread: 0 };
    const notifications = Array.isArray(data.notifications)
      ? (data.notifications as OmnivNotification[])
      : [];
    return {
      auth: true,
      notifications,
      unread: Number(data.unread || unreadCount(notifications)),
    };
  } catch {
    return null;
  }
}

export async function markServerRead(id?: string, all = false): Promise<boolean> {
  try {
    const res = await fetch("/api/discovery/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(all ? { all: true } : { id }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function ensureDemoNotifications(): OmnivNotification[] {
  const existing = readNotifications();
  if (existing.length > 0) return existing;

  const now = Date.now();
  const demo: OmnivNotification[] = [
    {
      id: "n1",
      kind: "published_by_following",
      title: "Nokanda AI published new research",
      body: "African Language Model Landscape 2026",
      href: "/explore?type=research",
      actorName: "Nokanda AI",
      actorType: "company",
      read: false,
      createdAt: new Date(now - 12 * 60_000).toISOString(),
    },
    {
      id: "n2",
      kind: "followed_you",
      title: "Amara followed you",
      actorName: "Amara",
      actorType: "person",
      href: "/followers",
      read: false,
      createdAt: new Date(now - 34 * 60_000).toISOString(),
    },
    {
      id: "n3",
      kind: "saved_publication",
      title: "8 people saved your publication",
      body: "The Future of African Infrastructure",
      href: "/analytics",
      read: false,
      createdAt: new Date(now - 60 * 60_000).toISOString(),
    },
  ];
  writeNotifications(demo);
  return demo;
}

export function filterNotifications(
  items: OmnivNotification[],
  tab: string
): OmnivNotification[] {
  if (tab === "mentions") {
    return items.filter((n) => n.kind === "mentioned");
  }
  if (tab === "followers") {
    return items.filter(
      (n) => n.kind === "followed_you" || n.kind === "followed_entity"
    );
  }
  if (tab === "activity") {
    return items.filter(
      (n) =>
        n.kind === "liked_publication" ||
        n.kind === "saved_publication" ||
        n.kind === "discovered" ||
        n.kind === "trending" ||
        n.kind === "published_by_following" ||
        n.kind === "featured" ||
        n.kind === "analytics_milestone"
    );
  }
  return items;
}

export function groupByDay(items: OmnivNotification[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: OmnivNotification[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const n of items) {
    const d = new Date(n.createdAt);
    if (d >= today) groups[0]!.items.push(n);
    else if (d >= yesterday) groups[1]!.items.push(n);
    else groups[2]!.items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}
