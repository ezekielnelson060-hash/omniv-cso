/** Accurate relative timestamps for feed + publication UI */
export function timeAgo(input?: string | Date | null): string {
  if (!input) return "";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "";

  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 0) return "just now";
  if (sec < 45) return "just now";
  if (sec < 90) return "1 min ago";

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;

  const week = Math.floor(day / 7);
  if (week < 5) return `${week} week${week === 1 ? "" : "s"} ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}
