"use client";

import { useEffect, useState } from "react";
import { FanDirectory } from "@/components/crm/fan-directory";
import { CrmNextSteps } from "@/components/crm/crm-next-steps";
import { FanGateMetrics } from "@/components/crm/fan-gate-metrics";
import { RosterSwitcher } from "@/components/crm/roster-switcher";
import { ContractsPanel } from "@/components/crm/contracts-panel";
import { EarningsPanel } from "@/components/crm/earnings-panel";
import { AudienceMap } from "@/components/crm/audience-map";
import { CityHeatMap } from "@/components/crm/city-heat-map";
import { GatheringsPanel } from "@/components/crm/gatherings-panel";
import { VenueFinder } from "@/components/crm/venue-finder";
import { RoomChallenge } from "@/components/crm/room-challenge";
import { ShareFanGate } from "@/components/crm/share-fan-gate";
import { PublicPageEditor } from "@/components/crm/public-page-editor";
import { RosterPayouts } from "@/components/crm/roster-payouts";
import { StorySlides } from "@/components/onboarding/story-slides";
import { isPlaceholderStageName } from "@/lib/crm-priority";
import {
  loadTasks,
  loadEvents,
  type ManagerTask,
  type ManagerEvent,
} from "@/lib/workspace-store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type TabId = "home" | "rooms" | "money" | "fans";

export function CrmPanel({
  initialCity = null,
  initialReady = null,
  focusRoom = false,
  initialTab = "home",
}: {
  initialCity?: string | null;
  initialReady?: number | null;
  focusRoom?: boolean;
  initialTab?: TabId;
} = {}) {
  const [tasks, setTasks] = useState<ManagerTask[]>([]);
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
  const [gatherCity, setGatherCity] = useState<string | null>(initialCity);
  const [gatherReady, setGatherReady] = useState<number | null>(initialReady);
  const [gatherVenue, setGatherVenue] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>(
    focusRoom ? "rooms" : initialTab || "home"
  );

  useEffect(() => {
    if (initialCity) setGatherCity(initialCity);
    if (initialReady != null) setGatherReady(initialReady);
  }, [initialCity, initialReady]);

  useEffect(() => {
    if (focusRoom) setTab("rooms");
    else if (initialTab) setTab(initialTab);
  }, [focusRoom, initialTab]);

  useEffect(() => {
    setTasks(loadTasks());
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
      setSuperfanCount(list.filter((f) => f.fan_tier === "Superfan").length);
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

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 -mx-3 border-b border-omniv-border/80 bg-omniv-black/95 px-3 py-2.5 backdrop-blur-md sm:-mx-4 sm:px-4 md:mx-0 md:rounded-2xl md:border">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
              Your list
            </p>
            <p className="font-data text-xl font-semibold tabular-nums tracking-tight">
              {fanCount.toLocaleString()}
              <span className="ml-1 text-[12px] font-normal text-omniv-text-muted">
                fans
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
              Superfans
            </p>
            <p className="font-data text-lg font-semibold tabular-nums text-omniv-gold">
              {superfanCount}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex gap-1 overflow-x-auto pb-0.5">
          {(
            [
              { id: "home" as const, label: "Home" },
              { id: "rooms" as const, label: "Rooms" },
              { id: "money" as const, label: "Money" },
              { id: "fans" as const, label: "Fans" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={
                tab === item.id
                  ? "shrink-0 rounded-full bg-omniv-gold px-3.5 py-1.5 text-[12px] font-semibold text-omniv-black"
                  : "shrink-0 rounded-full border border-omniv-border bg-omniv-card/50 px-3.5 py-1.5 text-[12px] text-omniv-text-muted"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "home" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                label: "Owned fans",
                value: fanCount,
                sub: fans7d > 0 ? `+${fans7d} this week` : "Build the list",
              },
              {
                label: "Superfans",
                value: superfanCount,
                sub: "Would show up",
              },
              {
                label: "Cold",
                value: coldCount,
                sub: "Need a nudge",
              },
              {
                label: "Open tasks",
                value: openTasks,
                sub: openTasks ? "In your notes" : "Clear",
              },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border border-omniv-border bg-omniv-card p-3.5"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
                  {c.label}
                </p>
                <p className="mt-1.5 font-data text-2xl font-semibold tabular-nums tracking-tight">
                  {c.value.toLocaleString()}
                </p>
                <p className="mt-1 text-[11px] text-omniv-text-muted">{c.sub}</p>
              </div>
            ))}
          </div>
          <RosterSwitcher />
          <ShareFanGate
            gateSlug={gateSlug}
            artistName={primaryArtistName}
            fanCount={fanCount}
          />
          <RoomChallenge />
          <div className="grid gap-4 lg:grid-cols-2">
            <CityHeatMap
              onCreateGathering={(city, ready) => {
                setGatherCity(city);
                setGatherReady(ready);
                setTab("rooms");
              }}
            />
            <AudienceMap
              onCreateGathering={(city, ready) => {
                setGatherCity(city);
                setGatherReady(ready);
                setTab("rooms");
              }}
            />
          </div>
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
        </div>
      )}

      {tab === "rooms" && (
        <div className="space-y-4">
          <p className="text-[13px] leading-snug text-omniv-text-secondary">
            City where fans said they would come. Find a place. Open a room.
            Share the link.
          </p>
          <div id="room-form">
            <GatheringsPanel
              seedCity={gatherCity}
              seedReady={gatherReady}
              seedVenue={gatherVenue}
            />
          </div>
          <VenueFinder
            city={gatherCity}
            onPick={(v) => {
              setGatherCity(v.city);
              setGatherVenue(v.name);
            }}
          />
        </div>
      )}

      {tab === "money" && (
        <div className="space-y-4">
          <p className="text-[13px] leading-snug text-omniv-text-secondary">
            Tickets from rooms. Tips from your tip links. Copy a link per artist
            on your roster. Labels set payout per act below.
          </p>
          <PublicPageEditor slug={gateSlug} />
          <div className="rounded-2xl border border-omniv-gold/20 bg-omniv-gold/5 px-3.5 py-2.5 text-[12px] text-omniv-text-secondary">
            <span className="font-semibold text-omniv-gold">~90% to you</span>
            {" · "}
            Omniv 10%. Africa: auto-pay when bank is linked. US / EU / Asia: payout
            on schedule to the account you save.
          </div>
          <EarningsPanel />
          <RosterPayouts />
          <ContractsPanel />
        </div>
      )}

      {tab === "fans" && (
        <div className="space-y-4">
          <ShareFanGate
            gateSlug={gateSlug}
            artistName={primaryArtistName}
            fanCount={fanCount}
          />
          <PublicPageEditor slug={gateSlug} />
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
        </div>
      )}

      <StorySlides />
    </div>
  );
}
