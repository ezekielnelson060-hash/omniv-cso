/** Drop publisher name if baked into meta; hide raw JSON blobs. */
export function cleanPublisherMeta(
  name?: string | null,
  meta?: string | null
): string | undefined {
  if (!meta) return undefined;
  let m = meta.trim();
  if (!m) return undefined;

  // Stored type-specific fields as JSON — never show in UI
  if (m.startsWith("{") || m.startsWith("[")) {
    try {
      JSON.parse(m);
      return undefined;
    } catch {
      /* not JSON, continue */
    }
  }

  if (name) {
    const n = name.trim();
    if (n) {
      const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`^${escaped}\\s*[·•|\\-–—:]*\\s*`, "i");
      m = m.replace(re, "").trim();
      if (m.toLowerCase() === n.toLowerCase()) m = "";
    }
  }
  return m || undefined;
}
