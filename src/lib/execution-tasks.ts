/** Close-the-loop tasks from Ziki / Act on this / Release Simulator */

export type ExecTask = {
  id: string;
  title: string;
  source: "ziki" | "release" | "opportunity" | "manual";
  done: boolean;
  createdAt: number;
  due?: string;
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
  };
  save([t, ...loadTasks()]);
  return t;
}

export function addTasksFromChecklist(
  items: string[],
  source: ExecTask["source"] = "release"
) {
  const existing = new Set(loadTasks().map((t) => t.title.toLowerCase()));
  const next = [...loadTasks()];
  for (const title of items) {
    if (existing.has(title.toLowerCase())) continue;
    next.unshift({
      id: uid(),
      title: title.slice(0, 160),
      source,
      done: false,
      createdAt: Date.now(),
    });
  }
  save(next);
}

export function toggleTask(id: string) {
  save(
    loadTasks().map((t) => (t.id === id ? { ...t, done: !t.done } : t))
  );
}

export function removeTask(id: string) {
  save(loadTasks().filter((t) => t.id !== id));
}
