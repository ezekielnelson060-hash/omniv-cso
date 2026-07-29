"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  mockArtistBrain,
  simulateZikiReply,
  zikiSuggestions,
} from "@/data/mock";
import type { ChatMessage } from "@/types";
import { ArrowUp, Loader2, Sparkles, User, RotateCcw } from "lucide-react";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `I'm **Ziki** — your AI Chief Strategy Officer for **${mockArtistBrain.stageName ?? mockArtistBrain.name}**. Ask what to release, post, or prioritise this week.`,
  createdAt: Date.now(),
};

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    await new Promise((r) => setTimeout(r, 600));
    setMessages((m) => [
      ...m,
      {
        id: uid(),
        role: "assistant",
        content: simulateZikiReply(trimmed),
        createdAt: Date.now(),
      },
    ]);
    setBusy(false);
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-omniv-border bg-omniv-card">
      <div className="flex items-center justify-between border-b border-omniv-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-omniv-gold" />
          <span className="text-sm font-medium">Ziki</span>
          <Badge variant="gold">CSO</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMessages([WELCOME])}
          className="gap-1"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-omniv-gold/15">
                <Sparkles className="h-3.5 w-3.5 text-omniv-gold" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[min(100%,560px)] whitespace-pre-wrap rounded-[var(--radius-lg)] px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-omniv-gold text-omniv-black"
                  : "border border-omniv-border bg-omniv-elevated text-omniv-text-secondary"
              )}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-xs text-omniv-text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-omniv-gold" />
            Ziki is thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-omniv-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {zikiSuggestions.slice(0, 4).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="rounded-full border border-omniv-border px-2.5 py-1 text-[11px] text-omniv-text-muted hover:border-omniv-gold/30 hover:text-omniv-gold"
            >
              {s}
            </button>
          ))}
        </div>
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
            placeholder="Ask Ziki for the next move…"
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
