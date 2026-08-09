"use client";

import { useRouter } from "next/navigation";

export type ZikiActionChip = {
  type: string;
  label: string;
  city?: string;
  title?: string;
  id?: string;
};

export function ZikiActionChips({ actions }: { actions: ZikiActionChip[] }) {
  const router = useRouter();
  if (!actions?.length) return null;

  async function run(a: ZikiActionChip) {
    const type = a.type;
    const payload: Record<string, string> = {};
    if (a.city) payload.city = a.city;
    if (a.title) payload.title = a.title;
    if (a.id) payload.id = a.id;

    if (type === "CREATE_ROOM" || type === "CREATE_TASK") {
      try {
        const res = await fetch("/api/agent/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            title: a.title || a.label,
            payload,
          }),
        });
        const data = (await res.json()) as { route?: string };
        if (data.route) {
          router.push(data.route);
          return;
        }
      } catch {
        /* fall through */
      }
    }
    if (type === "OPEN_CRM")
      router.push(a.city ? `/crm?city=${encodeURIComponent(a.city)}` : "/crm");
    else if (type === "OPEN_CATALOGUE") router.push("/catalogue");
    else if (type === "OPEN_SETTINGS") router.push("/settings");
    else if (type === "OPEN_OPPORTUNITIES") router.push("/opportunities");
    else if (type === "MARK_OPP_DONE" && a.id) {
      const { markOpportunityDone } = await import("@/lib/opportunity-progress");
      markOpportunityDone(a.id);
    } else if (type === "CREATE_ROOM") {
      router.push("/crm");
    }
  }

  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {actions.map((a, i) => (
        <button
          key={`${a.type}-${i}`}
          type="button"
          onClick={() => void run(a)}
          className="rounded-full border border-omniv-gold/35 bg-omniv-gold/10 px-2.5 py-1 text-[11px] font-medium text-omniv-gold transition hover:bg-omniv-gold/20"
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
