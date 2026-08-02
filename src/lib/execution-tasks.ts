/** Local cache + cloud sync for execution tasks */

export type ExecTask = {
  id: string;
  title: string;
  source: "ziki" | "release" | "opportunity" | "manual" | string;
  done: boolean;
  createdAt: number;
  due?: string;
  cloud?: boolean;
};

const KEY = "omniv_exec_tasks_v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadTasks(): ExecTask[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as ExecTask[];
  } catch {
    return [];
  }
}

function save(tasks: ExecTask[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(tasks.slice(0, 100)));
}

export function addTask(
  title: string,
  source: ExecTask["source"] = "manual",
  due?: string
): ExecTask {
  const t: ExecTask = {
    id: uid(),
    title: title.slice(0, 160),
    source,
    done: false,
    createdAt: Date.now(),
    due,
    cloud: false,
  };
  save([t, ...loadTasks()]);
  // Fire-and-forget cloud sync
  void fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: t.title, source, due_date: due }),
  }).catch(() => undefined);
  return t;
}

export function addTasksFromChecklist(
  items: string[],
  source: ExecTask["source"] = "release"
) {
  const existing = new Set(loadTasks().map((t) => t.title.toLowerCase()));
  const next = [...loadTasks()];
  const fresh: string[] = [];
  for (const title of items) {
    if (existing.has(title.toLowerCase())) continue;
    fresh.push(title);
    next.unshift({
      id: uid(),
      title: title.slice(0, 160),
      source,
      done: false,
      createdAt: Date.now(),
      cloud: false,
    });
  }
  save(next);
  if (fresh.length) {
    void fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: fresh, source }),
    }).catch(() => undefined);
  }
}

export function toggleTask(id: string) {
  const tasks = loadTasks().map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  save(tasks);
  const t = tasks.find((x) => x.id === id);
  if (t && t.cloud !== false) {
    void fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: t.done }),
    }).catch(() => undefined);
  }
}

export function removeTask(id: string) {
  save(loadTasks().filter((t) => t.id !== id));
  void fetch(`/api/tasks?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  }).catch(() => undefined);
}

/** Pull cloud tasks and merge with local */
export async function syncTasksFromCloud(): Promise<ExecTask[]> {
  try {
    const res = await fetch("/api/tasks");
    const data = (await res.json()) as {
      tasks?: {
        id: string;
        title: string;
        source: string;
        done: boolean;
        created_at: string;
        due_date?: string;
      }[];
    };
    const cloud = (data.tasks || []).map((t) => ({
      id: t.id,
      title: t.title,
      source: t.source,
      done: t.done,
      createdAt: new Date(t.created_at).getTime(),
      due: t.due_date,
      cloud: true,
    }));
    if (cloud.length) {
      save(cloud);
      return cloud;
    }
  } catch {
    /* offline */
  }
  return loadTasks();
}
