"use client";

import { useEffect, useState } from "react";
import {
  REMINDER_PRESETS,
  clearReminder,
  formatCountdown,
  formatEventWhen,
  getReminderForSlug,
  setReminder,
  type EventReminder,
} from "@/lib/discovery/event-reminders";

export function EventReminderButton({
  publicationSlug,
  publicationTitle,
  publicationPath,
  eventAt,
}: {
  publicationSlug: string;
  publicationTitle: string;
  publicationPath?: string;
  eventAt: string;
}) {
  const [reminder, setRem] = useState<EventReminder | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([24 * 60, 60, 0]);
  const [countdown, setCountdown] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setRem(getReminderForSlug(publicationSlug));
    const onRem = () => setRem(getReminderForSlug(publicationSlug));
    window.addEventListener("omniv-reminders", onRem);
    return () => window.removeEventListener("omniv-reminders", onRem);
  }, [publicationSlug]);

  useEffect(() => {
    function tick() {
      setCountdown(formatCountdown(eventAt));
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [eventAt]);

  async function requestBrowserPermission() {
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch {
      /* ignore */
    }
  }

  function toggleOffset(minutes: number) {
    setSelected((prev) =>
      prev.includes(minutes)
        ? prev.filter((m) => m !== minutes)
        : [...prev, minutes].sort((a, b) => b - a)
    );
  }

  function onSave() {
    if (busy) return;
    setBusy(true);
    void requestBrowserPermission();
    const r = setReminder({
      publicationSlug,
      publicationTitle,
      publicationPath,
      eventAt,
      offsetsMinutes: selected.length ? selected : [0],
    });
    setRem(r);
    setOpen(false);
    setBusy(false);
  }

  function onClear() {
    clearReminder(publicationSlug);
    setRem(null);
    setOpen(false);
  }

  const past = Date.parse(eventAt) < Date.now() - 60_000;

  if (past) {
    return (
      <div className="rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.08]">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-500">
          Event
        </p>
        <p className="mt-1 text-[14px] text-zinc-400">
          {formatEventWhen(eventAt)} · ended
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.08]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
            Event countdown
          </p>
          <p className="mt-1 text-[22px] font-semibold tabular-nums text-white">
            {countdown || "…"}
          </p>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            {formatEventWhen(eventAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
            reminder
              ? "bg-omniv-gold/15 text-omniv-gold ring-1 ring-omniv-gold/30"
              : "bg-omniv-gold text-black"
          }`}
        >
          {reminder ? "Reminded" : "Remind me"}
        </button>
      </div>

      {reminder && !open ? (
        <p className="mt-2 text-[12px] text-zinc-500">
          You'll get notifications before and at start. Tap Reminded to change.
        </p>
      ) : null}

      {open ? (
        <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
          <p className="text-[12px] text-zinc-400">Notify me…</p>
          <div className="flex flex-wrap gap-2">
            {REMINDER_PRESETS.map((p) => {
              const on = selected.includes(p.minutes);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleOffset(p.minutes)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${
                    on
                      ? "bg-omniv-gold text-black"
                      : "bg-white/[0.06] text-zinc-400"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              disabled={busy || selected.length === 0}
              onClick={onSave}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-omniv-gold text-[13px] font-semibold text-black disabled:opacity-50"
            >
              Save reminder
            </button>
            {reminder ? (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex h-10 items-center rounded-full bg-white/[0.06] px-4 text-[13px] font-medium text-zinc-400"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
