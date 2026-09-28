"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { readProfile, writeProfile } from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  isEntityContext,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

type CheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; message: string }
  | { status: "taken"; message: string }
  | { status: "invalid"; message: string };

function normalize(raw: string) {
  return raw
    .trim()
    .replace(/^@+/,
      "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 15);
}

export default function UsernameSettingsPage() {
  const [value, setValue] = useState("");
  const [current, setCurrent] = useState("");
  const [check, setCheck] = useState<CheckState>({ status: "idle" });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [entityId, setEntityId] = useState<string | null>(null);

  useEffect(() => {
    const p = readProfile();
    const h = (p.handle || "").replace(/^@/, "");
    setCurrent(h);
    setValue(h);
    const a = readActiveAccount();
    setActive(a);
    if (isEntityContext(a) && a) {
      setEntityId(a.id || null);
      if (a.slug) {
        setCurrent(a.slug);
        setValue(a.slug);
      }
    }
  }, []);

  const runCheck = useCallback(
    async (raw: string) => {
      const u = normalize(raw);
      if (!u) {
        setCheck({ status: "idle" });
        return;
      }
      if (u === current.toLowerCase()) {
        setCheck({
          status: "available",
          message: "This is your current username",
        });
        return;
      }
      if (u.length < 3) {
        setCheck({
          status: "invalid",
          message: "Must be at least 3 characters",
        });
        return;
      }
      setCheck({ status: "checking" });
      try {
        const qs = new URLSearchParams({ q: u });
        if (entityId) qs.set("entityId", entityId);
        const res = await fetch(`/api/discovery/username?${qs}`);
        const data = await res.json();
        if (data.available) {
          setCheck({
            status: "available",
            message: data.message || "Available",
          });
        } else {
          setCheck({
            status: data.message?.includes("Must") ? "invalid" : "taken",
            message: data.message || "Already taken",
          });
        }
      } catch {
        setCheck({ status: "invalid", message: "Could not check right now" });
      }
    },
    [current, entityId]
  );

  useEffect(() => {
    const u = normalize(value);
    if (!u) {
      setCheck({ status: "idle" });
      return;
    }
    const t = window.setTimeout(() => void runCheck(u), 350);
    return () => window.clearTimeout(t);
  }, [value, runCheck]);

  async function save() {
    const u = normalize(value);
    if (!u || check.status === "taken" || check.status === "invalid") return;
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/discovery/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: u,
          entityId: entityId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheck({
          status: "taken",
          message: data.error || "Already taken",
        });
        setSaving(false);
        return;
      }
      if (!entityId) {
        const p = readProfile();
        writeProfile({ ...p, handle: u });
      }
      setCurrent(u);
      setSavedMsg("Username updated");
      setCheck({
        status: "available",
        message: "This is your current username",
      });
    } catch {
      setSavedMsg("Could not save");
    } finally {
      setSaving(false);
    }
  }

  const actuallyCanSave =
    normalize(value).length >= 3 &&
    normalize(value) !== current.toLowerCase() &&
    check.status === "available";

  const asLabel =
    isEntityContext(active) && active
      ? `${active.name} · ${active.type}`
      : "Personal account";

  return (
    <DiscoveryShell>
      <div className="min-h-dvh overflow-x-hidden bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5"
            >
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Username</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-6">
          <p className="text-[14px] leading-relaxed text-zinc-500">
            Your username is unique on Omniv — for people, companies, and
            entities. No two accounts can share the same @.
          </p>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
            Changing username for
          </p>
          <p className="mt-1 text-[13px] text-zinc-300">{asLabel}</p>
          {current && (
            <p className="mt-1 text-[13px] text-zinc-500">
              Current: <span className="text-white">@{current}</span>
            </p>
          )}

          <label className="mt-6 block">
            <span className="text-[12px] text-zinc-500">Username</span>
            <div
              className={`mt-1.5 flex h-12 items-center rounded-xl bg-white/[0.04] ring-1 transition focus-within:ring-2 ${
                check.status === "taken" || check.status === "invalid"
                  ? "ring-red-500/60 focus-within:ring-red-500"
                  : check.status === "available"
                    ? "ring-emerald-500/50 focus-within:ring-emerald-500"
                    : "ring-white/[0.08] focus-within:ring-omniv-gold/40"
              }`}
            >
              <span className="pl-3.5 text-[15px] text-zinc-500">@</span>
              <input
                value={value}
                onChange={(e) => setValue(normalize(e.target.value))}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                maxLength={15}
                placeholder="username"
                className="h-full flex-1 bg-transparent px-1.5 text-[15px] text-white outline-none placeholder:text-zinc-600"
              />
              <span className="pr-3">
                {check.status === "checking" && (
                  <span className="text-[12px] text-zinc-500">…</span>
                )}
                {check.status === "available" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#10b981" />
                    <path
                      d="M8 12.5 10.5 15 16 9.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {(check.status === "taken" || check.status === "invalid") && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#ef4444" />
                    <path
                      d="M15 9 9 15M9 9l6 6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
            </div>
          </label>

          <div className="mt-2 min-h-[20px]">
            {check.status === "available" && (
              <p className="text-[13px] text-emerald-400">
                @{normalize(value)} is available
              </p>
            )}
            {check.status === "taken" && (
              <p className="text-[13px] text-red-400">
                @{normalize(value)} is not available
              </p>
            )}
            {check.status === "invalid" && (
              <p className="text-[13px] text-red-400">{check.message}</p>
            )}
            {check.status === "checking" && (
              <p className="text-[13px] text-zinc-500">Checking…</p>
            )}
          </div>

          <ul className="mt-5 space-y-1.5 text-[12px] text-zinc-600">
            <li>· 3–15 characters</li>
            <li>· Letters, numbers, and underscores only</li>
            <li>· Must start with a letter</li>
            <li>· Unique across every person, company, and entity</li>
          </ul>

          <button
            type="button"
            disabled={!actuallyCanSave || saving}
            onClick={() => void save()}
            className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {savedMsg && (
            <p className="mt-3 text-center text-[13px] text-emerald-400">
              {savedMsg}
            </p>
          )}
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
