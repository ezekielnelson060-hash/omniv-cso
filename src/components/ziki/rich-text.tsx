"use client";

import { cn } from "@/lib/utils";

export function RichText({ text, dark }: { text: string; dark?: boolean }) {
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\n#{1,6}\s+/g, "\n");
  const lines = cleaned.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;
        const full = /^\*\*(.+?)\*\*$/.exec(trimmed);
        if (full) {
          return (
            <p
              key={i}
              className={cn(
                "mt-1.5 text-[13px] font-semibold tracking-tight first:mt-0",
                dark ? "text-omniv-black" : "text-omniv-text"
              )}
            >
              {full[1]}
            </p>
          );
        }
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p
            key={i}
            className={cn(
              "text-[13px] leading-snug",
              dark ? "text-omniv-black/90" : "text-omniv-text-secondary"
            )}
          >
            {parts.map((part, j) => {
              if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
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
