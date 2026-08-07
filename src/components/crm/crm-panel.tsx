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
import { AudienceMap } from "@/components/crm/audience-map";
import { GatheringsPanel } from "@/components/crm/gatherings-panel";
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
  const [gatherCity, setGatherCity] = useState<string | null>(null);
  const [gatherReady, setGatherReady] = useState<number | null>(null);

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
      const rows = roster || [];
      setRosterCount(rows.length);
      const real = rows.find(
        (r) => !isPlaceholderStageName(String(r.stage_name || ""))
      );
      if (real) {
        setPrimaryArtistName(String(real.stage_name));
        setGateSlug(String(real.slug));
      } else if (rows[0]) {
        setPrimaryArtistName(String(rows[0].stage_name));
        setGateSlug(String(rows[0].slug));
      }
      const ids = rows.map((r) => r.id as string);
      if (ids.length === 0) return;
      const { data: fans } = await supabase
        .from("fans")
        .select("fan_tier, acquisition_source, created_at")
        .in("artist_id", ids);
      const list = fans || [];
      setFanCount(list.length);
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      setFans7d(
        list.filter((f) => new Date(String(f.created_at)).getTime() > weekAgo)
          .length
      );
      setSuperfanCount(
        list.filter((f) => f.fan_tier === "Superfan").length
      );
      setColdCount(list.filter((f) => f.fan_tier === "Cold").length);
      const srcMap = new Map<string, number>();
      for (const f of list) {
        const s = String(f.acquisition_source || "unknown");
        srcMap.set(s, (srcMap.get(s) || 0) + 1);
      }
      const srcList = [...srcMap.entries()]
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);
      setSources(srcList);
      setTopSource(srcList[0]?.source || null);
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

      <div className="grid gap-4 lg:grid-cols-2">
        <AudienceMap
          onCreateGathering={(city, ready) => {
            setGatherCity(city);
            setGatherReady(ready);
          }}
        />
        <GatheringsPanel seedCity={gatherCity} seedReady={gatherReady} />
      </div>

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
        superfanCount={superfanCount}
        coldCount={coldCount}
        topSource={topSource}
        sources={sources}
        gateSlug={gateSlug}
        artistName={primaryArtistName}
      />

      <FanDirectory />

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-omniv-gold" />
          <h2 className="text-sm font-semibold">Local roster notes</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
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
        <Button size="sm" className="mt-3 gap-1" onClick={handleAddArtist}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
        <ul className="mt-3 space-y-1 text-sm">
          {artists.map((a) => (
            <li key={a.id} className="text-omniv-text-secondary">
              {a.name}
              {a.genre ? ` · ${a.genre}` : ""}
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CheckSquare className="h-4 w-4 text-omniv-gold" />
            Tasks
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="New task"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
            <Button size="sm" onClick={handleAddTask}>
              Add
            </Button>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => setTasks(toggleTask(t.id))}
                />
                <span className={cn(t.done && "line-through opacity-50")}>
                  {t.title}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <StickyNote className="h-4 w-4 text-omniv-gold" />
            Notes
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Note"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
            />
            <Button size="sm" onClick={handleAddNote}>
              Add
            </Button>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-omniv-text-secondary">
            {notes.map((n) => (
              <li key={n.id}>{n.body}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-omniv-gold" />
            Calendar
          </div>
          <div className="flex flex-col gap-2">
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
          <ul className="mt-2 space-y-1 text-xs">
            {events.map((ev) => (
              <li key={ev.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ev.done}
                  onChange={() => setEvents(toggleEvent(ev.id))}
                />
                <span className={cn(ev.done && "line-through opacity-50")}>
                  {ev.title} · {ev.date}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
