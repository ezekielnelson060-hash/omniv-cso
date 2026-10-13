"use client";

import { useEffect, useRef } from "react";

/**
 * Document-style body editor.
 * Stores HTML so fonts, quotes, and pasted structure survive publish.
 */

const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "DIV",
  "SPAN",
  "H1",
  "H2",
  "H3",
  "H4",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "STRIKE",
  "UL",
  "OL",
  "LI",
  "BLOCKQUOTE",
  "A",
  "IMG",
  "PRE",
  "CODE",
  "SUB",
  "SUP",
  "HR",
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
  /^(color|background-color|font-weight|font-style|font-family|text-decoration|text-align)$/i;

function escapeText(s: string) {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

function plainTextToHtml(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const parts = normalized.split(/\n{2,}/);
  return parts
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return "";
      if (
        /^>\s/m.test(trimmed) &&
        trimmed.split("\n").every((l) => !l.trim() || l.trim().startsWith(">"))
      ) {
        const inner = trimmed
          .split("\n")
          .map((l) => l.replace(/^>\s?/, ""))
          .join("<br>");
        return `<blockquote><p>${escapeText(inner).replace(/<br>/g, "<br>")}</p></blockquote>`;
      }
      const withBreaks = escapeText(trimmed).replace(/\n/g, "<br>");
      return `<p>${withBreaks}</p>`;
    })
    .filter(Boolean)
    .join("");
}

function sanitizeStyle(style: string): string {
  return style
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((decl) => {
      const prop = decl.split(":")[0]?.trim() || "";
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

  if (tag === "SCRIPT" || tag === "STYLE" || tag === "IFRAME" || tag === "OBJECT") {
    return null;
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

function clipboardToSafeHtml(e: React.ClipboardEvent): string {
  const html = e.clipboardData.getData("text/html");
  const text = e.clipboardData.getData("text/plain");

  if (html && html.trim()) {
    try {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const body = parsed.body;
      const out = document.implementation.createHTMLDocument("");
      const frag = out.createDocumentFragment();
      Array.from(body.childNodes).forEach((child) => {
        const clean = sanitizeNode(child, out);
        if (clean) frag.appendChild(clean);
      });
      const wrap = out.createElement("div");
      wrap.appendChild(frag);
      const result = wrap.innerHTML.trim();
      if (result) return result;
    } catch {
      /* fall through */
    }
  }

  if (text) return plainTextToHtml(text);
  return "";
}

function insertHtmlAtCursor(html: string, editor?: HTMLElement | null) {
  try {
    const sel = window.getSelection();
    if (sel) {
      let range: Range | null = null;
      if (sel.rangeCount) {
        range = sel.getRangeAt(0);
      }
      // If selection is outside the editor (common on mobile), place caret at end
      if (editor) {
        const inside =
          range &&
          (editor === range.commonAncestorContainer ||
            editor.contains(range.commonAncestorContainer));
        if (!inside) {
          range = document.createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
      if (range) {
        range.deleteContents();
        const temp = document.createElement("div");
        temp.innerHTML = html;
        const frag = document.createDocumentFragment();
        let node: ChildNode | null;
        let last: ChildNode | null = null;
        while ((node = temp.firstChild)) {
          last = frag.appendChild(node);
        }
        range.insertNode(frag);
        if (last) {
          range.setStartAfter(last);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
        return;
      }
    }
  } catch {
    /* ignore */
  }
  try {
    document.execCommand("insertHTML", false, html);
  } catch {
    /* ignore */
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
  const minH = Math.max(180, rows * 22);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== value && document.activeElement !== el) {
      el.innerHTML = value || "";
    }
  }, [value]);

  function emit() {
    const el = ref.current;
    if (!el) return;
    onChange(el.innerHTML);
  }

  function cmd(command: string, arg?: string) {
    ref.current?.focus();
    try {
      document.execCommand(command, false, arg);
    } catch {
      /* ignore */
    }
    emit();
  }

  function block(tag: string) {
    ref.current?.focus();
    try {
      document.execCommand("formatBlock", false, tag);
    } catch {
      /* ignore */
    }
    emit();
  }

  function applyFont(font: string) {
    ref.current?.focus();
    try {
      document.execCommand("fontName", false, font);
    } catch {
      /* ignore */
    }
    emit();
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

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const el = ref.current;
    el?.focus();
    let safe = clipboardToSafeHtml(e);
    // Some mobile browsers only expose text/plain, or sanitize to empty —
    // never leave the user with a silent no-op.
    if (!safe) {
      const plain = e.clipboardData?.getData("text/plain") || "";
      if (plain) safe = plainTextToHtml(plain);
    }
    if (!safe) return;
    insertHtmlAtCursor(safe, el);
    emit();
  }

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-white/[0.1] bg-[#0a0a0a]">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-white/[0.08] bg-[#121212] px-2 py-1.5">
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
        <label className="sr-only" htmlFor="omniv-font-pick">
          Font
        </label>
        <select
          id="omniv-font-pick"
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
        <Tool onClick={() => cmd("indent")} title="Indent">
          »
        </Tool>
        <Tool onClick={() => cmd("outdent")} title="Outdent">
          «
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
        <Tool onClick={() => cmd("unlink")} title="Remove link">
          ⊘
        </Tool>
        <Tool onClick={insertImageFile} title="Insert image from device">
          ▣
        </Tool>
        <Tool
          onClick={() => {
            const url = window.prompt("Image URL");
            if (url) cmd("insertImage", url);
          }}
          title="Image from URL"
          className="text-[10px]"
        >
          URL
        </Tool>
        <Sep />
        <Tool onClick={() => cmd("justifyLeft")} title="Align left">
          ≡
        </Tool>
        <Tool onClick={() => cmd("justifyCenter")} title="Align center">
          ☰
        </Tool>
        <Tool onClick={() => cmd("removeFormat")} title="Clear formatting" className="text-[11px]">
          Tx
        </Tool>
      </div>

      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline
        data-placeholder={placeholder || "Start writing…"}
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onPaste={onPaste}
        className="omniv-doc-editor w-full px-4 py-3 text-[15px] leading-[1.7] text-zinc-100 outline-none"
        style={{ minHeight: minH }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .omniv-doc-editor h1{font-size:1.5rem;font-weight:700;margin:.75rem 0 .35rem;color:#fff}
        .omniv-doc-editor h2{font-size:1.2rem;font-weight:600;margin:.65rem 0 .3rem;color:#fff}
        .omniv-doc-editor h3{font-size:1.05rem;font-weight:600;margin:.55rem 0 .25rem;color:#f4f4f5}
        .omniv-doc-editor p{margin:.35rem 0}
        .omniv-doc-editor ul{list-style:disc;padding-left:1.25rem;margin:.4rem 0}
        .omniv-doc-editor ol{list-style:decimal;padding-left:1.25rem;margin:.4rem 0}
        .omniv-doc-editor blockquote{
          margin:.75rem 0;padding:.35rem 0 .35rem 1rem;
          border-left:3px solid rgba(201,162,39,.7);
          color:#d4d4d8;font-style:italic;
        }
        .omniv-doc-editor a{color:#c9a227;text-decoration:underline}
        .omniv-doc-editor img{max-width:100%;border-radius:.75rem;margin:.5rem 0}
        .omniv-doc-editor b,.omniv-doc-editor strong{font-weight:700;color:#fff}
        .omniv-doc-editor pre,.omniv-doc-editor code{
          font-family:ui-monospace,monospace;font-size:.9em;
          background:rgba(255,255,255,.06);border-radius:.35rem;padding:.1em .35em;
        }
        .omniv-doc-editor pre{display:block;padding:.75rem 1rem;overflow-x:auto;margin:.5rem 0}
        .omniv-doc-editor:empty:before{content:attr(data-placeholder);color:#52525b;pointer-events:none}
      `,
        }}
      />
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
