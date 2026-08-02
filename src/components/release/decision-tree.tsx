"use client";

import type { DecisionNode } from "@/lib/strategy/distribution-signals";
import { cn } from "@/lib/utils";

function statusEmoji(status: DecisionNode["status"], override?: string) {
  if (override) return override;
  if (status === "pass") return "✅";
  if (status === "fail") return "❌";
  if (status === "warn") return "⚠️";
  return "📌";
}

function Node({ node, depth = 0 }: { node: DecisionNode; depth?: number }) {
  return (
    <div className={cn(depth > 0 && "ml-4 border-l border-omniv-border/80 pl-3")}>
      <div
        className={cn(
          "mb-2 rounded-xl border px-3 py-2.5",
          node.status === "pass" && "border-emerald-500/25 bg-emerald-500/5",
          node.status === "fail" && "border-red-500/25 bg-red-500/5",
          node.status === "warn" && "border-omniv-gold/30 bg-omniv-gold/5",
          node.status === "info" && "border-omniv-border bg-omniv-elevated/40"
        )}
      >
        <div className="flex items-start gap-2">
          <span className="text-sm leading-none" aria-hidden>
            {statusEmoji(node.status, node.emoji)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-omniv-text">{node.label}</p>
            {node.detail ? (
              <p className="mt-0.5 text-[11px] text-omniv-text-muted">{node.detail}</p>
            ) : null}
          </div>
        </div>
      </div>
      {node.children?.map((c) => (
        <Node key={c.id + c.label} node={c} depth={depth + 1} />
      ))}
    </div>
  );
}

export function DecisionTree({ tree }: { tree: DecisionNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base" aria-hidden>
          🌳
        </span>
        <p className="text-sm font-medium">Decision tree</p>
      </div>
      <Node node={tree} />
    </div>
  );
}
