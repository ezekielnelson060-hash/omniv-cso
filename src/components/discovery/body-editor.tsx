"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Body editor with two modes:
 * - Rich (contentEditable): formatting toolbar
 * - Plain (textarea): always works for Google Docs / mobile paste
 *
 * Paste strategy for rich mode:
 * Prefer NOT blocking the browser. After native paste, strip black
 * colors and Docs chrome so text stays visible on the dark UI.
 * If clipboard exposes plain text from Docs, we replace with clean HTML.
 */

const ALLOWED_TAGS = new Set([
  "P", "BR", "DIV", "SPAN", "H1", "H2", "H3", "H4",
  "STRONG", "B", "EM", "I", "U", "S", "STRIKE",
  "UL", "OL", "LI", "BLOCKQUOTE", "A", "IMG",
  "PRE", "CODE", "SUB", "SUP", "HR",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(["href", "title", "target", "rel"]),
  IMG: new Set(["src", "alt", "title"]),
  SPAN: new Set(["style"]),
  P: new Set(["style"]),
  DIV: new Set(["style"]),
  H1: new Set(["style"]),
  H2: new Set(["style"]),
  H3: new Set(["style"]),
  H4: new Set(["style"]),
  BLOCKQUOTE: new Set(["style"]),
  LI: new Set(["style"]),
  PRE: new Set(["style"]),
  CODE: new Set(["style"]),
};

const STYLE_ALLOW =
  /^(font-weight|font-style|font-family|text-decoration|text-align)$/i;

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
      .replace(/&nbsp;/g, " ")
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">");
  }
}

function sanitizeStyle(style: string): string {
  return style
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((decl) => {
      const prop = decl.split(":")[0]?.trim() || "";
      if (/color|background|webkit-text-fill|webkit-text-stroke/i.test(prop))
        return false;
      return STYLE_ALLOW.test(prop);
    })
    .join("; ");
}

function sanitizeNode(node: Node, out: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return out.createTextNode(node.textContent || "");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as HTMLElement;
  const tag = el.tagName.toUpperCase();

  if (
    tag === "SCRIPT" ||
    tag === "STYLE" ||
    tag === "IFRAME" ||
    tag === "OBJECT" ||
    tag === "META" ||
    tag === "LINK"
  ) {
    return null;
  }

  if (
    (tag === "B" && (el.id || "").indexOf("docs-internal-guid") === 0) ||
    tag === "FONT"
  ) {
    const frag = out.createDocumentFragment();
    Array.from(el.childNodes).forEach((child) => {
      const clean = sanitizeNode(child, out);
      if (clean) frag.appendChild(clean);
    });
    return frag;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    const frag = out.createDocumentFragment();
    Array.from(el.childNodes).forEach((child) => {
      const clean = sanitizeNode(child, out);
      if (clean) frag.appendChild(clean);
    });
    return frag;
  }

  const cleanEl = out.createElement(tag.toLowerCase());
  const allowed = ALLOWED_ATTRS[tag];
  if (allowed) {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (!allowed.has(attr.name.toUpperCase()) && !allowed.has(name)) continue;
      if (name === "href" || name === "src") {
        const v = attr.value.trim();
        if (/^javascript:/i.test(v)) continue;
        if (name === "src" && !/^(https?:|data:image\/)/i.test(v)) continue;
        if (name === "href" && !/^(https?:|mailto:|\/|#)/i.test(v)) continue;
        cleanEl.setAttribute(name, v);
        if (name === "href") {
          cleanEl.setAttribute("rel", "noopener noreferrer");
          cleanEl.setAttribute("target", "_blank");
        }
      } else if (name === "style") {
        const s = sanitizeStyle(attr.value);
        if (s) cleanEl.setAttribute("style", s);
      } else if (name === "alt" || name === "title") {
        cleanEl.setAttribute(name, attr.value);
      }
    }
  }

  Array.from(el.childNodes).forEach((child) => {
    const clean = sanitizeNode(child, out);
    if (clean) cleanEl.appendChild(clean);
  });

  return cleanEl;
}

function isExternalRichHtml(html: string): boolean {
  return /docs-internal-guid|google-docs|docs\.google|schemas-microsoft|urn:schemas-microsoft|MsoNormal|mso-|Apple-converted-space|Apple-interchange|Word\.Document|xmlns:w=/i.test(
    html
  );
}

/** Strip Docs/Word colors and junk already in the live editor DOM. */
function cleanupEditorDom(editor: HTMLElement) {
  editor.querySelectorAll("[style]").forEach((node) => {
    const el = node as HTMLElement;
    const cleaned = sanitizeStyle(el.getAttribute("style") || "");
    if (cleaned) el.setAttribute("style", cleaned);
    else el.removeAttribute("style");
  });
  editor.querySelectorAll("[color], font").forEach((node) => {
    node.removeAttribute("color");
    node.removeAttribute("face");
    node.removeAttribute("size");
  });
  editor.querySelectorAll('b[id^="docs-internal-guid"]').forEach((wrap) => {
    const parent = wrap.parentNode;
    if (!parent) return;
    while (wrap.firstChild) parent.insertBefore(wrap.firstChild, wrap);
    parent.removeChild(wrap);
  });
  editor.style.color = "#f4f4f5";
}

function sanitizeHtmlString(html: string): string {
  try {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const out = document.implementation.createHTMLDocument("");
    const frag = out.createDocumentFragment();
    Array.from(parsed.body.childNodes).forEach((child) => {
      const clean = sanitizeNode(child, out);
      if (clean) frag.appendChild(clean);
    });
    const wrap = out.createElement("div");
    wrap.appendChild(frag);
    return wrap.innerHTML.trim();
  } catch {
    return "";
  }
}

const FONTS: { label: string; value: string }[] = [
  { label: "Default", value: "Instrument Sans, system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Classic", value: "'Times New Roman', Times, serif" },
  { label: "Mono", value: "'IBM Plex Mono', ui-monospace, monospace" },
  { label: "Rounded", value: "ui-rounded, system-ui, sans-serif" },
];

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
  const ref = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const minH = Math.max(180, rows * 22);
  const lastEmitted = useRef<string>(value || "");
  const focused = useRef(false);
  // Default to plain — native textarea paste always works with Google Docs
  const [mode, setMode] = useState<"rich" | "plain">("plain");
  const [plainDraft, setPlainDraft] = useState(() => htmlToPlainText(value || ""));

  // Sync rich editor from parent when not focused
  useEffect(() => {
    if (mode !== "rich") return;
    const el = ref.current;
    if (!el) return;
    if (focused.current) return;
    if (el.innerHTML !== value && value !== lastEmitted.current) {
      el.innerHTML = value || "";
      lastEmitted.current = value || "";
    }
  }, [value, mode]);

  // Keep plain draft in sync when parent value changes externally (e.g. edit load)
  useEffect(() => {
    if (mode !== "plain") return;
    if (focused.current) return;
    const fromParent = htmlToPlainText(value || "");
    if (fromParent !== plainDraft && value !== lastEmitted.current) {
      setPlainDraft(fromParent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, mode]);

  function emitHtml(html: string) {
    lastEmitted.current = html;
    onChange(html);
  }

  function emitFromRich() {
    const el = ref.current;
    if (!el) return;
    cleanupEditorDom(el);
    emitHtml(el.innerHTML);
  }

  function switchToPlain() {
    const el = ref.current;
    const html = el ? el.innerHTML : value;
    const plain = htmlToPlainText(html || value || "");
    setPlainDraft(plain);
    setMode("plain");
    const asHtml = plainTextToHtml(plain);
    lastEmitted.current = asHtml;
    onChange(asHtml);
  }

  function switchToRich() {
    const plain = plainDraft || htmlToPlainText(value || "");
    const html = plainTextToHtml(plain);
    setMode("rich");
    lastEmitted.current = html;
    onChange(html);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.innerHTML = html;
        cleanupEditorDom(el);
      }
    });
  }

  function cmd(command: string, arg?: string) {
    ref.current?.focus();
    try {
      document.execCommand(command, false, arg);
    } catch {
      /* ignore */
    }
    emitFromRich();
  }

  function block(tag: string) {
    ref.current?.focus();
    try {
      document.execCommand("formatBlock", false, tag);
    } catch {
      /* ignore */
    }
    emitFromRich();
  }

  function applyFont(font: string) {
    ref.current?.focus();
    try {
      document.execCommand("fontName", false, font);
    } catch {
      /* ignore */
    }
    emitFromRich();
  }

  function insertImageFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        if (dataUrl) cmd("insertImage", dataUrl);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  /**
   * Paste handler:
   * 1. If Google Docs / Office and plain text exists → insert clean plain (preventDefault)
   * 2. Otherwise let the browser paste natively, then cleanup colors
   */
  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;

    const plain = e.clipboardData?.getData("text/plain") || "";
    const html = e.clipboardData?.getData("text/html") || "";
    const external = isExternalRichHtml(html);

    if (plain && external) {
      e.preventDefault();
      e.stopPropagation();
      try {
        el.focus();
      } catch {
        /* ignore */
      }
      const ok = document.execCommand("insertText", false, plain);
      if (!ok) {
        const clean = plainTextToHtml(plain);
        const temp = document.createElement("div");
        temp.innerHTML = clean;
        while (temp.firstChild) el.appendChild(temp.firstChild);
      }
      cleanupEditorDom(el);
      emitFromRich();
      return;
    }

    if (plain && !html.trim()) {
      e.preventDefault();
      try {
        el.focus();
      } catch {
        /* ignore */
      }
      if (!document.execCommand("insertText", false, plain)) {
        const clean = plainTextToHtml(plain);
        const temp = document.createElement("div");
        temp.innerHTML = clean;
        while (temp.firstChild) el.appendChild(temp.firstChild);
      }
      cleanupEditorDom(el);
      emitFromRich();
      return;
    }

    window.setTimeout(() => {
      cleanupEditorDom(el);
      const sanitized = sanitizeHtmlString(el.innerHTML);
      if (sanitized && sanitized !== el.innerHTML) {
        el.innerHTML = sanitized;
      }
      cleanupEditorDom(el);
      emitFromRich();
    }, 0);
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
        <button
          type="button"
          title="Plain text — best for pasting from Google Docs"
          onClick={() => (mode === "plain" ? undefined : switchToPlain())}
          className={`h-8 rounded-lg px-2 text-[11px] font-medium ${
            mode === "plain"
              ? "bg-omniv-gold/20 text-omniv-gold"
              : "text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          Plain
        </button>
        <button
          type="button"
          title="Rich text — headings, bold, lists"
          onClick={() => (mode === "rich" ? undefined : switchToRich())}
          className={`h-8 rounded-lg px-2 text-[11px] font-medium ${
            mode === "rich"
              ? "bg-omniv-gold/20 text-omniv-gold"
              : "text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          Rich
        </button>
        <Sep />

        {mode === "rich" && (
          <>
            <Tool onClick={() => block("h1")} title="Heading 1" className="text-[13px] font-bold">
              H1
            </Tool>
            <Tool onClick={() => block("h2")} title="Heading 2" className="text-[12px] font-bold">
              H2
            </Tool>
            <Tool onClick={() => block("p")} title="Body" className="text-[12px]">
              ¶
            </Tool>
            <Tool onClick={() => block("blockquote")} title="Quote" className="text-[14px]">
              ”
            </Tool>
            <Sep />
            <select
              title="Font"
              defaultValue=""
              onChange={(e) => {
                const v = e.target.value;
                if (v) applyFont(v);
                e.target.value = "";
              }}
              className="h-8 max-w-[7.5rem] rounded-lg border-0 bg-white/5 px-1.5 text-[11px] text-zinc-300 outline-none hover:bg-white/10"
            >
              <option value="" disabled>
                Font
              </option>
              {FONTS.map((f) => (
                <option key={f.label} value={f.value} className="bg-[#121212] text-white">
                  {f.label}
                </option>
              ))}
            </select>
            <Sep />
            <Tool onClick={() => cmd("bold")} title="Bold" className="font-bold">
              B
            </Tool>
            <Tool onClick={() => cmd("italic")} title="Italic" className="italic">
              I
            </Tool>
            <Tool onClick={() => cmd("underline")} title="Underline" className="underline">
              U
            </Tool>
            <Tool onClick={() => cmd("strikeThrough")} title="Strikethrough" className="line-through">
              S
            </Tool>
            <Sep />
            <Tool onClick={() => cmd("insertUnorderedList")} title="Bullet list">
              •
            </Tool>
            <Tool onClick={() => cmd("insertOrderedList")} title="Numbered list">
              1.
            </Tool>
            <Sep />
            <Tool
              onClick={() => {
                const url = window.prompt("Link URL");
                if (url) cmd("createLink", url);
              }}
              title="Link"
            >
              🔗
            </Tool>
            <Tool onClick={insertImageFile} title="Insert image">
              ▣
            </Tool>
            <Tool onClick={() => cmd("removeFormat")} title="Clear formatting" className="text-[11px]">
              Tx
            </Tool>
          </>
        )}

        {mode === "plain" && (
          <span className="px-1 text-[11px] text-zinc-500">
            Paste from Google Docs works here
          </span>
        )}
      </div>

      {mode === "plain" ? (
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
      ) : (
        <>
          <div
            ref={ref}
            contentEditable
            role="textbox"
            aria-multiline
            data-placeholder={placeholder || "Start writing…"}
            suppressContentEditableWarning
            onInput={emitFromRich}
            onFocus={() => {
              focused.current = true;
            }}
            onBlur={() => {
              focused.current = false;
              emitFromRich();
            }}
            onPaste={onPaste}
            className="omniv-doc-editor w-full px-4 py-3 text-[15px] leading-[1.7] text-zinc-100 outline-none"
            style={{ minHeight: minH, color: "#f4f4f5" }}
          />
          <style
            dangerouslySetInnerHTML={{
              __html: `
        .omniv-doc-editor { color: #f4f4f5 !important; caret-color: #d4af37; }
        .omniv-doc-editor * { color: inherit !important; }
        .omniv-doc-editor h1{font-size:1.5rem;font-weight:700;margin:.75rem 0 .35rem;color:#fff !important}
        .omniv-doc-editor h2{font-size:1.2rem;font-weight:600;margin:.65rem 0 .3rem;color:#fff !important}
        .omniv-doc-editor h3{font-size:1.05rem;font-weight:600;margin:.55rem 0 .25rem;color:#f4f4f5 !important}
        .omniv-doc-editor p{margin:.35rem 0}
        .omniv-doc-editor ul{list-style:disc;padding-left:1.25rem;margin:.4rem 0}
        .omniv-doc-editor ol{list-style:decimal;padding-left:1.25rem;margin:.4rem 0}
        .omniv-doc-editor blockquote{
          margin:.75rem 0;padding:.35rem 0 .35rem 1rem;
          border-left:3px solid rgba(201,162,39,.7);
          color:#d4d4d8 !important;font-style:italic;
        }
        .omniv-doc-editor a{color:#c9a227 !important;text-decoration:underline}
        .omniv-doc-editor img{max-width:100%;border-radius:.75rem;margin:.5rem 0}
        .omniv-doc-editor b,.omniv-doc-editor strong{font-weight:700;color:#fff !important}
        .omniv-doc-editor pre,.omniv-doc-editor code{
          font-family:ui-monospace,monospace;font-size:.9em;
          background:rgba(255,255,255,.06);border-radius:.35rem;padding:.1em .35em;
        }
        .omniv-doc-editor pre{display:block;padding:.75rem 1rem;overflow-x:auto;margin:.5rem 0}
        .omniv-doc-editor:empty:before{content:attr(data-placeholder);color:#52525b;pointer-events:none}
      `,
            }}
          />
        </>
      )}
    </div>
  );
}

function Sep() {
  return <span className="mx-0.5 h-5 w-px bg-white/10" aria-hidden />;
}

function Tool({
  children,
  onClick,
  title,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-[13px] text-zinc-400 hover:bg-white/10 hover:text-white active:bg-white/15 ${className}`}
    >
      {children}
    </button>
  );
}
