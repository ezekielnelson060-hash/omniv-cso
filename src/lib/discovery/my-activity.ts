/** Activity = what I have been doing (not what happened to me) */

export type ActivityKind =
  | "published"
  | "saved"
  | "followed"
  | "unfollowed"
  | "liked"
  | "contacted"
  | "commented";

export type MyActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle?: string;
  href?: string;
  createdAt: string;
};

const KEY = "omniv_my_activity";

export function readMyActivity(): MyActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MyActivityItem[]) : [];
  } catch {
    return [];
  }
}

export function pushMyActivity(
  item: Omit<MyActivityItem, "id" | "createdAt"> & { id?: string }
) {
  const next: MyActivityItem = {
    id: item.id || `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    kind: item.kind,
    title: item.title,
    subtitle: item.subtitle,
    href: item.href,
    createdAt: new Date().toISOString(),
  };
  const list = [next, ...readMyActivity()].slice(0, 80);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("omniv-my-activity", { detail: next }));
  return next;
}

export function ensureDemoActivity(): MyActivityItem[] {
  const existing = readMyActivity();
  if (existing.length > 0) return existing;
  const now = Date.now();
  const demo: MyActivityItem[] = [
    {
      id: "demo1",
      kind: "published",
      title: "Published an article",
      subtitle: "Why China's AI infrastructure matters",
      href: "/explore?type=article",
      createdAt: new Date(now - 2 * 60 * 60_000).toISOString(),
    },
    {
      id: "demo2",
      kind: "saved",
      title: "Saved a publication",
      subtitle: "The Future of African Energy",
      href: "/saved",
      createdAt: new Date(now - 5 * 60 * 60_000).toISOString(),
    },
    {
      id: "demo3",
      kind: "followed",
      title: "Followed Nokanda AI",
      subtitle: "Company",
      href: "/following",
      createdAt: new Date(now - 26 * 60 * 60_000).toISOString(),
    },
  ];
  localStorage.setItem(KEY, JSON.stringify(demo));
  return demo;
}

export function groupActivityByDay(items: MyActivityItem[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: MyActivityItem[] }[] = [
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

export function kindLabel(kind: ActivityKind): string {
  switch (kind) {
    case "published":
      return "Published";
    case "saved":
      return "Saved";
    case "followed":
      return "Followed";
    case "unfollowed":
      return "Unfollowed";
    case "liked":
      return "Liked";
    case "contacted":
      return "Contacted";
    case "commented":
      return "Commented";
    default:
      return "Activity";
  }
}
