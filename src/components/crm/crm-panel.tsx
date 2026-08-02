"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FanDirectory } from "@/components/crm/fan-directory";
import { CrmNextSteps } from "@/components/crm/crm-next-steps";
import { FanGateMetrics } from "@/components/crm/fan-gate-metrics";
import { RosterSwitcher } from "@/components/crm/roster-switcher";
import { ContractsPanel } from "@/components/crm/contracts-panel";
import { isPlaceholderStageName } from "@/lib/crm-priority";
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
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn, scoreColor } from "@/lib/utils";
import {
  Users,
  CheckSquare,
  StickyNote,
  Calendar,
  Plus,
} from "lucide-react";

export function CrmPanel() {
  const [artists, setArtists] = useState<ManagedArtist[]>([]);
  const [tasks, setTasks] = useState<ManagerTask[]>([]);
  const [notes, setNotes] = useState<ManagerNote[]>([]);
  const [events, setEvents] = useState<ManagerEvent[]>([]);

  const [rosterCount, setRosterCount] = useState(0);
  const [fanCount, setFanCount] = useState(0);
  const [fans7d, setFans7d] = useState(0);
  const [superfanCount, setSuperfanCount] = useState(0);
  const [coldCount, setColdCount] = useState(0);
  const [topSource, setTopSource] = useState<string | null>(null);
  const [sources, setSources] = useState<{ source: string; count: number }[]>(
    []
  );
  const [gateSlug, setGateSlug] = useState<string | null>(null);
  const [primaryArtistName, setPrimaryArtistName] = useState<string | null>(
    null
  );

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

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    void (async () => {
      const { data: roster } = await supabase
        .from("roster_artists")
        .select("id, stage_name, slug");
      const list = roster || [];
      setRosterCount(list.length);
      const primary = list[0];
      if (primary && !isPlaceholderStageName(primary.stage_name)) {
        setPrimaryArtistName(primary.stage_name);
        setGateSlug(primary.slug);
      }
      const { data: fans } = await supabase
        .from("fans")
        .select("id, created_at, tier, source");
      const fanList = fans || [];
      setFanCount(fanList.length);
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      setFans7d(
        fanList.filter((f) => new Date(f.created_at).getTime() > weekAgo)
          .length
      );
      setSuperfanCount(fanList.filter((f) => f.tier === "superfan").length);
      setColdCount(fanList.filter((f) => f.tier === "cold").length);
      const bySource: Record<string, number> = {};
      for (const f of fanList) {
        const s = f.source || "unknown";
        bySource[s] = (bySource[s] || 0) + 1;
      }
      const sorted = Object.entries(bySource)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);
      setSources(sorted);
      setTopSource(sorted[0]?.source || null);
    })();
  }, []);

  const openTasks = tasks.filter((t) => !t.done).length;
  const openEvents = events.filter((e) => !e.done).length;

  function handleAddArtist() {
    if (!name.trim()) return;
    setArtists(
      addArtist({
        name: name.trim(),
        genre: genre.trim() || undefined,
        monthlyListeners: listeners ? Number(listeners) : undefined,
      })
    );
    setName("");
    setGenre("");
    setListeners("");
  }

  function handleAddTask() {
    if (!taskTitle.trim()) return;
    setTasks(addTask(taskTitle.trim()));
    setTaskTitle("");
  }

  function handleAddNote() {
    if (!noteBody.trim()) return;
    setNotes(addNote(noteBody.trim()));
    setNoteBody("");
  }

  function handleAddEvent() {
    if (!eventTitle.trim() || !eventDate) return;
    setEvents(addEvent(eventTitle.trim(), eventDate));
    setEventTitle("");
    setEventDate("");
  }

  return (
    <div className="space-y-5">
      <RosterSwitcher />
      <ContractsPanel />

      <CrmNextSteps
        rosterCount={rosterCount}
        fanCount={fanCount}
        fans7d={fans7d}
        superfanCount={superfanCount}
        coldCount={coldCount}
        topSource={topSource}
        openTasks={openTasks}
        openEvents={openEvents}
        gateSlug={gateSlug}
        primaryArtistName={primaryArtistName}
      />

      <FanGateMetrics
        fanCount={fanCount}
        fans7d={fans7d}
        sources={sources}
        gateSlug={gateSlug}
        artistName={primaryArtistName}
      />

      <FanDirectory />

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-omniv-gold" />
          <p className="text-sm font-medium">Local roster notes</p>
        </div>
        <div className="mb-3 grid gap-2 sm:grid-cols-3">
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
            value={listeners}
            onChange={(e) => setListeners(e.target.value)}
          />
        </div>
        <Button size="sm" className="gap-1.5" onClick={handleAddArtist}>
          <Plus className="h-3.5 w-3.5" />
          Add local note
        </Button>
        <ul className="mt-3 space-y-2">
          {artists.map((a) => (
            <li
              key={a.id}
              className="flex justify-between text-sm text-omniv-text-secondary"
            >
              <span>
                {a.name}
                {a.genre ? ` · ${a.genre}` : ""}
              </span>
              {a.monthlyListeners != null && (
                <span className={cn("font-data text-xs", scoreColor(50))}>
                  {a.monthlyListeners.toLocaleString()}
                </span>
              )}
            </li>
          ))}
        </ul>
        {rosterCount > 0 && (
          <p className="mt-2 text-[11px] text-omniv-text-muted">
            Cloud roster: {rosterCount} artist(s)
          </p>
        )}
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-omniv-gold" />
          <p className="text-sm font-medium">Tasks</p>
        </div>
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="New task"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <Button size="sm" onClick={handleAddTask}>
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
                  t.done
                    ? "text-omniv-text-muted line-through"
                    : "text-omniv-text-secondary"
                )}
              >
                {t.title}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-omniv-gold" />
          <p className="text-sm font-medium">Notes</p>
        </div>
        <div className="mb-3 flex gap-2">
          <Input
            placeholder="Write a note"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
          />
          <Button size="sm" onClick={handleAddNote}>
            Save
          </Button>
        </div>
        <ul className="space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="text-sm text-omniv-text-secondary">
              {n.body}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-omniv-gold" />
          <p className="text-sm font-medium">Calendar</p>
        </div>
        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <Input
            placeholder="Event"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
          <Input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
          <Button size="sm" onClick={handleAddEvent}>
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
