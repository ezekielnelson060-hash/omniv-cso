/** Local-first workspace store (persists per browser). Syncs to Supabase when tables exist. */

export type ManagedArtist = {
  id: string;
  name: string;
  genre: string;
  stage: string;
  monthlyListeners: number;
  score: number;
};

export type ManagerTask = {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
  priority: "high" | "medium" | "low";
  artistId?: string;
};

export type ManagerNote = {
  id: string;
  body: string;
  createdAt: string;
  artistId?: string;
};

export type ManagerEvent = {
  id: string;
  title: string;
  eventDate: string;
  done: boolean;
};

export type LabelWorkspace = {
  name: string;
  artists: ManagedArtist[];
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

const K = {
  artists: "omniv_mgr_artists",
  tasks: "omniv_mgr_tasks",
  notes: "omniv_mgr_notes",
  events: "omniv_mgr_events",
  label: "omniv_label_ws",
};

export function loadArtists(): ManagedArtist[] {
  return read(K.artists, []);
}
export function saveArtists(a: ManagedArtist[]) {
  write(K.artists, a);
}
export function addArtist(input: Omit<ManagedArtist, "id" | "score"> & { score?: number }) {
  const list = loadArtists();
  const row: ManagedArtist = {
    id: uid(),
    name: input.name,
    genre: input.genre,
    stage: input.stage,
    monthlyListeners: input.monthlyListeners,
    score: input.score ?? Math.min(95, 35 + Math.round(Math.log10(Math.max(10, input.monthlyListeners)) * 12)),
  };
  const next = [row, ...list];
  saveArtists(next);
  return next;
}

export function loadTasks(): ManagerTask[] {
  return read(K.tasks, []);
}
export function saveTasks(t: ManagerTask[]) {
  write(K.tasks, t);
}
export function addTask(title: string, priority: ManagerTask["priority"] = "medium") {
  const list = loadTasks();
  const next = [{ id: uid(), title, done: false, priority }, ...list];
  saveTasks(next);
  return next;
}
export function toggleTask(id: string) {
  const next = loadTasks().map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  saveTasks(next);
  return next;
}

export function loadNotes(): ManagerNote[] {
  return read(K.notes, []);
}
export function saveNotes(n: ManagerNote[]) {
  write(K.notes, n);
}
export function addNote(body: string) {
  const list = loadNotes();
  const next = [
    { id: uid(), body, createdAt: new Date().toISOString() },
    ...list,
  ];
  saveNotes(next);
  return next;
}

export function loadEvents(): ManagerEvent[] {
  return read(K.events, []);
}
export function saveEvents(e: ManagerEvent[]) {
  write(K.events, e);
}
export function addEvent(title: string, eventDate: string) {
  const list = loadEvents();
  const next = [{ id: uid(), title, eventDate, done: false }, ...list];
  saveEvents(next);
  return next;
}
export function toggleEvent(id: string) {
  const next = loadEvents().map((e) =>
    e.id === id ? { ...e, done: !e.done } : e
  );
  saveEvents(next);
  return next;
}

export function loadLabel(): LabelWorkspace {
  return read(K.label, { name: "", artists: [] });
}
export function saveLabel(ws: LabelWorkspace) {
  write(K.label, ws);
}
