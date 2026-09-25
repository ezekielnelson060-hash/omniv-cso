"use client";

/** Lightweight toolbar — inserts markdown-ish markers into body text */
export function BodyEditor({
  value,
  onChange,
  placeholder,
  rows = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  function wrap(before: string, after = before) {
    const el = document.getElementById("omniv-body") as HTMLTextAreaElement | null;
    if (!el) {
      onChange(before + value + after);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "text";
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    });
  }

  function linePrefix(prefix: string) {
    const el = document.getElementById("omniv-body") as HTMLTextAreaElement | null;
    if (!el) {
      onChange(prefix + value);
      return;
    }
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next =
      value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
  }

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-white/[0.08]">
      <div className="flex flex-wrap gap-1 border-b border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
        <Tool onClick={() => wrap("**")} title="Bold">
          B
        </Tool>
        <Tool onClick={() => wrap("_")} title="Italic">
          <span className="italic">I</span>
        </Tool>
        <Tool onClick={() => linePrefix("- ")} title="List">
          ≡
        </Tool>
        <Tool onClick={() => wrap("[", "](https://)")} title="Link">
          🔗
        </Tool>
      </div>
      <textarea
        id="omniv-body"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder || "Write…"}
        className="w-full resize-none bg-transparent px-3.5 py-2.5 text-[14px] leading-relaxed text-white outline-none placeholder:text-zinc-600"
      />
    </div>
  );
}

function Tool({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-semibold text-zinc-400 hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}
