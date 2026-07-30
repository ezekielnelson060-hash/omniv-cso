"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  addArtist,
  addEvent,
  addNote,
  addTask,
  loadArtists,
  loadEvents,
  loadNotes,
  loadTasks,
  toggleEvent,
  toggleTask,
  type ManagedArtist,
  type ManagerEvent,
  type ManagerNote,
  type ManagerTask,
} from "@/lib/workspace-store";
import { cn, scoreColor } from "@/lib/utils";
import {
  Users,
  CheckSquare,
  StickyNote,
  Calendar,
  MessageSquare,
  Plus,
} from "lucide-react";

export function CrmPanel() {
  const [artists, setArtists] = useState<ManagedArtist[]>([]);
  const [tasks, setTasks] = useState<ManagerTask[]>([]);
  const [notes, setNotes] = useState<ManagerNote[]>([]);
  const [events, setEvents] = useState<ManagerEvent[]>([]);

  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [listeners, setListeners] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");

  useEffect(() => {
    setArtists(loadArtists());
    setTasks(loadTasks());
    setNotes(loadNotes());
    setEvents(loadEvents());
  }, []);

  function onAddArtist() {
    if (!name.trim()) return;
    const next = addArtist({
      name: name.trim(),
      genre: genre.trim() || "TBD",
      stage: "emerging",
      monthlyListeners: Number(listeners) || 0,
    });
    setArtists(next);
    setName("");
    setGenre("");
    setListeners("");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-omniv-text-secondary">
          Your roster — add artists, tasks, notes, and calendar. Data is personal
          to this account.
        </p>
        <Link href="/ziki">
          <Button size="sm" variant="outline" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Ask Ziki about roster
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Roster
          </p>
          <p className="mt-1 font-data text-2xl font-semibold">{artists.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Open tasks
          </p>
          <p className="mt-1 font-data text-2xl font-semibold">
            {tasks.filter((t) => !t.done).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Notes
          </p>
          <p className="mt-1 font-data text-2xl font-semibold">{notes.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-omniv-text-muted">
            Calendar
          </p>
          <p className="mt-1 font-data text-2xl font-semibold">
            {events.filter((e) => !e.done).length}
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Add artist</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          <Input
            placeholder="Artist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
          <Input
            placeholder="Monthly listeners"
            type="number"
            value={listeners}
            onChange={(e) => setListeners(e.target.value)}
          />
          <Button onClick={onAddArtist} className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {artists.length === 0 && (
            <p className="text-xs text-omniv-text-muted">
              No artists yet — add your first roster member.
            </p>
          )}
          {artists.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated/50 px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium">{a.name}</p>
                <p className="text-[11px] text-omniv-text-muted">
                  {a.genre} · {a.stage} · {a.monthlyListeners.toLocaleString()} listeners
                </p>
              </div>
              <span className={cn("font-data text-sm font-semibold", scoreColor(a.score))}>
                {a.score}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-omniv-gold" />
            <h3 className="text-sm font-medium">Tasks</h3>
          </div>
          <div className="mb-3 flex gap-2">
            <Input
              placeholder="New task"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <Button
              size="sm"
              onClick={() => {
                if (!taskTitle.trim()) return;
                setTasks(addTask(taskTitle.trim(), "high"));
                setTaskTitle("");
              }}
            >
              Add
            </Button>
          </div>
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setTasks(toggleTask(t.id))}
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    t.done
                      ? "border-omniv-gold bg-omniv-gold text-black"
                      : "border-omniv-border"
                  )}
                >
                  {t.done ? "✓" : ""}
                </button>
                <span
                  className={cn(
                    "flex-1",
                    t.done
                      ? "text-omniv-text-muted line-through"
                      : "text-omniv-text-secondary"
                  )}
                >
                  {t.title}
                </span>
                <Badge variant={t.priority === "high" ? "gold" : "outline"}>
                  {t.priority}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-omniv-gold" />
            <h3 className="text-sm font-medium">Notes</h3>
          </div>
          <textarea
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            rows={2}
            placeholder="Strategy note…"
            className="mb-2 w-full rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
          />
          <Button
            size="sm"
            className="mb-3"
            onClick={() => {
              if (!noteBody.trim()) return;
              setNotes(addNote(noteBody.trim()));
              setNoteBody("");
            }}
          >
            Save note
          </Button>
          <ul className="space-y-3">
            {notes.map((n) => (
              <li
                key={n.id}
                className="text-xs leading-relaxed text-omniv-text-secondary"
              >
                {n.body}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Calendar</h3>
        </div>
        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Event title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
          <Input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() => {
              if (!eventTitle.trim() || !eventDate) return;
              setEvents(addEvent(eventTitle.trim(), eventDate));
              setEventTitle("");
              setEventDate("");
            }}
          >
            Add
          </Button>
        </div>
        <ul className="space-y-2">
          {events
            .slice()
            .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
            .map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setEvents(toggleEvent(e.id))}
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    e.done
                      ? "border-omniv-gold bg-omniv-gold text-black"
                      : "border-omniv-border"
                  )}
                >
                  {e.done ? "✓" : ""}
                </button>
                <span
                  className={cn(
                    "flex-1",
                    e.done
                      ? "text-omniv-text-muted line-through"
                      : "text-omniv-text-secondary"
                  )}
                >
                  {e.title}
                </span>
                <span className="font-data text-[11px] text-omniv-text-muted">
                  {e.eventDate}
                </span>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}
