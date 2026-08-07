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
  "Stress-test my next release window",
  "What should I post this week?",
  "Draft a 7-day execution plan",
];

function welcomeMsg(name: string): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content: `Hey — I'm **Ziki**, strategy for **${name}**.\n\nAsk anything the way you would a manager: market reads, release timing, a track critique, what to post this week. Attach a demo when you want me to listen.\n\nNo scripts. Just the highest-leverage next move.`,
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
    (async () => {
      const [brain, profile] = await Promise.all([getArtistBrain(), getProfile()]);
      const name =
        brain?.stageName || brain?.name || profile?.full_name || "your project";
      setArtistName(name);
      const platforms = profile?.platforms || [];
      const interests = profile?.interests || [];
      const scores = computeScoresFromBrain(brain, platforms);
      const recs = buildRecommendationsFromBrain(brain, platforms, interests);
      setContext(
        [
          `Artist: ${name}`,
          `Genre: ${brain?.genre?.join(", ") || "not set"}`,
          `Stage: ${brain?.careerStage || "emerging"}`,
          `Style: ${brain?.musicStyle || "n/a"}`,
          `Big Dream: ${brain?.bigDream || brain?.goals?.[0] || "n/a"}`,
          `Goals: ${brain?.goals?.join("; ") || "n/a"}`,
          `Platforms: ${platforms.join(", ") || "none"}`,
          `Scores: overall ${scores.overall}, momentum ${scores.momentum}, release ${scores.releaseReadiness}`,
          `Top moves: ${recs
            .slice(0, 5)
            .map((r) => r.title)
            .join(" | ")}`,
        ].join("\n")
      );

      let list = loadThreads();
      let id = getActiveId();
      if (!id || !list.find((x) => x.id === id)) {
        const th = createThread("New chat");
        list = loadThreads();
        id = th.id;
      }
      setThreads(list);
      setActiveIdState(id);
      const active = list.find((x) => x.id === id);
      if (active && active.messages.length > 0) {
        setMessages(active.messages);
      } else {
        const welcome = [welcomeMsg(name)];
        setMessages(welcome);
        if (id) persist(id, welcome, "New chat");
      }
      setReady(true);
    })();
  }, [persist]);

  useEffect(() => {
    if (!ready || bootstrapped.current || !activeId) return;
    const act = consumeAct();
    if (act) {
      bootstrapped.current = true;
      void send(
        `Help me execute this opportunity:\n\n**${act.title}**\n${act.summary || ""}\n\nWhy: ${act.why || "n/a"}\nExpected: ${act.expectedOutcome || "n/a"}\n\nGive a concrete 7-day plan with exact posts and timing.`,
        true
      );
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
    const th = loadThreads().find((x) => x.id === id);
    if (!th) return;
    setActiveIdState(id);
    localStorage.setItem("omniv_ziki_active_v1", id);
    setMessages(th.messages.length > 0 ? th.messages : [welcomeMsg(artistName)]);
    setHistoryOpen(false);
  }

  function newChat() {
    const th = createThread("New chat");
    const welcome = [welcomeMsg(artistName)];
    setThreads(loadThreads());
    setActiveIdState(th.id);
    setMessages(welcome);
    persist(th.id, welcome, "New chat");
    setHistoryOpen(false);
  }

  async function onPickFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 4);
    if (!files.length) return;
    const INLINE_MAX = 12 * 1024 * 1024;
    const HARD_MAX = 50 * 1024 * 1024;
    const next: typeof attachments = [];

    for (const f of files) {
      const id = `${Date.now()}-${f.name}`;
      if (f.size > HARD_MAX) {
        next.push({ id, name: `${f.name} (max 50MB)`, type: f.type || "file" });
        continue;
      }
      const isAudio =
        (f.type || "").startsWith("audio/") ||
        /\.(mp3|wav|m4a|flac|aac|ogg)$/i.test(f.name);
      const url = isAudio ? URL.createObjectURL(f) : undefined;

      if (f.size > INLINE_MAX) {
        next.push({
          id,
          name: f.name,
          type: f.type || "file",
          url,
          uploading: true,
          analyzing: isAudio,
          passport: null,
        });
        setAttachments((prev) => [...prev, ...next].slice(0, 4));
        next.length = 0;
        void (async () => {
          try {
            const fd = new FormData();
            fd.append("file", f);
            const res = await fetch("/api/ziki/upload", { method: "POST", body: fd });
            const data = (await res.json()) as { fileUri?: string; mimeType?: string };
            if (!res.ok || !data.fileUri) {
              setAttachments((prev) =>
                prev.map((a) =>
                  a.id === id
                    ? {
                        ...a,
                        uploading: false,
                        analyzing: false,
                        name: `${f.name} (upload failed)`,
                      }
                    : a
                )
              );
              return;
            }
            setAttachments((prev) =>
              prev.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      fileUri: data.fileUri,
                      type: data.mimeType || a.type,
                      uploading: false,
                    }
                  : a
              )
            );
          } catch {
            setAttachments((prev) =>
              prev.map((a) =>
                a.id === id
                  ? {
                      ...a,
                      uploading: false,
                      analyzing: false,
                      name: `${f.name} (upload failed)`,
                    }
                  : a
              )
            );
          }
        })();
        if (isAudio) {
          void analyzeAudioFile(f).then((passport) => {
            setAttachments((prev) =>
              prev.map((a) => (a.id === id ? { ...a, passport, analyzing: false } : a))
            );
          });
        }
        continue;
      }

      const data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || "");
          const comma = result.indexOf(",");
          resolve(comma > 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => resolve("");
        reader.readAsDataURL(f);
      });

      next.push({
        id,
        name: f.name,
        type: f.type || "file",
        data: data || undefined,
        url,
        analyzing: isAudio,
        passport: null,
      });
      if (isAudio) {
        void analyzeAudioFile(f).then((passport) => {
          setAttachments((prev) =>
            prev.map((a) => (a.id === id ? { ...a, passport, analyzing: false } : a))
          );
        });
      }
    }
    if (next.length) setAttachments((prev) => [...prev, ...next].slice(0, 4));
    e.target.value = "";
  }

  async function send(text: string, fromAct = false) {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || busy) return;
    const readyFiles = attachments.filter((a) => a.data || a.fileUri);
    const passports = attachments
      .map((a) => a.passport)
      .filter((p): p is AudioPassport => Boolean(p));
    const passportBlock =
      passports.length > 0
        ? "\n\n" + passports.map((p) => formatPassportForZiki(p)).join("\n\n")
        : "";
    const attachNote =
      attachments.length > 0
        ? `\n\n[Attached: ${attachments.map((a) => a.name).join(", ")}].${
            readyFiles.some((a) => (a.type || "").startsWith("audio/"))
              ? " Listen and assess for this artist."
              : ""
          }${passportBlock}`
        : "";
    const payload =
      `${trimmed}${attachNote}`.trim() || "Assess the attached media for my career.";
    const threadId = activeId || createThread().id;
    if (!activeId) setActiveIdState(threadId);

    const userDisplay =
      attachments.length > 0
        ? `${trimmed || "Attached media"}\n\n📎 ${attachments.map((a) => a.name).join(", ")}`
        : payload;
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: userDisplay,
      createdAt: Date.now(),
    };
    const withUser =
      messages.length === 1 && messages[0]?.id === "welcome"
        ? [...messages, userMsg]
        : [...messages, userMsg];

    setMessages(withUser);
    setInput("");
    const attachmentPayload = readyFiles.map((a) => ({
      name: a.name,
      mimeType: a.type || "application/octet-stream",
      ...(a.fileUri ? { fileUri: a.fileUri } : { data: a.data as string }),
    }));
    attachments.forEach((a) => {
      if (a.url) {
        try {
          URL.revokeObjectURL(a.url);
        } catch {
          /* noop */
        }
      }
    });
    setAttachments([]);
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
          message: payload,
          history,
          attachments: attachmentPayload.length ? attachmentPayload : undefined,
          context: `You are Ziki, Virtual CSO for ${artistName} inside Omniv. Never invent demo artists.\n\nARTIST BRAIN:\n${context}\n\nNever use # markdown headings. Give exact posts, hooks, shot lists when advising content. Natural manager chat.\n\nRecent:\n${history}`,
        }),
      });
      const data = (await res.json()) as { text?: string };
      const fullText =
        data.text ||
        "Ziki could not reach the model. Check API keys, then retry.";
      const assistantId = uid();
      setMessages([
        ...withUser,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          createdAt: Date.now(),
        },
      ]);
      await new Promise<void>((resolve) => {
        let i = 0;
        const step = Math.max(2, Math.floor(fullText.length / 90));
        const tick = () => {
          i = Math.min(fullText.length, i + step);
          const slice = fullText.slice(0, i);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: slice } : m
            )
          );
          if (i >= fullText.length) {
            const final = [
              ...withUser,
              {
                id: assistantId,
                role: "assistant" as const,
                content: fullText,
                createdAt: Date.now(),
              },
            ];
            persist(
              threadId,
              final,
              fromAct ? trimmed.slice(0, 48) : titleFromMessages(final)
            );
            resolve();
            return;
          }
          setTimeout(tick, 14);
        };
        tick();
      });
    } catch {
      const assistant: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: `Could not complete that reply for **${artistName}**. Try again.`,
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
          <aside className="absolute left-0 top-0 z-30 flex h-full w-[220px] flex-col border-r border-omniv-border bg-omniv-elevated md:relative md:z-0">
            <div className="flex items-center justify-between border-b border-omniv-border px-2.5 py-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
                Chats
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 text-[11px]"
                onClick={newChat}
              >
                <Plus className="h-3 w-3" />
                New
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5">
              {threads.map((th) => (
                <div
                  key={th.id}
                  className={cn(
                    "group mb-0.5 flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px]",
                    th.id === activeId
                      ? "bg-omniv-gold/10 text-omniv-gold"
                      : "text-omniv-text-secondary hover:bg-white/[0.04]"
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left"
                    onClick={() => openThread(th.id)}
                  >
                    <MessageSquare className="mr-1 inline h-3 w-3 opacity-60" />
                    {th.title}
                  </button>
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100"
                    aria-label="Delete"
                    onClick={() => {
                      deleteThread(th.id);
                      const next = loadThreads();
                      setThreads(next);
                      if (th.id === activeId) {
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-omniv-border bg-omniv-black/95 px-2.5 py-2 backdrop-blur-md md:px-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-omniv-border text-omniv-text-muted hover:text-omniv-text"
              aria-label="Chat history"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-omniv-gold/15 font-data text-xs font-bold text-omniv-gold">
              Z
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold">Ziki</span>
                <Badge variant="gold">CSO</Badge>
              </div>
              <p className="text-[10px] text-omniv-text-muted">{artistName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-[11px]"
            onClick={newChat}
          >
            <Plus className="h-3 w-3" />
            New
          </Button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-3 px-3 py-3 md:px-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15 font-data text-[10px] font-bold text-omniv-gold">
                    Z
                  </div>
                )}
                <div className="group flex max-w-[min(100%,640px)] flex-col gap-1">
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 text-[13px] leading-snug",
                      msg.role === "user"
                        ? "bg-omniv-gold text-omniv-black"
                        : "border border-omniv-border bg-omniv-card"
                    )}
                  >
                    <RichText text={msg.content} dark={msg.role === "user"} />
                  </div>
                  {msg.role === "assistant" && msg.id !== "welcome" && msg.content && (
                    <MessageActions content={msg.content} />
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-[11px] text-omniv-text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-omniv-gold" />
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="sticky bottom-0 z-20 shrink-0 border-t border-omniv-border bg-omniv-elevated/95 px-2.5 py-2 backdrop-blur-xl supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))] md:px-3">
          <div className="mx-auto max-w-3xl">
            {showSuggestions && (
              <div className="mb-2 flex flex-wrap gap-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-omniv-border/80 bg-omniv-card/50 px-2.5 py-1 text-[10px] text-omniv-text-muted hover:border-omniv-gold/30 hover:text-omniv-gold"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {attachments.length > 0 && (
              <div className="mb-1.5 space-y-1.5">
                {attachments
                  .filter((a) => a.url)
                  .map((a) => (
                    <TrackWaveform
                      key={a.id}
                      url={a.url as string}
                      name={a.name}
                      passport={a.passport}
                      analyzing={a.analyzing || a.uploading}
                      onRemove={() => {
                        if (a.url) {
                          try {
                            URL.revokeObjectURL(a.url);
                          } catch {
                            /* noop */
                          }
                        }
                        setAttachments((prev) => prev.filter((x) => x.id !== a.id));
                      }}
                    />
                  ))}
                {attachments.some((a) => !a.url) && (
                  <div className="flex flex-wrap gap-1">
                    {attachments
                      .filter((a) => !a.url)
                      .map((a) => (
                        <span
                          key={a.id}
                          className="inline-flex items-center gap-1 rounded-full border border-omniv-border bg-omniv-card px-2 py-0.5 text-[10px]"
                        >
                          <Paperclip className="h-3 w-3 text-omniv-gold" />
                          <span className="max-w-[140px] truncate">{a.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setAttachments((prev) =>
                                prev.filter((x) => x.id !== a.id)
                              )
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-end gap-1.5">
              <label
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-omniv-border bg-omniv-card text-omniv-text-muted hover:border-omniv-gold/40 hover:text-omniv-gold"
                title="Add media"
              >
                <Plus className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="audio/*,image/*,video/*,.pdf,.txt,.mp3,.wav,.m4a,.flac,.aac,.ogg"
                  multiple
                  onChange={(e) => void onPickFiles(e)}
                />
              </label>
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
                placeholder="Ask anything…"
                className="max-h-28 min-h-9 flex-1 resize-none rounded-xl border border-omniv-border bg-omniv-card px-3 py-2 text-[13px] focus-gold"
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0 rounded-xl"
                disabled={
                  busy ||
                  attachments.some((a) => a.uploading) ||
                  (!input.trim() && attachments.length === 0)
                }
                onClick={() => void send(input)}
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1 text-center text-[9px] text-omniv-text-muted">
              + attach · Enter send · Shift+Enter newline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
