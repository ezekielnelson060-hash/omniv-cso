"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

function sanitizePasteHtml(html: string): string {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    // Strip scripts/styles
    doc.querySelectorAll("script,style,meta,link").forEach((n) => n.remove());
    const allowed = new Set([
      "P",
      "BR",
      "STRONG",
      "B",
      "EM",
      "I",
      "U",
      "S",
      "H1",
      "H2",
      "H3",
      "BLOCKQUOTE",
      "UL",
      "OL",
      "LI",
      "A",
      "DIV",
      "SPAN",
    ]);
    const walk = (node: Node) => {
      const kids = Array.from(node.childNodes);
      for (const child of kids) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;
          if (!allowed.has(el.tagName)) {
            // unwrap unknown tags
            while (el.firstChild) el.parentNode?.insertBefore(el.firstChild, el);
            el.remove();
            continue;
          }
          // strip style/class noise from paste
          el.removeAttribute("style");
          el.removeAttribute("class");
          if (el.tagName === "A") {
            const href = el.getAttribute("href") || "";
            if (!/^https?:\/\//i.test(href)) el.removeAttribute("href");
            else {
              el.setAttribute("rel", "noopener noreferrer");
              el.setAttribute("target", "_blank");
            }
          }
          walk(el);
        }
      }
    };
    walk(doc.body);
    // Normalize divs to paragraphs when empty-ish
    let out = doc.body.innerHTML
      .replace(/<div><br\s*\/?><\/div>/gi, "<p><br></p>")
      .replace(/<div>/gi, "<p>")
      .replace(/<\/div>/gi, "</p>");
    if (!out.trim()) return "";
    return out;
  } catch {
    return "";
  }
}

function isEmptyHtml(html: string) {
  const t = (html || "")
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
  return !t;
}

function ToolBtn({
  label,
  title,
  active,
  onClick,
}: {
  label: React.ReactNode;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        // keep selection in editor
        e.preventDefault();
        onClick();
      }}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-[13px] font-medium transition ${
        active
          ? "bg-omniv-gold/20 text-omniv-gold"
          : "text-zinc-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export function BodyEditor({
  value,
  onChange,
  placeholder,
  rows = 14,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastEmitted = useRef(value || "");
  const focused = useRef(false);
  const [empty, setEmpty] = useState(() => isEmptyHtml(value || ""));
  const minH = Math.max(280, rows * 24);

  // Sync external value when not focused
  useEffect(() => {
    if (focused.current) return;
    const el = editorRef.current;
    if (!el) return;
    const next = value || "";
    if (next !== lastEmitted.current) {
      el.innerHTML = next || "";
      lastEmitted.current = next;
      setEmpty(isEmptyHtml(next));
    }
  }, [value]);

  // Initial mount
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (!el.innerHTML && value) {
      el.innerHTML = value;
      lastEmitted.current = value;
      setEmpty(isEmptyHtml(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    let html = el.innerHTML;
    if (isEmptyHtml(html)) html = "";
    lastEmitted.current = html;
    setEmpty(!html);
    onChange(html);
  }, [onChange]);

  function exec(cmd: string, arg?: string) {
    editorRef.current?.focus();
    try {
      // document.execCommand is still the practical path for light editors
      document.execCommand(cmd, false, arg);
    } catch {
      /* ignore */
    }
    emit();
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData.getData("text/plain");
    let insert = "";
    if (html) insert = sanitizePasteHtml(html);
    if (!insert && plain) insert = plainTextToHtml(plain);
    if (!insert) return;
    try {
      document.execCommand("insertHTML", false, insert);
    } catch {
      const el = editorRef.current;
      if (el) el.innerHTML = (el.innerHTML || "") + insert;
    }
    emit();
  }

  function onImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      if (!text.trim()) return;
      const asHtml = plainTextToHtml(text);
      const el = editorRef.current;
      if (el) {
        el.innerHTML = asHtml;
        lastEmitted.current = asHtml;
        setEmpty(false);
        onChange(asHtml);
      }
    };
    reader.readAsText(file);
  }

  function addLink() {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    exec("createLink", href);
  }

  const ph =
    placeholder ||
    "Tell the story. Write the way you want it to read on the page.";

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0a0a0a] ring-1 ring-white/[0.09]">
      {/* Format bar — single clean row */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-white/[0.07] bg-[#0e0e0e] px-2 py-1.5">
        <ToolBtn label={<span className="text-[12px] font-bold">H2</span>} title="Heading" onClick={() => exec("formatBlock", "h2")} />
        <ToolBtn label={<span className="text-[12px] font-semibold">H3</span>} title="Subheading" onClick={() => exec("formatBlock", "h3")} />
        <ToolBtn label={<span className="text-[12px]">¶</span>} title="Paragraph" onClick={() => exec("formatBlock", "p")} />
        <span className="mx-1 h-4 w-px bg-white/10" />
        <ToolBtn label={<span className="font-bold">B</span>} title="Bold" onClick={() => exec("bold")} />
        <ToolBtn label={<span className="italic">I</span>} title="Italic" onClick={() => exec("italic")} />
        <ToolBtn label={<span className="underline">U</span>} title="Underline" onClick={() => exec("underline")} />
        <span className="mx-1 h-4 w-px bg-white/10" />
        <ToolBtn label="“”" title="Quote" onClick={() => exec("formatBlock", "blockquote")} />
        <ToolBtn label="•" title="Bullet list" onClick={() => exec("insertUnorderedList")} />
        <ToolBtn label="1." title="Numbered list" onClick={() => exec("insertOrderedList")} />
        <ToolBtn label="🔗" title="Link" onClick={addLink} />
        <span className="mx-1 h-4 w-px bg-white/10" />
        <label className="ml-auto cursor-pointer rounded-lg px-2 py-1.5 text-[11px] font-medium text-omniv-gold hover:bg-omniv-gold/10">
          Import
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportFile(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {/* Writing surface */}
      <div className="relative">
        {empty && (
          <p className="pointer-events-none absolute left-5 top-5 max-w-[90%] text-[17px] leading-[1.8] text-zinc-600">
            {ph}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline
          spellCheck
          suppressContentEditableWarning
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={() => {
            focused.current = false;
            emit();
          }}
          onInput={() => emit()}
          onPaste={onPaste}
          className="omniv-editor min-h-[280px] w-full resize-y overflow-y-auto px-5 py-5 text-[17px] leading-[1.85] text-zinc-100 outline-none"
          style={{ minHeight: minH }}
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .omniv-editor h1{font-size:1.55rem;font-weight:700;margin:1.1rem 0 .45rem;color:#fff;line-height:1.25}
          .omniv-editor h2{font-size:1.3rem;font-weight:650;margin:1rem 0 .4rem;color:#fff;line-height:1.3}
          .omniv-editor h3{font-size:1.1rem;font-weight:600;margin:.85rem 0 .35rem;color:#f4f4f5}
          .omniv-editor p{margin:.55rem 0}
          .omniv-editor ul{list-style:disc;padding-left:1.35rem;margin:.55rem 0}
          .omniv-editor ol{list-style:decimal;padding-left:1.35rem;margin:.55rem 0}
          .omniv-editor li{margin:.2rem 0}
          .omniv-editor blockquote{
            margin:.9rem 0;padding:.35rem 0 .35rem 1rem;
            border-left:3px solid rgba(212,175,55,.65);
            color:#d4d4d8;font-style:italic;
          }
          .omniv-editor a{color:#d4af37;text-decoration:underline}
          .omniv-editor b,.omniv-editor strong{font-weight:700;color:#fff}
          .omniv-editor:focus{outline:none}
        `,
        }}
      />
    </div>
  );
}
