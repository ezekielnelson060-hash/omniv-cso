"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getArtistBrain } from "@/lib/db/profile";
import {
  computeScoresFromBrain,
  buildRecommendationsFromBrain,
} from "@/lib/strategy/scores";
import type { ChatMessage } from "@/types";
import { ArrowUp, Loader2, RotateCcw } from "lucide-react";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const SUGGESTIONS = [
  "What should I release next?",
  "What content should I post this week?",
  "What are my biggest opportunities?",
  "Draft a 7-day content plan",
];

/** Render **bold** and simple line breaks for executive briefings */
function RichText({ text, dark }: { text: string; dark?: boolean }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const heading = /^(#{1,3}\s+)?(\*\*[^*]+\*\*)/.test(line.trim());
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

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [artistName, setArtistName] = useState("your project");
  const [context, setContext] = useState("");
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const brain = await getArtistBrain();
      const name = brain?.stageName || brain?.name || "your project";
      setArtistName(name);
      const scores = computeScoresFromBrain(brain, []);
      const recs = buildRecommendationsFromBrain(brain, []);
      const ctx = `Artist: ${name}
Genre: ${brain?.genre?.join(", ") || "TBD"}
Stage: ${brain?.careerStage || "emerging"}
Goals: ${brain?.goals?.join("; ") || "n/a"}
Strengths: ${brain?.strengths?.join("; ") || "n/a"}
Gaps: ${brain?.weaknesses?.join("; ") || "n/a"}
Scores: overall ${scores.overall}, momentum ${scores.momentum}, release readiness ${scores.releaseReadiness}, content ${scores.contentHealth}
Top opportunities: ${recs
        .slice(0, 3)
        .map((r) => r.title)
        .join(" | ")}`;
      setContext(ctx);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `I'm **Ziki** — your AI Chief Strategy Officer for **${name}**.\n\nI am grounded in your Artist Brain and Command Center scores. Ask what to release, post, or prioritise this week.`,
          createdAt: Date.now(),
        },
      ]);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setMessages((m) => [
      ...m,
      { id: uid(), role: "user", content: trimmed, createdAt: Date.now() },
    ]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ziki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          context: `You are Ziki, CSO for ${artistName}. Never mention Nova Hex or any demo artist. Use only this profile:\n${context}\n\nAnswer as executive briefing with bold section headings (**What to do**, **Why**, **When**, **How**, **Priority**, **Expected outcome**).`,
        }),
      });
      const data = (await res.json()) as { text?: string };
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          content:
            data.text ||
            "Ziki could not reach the model. Check GEMINI_API_KEY, then retry.",
          createdAt: Date.now(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          content: `**Connection issue**\n\nI could not complete that briefing for **${artistName}**. Check your network and Gemini key, then ask again.`,
          createdAt: Date.now(),
        },
      ]);
    }
    setBusy(false);
  }

  const showSuggestions =
    ready && messages.length <= 1 && !busy && !input.trim();

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-omniv-border bg-omniv-card">
      <div className="flex items-center justify-between border-b border-omniv-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-omniv-gold/15 font-data text-xs font-bold text-omniv-gold">
            Z
          </div>
          <span className="text-sm font-medium">Ziki</span>
          <Badge variant="gold">CSO</Badge>
          <span className="hidden text-[11px] text-omniv-text-muted sm:inline">
            · {artistName}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setMessages([
              {
                id: "welcome",
                role: "assistant",
                content: `I'm **Ziki** — your AI Chief Strategy Officer for **${artistName}**. Ask what to release, post, or prioritise this week.`,
                createdAt: Date.now(),
              },
            ])
          }
          className="gap-1"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="relative flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15 font-data text-[11px] font-bold text-omniv-gold">
                Z
              </div>
            )}
            <div
              className={cn(
                "max-w-[min(100%,560px)] rounded-[var(--radius-lg)] px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-omniv-gold text-omniv-black"
                  : "border border-omniv-border bg-omniv-elevated"
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

      <div className="border-t border-omniv-border p-3">
        {showSuggestions && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                className="rounded-full border border-omniv-border/80 bg-omniv-elevated/50 px-3 py-1.5 text-[11px] text-omniv-text-muted opacity-70 transition-opacity hover:border-omniv-gold/30 hover:text-omniv-gold hover:opacity-100"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
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
            className="min-h-11 flex-1 resize-none rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2.5 text-sm text-omniv-text placeholder:text-omniv-text-muted focus-gold"
          />
          <Button
            size="icon"
            disabled={busy || !input.trim()}
            onClick={() => void send(input)}
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
