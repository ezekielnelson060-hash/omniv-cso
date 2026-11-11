"use client";

import { ArticleContent } from "@/components/discovery/article-content";

function SummaryBox({ text }: { text: string }) {
  const t = text.trim();
  if (!t) return null;
  return (
    <div className="mt-10 rounded-2xl border border-omniv-gold/25 bg-omniv-gold/[0.06] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-omniv-gold">
        Summary
      </p>
      <p className="mt-3 text-[17px] leading-relaxed text-zinc-200">{t}</p>
    </div>
  );
}

export function BodyBlocks({
  body,
  content,
  summary,
  excerpt,
  whatThisMeans,
  questionNobodyAsks,
}: {
  body?: string;
  content?: unknown;
  summary?: string;
  excerpt?: string;
  whatThisMeans?: string;
  questionNobodyAsks?: string;
}) {
  const bodyIsHtml =
    typeof body === "string" &&
    /<(p|div|h[1-4]|blockquote|ul|ol|li|br|strong|em|b|i|span|a)\b/i.test(body);

  // Prefer explicit summary; fall back to excerpt for the bottom box only
  const summaryText = (summary || excerpt || "").trim();

  if (Array.isArray(content) && content.length) {
    return (
      <>
        <div>
          <ArticleContent content={content as never} body={body} />
        </div>
        {whatThisMeans ? (
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-omniv-gold">
              What this means
            </p>
            <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">{whatThisMeans}</p>
          </div>
        ) : null}
        {questionNobodyAsks ? (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              The question nobody asks
            </p>
            <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">
              {questionNobodyAsks}
            </p>
          </div>
        ) : null}
        <SummaryBox text={summaryText} />
      </>
    );
  }

  if (bodyIsHtml) {
    return (
      <>
        <div>
          <ArticleContent body={body} />
        </div>
        {whatThisMeans ? (
          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-omniv-gold">
              What this means
            </p>
            <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">{whatThisMeans}</p>
          </div>
        ) : null}
        {questionNobodyAsks ? (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              The question nobody asks
            </p>
            <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">
              {questionNobodyAsks}
            </p>
          </div>
        ) : null}
        <SummaryBox text={summaryText} />
      </>
    );
  }

  const blocks: { type: string; text: string; level?: number }[] = [];
  if (typeof body === "string" && body) {
    for (const para of body.split(/\n\n+/)) {
      const t = para.trim();
      if (!t) continue;
      if (t.startsWith("## ")) blocks.push({ type: "heading", text: t.slice(3), level: 2 });
      else if (t.startsWith("> ")) blocks.push({ type: "quote", text: t.slice(2) });
      else blocks.push({ type: "paragraph", text: t });
    }
  }

  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "heading") {
          return (
            <h2 key={i} className="mt-10 text-[22px] font-semibold tracking-tight text-white">
              {b.text}
            </h2>
          );
        }
        if (b.type === "quote") {
          return (
            <blockquote
              key={i}
              className="my-6 border-l-2 border-omniv-gold/50 pl-4 text-[17px] italic leading-relaxed text-zinc-300"
            >
              {b.text}
            </blockquote>
          );
        }
        return (
          <p key={i} className="mt-5 text-[17px] leading-[1.8] text-zinc-200">
            {b.text}
          </p>
        );
      })}
      {whatThisMeans ? (
        <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-omniv-gold">
            What this means
          </p>
          <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">{whatThisMeans}</p>
        </div>
      ) : null}
      {questionNobodyAsks ? (
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            The question nobody asks
          </p>
          <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">
            {questionNobodyAsks}
          </p>
        </div>
      ) : null}
      <SummaryBox text={summaryText} />
    </>
  );
}
