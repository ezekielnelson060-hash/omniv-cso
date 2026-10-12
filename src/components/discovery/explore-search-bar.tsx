"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const HISTORY_KEY = "omniv_explore_search_history_v1";
const MAX_HISTORY = 12;

function readHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x) => typeof x === "string" && x.trim()).slice(0, MAX_HISTORY)
      : [];
  } catch {
    return [];
  }
}

function writeHistory(items: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch {
    /* ignore */
  }
}

function pushHistory(term: string) {
  const t = term.trim();
  if (!t) return;
  const next = [t, ...readHistory().filter((x) => x.toLowerCase() !== t.toLowerCase())];
  writeHistory(next);
}

export function ExploreSearchBar({
  value = "",
  type,
  interest,
}: {
  value?: string;
  type?: string;
  interest?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(value);
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQ(value);
  }, [value]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  function submit(term: string) {
    const t = term.trim();
    if (!t) {
      router.push("/explore");
      return;
    }
    pushHistory(t);
    setHistory(readHistory());
    const params = new URLSearchParams();
    params.set("q", t);
    if (type && type !== "all") params.set("type", type);
    if (interest) params.set("interest", interest);
    router.push(`/explore?${params.toString()}`);
    setFocused(false);
    inputRef.current?.blur();
  }

  function clearHistory() {
    writeHistory([]);
    setHistory([]);
  }

  function removeItem(term: string) {
    const next = readHistory().filter((x) => x !== term);
    writeHistory(next);
    setHistory(next);
  }

  function cancel() {
    setQ(value);
    setFocused(false);
    inputRef.current?.blur();
  }

  const showPanel = focused;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit(q);
              }
              if (e.key === "Escape") cancel();
            }}
            placeholder="Search"
            aria-label="Search Omniv"
            className="h-11 w-full rounded-full border border-white/[0.08] bg-white/[0.06] pl-10 pr-4 text-[15px] text-white outline-none placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/[0.08]"
          />
        </div>
        {showPanel ? (
          <button
            type="button"
            onClick={cancel}
            className="shrink-0 text-[14px] font-medium text-zinc-300 hover:text-white"
          >
            Cancel
          </button>
        ) : null}
      </div>

      {showPanel ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0c] shadow-2xl">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <p className="text-[13px] font-semibold text-white">Search History</p>
            {history.length > 0 ? (
              <button
                type="button"
                onClick={clearHistory}
                className="text-[12px] font-medium text-zinc-500 hover:text-omniv-gold"
              >
                Clear
              </button>
            ) : null}
          </div>
          {history.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-zinc-500">
              No recent searches
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {history.map((term) => (
                <li key={term}>
                  <div className="flex items-center gap-1 px-2">
                    <button
                      type="button"
                      onClick={() => submit(term)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2.5 text-left text-[14px] text-zinc-200 hover:bg-white/[0.06]"
                    >
                      <span className="text-zinc-500" aria-hidden>
                        ⌕
                      </span>
                      <span className="truncate">{term}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${term}`}
                      onClick={() => removeItem(term)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 hover:bg-white/[0.06] hover:text-zinc-300"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
