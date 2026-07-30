import type { ChatMessage } from "@/types";

export type ZikiThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const THREADS_KEY = "omniv_ziki_threads_v1";
const ACTIVE_KEY = "omniv_ziki_active_v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadThreads(): ZikiThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ZikiThread[];
  } catch {
    return [];
  }
}

export function saveThreads(threads: ZikiThread[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads.slice(0, 40)));
}

export function getActiveId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, id);
}

export function createThread(title = "New briefing"): ZikiThread {
  const t: ZikiThread = {
    id: uid(),
    title,
    messages: [],
    updatedAt: Date.now(),
  };
  const all = [t, ...loadThreads()];
  saveThreads(all);
  setActiveId(t.id);
  return t;
}

export function upsertThread(thread: ZikiThread) {
  const all = loadThreads().filter((x) => x.id !== thread.id);
  const next = [{ ...thread, updatedAt: Date.now() }, ...all];
  saveThreads(next);
  setActiveId(thread.id);
}

export function deleteThread(id: string) {
  const all = loadThreads().filter((x) => x.id !== id);
  saveThreads(all);
  if (getActiveId() === id) {
    if (all[0]) setActiveId(all[0].id);
    else localStorage.removeItem(ACTIVE_KEY);
  }
}

export function titleFromMessages(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New briefing";
  const t = firstUser.content.trim().slice(0, 48);
  return t.length < firstUser.content.trim().length ? `${t}…` : t;
}

/** Pending action from Opportunity Feed */
const ACT_KEY = "omniv_ziki_act";

export type ActPayload = {
  title: string;
  summary?: string;
  why?: string;
  expectedOutcome?: string;
  category?: string;
};

export function stashAct(payload: ActPayload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACT_KEY, JSON.stringify(payload));
}

export function consumeAct(): ActPayload | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ACT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(ACT_KEY);
  try {
    return JSON.parse(raw) as ActPayload;
  } catch {
    return null;
  }
}
