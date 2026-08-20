"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
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
  analyzeAudioFile,
  formatPassportForZiki,
  type AudioPassport,
} from "@/lib/audio-passport";
import { TrackWaveform } from "@/components/ziki/track-waveform";
import { MessageActions } from "@/components/ziki/message-actions";
import { RichText } from "@/components/ziki/rich-text";
import {
  ArrowUp,
  Loader2,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeft,
  Paperclip,
} from "lucide-react";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const SUGGESTIONS = [
  "What is my highest-impact move this week?",
  "Where is my real market demand?",
  "What room size should I open first?",
  "Draft a 7-day execution plan",
];

function welcomeMsg(name: string): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: `Hey — I'm **Ziki**, your visual Chief Strategic Officer for **${name}**.\n\nI'm trained on artist management: market demand, where your fans actually are, rooms that can sell, release timing, money moves, and what not to waste budget on.\n\nTalk to me like a CSO — brief, blunt, next move. Attach a demo when you want me to listen.\n\nNo generic hustle. Demand first. Then the plan.`,
    createdAt: Date.now(),
  };
}

export function ChatPanel() {
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState<ZikiThread[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<
    {
      id: string;
      name: string;
      type: string;
      data?: string;
      fileUri?: string;
      url?: string;
      passport?: AudioPassport | null;
      analyzing?: boolean;
      uploading?: boolean;
    }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [artistName, setArtistName] = useState("your project");
  const [context, setContext] = useState("");
  const [ready, setReady] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bootstrapped = useRef(false);

  const persist = useCallback((id: string, msgs: ChatMessage[], title?: string) => {
    upsertThread({
      id,
      title: title || titleFromMessages(msgs),
      messages: msgs,
      updatedAt: Date.now(),
    });
    setThreads(loadThreads());
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    void (async () => {
      try {
        const [brain, profile] = await Promise.all([
          getArtistBrain(),
          getProfile(),
        ]);
        const name =
          brain?.stageName ||
          brain?.name ||
          profile?.full_name ||
          "your project";
        setArtistName(name);
        const scores = brain ? computeScoresFromBrain(brain) : null;
        const recs = brain ? buildRecommendationsFromBrain(brain) : [];
        setContext(
          [
            `Name: ${name}`,
            brain?.genre ? `Genre: ${brain.genre.join(", ")}` : "",
            brain?.goals ? `Goals: ${brain.goals.join(", ")}` : "",
            scores ? `Scores: ${JSON.stringify(scores)}` : "",
            recs.length ? `Recs: ${recs.slice(0, 5).join("; ")}` : "",
          ]
            .filter(Boolean)
            .join("\n")
        );
      } catch {
        /* soft */
      }
      const existing = loadThreads();
      setThreads(existing);
      const act = consumeAct();
      const seed = searchParams.get("q") || act?.summary || "";
      let id = getActiveId() || existing[0]?.id;
      if (!id) {
        const t = createThread(welcomeMsg("your project"));
        id = t.id;
        setThreads(loadThreads());
      }
      setActiveIdState(id);
      const th = loadThreads().find((x) => x.id === id);
      const msgs = th?.messages?.length
        ? th.messages
        : [welcomeMsg(artistName || "your project")];
      setMessages(msgs);
      if (seed) setInput(seed);
      setReady(true);
    })();
  }, [searchParams, artistName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    setBusy(true);
    try {
      const passports = attachments
        .map((a) => a.passport)
        .filter(Boolean) as AudioPassport[];
      const passportBlock = passports.length
        ? "\n\n" + passports.map((p) => formatPassportForZiki(p)).join("\n\n")
        : "";
      const history = next
        .slice(-12)
        .map((m) => `${m.role === "user" ? "User" : "Ziki"}: ${m.content}`)
        .join("\n");
      const res = await fetch("/api/ziki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text + passportBlock,
          context: `You are Ziki — visual Chief Strategic Officer for ${artistName} inside Omniv. Trained on artist management: verify market demand before spend, rank cities and rooms from real fan intent, protect the artist from vanity metrics and wasted budget. Never invent demo artists.\n\nARTIST BRAIN:\n${context}\n\nNever use # markdown headings. Speak like a sharp CSO / manager: short, decisive, demand-first. Give exact posts, hooks, shot lists when advising content.\n\nRecent:\n${history}`,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };
      const reply =
        data.reply ||
        data.error ||
        "Ziki could not reach the model. Check API keys, then retry.";
      const asst: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
      };
      const final = [...next, asst];
      setMessages(final);
      if (activeId) persist(activeId, final);
    } catch {
      const asst: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "Connection failed. Try again.",
        createdAt: Date.now(),
      };
      setMessages([...next, asst]);
    } finally {
      setBusy(false);
      setAttachments([]);
    }
  }

  function newChat() {
    const t = createThread(welcomeMsg(artistName));
    setActiveIdState(t.id);
    setMessages(t.messages);
    setThreads(loadThreads());
    setHistoryOpen(false);
  }

  function openThread(id: string) {
    const th = loadThreads().find((x) => x.id === id);
    if (!th) return;
    setActiveIdState(id);
    setMessages(th.messages);
    setHistoryOpen(false);
  }

  function removeThread(id: string) {
    deleteThread(id);
    setThreads(loadThreads());
    if (activeId === id) newChat();
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const id = uid();
    setAttachments((a) => [
      ...a,
      { id, name: file.name, type: file.type, analyzing: true },
    ]);
    try {
      const passport = await analyzeAudioFile(file);
      setAttachments((a) =>
        a.map((x) =>
          x.id === id ? { ...x, passport, analyzing: false } : x
        )
      );
    } catch {
      setAttachments((a) =>
        a.map((x) => (x.id === id ? { ...x, analyzing: false } : x))
      );
    }
  }

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-omniv-text-muted">
        Loading Ziki…
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] md:h-dvh">
      <aside
        className={cn(
          "w-64 shrink-0 border-r border-omniv-border bg-omniv-elevated p-2",
          historyOpen ? "block" : "hidden md:block"
        )}
      >
        <Button className="mb-2 w-full gap-1.5" size="sm" onClick={newChat}>
          <Plus className="h-3.5 w-3.5" /> New brief
        </Button>
        <div className="space-y-1 overflow-y-auto">
          {threads.map((th) => (
            <div
              key={th.id}
              className={cn(
                "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px]",
                activeId === th.id
                  ? "bg-omniv-gold/15 text-omniv-gold"
                  : "text-omniv-text-muted hover:bg-white/5"
              )}
            >
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left"
                onClick={() => openThread(th.id)}
              >
                <MessageSquare className="mr-1 inline h-3 w-3" />
                {th.title}
              </button>
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => removeThread(th.id)}
                aria-label="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-omniv-border px-3 py-2">
          <button
            type="button"
            className="md:hidden"
            onClick={() => setHistoryOpen((v) => !v)}
            aria-label="History"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <span className="text-[13px] font-semibold">Ziki</span>
          <Badge variant="gold">Visual CSO</Badge>
          <span className="text-[11px] text-omniv-text-muted">
            Trained on artist management
          </span>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-2xl rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-omniv-gold/15 text-omniv-text"
                  : "bg-omniv-elevated text-omniv-text-secondary"
              )}
            >
              {m.role === "assistant" ? (
                <>
                  <RichText content={m.content} />
                  <MessageActions content={m.content} />
                </>
              ) : (
                m.content
              )}
            </div>
          ))}
          {busy && (
            <p className="flex items-center gap-2 text-xs text-omniv-text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Ziki thinking…
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        {!messages.some((m) => m.role === "user") && (
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="rounded-full border border-omniv-border px-2.5 py-1 text-[11px] text-omniv-text-muted hover:border-omniv-gold/40 hover:text-omniv-gold"
                onClick={() => setInput(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pb-1">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-omniv-border px-2 py-1 text-[11px]"
              >
                {a.name}
                {a.analyzing && " · analyzing…"}
                {a.passport && (
                  <TrackWaveform passport={a.passport} className="mt-1" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-omniv-border p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-omniv-border bg-omniv-elevated px-2 py-2">
            <label className="cursor-pointer p-2 text-omniv-text-muted hover:text-omniv-gold">
              <Paperclip className="h-4 w-4" />
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={onFile}
              />
            </label>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Brief Ziki like a CSO…"
              className="max-h-32 flex-1 resize-none bg-transparent text-[13px] outline-none"
            />
            <Button
              size="sm"
              className="h-9 w-9 shrink-0 rounded-xl p-0"
              disabled={busy || !input.trim()}
              onClick={() => void send()}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
