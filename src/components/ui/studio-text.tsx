"use client";

import { cn } from "@/lib/utils";

/** Renders model output with real weight on headings; no visible ** markers. */
export function StudioText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  return (
    <div className={cn("space-y-2 text-[13px] leading-relaxed", className)}>
      {lines.map((raw, i) => {
        const line = raw.trimEnd();
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        const fullHeading = /^\*\*(.+?)\*\*$/.exec(trimmed);
        if (fullHeading) {
          return (
            <p
              key={i}
              className="pt-2 text-[13px] font-semibold tracking-tight text-omniv-text first:pt-0"
            >
              {fullHeading[1]}
            </p>
          );
        }

        const labeled = /^\*\*(.+?)\*\*\s*:?\s*(.*)$/.exec(trimmed);
        if (labeled && labeled[1].length < 48) {
          return (
            <p key={i} className="text-omniv-text-secondary">
              <span className="font-semibold text-omniv-text">{labeled[1]}</span>
              {labeled[2] ? (
                <>
                  {": "}
                  <InlineMarks text={labeled[2]} />
                </>
              ) : null}
            </p>
          );
        }

        return (
          <p key={i} className="text-omniv-text-secondary">
            <InlineMarks text={trimmed} />
          </p>
        );
      })}
    </div>
  );
}

function InlineMarks({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={j} className="font-semibold text-omniv-text">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={j}>{part}</span>;
      })}
    </>
  );
}
