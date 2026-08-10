/** Shared Ziki voice rules — append to any system context. */

export const ZIKI_MANAGER_RULES = `
LENGTH: Max 120 words. Prefer 60–90. No essays. No markdown headings (#). No template labels like When / How / Priority / Expected outcome.

SHAPE (use this almost every reply):
1) One line observation from real data (operating brief / catalogue / fans).
2) Up to 3 bullets of concrete opportunities if relevant, e.g.:
   • Fans waiting in Accra
   • Track X fits a trending sound
   • Best release window: this Friday
3) ONE line: This week's move: [exact action]
4) Optional OMNIV_ACTIONS line for product chips.

VOICE: Manager on WhatsApp. Blunt. Specific. Name cities, tracks, days. Never "create engaging content." Never invent demo artists or fake numbers.

PERSONALISATION: Artist Brain + operating brief = ground truth. Call out gaps in one short clause.

ACTIONABLE: If advising content — one hook line, one platform, one deadline. Stop.

AFTER CONFIRM: If they finished a task, you may end with MARK_OPP_DONE:id

PRODUCT TOOLS: When Omniv can execute, end with one parseable line (never explain it as JSON to the user):
OMNIV_ACTIONS:[{"type":"CREATE_ROOM","label":"Draft room in Lagos","city":"Lagos"},{"type":"CREATE_TASK","label":"Film 15s hook","title":"Film 15s hook from chorus"}]

Allowed types: CREATE_ROOM, CREATE_TASK, DRAFT_OUTREACH, REFRESH_METRICS, OPEN_CATALOGUE, OPEN_CRM, OPEN_SETTINGS, OPEN_OPPORTUNITIES, OPEN_RELEASE, MARK_OPP_DONE.
Max 2 actions. Only when useful.

UPSELL (only if asked about limits or when system injects quota note): Free is a taste. Starter = more Ziki/day. Pro = unlimited Ziki. Never lecture about pricing unless relevant.
`.trim();

export function scrubZikiMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\n#{1,6}\s+/g, "\n")
    .trim();
}

export type ZikiParsedAction = {
  type: string;
  label: string;
  city?: string;
  title?: string;
  id?: string;
  to?: string;
  topic?: string;
};

export function parseZikiActions(raw: string): ZikiParsedAction[] {
  const out: ZikiParsedAction[] = [];
  const m = raw.match(/OMNIV_ACTIONS:\s*(\[[\s\S]*?\])/);
  if (m?.[1]) {
    try {
      const arr = JSON.parse(m[1]) as unknown;
      if (Array.isArray(arr)) {
        for (const item of arr.slice(0, 2)) {
          if (!item || typeof item !== "object") continue;
          const type = String((item as { type?: string }).type || "").trim();
          const label = String(
            (item as { label?: string }).label || type
          ).trim();
          if (!type) continue;
          out.push({
            type,
            label: label.slice(0, 80),
            city: (item as { city?: string }).city
              ? String((item as { city?: string }).city).slice(0, 80)
              : undefined,
            title: (item as { title?: string }).title
              ? String((item as { title?: string }).title).slice(0, 120)
              : undefined,
            id: (item as { id?: string }).id
              ? String((item as { id?: string }).id).slice(0, 80)
              : undefined,
            to: (item as { to?: string }).to
              ? String((item as { to?: string }).to).slice(0, 80)
              : undefined,
            topic: (item as { topic?: string }).topic
              ? String((item as { topic?: string }).topic).slice(0, 120)
              : undefined,
          });
        }
      }
    } catch {
      /* ignore */
    }
  }
  const mark = raw.match(/MARK_OPP_DONE:([a-zA-Z0-9_-]+)/);
  if (mark?.[1] && !out.some((a) => a.type === "MARK_OPP_DONE")) {
    out.push({
      type: "MARK_OPP_DONE",
      label: "Mark opportunity done",
      id: mark[1],
    });
  }
  return out;
}

/** Quota block — free → Starter, Starter → Pro. */
export function zikiQuotaBlockMessage(opts: {
  plan: string;
  used: number;
  limit: number | string;
  label?: string;
}): string {
  const plan = (opts.plan || "free").toLowerCase();
  if (plan === "free") {
    return [
      "Ziki free limit hit.",
      "",
      `You used ${opts.used} of ${opts.label || opts.limit} on Free.`,
      "",
      "Starter unlocks deeper weekly planning — more Ziki messages every day, full opportunity feed, city map.",
      "",
      "When you need unlimited Ziki (Sunday planning, pitch drafts, release stress-tests without counting), go Pro.",
      "",
      "→ Upgrade: Settings → Billing → Claim Starter.",
    ].join("\n");
  }
  if (plan === "starter") {
    return [
      "Starter Ziki limit hit for today.",
      "",
      `You used ${opts.used} of ${opts.label || opts.limit}.`,
      "",
      "Pro removes the ceiling — unlimited Ziki for ranked moves, outreach drafts, and room plans.",
      "",
      "→ Upgrade: Billing → Claim Pro.",
    ].join("\n");
  }
  return [
    "Ziki limit reached on your plan.",
    "",
    `Used ${opts.used} · allowance ${opts.label || opts.limit}.`,
    "",
    "→ Check Billing in Settings for the next tier.",
  ].join("\n");
}
