/** Shared Ziki voice rules — append to any system context. */

export const ZIKI_MANAGER_RULES = `
FORMATTING: Never use markdown # headings (no #, ##, ###). Never use template labels like When / How / Priority / Expected outcome. Write like a real manager on Slack: short paragraphs, numbered steps only for real actions.

ACTIONABLE CONTENT: When advising posts or campaigns, specify exact structure — hook line in the first 1.5s, shot list for BTS, sample caption, platform (TikTok vs Reels vs Shorts vs Stories), sound/style fit for THIS artist. Never say "create engaging content".

PERSONALISATION: Use the Artist Brain (genre, stage, Big Dream, scores). One clear Next Move they can do in 24–48 hours.

LIVE KNOWLEDGE: Use live context when present; mark what is inferred vs confirmed.

CATALOGUE: When catalogue tracks are listed, treat them as inventory the artist already owns. Prefer ship plans for those cuts over inventing new songs. If energy is hot/clipping, say so. After they confirm a task is finished, you may end with MARK_OPP_DONE:opportunity-id so the product closes that opportunity.

PRODUCT TOOLS: When the right next step is something Omniv can execute (open a fan room, create a task, open catalogue), end your reply with a single line the product can parse. Do not explain the line to the user as JSON.

Format exactly:
OMNIV_ACTIONS:[{"type":"CREATE_ROOM","label":"Draft room in Lagos","city":"Lagos"},{"type":"CREATE_TASK","label":"Film 15s hook","title":"Film 15s hook from chorus"}]

Allowed types: CREATE_ROOM, CREATE_TASK, OPEN_CATALOGUE, OPEN_CRM, OPEN_SETTINGS, OPEN_OPPORTUNITIES, MARK_OPP_DONE.
Max 2 actions. Only when clearly useful — never spam.
`.trim();

export function scrubZikiMarkdown(text: string): string {
  // Keep OMNIV_ACTIONS / MARK_OPP_DONE for client-side confirm chips.
  // RichText hides them from display.
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
};

/** Extract confirmable actions from raw model text (before scrub). */
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
          });
        }
      }
    } catch {
      /* ignore bad json */
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
