"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loadTasks,
  addTask,
  toggleTask,
  removeTask,
  type ExecTask,
} from "@/lib/execution-tasks";
import { Check, Plus, Trash2, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExecutionTasks() {
  const [tasks, setTasks] = useState<ExecTask[]>([]);
  const [title, setTitle] = useState("");

  function refresh() {
    setTasks(loadTasks());
  }

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <ListTodo className="h-4 w-4 text-omniv-gold" />
        <h3 className="text-sm font-medium">Execution tasks</h3>
      </div>
      <p className="mb-3 text-[11px] text-omniv-text-muted">
        Close the loop from simulator checklists and Ziki plans.
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="Add a task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && title.trim()) {
              addTask(title.trim(), "manual");
              setTitle("");
              refresh();
            }
          }}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (!title.trim()) return;
            addTask(title.trim(), "manual");
            setTitle("");
            refresh();
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="mt-3 max-h-[420px] space-y-1.5 overflow-y-auto">
        {tasks.length === 0 && (
          <li className="py-6 text-center text-xs text-omniv-text-muted">
            No tasks yet — run a simulation and save the checklist.
          </li>
        )}
        {tasks.map((t) => (
          <li
            key={t.id}
            className="flex items-start gap-2 rounded-lg border border-omniv-border/80 px-2 py-2"
          >
            <button
              type="button"
              onClick={() => {
                toggleTask(t.id);
                refresh();
              }}
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                t.done
                  ? "border-omniv-gold bg-omniv-gold text-black"
                  : "border-omniv-border"
              )}
            >
              {t.done && <Check className="h-3 w-3" />}
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-xs leading-snug",
                  t.done
                    ? "text-omniv-text-muted line-through"
                    : "text-omniv-text-secondary"
                )}
              >
                {t.title}
              </p>
              <p className="mt-0.5 font-data text-[9px] uppercase tracking-wider text-omniv-text-muted">
                {t.source}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                removeTask(t.id);
                refresh();
              }}
              className="text-omniv-text-muted hover:text-omniv-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
