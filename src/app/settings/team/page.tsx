"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { usePlan } from "@/components/billing/plan-provider";
import { planById } from "@/lib/billing";

type Member = {
  id: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  status: "active" | "invited";
};

const KEY = "omniv-team-members";

function readMembers(): Member[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeMembers(list: Member[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
}

export default function TeamSettingsPage() {
  const { plan, can, require } = usePlan();
  const def = planById(plan);
  const seatLimit = def.limits.teamSeats;
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setMembers(readMembers());
  }, []);

  function invite() {
    if (!can("team_seats")) {
      require("team_seats");
      return;
    }
    const e = email.trim().toLowerCase();
    if (!e.includes("@")) {
      setMsg("Enter a valid email");
      return;
    }
    if (members.length >= seatLimit) {
      setMsg(`Seat limit reached (${seatLimit}). Upgrade for more.`);
      return;
    }
    if (members.some((m) => m.email === e)) {
      setMsg("Already invited");
      return;
    }
    const next: Member[] = [
      ...members,
      {
        id: `m-${Date.now()}`,
        email: e,
        role,
        status: "invited",
      },
    ];
    writeMembers(next);
    setMembers(next);
    setEmail("");
    setMsg(`Invite saved for ${e}. Email delivery wires when Resend is set.`);
  }

  function remove(id: string) {
    const next = members.filter((m) => m.id !== id);
    writeMembers(next);
    setMembers(next);
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <Link href="/settings" className="text-zinc-400">
              ←
            </Link>
            <h1 className="text-[17px] font-semibold text-white">Team seats</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg space-y-5 px-4 pb-28 pt-4">
          <div className="rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.08]">
            <p className="text-[14px] text-zinc-300">
              Plan: <span className="font-semibold text-white">{def.name}</span>
            </p>
            <p className="mt-1 text-[13px] text-zinc-500">
              Seats used {members.length} / {seatLimit === 0 ? "—" : seatLimit}
            </p>
          </div>

          {!can("team_seats") && (
            <div className="rounded-2xl bg-omniv-gold/10 px-4 py-4 ring-1 ring-omniv-gold/25">
              <p className="text-[14px] font-semibold text-omniv-gold">
                Team seats need Pro or Business
              </p>
              <Link
                href="/pricing"
                className="mt-3 inline-flex h-10 items-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black"
              >
                View plans
              </Link>
            </div>
          )}

          {can("team_seats") && (
            <>
              <div className="space-y-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.08]">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-500">
                  Invite
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:ring-omniv-gold/40"
                />
                <div className="flex gap-2">
                  {(["editor", "viewer"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium capitalize ${
                        role === r
                          ? "bg-omniv-gold text-black"
                          : "bg-white/[0.06] text-zinc-400"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={invite}
                  className="flex h-11 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
                >
                  Send invite
                </button>
                {msg && <p className="text-[12px] text-zinc-500">{msg}</p>}
              </div>

              <ul className="space-y-2">
                {members.length === 0 && (
                  <p className="text-[13px] text-zinc-500">
                    No teammates yet. Invites are stored on this device until
                    server team tables ship.
                  </p>
                )}
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] text-white">{m.email}</p>
                      <p className="text-[11px] capitalize text-zinc-500">
                        {m.role} · {m.status}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(m.id)}
                      className="text-[12px] text-zinc-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </main>
        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
