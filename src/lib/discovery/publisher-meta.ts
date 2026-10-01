/** Drop publisher name if it was baked into meta ("Name · analysis" → "analysis"). */
export function cleanPublisherMeta(
  name?: string | null,
  meta?: string | null
): string | undefined {
  if (!meta) return undefined;
  let m = meta.trim();
  if (!m) return undefined;
  if (name) {
    const n = name.trim();
    if (n) {
      const re = new RegExp(
        `^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\s*[·•|\\-]\s*`,
        "i"
      );
      m = m.replace(re, "").trim();
      if (m.toLowerCase() === n.toLowerCase()) m = "";
    }
  }
  return m || undefined;
}
