"use client";

import { usePlan } from "@/components/billing/plan-provider";

type Row = Record<string, string | number>;

export function AnalyticsExport({
  rows,
  filename = "omniv-analytics",
}: {
  rows: Row[];
  filename?: string;
}) {
  const { can, require } = usePlan();

  function onExport() {
    if (!can("analytics_export")) {
      require("analytics_export");
      return;
    }
    if (!rows.length) return;
    const keys = Object.keys(rows[0]!);
    const lines = [
      keys.join(","),
      ...rows.map((r) =>
        keys
          .map((k) => {
            const v = String(r[k] ?? "").replace(/"/g, '""');
            return `"${v}"`;
          })
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={onExport}
      className="text-[13px] font-medium text-omniv-gold"
    >
      Export CSV
    </button>
  );
}
