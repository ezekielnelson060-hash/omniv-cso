"use client";

import { useEffect, useRef, useState } from "react";

function escapeText(s: string) {
  return s
    .split("&").join("&" + "amp;")
    .split("<").join("&" + "lt;")
    .split(">").join("&" + "gt;");
}

function plainTextToHtml(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return normalized
    .split(/\n{2,}/)
    .map((part) => {
      const trimmed = part.replace(/^\n+|\n+$/g, "");
      if (!trimmed) return "";
      return "<p>" + escapeText(trimmed).split("\n").join("<br>") + "</p>";
    })
    .filter(Boolean)
    .join("");
}

function htmlToPlainText(html: string): string {
  try {
    const d = new DOMParser().parseFromString(html || "", "text/html");
    const t = d.body.innerText || d.body.textContent || "";
    return t.replace(/\u00a0/g, " ").trimEnd();
  } catch {
    return (html || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ");
  }
}

export function BodyEditor({
  value,
  onChange,
  placeholder,
  rows = 12,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const minH = Math.max(180, rows * 22);
  const lastEmitted = useRef<string>(value || "");
  const focused = useRef(false);
  const [plainDraft, setPlainDraft] = useState(() => htmlToPlainText(value || ""));

  useEffect(() => {
    if (focused.current) return;
    const fromParent = htmlToPlainText(value || "");
    if (fromParent !== plainDraft && value !== lastEmitted.current) {
      setPlainDraft(fromParent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function emitHtml(html: string) {
    lastEmitted.current = html;
    onChange(html);
  }

  function onImportTextFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      if (!text.trim()) return;
      setPlainDraft(text);
      const asHtml = plainTextToHtml(text);
      lastEmitted.current = asHtml;
      onChange(asHtml);
    };
    reader.readAsText(file);
  }

  function onPlainPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const plain = e.clipboardData?.getData("text/plain") || "";
    const html = e.clipboardData?.getData("text/html") || "";
    const text = plain || (html ? htmlToPlainText(html) : "");
    if (!text) return;
    e.preventDefault();
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const next = ta.value.slice(0, start) + text + ta.value.slice(end);
    setPlainDraft(next);
    emitHtml(plainTextToHtml(next));
    requestAnimationFrame(() => {
      try {
        const caret = start + text.length;
        ta.setSelectionRange(caret, caret);
      } catch {
        /* ignore */
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-white/[0.1] bg-[#0a0a0a]">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-white/[0.08] bg-[#121212] px-2 py-1.5">
        <span className="h-8 rounded-lg px-2 text-[11px] font-medium leading-8 bg-omniv-gold/20 text-omniv-gold">
          Plain
        </span>
        <label
          className="inline-flex h-8 cursor-pointer items-center rounded-lg px-2 text-[11px] font-medium text-zinc-400 hover:bg-white/10 hover:text-white"
          title="Import a .txt or .md file"
        >
          Import
          <input
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportTextFile(f);
              e.target.value = "";
            }}
          />
        </label>
        <span className="px-1 text-[11px] text-zinc-500">
          Paste from Google Docs works here
        </span>
      </div>
      <textarea
        ref={taRef}
        value={plainDraft}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
        }}
        onChange={(e) => {
          const plain = e.target.value;
          setPlainDraft(plain);
          emitHtml(plainTextToHtml(plain));
        }}
        onPaste={onPlainPaste}
        placeholder={placeholder || "Paste or write here…"}
        rows={rows}
        className="w-full resize-y bg-transparent px-4 py-3 text-[15px] leading-[1.7] text-zinc-100 outline-none placeholder:text-zinc-600"
        style={{ minHeight: minH, color: "#f4f4f5" }}
      />
    </div>
  );
}
