export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "high" | "medium" | "low";

export interface RosterArtist {
  id: string;
  name: string;
  genre: string;
  stage: string;
  monthlyListeners: number;
  score: number;
  nextRelease?: string;
  momentum: "up" | "flat" | "down";
}

export interface CrmTask {
  id: string;
  title: string;
  artistId: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
}

export interface CrmNote {
  id: string;
  artistId: string;
  body: string;
  createdAt: string;
}

export interface CrmMeeting {
  id: string;
  title: string;
  with: string;
  when: string;
  type: "call" | "in-person" | "video";
}

export interface LabelManager {
  id: string;
  name: string;
  artists: number;
  growth: number;
}

export const mockRoster: RosterArtist[] = [
  {
    id: "a1",
    name: "NOVA HEX",
    genre: "Alt-R&B",
    stage: "Developing",
    monthlyListeners: 184200,
    score: 74,
    nextRelease: "Afterglow · Aug 28",
    momentum: "up",
  },
  {
    id: "a2",
    name: "Kira Vale",
    genre: "Indie Pop",
    stage: "Emerging",
    monthlyListeners: 42200,
    score: 61,
    nextRelease: "TBD",
    momentum: "flat",
  },
  {
    id: "a3",
    name: "Ash Circuit",
    genre: "Electronic",
    stage: "Breakthrough",
    monthlyListeners: 510000,
    score: 82,
    nextRelease: "Night Run EP · Sep 12",
    momentum: "up",
  },
  {
    id: "a4",
    name: "Mira Sol",
    genre: "Folk-R&B",
    stage: "Developing",
    monthlyListeners: 98000,
    score: 68,
    nextRelease: "—",
    momentum: "down",
  },
];

export const mockTasks: CrmTask[] = [
  {
    id: "t1",
    title: "Pitch Afterglow to 3 indie playlists",
    artistId: "a1",
    status: "doing",
    priority: "high",
    due: "2026-08-01",
  },
  {
    id: "t2",
    title: "Lock cover art brief with designer",
    artistId: "a1",
    status: "todo",
    priority: "high",
    due: "2026-08-03",
  },
  {
    id: "t3",
    title: "Review Kira content calendar",
    artistId: "a2",
    status: "todo",
    priority: "medium",
    due: "2026-08-05",
  },
  {
    id: "t4",
    title: "Ash Circuit EP pre-save live",
    artistId: "a3",
    status: "done",
    priority: "high",
    due: "2026-07-20",
  },
  {
    id: "t5",
    title: "Mira: diagnose stream dip",
    artistId: "a4",
    status: "doing",
    priority: "high",
    due: "2026-07-31",
  },
  {
    id: "t6",
    title: "Contract amendment — sync license",
    artistId: "a3",
    status: "todo",
    priority: "medium",
    due: "2026-08-10",
  },
];

export const mockNotes: CrmNote[] = [
  {
    id: "n1",
    artistId: "a1",
    body: "Prefer mid-tempo next. Avoid over-produced TikToks — fans respond to in-room energy.",
    createdAt: "2026-07-28",
  },
  {
    id: "n2",
    artistId: "a4",
    body: "Streams soft after playlist fall-off. Need dormant cohort re-engagement + Shorts cadence.",
    createdAt: "2026-07-27",
  },
  {
    id: "n3",
    artistId: "a3",
    body: "EP sequence locked. Festival soft-pitch shortlist ready for late summer.",
    createdAt: "2026-07-25",
  },
];

export const mockMeetings: CrmMeeting[] = [
  {
    id: "m1",
    title: "Weekly roster sync",
    with: "Internal",
    when: "Thu 10:00",
    type: "video",
  },
  {
    id: "m2",
    title: "NOVA HEX release check-in",
    with: "NOVA HEX",
    when: "Fri 15:30",
    type: "call",
  },
  {
    id: "m3",
    title: "Label A&R review",
    with: "Blackwave A&R",
    when: "Mon 11:00",
    type: "in-person",
  },
];

export const mockManagers: LabelManager[] = [
  { id: "mg1", name: "Jordan Okoye", artists: 4, growth: 12.4 },
  { id: "mg2", name: "Sam Rivera", artists: 3, growth: 8.1 },
  { id: "mg3", name: "Alex Chen", artists: 5, growth: 15.2 },
];

export function formatListeners(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}
