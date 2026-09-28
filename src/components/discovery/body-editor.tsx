"use client";

import { useEffect, useRef } from "react";

/**
 * Premium document-style body editor (Google Docs-like toolbar).
 * Stores HTML in value for rich formatting.
 */
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
        <Tool
          onClick={() => {
            const url = window.prompt("Image URL");
            if (url) cmd("insertImage", url);
          }}
          title="Image"
        >
          ▣
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
        className="omniv-doc-editor w-full px-4 py-3 text-[15px] leading-[1.7] text-zinc-100 outline-none"
        style={{ minHeight: minH }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .omniv-doc-editor h1{font-size:1.5rem;font-weight:700;margin:.75rem 0 .35rem;color:#fff}
        .omniv-doc-editor h2{font-size:1.2rem;font-weight:600;margin:.65rem 0 .3rem;color:#fff}
        .omniv-doc-editor p{margin:.35rem 0}
        .omniv-doc-editor ul{list-style:disc;padding-left:1.25rem;margin:.4rem 0}
        .omniv-doc-editor ol{list-style:decimal;padding-left:1.25rem;margin:.4rem 0}
        .omniv-doc-editor a{color:#c9a227;text-decoration:underline}
        .omniv-doc-editor img{max-width:100%;border-radius:.75rem;margin:.5rem 0}
        .omniv-doc-editor b,.omniv-doc-editor strong{font-weight:700;color:#fff}
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
