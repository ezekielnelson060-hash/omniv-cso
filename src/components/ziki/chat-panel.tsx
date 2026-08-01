"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getArtistBrain, getProfile } from "@/lib/db/profile";
import {
  computeScoresFromBrain,
  buildRecommendationsFromBrain,
} from "@/lib/strategy/scores";
import {
  consumeAct,
  createThread,
  deleteThread,
  getActiveId,
  loadThreads,
  titleFromMessages,
  upsertThread,
  type ZikiThread,
} from "@/lib/ziki-memory";
import type { ChatMessage } from "@/types";
import {
  ArrowUp,
  Loader2,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeft,
} from "lucide-react";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const SUGGESTIONS = [
  "What should I release next?",
  "What content should I post this week?",
  "What are my biggest opportunities?",
  "Draft a 7-day content plan",
];

function RichText({ text, dark }: { text: string; dark?: boolean }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const heading = /^(\*\*[^*]+\*\*)/.test(line.trim());
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p
            key={i}
            className={cn(
              heading && "mt-2 text-[13px] font-semibold tracking-tight",
              dark ? "text-omniv-black" : "text-omniv-text-secondary"
            )}
          >
            {parts.map((part, j) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong
                    key={j}
                    className={cn(
                      "font-semibold",
                      dark ? "text-omniv-black" : "text-omniv-text"
                    )}
                  >
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

function welcomeMsg(name: string): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: `I'm **Ziki** — your AI Chief Strategy Officer for **${name}**.\n\nI'm grounded in your onboarding. Ask what to release, post, or prioritise — or open an opportunity with **Act on this**.`,
    createdAt: Date.now(),
  };
}

export function ChatPanel() {
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState<ZikiThread[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [artistName, setArtistName] = useState("your project");
  const [context, setContext] = useState("");
  const [ready, setReady] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bootstrapped = useRef(false);

  const persist = useCallback(
    (id: string, msgs: ChatMessage[], title?: string) => {
      const t: ZikiThread = {
        id,
        title: title || titleFromMessages(msgs),
        messages: msgs,
        updatedAt: Date.now(),
      };
      upsertThread(t);
      setThreads(loadThreads());
    },
    []
  );

  useEffect(() => {
    (async () => {
      const [brain, profile] = await Promise.all([
        getArtistBrain(),
        getProfile(),
      ]);
      const name =
        brain?.stageName || brain?.name || profile?.full_name || "your project";
      setArtistName(name);
      const platforms = profile?.platforms || [];
      const interests = profile?.interests || [];
      const scores = computeScoresFromBrain(brain, platforms);
      const recs = buildRecommendationsFromBrain(brain, platforms, interests);
      setContext(
        `Artist: ${name}
Genre: ${brain?.genre?.join(", ") || "TBD"}
Stage: ${brain?.careerStage || "emerging"}
Style: ${brain?.musicStyle || "n/a"}
Voice: ${brain?.brandVoice || "n/a"}
Goals: ${brain?.goals?.join("; ") || "n/a"}
Interests: ${interests.join(", ") || "general"}
Platforms: ${platforms.join(", ") || "none"}
Scores: overall ${scores.overall}, momentum ${scores.momentum}, release readiness ${scores.releaseReadiness}
Top opportunities: ${recs
          .slice(0, 4)
          .map((r) => r.title)
          .join(" | ")}`
      );

      let list = loadThreads();
      let id = getActiveId();
      if (!id || !list.find((t) => t.id === id)) {
        const t = createThread("New briefing");
        list = loadThreads();
        id = t.id;
      }
      setThreads(list);
      setActiveIdState(id);
      const active = list.find((t) => t.id === id);
      if (active && active.messages.length > 0) {
        setMessages(active.messages);
      } else {
        const welcome = [welcomeMsg(name)];
        setMessages(welcome);
        if (id) persist(id, welcome, "New briefing");
      }
      setReady(true);
    })();
  }, [persist]);

  // Consume Act on this OR ?q= from CRM Next Steps once ready
  useEffect(() => {
    if (!ready || bootstrapped.current || !activeId) return;
    const act = consumeAct();
    if (act) {
      bootstrapped.current = true;
      const prompt = `Help me execute this opportunity:\n\n**${act.title}**\n${act.summary || ""}\n\nWhy: ${act.why || "n/a"}\nExpected: ${act.expectedOutcome || "n/a"}\nCategory: ${act.category || "Strategy"}\n\nGive a concrete 7-day execution plan with exact actions.`;
      void send(prompt, true);
      return;
    }
    const q = searchParams.get("q")?.trim();
    if (q) {
      bootstrapped.current = true;
      void send(q, true);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("q");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, activeId, searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  function openThread(id: string) {
    const t = loadThreads().find((x) => x.id === id);
    if (!t) return;
    setActiveIdState(id);
    localStorage.setItem("omniv_ziki_active_v1", id);
    setMessages(
      t.messages.length > 0 ? t.messages : [welcomeMsg(artistName)]
    );
    setHistoryOpen(false);
  }

  function newChat() {
    const t = createThread("New briefing");
    const welcome = [welcomeMsg(artistName)];
    setThreads(loadThreads());
    setActiveIdState(t.id);
    setMessages(welcome);
    persist(t.id, welcome, "New briefing");
    setHistoryOpen(false);
  }

  async function send(text: string, fromAct = false) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const threadId = activeId || createThread().id;
    if (!activeId) setActiveIdState(threadId);

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };
    const withUser =
      messages.length === 1 && messages[0]?.id === "welcome"
        ? [...messages, userMsg]
        : [...messages, userMsg];

    setMessages(withUser);
    setInput("");
    setBusy(true);

    const history = withUser
      .slice(-12)
      .map((m) => `${m.role === "user" ? "User" : "Ziki"}: ${m.content}`)
      .join("\n\n");

    try {
      const res = await fetch("/api/ziki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          context: `You are Ziki, CSO for ${artistName}. Never mention Nova Hex.
Use only this profile:\n${context}\n\nRecent conversation:\n${history}\n\nAnswer as executive briefing with bold headings:
**What to do**
**Why**
**When**
**How**
**Priority**
**Expected outcome**`,
        }),
      });
      const data = (await res.json()) as { text?: string };
      const assistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        content:
          data.text ||
          "Ziki could not reach the model. Check GEMINI_API_KEY, then retry.",
        createdAt: Date.now(),
      };
      const final = [...withUser, assistant];
      setMessages(final);
      persist(
        threadId,
        final,
        fromAct ? trimmed.slice(0, 48) : titleFromMessages(final)
      );
    } catch {
      const assistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: `**Connection issue**\n\nCould not complete that briefing for **${artistName}**. Try again.`,
        createdAt: Date.now(),
      };
      const final = [...withUser, assistant];
      setMessages(final);
      persist(threadId, final);
    }
    setBusy(false);
    inputRef.current?.focus();
  }

  const showSuggestions =
    ready && messages.length <= 1 && !busy && !input.trim();

  return (
    <div className="relative flex h-full flex-col bg-omniv-black">
      {historyOpen && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-20 bg-black/50 md:hidden"
            aria-label="Close history"
            onClick={() => setHistoryOpen(false)}
          />
          <aside className="absolute left-0 top-0 z-30 flex h-full w-[260px] flex-col border-r border-omniv-border bg-omniv-elevated md:relative md:z-0">
            <div className="flex items-center justify-between border-b border-omniv-border px-3 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-omniv-text-muted">
                Chats
              </span>
              <Button size="sm" variant="outline" className="gap-1" onClick={newChat}>
                <Plus className="h-3.5 w-3.5" />
                New
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {threads.length === 0 && (
                <p className="px-2 py-4 text-xs text-omniv-text-muted">
                  No saved chats yet.
                </p>
              )}
              {threads.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "group mb-1 flex items-center gap-1 rounded-lg px-2 py-2 text-left text-xs",
                    t.id === activeId
                      ? "bg-omniv-gold/10 text-omniv-gold"
                      : "text-omniv-text-secondary hover:bg-white/[0.04]"
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left"
                    onClick={() => openThread(t.id)}
                  >
                    <MessageSquare className="mr-1.5 inline h-3 w-3 opacity-60" />
                    {t.title}
                  </button>
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100"
                    aria-label="Delete chat"
                    onClick={() => {
                      deleteThread(t.id);
                      const next = loadThreads();
                      setThreads(next);
                      if (t.id === activeId) {
                        if (next[0]) openThread(next[0].id);
                        else newChat();
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-omniv-text-muted" />
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-omniv-border px-3 py-3 md:px-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-omniv-border text-omniv-text-muted hover:text-omniv-text"
              aria-label="Chat history"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-omniv-gold/15 font-data text-sm font-bold text-omniv-gold">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Ziki</span>
                <Badge variant="gold">CSO</Badge>
              </div>
              <p className="text-[11px] text-omniv-text-muted">{artistName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" onClick={newChat}>
            <Plus className="h-3.5 w-3.5" />
            New chat
          </Button>
        </div>

        <div className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15 font-data text-xs font-bold text-omniv-gold">
                    Z
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[min(100%,640px)] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-omniv-gold text-omniv-black"
                      : "border border-omniv-border bg-omniv-card"
                  )}
                >
                  <RichText text={msg.content} dark={msg.role === "user"} />
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-omniv-text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-omniv-gold" />
                Ziki is briefing…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="shrink-0 border-t border-omniv-border bg-omniv-elevated/80 px-4 py-3 backdrop-blur-md md:px-6">
          <div className="mx-auto max-w-3xl">
            {showSuggestions && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-omniv-border/80 bg-omniv-card/50 px-3 py-1.5 text-[11px] text-omniv-text-muted hover:border-omniv-gold/30 hover:text-omniv-gold"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder="Message Ziki…"
                className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-omniv-border bg-omniv-card px-4 py-3 text-sm focus-gold"
              />
              <Button
                size="icon"
                className="h-12 w-12 shrink-0 rounded-2xl"
                disabled={busy || !input.trim()}
                onClick={() => void send(input)}
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
