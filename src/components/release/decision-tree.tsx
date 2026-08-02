"use client";

import type { DecisionNode } from "@/lib/strategy/distribution-signals";
import { cn } from "@/lib/utils";
import { Check, X, AlertTriangle, GitBranch } from "lucide-react";

function StatusIcon({ status }: { status: DecisionNode["status"] }) {
  if (status === "pass")
    return <Check className="h-3.5 w-3.5 text-emerald-400" />;
  if (status === "fail") return <X className="h-3.5 w-3.5 text-red-400" />;
  if (status === "warn")
    return <AlertTriangle className="h-3.5 w-3.5 text-omniv-gold" />;
  return <GitBranch className="h-3.5 w-3.5 text-omniv-text-muted" />;
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
          <StatusIcon status={node.status} />
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
        <GitBranch className="h-4 w-4 text-omniv-gold" />
        <p className="text-sm font-medium">Decision tree</p>
      </div>
      <Node node={tree} />
    </div>
  );
}
